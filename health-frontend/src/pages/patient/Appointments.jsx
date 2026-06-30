import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { Toaster, toast } from "react-hot-toast";
import {
  Calendar, Clock, Search, RefreshCw, ChevronLeft, ChevronRight,
  User, CheckCircle2, XCircle, AlertCircle, IndianRupee,
  Stethoscope, Building2, MapPin, Hash, X,
} from "lucide-react";

/* ─── Tokens ──────────────────────────────────── */
const T = {
  cream:      "#F5F0E8",
  creamDark:  "#EDE7D9",
  green:      "#2D5016",
  greenLight: "#EBF2E3",
  terra:      "#C4622D",
  terraLight: "#FAF0EA",
  ink:        "#1A1A1A",
  muted:      "#6B7280",
  border:     "#E2DACE",
  white:      "#FFFFFF",
};

const STATUS_CFG = {
  Confirmed:        { bg: T.greenLight,  text: T.green,   border: "#BBD9A0", label: "Confirmed"        },
  Pending:          { bg: "#FEF3C7",     text: "#D97706",  border: "#FDE68A", label: "Pending"          },
  Completed:        { bg: "#DBEAFE",     text: "#1D4ED8",  border: "#BFDBFE", label: "Completed"        },
  CancelledByUser:  { bg: "#FEE2E2",     text: "#DC2626",  border: "#FECACA", label: "Cancelled"        },
  CancelledByDoctor:{ bg: "#FFF7ED",     text: "#C2410C",  border: "#FED7AA", label: "Doctor Cancelled" },
};

const PAYMENT_CFG = {
  Paid:    { bg: T.greenLight, text: T.green },
  Pending: { bg: "#FEF3C7",    text: "#D97706" },
  Failed:  { bg: "#FEE2E2",    text: "#DC2626" },
};

const TABS = ["All", "Confirmed", "Pending", "Completed", "Cancelled"];
const PER_PAGE = 5;

