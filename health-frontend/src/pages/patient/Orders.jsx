import { useEffect, useMemo, useState } from "react";
import { Search, Package, Plus, ChevronRight } from "lucide-react";
import api from "../../api/axios";

const C = {
    cream: "#FAF8F3",
    forest: "#16332B",
    forestHover: "#0F231D",
    terracotta: "#B5562C",
    border: "#E4DFD3",
    cardAlt: "#EFEAE0",
    white: "#FFFFFF",
};

const FRAUNCES = "'Fraunces', Georgia, serif";
const INTER = "'Inter', system-ui, sans-serif";
const IMG_BASE = "http://localhost:5008";

const PAYMENT_STYLES = {
    Paid: { bg: "#E9F2EC", text: "#2F6B47" },
    Pending: { bg: "#FFF4E0", text: "#B3791E" },
    Failed: { bg: "#FBEAE5", text: "#9E3A20" },
};

const STATUS_STYLES = {
    Pending: { bg: "#FFF4E0", text: "#B3791E" },
    Confirmed: { bg: "#E9F1FB", text: "#2A5C9E" },
    Delivered: { bg: "#E9F2EC", text: "#2F6B47" },
    Cancelled: { bg: "#FBEAE5", text: "#9E3A20" },
};

const TABS = ["All", "Pending", "Confirmed", "Delivered", "Cancelled"];

function Pill({ label, tone }) {
    const s = tone || { bg: C.cardAlt, text: `${C.forest}8C` };
    return (
        <span style={{
            display: "inline-block", padding: "4px 10px", borderRadius: 999,
            fontSize: 11, fontWeight: 600, backgroundColor: s.bg, color: s.text,
            whiteSpace: "nowrap",
        }}>
            {label}
        </span>
    );
}

