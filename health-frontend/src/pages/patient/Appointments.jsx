import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { Toaster, toast } from "react-hot-toast";
import {
    Calendar, Clock, Search, RefreshCw, ChevronLeft, ChevronRight,
    CheckCircle2, XCircle, AlertCircle, IndianRupee,
    Stethoscope, Building2, MapPin, Hash, Plus, Download,
} from "lucide-react";

/* ─── Tokens ──────────────────────────────────── */
const T = {
    cream: "#F5F0E8",
    creamDark: "#EDE7D9",
    green: "#2D5016",
    greenLight: "#EBF2E3",
    terra: "#C4622D",
    terraLight: "#FAF0EA",
    ink: "#1A1A1A",
    muted: "#6B7280",
    border: "#E2DACE",
    white: "#FFFFFF",
};

const STATUS_CFG = {
    Confirmed: { bg: T.greenLight, text: T.green, border: "#BBD9A0", label: "Confirmed" },
    Pending: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A", label: "Pending" },
    Completed: { bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE", label: "Completed" },
    CancelledByUser: { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA", label: "Cancelled" },
    CancelledByDoctor: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", label: "Doctor Cancelled" },
};

const PAYMENT_CFG = {
    Paid: { bg: T.greenLight, text: T.green },
    Pending: { bg: "#FEF3C7", text: "#D97706" },
    Failed: { bg: "#FEE2E2", text: "#DC2626" },
};

const TABS = ["All", "Confirmed", "Pending", "Completed", "Cancelled"];
const PER_PAGE = 6;

/* ─── Helpers ─────────────────────────────────── */
function fmtDate(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(d) {
    return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/* ─── Skeleton row ────────────────────────────── */
function SkeletonRow() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", animation: "pulse 1.5s infinite" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.creamDark, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div style={{ height: 13, background: T.creamDark, borderRadius: 6, width: "35%", marginBottom: 8 }} />
                <div style={{ height: 11, background: T.creamDark, borderRadius: 6, width: "20%" }} />
            </div>
            <div style={{ height: 24, width: 90, background: T.creamDark, borderRadius: 99 }} />
        </div>
    );
}

/* ─── Confirm Cancel Modal ────────────────────── */
function CancelModal({ open, loading, onClose, onConfirm }) {
    if (!open) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ background: T.white, borderRadius: 20, width: "100%", maxWidth: 420, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <AlertCircle size={26} color="#DC2626" />
                </div>
                <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 22, color: T.ink, margin: "0 0 10px" }}>Cancel Appointment?</h2>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, margin: "0 0 28px" }}>
                    This action cannot be undone. Your advance payment refund depends on the cancellation policy.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={onClose} style={{ flex: 1, height: 46, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.cream, color: T.ink, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                        Keep Appointment
                    </button>
                    <button onClick={onConfirm} disabled={loading} style={{ flex: 1, height: 46, borderRadius: 12, border: "none", background: "#DC2626", color: T.white, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1 }}>
                        {loading ? "Cancelling…" : "Yes, Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Appointment Row ─────────────────────────── */
function AppointmentRow({ appt, onCancel, onDownload, downloadingId, last }) {
    const status = STATUS_CFG[appt.status] || STATUS_CFG.Pending;
    const payment = PAYMENT_CFG[appt.paymentStatus] || PAYMENT_CFG.Pending;
    const initial = (appt.doctorName || "D")[0].toUpperCase();
    const isDownloading = downloadingId === appt.id;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns:
"minmax(180px,2fr) minmax(110px,1fr) minmax(90px,1fr) minmax(90px,1fr) minmax(80px,1fr) minmax(110px,1fr) minmax(170px,1fr)",
                alignItems: "center",
                gap: 16,
                padding: "18px 24px",
                borderBottom: last ? "none" : `1px solid ${T.border}`,
                transition: "background .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.cream; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
            {/* Doctor */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg, ${T.green}, #3D6B1F)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: T.white, fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 16,
                }}>
                    {initial}
                </div>
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: T.ink, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {appt.doctorName}
                    </p>
                    <p style={{ fontSize: 12, color: T.terra, fontWeight: 600, margin: "2px 0 0" }}>{appt.specialization}</p>
                    {(appt.hospital || appt.place) && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                            {appt.hospital ? <Building2 size={11} color={T.muted} /> : <MapPin size={11} color={T.muted} />}
                            <span style={{ fontSize: 11, color: T.muted }}>{appt.hospital || appt.place}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Date */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={13} color={T.green} />
                <span style={{ fontSize: 13, color: T.ink }}>{fmtDate(appt.appointmentDate)}</span>
            </div>

            {/* Time */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={13} color={T.green} />
                <span style={{ fontSize: 13, color: T.ink }}>{fmtTime(appt.appointmentTime)}</span>
            </div>

            {/* Payment */}
            <span style={{
                padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: payment.bg, color: payment.text, width: "fit-content",
            }}>
                {appt.paymentStatus}
            </span>

            {/* Advance */}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IndianRupee size={13} color={T.green} />
                <span style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 15, color: T.green }}>{appt.advanceAmount}</span>
            </div>

            {/* Status */}
            <span style={{
                display: "inline-flex", padding: "5px 12px", borderRadius: 99,
                fontSize: 11, fontWeight: 700, background: status.bg, color: status.text,
                border: `1px solid ${status.border}`, width: "fit-content",
            }}>
                {status.label}
            </span>

            {/* Actions */}
{/* Prescription */}
<div style={{ justifySelf: "center" }}>
    {appt.status === "Completed" ? (
        <button
            onClick={() => onDownload(appt.id)}
            disabled={isDownloading}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                border: "none",
                borderRadius: 10,
                background: T.greenLight,
                color: T.green,
                fontWeight: 700,
                fontSize: 12,
                cursor: isDownloading ? "not-allowed" : "pointer",
                opacity: isDownloading ? 0.7 : 1,
            }}
        >
            {isDownloading ? (
                <>
                    <RefreshCw
                        size={14}
                        style={{ animation: "spin 1s linear infinite" }}
                    />
                    Downloading...
                </>
            ) : (
                <>
                    <Download size={14} />
                    Download Prescription
                </>
            )}
        </button>
    ) : (
        <span style={{ color: T.muted, fontSize: 12 }}>—</span>
    )}
</div>
        </div>
    );
}