/* ─── Helpers ─────────────────────────────────── */
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}
function fmtTime(d) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/* ─── Skeleton ────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: 24, animation: "pulse 1.5s infinite" }}>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: T.creamDark, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 16, background: T.creamDark, borderRadius: 8, width: "45%", marginBottom: 10 }} />
          <div style={{ height: 13, background: T.creamDark, borderRadius: 8, width: "30%", marginBottom: 8 }} />
          <div style={{ height: 13, background: T.creamDark, borderRadius: 8, width: "25%" }} />
        </div>
      </div>
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

/* ─── Appointment Card ────────────────────────── */
function AppointmentCard({ appt, onCancel }) {
  const status  = STATUS_CFG[appt.status]  || STATUS_CFG.Pending;
  const payment = PAYMENT_CFG[appt.paymentStatus] || PAYMENT_CFG.Pending;
  const initial = (appt.doctorName || "D")[0].toUpperCase();

  return (
    <div style={{
      background: T.white, borderRadius: 20,
      border: `1px solid ${T.border}`, overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      transition: "box-shadow .2s, transform .2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,.09)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Status bar at top */}
      <div style={{ height: 4, background: status.text, opacity: .7 }} />

      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>

          {/* Avatar + Doctor info */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", minWidth: 220 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, ${T.green}, #3D6B1F)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: T.white, fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 24 }}>
              {initial}
            </div>
            <div>
              <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, color: T.ink, margin: "0 0 4px" }}>{appt.doctorName}</h3>
              <p style={{ fontSize: 13, color: T.terra, fontWeight: 600, margin: "0 0 2px" }}>{appt.specialization}</p>
              {appt.hospital && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                  <Building2 size={12} color={T.muted} />
                  <span style={{ fontSize: 12, color: T.muted }}>{appt.hospital}</span>
                </div>
              )}
              {appt.place && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                  <MapPin size={12} color={T.muted} />
                  <span style={{ fontSize: 12, color: T.muted }}>{appt.place}</span>
                </div>
              )}
              {/* Status badge */}
              <span style={{
                display: "inline-flex", marginTop: 10, padding: "4px 12px", borderRadius: 99,
                fontSize: 12, fontWeight: 700, background: status.bg, color: status.text,
                border: `1px solid ${status.border}`,
              }}>{status.label}</span>
            </div>
          </div>

          {/* Detail grid */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: 18, minWidth: 0 }}>
            <DetailItem icon={<Calendar size={15} color={T.green} />} label="Date" value={fmtDate(appt.appointmentDate)} />
            <DetailItem icon={<Clock size={15} color={T.green} />} label="Time" value={fmtTime(appt.appointmentTime)} />
            <div>
              <p style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, margin: "0 0 6px" }}>Payment</p>
              <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: payment.bg, color: payment.text }}>
                {appt.paymentStatus}
              </span>
            </div>
            <div>
              <p style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, margin: "0 0 6px" }}>Advance Paid</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <IndianRupee size={15} color={T.green} />
                <span style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 18, color: T.green }}>{appt.advanceAmount}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 180, flexShrink: 0 }}>
            {appt.status === "Confirmed" && (
              <button onClick={() => onCancel(appt.id)} style={btnStyle("#DC2626", T.white)}>
                <XCircle size={15} /> Cancel
              </button>
            )}
            {appt.status === "Completed" && (
              <button style={btnStyle(T.green, T.white)}>
                <RefreshCw size={15} /> Book Again
              </button>
            )}
            <button style={btnStyle("transparent", T.ink, T.border)}>
              <Search size={15} /> View Details
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}`, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.muted }}>
            <Hash size={12} /> Appt. <b style={{ color: T.ink }}>#{appt.id}</b>
          </span>
          {appt.slotId && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.muted }}>
              <Hash size={12} /> Slot <b style={{ color: T.ink }}>#{appt.slotId}</b>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, margin: "0 0 6px" }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icon}
        <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{value}</span>
      </div>
    </div>
  );
}

function btnStyle(bg, fg, borderColor) {
  return {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    width: "100%", padding: "11px 0", borderRadius: 12,
    border: borderColor ? `1.5px solid ${borderColor}` : "none",
    background: bg, color: fg, fontWeight: 700, fontSize: 13, cursor: "pointer",
    transition: "opacity .15s",
  };
}

/* ─── Stat Card ───────────────────────────────── */
function StatCard({ label, value, accent }) {
  return (
    <div style={{ background: T.white, borderRadius: 18, padding: "18px 22px", border: `1px solid ${T.border}`, boxShadow: "0 2px 6px rgba(0,0,0,.03)" }}>
      <p style={{ fontSize: 12, color: T.muted, margin: "0 0 6px", fontWeight: 600 }}>{label}</p>
      <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 32, color: accent || T.ink, margin: 0 }}>{value}</h3>
    </div>
  );
}

/* ─── Main ────────────────────────────────────── */
export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("All");
  const [sortBy, setSort]         = useState("Newest");
  const [page, setPage]           = useState(1);
  const [cancelId, setCancelId]   = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  async function load(quiet = false) {
    try {
      if (!quiet) setLoading(true);
      else setRefreshing(true);
      setError("");
      const res = await api.get("/patient/appointments");
      setAppointments(res.data || []);
    } catch {
      setError("Unable to load appointments.");
      toast.error("Failed to load appointments.");
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const current    = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total:     appointments.length,
    confirmed: appointments.filter(a => a.status === "Confirmed").length,
    pending:   appointments.filter(a => a.status === "Pending").length,
    completed: appointments.filter(a => a.status === "Completed").length,
    totalPaid: appointments.reduce((s, a) => s + (a.advanceAmount || 0), 0),
  };

  return (
    <>
      <Toaster position="top-right" />
      <CancelModal open={cancelId !== null} loading={cancelLoading} onClose={() => setCancelId(null)} onConfirm={cancelAppointment} />

      <div style={{ minHeight: "100vh", background: T.cream, fontFamily: "Inter, sans-serif", color: T.ink }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
          *{box-sizing:border-box;}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
          @keyframes spin{to{transform:rotate(360deg)}}
          ::-webkit-scrollbar{width:5px;height:5px;}
          ::-webkit-scrollbar-thumb{background:${T.border};border-radius:99px;}
        `}</style>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px" }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 32 }}>
            <div>
              <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 32, margin: "0 0 6px", color: T.ink }}>My Appointments</h1>
              <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>View, manage and track all your bookings.</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="/patient/doctors" style={{
                display: "flex", alignItems: "center", gap: 8, padding: "11px 20px",
                borderRadius: 12, background: T.terra, color: T.white,
                fontWeight: 700, fontSize: 13, textDecoration: "none",
              }}>
                + Book Appointment
              </a>
            </div>
          </div>

          {/* ── Stats ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 28 }}>
            <StatCard label="Total"      value={stats.total}              />
            <StatCard label="Confirmed"  value={stats.confirmed}  accent={T.green}   />
            <StatCard label="Pending"    value={stats.pending}    accent="#D97706"   />
            <StatCard label="Completed"  value={stats.completed}  accent="#1D4ED8"   />
            <StatCard label="Total Paid" value={`₹${stats.totalPaid}`} accent={T.terra} />
          </div>

          {/* ── Search + Sort + Tabs ── */}
          <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
                <input
                  value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by doctor name…"
                  style={{ width: "100%", height: 44, borderRadius: 10, border: `1.5px solid ${T.border}`, paddingLeft: 38, paddingRight: 14, fontSize: 14, outline: "none", background: T.cream, color: T.ink }}
                />
              </div>
              <select value={sortBy} onChange={e => setSort(e.target.value)}
                style={{ height: 44, borderRadius: 10, border: `1.5px solid ${T.border}`, padding: "0 14px", fontSize: 13, background: T.cream, color: T.ink, cursor: "pointer" }}>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => { setStatus(tab); setPage(1); }} style={{
                  padding: "8px 18px", borderRadius: 99, whiteSpace: "nowrap", border: "none",
                  fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .15s",
                  background: statusFilter === tab ? T.green : T.creamDark,
                  color: statusFilter === tab ? T.white : T.muted,
                }}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 20 }}>
              <p style={{ color: "#DC2626", fontWeight: 700, fontSize: 16, margin: "0 0 12px" }}>{error}</p>
              <button onClick={() => load()} style={{ background: "#DC2626", color: T.white, border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
            </div>
          )}

          {/* ── Skeletons ── */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
            </div>
          )}

          {/* ── Cards ── */}
          {!loading && current.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {current.map(a => <AppointmentCard key={a.id} appt={a} onCancel={setCancelId} />)}
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && current.length === 0 && !error && (
            <div style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: "64px 24px", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: T.creamDark, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Calendar size={36} color={T.muted} />
              </div>
              <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 24, color: T.ink, margin: "0 0 10px" }}>No Appointments Found</h2>
              <p style={{ fontSize: 14, color: T.muted, margin: "0 0 28px", maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
                We couldn't find any appointments matching your search or filter.
              </p>
              <a href="/patient/doctors" style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px",
                borderRadius: 12, background: T.terra, color: T.white, fontWeight: 700, fontSize: 14, textDecoration: "none",
              }}>
                Book an Appointment
              </a>
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && current.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 32 }}>
              <PaginationBtn onClick={() => setPage(p => p - 1)} disabled={page === 1} icon={<ChevronLeft size={16} />} />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)} style={{
                  width: 42, height: 42, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  background: page === n ? T.green : T.white, color: page === n ? T.white : T.ink,
                  border: page === n ? "none" : `1.5px solid ${T.border}`,
                  transition: "all .15s",
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
      width: 42, height: 42, borderRadius: 10, border: `1.5px solid ${T.border}`,
      background: T.white, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? .4 : 1, display: "flex", alignItems: "center", justifyContent: "center",
      color: T.ink,
    }}>
      {icon}
    </button>
  );
}