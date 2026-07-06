import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
    Building2, Clock3, Users, MessageSquare, Send,
    ClipboardList, CalendarClock, CheckCircle2, XCircle, Hourglass,
} from "lucide-react";

/* ─── Design tokens (matches rest of CareConnect) ──── */
const T = {
    cream: "#F5F0E8",
    creamDark: "#EDE7D9",
    green: "#2D5016",
    greenMid: "#3D6B1F",
    greenLight: "#EBF2E3",
    terra: "#C4622D",
    terraLight: "#FAF0EA",
    ink: "#1A1A1A",
    muted: "#6B7280",
    border: "#E2DACE",
    white: "#FFFFFF",
};

const STATUS_CFG = {
    Pending: { bg: "#FEF9C3", text: "#854D0E", border: "#FDE68A", icon: <Hourglass size={13} /> },
    Approved: { bg: T.greenLight, text: T.green, border: "#BBD9A0", icon: <CheckCircle2 size={13} /> },
    Rejected: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA", icon: <XCircle size={13} /> },
};

function StatusBadge({ status }) {
    const s = STATUS_CFG[status] || { bg: T.creamDark, text: T.muted, border: T.border, icon: null };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700,
            background: s.bg, color: s.text, border: `1px solid ${s.border}`,
            whiteSpace: "nowrap",
        }}>
            {s.icon}{status}
        </span>
    );
}

function Field({ label, icon, children }) {
    return (
        <div>
            <label style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 6,
            }}>
                {icon}{label}
            </label>
            {children}
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    fontSize: 13,
    outline: "none",
    background: T.cream,
    color: T.ink,
    fontFamily: "Inter, sans-serif",
};

