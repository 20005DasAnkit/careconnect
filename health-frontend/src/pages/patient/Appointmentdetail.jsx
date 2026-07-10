import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { Toaster, toast } from "react-hot-toast";
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Building2,
    IndianRupee,
    Phone,
    Download,
    Receipt,
    XCircle,
    Star,
    AlertCircle,
    RefreshCw,
    X,
    CheckCircle2,
    CircleDot,
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

const STATUS_CFG = {
    Confirmed: {
        bg: T.greenLight,
        text: T.green,
        border: "#BBD9A0",
        label: "Confirmed",
        step: 1
    },

    Pending: {
        bg: "#FEF3C7",
        text: "#D97706",
        border: "#FDE68A",
        label: "Pending",
        step: 0
    },

    Completed: {
        bg: "#DBEAFE",
        text: "#1D4ED8",
        border: "#BFDBFE",
        label: "Completed",
        step: 2
    },

    CancelledByUser: {
        bg: "#FEE2E2",
        text: "#DC2626",
        border: "#FECACA",
        label: "Cancelled",
        step: -1
    },

    CancelledByDoctor: {
        bg: "#FFF7ED",
        text: "#C2410C",
        border: "#FED7AA",
        label: "Doctor Cancelled",
        step: -1
    },

    NotVisited: {
        bg: "#FEF3C7",
        text: "#92400E",
        border: "#FCD34D",
        label: "Not Visited",
        step: -1
    },
};

const PAYMENT_CFG = {
    Paid: { bg: T.greenLight, text: T.green },
    Pending: { bg: "#FEF3C7", text: "#D97706" },
    Failed: { bg: "#FEE2E2", text: "#DC2626" },
    Cash: { bg: T.creamDark, text: T.ink },
    Wallet: { bg: T.greenLight, text: T.green },
};

function fmtDate(d) {
    return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateShort(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
function fmtTime(d) {
    return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/* ─── Modal shell ───────────────────────────────── */
function ModalShell({ open, onClose, children, maxWidth = 420 }) {
    if (!open) return null;
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(22,51,43,.5)",
                backdropFilter: "blur(2px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: T.white,
                    borderRadius: 24,
                    width: "100%",
                    maxWidth,
                    padding: 32,
                    boxShadow: "0 24px 70px rgba(22,51,43,.25)",
                    position: "relative",
                }}
            >
                {children}
            </div>
        </div>
    );
}

/* ─── Cancel confirm modal ─────────────────────── */
function CancelModal({ open, loading, onClose, onConfirm }) {
    return (
        <ModalShell open={open} onClose={onClose}>
            <div
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#FEE2E2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20
                }}>

                <AlertCircle size={26} color="#DC2626" />
            </div>
            <h2
                style={{
                    fontFamily: "Fraunces, serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: T.ink,
                    margin: "0 0 10px"
                }}>
                Cancel Appointment?
            </h2>
            <p
                style={{
                    fontSize: 14,
                    color: T.muted,
                    lineHeight: 1.6,
                    margin: "0 0 28px"
                }}>
                This action cannot be undone. If cancelled at least 1 hour before your visit, 50% of the advance is credited to your CareConnect wallet as a refund balance for your next booking.
            </p>
            <div
                style={{ display: "flex", gap: 12 }}>
                <button
                    onClick={onClose}
                    style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 99,
                        border: `1.5px solid ${T.border}`,
                        background: T.cream,
                        color: T.ink,
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer"
                    }}>
                    Keep Appointment
                </button>

                <button
                    onClick={onConfirm}
                    disabled={loading}
                    style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 99,
                        border: "none",
                        background: "#DC2626",
                        color: T.white,
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8
                    }}>
                    {loading ? (<><RefreshCw size={14}
                        style={{
                            animation: "spin 1s linear infinite"
                        }} />Cancelling…</>) : "Yes, Cancel"}
                </button>
            </div>
        </ModalShell>
    );
}

