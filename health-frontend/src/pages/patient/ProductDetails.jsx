import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Pill, ShieldCheck, Truck, RotateCcw, Check } from "lucide-react";
import api from "../../api/axios";
import { useCart } from "../../context/Cartcontext";

const C = {
    cream: "#FAF8F3",
    forest: "#16332B",
    forestHover: "#0F231D",
    terracotta: "#B5562C",
    border: "#E4DFD3",
    cardAlt: "#EFEAE0",
    white: "#FFFFFF",
    green: "#3E7C59",
};

const FRAUNCES = "'Fraunces', Georgia, serif";
const INTER = "'Inter', system-ui, sans-serif";
const IMG_BASE = "http://localhost:5008";

const QUICK_QTY = [1, 2, 3, 4, 5, 6];

function DetailSkeleton() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 0, animation: "pd-pulse 1.4s ease-in-out infinite" }}>
            <style>{`@keyframes pd-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
            <div style={{ aspectRatio: "1", backgroundColor: C.cardAlt }} />
            <div style={{ padding: 40 }}>
                <div style={{ height: 26, width: "70%", backgroundColor: C.cardAlt, borderRadius: 8, marginBottom: 16 }} />
                <div style={{ height: 12, width: "100%", backgroundColor: C.cardAlt, borderRadius: 999, marginBottom: 8 }} />
                <div style={{ height: 12, width: "80%", backgroundColor: C.cardAlt, borderRadius: 999, marginBottom: 24 }} />
                <div style={{ height: 40, width: "100%", backgroundColor: C.cardAlt, borderRadius: 12 }} />
            </div>
        </div>
    );
}

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [infoOpen, setInfoOpen] = useState(true);

    useEffect(() => {
        loadProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function loadProduct() {
        setLoading(true);
        setNotFound(false);
        try {
            const res = await api.get(`/patient/product/${id}`);
            setProduct(res.data);
            setQuantity(1);
        } catch (err) {
            console.log(err);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }

    function goToOrder() {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        const params = new URLSearchParams({
            productId: product.id,
            quantity,
            productName: product.name || "",
            price: product.price,
        });
        navigate(`/patient/place-order?${params.toString()}`);
    }

    function handleAddToCart() {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        addToCart(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
    }

    const discountPct = product?.mrp && product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : null;
    const maxQty = Math.min(product?.stock || 99, 99);

    return (
        <div style={{ minHeight: "100vh", backgroundColor: C.cream, color: C.forest, fontFamily: INTER }}>
            <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px 0" }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5,
                        color: `${C.forest}80`, background: "none", border: "none", cursor: "pointer", padding: 0,
                        transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C.forest)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = `${C.forest}80`)}
                >
                    <ArrowLeft size={15} /> Back to pharmacy
                </button>
            </div>

            {loading && (
                <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px 96px" }}>
                    <DetailSkeleton />
                </div>
            )}

            {!loading && notFound && (
                <div style={{ maxWidth: 700, margin: "60px auto", backgroundColor: C.white, borderRadius: 24, border: `1px solid ${C.border}`, padding: "72px 20px", textAlign: "center" }}>
                    <div style={{ width: 64, height: 64, margin: "0 auto", borderRadius: 16, backgroundColor: C.cream, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                        <Pill color={`${C.forest}59`} size={26} strokeWidth={1.5} />
                    </div>
                    <h3 style={{ fontFamily: FRAUNCES, fontWeight: 500, fontSize: "1.4rem", margin: 0 }}>Product not found</h3>
                    <p style={{ color: `${C.forest}8C`, marginTop: 8, fontSize: 14 }}>This item may have been removed or is no longer listed.</p>
                    <Link
                        to="/patient/products"
                        style={{ display: "inline-block", marginTop: 24, backgroundColor: C.forest, color: C.white, padding: "10px 26px", borderRadius: 999, fontSize: 14, fontWeight: 500, textDecoration: "none" }}
                    >
                        Browse pharmacy
                    </Link>
                </div>
            )}

            {!loading && !notFound && product && (
                <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px 96px" }}>
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 420px",
                        backgroundColor: C.white, borderRadius: 28, border: `1px solid ${C.border}`,
                        overflow: "hidden", boxShadow: "0 1px 2px rgba(22,51,43,0.04), 0 24px 48px -32px rgba(22,51,43,0.16)",
                    }}>
                        {/* ── Image panel ── */}
                        <div style={{
                            position: "relative", backgroundColor: C.cream,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: 60, minHeight: 480,
                        }}>
                            {/* soft accent shape behind image */}
                            <div style={{
                                position: "absolute", width: 260, height: 260, borderRadius: "50%",
                                background: `radial-gradient(circle, ${C.terracotta}18, transparent 70%)`,
                            }} />

                            {product.imageUrl ? (
                                <img
                                    src={`${IMG_BASE}${product.imageUrl}`}
                                    alt={product.name}
                                    style={{ position: "relative", maxWidth: "100%", maxHeight: 360, objectFit: "contain" }}
                                />
                            ) : (
                                <Pill size={72} color={`${C.forest}22`} strokeWidth={1.5} style={{ position: "relative" }} />
                            )}

                            {product.stock === 0 && (
                                <div style={{ position: "absolute", inset: 0, backgroundColor: `${C.white}CC`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ backgroundColor: C.forest, color: C.white, fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 999 }}>
                                        Out of stock
                                    </span>
                                </div>
                            )}

                            {product.category && (
                                <span style={{
                                    position: "absolute", top: 20, left: 20, backgroundColor: `${C.white}E6`,
                                    color: `${C.forest}A6`, fontSize: 11.5, padding: "6px 12px", borderRadius: 999, fontWeight: 500,
                                }}>
                                    {product.category}
                                </span>
                            )}

                            {/* carousel-style dots (single image, decorative anchor point) */}
                            <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                                {[0, 1, 2].map((i) => (
                                    <span key={i} style={{
                                        width: i === 0 ? 16 : 6, height: 6, borderRadius: 999,
                                        backgroundColor: i === 0 ? C.forest : `${C.forest}30`,
                                        transition: "all 0.2s ease",
                                    }} />
                                ))}
                            </div>
                        </div>

                        {/* ── Info panel ── */}
                        <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column" }}>
                            <h1 style={{ fontFamily: FRAUNCES, fontWeight: 500, fontSize: "1.7rem", lineHeight: 1.15, margin: 0 }}>
                                {product.name}
                            </h1>

                            <button
                                onClick={() => setInfoOpen((v) => !v)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6, marginTop: 8, marginBottom: 0,
                                    fontSize: 12.5, fontWeight: 600, color: C.terracotta, background: "none", border: "none",
                                    cursor: "pointer", padding: 0, alignSelf: "flex-start",
                                }}
                            >
                                {infoOpen ? "Hide details" : "More info"}
                            </button>

                            {infoOpen && product.description && (
                                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: `${C.forest}80`, margin: "12px 0 0" }}>
                                    {product.description}
                                </p>
                            )}

                            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 22, paddingTop: 20 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: `${C.forest}80`, margin: "0 0 10px" }}>
                                    Category
                                </p>
                                <span style={{
                                    display: "inline-block", padding: "6px 14px", borderRadius: 999,
                                    backgroundColor: C.cream, border: `1px solid ${C.border}`, fontSize: 12.5, color: C.forest, fontWeight: 500,
                                }}>
                                    {product.category || "General"}
                                </span>
                            </div>

                            {/* quantity as size-grid pills */}
                            <div style={{ marginTop: 22 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: `${C.forest}80`, margin: "0 0 10px" }}>
                                    Quantity
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {QUICK_QTY.map((n) => {
                                        const disabled = n > maxQty;
                                        const active = quantity === n;
                                        return (
                                            <button
                                                key={n}
                                                disabled={disabled}
                                                onClick={() => setQuantity(n)}
                                                style={{
                                                    width: 40, height: 40, borderRadius: 10,
                                                    border: `1px solid ${active ? C.forest : C.border}`,
                                                    backgroundColor: active ? C.forest : disabled ? C.cardAlt : C.white,
                                                    color: active ? C.white : disabled ? `${C.forest}30` : C.forest,
                                                    fontSize: 13.5, fontWeight: 600,
                                                    cursor: disabled ? "not-allowed" : "pointer",
                                                    transition: "all 0.15s ease",
                                                }}
                                            >
                                                {n}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p style={{ fontSize: 12, color: `${C.forest}59`, margin: "10px 0 0" }}>
                                    {product.stock > 0 ? (
                                        product.stock < 10 ? (
                                            <span style={{ color: C.terracotta, fontWeight: 500 }}>Only {product.stock} left in stock</span>
                                        ) : (
                                            `${product.stock} in stock`
                                        )
                                    ) : (
                                        <span style={{ color: "#9E3A20" }}>Currently out of stock</span>
                                    )}
                                </p>
                            </div>

                            {/* trust strip */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                                {[
                                    { icon: <ShieldCheck size={16} />, label: "Verified stock" },
                                    { icon: <Truck size={16} />, label: "Fast delivery" },
                                    { icon: <RotateCcw size={16} />, label: "Easy replace" },
                                ].map((t) => (
                                    <div key={t.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6 }}>
                                        <span style={{ color: C.green }}>{t.icon}</span>
                                        <p style={{ fontSize: 11, color: `${C.forest}66`, margin: 0, lineHeight: 1.3 }}>{t.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ flex: 1 }} />

                            {/* sticky-feel buy bar */}
                            <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                    <div>
                                        <p style={{ fontSize: 11, color: `${C.forest}59`, margin: 0 }}>Total for {quantity}</p>
                                        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                                            <span style={{ fontFamily: FRAUNCES, fontWeight: 500, fontSize: "1.6rem" }}>
                                                ₹{(product.price * quantity).toFixed(2)}
                                            </span>
                                            {product.mrp && product.mrp > product.price && (
                                                <span style={{ fontSize: 13, color: `${C.forest}35`, textDecoration: "line-through" }}>
                                                    ₹{(product.mrp * quantity).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {discountPct && (
                                        <span style={{ fontSize: 12.5, color: C.green, fontWeight: 600 }}>{discountPct}% off</span>
                                    )}
                                </div>

                                <div style={{ display: "flex", gap: 10 }}>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        style={{
                                            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            border: `1px solid ${added ? C.green : C.border}`,
                                            backgroundColor: product.stock === 0 ? C.cardAlt : added ? "#EAF3EC" : C.white,
                                            color: product.stock === 0 ? `${C.forest}30` : added ? C.green : C.forest,
                                            cursor: product.stock === 0 ? "not-allowed" : "pointer",
                                            transition: "all 0.2s ease",
                                        }}
                                        title="Add to cart"
                                    >
                                        {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                                    </button>

                                    <button
                                        onClick={goToOrder}
                                        disabled={product.stock === 0}
                                        style={{
                                            flex: 1, height: 52, borderRadius: 14, fontSize: 14.5, fontWeight: 700,
                                            letterSpacing: "0.01em",
                                            backgroundColor: product.stock === 0 ? C.cardAlt : C.terracotta,
                                            color: product.stock === 0 ? `${C.forest}30` : C.white,
                                            border: "none", cursor: product.stock === 0 ? "not-allowed" : "pointer",
                                            transition: "background-color 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => { if (product.stock !== 0) e.currentTarget.style.backgroundColor = "#9C4A25"; }}
                                        onMouseLeave={(e) => { if (product.stock !== 0) e.currentTarget.style.backgroundColor = C.terracotta; }}
                                    >
                                        Buy now
                                    </button>
                                </div>

                                <p style={{ fontSize: 11, color: `${C.forest}55`, textAlign: "center", marginTop: 12 }}>
                                    Ordering multiple medicines? Add each to cart, then checkout once.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}