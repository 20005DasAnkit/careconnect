import { LogOut, ShieldCheck } from "lucide-react";

const T = {
  ink: "#1A1A1A",
  muted: "#6B7280",
  border: "#E2DACE",
  white: "#FFFFFF",
  red: "#B3441F",
  redLight: "#FAF0EA",
};

export default function Navbar() {
  return (
    <div
      style={{
        height: 64,
        background: T.white,
        borderBottom: `1px solid ${T.border}`,
        boxShadow: "0 2px 8px rgba(0,0,0,.03)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        marginLeft: 264,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ShieldCheck size={16} color={T.muted} />
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, color: T.ink, margin: 0 }}>
          Admin Panel
        </h2>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: T.redLight,
          color: T.red,
          border: "none",
          borderRadius: 999,
          padding: "8px 18px",
          fontWeight: 600,
          fontSize: 13,
          cursor: "pointer",
          transition: "background .15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F5DED0")}
        onMouseLeave={(e) => (e.currentTarget.style.background = T.redLight)}
      >
        <LogOut size={14} /> Logout
      </button>
    </div>
  );
}