/* ─── Review modal ─────────────────────────────── */
function ReviewModal(
    { open,
        doctorName,
        rating,
        comment,
        loading,
        onClose,
        onRatingChange,
        onCommentChange,
        onSubmit
    }) {
    return (
        <ModalShell open={open} onClose={onClose} maxWidth={440}>
            <button
                onClick={onClose}
                style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "none",
                    background: T.cream,
                    color: T.muted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                }}>
                <X size={16} />
            </button>
            <div
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#FFF7D6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20
                }}>
                <Star size={26} color="#B7791F" />
            </div>
            <h2
                style={{
                    fontFamily: "Fraunces, serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: T.ink,
                    margin: "0 0 4px"
                }}>
                Rate Your Visit
            </h2>
            <p
                style={{
                    fontSize: 14,
                    color: T.muted,
                    margin: "0 0 20px"
                }}>
                How was your appointment with
                <strong
                    style={{ color: T.ink }}>{doctorName}</strong>?
            </p>
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 20
                }}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        onClick={() => onRatingChange(n)}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 4
                        }}>
                        <Star
                            size={30}
                            color={n <= rating ? "#F4B400" : T.border}
                            fill={n <= rating ? "#F4B400" : "none"}
                        />
                    </button>
                ))}
            </div>
            <textarea
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                placeholder="Share a few words about your experience (optional)"
                rows={4}
                style={{
                    width: "100%",
                    borderRadius: 14,
                    border: `1.5px solid ${T.border}`,
                    padding: "12px 14px",
                    fontSize: 14,
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    resize: "none",
                    background: T.cream,
                    color: T.ink, marginBottom: 24
                }}
            />
            <div style={{ display: "flex", gap: 12 }}>
                <button
                    onClick={onClose}
                    style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 99,
                        border: `1.5px solid ${T.border}`,
                        background: T.cream,
                        color: T.ink,
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer"
                    }}>
                    Cancel
                </button>
                <button
                    onClick={onSubmit}
                    disabled={loading}
                    style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 99,
                        border: "none",
                        background: T.green,
                        color: T.white,
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center", gap: 8
                    }}>
                    {loading ? (<><RefreshCw
                        size={14}
                        style={{ animation: "spin 1s linear infinite" }} />
                        Submitting…</>) : "Submit Review"}
                </button>
            </div>
        </ModalShell>
    );
}

/* ─── Sticky action button (right rail) ─────────── */
function RailButton(
    { icon,
        label,
        loadingLabel,
        loading,
        onClick,
        variant = "default",
        disabled
    }) {
    const variants = {
        default: { bg: T.white, fg: T.ink, border: T.border },
        primary: { bg: T.green, fg: T.white, border: T.green },
        soft: { bg: T.greenLight, fg: T.green, border: "transparent" },
        warn: { bg: T.white, fg: "#DC2626", border: "#F3C6C6" },
        gold: { bg: "#FFF7D6", fg: "#B7791F", border: "transparent" },
    };
    const v = variants[variant];
    return (
        <button
            onClick={onClick}
            disabled={loading || disabled}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 16px",
                border: `1.5px solid ${v.border}`,
                borderRadius: 14,
                background: v.bg,
                color: v.fg,
                fontWeight: 600,
                fontSize: 14,
                cursor: loading || disabled ? "not-allowed" : "pointer",
                opacity: loading || disabled ? 0.6 : 1,
                width: "100%",
                textAlign: "left",
                transition: "transform .15s ease",
            }}
            onMouseEnter={(e) => { if (!loading && !disabled) e.currentTarget.style.transform = "translateX(2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; }}
        >
            {loading ?
                <RefreshCw
                    size={16}
                    style={{
                        animation: "spin 1s linear infinite",
                        flexShrink: 0
                    }} /> :
                <span
                    style={{
                        flexShrink: 0,
                        display: "flex"
                    }}>{icon}
                </span>}
            <span
                style={{ flex: 1 }}>
                {loading
                    ? loadingLabel
                    : label
                }
            </span>
        </button>
    );
}

/* ─── Status timeline ───────────────────────────── */
function StatusTimeline({ status }) {
    const cfg = STATUS_CFG[status] || STATUS_CFG.Pending;
    if (cfg.step === -1) return null;

    const steps = ["Booked", "Confirmed", "Completed"];
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginTop: 24
            }}>
            {steps.map((s, i) => {
                const active = i <= cfg.step;
                return (
                    <div key={s}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            flex: i < steps.length - 1 ? 1 : "unset"
                        }}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 6
                            }}>
                            <div style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: active ? T.green : T.border,
                                boxShadow: active ? `0 0 0 4px ${T.greenLight}` : "none",
                            }} />
                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: active ? T.green : T.muted,
                                    whiteSpace: "nowrap"
                                }}>
                                {s}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                style={{
                                    flex: 1,
                                    height: 2,
                                    background: i < cfg.step ? T.green : T.border,
                                    margin: "0 8px 18px"
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ─── Hero stat chip ─────────────────────────────── */
function HeroStat({ icon, label, value }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.14)",
                borderRadius: 16,
                padding: "13px 18px",
                backdropFilter: "blur(8px)",
            }}>
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: "rgba(232,169,124,.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                }}>
                {icon}
            </div>
            <div>
                <p
                    style={{
                        margin: 0,
                        fontSize: 10.5,
                        color: "rgba(255,255,255,.55)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.6
                    }}>
                    {label}
                </p>
                <p
                    style={{
                        margin: "2px 0 0",
                        fontSize: 15,
                        color: "#fff",
                        fontWeight: 700
                    }}>
                    {value}
                </p>
            </div>
        </div>
    );
}

