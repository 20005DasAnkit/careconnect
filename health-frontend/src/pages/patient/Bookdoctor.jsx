import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiArrowLeft,
    FiShield,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const STEPS = ["Select slot", "Confirm", "Payment", "Done"];


function formatSlotDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
    });
}

function formatSlotTime(date) {
    return new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StepHeader({ step, doctorName }) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#C9683F] uppercase tracking-wide">
                    {doctorName ? `Booking with Dr. ${doctorName}` : "Request an appointment"}
                </span>
                <span className="text-xs text-[#A8A192] font-medium">
                    Step {step + 1} of {STEPS.length}
                </span>
            </div>
            <h1 className="text-[26px] font-serif font-semibold text-[#16332B] leading-tight">
                {STEPS[step]}
            </h1>

            <div className="flex gap-1.5 mt-4">
                {STEPS.map((s, i) => (
                    <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-[#16332B]" : "bg-[#E7E2D6]"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

function SlotSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="h-16 rounded-xl bg-[#EFEAE0] animate-pulse"
                />
            ))}
        </div>
    );
}

export default function BookAppointment() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const doctorId = searchParams.get("doctorId");

    const [step, setStep] = useState(0);
    const [doctor, setDoctor] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [error, setError] = useState("");
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [paying, setPaying] = useState(false);
    const [appointmentResult, setAppointmentResult] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("Online");

    const advanceAmount = useMemo(() => {
        if (!doctor?.fee) return 0;
        return Math.round(doctor.fee * 0.5 * 100) / 100;
    }, [doctor]);

    useEffect(() => {
        if (!doctorId) {
            setError("No doctor selected.");
            setLoadingSlots(false);
            return;
        }
        loadDoctorAndSlots();
    }, [doctorId]);

    async function loadDoctorAndSlots() {
        setLoadingSlots(true);
        setError("");
        try {
            const [doctorsRes, slotsRes] = await Promise.all([
                api.get("/patient/doctors"),
                api.get(`/patient/doctor/${doctorId}/slots`),
            ]);

            const found = (doctorsRes.data || []).find(
                (d) => String(d.id) === String(doctorId)
            );
            setDoctor(found || null);
            setSlots(slotsRes.data || []);
        } catch (err) {
            setError("Unable to load doctor availability.");
            toast.error("Failed to load slots.");
        } finally {
            setLoadingSlots(false);
        }
    }

    function goToConfirm(slot) {
        const seatsLeft = slot.seatsLeft ?? (slot.maxPatients - slot.bookedCount);
        if (seatsLeft <= 0) {
            toast.error("This slot just got fully booked. Please pick another.");
            loadDoctorAndSlots();
            return;
        }
        setSelectedSlot(slot);
        setStep(1);
    }

    async function confirmBooking() {
        setPaying(true);

        try {
            const res = await api.post("/patient/book", {
                doctorAvailabilityId: selectedSlot.id,
                paymentMethod: paymentMethod
            });

            setAppointmentResult({
                appointmentId:
                    res.data?.appointmentId ||
                    res.data?.id ||
                    Math.floor(Math.random() * 100000),

                advancePaid:
                    paymentMethod === "Online"
                        ? advanceAmount
                        : 0,

                seatsLeft: res.data?.seatsLeft,
            });

            toast.success("Appointment Booked Successfully");
            setStep(3);

        } catch (err) {
            const msg = err?.response?.data;
            if (typeof msg === "string" && msg.toLowerCase().includes("fully booked")) {
                toast.error("This slot just got fully booked. Please pick another slot.");
                setStep(0);
                loadDoctorAndSlots();
            } else {
                toast.error(typeof msg === "string" ? msg : "Booking failed. Please try again.");
            }
        } finally {
            setPaying(false);
        }
    }

    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-[#F8F6F0]">
                <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 py-10">

                    {step < 3 && (
                        <button
                            onClick={() => (step === 0 ? navigate(-1) : setStep((s) => s - 1))}
                            className="flex items-center gap-1.5 text-sm text-[#6B6458] hover:text-[#16332B] mb-6 transition"
                        >
                            <FiArrowLeft size={15} />
                            Back
                        </button>
                    )}

                    <div className="bg-white rounded-3xl shadow-lg border border-[#E7E2D6] p-8 lg:p-12 min-h-[80vh]">

                        <StepHeader step={step} doctorName={doctor?.name} />

                        {error && (
                            <div className="bg-[#FBEAE5] border border-[#E8B8AA] rounded-xl p-4 text-center">
                                <p className="text-[#9E3A20] text-sm">{error}</p>
                            </div>
                        )}

                        {!error && step === 0 && (
                            <div>
                                {loadingSlots && <SlotSkeleton />}

                                {!loadingSlots && slots.length === 0 && (
                                    <div className="text-center py-10">
                                        <p className="text-[#16332B] font-medium mt-4">
                                            No open slots right now
                                        </p>
                                        <p className="text-[#8B8478] text-sm mt-1">
                                            Check back later or try another doctor.
                                        </p>
                                    </div>
                                )}

                                {!loadingSlots && slots.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {slots.map((slot) => {
                                            const seatsLeft = slot.seatsLeft ?? (slot.maxPatients - slot.bookedCount);
                                            const low = seatsLeft <= 3;
                                            return (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => goToConfirm(slot)}
                                                    className="text-left rounded-xl border border-[#E7E2D6] hover:border-[#16332B] hover:bg-[#F8F6F0] p-3.5 transition group"
                                                >
                                                    <div className="flex items-center gap-1.5 text-[#16332B]">
                                                        <FiCalendar size={13} />
                                                        <span className="text-xs font-semibold">
                                                            {formatSlotDate(slot.availableFrom)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1.5 text-[#6B6458]">
                                                        <FiClock size={13} />
                                                        <span className="text-sm font-medium">
                                                            {formatSlotTime(slot.availableFrom)}
                                                        </span>
                                                    </div>
                                                    {seatsLeft != null && (
                                                        <span
                                                            className={`inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${low
                                                                    ? "bg-[#FBEAE0] text-[#C9683F]"
                                                                    : "bg-[#EEF5F2] text-[#2F6B47]"
                                                                }`}
                                                        >
                                                            {seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {!error && step === 1 && selectedSlot && (
                            <div>
                                <div className="bg-[#F8F6F0] rounded-xl border border-[#E7E2D6] p-5 space-y-3.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Doctor</span>
                                        <span className="font-medium text-[#16332B]">
                                            Dr. {doctor?.name || `#${doctorId}`}
                                        </span>
                                    </div>
                                    {doctor?.specialization && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#8B8478]">Specialization</span>
                                            <span className="font-medium text-[#16332B]">
                                                {doctor.specialization}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Date</span>
                                        <span className="font-medium text-[#16332B]">
                                            {formatSlotDate(selectedSlot.availableFrom)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Time</span>
                                        <span className="font-medium text-[#16332B]">
                                            {formatSlotTime(selectedSlot.availableFrom)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Seats left</span>
                                        <span className="font-medium text-[#16332B]">
                                            {selectedSlot.seatsLeft ?? (selectedSlot.maxPatients - selectedSlot.bookedCount)}
                                        </span>
                                    </div>
                                    <div className="border-t border-[#E7E2D6] pt-3.5 flex justify-between text-sm">
                                        <span className="text-[#8B8478]">Consultation fee</span>
                                        <span className="font-medium text-[#16332B]">
                                            ₹{doctor?.fee ?? "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-semibold text-[#16332B]">
                                            Pay now (50% advance)
                                        </span>
                                        <span className="text-lg font-semibold text-[#C9683F]">
                                            ₹{advanceAmount}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-[#A8A192] mt-4 text-center">
                                    Remaining balance is settled at the clinic after your visit.
                                </p>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full mt-6 bg-[#16332B] hover:bg-[#0F241D] text-white py-3 rounded-xl font-medium transition"
                                >
                                    Continue to payment
                                </button>
                            </div>
                        )}

                        {!error && step === 2 && selectedSlot && (
                            <div>
                                <div className="bg-[#F8F6F0] rounded-xl border border-[#E7E2D6] p-6">

                                    <h3 className="text-lg font-semibold text-[#16332B] mb-5">
                                        Select Payment Method
                                    </h3>

                                    <div className="space-y-4">
                                        <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${paymentMethod === "Online"
                                            ? "border-[#16332B] bg-[#EEF5F2]"
                                            : "border-[#E7E2D6]"
                                            }`}>
                                            <div>
                                                <h4 className="font-semibold">💳 Online Payment</h4>
                                                <p className="text-sm text-gray-500">
                                                    Pay advance online
                                                </p>
                                            </div>

                                            <input
                                                type="radio"
                                                checked={paymentMethod === "Online"}
                                                onChange={() => setPaymentMethod("Online")}
                                            />
                                        </label>

                                        <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${paymentMethod === "Cash"
                                            ? "border-[#16332B] bg-[#EEF5F2]"
                                            : "border-[#E7E2D6]"
                                            }`}>
                                        </label>
                                    </div>

                                    <div className="mt-6 flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span>
                                            {paymentMethod === "Online"
                                                ? `₹${advanceAmount}`
                                                : "₹0"}
                                        </span>
                                    </div>

                                    <button
                                        onClick={confirmBooking}
                                        disabled={paying}
                                        className="w-full mt-8 bg-[#16332B] hover:bg-[#0F241D] text-white py-3 rounded-xl font-medium"
                                    >
                                        {paying
                                            ? "Booking..."
                                            : paymentMethod === "Online"
                                                ? "Pay & Confirm"
                                                : "Confirm Booking"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-[#E9F2EC] flex items-center justify-center">
                                    <FiCheckCircle className="text-[#2F6B47]" size={30} />
                                </div>
                                <h2 className="text-lg font-semibold text-[#16332B] mt-5">
                                    Appointment confirmed
                                </h2>
                                <p className="text-[#6B6458] text-sm mt-2">
                                    Reference #{appointmentResult?.appointmentId}
                                </p>
                                <p className="text-[#8B8478] text-sm mt-1">
                                    Payment Method: {paymentMethod}
                                </p>

                                <p className="text-[#8B8478] text-sm">
                                    {paymentMethod === "Online"
                                        ? `Advance Paid: ₹${appointmentResult?.advancePaid}`
                                        : "Advance Paid: ₹0"}
                                </p>

                                <button
                                    onClick={() => navigate("/patient/appointments")}
                                    className="w-full mt-7 bg-[#16332B] hover:bg-[#0F241D] text-white py-3 rounded-xl font-medium transition"
                                >
                                    View my appointments
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}