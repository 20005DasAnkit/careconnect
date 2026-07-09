import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Newspaper,
    X,
    Save,
} from "lucide-react";

const T = {
    cream: "#F5F0E8",
    green: "#16332B",
    greenSoft: "#2D5016",
    greenLight: "#EEF2E9",
    terra: "#C1633B",
    terraLight: "#FAF0EA",
    ink: "#1A1A1A",
    muted: "#6B7280",
    border: "#E2DACE",
    white: "#FFFFFF",
};

const serif = "'Fraunces', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

const emptyBlog = {
    title: "",
    excerpt: "",
    content: "",
    category: "",
    authorName: "",
    image: "",
    readTimeMinutes: 5,
    isPublished: true,
};

export default function Blogs() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState(emptyBlog);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");

    useEffect(() => {
        loadBlogs();
    }, []);

    async function loadBlogs() {
        try {
            setLoading(true);

            const res = await api.get("/admin/blogs");

            setBlogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function openCreate() {
        setEditingId(null);
        setForm(emptyBlog);
        setPreview("");
        setImageFile(null);
        setShowModal(true);
    }

    function openEdit(blog) {
        setEditingId(blog.id);

        setForm({
            title: blog.title || "",
            excerpt: blog.excerpt || "",
            content: blog.content || "",
            category: blog.category || "",
            authorName: blog.authorName || "",
            image: blog.image || "",
            readTimeMinutes: blog.readTimeMinutes || 5,
            isPublished: blog.isPublished,
        });

        setPreview("");
        setImageFile(null);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setEditingId(null);
        setForm(emptyBlog);
    }

    function handleChange(e) {
        const { name, value, checked, type } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    function handleImage(e) {
        const file = e.target.files[0];

        if (!file) return;

        setImageFile(file);

        setPreview(URL.createObjectURL(file));
    }

    async function saveBlog() {

        if (!form.title.trim()) {
            alert("Title required");
            return;
        }

        const fd = new FormData();

        fd.append("title", form.title);
        fd.append("excerpt", form.excerpt);
        fd.append("content", form.content);
        fd.append("category", form.category);
        fd.append("authorName", form.authorName);
        fd.append("readTimeMinutes", form.readTimeMinutes);
        fd.append("isPublished", form.isPublished);

        if (imageFile)
            fd.append("image", imageFile);

        try {

            setSaving(true);

            if (editingId)
                await api.put(`/admin/blogs/${editingId}`, fd);

            else
                await api.post("/admin/blogs", fd);

            closeModal();

            loadBlogs();

        } catch (err) {

            console.error(err);

            alert("Save failed");

        } finally {

            setSaving(false);

        }

    }
    async function deleteBlog(id) {
        if (!window.confirm("Delete this blog?")) return;

        try {
            await api.delete(`/admin/blogs/${id}`);

            loadBlogs();
        } catch {
            alert("Delete failed");
        }
    }

    async function togglePublish(id) {
        try {
            await api.patch(`/admin/blogs/${id}/toggle`);

            loadBlogs();
        } catch {
            alert("Failed to update status");
        }
    }

    const filtered = blogs.filter((x) => {
        const text = search.toLowerCase();

        return (
            x.title?.toLowerCase().includes(text) ||
            x.category?.toLowerCase().includes(text) ||
            x.authorName?.toLowerCase().includes(text)
        );
    });

return (
    <div
        style={{
            fontFamily: sans,
            background: T.cream,
            minHeight: "100vh",
            padding: "34px 36px",
        }}
    >
                    {/* Header */}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            flexWrap: "wrap",
                            gap: 20,
                            marginBottom: 28,
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
                                Admin · Content
                            </p>

                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: 32,
                                    color: T.green,
                                    fontFamily: serif,
                                    fontWeight: 500,
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                Blog Management
                            </h1>

                            <p
                                style={{
                                    marginTop: 8,
                                    color: T.muted,
                                    fontSize: 15,
                                }}
                            >
                                Create, edit and publish healthcare articles.
                            </p>
                        </div>

                        <button
                            onClick={openCreate}
                            style={{
                                background: T.green,
                                color: "#fff",
                                border: 0,
                                borderRadius: 999,
                                padding: "13px 24px",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 14,
                                fontFamily: sans,
                            }}
                        >
                            <Plus size={18} />
                            Add Blog
                        </button>
                    </div>

                    {/* Search */}

                    <div
                        style={{
                            background: "#fff",
                            border: `1px solid ${T.border}`,
                            borderRadius: 999,
                            display: "flex",
                            alignItems: "center",
                            padding: "0 18px",
                            height: 52,
                            marginBottom: 24,
                            maxWidth: 380,
                        }}
                    >
                        <Search
                            size={17}
                            color={T.muted}
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search blogs..."
                            style={{
                                flex: 1,
                                border: 0,
                                outline: 0,
                                background: "transparent",
                                marginLeft: 12,
                                fontSize: 14,
                                fontFamily: sans,
                                color: T.ink,
                            }}
                        />
                    </div>

                    {/* Table */}

                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 20,
                            overflow: "hidden",
                            border: `1px solid ${T.border}`,
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead
                                style={{
                                    background: T.greenLight,
                                }}
                            >
                                <tr>
                                    <th style={th}>Image</th>
                                    <th style={th}>Title</th>
                                    <th style={th}>Category</th>
                                    <th style={th}>Author</th>
                                    <th style={th}>Read Time</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                textAlign: "center",
                                                padding: 50,
                                                color: T.muted,
                                            }}
                                        >
                                            Loading blogs...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                textAlign: "center",
                                                padding: 50,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: 10,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 52,
                                                        height: 52,
                                                        borderRadius: "50%",
                                                        background: T.greenLight,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Newspaper size={22} color={T.greenSoft} strokeWidth={1.75} />
                                                </div>
                                                <span
                                                    style={{
                                                        fontFamily: serif,
                                                        fontSize: 17,
                                                        color: T.green,
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    No blogs found
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((blog) => (
                                        <tr key={blog.id}>
                                            <td style={td}>
                                                {blog.image ? (
                                                    <img
                                                        src={`http://localhost:5008${blog.image}`}
                                                        alt=""
                                                        style={{
                                                            width: 70,
                                                            height: 48,
                                                            borderRadius: 10,
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            width: 70,
                                                            height: 48,
                                                            borderRadius: 10,
                                                            background: T.greenLight,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <Newspaper size={20} color={T.greenSoft} />
                                                    </div>
                                                )}
                                            </td>

                                            <td style={td}>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        color: T.ink,
                                                        fontSize: 14.5,
                                                    }}
                                                >
                                                    {blog.title}
                                                </div>

                                                <div
                                                    style={{
                                                        fontSize: 12.5,
                                                        color: T.muted,
                                                        marginTop: 4,
                                                    }}
                                                >
                                                    {blog.excerpt?.substring(0, 70)}
                                                </div>
                                            </td>

                                            <td style={{ ...td, color: T.ink, fontSize: 14 }}>
                                                <span
                                                    style={{
                                                        background: T.terraLight,
                                                        color: T.terra,
                                                        padding: "5px 12px",
                                                        borderRadius: 999,
                                                        fontSize: 12.5,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {blog.category}
                                                </span>
                                            </td>

                                            <td style={{ ...td, fontSize: 14 }}>
                                                {blog.authorName}
                                            </td>

                                            <td style={{ ...td, fontSize: 14 }}>
                                                {blog.readTimeMinutes} min
                                            </td>

                                            <td style={td}>
                                                <span
                                                    style={{
                                                        padding: "6px 13px",
                                                        borderRadius: 999,
                                                        fontSize: 12.5,
                                                        fontWeight: 600,
                                                        background: blog.isPublished
                                                            ? "#DCFCE7"
                                                            : "#FEF3C7",
                                                        color: blog.isPublished
                                                            ? "#166534"
                                                            : "#92400E",
                                                    }}
                                                >
                                                    {blog.isPublished
                                                        ? "Published"
                                                        : "Draft"}
                                                </span>
                                            </td>

                                            <td style={td}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <button
                                                        style={iconBtn}
                                                        onClick={() =>
                                                            openEdit(blog)
                                                        }
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        style={iconBtn}
                                                        onClick={() =>
                                                            togglePublish(blog.id)
                                                        }
                                                        title={blog.isPublished ? "Unpublish" : "Publish"}
                                                    >
                                                        {blog.isPublished ? (
                                                            <Eye size={16} />
                                                        ) : (
                                                            <EyeOff size={16} />
                                                        )}
                                                    </button>

                                                    <button
                                                        style={{
                                                            ...iconBtn,
                                                            color: "#C1432B",
                                                            borderColor: "#F3D4C7",
                                                            background: "#FDF1EB",
                                                        }}
                                                        onClick={() =>
                                                            deleteBlog(blog.id)
                                                        }
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {showModal && (
                        <div
                            style={{
                                position: "fixed",
                                inset: 0,
                                background: "rgba(22,51,43,0.45)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 999,
                                padding: 20,
                            }}
                        >
                            <div
                                style={{
                                    width: 760,
                                    maxWidth: "100%",
                                    maxHeight: "90vh",
                                    overflowY: "auto",
                                    background: "#fff",
                                    borderRadius: 22,
                                    padding: 30,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 24,
                                    }}
                                >
                                    <h2
                                        style={{
                                            margin: 0,
                                            color: T.green,
                                            fontFamily: serif,
                                            fontWeight: 500,
                                            fontSize: 24,
                                        }}
                                    >
                                        {editingId ? "Edit Blog" : "Add Blog"}
                                    </h2>

                                    <button
                                        onClick={closeModal}
                                        style={{
                                            border: 0,
                                            background: T.cream,
                                            width: 34,
                                            height: 34,
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <X size={18} color={T.ink} />
                                    </button>
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: 18,
                                    }}
                                >
                                    <div>
                                        <label style={labelStyle}>Title</label>

                                        <input
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Category</label>

                                        <input
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Author</label>

                                        <input
                                            name="authorName"
                                            value={form.authorName}
                                            onChange={handleChange}
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <label style={labelStyle}>
                                            Read Time (Minutes)
                                        </label>

                                        <input
                                            type="number"
                                            name="readTimeMinutes"
                                            value={form.readTimeMinutes}
                                            onChange={handleChange}
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            gridColumn: "1 / span 2",
                                        }}
                                    >
                                        <label style={labelStyle}>
                                            Cover Image
                                        </label>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImage}
                                            style={{ fontSize: 13.5 }}
                                        />

                                        {preview && (

                                            <img
                                                src={preview}
                                                alt=""
                                                style={{
                                                    marginTop: 12,
                                                    width: 180,
                                                    borderRadius: 12,
                                                    border: `1px solid ${T.border}`,
                                                }}
                                            />

                                        )}
                                    </div>

                                    <div
                                        style={{
                                            gridColumn: "1 / span 2",
                                        }}
                                    >
                                        <label style={labelStyle}>
                                            Excerpt
                                        </label>

                                        <textarea
                                            rows={3}
                                            name="excerpt"
                                            value={form.excerpt}
                                            onChange={handleChange}
                                            style={textareaStyle}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            gridColumn: "1 / span 2",
                                        }}
                                    >
                                        <label style={labelStyle}>
                                            Content
                                        </label>

                                        <textarea
                                            rows={10}
                                            name="content"
                                            value={form.content}
                                            onChange={handleChange}
                                            style={textareaStyle}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            gridColumn: "1 / span 2",
                                        }}
                                    >
                                        <label
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                fontWeight: 600,
                                                fontSize: 14,
                                                color: T.ink,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                name="isPublished"
                                                checked={form.isPublished}
                                                onChange={handleChange}
                                                style={{ width: 16, height: 16, accentColor: T.green }}
                                            />

                                            Publish immediately
                                        </label>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 12,
                                        marginTop: 28,
                                    }}
                                >
                                    <button
                                        onClick={closeModal}
                                        style={{
                                            padding: "12px 22px",
                                            borderRadius: 999,
                                            border: `1px solid ${T.border}`,
                                            background: "#fff",
                                            color: T.ink,
                                            cursor: "pointer",
                                            fontWeight: 600,
                                            fontSize: 14,
                                            fontFamily: sans,
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={saveBlog}
                                        disabled={saving}
                                        style={{
                                            background: T.green,
                                            color: "#fff",
                                            border: 0,
                                            borderRadius: 999,
                                            padding: "12px 24px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            cursor: saving ? "default" : "pointer",
                                            opacity: saving ? 0.75 : 1,
                                            fontWeight: 600,
                                            fontSize: 14,
                                            fontFamily: sans,
                                        }}
                                    >
                                        <Save size={17} />

                                        {saving ? "Saving..." : "Save Blog"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

    )
}
const th = {
    padding: "16px",
    textAlign: "left",
    fontWeight: 700,
    fontSize: 13,
    color: T.green,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
};

const td = {
    padding: "16px",
    borderTop: `1px solid ${T.border}`,
    verticalAlign: "top",
    color: T.ink,
};

const iconBtn = {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: `1px solid ${T.border}`,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: ".15s",
    color: T.green,
};

const labelStyle = {
    display: "block",
    marginBottom: 8,
    fontSize: 13.5,
    fontWeight: 600,
    color: T.ink,
};

const inputStyle = {
    width: "100%",
    height: 46,
    padding: "0 14px",
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    outline: "none",
    fontSize: 14,
    background: "#fff",
    boxSizing: "border-box",
    fontFamily: sans,
    color: T.ink,
};

const textareaStyle = {
    width: "100%",
    padding: 14,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    outline: "none",
    resize: "vertical",
    fontSize: 14,
    fontFamily: sans,
    boxSizing: "border-box",
    minHeight: 120,
    color: T.ink,
};