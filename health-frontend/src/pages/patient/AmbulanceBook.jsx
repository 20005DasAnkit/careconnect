import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import MapPicker from "../../components/MapPicker";
import {
    Search,
    MapPin,
    PhoneCall,
    Truck,
    Snowflake,
    Siren,
    ArrowRight,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import Footer from "../../components/Footer";

// Matches the real VehicleType values stored on Ambulance ("NonAC" | "AC" | "Big"),
// not a hypothetical BLS/ALS classification that doesn't exist in the backend.
const TYPE_META = {
    NonAC: { tag: "Standard", note: "Stable, non-critical transport", icon: Truck },
    AC: { tag: "Advanced", note: "Climate-controlled, longer transfers", icon: Snowflake },
    Big: { tag: "Critical care", note: "Fully equipped for trauma cases", icon: Siren },
};

// Same three types, used for the selector filter cards above the results.
const TYPE_OPTIONS = [
    { key: "NonAC", icon: Truck, title: "Non-AC", desc: "Standard transport" },
    { key: "AC", icon: Snowflake, title: "AC", desc: "Comfortable ride" },
    { key: "Big", icon: Siren, title: "Big / ICU", desc: "Critical care" },
];

// Pickup location is remembered across visits so a patient who just booked
// an ambulance and gets sent back here doesn't have to re-detect their
// location or re-search on the map every single time.
const PICKUP_STORAGE_KEY = "careconnect_ambulance_pickup";

function getTypeMeta(type) {
    return TYPE_META[type] || TYPE_META.NonAC;
}

function AmbulanceCardSkeleton() {
    return (
        <div className="bg-white rounded-[20px] border border-[#E4DFD3] p-5 flex items-center gap-4 animate-pulse">
            <div className="w-14 h-14 rounded-xl bg-[#EFEAE0] shrink-0" />

            <div className="w-full max-w-[1700px] mx-auto px-8 lg:px-16 xl:px-24 py-10">
                <div className="h-3.5 bg-[#EFEAE0] rounded-full w-32" />
                <div className="h-3 bg-[#EFEAE0] rounded-full w-24" />
            </div>
            <div className="w-20 h-10 bg-[#EFEAE0] rounded-full shrink-0" />
        </div>
    );
}

export default function Ambulance() {
    const navigate = useNavigate();
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [locationSelected, setLocationSelected] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    const [pickup, setPickup] = useState(null);
    const [pickupLabel, setPickupLabel] = useState("");
    const [restoring, setRestoring] = useState(true);

    // ── User's current active ride, if any — checked immediately on load,
    //    completely independent of pickup/location state. This is what
    //    fixes "driver accepted but patient doesn't see it": the patient
    //    no longer needs to search a location to find out. ──
    const [activeRide, setActiveRide] = useState(null);
    const [activeRideLoading, setActiveRideLoading] = useState(true);

    useEffect(() => {
        checkActiveRide();
    }, []);

    async function checkActiveRide() {
        try {
            setActiveRideLoading(true);
            const res = await api.get("/patient/ambulance/active");
            setActiveRide(res.data || null);
        } catch {
            setActiveRide(null);
        } finally {
            setActiveRideLoading(false);
        }
    }

    // ── Restore a previously saved pickup location on mount, and load
    //    ambulances for it automatically — no need to re-pick location. ──
    useEffect(() => {
        try {
            const saved = localStorage.getItem(PICKUP_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.lat && parsed?.lng) {
                    setPickup({ lat: parsed.lat, lng: parsed.lng });
                    setPickupLabel(parsed.label || "");
                    setLocationSelected(true);
                    // Kick off the ambulance search right away using the
                    // restored coordinates (state hasn't flushed yet, so
                    // we pass them directly instead of reading `pickup`).
                    loadAmbulancesFor(parsed.lat, parsed.lng);
                }
            }
        } catch {
            // corrupted/old storage value — ignore and start fresh
        } finally {
            setRestoring(false);
        }
    }, []);

    function savePickup(lat, lng, label) {
        setPickup({ lat, lng });
        setPickupLabel(label || "");
        setLocationSelected(true);
        try {
            localStorage.setItem(
                PICKUP_STORAGE_KEY,
                JSON.stringify({ lat, lng, label: label || "" })
            );
        } catch {
            // storage might be full/unavailable — booking still works,
            // it just won't be remembered for next time
        }
    }

    function detectLocation() {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported.");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );

            const data = await res.json();
            const address = data.display_name;

            savePickup(lat, lng, address);
            loadAmbulancesFor(lat, lng);
        });
    }

    async function loadAmbulancesFor(lat, lng, type = selectedType) {
        setLoading(true);
        setError("");
        try {
            const url = type
                ? `/patient/ambulances/nearby?lat=${lat}&lng=${lng}&type=${type}`
                : `/patient/ambulances/nearby?lat=${lat}&lng=${lng}`;

            const res = await api.get(url);
            setAmbulances(res.data || []);
        } catch (err) {
            setError("Unable to load ambulances right now.");
            toast.error("Couldn't load nearby ambulances.");
        } finally {
            setLoading(false);
        }
    }

    async function loadAmbulances() {
        if (!pickup) {
            toast.error("Please select your pickup location.");
            return;
        }
        await loadAmbulancesFor(pickup.lat, pickup.lng);
    }

    function goToBooking(amb) {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const params = new URLSearchParams({
            ambulanceId: amb.id,
            driverName: amb.driverName || "",
            type: amb.type,
        });

        navigate(
            `/patient/ambulance/request?${params.toString()}`,
            {
                state: {
                    pickup,
                    pickupLabel,

                    // আপাতত destination না থাকলে pickup-ই পাঠাও
                    destination: pickup,
                    destinationAddress: pickupLabel,
                },
            }
        );
    }

    // The booked ambulance already has its own "Your booking" card above —
    // drop it here so it doesn't also appear in the searchable list.
    const filtered = ambulances.filter((a) => !a.myRide);

    const grouped = filtered.reduce((acc, a) => {
        const type = a.type || "NonAC";
        if (!acc[type]) acc[type] = [];
        acc[type].push(a);
        return acc;
    }, {});

    // Keep a sensible display order regardless of object key ordering.
    const typeOrder = ["NonAC", "AC", "Big"];
    const orderedGroups = typeOrder.filter((t) => grouped[t]?.length);

    const hasResults = filtered.length > 0;
    const availableCount = ambulances.filter((a) => a.isAvailable !== false).length;

    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-[#FAF8F3] text-[#16332B]"
                style={{
                    fontFamily: "'Inter', system-ui, sans-serif"
                }}>
                <div className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32 py-16">

                    {/* ───────────────────── HEADER ───────────────────── */}
                    <div className="mb-10">
                        <p className="text-[13px] uppercase tracking-[0.22em] text-[#B5562C] font-semibold mb-5">
                            Emergency transport
                        </p>
                        <h1
                            style={{
                                fontFamily: "'Fraunces', Georgia, serif",
                                fontWeight: 500
                            }}
                            className="leading-[1.05] tracking-tight"
                        >
                            <span style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}>
                                Help is closer
                            </span>

                            <br />

                            <span
                                className="italic text-[#3E7C59]"
                                style={{
                                    fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)"
                                }}
                            >
                                than it feels.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-md text-[16px] leading-7 text-[#16332B]/60">
                            {availableCount} ambulance{availableCount === 1 ? "" : "s"} ready to dispatch
                            right now. Pick a driver below, or call the emergency line directly.
                        </p>
                    </div>

                    {/* ───────────────────── EMERGENCY BANNER ─────────────────────
                        Kept as high-contrast red — this is the one place on the
                        platform where the editorial palette should step aside
                        for an unambiguous safety signal. */}
                    <a
                        href="tel:108"
                        className="flex items-center gap-4 bg-[#9E211A] rounded-[20px] p-5 text-white mb-10 hover:bg-[#86190F] transition group"
                    >
                        <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                            <PhoneCall size={18} />
                        </div>

                        <div className="flex-1">
                            <p
                                className="font-semibold leading-tight text-[15px]"
                            >
                                Life-threatening emergency?
                            </p>

                            <p
                                className="text-white/75 text-[13px] mt-0.5"
                            >
                                Call 108 directly — don't wait for booking
                            </p>
                        </div>

                        <span className="shrink-0 bg-white text-[#9E211A] font-semibold px-5 py-2.5 rounded-full text-sm group-hover:bg-white/90 transition">
                            Call 108
                        </span>
                    </a>

                    {/* ───────────────────── YOUR BOOKING ─────────────────────
                        Shows only the ambulance the patient has actually
                        booked, separately from the searchable list below —
                        no need to re-search location to see it. */}
                    {!activeRideLoading && activeRide && (
                        <div className="mb-10">
                            <h3
                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                className="text-[1.15rem] mb-4"
                            >
                                Your booking
                            </h3>

                            <div className="bg-white rounded-[20px] border-2 border-[#16332B] p-5 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-[#FAF8F3] border border-[#E4DFD3] flex items-center justify-center shrink-0">
                                    <Truck size={22} className="text-[#16332B]/35" strokeWidth={1.5} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[#16332B] text-[15px] truncate">
                                        {activeRide.driverName || "Driver"}
                                    </p>
                                    <p className="text-[13px] text-[#16332B]/50 mt-1">
                                        {activeRide.vehicleNumber}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#3E7C59]" />
                                        <span className="text-[12px] font-medium text-[#3E7C59]">
                                            {activeRide.status === "Pending"
                                                ? "Finding your driver…"
                                                : "Driver is on the way"}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/patient/ride/${activeRide.id}`)}
                                    className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#16332B] text-white hover:bg-[#0F231D] transition"
                                >
                                    On The Way
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ───────────────────── TYPE SELECTOR ───────────────────── */}
                    <div className="mb-10">
                        <div className="flex items-baseline justify-between mb-4">
                            <h3
                                style={{
                                    fontFamily: "'Fraunces', Georgia, serif",
                                    fontWeight: 500
                                }}
                                className="text-[1.15rem]"
                            >
                                Choose ambulance type
                            </h3>
                            {selectedType && (
                                <button
                                    onClick={() => {
                                        setSelectedType("");
                                        if (pickup) loadAmbulancesFor(pickup.lat, pickup.lng, "");
                                    }}
                                    className="text-[13px] text-[#16332B]/45 hover:text-[#16332B] transition"
                                >
                                    Clear filter
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {TYPE_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const active = selectedType === opt.key;
                                return (
                                    <button
                                        key={opt.key}
                                        onClick={() => {
                                            const next = active ? "" : opt.key;
                                            setSelectedType(next);
                                            if (pickup) loadAmbulancesFor(pickup.lat, pickup.lng, next);
                                        }}
                                        className={`text-left p-5 rounded-[20px] border transition-all ${active
                                            ? "bg-[#16332B] border-[#16332B] shadow-[0_15px_35px_-22px_rgba(22,51,43,0.4)]"
                                            : "bg-white border-[#E4DFD3] hover:border-[#16332B]/25"
                                            }`}
                                    >
                                        <div
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${active ? "bg-white/15" : "bg-[#FAF8F3]"
                                                }`}
                                        >
                                            <Icon
                                                size={20}
                                                strokeWidth={1.75}
                                                className={active ? "text-white" : "text-[#3E7C59]"}
                                            />
                                        </div>
                                        <h4
                                            style={{
                                                fontFamily: "'Fraunces', Georgia, serif",
                                                fontWeight: 500
                                            }}
                                            className={`text-[15px] ${active
                                                ? "text-white"
                                                : "text-[#16332B]"
                                                }`}
                                        >
                                            {opt.title}
                                        </h4>
                                        <p
                                            className={`text-[13px] mt-1 ${active
                                                ? "text-white/70"
                                                : "text-[#16332B]/50"
                                                }`}
                                        >
                                            {opt.desc}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ───────────────────── SEARCH ───────────────────── */}
                    <div className="mb-10">

                        <div className="flex items-center justify-between mb-5">
                            <h3
                                className="text-xl font-semibold"
                                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                            >
                                Pickup Location
                            </h3>

                            {locationSelected && (
                                <button
                                    onClick={() => {
                                        setLocationSelected(false);
                                        setPickup(null);
                                        setPickupLabel("");
                                        setAmbulances([]);
                                        try {
                                            localStorage.removeItem(PICKUP_STORAGE_KEY);
                                        } catch { }
                                    }}
                                    className="text-[13px] text-[#16332B]/45 hover:text-[#16332B] transition"
                                >
                                    Change location
                                </button>
                            )}
                        </div>

                        {locationSelected && pickupLabel && (
                            <div className="flex items-start gap-3 bg-white border border-[#E4DFD3] rounded-2xl p-4 mb-5">
                                <MapPin size={17} className="text-[#B5562C] shrink-0 mt-0.5" />
                                <p className="text-[14px] text-[#16332B]/75 leading-6">{pickupLabel}</p>
                            </div>
                        )}

                        <button
                            onClick={detectLocation}
                            className="mb-5 px-5 py-3 rounded-xl bg-[#16332B] text-white hover:bg-[#0F231D]"
                        >
                            📍 Use Current Location
                        </button>

                        <MapPicker
                            currentLocation={pickup}
                            destination={pickup}
                            setDestination={(loc) => {
                                savePickup(loc.lat, loc.lng, pickupLabel);
                            }}
                            setAddress={(label) => {
                                setPickupLabel(label);
                                if (pickup) savePickup(pickup.lat, pickup.lng, label);
                            }}
                        />
                        <div className="mt-5">
                            <button
                                disabled={!locationSelected}
                                onClick={loadAmbulances}
                                className="px-6 py-3 rounded-xl bg-[#C9683F] text-white disabled:opacity-40"
                            >
                                Find Nearby Ambulances
                            </button>
                        </div>

                    </div>


                    {/* ───────────────────── ERROR ───────────────────── */}
                    {error && (
                        <div className="mb-8 bg-[#FBEAE5] border border-[#E8B8AA] rounded-2xl p-4 flex items-center justify-between gap-3">
                            <p className="text-[#9E3A20] text-sm">{error}</p>
                            <button
                                onClick={loadAmbulances}
                                className="text-[#9E3A20] text-sm font-semibold shrink-0 hover:underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* ───────────────────── LOADING ───────────────────── */}
                    {(loading || restoring) && (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <AmbulanceCardSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {/* ───────────────────── RESULTS, grouped by vehicle type ───────────────────── */}
                    {!loading && !restoring && hasResults && (
                        <div className="space-y-10">
                            {orderedGroups.map((type) => {
                                const meta = getTypeMeta(type);
                                const list = grouped[type];
                                const Icon = meta.icon;
                                return (
                                    <section key={type}>
                                        <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-[#E4DFD3]">
                                            <div className="flex items-center gap-3">
                                                <Icon size={17} className="text-[#3E7C59]" strokeWidth={1.75} />
                                                <h2
                                                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                                    className="text-[1.25rem]"
                                                >
                                                    {meta.tag}
                                                </h2>
                                                <span className="text-[13px] text-[#16332B]/45">{meta.note}</span>
                                            </div>
                                            <span className="text-[13px] text-[#16332B]/45 shrink-0">
                                                {list.length} available
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {list.map((amb) => (
                                                <div
                                                    key={amb.id}
                                                    className="bg-white rounded-[20px] border border-[#E4DFD3] p-5 flex items-center gap-4 hover:border-[#16332B]/25 hover:shadow-[0_15px_35px_-22px_rgba(22,51,43,0.25)] transition-all"
                                                >
                                                    <div className="w-14 h-14 rounded-xl bg-[#FAF8F3] border border-[#E4DFD3] flex items-center justify-center shrink-0 overflow-hidden">
                                                        {amb.image ? (
                                                            <img
                                                                src={amb.image}
                                                                alt={amb.driverName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Truck size={22} className="text-[#16332B]/35" strokeWidth={1.5} />
                                                        )}
                                                    </div>


                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-[#16332B] text-[15px] truncate">
                                                            {amb.driverName || "Driver"}
                                                        </p>

                                                        <p className="text-[13px] text-[#16332B]/50 mt-1">
                                                            {amb.vehicleNumber}
                                                        </p>
                                                        <p className="text-xs text-[#3E7C59] mt-1">
                                                            📍 {amb.distanceKm} km away
                                                        </p>

                                                        <div className="flex items-center gap-1.5 mt-2">
                                                            <span
                                                                className={`w-1.5 h-1.5 rounded-full ${amb.myRide
                                                                    ? "bg-[#3E7C59]"
                                                                    : amb.isAvailable
                                                                        ? "bg-[#3E7C59]"
                                                                        : "bg-[#A8A192]"
                                                                    }`}
                                                            />

                                                            <span
                                                                className={`text-[12px] font-medium ${amb.myRide
                                                                    ? "text-[#3E7C59]"
                                                                    : amb.isAvailable
                                                                        ? "text-[#3E7C59]"
                                                                        : "text-[#16332B]/40"
                                                                    }`}
                                                            >
                                                                {amb.myRide
                                                                    ? "Driver is on the way"
                                                                    : amb.isAvailable
                                                                        ? "Available now"
                                                                        : "Currently dispatched"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Button */}

                                                    {amb.myRide ? (
                                                        <button
                                                            onClick={() =>
                                                                navigate(`/patient/ride/${amb.requestId}`)
                                                            }
                                                            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#16332B] text-white hover:bg-[#0F231D] transition"
                                                        >
                                                            On The Way
                                                            <ArrowRight size={14} />
                                                        </button>
                                                    ) : amb.isAvailable ? (
                                                        <button
                                                            onClick={() => goToBooking(amb)}
                                                            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#16332B] text-white hover:bg-[#0F231D] transition"
                                                        >
                                                            Book
                                                            <ArrowRight size={14} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EFEAE0] text-[#A8A192] cursor-not-allowed"
                                                        >
                                                            Unavailable
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}

                    {/* ───────────────────── EMPTY STATE ───────────────────── */}
                    {!loading && !restoring && !hasResults && !error && locationSelected && (
                        <div className="bg-white rounded-[24px] border border-[#E4DFD3] py-20 px-6 text-center">
                            <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF8F3] flex items-center justify-center">
                                <Truck size={22} className="text-[#16332B]/35" strokeWidth={1.5} />
                            </div>
                            <h2
                                style={{
                                    fontFamily: "'Fraunces', Georgia, serif",
                                    fontWeight: 500
                                }}
                                className="text-[1.3rem] mt-6"
                            >
                                {"No ambulances nearby"}
                            </h2>
                            <p className="text-[#16332B]/55 text-[14px] mt-2 max-w-xs mx-auto">
                                "Call 108 for an immediate dispatch while we connect you to a driver."
                            </p>
                        </div>
                    )}

                </div>
                <Footer />
            </div>
        </>
    );
}