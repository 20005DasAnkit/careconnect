import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { loginUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */
const C = {
  ink: "#0F172A",
  text: "#1E293B",
  muted: "#64748B",
  border: "#E2E8F0",
  primary: "#1E293B",
  primaryHover: "#0F172A",
  accent: "#2563EB",
  errorBg: "#FEF2F2",
  errorBorder: "#FCA5A5",
  errorText: "#B91C1C",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_ROUTES = {
  Admin: "/admin",
  Doctor: "/doctor",
  AmbulanceDriver: "/ambulance",
};

function decodeRole(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  } catch {
    return null;
  }
}

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  function validate() {
    const next = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    return next;
  }

  function clearFieldError(field) {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setFormError("");

    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      const data = await loginUser({ email: email.trim(), password });

      const token = data?.token;
      if (!token) throw new Error("No token returned from server");

      const role = decodeRole(token);

      localStorage.setItem("token", token);
      localStorage.setItem("name", data.name ?? "");
      localStorage.setItem("email", data.email ?? "");

      login(data);
      navigate(ROLE_ROUTES[role] ?? "/patient");
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null);

      if (err?.response?.status === 401 || err?.response?.status === 400) {
        setFormError(apiMessage || "Incorrect email or password.");
      } else if (!err?.response) {
        setFormError("Couldn't reach the server. Check your connection and try again.");
      } else {
        setFormError(apiMessage || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    // Wire this up to your real OAuth flow, e.g.:
    // window.location.href = "/api/auth/google";
    setFormError("Google sign-in isn't configured yet.");
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT — brand panel */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden">
        {/* Replace this gradient with your own photo:
            background: `url('/images/login-hero.jpg') center/cover` */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #0B3D5C 0%, #1B5E82 35%, #2E84A8 70%, #5FA8C4 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 30%), radial-gradient(circle at 80% 60%, white 0, transparent 25%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end h-full px-12 pb-14">
          <div className="flex items-center gap-2.5 mb-5">
            <Logo size={36} />
            <span className="text-white text-xl font-bold tracking-tight">MEDIGRAPH</span>
          </div>
          <p className="text-white/90 text-base leading-relaxed max-w-sm">
            Empowering Healthcare, One Click at a Time: Your Health, Your Records, Your
            Control.
          </p>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10">
        <form onSubmit={handleLogin} noValidate className="w-full max-w-[380px]">
          <Logo size={32} />

          <h1 className="mt-6 text-2xl font-bold" style={{ color: C.ink }}>
            Login
          </h1>
          <p className="mt-1 text-sm" style={{ color: C.muted }}>
            Log in to your account.
          </p>

          {formError && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm"
              style={{ backgroundColor: C.errorBg, border: `1px solid ${C.errorBorder}`, color: C.errorText }}
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Email */}
          <div className="mt-6">
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium" style={{ color: C.text }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition-colors focus:ring-2"
              style={{
                color: C.ink,
                borderColor: errors.email ? C.errorBorder : C.border,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = C.accent)}
              onBlur={(e) => (e.currentTarget.style.borderColor = errors.email ? C.errorBorder : C.border)}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs" style={{ color: C.errorText }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mt-4">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium" style={{ color: C.text }}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="h-11 w-full rounded-lg border pl-3.5 pr-10 text-sm outline-none transition-colors focus:ring-2"
                style={{
                  color: C.ink,
                  borderColor: errors.password ? C.errorBorder : C.border,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = C.accent)}
                onBlur={(e) => (e.currentTarget.style.borderColor = errors.password ? C.errorBorder : C.border)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: C.muted }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs" style={{ color: C.errorText }}>
                {errors.password}
              </p>
            )}
          </div>

          <div className="mt-3 text-right">
            <Link to="/forgot-password" className="text-sm font-medium" style={{ color: C.accent }}>
              Forget Password?
            </Link>
          </div>

          {/* Log In */}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 h-11 w-full rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: C.primary }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = C.primaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.primary)}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Logging in..." : "Log In"}
          </button>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-3 h-11 w-full rounded-lg border text-sm font-medium flex items-center justify-center gap-2.5 transition-colors hover:bg-slate-50"
            style={{ borderColor: C.border, color: C.text }}
          >
            <GoogleIcon size={17} />
            Log in with Google
          </button>

          <p className="mt-6 text-center text-sm" style={{ color: C.muted }}>
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold" style={{ color: C.accent }}>
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="2" y="14" width="36" height="12" rx="6" fill="#1E293B" />
      <path d="M20 6 L28 14 L20 22 L12 14 Z" fill="#F97316" />
      <path d="M20 18 L28 26 L20 34 L12 26 Z" fill="#2563EB" />
    </svg>
  );
}

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.58-5.05-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.71A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58A8.6 8.6 0 0 0 9 0 9 9 0 0 0 .96 4.96l2.99 2.33C4.66 5.16 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}