import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { loginUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";

const T = {
  bg:          "#E4F2E9",
  bgDeep:      "#CEEADB",
  green:       "#2D7A4F",
  greenDark:   "#1F5C39",
  greenLight:  "#EBF7F0",
  greenMid:    "#3D9B65",
  circle:      "#BEE3D0",
  ink:         "#1A2E22",
  muted:       "#5A7A68",
  border:      "#B8D9C8",
  white:       "#FFFFFF",
  errorText:   "#C0392B",
  errorBg:     "#FEF2F2",
  errorBorder: "#FECACA",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_ROUTES = { Admin: "/admin", Doctor: "/doctor", AmbulanceDriver: "/ambulance" };

function decodeRole(token) {
  try {
    const p = JSON.parse(atob(token.split(".")[1]));
    return p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  } catch { return null; }
}

function CCLogo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="12" fill={T.green}/>
      <path d="M22 10 L22 34 M10 22 L34 22" stroke="white" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="22" cy="22" r="6" fill="white" opacity="0.25"/>
    </svg>
  );
}

function DoctorsSVG() {
  return (
    <svg viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width:"100%", maxWidth:440, filter:"drop-shadow(0 12px 32px rgba(45,122,79,.18))" }}>
      <defs>
        <radialGradient id="cg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#3D9B65" stopOpacity="0.08"/>
        </radialGradient>
        <radialGradient id="sk1" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDDCB5"/><stop offset="100%" stopColor="#F0B07A"/>
        </radialGradient>
        <radialGradient id="sk2" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5C08A"/><stop offset="100%" stopColor="#E09A60"/>
        </radialGradient>
      </defs>

      {/* big circle backdrop */}
      <circle cx="210" cy="220" r="162" fill={T.circle}/>
      <circle cx="210" cy="220" r="162" fill="url(#cg)"/>

      {/* === LEFT DOCTOR (female, mask) === */}
      <ellipse cx="108" cy="318" rx="44" ry="72" fill="#38BDA8"/>
      <circle cx="108" cy="208" r="34" fill="url(#sk1)"/>
      <path d="M78 197 Q83 162 108 160 Q133 162 138 197 Q126 176 108 176 Q90 176 78 197Z" fill="#2C1A10"/>
      <rect x="86" y="216" width="44" height="24" rx="10" fill="#5ECFBF" opacity="0.95"/>
      <path d="M87 222 Q108 229 129 222" stroke="white" strokeWidth="1.5" opacity="0.5" fill="none"/>
      <ellipse cx="99"  cy="207" rx="4.5" ry="5" fill="#2C1A10"/>
      <ellipse cx="117" cy="207" rx="4.5" ry="5" fill="#2C1A10"/>
      <ellipse cx="100" cy="205" rx="1.5" ry="1.5" fill="white"/>
      <ellipse cx="118" cy="205" rx="1.5" ry="1.5" fill="white"/>
      <path d="M66 285 Q48 308 55 338" stroke="#38BDA8" strokeWidth="24" strokeLinecap="round"/>
      <path d="M52 312 L52 328 M44 320 L60 320" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <path d="M100 244 Q88 260 93 277 Q100 290 114 289" stroke="#145A50" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <circle cx="115" cy="291" r="6" fill="#145A50"/>

      {/* === CENTER TALL DOCTOR (male) === */}
      <rect x="152" y="240" width="90" height="138" rx="20" fill="white"/>
      <rect x="152" y="240" width="90" height="58" rx="20" fill="#38BDA8"/>
      <path d="M186 258 L197 286 L208 258" fill="#2A9080"/>
      <path d="M196 258 L200 295 L197 301 L194 295Z" fill="#186050"/>
      <rect x="158" y="298" width="24" height="18" rx="5" fill="#F0FBF7" stroke={T.border} strokeWidth="1.5"/>
      <line x1="165" y1="298" x2="165" y2="316" stroke={T.green} strokeWidth="2.5"/>
      <path d="M152 272 Q126 288 122 328" stroke="#38BDA8" strokeWidth="26" strokeLinecap="round"/>
      <path d="M242 272 Q266 288 268 324" stroke="white" strokeWidth="26" strokeLinecap="round"/>
      <ellipse cx="121" cy="331" rx="14" ry="11" fill="url(#sk1)"/>
      <ellipse cx="269" cy="328" rx="14" ry="11" fill="url(#sk1)"/>
      <circle cx="197" cy="192" r="40" fill="url(#sk1)"/>
      <path d="M160 182 Q165 148 197 145 Q229 148 234 182 Q218 160 197 160 Q176 160 160 182Z" fill="#1E120A"/>
      <ellipse cx="158" cy="198" rx="8" ry="10" fill="#F0B07A"/>
      <ellipse cx="236" cy="198" rx="8" ry="10" fill="#F0B07A"/>
      <ellipse cx="184" cy="193" rx="5.5" ry="6"  fill="#1E120A"/>
      <ellipse cx="210" cy="193" rx="5.5" ry="6"  fill="#1E120A"/>
      <ellipse cx="185.5" cy="191" rx="2" ry="2" fill="white"/>
      <ellipse cx="211.5" cy="191" rx="2" ry="2" fill="white"/>
      <path d="M177 183 Q184 178 191 183" stroke="#1E120A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M203 183 Q210 178 217 183" stroke="#1E120A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M195 201 Q191 211 197 213 Q203 211 199 201" stroke="#C07050" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M186 222 Q197 231 208 222" stroke="#B07060" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M178 234 Q165 254 170 276 Q177 292 190 292" stroke="#145A50" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="191" cy="294" r="8" fill="#145A50"/>
      <path d="M216 234 Q225 250 220 254" stroke="#145A50" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <circle cx="219" cy="256" r="5" fill="#145A50"/>

      {/* === RIGHT DOCTOR (female, glasses) === */}
      <ellipse cx="306" cy="316" rx="46" ry="70" fill="#38BDA8"/>
      <rect x="268" y="270" width="42" height="52" rx="6" fill="#F0FBF7" stroke={T.border} strokeWidth="1.5"/>
      <rect x="280" y="263" width="18" height="12" rx="4" fill="#38BDA8"/>
      <line x1="273" y1="285" x2="305" y2="285" stroke={T.border} strokeWidth="1.5"/>
      <line x1="273" y1="294" x2="305" y2="294" stroke={T.border} strokeWidth="1.5"/>
      <line x1="273" y1="303" x2="299" y2="303" stroke={T.border} strokeWidth="1.5"/>
      <line x1="273" y1="312" x2="302" y2="312" stroke={T.border} strokeWidth="1.5"/>
      <path d="M258 270 Q254 286 259 302" stroke="#38BDA8" strokeWidth="24" strokeLinecap="round"/>
      <circle cx="306" cy="202" r="35" fill="url(#sk2)"/>
      <path d="M274 191 Q278 157 306 154 Q334 157 338 191 Q324 170 306 170 Q288 170 274 191Z" fill="#C8A440"/>
      <path d="M274 191 Q268 214 274 230" stroke="#C8A440" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M338 191 Q344 214 338 230" stroke="#C8A440" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <rect x="284" y="197" width="18" height="13" rx="6" fill="none" stroke="#444" strokeWidth="2.5"/>
      <rect x="306" y="197" width="18" height="13" rx="6" fill="none" stroke="#444" strokeWidth="2.5"/>
      <line x1="302" y1="203" x2="306" y2="203" stroke="#444" strokeWidth="2.5"/>
      <line x1="284" y1="203" x2="277" y2="200" stroke="#444" strokeWidth="2.5"/>
      <line x1="324" y1="203" x2="331" y2="200" stroke="#444" strokeWidth="2.5"/>
      <ellipse cx="293" cy="203" rx="4" ry="4.5" fill="#2C1A10"/>
      <ellipse cx="315" cy="203" rx="4" ry="4.5" fill="#2C1A10"/>
      <path d="M300 213 Q295 222 306 224 Q317 222 312 213" stroke="#B06848" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M296 231 Q306 239 316 231" stroke="#A06050" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Floating icons */}
      <g transform="translate(56,132)">
        <rect x="0" y="9" width="30" height="12" rx="5" fill={T.greenMid} opacity="0.85"/>
        <rect x="9" y="0" width="12" height="30" rx="5" fill={T.greenMid} opacity="0.85"/>
      </g>
      <path d="M320 128 L338 128 L344 114 L352 148 L358 126 L366 128 L382 128"
        stroke={T.greenMid} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.75"/>
      <circle cx="74"  cy="334" r="7" fill={T.greenMid} opacity="0.3"/>
      <circle cx="338" cy="352" r="9" fill={T.greenMid} opacity="0.2"/>
      <circle cx="360" cy="152" r="5" fill={T.greenMid} opacity="0.4"/>
      <circle cx="42"  cy="268" r="4" fill={T.greenMid} opacity="0.25"/>
    </svg>
  );
}

