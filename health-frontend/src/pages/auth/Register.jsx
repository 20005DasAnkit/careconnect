import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, HeartPulse, CheckCircle2 } from "lucide-react";
import { registerUser } from "../../services/authService";

/* ─── Tokens ──────────────────────────────────── */
const T = {
    cream: "#F5F0E8",
    creamDark: "#EDE7D9",
    green: "#2D5016",
    greenLight: "#EBF2E3",
    terra: "#C4622D",
    ink: "#1A1A1A",
    muted: "#6B7280",
    border: "#E2DACE",
    white: "#FFFFFF",
    errorText: "#B91C1C",
    errorBorder: "#FCA5A5",
    errorBg: "#FEF2F2",
};

/* ─── Input field ─────────────────────────────── */
function Field({ label, error, icon, children }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 6 }}>{label}</label>
            <div style={{ position: "relative" }}>
                {icon && (
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.muted, display: "flex", pointerEvents: "none" }}>
                        {icon}
                    </span>
                )}
                {children}
            </div>
            {error && <p style={{ fontSize: 12, color: T.errorText, marginTop: 4 }}>{error}</p>}
        </div>
    );
}

const baseInput = (hasIcon, hasErr) => ({
    width: "100%", height: 48, borderRadius: 12,
    border: `1.5px solid ${hasErr ? T.errorBorder : T.border}`,
    paddingLeft: hasIcon ? 44 : 14, paddingRight: 14,
    fontSize: 14, outline: "none", background: T.white,
    color: T.ink, fontFamily: "Inter, sans-serif",
    transition: "border-color .15s, box-shadow .15s",
});

