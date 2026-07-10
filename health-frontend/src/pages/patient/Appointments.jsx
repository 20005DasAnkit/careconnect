import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import {
    Calendar, Clock, Search, RefreshCw, ChevronLeft, ChevronRight,
    IndianRupee, Building2, MapPin, Plus, ChevronRight as ChevronArrow,
    CalendarCheck, Hourglass, CheckCircle2, Wallet,
} from "lucide-react";
import Footer from "../../components/Footer";

/* ─── Tokens (aligned with CareConnect design system) ─── */
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
    Confirmed: { bg: T.greenLight, text: T.green, border: "#BBD9A0", label: "Confirmed" },
    Pending: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A", label: "Pending" },
    Completed: { bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE", label: "Completed" },
    CancelledByUser: { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA", label: "Cancelled" },
    CancelledByDoctor: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", label: "Doctor Cancelled" },
    NotVisited: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D", label: "Not Visited" },
};

const PAYMENT_CFG = {
    Paid: { bg: T.greenLight, text: T.green },
    Pending: { bg: "#FEF3C7", text: "#D97706" },
    Failed: { bg: "#FEE2E2", text: "#DC2626" },
    Cash: { bg: T.creamDark, text: T.ink },
    Wallet: { bg: T.greenLight, text: T.green },
};

const TABS = ["All", "Confirmed", "Pending", "Completed", "NotVisited", "Cancelled"];
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

/* ─── Appointment Row (click anywhere → detail page) ─── */
function AppointmentRow({ appt, navigate, last }) {
    const status = STATUS_CFG[appt.status] || STATUS_CFG.Pending;
    const payment = PAYMENT_CFG[appt.paymentStatus] || PAYMENT_CFG.Pending;
    const initial = (appt.doctorName || "D")[0].toUpperCase();

    return (
        <div
            onClick={() => navigate(`/patient/appointments/${appt.id}`, { state: { appt } })}
            style={{
                display: "grid",
                gridTemplateColumns: "2.6fr 1.1fr 1fr 2fr 1fr 1fr 1.2fr 32px",
                alignItems: "center",
                gap: 16,
                padding: "16px 24px",
                borderBottom: last ? "none" : `1px solid ${T.border}`,
                transition: "background .15s",
                cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.cream; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
            {/* Doctor */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg, ${T.green}, ${T.greenSoft})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: T.white, fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 15,
                }}>
                    {initial}
                </div>
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: T.green, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {appt.doctorName}
                    </p>
                    <p style={{ fontSize: 12, color: T.terra, fontWeight: 600, margin: "2px 0 0" }}>{appt.specialization}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.muted, marginTop: 6 }}>
                        <Building2 size={11} />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{appt.hospital}</span>
                    </div>
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

            {/* Place to Visit */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6, minWidth: 0 }}>
                <MapPin size={14} color={T.green} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: T.green, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {appt.placeToVisit}
                </span>
            </div>

            {/* Payment */}
            <span style={{
                padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: payment.bg, color: payment.text, width: "fit-content",
            }}>
                {appt.paymentStatus}
            </span>

            {/* Advance */}
            <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IndianRupee size={13} color={T.green} />
                <span style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 15, color: T.green }}>
                    {appt.advanceAmount}
                </span>
            </div>

            {/* Status */}
            <span style={{
                display: "inline-flex", padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: status.bg, color: status.text, border: `1px solid ${status.border}`, width: "fit-content",
            }}>
                {status.label}
            </span>

            {/* Chevron affordance */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <ChevronArrow size={17} color={T.border} strokeWidth={2.5} />
            </div>
        </div>
    );
}

/* ─── Stat Card ───────────────────────────────── */
function StatCard({ icon, label, value, accent }) {
    return (
        <div style={{
            flex: "1 1 160px", background: T.white, borderRadius: 18, border: `1px solid ${T.border}`,
            padding: "20px 22px", display: "flex", alignItems: "center", gap: 14,
        }}>
            <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: accent ? `${accent}1A` : T.greenLight,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: 11.5, color: T.muted, margin: "0 0 3px", fontWeight: 600 }}>{label}</p>
                <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 22, color: accent || T.ink, margin: 0 }}>{value}</h3>
            </div>
        </div>
    );
}

