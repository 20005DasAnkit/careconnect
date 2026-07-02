import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock } from "lucide-react";
import { loginUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_ROUTES = { Admin: "/admin", Doctor: "/doctor", AmbulanceDriver: "/ambulance" };

function decodeRole(token) {
  try {
    const p = JSON.parse(atob(token.split(".")[1]));
    return p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  } catch {
    return null;
  }
}

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  function validate() {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!EMAIL_RE.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    return e;
  }
  function clearErr(f) {
    if (errors[f]) setErrors((p) => ({ ...p, [f]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const fe = validate();
    setErrors(fe);
    if (Object.keys(fe).length) return;

    setLoading(true);
    try {
      const data = await loginUser({ email: email.trim(), password });
      const token = data?.token;
      if (!token) throw new Error("No token");
      const role = decodeRole(token);
      localStorage.setItem("token", token);
      localStorage.setItem("name", data.name ?? "");
      localStorage.setItem("email", data.email ?? "");
      login(data);
      navigate(ROLE_ROUTES[role] ?? "/patient");
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        (typeof err?.response?.data === "string" ? err.response.data : null);
      if (err?.response?.status === 401 || err?.response?.status === 400)
        setFormError(msg || "Incorrect email or password.");
      else if (!err?.response) setFormError("Couldn't reach the server. Check your connection.");
      else setFormError(msg || "Something went wrong. Please try again.");
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
            <Link
              to="/"
              style={{ display: "flex", alignItems: "center", gap: 9, color: T.white }}
            >
              <span style={{ fontSize: 20 }}>✦</span>
              <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22 }}>
                CareConnect.
              </span>
            </Link>

            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 500,
                fontSize: 42,
                lineHeight: 1.12,
                margin: "56px 0 18px",
                maxWidth: 380,
              }}
            >
              Good to see you again.
            </h1>
            <p style={{ color: "rgba(255,255,255,.72)", fontSize: 15.5, lineHeight: 1.6, maxWidth: 340 }}>
              Sign in to manage appointments, prescriptions, and your care team — all in one
              place.
            </p>
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
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600 }}>
                250+
              </div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.7)", marginTop: 2 }}>
                Specialist Doctors
              </div>
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
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#E8A583",
                }}
              >
                24/7
              </div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.7)", marginTop: 2 }}>
                Emergency Support
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div style={{ padding: "48px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
              Welcome back
            </h2>
            <p style={{ color: T.muted, fontSize: 14.5, margin: "0 0 30px" }}>
              New to CareConnect?{" "}
              <Link to="/register" className="cc-link">
                Create an account
              </Link>
            </p>

            {formError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "11px 14px",
                  borderRadius: 10,
                  marginBottom: 20,
                  fontSize: 13,
                  background: T.errorBg,
                  border: `1px solid ${T.errorBorder}`,
                  color: T.errorText,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <label style={{ display: "block", marginBottom: 18 }}>
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
                  Email Address
                </span>
                <div
                  className="cc-field"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: T.white,
                    border: `1px solid ${errors.email ? T.errorBorder : T.border}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <Mail size={17} color={T.muted} style={{ flexShrink: 0 }} />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearErr("email");
                    }}
                    style={{
                      border: "none",
                      outline: "none",
                      width: "100%",
                      fontSize: 15,
                      color: T.ink,
                      background: "transparent",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </div>
                {errors.email && (
                  <p style={{ fontSize: 12, color: T.errorText, marginTop: 5 }}>{errors.email}</p>
                )}
              </label>

              <label style={{ display: "block", marginBottom: 10 }}>
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
                  Password
                </span>
                <div
                  className="cc-field"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: T.white,
                    border: `1px solid ${errors.password ? T.errorBorder : T.border}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <Lock size={17} color={T.muted} style={{ flexShrink: 0 }} />
                  <input
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearErr("password");
                    }}
                    style={{
                      border: "none",
                      outline: "none",
                      width: "100%",
                      fontSize: 15,
                      color: T.ink,
                      background: "transparent",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                  >
                    {showPwd ? <EyeOff size={16} color={T.muted} /> : <Eye size={16} color={T.muted} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ fontSize: 12, color: T.errorText, marginTop: 5 }}>{errors.password}</p>
                )}
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 26,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13.5,
                    color: T.muted,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{ accentColor: T.green, width: 15, height: 15 }}
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="cc-link" style={{ fontSize: 13.5 }}>
                  Forgot password?
                </Link>
              </div>

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
                }}
              >
                {loading && <Loader2 size={16} style={{ animation: "spin .8s linear infinite" }} />}
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 13.5, color: T.muted, marginTop: 26 }}>
              Don't have an account?{" "}
              <Link to="/register" className="cc-link" style={{ fontWeight: 600 }}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}