/* ─── Detail row ─────────────────────────────────── */
function DetailRow({ icon, label, value, last }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 0",
                borderBottom: last ? "none" : `1px solid ${T.border}`
            }}>
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: T.greenLight,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                {icon}
            </div>
            <div
                style={{ flex: 1, minWidth: 0 }}>
                <p
                    style={{
                        fontSize: 12,
                        color: T.muted,
                        margin: 0,
                        fontWeight: 500
                    }}>{label}
                </p>
                <p
                    style={{
                        fontSize: 15,
                        fontWeight: 600,
                        margin: "2px 0 0",
                        color: T.ink
                    }}>{value}
                </p>
            </div>
        </div>
    );
}

/* ─── Main ────────────────────────────────────── */
export default function AppointmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const passedAppt = location.state?.appt || null;

    const [appt, setAppt] = useState(passedAppt);
    const [loading, setLoading] = useState(!passedAppt);
    const [error, setError] = useState("");

    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const [reviewOpen, setReviewOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);

    const [downloadingRx, setDownloadingRx] = useState(false);
    const [downloadingBill, setDownloadingBill] = useState(false);

    useEffect(() => {
        loadAppointment();
    }, [id]);

    async function loadAppointment() {
        try {
            setLoading(true);
            setError("");

            const res = await api.get(`/patient/appointment/${id}`);

            setAppt(prev => ({
                ...(prev || {}),
                ...res.data
            }));

        } catch (err) {
            console.error(err);
            setError("Unable to load appointment.");
        } finally {
            setLoading(false);
        }
    }

    async function cancelAppointment() {
        try {
            setCancelLoading(true);
            const res = await api.put(`/patient/appointment/cancel/${id}`);
            const refund = res?.data?.refund ?? res?.data?.Refund ?? 0;
            toast.success(refund > 0
                ? `Appointment cancelled. ₹${refund} credited to your wallet.`
                : "Appointment cancelled.");
            setAppt((prev) => ({ ...prev, status: "CancelledByUser" }));
            setCancelOpen(false);
        } catch {
            toast.error("Unable to cancel.");
        } finally {
            setCancelLoading(false);
        }
    }

    async function submitReview() {
        try {
            setReviewLoading(true);
            await api.post("/patient/review", { appointmentId: appt.id, rating, comment });
            toast.success("Review submitted");
            setAppt((prev) => ({ ...prev, isReviewed: true }));
            setReviewOpen(false);
            setRating(5);
            setComment("");
        } catch (err) {
            toast.error(err?.response?.data || "Unable to submit review.");
        } finally {
            setReviewLoading(false);
        }
    }

    async function downloadPdf(url, filename, setDownloading, notReadyMsg) {
        try {
            setDownloading(true);
            const res = await api.get(url, { responseType: "blob" });
            const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);

        } catch (err) {
            if (err?.response?.status === 404) toast.error(notReadyMsg || "Not available yet.");
            else if (err?.response?.status === 400) toast.error(err?.response?.data?.message || "Not available yet.");
            else toast.error("Failed to download.");

        } finally {
            setDownloading(false);
        }
    }

    /* ── Loading state ── */
    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: T.cream,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Inter, sans-serif",
                    gap: 16
                }}>
                <style>
                    {`@keyframes spin{to{transform:rotate(360deg)}}`}
                </style>
                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        border: `3px solid ${T.border}`,
                        borderTopColor: T.green,
                        animation: "spin 0.9s linear infinite"
                    }} />
                <div
                    style={{
                        color: T.green,
                        fontWeight: 600,
                        fontSize: 14
                    }}>
                    Loading appointment…
                </div>
            </div>
        );
    }

    /* ── Error / not found state ── */
    if (error || !appt) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: T.cream,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Inter, sans-serif",
                    gap: 20,
                    padding: 24,
                    textAlign: "center"
                }}>
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "#FEE2E2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                    <AlertCircle size={30} color="#DC2626" />
                </div>

                <div>
                    <h2
                        style={{
                            fontFamily: "Fraunces, serif",
                            fontSize: 20,
                            fontWeight: 700,
                            color: T.ink,
                            margin: "0 0 6px"
                        }}>Something went wrong
                    </h2>

                    <p
                        style={{
                            color: T.muted,
                            fontSize: 14,
                            margin: 0
                        }}>
                        {error || "Appointment not found."}
                    </p>
                </div>
                <button
                    onClick={() => navigate("/patient/appointments")}
                    style={{
                        background: T.green,
                        color: T.white,
                        border: "none",
                        borderRadius: 99,
                        padding: "13px 28px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                    }}>
                    <ArrowLeft size={16} /> Back to Appointments
                </button>
            </div>
        );
    }

    const status = STATUS_CFG[appt.status] || STATUS_CFG.Pending;
    const payment = PAYMENT_CFG[appt.paymentStatus] || PAYMENT_CFG.Pending;
    const canBill = appt.status === "Confirmed" || appt.status === "Completed";
    const canCall = appt.status === "Confirmed" && !!appt.doctorPhone;
    const canRate = appt.status === "Completed" && !appt.isReviewed;
    const canCancel = appt.status === "Confirmed";

    return (
        <>
            <Toaster position="top-right" />
            <CancelModal
                open={cancelOpen}
                loading={cancelLoading}
                onClose={() => setCancelOpen(false)}
                onConfirm={cancelAppointment}
            />
            <ReviewModal
                open={reviewOpen}
                doctorName={appt.doctorName}
                rating={rating}
                comment={comment}
                loading={reviewLoading}
                onClose={() => setReviewOpen(false)}
                onRatingChange={setRating}
                onCommentChange={setComment}
                onSubmit={submitReview}
            />

            <div
                style={{
                    minHeight: "100vh",
                    background: T.cream,
                    fontFamily: "Inter, sans-serif",
                    color: T.ink
                }}>
                <style>{`
                  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,600&family=Inter:wght@400;500;600;700&display=swap');
                  *{box-sizing:border-box;}
                  @keyframes spin{to{transform:rotate(360deg)}}
                `}</style>

                {/* ── Dark hero band ── */}
                <div
                    style={{
                        background: `radial-gradient(ellipse 900px 500px at 80% 20%, rgba(181,86,44,.16), transparent), linear-gradient(160deg, ${T.green}, #0F221C)`,
                        position: "relative",
                        overflow: "hidden"
                    }}>
                    <div
                        style={{
                            position: "absolute",
                            top: "-10%",
                            right: "8%",
                            width: 360,
                            height: 360,
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(181,86,44,.18), transparent 70%)",
                            pointerEvents: "none",
                        }}
                    />
                    <div
                        className="w-full px-6 lg:px-16 xl:px-24 2xl:px-32"
                        style={{
                            position: "relative",
                            paddingTop: 60,
                            paddingBottom: 64
                        }}>
                        {/* <button
                            onClick={() => navigate("/patient/appointments")}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.65)", fontWeight: 600, fontSize: 13.5, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 28 }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.65)")}
                        >
                            <ArrowLeft size={15} /> Appointments
                        </button> */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                flexWrap: "wrap",
                                gap: 24
                            }}>
                            <div>
                                <p
                                    style={{
                                        color: "#E8A97C",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                        letterSpacing: 1.5,
                                        margin: "0 0 14px"
                                    }}>
                                    Booking #{appt.id}
                                </p>
                                <h1
                                    style={{
                                        fontFamily: "Fraunces, serif",
                                        fontWeight: 700,
                                        fontSize: "clamp(30px, 4.2vw, 46px)",
                                        color: "#fff",
                                        margin: 0,
                                        lineHeight: 1.08,
                                        maxWidth: 640
                                    }}>
                                    {appt.doctorName}
                                </h1>
                                <p
                                    style={{
                                        margin: "14px 0 0",
                                        color: "rgba(255,255,255,.72)",
                                        fontSize: 15.5,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 18,
                                        flexWrap: "wrap"
                                    }}>
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6,
                                            color: "#E8A97C",
                                            fontWeight: 600
                                        }}>
                                        {appt.specialization}
                                    </span>
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6
                                        }}>
                                        <Building2 size={14} /> {appt.hospital}
                                    </span>
                                </p>
                            </div>

                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 7,
                                    padding: "9px 18px",
                                    borderRadius: 99,
                                    fontSize: 12.5,
                                    fontWeight: 700,
                                    background: "rgba(255,255,255,.1)",
                                    color: "#fff",
                                    border: "1px solid rgba(255,255,255,.22)",
                                    backdropFilter: "blur(6px)"
                                }}>
                                {appt.status === "Completed" && <CheckCircle2 size={13} />}
                                {status.label}
                            </span>
                        </div>

                        {/* floating stat chips */}
                        <div
                            style={{
                                display: "flex",
                                gap: 14,
                                marginTop: 40,
                                flexWrap: "wrap"
                            }}>
                            <HeroStat
                                icon={<Calendar size={16} color="#E8A97C" />}
                                label="Date" value={fmtDateShort(appt.appointmentDate)}
                            />
                            <HeroStat
                                icon={<Clock size={16} color="#E8A97C" />}
                                label="Time" value={fmtTime(appt.appointmentTime)}
                            />
                            <HeroStat
                                icon={<IndianRupee size={16} color="#E8A97C" />}
                                label="Fee" value={`₹${appt.doctorFee}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full px-6 lg:px-16 xl:px-24 2xl:px-32"
                    style={{
                        paddingTop: 40,
                        paddingBottom: 72,
                        marginTop: 40
                    }}>

                    {/* ── Two-column layout ── */}
                    <div
                        style={{
                            alignSelf: "start",
                        }}
                    >
                        <style>{`
                          @media (max-width: 860px) {
                            .appt-detail-grid { grid-template-columns: 1fr !important; }
                          }
                        `}</style>

                        {/* Left: details */}
                        <div>
                            <div
                                style={{
                                    background: T.white,
                                    borderRadius: 20,
                                    border: `1px solid ${T.border}`,
                                    padding: "8px 28px"
                                }}>
                                <div
                                    style={{ paddingTop: 8 }}>
                                    <h3
                                        style={{
                                            fontFamily: "Fraunces, serif",
                                            fontWeight: 700,
                                            fontSize: 15,
                                            color: T.ink,
                                            margin: "16px 0 0"
                                        }}>
                                        Visit Details
                                    </h3>
                                </div>
                                <DetailRow
                                    icon={<Calendar size={16} color={T.green} />}
                                    label="Full Date"
                                    value={fmtDate(appt.appointmentDate)}
                                />
                                <DetailRow
                                    icon={<MapPin size={16} color={T.green} />}
                                    label="Place to Visit" value={appt.placeToVisit}
                                />
                                <div
                                    style={{
                                        padding: "18px 0",
                                        borderTop: `1px solid ${T.border}`
                                    }}
                                >
                                    <h4
                                        style={{
                                            margin: "0 0 16px",
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: T.green
                                        }}
                                    >
                                        Payment Summary
                                    </h4>

                                    <PaymentRow
                                        title="Doctor Fee"
                                        value={appt.doctorFee}
                                    />

                                    <PaymentRow
                                        title="Paid Online"
                                        value={appt.paidOnline}
                                    />

                                    {appt.status === "CancelledByUser" && (
                                        <>
                                            <PaymentRow
                                                title="Refund"
                                                value={appt.refundAmount}
                                                color="#16A34A"
                                            />

                                            <PaymentRow
                                                title="Final Paid"
                                                value={appt.finalPaid}
                                                bold
                                            />
                                        </>
                                    )}

                                    {appt.status === "NotVisited" && (
                                        <>
                                            <PaymentRow
                                                title="Refund"
                                                value={0}
                                            />

                                            <PaymentRow
                                                title="Outstanding"
                                                value={appt.remainingAmount}
                                                color="#D97706"
                                                bold
                                            />
                                        </>
                                    )}

                                    {appt.status === "Completed" && (
                                        <>
                                            <PaymentRow
                                                title="Paid at Hospital"
                                                value={appt.remainingAmount}
                                            />

                                            <PaymentRow
                                                title="Total Paid"
                                                value={appt.doctorFee}
                                                bold
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                            {status.step >= 0 && (
                                <div
                                    style={{
                                        background: T.white,
                                        borderRadius: 20,
                                        border: `1px solid ${T.border}`,
                                        padding: "24px 28px",
                                        marginTop: 20
                                    }}>
                                    <h3
                                        style={{
                                            fontFamily: "Fraunces, serif",
                                            fontWeight: 700,
                                            fontSize: 15,
                                            color: T.ink,
                                            margin: 0
                                        }}>
                                        Booking Progress
                                    </h3>
                                    <StatusTimeline status={appt.status} />
                                </div>
                            )}

                            {appt.status === "CancelledByUser" || appt.status === "CancelledByDoctor" ? (
                                <div
                                    style={{
                                        background: T.terraLight,
                                        borderRadius: 20,
                                        border: `1px solid #F0D9C8`,
                                        padding: "20px 24px",
                                        marginTop: 20,
                                        display: "flex",
                                        gap: 12,
                                        alignItems: "flex-start"
                                    }}>
                                    <CircleDot size={18} color={T.terra} style={{ flexShrink: 0, marginTop: 2 }} />
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: 13.5,
                                            color: T.ink,
                                            lineHeight: 1.6
                                        }}>
                                        This appointment was
                                        {appt.status === "CancelledByUser"
                                            ? "cancelled by you"
                                            : "cancelled by the doctor"
                                        }. {appt.status === "CancelledByUser"
                                            ? "Any eligible refund has been credited to your wallet."
                                            : "You may rebook with another available slot."}
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        {/* Right: sticky action rail */}
                        <div>
                            <div
                                style={{
                                    background: T.white,
                                    borderRadius: 20,
                                    border: `1px solid ${T.border}`,
                                    padding: 24
                                }}>
                                <h3
                                    style={{
                                        fontFamily: "Fraunces, serif",
                                        fontWeight: 700,
                                        fontSize: 15,
                                        color: T.ink,
                                        margin: "0 0 4px"
                                    }}>
                                    Manage Booking
                                </h3>
                                <p
                                    style={{
                                        fontSize: 12.5,
                                        color: T.muted,
                                        margin: "0 0 18px"
                                    }}>
                                    Actions available for this appointment.
                                </p>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 10
                                    }}>
                                    {canCall && (
                                        <a
                                            href={`tel:${appt.doctorPhone}`}
                                            style={{ textDecoration: "none" }}>
                                            <RailButton
                                                icon={<Phone size={16} />}
                                                label="Call Doctor"
                                                variant="soft"
                                            />
                                        </a>
                                    )}

                                    {canBill && (
                                        <RailButton
                                            icon={<Receipt size={16} />}
                                            label="Download Bill"
                                            loadingLabel="Downloading…"
                                            loading={downloadingBill}
                                            onClick={() => downloadPdf(`/patient/appointments/${appt.id}/bill/pdf`,
                                                `CareConnect_Bill_${appt.id}.pdf`,
                                                setDownloadingBill,
                                                "Bill not available yet.")
                                            }
                                        />
                                    )}

                                    {appt.status === "Completed" && (
                                        <RailButton
                                            icon={<Download size={16} />}
                                            label="Download Prescription"
                                            loadingLabel="Downloading…"
                                            loading={downloadingRx}
                                            onClick={() => downloadPdf(`/patient/prescriptions/${appt.id}/pdf`,
                                                `CareConnect_Prescription_${appt.id}.pdf`,
                                                setDownloadingRx,
                                                "Prescription not available yet.")
                                            }
                                        />
                                    )}

                                    {canRate && (
                                        <RailButton
                                            icon={<Star size={16} />}
                                            label="Rate Doctor"
                                            variant="gold"
                                            onClick={() => setReviewOpen(true)}
                                        />
                                    )}

                                    {appt.isReviewed && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 6,
                                                padding: "13px 16px",
                                                borderRadius: 14,
                                                background: T.greenLight,
                                                color: "#15803D",
                                                fontWeight: 700,
                                                fontSize: 13.5
                                            }}>
                                            <Star size={14} fill="#15803D" /> Reviewed
                                        </div>
                                    )}

                                    {canCancel && (
                                        <RailButton
                                            icon={<XCircle size={16} />}
                                            label="Cancel Appointment"
                                            variant="warn"
                                            onClick={() => setCancelOpen(true)}
                                        />
                                    )}

                                    {!canCall && !canBill && appt.status !== "Completed" && !canCancel && (
                                        <div
                                            style={{
                                                textAlign: "center",
                                                padding: "20px 12px",
                                                color: T.muted,
                                                fontSize: 13,
                                                background: T.cream,
                                                borderRadius: 14,
                                                border: `1px dashed ${T.border}`
                                            }}>
                                            No actions available right now.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
function PaymentRow({
    title,
    value,
    color = "#16332B",
    bold = false
}) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12
            }}
        >
            <span
                style={{
                    color: "#6B7280"
                }}
            >
                {title}
            </span>

            <span
                style={{
                    color,
                    fontWeight: bold ? 700 : 600
                }}
            >
                ₹{value}
            </span>
        </div>
    );
}