function SkeletonGrid() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                    backgroundColor: C.white, borderRadius: 18, border: `1px solid ${C.border}`,
                    padding: 18, animation: "orders-pulse 1.4s ease-in-out infinite",
                }}>
                    <style>{`@keyframes orders-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
                    <div style={{ height: 12, width: 100, backgroundColor: C.cardAlt, borderRadius: 999, marginBottom: 14 }} />
                    <div style={{ height: 72, width: 72, backgroundColor: C.cardAlt, borderRadius: 14, marginBottom: 14 }} />
                    <div style={{ height: 12, width: 150, backgroundColor: C.cardAlt, borderRadius: 999, marginBottom: 8 }} />
                    <div style={{ height: 10, width: 90, backgroundColor: C.cardAlt, borderRadius: 999 }} />
                </div>
            ))}
        </div>
    );
}

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await api.get("/patient/orders");
            setOrders(res.data || []);
        } catch (err) {
            console.log(err);
            setErrorMsg("Couldn't load your orders right now. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = async (orderId) => {
        try {
            const res = await api.get(`/patient/orders/${orderId}/invoice`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `MedicineInvoice-${orderId}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Failed to download invoice.");
        }
    };

    const filteredOrders = useMemo(() => {
        let result = orders;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter(
                (o) =>
                    String(o.id).includes(search.trim()) ||
                    (o.items || []).some((i) => i.productName?.toLowerCase().includes(q))
            );
        }
        if (activeTab !== "All") result = result.filter((o) => o.status === activeTab);
        return result;
    }, [orders, search, activeTab]);

    const stats = useMemo(
        () => ({
            today: orders.filter((o) => new Date(o.orderDate).toDateString() === new Date().toDateString()).length,
            total: orders.length,
            cancelled: orders.filter((o) => o.status === "Cancelled").length,
            failed: orders.filter((o) => o.paymentStatus === "Failed").length,
            totalSpent: orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
        }),
        [orders]
    );

    return (
        <div style={{ minHeight: "100vh", backgroundColor: C.cream, color: C.forest, fontFamily: INTER }}>
            <div style={{ width: "100%", maxWidth: 1440, margin: "0 auto", padding: "40px 32px 96px" }}>

                {/* ── Header ── */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 40 }}>
                    <div>
                        <p style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.22em", color: "#3E7C59", fontWeight: 600, margin: "0 0 20px" }}>
                            Order history
                        </p>
                        <h1 style={{ fontFamily: FRAUNCES, fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.01em", margin: 0 }}>
                            <span style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}>Everything you've</span>
                            <br />
                            <span style={{ fontStyle: "italic", color: C.terracotta, fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}>
                                ordered, in one place.
                            </span>
                        </h1>
                    </div>

                    <a
                        href="/patient/products"
                        style={{
                            flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
                            backgroundColor: C.forest, color: C.white, padding: "14px 24px", borderRadius: 999,
                            fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.forestHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.forest)}
                    >
                        <Plus size={15} />
                        Order medicine
                    </a>
                </div>

                {/* ── Stats strip ── */}
                {!loading && !errorMsg && orders.length > 0 && (
                    <div style={{ border: `1px solid ${C.border}`, backgroundColor: C.white, borderRadius: 20, marginBottom: 32, overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
                            {[
                                { label: "Today", value: stats.today },
                                { label: "Total orders", value: stats.total },
                                { label: "Cancelled", value: stats.cancelled, tone: stats.cancelled > 0 ? "#9E3A20" : undefined },
                                { label: "Failed payments", value: stats.failed, tone: stats.failed > 0 ? "#B3791E" : undefined },
                                { label: "Total spent", value: `₹${stats.totalSpent}` },
                            ].map((s, i) => (
                                <div key={s.label} style={{ padding: 20, borderLeft: i !== 0 ? `1px solid ${C.border}` : "none" }}>
                                    <p style={{ fontSize: 12, color: `${C.forest}80`, margin: 0 }}>{s.label}</p>
                                    <p style={{ fontFamily: FRAUNCES, fontWeight: 500, color: s.tone || C.forest, fontSize: "1.6rem", lineHeight: 1, margin: "8px 0 0" }}>
                                        {s.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Error ── */}
                {errorMsg && (
                    <div style={{ marginBottom: 28, backgroundColor: "#FBEAE5", border: "1px solid #E8B8AA", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ color: "#9E3A20", fontSize: 14, margin: 0 }}>{errorMsg}</p>
                        <button onClick={loadOrders} style={{ color: "#9E3A20", fontSize: 12, fontWeight: 600, textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Loading ── */}
                {loading && <SkeletonGrid />}

                {/* ── Toolbar: tabs + search ── */}
                {!loading && !errorMsg && orders.length > 0 && (
                    <>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {TABS.map((tab) => {
                                    const active = activeTab === tab;
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            style={{
                                                padding: "8px 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 500,
                                                border: `1px solid ${active ? C.forest : C.border}`,
                                                backgroundColor: active ? C.forest : C.white,
                                                color: active ? C.white : `${C.forest}80`,
                                                cursor: "pointer", transition: "all 0.15s ease", whiteSpace: "nowrap",
                                            }}
                                        >
                                            {tab}
                                        </button>
                                    );
                                })}
                            </div>

                            <div style={{ position: "relative" }}>
                                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: `${C.forest}59` }} />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by order ID or medicine"
                                    style={{
                                        height: 40, paddingLeft: 34, paddingRight: 16, borderRadius: 12,
                                        border: `1px solid ${C.border}`, fontSize: 13.5, outline: "none",
                                        backgroundColor: C.white, width: 260, fontFamily: INTER, color: C.forest,
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                        </div>

                        {/* ── Card grid ── */}
                        {filteredOrders.length === 0 ? (
                            <div style={{ padding: "56px 20px", textAlign: "center", color: `${C.forest}66`, fontSize: 14, backgroundColor: C.white, borderRadius: 18, border: `1px solid ${C.border}` }}>
                                No orders match your search.
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                                {filteredOrders.map((o) => {
                                    const items = o.items || [];
                                    const first = items[0];
                                    const extraCount = items.length - 1;
                                    const hovered = hoveredCard === o.id;

                                    return (
                                        <div
                                            key={o.id}
                                            onMouseEnter={() => setHoveredCard(o.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            style={{
                                                backgroundColor: C.white, borderRadius: 18,
                                                border: `1px solid ${hovered ? C.forest + "55" : C.border}`,
                                                padding: 18, display: "flex", flexDirection: "column",
                                                boxShadow: hovered ? "0 8px 24px -12px rgba(22,51,43,0.18)" : "none",
                                                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                                            }}
                                        >
                                            {/* top row: order id/date + status */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 700, color: C.forest, margin: 0 }}>#{o.id}</p>
                                                    <p style={{ fontSize: 11, color: `${C.forest}59`, margin: "3px 0 0" }}>
                                                        {new Date(o.orderDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                    </p>
                                                </div>
                                                <Pill label={o.status || "Pending"} tone={STATUS_STYLES[o.status]} />
                                            </div>

                                            {/* product preview */}
                                            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                                                <div style={{
                                                    width: 60, height: 60, borderRadius: 12, flexShrink: 0,
                                                    background: `linear-gradient(160deg, ${C.cream}, ${C.cardAlt})`,
                                                    border: `1px solid ${C.border}`,
                                                    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                                                }}>
                                                    {first?.imageUrl ? (
                                                        <img src={`${IMG_BASE}${first.imageUrl}`} alt={first.productName} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 5 }} />
                                                    ) : (
                                                        <Package size={18} color={`${C.forest}40`} />
                                                    )}
                                                </div>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <p style={{ fontSize: 13.5, fontWeight: 600, color: C.forest, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {first?.productName || "No items on record"}
                                                    </p>
                                                    {first && (
                                                        <p style={{ fontSize: 12, color: `${C.forest}66`, margin: "4px 0 0" }}>
                                                            Qty {first.quantity} · ₹{first.unitPrice} each
                                                        </p>
                                                    )}
                                                    {extraCount > 0 && (
                                                        <p style={{ fontSize: 11.5, color: C.terracotta, margin: "4px 0 0", fontWeight: 500 }}>
                                                            +{extraCount} more {extraCount === 1 ? "item" : "items"}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* payment pill */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                                <Pill label={o.paymentStatus || "—"} tone={PAYMENT_STYLES[o.paymentStatus]} />
                                                <span style={{ fontSize: 11, color: `${C.forest}59` }}>
                                                    {o.paymentMode === "Online" ? "Paid online" : "Cash on delivery"}
                                                </span>
                                            </div>

                                            {/* footer: item count, total, details */}
                                            <div style={{
                                                marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between",
                                                paddingTop: 14, borderTop: `1px solid ${C.cardAlt}`,
                                            }}>
                                                <div>
                                                    <p style={{ fontSize: 11, color: `${C.forest}59`, margin: 0 }}>
                                                        {items.length} {items.length === 1 ? "item" : "items"}
                                                    </p>
                                                    <p style={{ fontFamily: FRAUNCES, fontWeight: 500, fontSize: "1.1rem", margin: "2px 0 0" }}>
                                                        ₹{o.totalAmount}
                                                    </p>
                                                </div>

                                                {o.status === "Delivered" ? (
                                                    <button
                                                        onClick={() => downloadInvoice(o.id)}
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: 5,
                                                            padding: "8px 14px", borderRadius: 999,
                                                            backgroundColor: C.forest, color: C.white,
                                                            fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                                                            transition: "background-color 0.15s ease", whiteSpace: "nowrap",
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.forestHover)}
                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.forest)}
                                                    >
                                                        Invoice
                                                    </button>
                                                ) : (
                                                    <button
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: 3,
                                                            padding: "8px 12px", borderRadius: 999,
                                                            backgroundColor: "transparent", color: C.forest,
                                                            fontSize: 12, fontWeight: 600, border: `1px solid ${C.border}`, cursor: "pointer",
                                                            transition: "background-color 0.15s ease", whiteSpace: "nowrap",
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.cream)}
                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                                    >
                                                        Details
                                                        <ChevronRight size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ── Empty state ── */}
                {!loading && !errorMsg && orders.length === 0 && (
                    <div style={{ backgroundColor: C.white, borderRadius: 24, border: `1px solid ${C.border}`, padding: "96px 20px", textAlign: "center" }}>
                        <div style={{ width: 64, height: 64, margin: "0 auto", borderRadius: 16, backgroundColor: C.cream, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                            <Package color={`${C.forest}59`} size={26} strokeWidth={1.5} />
                        </div>
                        <h3 style={{ fontFamily: FRAUNCES, fontWeight: 500, fontSize: "1.4rem", margin: 0 }}>No orders yet</h3>
                        <p style={{ color: `${C.forest}8C`, marginTop: 8, fontSize: 14 }}>Your medicine orders will show up here once you place one.</p>
                        <a
                            href="/patient/products"
                            style={{
                                display: "inline-block", marginTop: 28, backgroundColor: C.forest, color: C.white,
                                padding: "12px 28px", borderRadius: 999, fontWeight: 600, fontSize: 14, textDecoration: "none",
                                transition: "background-color 0.2s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.forestHover)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.forest)}
                        >
                            Browse pharmacy →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}