/* ─── Left panel feature list ─────────────────── */
const FEATURES = [
    "Book appointments with verified doctors",
    "Order medicine with doorstep delivery",
    "Request ambulance in emergencies",
    "Secure health records anytime",
];

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState({});
    const [showPwd, setShowPwd] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const set = k => e => { setForm(p => ({ ...p, [k]: e.target.value })); clearErr(k); };
    function clearErr(k) { if (errors[k]) setErrors(p => ({ ...p, [k]: undefined })); }

    function validate() {
        const e = {};
        if (!form.name.trim()) e.name = "Full name is required";
        if (!form.email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
        if (!form.phone.trim()) e.phone = "Phone number is required";
        else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit number";
        if (!form.password) e.password = "Password is required";
        else if (form.password.length < 6) e.password = "Minimum 6 characters";
        if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
        else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
        return e;
    }

    async function handleSubmit() {
        setApiError("");
        const fe = validate();
        setErrors(fe);
        if (Object.keys(fe).length) return;

        setLoading(true);
        try {
            await registerUser({ fullName: form.name, email: form.email, password: form.password });
            navigate("/login");
        } catch (err) {
            setApiError(err.response?.data?.message || err.response?.data || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Inter, sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,400&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        a{text-decoration:none;}
        input:focus{border-color:${T.green}!important;box-shadow:0 0 0 3px ${T.greenLight}!important;}
        @media(min-width:1024px){.reg-left{display:flex!important;}}
      `}</style>

            {/* ── Left ───────────────────────────────── */}
            <div className="reg-left" style={{
                width: "44%", display: "none", flexDirection: "column",
                position: "relative", overflow: "hidden",
                background: `linear-gradient(160deg, ${T.green} 0%, #3D6B1F 55%, #527A28 100%)`,
                padding: "48px 52px",
            }}>
                {/* Blobs */}
                <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
                <div style={{ position: "absolute", bottom: -40, left: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(196,98,45,.15)" }} />
                <div style={{ position: "absolute", top: "50%", right: "10%", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />

                {/* Logo */}
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: T.terra, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <HeartPulse size={22} color={T.white} />
                    </div>
                    <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, color: T.white }}>CareConnect</span>
                </div>

                {/* Hero text */}
                <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginBottom: 18 }}>Join thousands of patients</p>
                    <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 50, lineHeight: 1.1, color: T.white, margin: "0 0 24px" }}>
                        Healthcare<br />
                        <em style={{ fontStyle: "italic", fontWeight: 400 }}>made simple.</em>
                    </h1>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,.7)", maxWidth: 320, marginBottom: 40 }}>
                        Everything you need to manage your health in one secure platform.
                    </p>

                    {/* Feature list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {FEATURES.map(f => (
                            <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <CheckCircle2 size={14} color={T.white} />
                                </div>
                                <span style={{ fontSize: 14, color: "rgba(255,255,255,.8)" }}>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ position: "relative", fontSize: 12, color: "rgba(255,255,255,.35)" }}>© 2025 CareConnect. All rights reserved.</p>
            </div>

            {/* ── Right ──────────────────────────────── */}
            <div style={{ flex: 1, background: T.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: "36px 24px", overflowY: "auto" }}>
                <div style={{ width: "100%", maxWidth: 420 }}>

                    {/* Mobile logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: T.terra, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <HeartPulse size={18} color={T.white} />
                        </div>
                        <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, color: T.ink }}>CareConnect</span>
                    </div>

                    <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 30, color: T.ink, margin: "0 0 4px" }}>Create account</h1>
                    <p style={{ fontSize: 14, color: T.muted, margin: "0 0 28px" }}>Join CareConnect — it's free.</p>

                    {/* API error */}
                    {apiError && (
                        <div style={{ background: T.errorBg, border: `1px solid ${T.errorBorder}`, color: T.errorText, borderRadius: 12, padding: "12px 14px", fontSize: 13, marginBottom: 22 }}>
                            {apiError}
                        </div>
                    )}

                    {/* Form */}
                    <Field label="Full Name" error={errors.name} icon={<User size={16} />}>
                        <input
                            type="text" placeholder="John Doe"
                            value={form.name} onChange={set("name")}
                            style={baseInput(true, !!errors.name)}
                        />
                    </Field>

                    <Field label="Email Address" error={errors.email} icon={<Mail size={16} />}>
                        <input
                            type="email" placeholder="you@example.com"
                            value={form.email} onChange={set("email")}
                            style={baseInput(true, !!errors.email)}
                        />
                    </Field>

                    <Field label="Phone Number" error={errors.phone} icon={<Phone size={16} />}>
                        <input
                            type="tel" placeholder="10-digit mobile number"
                            value={form.phone} onChange={set("phone")}
                            style={baseInput(true, !!errors.phone)}
                        />
                    </Field>

                    <Field label="Password" error={errors.password} icon={<Lock size={16} />}>
                        <input
                            type={showPwd ? "text" : "password"} placeholder="Min. 6 characters"
                            value={form.password} onChange={set("password")}
                            style={{ ...baseInput(true, !!errors.password), paddingRight: 44 }}
                        />
                        <button type="button" onClick={() => setShowPwd(p => !p)}
                            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }}>
                            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </Field>

                    <Field label="Confirm Password" error={errors.confirmPassword} icon={<Lock size={16} />}>
                        <input
                            type={showConf ? "text" : "password"} placeholder="Repeat your password"
                            value={form.confirmPassword} onChange={set("confirmPassword")}
                            style={{ ...baseInput(true, !!errors.confirmPassword), paddingRight: 44 }}
                        />
                        <button type="button" onClick={() => setShowConf(p => !p)}
                            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }}>
                            {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </Field>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            width: "100%", height: 50, borderRadius: 12, border: "none",
                            background: T.green, color: T.white, fontWeight: 700, fontSize: 15,
                            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            marginTop: 8, transition: "background .15s",
                        }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#3D6B1F"; }}
                        onMouseLeave={e => e.currentTarget.style.background = T.green}
                    >
                        {loading && <Loader2 size={16} style={{ animation: "spin .8s linear infinite" }} />}
                        {loading ? "Creating account…" : "Create Account"}
                    </button>

                    <p style={{ textAlign: "center", fontSize: 13, color: T.muted, marginTop: 24 }}>
                        Already have an account?{" "}
                        <Link to="/login" style={{ fontWeight: 700, color: T.terra }}>Sign In</Link>
                    </p>
                </div>
            </div>

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}