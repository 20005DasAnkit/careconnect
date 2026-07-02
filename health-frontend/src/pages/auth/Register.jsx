import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { registerUser } from "../../services/authService";

/* ── CareConnect brand tokens (match landing page) ───────────── */
const T = {
    cream: "#F5F1E8",
    green: "#16332B",
    greenSoft: "#1F4438",
    terra: "#C1633B",
    ink: "#1A1A17",
    muted: "#6B685F",
    border: "#E4DFD0",
    white: "#FFFFFF",
    errorText: "#B0432B",
    errorBg: "#FBEDE7",
    errorBorder: "#EAC7B8",
};

const FEATURES = [
    "Book appointments with verified doctors",
    "Order medicine with doorstep delivery",
    "Request ambulance in emergencies",
    "Secure health records anytime",
];

function Field({ label, error, icon: Icon, children }) {
    return (
        <label style={{ display: "block", marginBottom: 16 }}>
            <span
                style={{
                    display: "block",
                    fontSize: 12,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: T.muted,
                    marginBottom: 7,
                    fontWeight: 500,
                }}
            >
                {label}
            </span>
            <div
                className="cc-field"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: T.white,
                    border: `1px solid ${error ? T.errorBorder : T.border}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                }}
            >
                <Icon size={17} color={T.muted} style={{ flexShrink: 0 }} />
                {children}
            </div>
            {error && <p style={{ fontSize: 12, color: T.errorText, marginTop: 5 }}>{error}</p>}
        </label>
    );
}

const bareInput = {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: 15,
    color: T.ink,
    background: "transparent",
    fontFamily: "'Inter', sans-serif",
};

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState({});
    const [showPwd, setShowPwd] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const set = (k) => (e) => {
        setForm((p) => ({ ...p, [k]: e.target.value }));
        clearErr(k);
    };
    function clearErr(k) {
        if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
    }

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

    async function handleSubmit(e) {
        e.preventDefault();
        setApiError("");
        const fe = validate();
        setErrors(fe);
        if (Object.keys(fe).length) return;

        setLoading(true);
        try {
            await registerUser({ fullName: form.name, email: form.email, phone: form.phone, password: form.password });
            navigate("/login");
        } catch (err) {
            const msg =
                err?.response?.data?.message ??
                (typeof err?.response?.data === "string" ? err.response.data : null);
            setApiError(msg || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: T.cream,
                display: "flex",
                alignItems: "stretch",
                justifyContent: "center",
                fontFamily: "'Inter', sans-serif",
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&display=swap');
        *{box-sizing:border-box;}
        a{text-decoration:none;}
        .cc-field{transition:border-color .15s ease, box-shadow .15s ease;}
        .cc-field:focus-within{border-color:${T.green}!important;box-shadow:0 0 0 3px rgba(22,51,43,.08);}
        .cc-btn{transition:transform .15s ease, opacity .15s ease;}
        .cc-btn:hover{transform:translateY(-1px);}
        .cc-btn:active{transform:translateY(0);}
        .cc-link{color:${T.green};text-decoration:underline;text-underline-offset:3px;text-decoration-color:${T.border};}
        .cc-link:hover{text-decoration-color:${T.green};}
        input::placeholder{color:#B7B3A4;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:900px){.cc-branding{display:none!important;}}
      `}</style>

            <div
                style={{
                    width: "100%",
                    maxWidth: 1180,
                    margin: "28px",
                    display: "grid",
                    gridTemplateColumns: "0.95fr 1.05fr",
                    borderRadius: 22,
                    overflow: "hidden",
                    boxShadow: "0 30px 70px -25px rgba(22,51,43,.35)",
                    background: T.white,
                }}
            >
                {/* LEFT — brand / editorial panel, echoes the landing hero */}
                <div
                    className="cc-branding"
                    style={{
                        background: `linear-gradient(165deg, ${T.green} 0%, ${T.greenSoft} 100%)`,
                        color: T.white,
                        padding: "48px 44px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=1200&auto=format&fit=crop')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            opacity: 0.16,
                            mixBlendMode: "luminosity",
                        }}
                    />
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, color: T.white }}>
                            <span style={{ fontSize: 20 }}>✦</span>
                            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22 }}>
                                CareConnect.
                            </span>
                        </Link>

                        <p
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: "0.18em",
                                textTransform: "uppercase",
                                color: "rgba(255,255,255,.55)",
                                margin: "56px 0 16px",
                            }}
                        >
                            Join thousands of patients
                        </p>
                        <h1
                            style={{
                                fontFamily: "'Fraunces', serif",
                                fontWeight: 500,
                                fontSize: 42,
                                lineHeight: 1.12,
                                margin: "0 0 18px",
                                maxWidth: 380,
                            }}
                        >
                            Care that actually has time for you.
                        </h1>
                        <p style={{ color: "rgba(255,255,255,.72)", fontSize: 15.5, lineHeight: 1.6, maxWidth: 340, marginBottom: 34 }}>
                            Everything you need to manage your health, in one secure place.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                            {FEATURES.map((f) => (
                                <div key={f} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                                    <div
                                        style={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: "50%",
                                            background: "rgba(255,255,255,.12)",
                                            border: "1px solid rgba(255,255,255,.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            fontSize: 12,
                                            color: "#E8A583",
                                        }}
                                    >
                                        ✓
                                    </div>
                                    <span style={{ fontSize: 14, color: "rgba(255,255,255,.82)" }}>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 14 }}>
                        <div
                            style={{
                                background: "rgba(255,255,255,.08)",
                                border: "1px solid rgba(255,255,255,.16)",
                                borderRadius: 14,
                                padding: "16px 18px",
                                flex: 1,
                            }}
                        >
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600 }}>250+</div>
                            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.7)", marginTop: 2 }}>Specialist Doctors</div>
                        </div>
                        <div
                            style={{
                                background: "rgba(255,255,255,.08)",
                                border: "1px solid rgba(255,255,255,.16)",
                                borderRadius: 14,
                                padding: "16px 18px",
                                flex: 1,
                            }}
                        >
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, color: "#E8A583" }}>
                                24/7
                            </div>
                            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.7)", marginTop: 2 }}>Emergency Support</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT — form */}
                <div style={{ padding: "44px 52px", display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto" }}>
                    <div style={{ maxWidth: 400, width: "100%", margin: "0 auto" }}>
                        <h2
                            style={{
                                fontFamily: "'Fraunces', serif",
                                fontWeight: 500,
                                fontSize: 30,
                                color: T.ink,
                                margin: "0 0 8px",
                            }}
                        >
                            Create your account
                        </h2>
                        <p style={{ color: T.muted, fontSize: 14.5, margin: "0 0 26px" }}>
                            Already have an account?{" "}
                            <Link to="/login" className="cc-link">
                                Sign in
                            </Link>
                        </p>

                        {apiError && (
                            <div
                                style={{
                                    background: T.errorBg,
                                    border: `1px solid ${T.errorBorder}`,
                                    color: T.errorText,
                                    borderRadius: 10,
                                    padding: "11px 14px",
                                    fontSize: 13,
                                    marginBottom: 20,
                                }}
                            >
                                {apiError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <Field label="Full Name" error={errors.name} icon={User}>
                                <input type="text" placeholder="John Doe" value={form.name} onChange={set("name")} style={bareInput} />
                            </Field>

                            <Field label="Email Address" error={errors.email} icon={Mail}>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={set("email")}
                                    style={bareInput}
                                />
                            </Field>

                            <Field label="Phone Number" error={errors.phone} icon={Phone}>
                                <input
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    value={form.phone}
                                    onChange={set("phone")}
                                    style={bareInput}
                                />
                            </Field>

                            <Field label="Password" error={errors.password} icon={Lock}>
                                <input
                                    type={showPwd ? "text" : "password"}
                                    placeholder="Min. 6 characters"
                                    value={form.password}
                                    onChange={set("password")}
                                    style={bareInput}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((s) => !s)}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                                >
                                    {showPwd ? <EyeOff size={16} color={T.muted} /> : <Eye size={16} color={T.muted} />}
                                </button>
                            </Field>

                            <Field label="Confirm Password" error={errors.confirmPassword} icon={Lock}>
                                <input
                                    type={showConf ? "text" : "password"}
                                    placeholder="Repeat your password"
                                    value={form.confirmPassword}
                                    onChange={set("confirmPassword")}
                                    style={bareInput}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConf((s) => !s)}
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                                >
                                    {showConf ? <EyeOff size={16} color={T.muted} /> : <Eye size={16} color={T.muted} />}
                                </button>
                            </Field>

                            <button
                                type="submit"
                                disabled={loading}
                                className="cc-btn"
                                style={{
                                    width: "100%",
                                    background: T.green,
                                    color: T.white,
                                    border: "none",
                                    borderRadius: 999,
                                    padding: "14px 0",
                                    fontSize: 15,
                                    fontWeight: 600,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.8 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    marginTop: 6,
                                }}
                            >
                                {loading && <Loader2 size={16} style={{ animation: "spin .8s linear infinite" }} />}
                                {loading ? "Creating account…" : "Create Account"}
                            </button>
                        </form>

                        <p style={{ textAlign: "center", fontSize: 12.5, color: T.muted, marginTop: 20, lineHeight: 1.6 }}>
                            By creating an account, you agree to CareConnect's{" "}
                            <span className="cc-link">Terms of Service</span> and{" "}
                            <span className="cc-link">Privacy Policy</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}