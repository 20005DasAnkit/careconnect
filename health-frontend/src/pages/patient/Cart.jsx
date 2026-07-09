import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import api from "../../api/axios";
import { useCart } from "../../context/Cartcontext";
import { useIsMobile } from "../../hooks/useIsMobile";

const C = {
    cream: "#FAF8F3",
    forest: "#16332B",
    forestHover: "#0F231D",
    terracotta: "#B5562C",
    terracottaBg: "#FAF0EA",
    border: "#E4DFD3",
    cardAlt: "#EFEAE0",
    white: "#FFFFFF",
};

const FRAUNCES = "'Fraunces', Georgia, serif";
const INTER = "'Inter', system-ui, sans-serif";
const IMG_BASE = "http://localhost:5008";

export default function Cart() {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { items, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();

    const [address, setAddress] = useState("");
    const [paymentMode, setPaymentMode] = useState("COD");
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");
    const [addressTouched, setAddressTouched] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [showAddressForm, setShowAddressForm] = useState(false);

    const addressInvalid = addressTouched && !address.trim();
    const shipping = 0;
    const grandTotal = totalAmount + shipping;

    async function placeOrder() {
        setError("");
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        if (!address.trim()) {
            setShowAddressForm(true);
            setAddressTouched(true);
            setError("Add a delivery address to continue.");
            return;
        }
        if (items.length === 0) return;

        setPlacing(true);
        try {
            const payload = {
                deliveryAddress: address,
                paymentMode,
                razorpayPaymentId: paymentMode === "Online" ? "DEMO_PAYMENT_ID" : null,
                items: items.map((x) => ({ productId: x.id, quantity: x.quantity })),
            };
            const res = await api.post("/patient/cart-order", payload);
            clearCart();
            navigate(`/patient/orders`, { state: { placedOrderId: res.data.OrderId } });
        } catch (err) {
            console.log(err);
            setError(typeof err.response?.data === "string" ? err.response.data : "Couldn't place the order. Please try again.");
        } finally {
            setPlacing(false);
        }
    }

    const labelStyle = {
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: `${C.forest}80`,
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: C.cream, color: C.forest, fontFamily: INTER }}>
            <div style={{ width: "100%", maxWidth: 1180, margin: "0 auto", padding: isMobile ? "24px 18px 80px" : "40px 32px 100px" }}>

                <h1
                    style={{
                        fontFamily: FRAUNCES,
                        fontWeight: 500,
                        fontSize: isMobile ? "1.4rem" : "1.6rem",
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                        margin: "0 0 28px",
                        paddingBottom: 20,
                        borderBottom: `1px solid ${C.forest}`,
                    }}
                >
                    My cart
                </h1>

                {items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: isMobile ? 36 : 64, alignItems: "start" }}>

                        {/* ── Product table ── */}
                        <div>
                            {!isMobile && (
                                <div style={{ display: "grid", gridTemplateColumns: "88px 1fr 130px 110px 40px", gap: 16, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                                    <span />
                                    <span style={labelStyle}>Product</span>
                                    <span style={labelStyle}>Price</span>
                                    <span style={{ ...labelStyle, textAlign: "right" }}>Total</span>
                                    <span />
                                </div>
                            )}

                            {items.map((item, idx) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: isMobile ? "flex" : "grid",
                                        gridTemplateColumns: "88px 1fr 130px 110px 40px",
                                        gap: 16,
                                        alignItems: "center",
                                        padding: "22px 0",
                                        borderBottom: `1px solid ${C.border}`,
                                    }}
                                >
                                    <div style={{
                                        width: isMobile ? 64 : 72, height: isMobile ? 64 : 72, borderRadius: 4,
                                        background: `linear-gradient(160deg, ${C.cream}, ${C.cardAlt})`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        overflow: "hidden", flexShrink: 0, border: `1px solid ${C.border}`,
                                    }}>
                                        {item.imageUrl ? (
                                            <img src={`${IMG_BASE}${item.imageUrl}`} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
                                        ) : (
                                            <ShoppingBag size={18} color={`${C.forest}40`} />
                                        )}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: 13.5, letterSpacing: "0.02em", color: C.forest, margin: 0, textTransform: "uppercase" }}>
                                            {item.name}
                                        </p>
                                        {item.category && (
                                            <p style={{ fontSize: 12, color: `${C.forest}66`, margin: "5px 0 0" }}>{item.category}</p>
                                        )}
                                        <p style={{ fontSize: 12, color: `${C.forest}66`, margin: "3px 0 0" }}>Qty: {item.quantity}</p>

                                        <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
                                            <QtyLink onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} label="−" />
                                            <QtyLink onClick={() => updateQuantity(item.id, item.quantity + 1)} label="+" />
                                            <span style={{ color: `${C.forest}33` }}>|</span>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                style={{
                                                    fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
                                                    color: C.terracotta, background: "none", border: "none", cursor: "pointer",
                                                    padding: 0, textDecoration: "underline", textUnderlineOffset: 3,
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        {isMobile && (
                                            <p style={{ fontFamily: FRAUNCES, fontWeight: 500, fontSize: "1rem", margin: "10px 0 0" }}>
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        )}
                                    </div>

                                    {!isMobile && (
                                        <>
                                            <span style={{ fontSize: 13.5, color: `${C.forest}99` }}>₹{item.price.toFixed(2)}</span>
                                            <span style={{ fontFamily: FRAUNCES, fontWeight: 500, fontSize: "1rem", textAlign: "right" }}>
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </span>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                title="Remove item"
                                                aria-label={`Remove ${item.name}`}
                                                style={{
                                                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                                                    background: "none", border: "none", cursor: "pointer", color: `${C.forest}55`,
                                                    justifySelf: "end",
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = C.terracotta)}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = `${C.forest}55`)}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}

                            <Link
                                to="/patient/products"
                                style={{
                                    display: "inline-block", marginTop: 24, fontSize: 12, fontWeight: 600,
                                    letterSpacing: "0.08em", textTransform: "uppercase", color: C.forest,
                                    textDecoration: "underline", textUnderlineOffset: 4,
                                }}
                            >
                                ← Continue shopping
                            </Link>
                        </div>

                        {/* ── Summary sidebar ── */}
                        <div style={{ position: isMobile ? "static" : "sticky", top: 28 }}>
                            <h3 style={{ ...labelStyle, fontSize: 13, letterSpacing: "0.14em", margin: "0 0 20px" }}>
                                Summary
                            </h3>

                            <p style={{ fontSize: 12.5, color: `${C.forest}80`, margin: "0 0 8px" }}>Do you have a promo code?</p>
                            <div style={{ display: "flex", marginBottom: 24 }}>
                                <input
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="Enter code"
                                    style={{
                                        flex: 1, height: 40, padding: "0 12px", fontSize: 13, fontFamily: INTER,
                                        border: `1px solid ${C.border}`, borderRight: "none", outline: "none",
                                        backgroundColor: C.white, color: C.forest, borderRadius: "3px 0 0 3px",
                                    }}
                                />
                                <button
                                    style={{
                                        padding: "0 18px", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em",
                                        textTransform: "uppercase", backgroundColor: C.forest, color: C.white,
                                        border: "none", borderRadius: "0 3px 3px 0", cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.forestHover)}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.forest)}
                                >
                                    Apply
                                </button>
                            </div>

                            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
                                <SummaryRow label="Subtotal" value={`₹${totalAmount.toFixed(2)}`} />
                                <SummaryRow label="Shipping" value={shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`} />
                                <SummaryRow label="Sales tax" value="—" muted />
                            </div>

                            <div style={{
                                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                                borderTop: `1px solid ${C.border}`, marginTop: 6, paddingTop: 18, marginBottom: 22,
                            }}>
                                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                    Estimated total
                                </span>
                                <span style={{ fontFamily: FRAUNCES, fontWeight: 500, fontSize: "1.3rem" }}>
                                    ₹{grandTotal.toFixed(2)}
                                </span>
                            </div>

                            {showAddressForm && (
                                <div style={{ marginBottom: 18 }}>
                                    <p style={{ ...labelStyle, marginBottom: 8 }}>Delivery address</p>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        onBlur={() => setAddressTouched(true)}
                                        rows={3}
                                        placeholder="Full address with pin code"
                                        style={{
                                            width: "100%", padding: 12, fontSize: 13, fontFamily: INTER, color: C.forest,
                                            border: `1px solid ${addressInvalid ? C.terracotta : C.border}`,
                                            outline: "none", resize: "none", boxSizing: "border-box", borderRadius: 3,
                                            backgroundColor: C.white,
                                        }}
                                    />
                                    {addressInvalid && (
                                        <p style={{ fontSize: 11.5, color: C.terracotta, margin: "6px 0 0" }}>Address is required</p>
                                    )}

                                    <p style={{ ...labelStyle, margin: "16px 0 8px" }}>Payment</p>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {["COD", "Online"].map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setPaymentMode(mode)}
                                                style={{
                                                    flex: 1, padding: "9px 0", fontSize: 12, fontWeight: 600,
                                                    letterSpacing: "0.03em", textTransform: "uppercase",
                                                    border: `1px solid ${paymentMode === mode ? C.forest : C.border}`,
                                                    backgroundColor: paymentMode === mode ? C.forest : C.white,
                                                    color: paymentMode === mode ? C.white : `${C.forest}80`,
                                                    cursor: "pointer", borderRadius: 3, transition: "all 0.15s ease",
                                                }}
                                            >
                                                {mode === "COD" ? "Cash" : "Online"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <p style={{ fontSize: 12, color: C.terracotta, margin: "0 0 14px" }}>{error}</p>
                            )}

                            <button
                                onClick={placeOrder}
                                disabled={placing}
                                style={{
                                    width: "100%", height: 48, backgroundColor: C.forest, color: C.white,
                                    fontSize: 12.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                                    border: "none", borderRadius: 3, cursor: placing ? "default" : "pointer",
                                    opacity: placing ? 0.6 : 1, transition: "background-color 0.2s ease",
                                }}
                                onMouseEnter={(e) => { if (!placing) e.currentTarget.style.backgroundColor = C.forestHover; }}
                                onMouseLeave={(e) => { if (!placing) e.currentTarget.style.backgroundColor = C.forest; }}
                            >
                                {placing ? "Placing order…" : "Checkout"}
                            </button>

                            <p style={{ fontSize: 11.5, color: `${C.forest}66`, textAlign: "center", marginTop: 16 }}>
                                Need help? Contact support at{" "}
                                <span style={{ color: C.forest, fontWeight: 600 }}>1800-000-0000</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ────────────────────────────── subcomponents ────────────────────────────── */

function EmptyCart() {
    return (
        <div style={{ padding: "80px 20px", textAlign: "center", borderTop: `1px solid ${C.border}` }}>
            <ShoppingBag color={`${C.forest}40`} size={30} strokeWidth={1.3} style={{ marginBottom: 18 }} />
            <h3 style={{ fontFamily: FRAUNCES, fontWeight: 500, fontSize: "1.3rem", margin: 0 }}>Your cart is empty</h3>
            <p style={{ color: `${C.forest}80`, marginTop: 8, fontSize: 13.5 }}>Add a few medicines from the pharmacy to get started.</p>
            <Link
                to="/patient/products"
                style={{
                    display: "inline-block", marginTop: 22, fontSize: 12, fontWeight: 700,
                    letterSpacing: "0.08em", textTransform: "uppercase", color: C.white,
                    backgroundColor: C.forest, padding: "13px 32px", borderRadius: 3, textDecoration: "none",
                }}
            >
                Browse pharmacy
            </Link>
        </div>
    );
}

function QtyLink({ onClick, disabled, label }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                fontSize: 13, fontWeight: 600, color: disabled ? `${C.forest}30` : C.forest,
                background: "none", border: "none", cursor: disabled ? "not-allowed" : "pointer", padding: 0,
                width: 16,
            }}
        >
            {label}
        </button>
    );
}

function SummaryRow({ label, value, muted }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 12 }}>
            <span style={{ color: `${C.forest}80` }}>{label}</span>
            <span style={{ color: muted ? `${C.forest}55` : C.forest, fontWeight: muted ? 400 : 500 }}>{value}</span>
        </div>
    );
}