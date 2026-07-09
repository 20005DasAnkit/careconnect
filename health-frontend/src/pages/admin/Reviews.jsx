import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    Search,
    Star,
    CheckCircle,
    Trash2,
    Clock,
    MessageSquare,
    Inbox,
} from "lucide-react";

const api = axios.create({
    baseURL: "http://localhost:5008/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ── CareConnect design tokens ───────────────────────────────────
const T = {
    cream: "#F5F1E8",
    creamDark: "#EDE6D6",
    green: "#16332B",
    greenSoft: "#2D5016",
    greenTint: "#EEF2E9",
    terra: "#C1633B",
    terraTint: "#F6E7DE",
    ink: "#1A1A1A",
    muted: "#6B7280",
    border: "#E4DFD3",
    white: "#FFFFFF",
    gold: "#E0A63C",
};

const serif = "'Fraunces', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export default function Reviews() {

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("pending");

    async function loadReviews() {

        try {
            const res = await api.get("/admin/reviews");
            setReviews(res.data || []);

        } catch {
            toast.error("Failed to load reviews");

        } finally {
            setLoading(false);
        }

    }
    async function approveReview(id) {

        try {

            await api.put(`/admin/review/${id}/approve`);
            toast.success("Review approved.");
            loadReviews();
        }
        catch {
            toast.error("Failed to approve review.");
        }
    }

    async function deleteReview(id) {

        if (!window.confirm("Delete this review?"))
            return;

        try {
            await api.delete(`/admin/review/${id}`);
            toast.success("Review deleted.");
            loadReviews();
        }
        catch {
            toast.error("Failed to delete review.");
        }
    }
    useEffect(() => {

        loadReviews();

    }, []);

    const filtered = useMemo(() => {
        return reviews.filter((r) => {

            const matchSearch =
                r.doctorName
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||

                r.patientName
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||

                r.comment
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchTab =
                tab === "pending"
                    ? !r.isApproved
                    : r.isApproved;

            return matchSearch && matchTab;

        });

    }, [reviews, search, tab]);

    const pendingCount = reviews.filter((r) => !r.isApproved).length;
    const approvedCount = reviews.filter((r) => r.isApproved).length;

    return (

        <div
            style={{
                minHeight: "100vh",
                background: T.cream,
                padding: "36px 40px",
                fontFamily: sans,
                color: T.ink,
            }}
        >

            {/* ── Header ── */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                    gap: 20,
                    marginBottom: 34,
                }}
            >
                <div>

                    <p
                        style={{
                            fontSize: 12,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: T.terra,
                            fontWeight: 600,
                            margin: 0,
                            marginBottom: 8,
                        }}
                    >
                        Admin · Feedback
                    </p>

                    <h1
                        style={{
                            fontFamily: serif,
                            fontWeight: 500,
                            fontSize: 36,
                            margin: 0,
                            color: T.green,
                            letterSpacing: "-0.01em",
                        }}
                    >
                        Reviews
                    </h1>

                    <p
                        style={{
                            color: T.muted,
                            marginTop: 8,
                            fontSize: 15,
                        }}
                    >
                        Moderate patient feedback before it goes live on doctor profiles.
                    </p>
                </div>

                <div
                    style={{
                        position: "relative",
                    }}
                >
                    <Search
                        size={17}
                        style={{
                            position: "absolute",
                            left: 16,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: T.muted,
                        }}
                    />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search doctor, patient, or comment..."
                        style={{
                            width: 300,
                            padding: "12px 16px 12px 44px",
                            borderRadius: 999,
                            border: `1px solid ${T.border}`,
                            outline: "none",
                            background: T.white,
                            fontSize: 14,
                            fontFamily: sans,
                            color: T.ink,
                        }}
                    />
                </div>
            </div>

            {/* ── Tabs ── */}
            <div
                style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 28,
                }}
            >

                <button
                    onClick={() => setTab("pending")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "11px 22px",
                        borderRadius: 999,
                        border: tab === "pending" ? "none" : `1px solid ${T.border}`,
                        cursor: "pointer",
                        background: tab === "pending" ? T.green : T.white,
                        color: tab === "pending" ? T.white : T.ink,
                        fontWeight: 600,
                        fontSize: 14,
                        fontFamily: sans,
                        transition: "all 0.15s ease",
                    }}
                >
                    Pending
                    <span
                        style={{
                            background: tab === "pending" ? "rgba(255,255,255,0.2)" : T.terraTint,
                            color: tab === "pending" ? T.white : T.terra,
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: 999,
                            padding: "2px 9px",
                        }}
                    >
                        {pendingCount}
                    </span>
                </button>

                <button
                    onClick={() => setTab("approved")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "11px 22px",
                        borderRadius: 999,
                        border: tab === "approved" ? "none" : `1px solid ${T.border}`,
                        cursor: "pointer",
                        background: tab === "approved" ? T.green : T.white,
                        color: tab === "approved" ? T.white : T.ink,
                        fontWeight: 600,
                        fontSize: 14,
                        fontFamily: sans,
                        transition: "all 0.15s ease",
                    }}
                >
                    Approved
                    <span
                        style={{
                            background: tab === "approved" ? "rgba(255,255,255,0.2)" : T.greenTint,
                            color: tab === "approved" ? T.white : T.greenSoft,
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: 999,
                            padding: "2px 9px",
                        }}
                    >
                        {approvedCount}
                    </span>
                </button>

            </div>

            {loading && (
                <div
                    style={{
                        background: T.white,
                        borderRadius: 20,
                        border: `1px solid ${T.border}`,
                        padding: 60,
                        textAlign: "center",
                        color: T.muted,
                        fontSize: 15,
                    }}
                >
                    Loading reviews...
                </div>

            )}

            {!loading && filtered.length === 0 && (
                <div
                    style={{
                        background: T.white,
                        padding: "60px 40px",
                        borderRadius: 20,
                        textAlign: "center",
                        border: `1px solid ${T.border}`,
                    }}
                >

                    <div
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            background: T.greenTint,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 18px",
                        }}
                    >
                        <Inbox size={24} color={T.greenSoft} strokeWidth={1.75} />
                    </div>

                    <h3
                        style={{
                            fontFamily: serif,
                            fontWeight: 500,
                            fontSize: 20,
                            margin: 0,
                            color: T.green,
                        }}
                    >
                        No reviews found
                    </h3>

                    <p
                        style={{
                            color: T.muted,
                            marginTop: 8,
                            fontSize: 14,
                        }}
                    >
                        {tab === "pending"
                            ? "Nothing waiting for approval right now."
                            : "No approved reviews match your search."}
                    </p>
                </div>

            )}

            {!loading && filtered.length > 0 && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                        gap: 20,
                    }}
                >

                    {filtered.map((review) => (
                        <div
                            key={review.id}
                            style={{
                                background: T.white,
                                borderRadius: 20,
                                padding: 26,
                                border: `1px solid ${T.border}`,
                                display: "flex",
                                flexDirection: "column",
                                transition: "box-shadow 0.15s ease, transform 0.15s ease",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: 18,
                                    gap: 12,
                                }}
                            >

                                <div>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontFamily: serif,
                                            fontWeight: 500,
                                            fontSize: 19,
                                            color: T.green,
                                        }}
                                    >
                                        {review.doctorName}
                                    </h3>

                                    <p
                                        style={{
                                            margin: "6px 0 0",
                                            color: T.muted,
                                            fontSize: 13.5,
                                        }}
                                    >
                                        Patient — {review.patientName}
                                    </p>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                        fontWeight: 700,
                                        fontSize: 14,
                                        background: "#FDF6E8",
                                        padding: "6px 12px",
                                        borderRadius: 999,
                                        color: "#8A6416",
                                        flexShrink: 0,
                                    }}
                                >

                                    <Star
                                        size={14}
                                        fill={T.gold}
                                        color={T.gold}
                                    />

                                    {review.rating}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "flex-start",
                                    background: T.cream,
                                    borderRadius: 14,
                                    padding: "14px 16px",
                                    flex: 1,
                                }}
                            >
                                <MessageSquare
                                    size={17}
                                    color={T.terra}
                                    style={{ marginTop: 2, flexShrink: 0 }}
                                />

                                <p
                                    style={{
                                        margin: 0,
                                        lineHeight: 1.7,
                                        color: T.ink,
                                        fontSize: 14.5,
                                    }}
                                >
                                    {review.comment}
                                </p>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: 20,
                                }}
                            >
                                <small
                                    style={{
                                        color: T.muted,
                                        fontSize: 12.5,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                    }}
                                >
                                    <Clock size={13} />
                                    {new Date(
                                        review.createdAt
                                    ).toLocaleDateString(undefined, {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </small>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: 10,
                                    }}
                                >

                                    {!review.isApproved && (
                                        <button
                                            onClick={() => approveReview(review.id)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                padding: "9px 18px",
                                                border: "none",
                                                cursor: "pointer",
                                                borderRadius: 999,
                                                background: T.green,
                                                color: T.white,
                                                fontWeight: 600,
                                                fontSize: 13.5,
                                                fontFamily: sans,
                                            }}
                                        >
                                            <CheckCircle size={15} />

                                            Approve
                                        </button>
                                    )}

                                    <button
                                        onClick={() => deleteReview(review.id)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            padding: "9px 18px",
                                            border: `1px solid #F3D4C7`,
                                            cursor: "pointer",
                                            borderRadius: 999,
                                            background: "#FDF1EB",
                                            color: "#C1432B",
                                            fontWeight: 600,
                                            fontSize: 13.5,
                                            fontFamily: sans,
                                        }}
                                    >
                                        <Trash2 size={15} />
                                        Delete

                                    </button>

                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}