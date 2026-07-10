import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ShoppingCart, Plus, Pill, Check } from "lucide-react";
import api from "../../api/axios";
import { useCart } from "../../context/Cartcontext";
import Footer from "../../components/Footer";

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

const CATEGORIES = [
    "All",
    "Tablets",
    "Syrups",
    "Injections",
    "Vitamins",
    "Skincare",
    "Devices",
    "Powder"
];

const SORTS = [
    { key: "default", label: "Recommended" },
    { key: "price_asc", label: "Price: Low to high" },
    { key: "price_desc", label: "Price: High to low" },
    { key: "name", label: "Name: A–Z" },
];

function ProductCardSkeleton() {
    return (
        <div style={{ animation: "prod-pulse 1.4s ease-in-out infinite" }}>
            <style>{`@keyframes prod-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
            <div
                style={{
                    aspectRatio: "1",
                    backgroundColor: C.cardAlt,
                    borderRadius: 16,
                    marginBottom: 12
                }} />

            <div
                style={{
                    height: 10,
                    width: "40%",
                    backgroundColor: C.cardAlt,
                    borderRadius: 999,
                    marginBottom: 8
                }} />

            <div
                style={{
                    height: 13,
                    width: "70%",
                    backgroundColor: C.cardAlt,
                    borderRadius: 999
                }} />
        </div>
    );
}

export default function Products() {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [justAdded, setJustAdded] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await api.get("/patient/products");
            setProducts(res.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        let result = products.filter((p) => {
            const matchSearch =
                !search.trim() ||
                p.name?.toLowerCase().includes(search.toLowerCase()) ||
                p.description?.toLowerCase().includes(search.toLowerCase());

            const matchCat = activeCategory === "All" ||
                (p.category && p.category.toLowerCase() === activeCategory.toLowerCase());
            return matchSearch && matchCat;
        });

        if (sortBy === "price_asc")
            result = [...result].sort((a, b) => a.price - b.price);

        if (sortBy === "price_desc")
            result = [...result].sort((a, b) => b.price - a.price);

        if (sortBy === "name")
            result = [...result].sort((a, b) => a.name?.localeCompare(b.name));
        return result;
    }, [products, search, activeCategory, sortBy]);

    const categoryCounts = useMemo(() => {
        const counts = { All: products.length };
        CATEGORIES.slice(1).forEach((cat) => {
            counts[cat] = products.filter((p) => p.category
                &&
                p.category.toLowerCase() === cat.toLowerCase()).length;
        });
        return counts;
    }, [products]);

    function handleAddToCart(product) {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        addToCart(product, 1);
        setJustAdded(product.id);
        setTimeout(() => setJustAdded(null), 1400);
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: C.cream,
                color: C.forest,
                fontFamily: INTER
            }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,600&family=Inter:wght@400;500;600;700&display=swap');
            `}</style>

            <div
                style={{
                    width: "100%",
                    maxWidth: 1500,
                    margin: "0 auto",
                    padding: "36px 32px 96px"
                }}>

                {/* ── Editorial header ── */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        gap: 16,
                        marginBottom: 8,
                        borderBottom: `1px solid ${C.border}`,
                        paddingBottom: 28,
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                color: C.terracotta,
                                margin: "0 0 10px",
                            }}
                        >
                            Pharmacy
                        </p>

                        <h1
                            style={{ fontFamily: FRAUNCES, fontWeight: 500, margin: 0 }}
                            className="leading-[1.05] tracking-tight"
                        >
                            <span style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", color: C.forest }}>
                                Everything you need,
                            </span>
                            <br />
                            <span
                                className="italic"
                                style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", color: C.terracotta }}
                            >
                                delivered to your door.
                            </span>
                        </h1>
                    </div>

                    <Link
                        to="/patient/cart"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "13px 22px",
                            borderRadius: 999,
                            backgroundColor: C.forest,
                            color: C.white,
                            fontWeight: 700,
                            fontSize: 14,
                            textDecoration: "none",
                            flexShrink: 0,
                            transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.forestHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.forest)}
                    >
                        <ShoppingCart size={16} /> View Cart
                    </Link>
                </div>

                <div
                    style={{
                        position: "relative",
                        padding: "28px 0 36px"
                    }}>
                    <Search
                        size={26}
                        style={{
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: `${C.forest}40`
                        }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search…"
                        style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            fontFamily: FRAUNCES,
                            fontWeight: 500,
                            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                            color: C.forest,
                            paddingLeft: 40,
                            boxSizing: "border-box",
                        }}
                    />
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "220px 1fr",
                        gap: 40,
                        alignItems: "start"
                    }}>

                    {/* ── Sidebar: sort + filter ── */}
                    <div
                        style={{ position: "sticky", top: 24 }}>
                        <p
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: `${C.forest}99`, margin: "0 0 12px"
                            }}>
                            Sort
                        </p>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                marginBottom: 32
                            }}>
                            {SORTS.map((s) => (
                                <button
                                    key={s.key}
                                    onClick={() => setSortBy(s.key)}
                                    style={{
                                        textAlign: "left",
                                        padding: "7px 0",
                                        fontSize: 13.5,
                                        fontWeight: sortBy === s.key ? 700 : 400,
                                        color: sortBy === s.key ? C.forest : `${C.forest}70`,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <p
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: `${C.forest}99`, margin: "0 0 12px"
                            }}>
                            Filter
                        </p>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2
                            }}>
                            {CATEGORIES.map((cat) => {
                                const active = activeCategory === cat;
                                const count = categoryCounts[cat] ?? 0;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            textAlign: "left",
                                            padding: "7px 0",
                                            fontSize: 13.5,
                                            fontWeight: active ? 700 : 400,
                                            color: active ? C.terracotta : `${C.forest}70`,
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <span>
                                            {cat}
                                        </span>

                                        {!loading &&
                                            <span
                                                style={{
                                                    fontSize: 11.5,
                                                    color: `${C.forest}40`
                                                }}
                                            >{count}
                                            </span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Product grid ── */}
                    <div>
                        {!loading && (
                            <p
                                style={{
                                    fontSize: 12.5,
                                    color: `${C.forest}59`,
                                    margin: "0 0 20px"
                                }}>
                                {filteredProducts.length} results
                            </p>
                        )}

                        {loading && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                                    gap: "36px 28px"
                                }}>
                                {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                            </div>
                        )}

                        {!loading && filteredProducts.length > 0 && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                                    gap: "40px 28px"
                                }}>
                                {filteredProducts.map((p) => {
                                    const hovered = hoveredCard === p.id;
                                    return (
                                        <div
                                            key={p.id}
                                            onMouseEnter={() => setHoveredCard(p.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            style={{ position: "relative" }}
                                        >
                                            <Link to={`/patient/products/${p.id}`}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "inherit"
                                                }}>

                                                <div style={{
                                                    position: "relative",
                                                    aspectRatio: "1",
                                                    borderRadius: 16,
                                                    backgroundColor: hovered ? C.cardAlt : C.cream,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    overflow: "hidden",
                                                    marginBottom: 14,
                                                    transition: "background-color 0.25s ease",
                                                }}>
                                                    {p.imageUrl ? (
                                                        <img
                                                            src={`${IMG_BASE}${p.imageUrl}`}
                                                            alt={p.name}
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "contain",
                                                                padding: 20,
                                                                transform: hovered ? "scale(1.06)" : "scale(1)",
                                                                transition: "transform 0.3s ease",
                                                            }}
                                                        />
                                                    ) : (
                                                        <Pill
                                                            size={36}
                                                            color={`${C.forest}25`}
                                                            strokeWidth={1.5}
                                                        />
                                                    )}

                                                    {p.stock === 0 && (
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                inset: 0,
                                                                backgroundColor: `${C.white}CC`,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center"
                                                            }}>
                                                            <span
                                                                style={{
                                                                    backgroundColor: C.forest,
                                                                    color: C.white,
                                                                    fontSize: 11,
                                                                    fontWeight: 600,
                                                                    padding: "6px 14px",
                                                                    borderRadius: 999
                                                                }}>
                                                                Out of stock
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <p
                                                    style={{
                                                        fontSize: 11.5,
                                                        color: C.terracotta,
                                                        fontWeight: 600,
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.04em",
                                                        margin: "0 0 3px"
                                                    }}>
                                                    {p.category || "Medicine"}
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        color: C.forest,
                                                        margin: 0,
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis"
                                                    }}>
                                                    {p.name}
                                                </p>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "baseline",
                                                        gap: 6,
                                                        marginTop: 5
                                                    }}>

                                                    <span
                                                        style={{
                                                            fontSize: 13.5,
                                                            color: `${C.forest}80`
                                                        }}
                                                    >
                                                        ₹{p.price}
                                                    </span>

                                                    {p.mrp && p.mrp > p.price && (
                                                        <span
                                                            style={{
                                                                fontSize: 11.5,
                                                                color: `${C.forest}35`,
                                                                textDecoration: "line-through"
                                                            }}>
                                                            ₹{p.mrp}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>

                                            {/* Quick-add — appears on hover, top-right of image */}
                                            <button
                                                onClick={(e) => { e.preventDefault(); handleAddToCart(p); }}
                                                disabled={p.stock === 0}
                                                title="Add to cart"
                                                style={{
                                                    position: "absolute",
                                                    top: 10,
                                                    right: 10,
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 999,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: justAdded === p.id ? C.green : C.white,
                                                    color: justAdded === p.id ? C.white : C.forest,
                                                    border: "none", cursor: p.stock === 0 ? "not-allowed" : "pointer",
                                                    opacity: hovered || justAdded === p.id ? 1 : 0,
                                                    transform: hovered || justAdded === p.id ? "scale(1)" : "scale(0.85)",
                                                    transition: "opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease",
                                                    boxShadow: "0 4px 12px rgba(22,51,43,0.18)",
                                                }}
                                            >
                                                {justAdded === p.id ? <Check size={15} /> : <Plus size={15} />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!loading && filteredProducts.length === 0 && (
                            <div
                                style={{
                                    padding: "72px 20px",
                                    textAlign: "center"
                                }}>

                                <div
                                    style={{
                                        width: 60,
                                        height: 60,
                                        margin: "0 auto",
                                        borderRadius: 16,
                                        backgroundColor: C.cardAlt,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: 18
                                    }}>
                                    <Pill
                                        color={`${C.forest}59`}
                                        size={24}
                                        strokeWidth={1.5}
                                    />
                                </div>

                                <h3
                                    style={{
                                        fontFamily: FRAUNCES,
                                        fontWeight: 500,
                                        fontSize: "1.3rem",
                                        margin: 0
                                    }}>
                                    No products found
                                </h3>

                                <p
                                    style={{
                                        color: `${C.forest}80`,
                                        marginTop: 8,
                                        fontSize: 13.5
                                    }}>
                                    {activeCategory !== "All"
                                        ? `No products in "${activeCategory}" yet.`
                                        : "Try a different search term."
                                    }
                                </p>

                                <button
                                    onClick={() => { setSearch(""); setActiveCategory("All"); }}
                                    style={{
                                        marginTop: 20,
                                        backgroundColor: C.forest,
                                        color: C.white,
                                        padding: "10px 24px",
                                        borderRadius: 999,
                                        fontSize: 13.5,
                                        fontWeight: 600,
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    Reset filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}