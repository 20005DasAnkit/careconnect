import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import Footer from "../../components/Footer";

import {
    ArrowLeft,
    Star,
    MapPin,
    Stethoscope,
    IndianRupee,
    CalendarDays,
    ShieldCheck,
    BadgeCheck,
    FileDown,
    FileText,
    MessageSquarePlus,
} from "lucide-react";

// ================= CARECONNECT DESIGN TOKENS =================
const C = {
    cream: "#FAF8F3",
    forest: "#16332B",
    forestHover: "#0F231D",
    terracotta: "#B5562C",
    border: "#E4DFD3",
    cardAlt: "#EFEAE0",
    white: "#FFFFFF",
    green: "#3E7C59",
    muted: "#6B7280",
};

const FRAUNCES = "'Fraunces', Georgia, serif";
const INTER = "'Inter', system-ui, sans-serif";

const card = {
    background: C.white,
    borderRadius: 20,
    border: `1px solid ${C.border}`,
};

const sectionTitle = {
    fontFamily: FRAUNCES,
    fontSize: 19,
    fontWeight: 600,
    color: C.forest,
    margin: 0,
};

const pillButton = {
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 14,
    border: "none",
    cursor: "pointer",
    fontFamily: INTER,
};

export default function DoctorDetails() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [appointment, setAppointment] = useState(null);
    const [slots, setSlots] = useState([]);
    const [reviews, setReviews] = useState(null);
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get("appointmentId");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDoctor();
    }, [id]);

    const loadDoctor = async () => {
        try {
            const [doctorRes, slotRes, reviewRes] = await Promise.all([
                api.get(`/patient/doctor/${id}`),
                api.get(`/patient/doctor/${id}/slots`),
                api.get(`/review/doctor/${id}`)
            ]);
            if (appointmentId) {
                const res = await api.get(`/patient/appointment/${appointmentId}`);
                setAppointment(res.data);
            }
            setDoctor(doctorRes.data);
            setSlots(slotRes.data);
            setReviews(reviewRes.data);
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                background: C.cream,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: INTER
            }}>
                <div style={{ color: C.forest, fontSize: 15, fontWeight: 500 }}>
                    Loading doctor profile…
                </div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div style={{
                minHeight: "100vh",
                background: C.cream,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: INTER,
                color: C.muted
            }}>
                Doctor not found.
            </div>
        );
    }

    function AppointmentActions({ appointment }) {
        return (
            <div style={{ ...card, padding: 36, marginTop: 20 }}>
                <h2 style={{ fontFamily: FRAUNCES, fontSize: 26, fontWeight: 500, color: C.forest, margin: 0 }}>
                    Your appointment
                </h2>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 24,
                    marginTop: 28
                }}>
                    <div>
                        <p style={{ color: C.muted, fontSize: 12.5, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Date</p>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.forest }}>
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </h4>
                    </div>

                    <div>
                        <p style={{ color: C.muted, fontSize: 12.5, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Status</p>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.forest }}>{appointment.status}</h4>
                    </div>

                    <div>
                        <p style={{ color: C.muted, fontSize: 12.5, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Payment</p>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.forest }}>{appointment.paymentStatus}</h4>
                    </div>

                    <div>
                        <p style={{ color: C.muted, fontSize: 12.5, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Hospital</p>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.forest }}>{appointment.hospitalName}</h4>
                    </div>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 14,
                    marginTop: 32
                }}>
                    <button
                        style={{
                            ...pillButton,
                            height: 46,
                            background: "#FFF4EC",
                            color: C.terracotta,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                        }}
                    >
                        <FileDown size={16} /> Download Bill
                    </button>

                    <button
                        disabled={appointment.status !== "Completed"}
                        style={{
                            ...pillButton,
                            height: 46,
                            background: "#EEF8EC",
                            color: C.green,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            opacity: appointment.status !== "Completed" ? 0.5 : 1,
                            cursor: appointment.status !== "Completed" ? "not-allowed" : "pointer",
                        }}
                    >
                        <FileText size={16} /> Prescription
                    </button>

                    {appointment.status === "Completed" && !appointment.isReviewed && (
                        <button
                            style={{
                                ...pillButton,
                                height: 46,
                                background: "#FFFBE6",
                                color: "#92400E",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                            }}
                        >
                            <MessageSquarePlus size={16} /> Rate Doctor
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (

        <div style={{ minHeight: "100vh", background: C.cream, fontFamily: INTER }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,600&family=Inter:wght@400;500;600;700&display=swap');
            `}</style>

            <div className="w-full max-w-[1400px] mx-auto px-8 lg:px-16 xl:px-24 py-14">

                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: C.forest,
                        marginBottom: 28,
                        fontWeight: 600,
                        fontSize: 14,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        fontFamily: INTER
                    }}
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {/* ================= DOCTOR HEADER ================= */}
                <div style={{ ...card, padding: 32 }}>

                    <div style={{
                        display: "flex",
                        gap: 24,
                        alignItems: "flex-start",
                        flexWrap: "wrap"
                    }}>

                        {/* Avatar */}
                        {doctor.imageUrl ? (
                            <img
                                src={`http://localhost:5008${doctor.imageUrl}`}
                                alt={doctor.name}
                                style={{
                                    width: 92,
                                    height: 92,
                                    borderRadius: 18,
                                    objectFit: "cover",
                                    border: `1px solid ${C.border}`
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: 92,
                                    height: 92,
                                    borderRadius: 18,
                                    background: C.forest,
                                    color: "#fff",
                                    fontSize: 34,
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    fontFamily: FRAUNCES
                                }}
                            >
                                {doctor.name?.charAt(0)}
                            </div>
                        )}

                        {/* Identity */}
                        <div style={{ flex: 1, minWidth: 240 }}>

                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexWrap: "wrap"
                            }}>
                                <h1 style={{
                                    fontFamily: FRAUNCES,
                                    fontSize: 28,
                                    fontWeight: 500,
                                    color: C.forest,
                                    margin: 0,
                                }}>
                                    {doctor.name}
                                </h1>

                                <BadgeCheck size={19} color={C.terracotta} />
                            </div>

                            <p style={{
                                marginTop: 5,
                                fontSize: 15,
                                color: C.terracotta,
                                fontWeight: 600
                            }}>
                                {doctor.specialization}
                            </p>

                            <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 16,
                                marginTop: 16
                            }}>

                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <Star size={15} fill={C.terracotta} color={C.terracotta} />
                                    <span style={{ fontSize: 14, fontWeight: 600, color: C.forest }}>
                                        {reviews?.averageRating ?? "New"}
                                    </span>
                                    <span style={{ fontSize: 14, color: C.muted }}>
                                        ({reviews?.totalReviews ?? 0} reviews)
                                    </span>
                                </div>

                                <div style={{ width: 1, background: C.border }} />

                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: C.muted }}>
                                    <MapPin size={15} />
                                    {doctor.hospitalName}
                                </div>

                                <div style={{ width: 1, background: C.border }} />

                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: C.muted }}>
                                    <Stethoscope size={15} />
                                    {doctor.experience} yrs experience
                                </div>
                            </div>
                        </div>

                        {/* Fee + CTA */}
                        <div style={{ textAlign: "right", minWidth: 190 }}>

                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 2
                            }}>
                                <IndianRupee size={20} color={C.forest} />
                                <span style={{ fontFamily: FRAUNCES, fontSize: 30, fontWeight: 700, color: C.forest }}>
                                    {doctor.fee}
                                </span>
                            </div>

                            <p style={{ margin: "2px 0 14px", fontSize: 13, color: C.muted }}>
                                Consultation fee
                            </p>

                            <button
                                onClick={() => navigate(`/patient/bookdoctor?doctorId=${doctor.id}`)}
                                style={{
                                    ...pillButton,
                                    width: "100%",
                                    height: 46,
                                    background: C.forest,
                                    color: "#fff",
                                }}
                                onMouseOver={e => e.currentTarget.style.background = C.forestHover}
                                onMouseOut={e => e.currentTarget.style.background = C.forest}
                            >
                                Book appointment
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================= BODY GRID ================= */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: 20,
                    marginTop: 20
                }}>

                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* ABOUT */}
                        <div style={{ ...card, padding: 32 }}>
                            <h2 style={sectionTitle}>About</h2>

                            <p style={{
                                marginTop: 14,
                                lineHeight: 1.75,
                                color: C.muted,
                                fontSize: 14.5
                            }}>
                                {doctor.about || "No biography has been added yet."}
                            </p>

                            <div style={{
                                display: "flex",
                                gap: 32,
                                marginTop: 22,
                                paddingTop: 22,
                                borderTop: `1px solid ${C.border}`
                            }}>
                                <div>
                                    <p style={{ fontSize: 12, color: C.muted, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                        Qualification
                                    </p>
                                    <p style={{ marginTop: 4, fontSize: 14.5, fontWeight: 600, color: C.forest }}>
                                        {doctor.qualification || "Not available"}
                                    </p>
                                </div>

                                <div>
                                    <p style={{ fontSize: 12, color: C.muted, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                        Experience
                                    </p>
                                    <p style={{ marginTop: 4, fontSize: 14.5, fontWeight: 600, color: C.forest }}>
                                        {doctor.experience || 0} years
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* HOSPITAL */}
                        <div style={{
                            ...card,
                            padding: 28,
                            display: "flex",
                            alignItems: "center",
                            gap: 16
                        }}>
                            <div style={{
                                width: 46,
                                height: 46,
                                borderRadius: 14,
                                background: C.cardAlt,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }}>
                                <MapPin size={20} color={C.green} />
                            </div>

                            <div>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: C.forest }}>
                                    {doctor.hospitalName}
                                </p>
                                <p style={{ marginTop: 2, fontSize: 13.5, color: C.muted }}>
                                    Consultation available at this hospital
                                </p>
                            </div>
                        </div>

                        {/* SLOTS */}
                        <div style={{ ...card, padding: 32 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h2 style={sectionTitle}>Available slots</h2>
                                <span style={{ fontSize: 13, color: C.muted }}>
                                    {slots.length} slot{slots.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 12,
                                marginTop: 18
                            }}>
                                {slots.length > 0 ? (
                                    slots.map(slot => (
                                        <div
                                            key={slot.id}
                                            style={{
                                                borderRadius: 14,
                                                border: `1px solid ${C.border}`,
                                                padding: 16,
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start"
                                            }}
                                        >
                                            <div>
                                                <p style={{ fontWeight: 600, color: C.forest, margin: 0, fontSize: 14 }}>
                                                    {new Date(slot.availableFrom).toLocaleDateString("en-IN", {
                                                        weekday: "short",
                                                        day: "numeric",
                                                        month: "short"
                                                    })}
                                                </p>

                                                <p style={{ marginTop: 4, color: C.muted, fontSize: 13.5 }}>
                                                    {new Date(slot.availableFrom).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                    {" – "}
                                                    {new Date(slot.availableTo).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </p>
                                            </div>

                                            <span style={{
                                                padding: "4px 12px",
                                                borderRadius: 999,
                                                background: "#EEF4EC",
                                                color: C.green,
                                                fontSize: 12.5,
                                                fontWeight: 700,
                                                whiteSpace: "nowrap"
                                            }}>
                                                {slot.seatsLeft} left
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ gridColumn: "span 2", textAlign: "center", padding: "40px 0" }}>
                                        <CalendarDays size={32} color={C.muted} style={{ margin: "0 auto" }} />
                                        <p style={{ marginTop: 12, color: C.muted, fontSize: 14 }}>
                                            No available slots right now
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT RAIL */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        <div style={{ ...card, padding: 26, position: "sticky", top: 24 }}>
                            <h3 style={{ ...sectionTitle, fontSize: 15 }}>Snapshot</h3>

                            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                                    <span style={{ color: C.muted }}>Experience</span>
                                    <span style={{ fontWeight: 600, color: C.forest }}>{doctor.experience || 0} yrs</span>
                                </div>

                                <div style={{ height: 1, background: C.border }} />

                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                                    <span style={{ color: C.muted }}>Reviews</span>
                                    <span style={{ fontWeight: 600, color: C.forest }}>{reviews?.totalReviews || 0}</span>
                                </div>

                                <div style={{ height: 1, background: C.border }} />

                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                                    <span style={{ color: C.muted }}>Open slots</span>
                                    <span style={{ fontWeight: 600, color: C.forest }}>{slots.length}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            ...card,
                            padding: 26,
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                            background: C.cardAlt,
                            border: "none",
                        }}>
                            <ShieldCheck size={20} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: 13.5, color: C.forest, margin: 0, lineHeight: 1.6 }}>
                                Verified credentials reviewed by hospital administration.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ======================= REVIEWS ======================= */}
                <div style={{ ...card, padding: 32, marginTop: 20 }}>

                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 12
                    }}>
                        <div>
                            <h2 style={sectionTitle}>Patient reviews</h2>
                            <p style={{ marginTop: 4, fontSize: 13.5, color: C.muted }}>
                                From patients who completed appointments
                            </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Star size={18} fill={C.terracotta} color={C.terracotta} />
                            <span style={{ fontFamily: FRAUNCES, fontSize: 22, fontWeight: 700, color: C.forest }}>
                                {reviews?.averageRating ?? 0}
                            </span>
                            <span style={{ fontSize: 13.5, color: C.muted }}>
                                ({reviews?.totalReviews ?? 0})
                            </span>
                        </div>
                    </div>

                    <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 18 }}>
                        {reviews?.reviews?.length > 0 ? (
                            reviews.reviews.map((review, index) => (
                                <div
                                    key={index}
                                    style={{
                                        borderTop: index === 0 ? "none" : `1px solid ${C.border}`,
                                        paddingTop: index === 0 ? 0 : 18
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 14.5, color: C.forest, margin: 0 }}>
                                                {review.patientName}
                                            </p>
                                            <p style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <Star size={14} fill={C.terracotta} color={C.terracotta} />
                                            <span style={{ fontWeight: 600, fontSize: 13.5, color: C.forest }}>{review.rating}</span>
                                        </div>
                                    </div>

                                    <p style={{ marginTop: 8, color: C.muted, lineHeight: 1.65, fontSize: 14 }}>
                                        {review.comment}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: "center", padding: "44px 0" }}>
                                <Star size={32} color={C.muted} style={{ margin: "0 auto" }} />
                                <h3 style={{ marginTop: 14, fontFamily: FRAUNCES, fontSize: 16, fontWeight: 600, color: C.forest }}>
                                    No reviews yet
                                </h3>
                                <p style={{ marginTop: 4, color: C.muted, fontSize: 13.5 }}>
                                    Be the first patient to review this doctor
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ======================= CTA ======================= */}
                <div
                    style={{
                        marginTop: 20,
                        borderRadius: 20,
                        background: C.forest,
                        padding: "36px 40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 16
                    }}
                >
                    <div>
                        <h2 style={{ color: "#fff", fontFamily: FRAUNCES, fontSize: 24, fontWeight: 500, margin: 0 }}>
                            Ready to book your appointment?
                        </h2>
                        <p style={{ marginTop: 6, color: "rgba(255,255,255,0.7)", fontSize: 14, maxWidth: 480 }}>
                            Schedule your consultation with this specialist in a few clicks.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate(`/patient/bookdoctor?doctorId=${doctor.id}`)}
                        style={{
                            ...pillButton,
                            background: "#fff",
                            color: C.forest,
                            padding: "13px 30px",
                            whiteSpace: "nowrap",
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = 0.9}
                        onMouseOut={e => e.currentTarget.style.opacity = 1}
                    >
                        Book appointment
                    </button>
                </div>

                {appointment && <AppointmentActions appointment={appointment} />}

            </div>

            <Footer />
        </div>
    );
}