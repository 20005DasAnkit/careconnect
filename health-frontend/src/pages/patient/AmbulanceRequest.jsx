import { useEffect, useMemo, useState } from "react";
import {
    useNavigate,
    useLocation,
    useSearchParams,
} from "react-router-dom";

import toast from "react-hot-toast";
import api from "../../api/axios";
import MapPicker from "../../components/MapPicker";

import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    MapPin,
    Navigation,
    Car,
} from "lucide-react";

const T = {
    cream: "#F5F0E8",
    creamDark: "#EDE7D9",
    green: "#214034",
    greenMid: "#2F5B49",
    terra: "#C96A3D",
    border: "#E6DED2",
    ink: "#1E1E1E",
};

export default function AmbulanceRequest() {

    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const ambulanceId = Number(params.get("ambulanceId"));
    const driverName = params.get("driverName");
    const vehicleType = params.get("type");

    // -------- Data from previous page --------
    const pickup = location.state?.pickup;
    const pickupLabel = location.state?.pickupLabel;

    // -------- Destination is selected on THIS page now --------
    const [destination, setDestination] = useState(null);
    const [destinationAddress, setDestinationAddress] = useState("");

    // ---------- States ----------
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("idle");
    const [requestId, setRequestId] = useState(null);
    const [driver, setDriver] = useState(null);

    // ---------- Validation ----------
    useEffect(() => {
        if (
            !pickup ||
            !ambulanceId
        ) {
            toast.error(
                "Booking information missing."
            );

            navigate("/patient/ambulance");

            return;
        }
    }, []);

    useEffect(() => {
        if (status !== "waiting" || !requestId) return;

        const timer = setInterval(async () => {
            try {
                const res = await api.get(
                    `/patient/ambulance-request/${requestId}`
                );

                setDriver(res.data);

                if (res.data.status === "Accepted") {
                    setStatus("accepted");
                }

                if (res.data.status === "Rejected") {
                    setStatus("rejected");
                }

                if (res.data.status === "Cancelled") {
                    setStatus("cancelled");
                }

                if (res.data.status === "Completed") {
                    setStatus("completed");
                }

            } catch (err) {
                console.log(err);
            }
        }, 5000);
        return () => clearInterval(timer);
    }, [status, requestId]);

    // ---------- Distance ----------
    const distanceKm = useMemo(() => {
        if (!pickup || !destination)
            return 0;

        const R = 6371;

        const dLat =
            ((destination.lat - pickup.lat) *
                Math.PI) /
            180;

        const dLng =
            ((destination.lng - pickup.lng) *
                Math.PI) /
            180;

        const a =
            Math.sin(dLat / 2) *
            Math.sin(dLat / 2) +
            Math.cos(
                (pickup.lat * Math.PI) / 180
            ) *
            Math.cos(
                (destination.lat * Math.PI) /
                180
            ) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return +(R * c).toFixed(2);
    }, [pickup, destination]);

    // ---------- Fare ----------
    const fare = useMemo(() => {
        const base = 0;

        const perKm = 22;

        return Math.round(
            base + distanceKm * perKm
        );
    }, [distanceKm]);

    // ---------- Confirm Booking ----------
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
                ambulanceId: ambulanceId,
                pickupLocation: pickupLabel,
                destinationLocation: destinationAddress,
                pickupLat: pickup.lat,
                pickupLng: pickup.lng,
                destinationLat: destination.lat,
                destinationLng: destination.lng,
                vehicleType: vehicleType,
                estimatedFare: fare
            });
            setRequestId(res.data.requestId);

            setStatus("waiting");

            toast.success(
                "Booking request sent."
            );
        } catch (err) {
            console.log(err);

            toast.error(
                "Unable to send booking request."
            );
        } finally {
            setLoading(false);
        }
    }
    if (status === "idle") {
        return (
            <div
                className="min-h-screen px-6 py-10"
                style={{ background: T.cream }}
            >
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm mb-8 hover:opacity-70"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <div className="bg-white rounded-3xl shadow-sm border overflow-hidden"
                        style={{ borderColor: T.border }}
                    >
                        <div className="p-8 border-b">

                            <p
                                className="text-xs font-semibold uppercase tracking-widest"
                                style={{ color: T.terra }}
                            >
                                Booking {driverName}
                            </p>

                            <h1
                                className="text-4xl font-bold mt-2"
                                style={{ color: T.ink }}
                            >
                                Confirm Ambulance
                            </h1>

                        </div>

                        <div className="p-8 space-y-6">

                            {/* Pickup */}
                            <div className="rounded-2xl border p-5">
                                <div className="flex gap-4">

                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ background: "#EAF6EF" }}
                                    >
                                        <MapPin color="#2F855A" />
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Pickup
                                        </p>

                                        <h3 className="font-semibold mt-1">
                                            {pickupLabel}
                                        </h3>
                                    </div>

                                </div>
                            </div>

                            {/* Destination - select on map */}
                            <div className="rounded-2xl border p-5">

                                <div className="flex gap-4 mb-4">

                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ background: "#FFF5EA" }}
                                    >
                                        <Navigation color="#C96A3D" />
                                    </div>

                                    <div>

                                        <p className="text-sm text-gray-500">
                                            Destination
                                        </p>

                                        <h3 className="font-semibold mt-1">
                                            {destination
                                                ? "Selected on map"
                                                : "Select destination below"}
                                        </h3>

                                    </div>

                                </div>

                                <MapPicker
                                    currentLocation={pickup}
                                    destination={destination}
                                    setDestination={setDestination}
                                    setAddress={setDestinationAddress}
                                />

                                <div className="mt-4">
                                    <input
                                        type="text"
                                        placeholder="Destination Address"
                                        value={destinationAddress}
                                        onChange={(e) =>
                                            setDestinationAddress(e.target.value)
                                        }
                                        className="w-full border rounded-xl p-4"
                                    />
                                </div>

                            </div>

                            {/* Driver */}
                            <div className="rounded-2xl border p-5">

                                <div className="flex justify-between items-center">

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Driver
                                        </p>

                                        <h3 className="font-semibold mt-1">
                                            {driverName}
                                        </h3>

                                    </div>
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ background: "#EEF5F1" }}
                                    >
                                        <Car size={22} />
                                    </div>
                                </div>

                            </div>

                            {/* Summary */}
                            <div
                                className="rounded-2xl p-6"
                                style={{
                                    background: "#FBF9F5",
                                    border: `1px solid ${T.border}`,
                                }}
                            >

                                <div className="flex justify-between py-2">
                                    <span>Vehicle</span>
                                    <strong>{vehicleType}</strong>
                                </div>

                                <div className="flex justify-between py-2">
                                    <span>Distance</span>
                                    <strong>{distanceKm} km</strong>
                                </div>

                                <div className="flex justify-between py-2">
                                    <span>Estimated Fare</span>
                                    <strong
                                        style={{
                                            color: T.green,
                                            fontSize: 24,
                                        }}
                                    >
                                        ₹{fare}
                                    </strong>
                                </div>
                            </div>

                            {/* Button */}

                            <button
                                onClick={confirmBooking}
                                disabled={loading}
                                className="w-full h-14 rounded-2xl text-white font-semibold text-lg transition"
                                style={{
                                    background: T.green,
                                }}
                            >
                                {loading
                                    ? "Sending Request..."
                                    : "Confirm Booking"}
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        );
    }


    if (status === "waiting") {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: T.cream }}
            >
                <div className="bg-white rounded-3xl shadow p-12 w-full max-w-xl text-center">

                    <Clock3
                        size={60}
                        className="mx-auto animate-pulse"
                        color={T.terra}
                    />

                    <h2
                        className="text-3xl font-bold mt-6"
                        style={{ color: T.green }}
                    >
                        Waiting for Driver
                    </h2>

                    <p className="mt-3 text-gray-500">
                        Your booking request has been sent.
                    </p>

                    <p className="mt-2 text-gray-500">
                        Driver : {driverName}
                    </p>

                    <p className="mt-2 text-gray-500">
                        Request ID : {requestId}
                    </p>

                    <div className="mt-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-700 border-t-transparent mx-auto"></div>
                    </div>

                </div>
            </div>
        );
    }

    if (status === "accepted") {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: T.cream }}
            >
                <div className="bg-white rounded-3xl shadow p-12 w-full max-w-xl text-center">

                    <CheckCircle2
                        size={70}
                        color="#22C55E"
                        className="mx-auto"
                    />

                    <h2
                        className="text-3xl font-bold mt-6"
                        style={{ color: T.green }}
                    >
                        Driver Accepted
                    </h2>

                    <p className="mt-4">
                        {driver?.driverName}
                    </p>

                    <p className="text-gray-500">
                        {driver?.vehicleNumber}
                    </p>

                    <button
                        onClick={() => navigate("/patient/ambulance")}
                        className="mt-8 w-full h-14 rounded-xl text-white"
                        style={{ background: T.green }}
                    >
                        Back
                    </button>

                </div>
            </div>
        );
    }

    if (status === "rejected") {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: T.cream }}
            >
                <div className="bg-white rounded-3xl shadow p-12 w-full max-w-xl text-center">

                    <h2
                        className="text-3xl font-bold text-red-600"
                    >
                        Driver Rejected
                    </h2>

                    <p className="mt-4 text-gray-500">
                        Please choose another ambulance.
                    </p>

                    <button
                        onClick={() => navigate("/patient/ambulance")}
                        className="mt-8 w-full h-14 rounded-xl text-white bg-red-600"
                    >
                        Back
                    </button>

                </div>
            </div>
        );
    }

    if (status === "cancelled") {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: T.cream }}
            >
                <div className="bg-white rounded-3xl shadow p-12 w-full max-w-xl text-center">

                    <h2 className="text-3xl font-bold">
                        Ride Cancelled
                    </h2>

                    <button
                        onClick={() => navigate("/patient/ambulance")}
                        className="mt-8 w-full h-14 rounded-xl text-white"
                        style={{ background: T.green }}
                    >
                        Back
                    </button>

                </div>
            </div>
        );
    }

    if (status === "completed") {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: T.cream }}
            >
                <div className="bg-white rounded-3xl shadow p-12 w-full max-w-xl text-center">

                    <CheckCircle2
                        size={70}
                        color="#16A34A"
                        className="mx-auto"
                    />

                    <h2
                        className="text-3xl font-bold mt-6"
                    >
                        Ride Completed
                    </h2>

                    <button
                        onClick={() => navigate("/patient/dashboard")}
                        className="mt-8 w-full h-14 rounded-xl text-white"
                        style={{ background: T.green }}
                    >
                        Go Dashboard
                    </button>

                </div>
            </div>
        );
    }

    return null;
}