/* ─── Main ────────────────────────────────────── */
export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("All");
    const [sortBy, setSort] = useState("Newest");
    const [page, setPage] = useState(1);

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

    const filtered = useMemo(() => {
        let d = [...appointments];
        if (search) d = d.filter((a) => (a.doctorName || "").toLowerCase().includes(search.toLowerCase()));
        if (statusFilter !== "All") {
            if (statusFilter === "Cancelled") d = d.filter((a) => a.status.includes("Cancelled"));
            else d = d.filter((a) => a.status === statusFilter);
        }
        d.sort((a, b) => {
            const dateA = new Date(a.appointmentDate);
            const dateB = new Date(b.appointmentDate);
            return sortBy === "Newest" ? dateB - dateA : dateA - dateB;
        });
        return d;
    }, [appointments, search, statusFilter, sortBy]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
    const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const stats = {
        total: appointments.length,
        confirmed: appointments.filter((a) => a.status === "Confirmed").length,
        pending: appointments.filter((a) => a.status === "Pending").length,
        completed: appointments.filter((a) => a.status === "Completed").length,
        totalPaid: appointments.reduce((s, a) => s + (a.advanceAmount || 0), 0),
    };

    return (
        <>
            <Toaster position="top-right" />

            <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "Inter, sans-serif", color: T.ink }}>
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,600&family=Inter:wght@400;500;600;700&display=swap');
          *{box-sizing:border-box;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
          @keyframes spin{to{transform:rotate(360deg)}}
          ::-webkit-scrollbar{width:5px;height:5px;}
          ::-webkit-scrollbar-thumb{background:${T.border};border-radius:99px;}
          .appt-tab{position:relative; background:none; border:none; padding:10px 4px; font-size:13.5px; font-weight:600; cursor:pointer; color:${T.muted}; transition: color .15s;}
          .appt-tab:hover{color:${T.ink};}
          .appt-tab.active{color:${T.green};}
          .appt-tab.active::after{content:""; position:absolute; left:0; right:0; bottom:-1px; height:2px; background:${T.terra}; border-radius:2px;}
        `}</style>

                <div className="w-full max-w-[1700px] mx-auto px-6 lg:px-16 xl:px-24 py-10">

                    {/* ── Editorial header ── */}
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 36 }}>
                        <div>
                            <p style={{ color: T.terraDark, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, margin: "0 0 10px" }}>
                                CareConnect
                            </p>
                            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }} className="leading-[1.05] tracking-tight">
                                <span style={{ fontSize: "clamp(2.1rem, 4.2vw, 3.3rem)", color: T.green }}>Every visit,</span>
                                <br />
                                <span className="italic" style={{ fontSize: "clamp(2.1rem, 4.2vw, 3.3rem)", color: T.terra }}>organized in one place.</span>
                            </h1>
                        </div>

                        <a href="/patient/doctors" style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "14px 24px", borderRadius: 99,
                            background: T.green, color: T.white, fontWeight: 700, fontSize: 14, textDecoration: "none", flexShrink: 0,
                            boxShadow: "0 8px 20px rgba(22,51,43,.18)",
                        }}>
                            <Plus size={16} /> Book Appointment
                        </a>
                    </div>

                    {/* ── Stat cards ── */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
                        <StatCard icon={<CalendarCheck size={19} color={T.green} />} label="Total Appointments" value={stats.total} />
                        <StatCard icon={<CheckCircle2 size={19} color={T.green} />} label="Confirmed" value={stats.confirmed} accent={T.green} />
                        <StatCard icon={<Hourglass size={19} color="#D97706" />} label="Pending" value={stats.pending} accent="#D97706" />
                        <StatCard icon={<CheckCircle2 size={19} color="#1D4ED8" />} label="Completed" value={stats.completed} accent="#1D4ED8" />
                        <StatCard icon={<Wallet size={19} color={T.terra} />} label="Total Paid" value={`₹${stats.totalPaid}`} accent={T.terra} />
                    </div>

                    {/* ── Search / sort / tabs card ── */}
                    <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, marginBottom: 20, overflow: "hidden" }}>
                        <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "18px 24px 14px", borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
                            {TABS.map((tab) => (
                                <button key={tab} className={`appt-tab${statusFilter === tab ? " active" : ""}`}
                                    onClick={() => { setStatus(tab); setPage(1); }} style={{ marginRight: 22 }}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div style={{ padding: "16px 24px", display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                                <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
                                <input
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search by doctor name…"
                                    style={{
                                        width: "100%", height: 44, borderRadius: 12, border: `1.5px solid ${T.border}`,
                                        paddingLeft: 38, paddingRight: 14, fontSize: 14, outline: "none", background: T.cream, color: T.ink,
                                    }}
                                />
                            </div>
                            <select value={sortBy} onChange={(e) => setSort(e.target.value)}
                                style={{ height: 44, borderRadius: 12, border: `1.5px solid ${T.border}`, padding: "0 14px", fontSize: 13, background: T.cream, color: T.ink, cursor: "pointer" }}>
                                <option>Newest</option>
                                <option>Oldest</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                            <p style={{ color: "#DC2626", fontWeight: 700, fontSize: 15, margin: 0 }}>{error}</p>
                            <button onClick={load} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#DC2626", color: T.white, border: "none", borderRadius: 99, padding: "10px 22px", fontWeight: 700, cursor: "pointer", fontSize: 13.5 }}>
                                <RefreshCw size={14} /> Retry
                            </button>
                        </div>
                    )}

                    {/* ── List card ── */}
                    {!error && (
                        <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, overflow: "hidden" }}>

                            {!loading && current.length > 0 && (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "2.6fr 1.1fr 1fr 2fr 1fr 1fr 1.2fr 32px",
                                    gap: 16, padding: "13px 24px", borderBottom: `1px solid ${T.border}`, background: T.cream,
                                }}>
                                    {["Doctor", "Date", "Time", "Place to Visit", "Payment", "Advance", "Status", ""].map((h, i) => (
                                        <span key={i} style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .6 }}>
                                            {h}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                            {!loading &&
                                current.map((a, i) => {
                                    const currentDate = fmtDate(a.appointmentDate);
                                    const previousDate = i > 0 ? fmtDate(current[i - 1].appointmentDate) : null;
                                    return (
                                        <div key={a.id}>
                                            {currentDate !== previousDate && (
                                                <div style={{
                                                    background: T.creamDark, padding: "10px 24px", fontWeight: 700, fontSize: 13,
                                                    color: T.green, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
                                                    textTransform: "uppercase", letterSpacing: .4,
                                                }}>
                                                    {currentDate}
                                                </div>
                                            )}
                                            <AppointmentRow appt={a} navigate={navigate} last={i === current.length - 1} />
                                        </div>
                                    );
                                })}

                            {!loading && current.length === 0 && (
                                <div style={{ padding: "64px 24px", textAlign: "center" }}>
                                    <div style={{
                                        width: 72, height: 72, borderRadius: "50%", background: T.creamDark,
                                        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px",
                                    }}>
                                        <Calendar size={32} color={T.muted} />
                                    </div>
                                    <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 22, color: T.ink, margin: "0 0 8px" }}>
                                        No Appointments Found
                                    </h2>
                                    <p style={{ fontSize: 14, color: T.muted, margin: "0 0 24px", maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
                                        We couldn't find any appointments matching your search or filter.
                                    </p>
                                    <a href="/patient/doctors" style={{
                                        display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 99,
                                        background: T.green, color: T.white, fontWeight: 700, fontSize: 13, textDecoration: "none",
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
                            <PaginationBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1} icon={<ChevronLeft size={16} />} />
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <button key={n} onClick={() => setPage(n)} style={{
                                    width: 38, height: 38, borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
                                    background: page === n ? T.green : T.white, color: page === n ? T.white : T.ink,
                                    border: page === n ? "none" : `1.5px solid ${T.border}`,
                                }}>
                                    {n}
                                </button>
                            ))}
                            <PaginationBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} icon={<ChevronRight size={16} />} />
                        </div>
                    )}

                </div>
                <Footer />
            </div>
        </>
    );
}

function PaginationBtn({ onClick, disabled, icon }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.white,
            cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", color: T.ink,
        }}>
            {icon}
        </button>
    );
}