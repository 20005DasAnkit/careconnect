import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    Minus,
    Plus,
    ShoppingCart,
    Pill,
    ShieldCheck,
    Truck,
    RotateCcw,
    Check,
} from "lucide-react";
import api from "../../api/axios";
import { useCart } from "../../context/Cartcontext";

function DetailSkeleton() {
    return (
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-[#EFEAE0] rounded-[24px]" />
            <div className="space-y-4 pt-2">
                <div className="h-4 bg-[#EFEAE0] rounded-full w-24" />
                <div className="h-8 bg-[#EFEAE0] rounded-full w-2/3" />
                <div className="h-4 bg-[#EFEAE0] rounded-full w-full" />
                <div className="h-4 bg-[#EFEAE0] rounded-full w-5/6" />
                <div className="h-10 bg-[#EFEAE0] rounded-full w-40 mt-6" />
                <div className="h-12 bg-[#EFEAE0] rounded-full w-full mt-6" />
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

        if (!token) {
            navigate("/login");
            return;
        }

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

        if (!token) {
            navigate("/login");
            return;
        }

        addToCart(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
    }

    const discountPct =
        product?.mrp && product.mrp > product.price
            ? Math.round((1 - product.price / product.mrp) * 100)
            : null;

    return (
        <div
            className="min-h-screen bg-[#FAF8F3] text-[#16332B]"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
            <div className="w-full max-w-[1200px] mx-auto px-8 lg:px-16 py-10">

                {/* ───────────────────── BACK LINK ───────────────────── */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-sm text-[#16332B]/55 hover:text-[#16332B] transition"
                    >
                        <ArrowLeft size={15} />
                        Back to pharmacy
                    </button>

                    <Link
                        to="/patient/cart"
                        className="w-10 h-10 rounded-full bg-[#16332B] text-white flex items-center justify-center hover:bg-[#0F231D] transition"
                        title="View cart"
                    >
                        <ShoppingCart size={16} />
                    </Link>
                </div>

                {/* ───────────────────── LOADING ───────────────────── */}
                {loading && <DetailSkeleton />}

                {/* ───────────────────── NOT FOUND ───────────────────── */}
                {!loading && notFound && (
                    <div className="bg-white rounded-[24px] border border-[#E4DFD3] py-20 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FAF8F3] flex items-center justify-center mb-5">
                            <Pill className="text-[#16332B]/35" size={26} strokeWidth={1.5} />
                        </div>
                        <h3
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="text-[1.4rem]"
                        >
                            Product not found
                        </h3>
                        <p className="text-[#16332B]/55 mt-2 text-sm">
                            This item may have been removed or is no longer listed.
                        </p>
                        <Link
                            to="/patient/products"
                            className="inline-block mt-6 bg-[#16332B] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#0F231D] transition"
                        >
                            Browse pharmacy
                        </Link>
                    </div>
                )}

                {/* ───────────────────── PRODUCT DETAIL ───────────────────── */}
                {!loading && !notFound && product && (
                    <div className="grid md:grid-cols-2 gap-12">

                        {/* ── Image ── */}
                        <div className="relative aspect-square bg-gradient-to-br from-[#FAF8F3] to-[#EFEAE0] rounded-[24px] border border-[#E4DFD3] flex items-center justify-center overflow-hidden">
                            {product.imageUrl ? (
                                <img
                                    src={`http://localhost:5008${product.imageUrl}`}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-10"
                                />
                            ) : (
                                <Pill size={64} className="text-[#16332B]/20" strokeWidth={1.5} />
                            )}

                            {product.stock === 0 && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <span className="bg-[#16332B] text-white text-sm font-semibold px-4 py-2 rounded-full">
                                        Out of stock
                                    </span>
                                </div>
                            )}

                            {product.category && (
                                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#16332B]/65 text-xs px-3 py-1.5 rounded-full font-medium">
                                    {product.category}
                                </span>
                            )}
                        </div>

                        {/* ── Info ── */}
                        <div className="pt-1">
                            <p className="text-[13px] uppercase tracking-[0.2em] text-[#3E7C59] font-semibold mb-3">
                                {product.category || "Medicine"}
                            </p>

                            <h1
                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                className="text-[2.1rem] leading-[1.1]"
                            >
                                {product.name}
                            </h1>

                            {product.description && (
                                <p className="text-[15px] leading-7 text-[#16332B]/65 mt-4">
                                    {product.description}
                                </p>
                            )}

                            {/* Price */}
                            <div className="flex items-end gap-3 mt-6">
                                <span
                                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                    className="text-[2rem] leading-none"
                                >
                                    ₹{product.price}
                                </span>
                                {product.mrp && product.mrp > product.price && (
                                    <span className="text-base text-[#16332B]/35 line-through">
                                        ₹{product.mrp}
                                    </span>
                                )}
                                {discountPct && (
                                    <span className="text-sm text-[#3E7C59] font-semibold">
                                        {discountPct}% off
                                    </span>
                                )}
                            </div>

                            {/* Stock */}
                            <p className="text-sm mt-2 text-[#16332B]/50">
                                {product.stock > 0 ? (
                                    <span className={product.stock < 10 ? "text-[#B5562C] font-medium" : ""}>
                                        {product.stock < 10
                                            ? `Only ${product.stock} left in stock`
                                            : `${product.stock} in stock`}
                                    </span>
                                ) : (
                                    <span className="text-[#9E3A20]">Currently out of stock</span>
                                )}
                            </p>

                            {/* Quantity */}
                            <div className="flex items-center gap-3 mt-8">
                                <div className="flex items-center border border-[#E4DFD3] rounded-full overflow-hidden bg-white">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="w-11 h-11 flex items-center justify-center text-[#16332B]/55 hover:bg-[#FAF8F3]"
                                    >
                                        <Minus size={15} />
                                    </button>
                                    <span className="w-10 text-center text-sm font-semibold text-[#16332B]">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setQuantity((q) => Math.min(product.stock || 99, q + 1))
                                        }
                                        className="w-11 h-11 flex items-center justify-center text-[#16332B]/55 hover:bg-[#FAF8F3]"
                                    >
                                        <Plus size={15} />
                                    </button>
                                </div>

                                <span className="text-sm text-[#16332B]/45">
                                    ₹{(product.price * quantity).toFixed(2)} total
                                </span>
                            </div>

                            {/* Actions — Add to cart (for multi-item orders) + Order now (single item, fast checkout) */}
                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-full text-sm font-semibold border transition ${
                                        product.stock === 0
                                            ? "bg-[#EFEAE0] text-[#16332B]/35 border-[#EFEAE0] cursor-not-allowed"
                                            : added
                                            ? "bg-[#EAF3EC] text-[#3E7C59] border-[#3E7C59]/30"
                                            : "bg-white text-[#16332B] border-[#E4DFD3] hover:border-[#16332B]/30"
                                    }`}
                                >
                                    {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                                    {added ? "Added to cart" : "Add to cart"}
                                </button>

                                <button
                                    onClick={goToOrder}
                                    disabled={product.stock === 0}
                                    className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition ${
                                        product.stock === 0
                                            ? "bg-[#EFEAE0] text-[#16332B]/35 cursor-not-allowed"
                                            : "bg-[#16332B] hover:bg-[#0F231D] text-white"
                                    }`}
                                >
                                    Order now
                                </button>
                            </div>

                            <p className="text-xs text-[#16332B]/40 mt-3">
                                Ordering 2–3 medicines together? Use <span className="font-medium">Add to cart</span> for each, then checkout once from your cart.
                            </p>

                            {/* Trust strip */}
                            <div className="grid grid-cols-3 gap-4 mt-9 pt-8 border-t border-[#E4DFD3]">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <ShieldCheck size={18} className="text-[#3E7C59]" strokeWidth={1.75} />
                                    <p className="text-[12px] text-[#16332B]/55 leading-tight">
                                        Verified pharmacy stock
                                    </p>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <Truck size={18} className="text-[#3E7C59]" strokeWidth={1.75} />
                                    <p className="text-[12px] text-[#16332B]/55 leading-tight">
                                        Fast doorstep delivery
                                    </p>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <RotateCcw size={18} className="text-[#3E7C59]" strokeWidth={1.75} />
                                    <p className="text-[12px] text-[#16332B]/55 leading-tight">
                                        Easy replacement
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}