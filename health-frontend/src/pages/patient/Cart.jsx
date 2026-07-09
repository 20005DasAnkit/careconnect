import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import api from "../../api/axios";
import { useCart } from "../../context/Cartcontext";

export default function Cart() {
    const navigate = useNavigate();
    const { items, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();

    const [address, setAddress] = useState("");
    const [paymentMode, setPaymentMode] = useState("COD");
    const [placing, setPlacing] = useState(false);

    async function placeOrder() {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        if (!address.trim()) {
            alert("Delivery address is required");
            return;
        }

        if (items.length === 0) return;

        setPlacing(true);

        try {
            const payload = {
                deliveryAddress: address,
                paymentMode,
                razorpayPaymentId: paymentMode === "Online" ? "DEMO_PAYMENT_ID" : null,
                items: items.map((x) => ({
                    productId: x.id,
                    quantity: x.quantity,
                })),
            };

            const res = await api.post("/patient/cart-order", payload);

            clearCart();
            navigate(`/patient/orders`, { state: { placedOrderId: res.data.OrderId } });
        } catch (err) {
            console.log(err);
            alert(err.response?.data || "Failed to place order");
        } finally {
            setPlacing(false);
        }
    }

    return (
        <div
            className="min-h-screen bg-[#FAF8F3] text-[#16332B]"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
            <div className="w-full max-w-[1100px] mx-auto px-8 lg:px-16 py-10">

                <Link
                    to="/patient/products"
                    className="inline-flex items-center gap-2 text-sm text-[#16332B]/55 hover:text-[#16332B] transition mb-8"
                >
                    <ArrowLeft size={15} />
                    Continue shopping
                </Link>

                <h1
                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                    className="text-[2rem] mb-8"
                >
                    Your cart
                </h1>

                {items.length === 0 ? (
                    <div className="bg-white rounded-[24px] border border-[#E4DFD3] py-20 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FAF8F3] flex items-center justify-center mb-5">
                            <ShoppingBag className="text-[#16332B]/35" size={26} strokeWidth={1.5} />
                        </div>
                        <h3
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="text-[1.4rem]"
                        >
                            Your cart is empty
                        </h3>
                        <p className="text-[#16332B]/55 mt-2 text-sm">
                            Add a few medicines from the pharmacy to get started.
                        </p>
                        <Link
                            to="/patient/products"
                            className="inline-block mt-6 bg-[#16332B] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#0F231D] transition"
                        >
                            Browse pharmacy
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-[1fr_360px] gap-10">

                        {/* ── Items list ── */}
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-[18px] border border-[#E4DFD3] p-4 flex items-center gap-4"
                                >
                                    <div className="w-16 h-16 rounded-[12px] bg-gradient-to-br from-[#FAF8F3] to-[#EFEAE0] flex items-center justify-center overflow-hidden shrink-0">
                                        {item.imageUrl ? (
                                            <img
                                                src={`http://localhost:5008${item.imageUrl}`}
                                                alt={item.name}
                                                className="w-full h-full object-contain p-1.5"
                                            />
                                        ) : (
                                            <ShoppingBag size={20} className="text-[#16332B]/25" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-[#16332B] truncate">
                                            {item.name}
                                        </p>
                                        {item.category && (
                                            <p className="text-xs text-[#16332B]/40 mt-0.5">{item.category}</p>
                                        )}
                                        <p
                                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                            className="text-[1rem] mt-1"
                                        >
                                            ₹{item.price}
                                        </p>
                                    </div>

                                    <div className="flex items-center border border-[#E4DFD3] rounded-full overflow-hidden shrink-0">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center text-[#16332B]/55 hover:bg-[#FAF8F3]"
                                        >
                                            <Minus size={13} />
                                        </button>
                                        <span className="w-7 text-center text-xs font-semibold">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center text-[#16332B]/55 hover:bg-[#FAF8F3]"
                                        >
                                            <Plus size={13} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="w-9 h-9 flex items-center justify-center rounded-full text-[#B5562C] hover:bg-[#FAF0EA] transition shrink-0"
                                        title="Remove"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* ── Checkout panel ── */}
                        <div className="bg-white rounded-[20px] border border-[#E4DFD3] p-6 h-fit sticky top-8">
                            <h3
                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                className="text-[1.3rem] mb-5"
                            >
                                Order summary
                            </h3>

                            <div className="flex justify-between text-sm text-[#16332B]/65 mb-2">
                                <span>Subtotal</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold pt-3 border-t border-[#E4DFD3] mt-3 mb-6">
                                <span>Total</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>

                            <label className="text-xs font-semibold text-[#16332B]/60 uppercase tracking-wide">
                                Delivery address
                            </label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                placeholder="Full address with pin code"
                                className="w-full mt-2 mb-5 p-3 rounded-[12px] border border-[#E4DFD3] text-sm outline-none focus:ring-2 focus:ring-[#16332B]/15 resize-none"
                            />

                            <label className="text-xs font-semibold text-[#16332B]/60 uppercase tracking-wide">
                                Payment
                            </label>
                            <div className="flex gap-2 mt-2 mb-6">
                                {["COD", "Online"].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setPaymentMode(mode)}
                                        className={`flex-1 py-2.5 rounded-full text-sm font-medium border transition ${
                                            paymentMode === mode
                                                ? "bg-[#16332B] text-white border-[#16332B]"
                                                : "bg-white text-[#16332B]/60 border-[#E4DFD3] hover:border-[#16332B]/30"
                                        }`}
                                    >
                                        {mode === "COD" ? "Cash on delivery" : "Pay online"}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={placeOrder}
                                disabled={placing}
                                className="w-full h-12 rounded-full bg-[#16332B] hover:bg-[#0F231D] text-white text-sm font-semibold transition disabled:opacity-60"
                            >
                                {placing ? "Placing order..." : `Place order — ₹${totalAmount.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}