function DotPattern() {
  const d = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 7; c++)
    d.push(<circle key={`${r}${c}`} cx={c*26} cy={r*26} r="2.2" fill={T.greenMid} opacity="0.15"/>);
  return (
    <svg style={{ position:"absolute", top:16, right:16, width:170, height:230, pointerEvents:"none" }} viewBox="0 0 170 230">{d}</svg>
  );
}

export default function Login() {
  const { login }    = useContext(AuthContext);
  const navigate     = useNavigate();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [formError, setFormError] = useState("");

  function validate() {
    const e = {};
    if (!email.trim())              e.email    = "Email is required";
    else if (!EMAIL_RE.test(email)) e.email    = "Enter a valid email";
    if (!password)                  e.password = "Password is required";
    return e;
  }
  function clearErr(f) { if (errors[f]) setErrors(p => ({ ...p, [f]: undefined })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const fe = validate(); setErrors(fe);
    if (Object.keys(fe).length) return;
    setLoading(true);
    try {
      const data = await loginUser({ email: email.trim(), password });
      const token = data?.token;
      if (!token) throw new Error("No token");
      const role = decodeRole(token);
      localStorage.setItem("token", token);
      localStorage.setItem("name",  data.name  ?? "");
      localStorage.setItem("email", data.email ?? "");
      login(data);
      navigate(ROLE_ROUTES[role] ?? "/patient");
    } catch (err) {
      const msg = err?.response?.data?.message ?? (typeof err?.response?.data === "string" ? err.response.data : null);
      if (err?.response?.status === 401 || err?.response?.status === 400) setFormError(msg || "Incorrect email or password.");
      else if (!err?.response) setFormError("Couldn't reach the server. Check your connection.");
      else setFormError(msg || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  const inp = (err) => ({
    width:"100%", height:50, borderRadius:12,
    border:`2px solid ${err ? T.errorBorder : T.border}`,
    padding:"0 16px", fontSize:14, outline:"none",
    background:"#F4FBF7", color:T.ink, fontFamily:"inherit",
    transition:"border-color .15s, box-shadow .15s",
  });

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:`linear-gradient(145deg, ${T.bgDeep} 0%, ${T.bg} 50%, #D6EEE2 100%)`,
      padding:"24px 16px", fontFamily:"Inter, sans-serif", position:"relative", overflow:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,400&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;} a{text-decoration:none;}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        input:focus{border-color:${T.green}!important;box-shadow:0 0 0 3px rgba(45,122,79,.15)!important;}
        .illus{animation:float 6s ease-in-out infinite;}
        @media(max-width:720px){.illus{display:none!important;}}
      `}</style>

      {/* Blob decorations */}
      <div style={{ position:"absolute", top:-100, left:-100, width:340, height:340, borderRadius:"50%", background:T.bgDeep, opacity:.6 }}/>
      <div style={{ position:"absolute", bottom:-80, right:80, width:280, height:280, borderRadius:"50%", background:T.bgDeep, opacity:.5 }}/>
      <DotPattern/>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:48, width:"100%", maxWidth:980, position:"relative", zIndex:5 }}>

        {/* Illustration */}
        <div className="illus" style={{ flex:1, display:"flex", justifyContent:"center" }}>
          <DoctorsSVG/>
        </div>

        {/* Card */}
        <div style={{
          width:370, background:T.white, borderRadius:28,
          boxShadow:"0 24px 70px rgba(45,122,79,.18), 0 6px 24px rgba(0,0,0,.07)",
          padding:"44px 38px 40px", flexShrink:0,
        }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:30 }}>
            <CCLogo size={52}/>
            <span style={{ fontFamily:"Fraunces, serif", fontWeight:700, fontSize:13, color:T.green, letterSpacing:2, textTransform:"uppercase", marginTop:10 }}>CareConnect</span>
          </div>

          <h1 style={{ fontFamily:"Fraunces, serif", fontWeight:900, fontSize:24, color:T.ink, margin:"0 0 6px", textAlign:"center" }}>Welcome Back</h1>
          <p style={{ fontSize:13, color:T.muted, textAlign:"center", margin:"0 0 28px" }}>Please enter your credentials to continue</p>

          {formError && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"11px 14px", borderRadius:12, marginBottom:20, fontSize:13, background:T.errorBg, border:`1px solid ${T.errorBorder}`, color:T.errorText }}>
              <AlertCircle size={15} style={{ flexShrink:0, marginTop:1 }}/>{formError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:7 }}>Email Address</label>
              <input type="email" autoComplete="email" placeholder="Enter your email"
                value={email} onChange={e => { setEmail(e.target.value); clearErr("email"); }}
                style={inp(errors.email)}/>
              {errors.email && <p style={{ fontSize:12, color:T.errorText, marginTop:4 }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom:8 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:7 }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPwd?"text":"password"} autoComplete="current-password" placeholder="Enter your password"
                  value={password} onChange={e => { setPassword(e.target.value); clearErr("password"); }}
                  style={{ ...inp(errors.password), paddingRight:46 }}/>
                <button type="button" onClick={() => setShowPwd(p=>!p)}
                  style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:T.muted, display:"flex" }}>
                  {showPwd ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
              {errors.password && <p style={{ fontSize:12, color:T.errorText, marginTop:4 }}>{errors.password}</p>}
            </div>

            <div style={{ textAlign:"right", marginBottom:26 }}>
              <Link to="/forgot-password" style={{ fontSize:12, fontWeight:600, color:T.green }}>Forgot Password?</Link>
            </div>

            <button type="submit" disabled={loading} style={{
              width:"100%", height:52, borderRadius:12, border:"none",
              background:`linear-gradient(135deg, ${T.green} 0%, ${T.greenMid} 100%)`,
              color:T.white, fontWeight:700, fontSize:15, letterSpacing:.5,
              cursor:loading?"not-allowed":"pointer", opacity:loading?.75:1,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 6px 18px rgba(45,122,79,.38)", transition:"transform .15s, opacity .15s",
            }}
              onMouseEnter={e=>{ if(!loading) e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
              {loading && <Loader2 size={16} style={{ animation:"spin .8s linear infinite" }}/>}
              {loading ? "Signing in…" : "LOGIN"}
            </button>
          </form>

          <p style={{ textAlign:"center", fontSize:13, color:T.muted, marginTop:24 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ fontWeight:700, color:T.green }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}