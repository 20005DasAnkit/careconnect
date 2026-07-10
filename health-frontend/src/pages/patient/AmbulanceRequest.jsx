import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/axios";
import MapPicker from "../../components/MapPicker";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    MapPin,
    Navigation,
    Car,
    XCircle,
    RefreshCw,
    Phone,
    Gauge,
    Home,
    BadgeCheck,
} from "lucide-react";

/* ─── Design tokens (CareConnect brand) ──────── */
const T = {
    cream: "#FAF8F3",
    creamDark: "#F5F0E8",
    green: "#16332B",
    greenSoft: "#2D5016",
    greenLight: "#EBF2E3",
    terra: "#B5562C",
    terraDark: "#C4622D",
    terraLight: "#FAF0EA",
    ink: "#16332B",
    muted: "#6B7280",
    border: "#E4DFD3",
    white: "#FFFFFF",
};

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,600&family=Inter:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulseSoft{0%,100%{opacity:1}50%{opacity:.45}}
`;

/* ─── Reusable shell for the result screens (waiting/accepted/etc) ── */
function ResultShell({ children }) {
    return (
        <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "Inter, sans-serif", color: T.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <style>{GLOBAL_STYLES}</style>
            <div style={{ background: T.white, borderRadius: 28, border: `1px solid ${T.border}`, boxShadow: "0 20px 60px rgba(22,51,43,.1)", padding: "48px 40px", width: "100%", maxWidth: 460, textAlign: "center" }}>
                {children}
            </div>
        </div>
    );
}

function ResultButton({ label, onClick, variant = "primary", icon }) {
    const styles = {
        primary: { background: T.green, color: T.white },
        danger: { background: "#DC2626", color: T.white },
        soft: { background: T.creamDark, color: T.ink },
    };
    return (
        <button
            onClick={onClick}
            style={{
                width: "100%", height: 52, borderRadius: 99, border: "none", fontWeight: 700, fontSize: 15,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginTop: 14, ...styles[variant],
            }}
        >
            {icon}{label}
        </button>
    );
}

/* ─── Summary line (used in idle form summary + result screens) ── */
function SummaryLine({ label, value, big, accent, last }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: last ? "none" : `1px solid ${T.border}` }}>
            <span style={{ fontSize: 13.5, color: T.muted, fontWeight: 500 }}>{label}</span>
            <strong style={{ fontSize: big ? 22 : 14, color: accent || T.ink, fontFamily: big ? "Fraunces, serif" : "inherit", fontWeight: big ? 800 : 700 }}>
                {value}
            </strong>
        </div>
    );
}

function BadgeIcon() {
    return <BadgeCheck size={15} color="#E8A97C" />;
}

export default function AmbulanceRequest() {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const ambulanceId = Number(params.get("ambulanceId"));
    const driverName = params.get("driverName");
    const vehicleType = params.get("type");

    const pickup = location.state?.pickup;
    const pickupLabel = location.state?.pickupLabel;

    const [destination, setDestination] = useState(null);
    const [destinationAddress, setDestinationAddress] = useState("");

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("idle");
    const [requestId, setRequestId] = useState(null);
    const [driver, setDriver] = useState(null);

    useEffect(() => {
        if (!pickup || !ambulanceId) {
            toast.error("Booking information missing.");
            navigate("/patient/ambulance");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (status !== "waiting" || !requestId) return;
        const timer = setInterval(async () => {
            try {
                const res = await api.get(`/patient/ambulance-request/${requestId}`);
                setDriver(res.data);
                if (res.data.status === "Accepted") setStatus("accepted");
                if (res.data.status === "Rejected") setStatus("rejected");
                if (res.data.status === "Cancelled") setStatus("cancelled");
                if (res.data.status === "Completed") setStatus("completed");
            } catch (err) {
                console.log(err);
            }
        }, 5000);
        return () => clearInterval(timer);
    }, [status, requestId]);

    const distanceKm = useMemo(() => {
        if (!pickup || !destination) return 0;
        const R = 6371;
        const dLat = ((destination.lat - pickup.lat) * Math.PI) / 180;
        const dLng = ((destination.lng - pickup.lng) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((pickup.lat * Math.PI) / 180) *
                Math.cos((destination.lat * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return +(R * c).toFixed(2);
    }, [pickup, destination]);

    const fare = useMemo(() => {
        const perKm = 22;
        return Math.round(distanceKm * perKm);
    }, [distanceKm]);

    async function confirmBooking() {
        if (!destination) {
            toast.error("Please select destination.");
            return;
        }
        if (!destinationAddress.trim()) {
            toast.error("Please enter destination address.");
            return;
        }
        try {
            setLoading(true);
            const res = await api.post("/patient/ambulance-request", {
                ambulanceId,
                pickupLocation: pickupLabel,
                destinationLocation: destinationAddress,
                pickupLat: pickup.lat,
                pickupLng: pickup.lng,
                destinationLat: destination.lat,
                destinationLng: destination.lng,
                vehicleType,
                estimatedFare: fare,
            });
            setRequestId(res.data.requestId);
            setStatus("waiting");
            toast.success("Booking request sent.");
        } catch (err) {
            console.log(err);
            toast.error("Unable to send booking request.");
        } finally {
            setLoading(false);
        }
    }

    /* ── IDLE: booking form ── */
    if (status === "idle") {
        return (
            <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "Inter, sans-serif", color: T.ink }}>
                <Toaster position="top-right" />
                <style>{GLOBAL_STYLES}</style>

                {/* Editorial hero — cream, serif headline, image right (AboutUs style) */}
                <div className="w-full px-6 lg:px-16 xl:px-24 2xl:px-32" style={{ paddingTop: 32, paddingBottom: 20 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: T.muted, fontWeight: 600, fontSize: 13.5, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 36 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = T.ink)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}
                    >
                        <ArrowLeft size={15} /> Back
                    </button>

                    <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 56, alignItems: "start" }} className="ambr-hero-grid">
                        <style>{`@media (max-width: 900px) { .ambr-hero-grid { grid-template-columns: 1fr !important; } }`}</style>

                        {/* Left: editorial copy */}
                        <div>
                            <p style={{ color: T.green, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.6, margin: "0 0 18px" }}>
                                Booking {driverName}
                            </p>
                            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "clamp(34px, 4.8vw, 54px)", color: T.green, margin: 0, lineHeight: 1.12 }}>
                                Help is closer<br />
                                <span style={{ fontStyle: "italic", color: T.terra, fontWeight: 600 }}>than you think.</span>
                            </h1>

                            <p style={{ marginTop: 26, fontSize: 16.5, color: T.ink, lineHeight: 1.7, maxWidth: 480 }}>
                                Confirm your pickup and destination below, and {driverName?.split(" ")[0] || "your driver"} will be notified right away. No calls to make, no waiting on hold.
                            </p>
                            <p style={{ marginTop: 16, fontSize: 14.5, color: T.muted, lineHeight: 1.75, maxWidth: 480 }}>
                                We track your request in real time — you'll know the moment it's accepted, and you can reach the driver directly the second they're on the way.
                            </p>

                            <div style={{ display: "flex", gap: 28, marginTop: 32 }}>
                                <div>
                                    <p style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 22, color: T.green, margin: 0 }}>{vehicleType}</p>
                                    <p style={{ fontSize: 11.5, color: T.muted, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: 0.4 }}>Vehicle Type</p>
                                </div>
                                <div style={{ width: 1, background: T.border }} />
                                <div>
                                    <p style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 22, color: T.terra, margin: 0 }}>₹{fare || "—"}</p>
                                    <p style={{ fontSize: 11.5, color: T.muted, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: 0.4 }}>Est. Fare</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: driver info card, offset like AboutUs */}
                        <div style={{ position: "relative" }}>
                            <div style={{
                                borderRadius: 28,
                                background: `linear-gradient(160deg, ${T.green}, #2A4A3D)`,
                                boxShadow: "0 24px 60px rgba(22,51,43,.18)",
                                position: "relative", padding: "28px 28px 34px",
                                display: "flex", flexDirection: "column",
                            }}>
                                {/* top row: vehicle badge + avatar side by side */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{
                                        display: "inline-flex", alignItems: "center", gap: 6,
                                        padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                                        background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.25)",
                                    }}>
                                        <Car size={13} /> {vehicleType}
                                    </span>

                                    <div style={{
                                        width: 56, height: 56, borderRadius: "50%",
                                        background: "rgba(255,255,255,.12)", border: "2px solid rgba(255,255,255,.25)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: T.white, fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 22, flexShrink: 0,
                                    }}>
                                        {(driverName || "D")[0].toUpperCase()}
                                    </div>
                                </div>

                                {/* driver name */}
                                <div style={{ marginTop: 28 }}>
                                    <p style={{ color: "rgba(255,255,255,.55)", fontSize: 11, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Driver Name</p>
                                    <p style={{ color: "#fff", fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 26, margin: "6px 0 0" }}>{driverName}</p>
                                </div>

                                <div style={{ height: 1, background: "rgba(255,255,255,.15)", margin: "22px 0" }} />

                                {/* details grid */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <Phone size={15} color="#E8A97C" />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ color: "rgba(255,255,255,.55)", fontSize: 10.5, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Phone Number</p>
                                            <p style={{ color: "#fff", fontSize: 14.5, fontWeight: 600, margin: "3px 0 0" }}>{driver?.driverPhone || params.get("driverPhone") || "Shared after acceptance"}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <BadgeIcon />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ color: "rgba(255,255,255,.55)", fontSize: 10.5, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>License Number</p>
                                            <p style={{ color: "#fff", fontSize: 14.5, fontWeight: 600, margin: "3px 0 0" }}>{driver?.licenseNumber || params.get("licenseNumber") || "—"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* pickup chip — sits below the card, not overlapping its content */}
                            <div style={{
                                marginTop: 18, background: T.white, borderRadius: 18,
                                border: `1px solid ${T.border}`, padding: "14px 18px", boxShadow: "0 12px 30px rgba(22,51,43,.08)",
                                display: "flex", alignItems: "center", gap: 10,
                            }}>
                                <div style={{ width: 34, height: 34, borderRadius: 10, background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <MapPin size={16} color={T.green} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: 10.5, color: T.muted, margin: 0, fontWeight: 600 }}>Pickup</p>
                                    <p style={{ fontSize: 12.5, fontWeight: 700, margin: "2px 0 0", color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pickupLabel}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full px-6 lg:px-16 xl:px-24 2xl:px-32" style={{ paddingTop: 56, paddingBottom: 72 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 28, alignItems: "start" }} className="ambr-grid">
                        <style>{`@media (max-width: 860px) { .ambr-grid { grid-template-columns: 1fr !important; } }`}</style>

                        {/* Left: locations + map */}
                        <div>
                            {/* Pickup */}
                            <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: 22, display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <MapPin size={20} color={T.green} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, color: T.muted, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Pickup</p>
                                    <h3 style={{ fontSize: 15.5, fontWeight: 700, margin: "4px 0 0", color: T.ink }}>{pickupLabel}</h3>
                                </div>
                            </div>

                            {/* Destination + map */}
                            <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: 22, marginBottom: 16 }}>
                                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: T.terraLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <Navigation size={20} color={T.terra} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 12, color: T.muted, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Destination</p>
                                        <h3 style={{ fontSize: 15.5, fontWeight: 700, margin: "4px 0 0", color: T.ink }}>
                                            {destination ? "Selected on map" : "Select destination below"}
                                        </h3>
                                    </div>
                                </div>

                                <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${T.border}` }}>
                                    <MapPicker
                                        currentLocation={pickup}
                                        destination={destination}
                                        setDestination={setDestination}
                                        setAddress={setDestinationAddress}
                                    />
                                </div>

                                <input
                                    type="text"
                                    placeholder="Destination address"
                                    value={destinationAddress}
                                    onChange={(e) => setDestinationAddress(e.target.value)}
                                    style={{
                                        width: "100%", height: 50, borderRadius: 14, border: `1.5px solid ${T.border}`,
                                        padding: "0 16px", fontSize: 14, outline: "none", marginTop: 14,
                                        background: T.cream, color: T.ink, fontFamily: "Inter, sans-serif",
                                    }}
                                />
                            </div>

                            {/* Driver */}
                            <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${T.green}, ${T.greenSoft})`, display: "flex", alignItems: "center", justifyContent: "center", color: T.white, fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 16 }}>
                                        {(driverName || "D")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 12, color: T.muted, margin: 0, fontWeight: 500 }}>Driver</p>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "3px 0 0", color: T.ink }}>{driverName}</h3>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 99, background: T.creamDark, fontSize: 12.5, fontWeight: 600, color: T.ink }}>
                                    <Car size={14} /> {vehicleType}
                                </div>
                            </div>
                        </div>

                        {/* Right: sticky fare summary */}
                        <div style={{ position: "sticky", top: 24 }}>
                            <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: 24 }}>
                                <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 16, color: T.ink, margin: "0 0 4px" }}>
                                    Fare Summary
                                </h3>
                                <p style={{ fontSize: 12.5, color: T.muted, margin: "0 0 16px" }}>Estimated cost for this trip.</p>

                                <SummaryLine label="Vehicle" value={vehicleType} />
                                <SummaryLine label="Distance" value={`${distanceKm} km`} />
                                <SummaryLine label="Estimated Fare" value={`₹${fare}`} big accent={T.terra} last />

                                <button
                                    onClick={confirmBooking}
                                    disabled={loading}
                                    style={{
                                        width: "100%", height: 54, borderRadius: 99, border: "none", background: T.green, color: T.white,
                                        fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20,
                                        boxShadow: "0 10px 24px rgba(22,51,43,.2)",
                                    }}
                                >
                                    {loading ? (<><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Sending Request…</>) : "Confirm Booking"}
                                </button>

                                <p style={{ fontSize: 11.5, color: T.muted, textAlign: "center", margin: "14px 0 0", lineHeight: 1.5 }}>
                                    You'll be notified as soon as {driverName?.split(" ")[0] || "the driver"} responds.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── WAITING ── */
    if (status === "waiting") {
        return (
            <ResultShell>
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: T.terraLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", animation: "pulseSoft 1.8s ease-in-out infinite" }}>
                    <Clock3 size={34} color={T.terra} />
                </div>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 26, color: T.green, margin: 0 }}>
                    Waiting for Driver
                </h2>
                <p style={{ marginTop: 10, color: T.muted, fontSize: 14.5 }}>
                    Your booking request has been sent and is awaiting response.
                </p>

                <div style={{ background: T.cream, borderRadius: 16, padding: "16px 20px", marginTop: 24, textAlign: "left" }}>
                    <SummaryLine label="Driver" value={driverName} />
                    <SummaryLine label="Request ID" value={`#${requestId}`} last />
                </div>

                <div style={{ marginTop: 28, width: 40, height: 40, borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.green, animation: "spin 0.9s linear infinite", marginLeft: "auto", marginRight: "auto" }} />
            </ResultShell>
        );
    }

    /* ── ACCEPTED ── */
    if (status === "accepted") {
        return (
            <ResultShell>
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
                    <CheckCircle2 size={36} color="#15803D" />
                </div>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 26, color: T.green, margin: 0 }}>
                    Driver Accepted
                </h2>
                <p style={{ marginTop: 10, color: T.muted, fontSize: 14.5 }}>
                    Your ambulance is on the way. Stay at the pickup location.
                </p>

                <div style={{ background: T.cream, borderRadius: 16, padding: "16px 20px", marginTop: 24, textAlign: "left" }}>
                    <SummaryLine label="Driver" value={driver?.driverName || driverName} />
                    <SummaryLine label="Vehicle No." value={driver?.vehicleNumber || "—"} last />
                </div>

                {driver?.driverPhone && (
                    <a href={`tel:${driver.driverPhone}`} style={{ textDecoration: "none" }}>
                        <ResultButton label="Call Driver" variant="soft" icon={<Phone size={16} />} />
                    </a>
                )}
                <ResultButton label="Back to Ambulance" variant="primary" icon={<Home size={16} />} onClick={() => navigate("/patient/ambulance")} />
            </ResultShell>
        );
    }

    /* ── REJECTED ── */
    if (status === "rejected") {
        return (
            <ResultShell>
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
                    <XCircle size={36} color="#DC2626" />
                </div>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 26, color: "#DC2626", margin: 0 }}>
                    Driver Rejected
                </h2>
                <p style={{ marginTop: 10, color: T.muted, fontSize: 14.5 }}>
                    This driver couldn't accept your request. Please choose another ambulance nearby.
                </p>
                <ResultButton label="Choose Another Ambulance" variant="danger" onClick={() => navigate("/patient/ambulance")} />
            </ResultShell>
        );
    }

    /* ── CANCELLED ── */
    if (status === "cancelled") {
        return (
            <ResultShell>
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: T.creamDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
                    <XCircle size={36} color={T.muted} />
                </div>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 26, color: T.ink, margin: 0 }}>
                    Ride Cancelled
                </h2>
                <p style={{ marginTop: 10, color: T.muted, fontSize: 14.5 }}>
                    This booking was cancelled. You can request a new ambulance anytime.
                </p>
                <ResultButton label="Back to Ambulance" variant="primary" icon={<Home size={16} />} onClick={() => navigate("/patient/ambulance")} />
            </ResultShell>
        );
    }

    /* ── COMPLETED ── */
    if (status === "completed") {
        return (
            <ResultShell>
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
                    <CheckCircle2 size={36} color="#15803D" />
                </div>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 26, color: T.green, margin: 0 }}>
                    Ride Completed
                </h2>
                <p style={{ marginTop: 10, color: T.muted, fontSize: 14.5 }}>
                    Hope you reached safely. Thank you for using CareConnect.
                </p>

                <div style={{ background: T.cream, borderRadius: 16, padding: "16px 20px", marginTop: 24, textAlign: "left" }}>
                    <SummaryLine label="Distance" value={`${distanceKm} km`} />
                    <SummaryLine label="Fare Paid" value={`₹${fare}`} accent={T.terra} last />
                </div>

                <ResultButton label="Go to Dashboard" variant="primary" icon={<Gauge size={16} />} onClick={() => navigate("/patient/dashboard")} />
            </ResultShell>
        );
    }

    return null;
}