export default function DoctorSlotRequest() {
    const [hospitals, setHospitals] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [requests, setRequests] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        hospitalId: "",
        hospitalSessionId: "",
        requestedFrom: "",
        requestedTo: "",
        maxPatients: 20,
        reason: "",
    });

    useEffect(() => {
        loadHospitals();
        loadRequests();
    }, []);

    async function loadHospitals() {
        try {
            const res = await api.get("/doctor/hospitals");
            setHospitals(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    async function loadRequests() {
        try {
            const res = await api.get("/doctor/slot-requests");
            setRequests(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    async function loadSessions(hospitalId) {
        try {
            const res = await api.get(`/doctor/hospital-sessions/${hospitalId}`);
            setSessions(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (name === "hospitalId") {
            loadSessions(value);
            setForm((prev) => ({ ...prev, hospitalId: value, hospitalSessionId: "" }));
        }
    }

    async function submitRequest() {
        if (!form.hospitalId) return alert("Select Hospital");
        if (!form.hospitalSessionId) return alert("Select Hospital Session");
        if (!form.requestedFrom) return alert("Select Start Time");
        if (!form.requestedTo) return alert("Select End Time");

        try {
            setSubmitting(true);
            const payload = {
                hospitalId: Number(form.hospitalId),
                hospitalSessionId: Number(form.hospitalSessionId),
                requestedFrom: form.requestedFrom,
                requestedTo: form.requestedTo,
                maxPatients: Number(form.maxPatients),
                reason: form.reason,
            };
            await api.post("/doctor/request-slot", payload);
            alert("Slot request submitted successfully.");
            setForm({
                hospitalId: "",
                hospitalSessionId: "",
                requestedFrom: "",
                requestedTo: "",
                maxPatients: 20,
                reason: "",
            });
            setSessions([]);
            loadRequests();
        } catch (err) {
            console.log(err);
            alert(err.response?.data || "Unable to submit request.");
        } finally {
            setSubmitting(false);
        }
    }

    const card = {
        background: T.white,
        borderRadius: 20,
        border: `1px solid ${T.border}`,
        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        overflow: "hidden",
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: T.cream,
            padding: 28,
            fontFamily: "Inter, sans-serif",
            color: T.ink,
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 99px; }
      `}</style>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{
                    fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 28,
                    margin: 0, color: T.ink,
                }}>
                    Request Hospital Slot
                </h1>
                <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0" }}>
                    Ask admin for an extra session outside your regular availability
                </p>
            </div>

            {/* Form card */}
            <div style={{ ...card, padding: 28, marginBottom: 24 }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                    gap: 18,
                }}>
                    <Field label="Hospital" icon={<Building2 size={14} color={T.green} />}>
                        <select
                            name="hospitalId"
                            value={form.hospitalId}
                            onChange={handleChange}
                            style={{ ...inputStyle, cursor: "pointer" }}
                        >
                            <option value="">Select Hospital</option>
                            {hospitals.map((h) => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Session" icon={<Clock3 size={14} color={T.green} />}>
                        <select
                            name="hospitalSessionId"
                            value={form.hospitalSessionId}
                            onChange={handleChange}
                            style={{ ...inputStyle, cursor: "pointer" }}
                        >
                            <option value="">Select Session</option>
                            {sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.day} | {s.startTime} - {s.endTime}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="From" icon={<CalendarClock size={14} color={T.green} />}>
                        <input
                            type="datetime-local"
                            name="requestedFrom"
                            value={form.requestedFrom}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </Field>

                    <Field label="To" icon={<CalendarClock size={14} color={T.green} />}>
                        <input
                            type="datetime-local"
                            name="requestedTo"
                            value={form.requestedTo}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </Field>

                    <Field label="Maximum Patients" icon={<Users size={14} color={T.green} />}>
                        <input
                            type="number"
                            min={1}
                            name="maxPatients"
                            value={form.maxPatients}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </Field>
                </div>

                <div style={{ marginTop: 18 }}>
                    <Field label="Reason" icon={<MessageSquare size={14} color={T.green} />}>
                        <textarea
                            name="reason"
                            value={form.reason}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Example: Extra Evening OPD, Emergency Duty, Weekend Checkup"
                            style={{ ...inputStyle, resize: "vertical", fontFamily: "Inter, sans-serif" }}
                        />
                    </Field>
                </div>

                <button
                    onClick={submitRequest}
                    disabled={submitting}
                    style={{
                        display: "flex", alignItems: "center", gap: 8,
                        marginTop: 22,
                        background: submitting ? T.creamDark : T.terra,
                        color: submitting ? T.muted : T.white,
                        border: "none",
                        borderRadius: 12,
                        padding: "12px 22px",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: submitting ? "not-allowed" : "pointer",
                        transition: "background .15s",
                    }}
                    onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#A8502A"; }}
                    onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = T.terra; }}
                >
                    <Send size={15} /> {submitting ? "Submitting…" : "Submit Request"}
                </button>
            </div>

            {/* My requests table */}
            <div style={card}>
                <div style={{
                    padding: "20px 24px",
                    borderBottom: `1px solid ${T.border}`,
                    background: T.cream,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}>
                    <ClipboardList size={18} color={T.green} />
                    <span style={{
                        fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: T.ink,
                    }}>
                        My Slot Requests
                    </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: T.cream }}>
                                {["Hospital", "From", "To", "Patients", "Reason", "Status"].map((h) => (
                                    <th key={h} style={{
                                        padding: "13px 20px",
                                        textAlign: "left",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: T.muted,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.6,
                                        whiteSpace: "nowrap",
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                                        <ClipboardList size={44} style={{ opacity: .3, display: "block", margin: "0 auto 12px" }} />
                                        No requests found.
                                    </td>
                                </tr>
                            ) : requests.map((r) => (
                                <tr key={r.id} style={{ borderTop: `1px solid ${T.border}`, transition: "background .12s" }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = T.cream}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding: "15px 20px", fontWeight: 700, color: T.ink }}>{r.hospital}</td>
                                    <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>
                                        {new Date(r.requestedFrom).toLocaleString()}
                                    </td>
                                    <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>
                                        {new Date(r.requestedTo).toLocaleString()}
                                    </td>
                                    <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>{r.maxPatients}</td>
                                    <td style={{ padding: "15px 20px", fontSize: 13, color: T.muted }}>{r.reason || "-"}</td>
                                    <td style={{ padding: "15px 20px" }}>
                                        <StatusBadge status={r.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, background: T.cream }}>
                    <span style={{ fontSize: 12, color: T.muted }}>
                        Showing <b style={{ color: T.ink }}>{requests.length}</b> request{requests.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>
        </div>
    );
}