function iconBtnStyle(bg, fg) {
    return {
        width: 34, height: 34, borderRadius: 10, border: "none", background: bg, color: fg,
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    };
}

/* ─── Stat Column ─────────────────────────────── */
function StatColumn({ label, value, accent, last }) {
    return (
        <div style={{
            flex: 1, minWidth: 110, padding: "20px 24px",
            borderRight: last ? "none" : `1px solid ${T.border}`,
        }}>
            <p style={{ fontSize: 12, color: T.muted, margin: "0 0 6px", fontWeight: 500 }}>{label}</p>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 26, color: accent || T.ink, margin: 0 }}>{value}</h3>
        </div>
    );
}

/* ─── Main ────────────────────────────────────── */
export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("All");
    const [sortBy, setSort] = useState("Newest");
    const [page, setPage] = useState(1);
    const [cancelId, setCancelId] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    async function load() {
        try {
            setLoading(true);
            setError("");
            const res = await api.get("/patient/appointments");
            setAppointments(res.data || []);
        } catch {
            setError("Unable to load appointments.");
            toast.error("Failed to load appointments.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function cancelAppointment() {
        try {
            setCancelLoading(true);
            await api.put(`/patient/appointment/cancel/${cancelId}`);
            toast.success("Appointment cancelled.");
            setAppointments(p => p.map(a => a.id === cancelId ? { ...a, status: "CancelledByUser" } : a));
            setCancelId(null);
        } catch {
            toast.error("Unable to cancel.");
        } finally {
            setCancelLoading(false);
        }
    }

    async function downloadPrescription(appointmentId) {
        try {
            setDownloadingId(appointmentId);
            const res = await api.get(`/patient/prescriptions/${appointmentId}/pdf`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `CareConnect_Prescription_${appointmentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            if (err?.response?.status === 404) {
                toast.error("Prescription not available yet.");
            } else {
                toast.error("Failed to download prescription.");
            }
        } finally {
            setDownloadingId(null);
        }
    }

    const filtered = useMemo(() => {
        let d = [...appointments];
        if (search) d = d.filter(a => (a.doctorName || "").toLowerCase().includes(search.toLowerCase()));
        if (statusFilter !== "All") {
            if (statusFilter === "Cancelled") d = d.filter(a => a.status.includes("Cancelled"));
            else d = d.filter(a => a.status === statusFilter);
        }
        d.sort((a, b) => sortBy === "Newest"
            ? new Date(b.bookedAt) - new Date(a.bookedAt)
            : new Date(a.bookedAt) - new Date(b.bookedAt));
        return d;
    }, [appointments, search, statusFilter, sortBy]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
    const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const stats = {
        total: appointments.length,
        confirmed: appointments.filter(a => a.status === "Confirmed").length,
        pending: appointments.filter(a => a.status === "Pending").length,
        completed: appointments.filter(a => a.status === "Completed").length,
        totalPaid: appointments.reduce((s, a) => s + (a.advanceAmount || 0), 0),
    };

    return (
        <>
            <Toaster position="top-right" />
            <CancelModal open={cancelId !== null} loading={cancelLoading} onClose={() => setCancelId(null)} onConfirm={cancelAppointment} />

            <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "Inter, sans-serif", color: T.ink }}>
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,600&family=Inter:wght@400;500;600;700&display=swap');
          *{box-sizing:border-box;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
          @keyframes spin{to{transform:rotate(360deg)}}
          ::-webkit-scrollbar{width:5px;height:5px;}
          ::-webkit-scrollbar-thumb{background:${T.border};border-radius:99px;}
          .appt-tab{position:relative; background:none; border:none; padding:10px 4px; font-size:14px; font-weight:600; cursor:pointer; color:${T.muted};}
          .appt-tab.active{color:${T.ink};}
          .appt-tab.active::after{content:""; position:absolute; left:0; right:0; bottom:-1px; height:2px; background:${T.ink};}
        `}</style>

                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px" }}>

                    {/* ── Editorial header ── */}
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 32 }}>
                        <h1
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="leading-[1.05] tracking-tight"
                        >
                            <span style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", color: T.green }}>
                                Every visit,
                            </span>
                            <br />
                            <span
                                className="italic text-[#B5562C]"
                                style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
                            >
                                organized in one place.
                            </span>
                        </h1>


                        <a href="/patient/doctors" style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "13px 22px",
                            borderRadius: 99, background: T.ink, color: T.white,
                            fontWeight: 700, fontSize: 14, textDecoration: "none", flexShrink: 0,
                        }}>
                            <Plus size={16} /> Book Appointment
                        </a>
                    </div>

                    {/* ── Unified stats card ── */}
                    <div style={{
                        background: T.white, borderRadius: 20, border: `1px solid ${T.border}`,
                        display: "flex", flexWrap: "wrap", marginBottom: 20, overflow: "hidden",
                    }}>
                        <StatColumn label="Total" value={stats.total} />
                        <StatColumn label="Confirmed" value={stats.confirmed} accent={T.green} />
                        <StatColumn label="Pending" value={stats.pending} accent="#D97706" />
                        <StatColumn label="Completed" value={stats.completed} accent="#1D4ED8" />
                        <StatColumn label="Total Paid" value={`₹${stats.totalPaid}`} accent={T.terra} last />
                    </div>

                    {/* ── Search / sort / tabs card ── */}
                    <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, marginBottom: 20, overflow: "hidden" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "18px 24px 14px", borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
                            {TABS.map(tab => (
                                <button
                                    key={tab}
                                    className={`appt-tab${statusFilter === tab ? " active" : ""}`}
                                    onClick={() => { setStatus(tab); setPage(1); }}
                                    style={{ marginRight: 18 }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div style={{ position: "relative", padding: "18px 24px", display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                                <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
                                <input
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search by doctor name…"
                                    style={{ width: "100%", height: 44, borderRadius: 12, border: `1.5px solid ${T.border}`, paddingLeft: 38, paddingRight: 14, fontSize: 14, outline: "none", background: T.cream, color: T.ink }}
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={e => setSort(e.target.value)}
                                style={{ height: 44, borderRadius: 12, border: `1.5px solid ${T.border}`, padding: "0 14px", fontSize: 13, background: T.cream, color: T.ink, cursor: "pointer" }}
                            >
                                <option>Newest</option>
                                <option>Oldest</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 20 }}>
                            <p style={{ color: "#DC2626", fontWeight: 700, fontSize: 16, margin: "0 0 12px" }}>{error}</p>
                            <button onClick={load} style={{ background: "#DC2626", color: T.white, border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
                        </div>
                    )}

                    {/* ── List card ── */}
                    {!error && (
                        <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, overflow: "hidden" }}>
                            {/* Column headers — desktop only */}
                            {!loading && current.length > 0 && (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns:
"minmax(180px,2fr) minmax(110px,1fr) minmax(90px,1fr) minmax(90px,1fr) minmax(80px,1fr) minmax(110px,1fr) minmax(170px,1fr)",
                                    gap: 16, padding: "14px 24px", borderBottom: `1px solid ${T.border}`,
                                }}>
                                    {["Doctor", "Date", "Time", "Payment", "Advance", "Status", "Prescription"].map((h, i) => (
                                        <span key={i} style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .5 }}>
                                            {h}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

                            {!loading && current.map((a, i) => (
                                <AppointmentRow
                                    key={a.id}
                                    appt={a}
                                    onCancel={setCancelId}
                                    onDownload={downloadPrescription}
                                    downloadingId={downloadingId}
                                    last={i === current.length - 1}
                                />
                            ))}

                            {!loading && current.length === 0 && (
                                <div style={{ padding: "64px 24px", textAlign: "center" }}>
                                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: T.creamDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                                        <Calendar size={32} color={T.muted} />
                                    </div>
                                    <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 22, color: T.ink, margin: "0 0 8px" }}>No Appointments Found</h2>
                                    <p style={{ fontSize: 14, color: T.muted, margin: "0 0 24px", maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
                                        We couldn't find any appointments matching your search or filter.
                                    </p>
                                    <a href="/patient/doctors" style={{
                                        display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px",
                                        borderRadius: 99, background: T.ink, color: T.white, fontWeight: 700, fontSize: 13, textDecoration: "none",
                                    }}>
                                        <Plus size={14} /> Book an Appointment
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Pagination ── */}
                    {!loading && totalPages > 1 && current.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 28 }}>
                            <PaginationBtn onClick={() => setPage(p => p - 1)} disabled={page === 1} icon={<ChevronLeft size={16} />} />
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button key={n} onClick={() => setPage(n)} style={{
                                    width: 38, height: 38, borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
                                    background: page === n ? T.ink : T.white, color: page === n ? T.white : T.ink,
                                    border: page === n ? "none" : `1.5px solid ${T.border}`,
                                }}>{n}</button>
                            ))}
                            <PaginationBtn onClick={() => setPage(p => p + 1)} disabled={page === totalPages} icon={<ChevronRight size={16} />} />
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}

function PaginationBtn({ onClick, disabled, icon }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${T.border}`,
            background: T.white, cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? .4 : 1, display: "flex", alignItems: "center", justifyContent: "center",
            color: T.ink,
        }}>
            {icon}
        </button>
    );
}