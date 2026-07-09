import { useEffect, useState } from "react";
import api from "../../api/axios";

const CATEGORIES = ["Tablets", "Syrups", "Injections", "Vitamins", "Powder", "Skincare", "Devices"];

const C = {
  cream: "#F6F1E7",
  surface: "#FFFFFF",
  forest: "#22422F",
  forestDark: "#16301F",
  forestSoft: "#EAF0EB",
  terracotta: "#C1653A",
  terracottaDark: "#A8532C",
  terracottaSoft: "#F7E9E1",
  ink: "#2A2A24",
  muted: "#8A8478",
  border: "#E4DCC8",
  danger: "#B3432E",
  dangerSoft: "#F6E3DE",
};

const heading = { fontFamily: "'Fraunces', serif", color: C.ink, margin: 0 };
const body = { fontFamily: "'Inter', sans-serif", color: C.ink };

const inputStyle = {
  ...body,
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  marginBottom: 12,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  fontSize: 14,
  background: C.cream,
  outline: "none",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 90,
  fontFamily: "'Inter', sans-serif",
};

const labelStyle = {
  ...body,
  fontSize: 12.5,
  color: C.muted,
  display: "block",
  marginBottom: 6,
};

const primaryBtn = {
  ...body,
  background: C.forest,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 22px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtn = {
  ...body,
  flex: 1,
  background: "transparent",
  border: `1px solid ${C.border}`,
  color: C.ink,
  borderRadius: 10,
  padding: "10px",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
};

const smallBtn = (bg, color) => ({
  ...body,
  background: bg,
  color,
  border: "none",
  borderRadius: 8,
  padding: "7px 12px",
  fontSize: 12.5,
  fontWeight: 600,
  cursor: "pointer",
});

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(42, 42, 36, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const modalCard = {
  background: C.surface,
  borderRadius: 16,
  padding: 26,
  width: "100%",
  maxWidth: 380,
  boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: null
  };
  const [form, setForm] = useState(emptyForm);

  const [editCatProduct, setEditCatProduct] = useState(null);
  const [editCatValue, setEditCatValue] = useState("");
  const [updatingCat, setUpdatingCat] = useState(false);

  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [stockInput, setStockInput] = useState("");
  const [updatingStock, setUpdatingStock] = useState(false);
  const [imageProduct, setImageProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [updatingProduct, setUpdatingProduct] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: ""
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/admin/products");
    setProducts(res.data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createProduct = async () => {
    if (!form.name || !form.price || !form.stock) {
      alert("Name, price and stock are required");
      return;
    }
    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("description", form.description);
      data.append("price", form.price);
      data.append("stock", form.stock);
      data.append("category", form.category);

      if (form.image)
        data.append("image", form.image);

      await api.post("/admin/product", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      alert(JSON.stringify(err.response?.data, null, 2));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/admin/product/${id}`);
    setProducts(products.filter((p) => p.id !== id));
  };

  const openEditCat = (product) => {
    setEditCatProduct(product);
    setEditCatValue(product.category || "");
  };
  const closeEditCat = () => {
    setEditCatProduct(null);
    setEditCatValue("");
  };
  const submitCategoryUpdate = async () => {
    setUpdatingCat(true);
    try {
      await api.put(`/admin/product/${editCatProduct.id}/category`, { category: editCatValue || null });
      setProducts(products.map((p) => (p.id === editCatProduct.id ? { ...p, category: editCatValue } : p)));
      closeEditCat();
    } catch (err) {
      alert(err.response?.data || "Error updating category");
    } finally {
      setUpdatingCat(false);
    }
  };

  const openStockModal = (product) => {
    setStockModalProduct(product);
    setStockInput("");
  };
  const closeStockModal = () => {
    setStockModalProduct(null);
    setStockInput("");
  };
  const submitStockUpdate = async () => {
    const addAmount = parseInt(stockInput, 10);
    if (isNaN(addAmount) || addAmount <= 0) {
      alert("Enter a valid quantity to add");
      return;
    }
    const newStock = stockModalProduct.stock + addAmount;
    setUpdatingStock(true);
    try {
      await api.put(`/admin/product/${stockModalProduct.id}/stock`, { stock: newStock });
      setProducts(products.map((p) => (p.id === stockModalProduct.id ? { ...p, stock: newStock } : p)));
      closeStockModal();
    } catch (err) {
      alert(err.response?.data || "Error updating stock");
    } finally {
      setUpdatingStock(false);
    }
  };

  const updateImage = async () => {
    try {

      if (!imageFile) {
        alert("Choose an image");
        return;
      }

      const data = new FormData();

      data.append("image", imageFile);

      await api.put(
        `/admin/product/${imageProduct.id}/image`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setImageProduct(null);
      setImageFile(null);

      load();

    } catch (err) {
      console.log(err);
      alert(err.response?.data || "Image upload failed");
    }
  };

  const openEditProduct = (product) => {

    setEditProduct(product);

    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category || ""
    });
  };

  const updateProduct = async () => {

    setUpdatingProduct(true);

    try {

      await api.put(
        `/admin/product/${editProduct.id}`,
        editForm
      );

      setEditProduct(null);

      load();

    } catch (err) {

      console.log(err);

      alert("Update failed");

    } finally {

      setUpdatingProduct(false);

    }

  };

  return (
  <div
    style={{
      minHeight: "100vh",
      background: C.cream,
      padding: "32px 36px",
      fontFamily: "'Inter', sans-serif",
    }}
  >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <p style={{ ...body, color: C.terracotta, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 4px" }}>
                Pharmacy
              </p>
              <h2 style={{ ...heading, fontSize: 30 }}>Products</h2>
            </div>

            <button style={primaryBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? "Close" : "+ Add Product"}
            </button>
          </div>

          {showForm && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24, maxWidth: 460 }}>
              <input style={inputStyle} name="name" onChange={handleChange} value={form.name} placeholder="Product name *" />
              <input style={inputStyle} name="description" onChange={handleChange} value={form.description} placeholder="Description" />
              <input style={inputStyle} name="price" type="number" onChange={handleChange} value={form.price} placeholder="Price *" />
              <input style={inputStyle} name="stock" type="number" onChange={handleChange} value={form.stock} placeholder="Stock *" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({
                    ...form,
                    image: e.target.files[0]
                  })
                }
              />

              <select
                name="category"
                onChange={handleChange}
                value={form.category}
                style={{ ...inputStyle, marginBottom: 18, cursor: "pointer" }}
              >
                <option value="">Select category (optional)</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button style={{ ...primaryBtn, width: "100%" }} onClick={createProduct}>
                Create Product
              </button>
            </div>
          )}

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.forestSoft }}>
                  {["ID", "Image", "Name", "Category", "Price", "Stock", "Actions"].map((h) => (
                    <th key={h} style={{ ...body, textAlign: "left", padding: "12px 16px", fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase", color: C.forestDark }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ ...body, padding: "14px 16px", color: C.muted, fontSize: 13.5 }}>{p.id}</td>
                    <td>
                      {p.imageUrl ? (
                        <img
                          src={`http://localhost:5008${p.imageUrl}`}
                          alt=""
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 8
                          }}
                        />
                      ) : (
                        "No Image"
                      )}

                    </td>
                    <td style={{ ...body, padding: "14px 16px", fontWeight: 600, fontSize: 14 }}>{p.name}</td>
                    <td style={{ padding: "14px 16px" }}>
                      {p.category ? (
                        <span style={{ ...body, background: C.forestSoft, color: C.forestDark, fontSize: 11.5, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>
                          {p.category}
                        </span>
                      ) : (
                        <span style={{ ...body, background: C.cream, color: C.muted, fontSize: 11.5, padding: "4px 10px", borderRadius: 999 }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={{ ...body, padding: "14px 16px", fontSize: 13.5 }}>₹{p.price}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ ...body, fontSize: 13.5, fontWeight: p.stock < 10 ? 700 : 400, color: p.stock < 10 ? C.danger : C.ink }}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button style={smallBtn(C.terracottaSoft, C.terracottaDark)} onClick={() => openEditCat(p)}>
                          Set Category
                        </button>
                        <button style={smallBtn(C.forestSoft, C.forestDark)} onClick={() => openStockModal(p)}>
                          Add Stock
                        </button>
                        <button
                          style={smallBtn(C.forestSoft, C.forestDark)}
                          onClick={() => setImageProduct(p)}
                        >
                          {p.imageUrl ? "Change Image" : "Add Image"}
                        </button>
                        <button style={smallBtn(C.dangerSoft, C.danger)} onClick={() => remove(p.id)}>
                          Delete
                        </button>
                        <button
                          style={smallBtn(C.terracottaSoft, C.terracottaDark)}
                          onClick={() => openEditProduct(p)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>


      {editCatProduct && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3 style={{ ...heading, fontSize: 18, marginBottom: 4 }}>Set Category</h3>
            <p style={{ ...body, color: C.muted, fontSize: 13, marginBottom: 16 }}>{editCatProduct.name}</p>

            <label style={labelStyle}>Category</label>
            <select value={editCatValue} onChange={(e) => setEditCatValue(e.target.value)} style={{ ...inputStyle, marginBottom: 18, cursor: "pointer" }}>
              <option value="">— None —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 10 }}>
              <button style={secondaryBtn} onClick={closeEditCat} disabled={updatingCat}>
                Cancel
              </button>
              <button style={{ ...primaryBtn, flex: 1, opacity: updatingCat ? 0.7 : 1 }} onClick={submitCategoryUpdate} disabled={updatingCat}>
                {updatingCat ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {stockModalProduct && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3 style={{ ...heading, fontSize: 18, marginBottom: 4 }}>Add Stock</h3>
            <p style={{ ...body, color: C.muted, fontSize: 13, marginBottom: 16 }}>
              {stockModalProduct.name} — current stock: {stockModalProduct.stock}
            </p>

            <label style={labelStyle}>Quantity to add</label>
            <input
              type="number"
              min="1"
              autoFocus
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              placeholder="e.g. 50"
              style={{ ...inputStyle, marginBottom: 4 }}
            />

            {stockInput && !isNaN(parseInt(stockInput, 10)) && (
              <p style={{ ...body, fontSize: 12, color: C.muted, marginBottom: 16 }}>
                New total: {stockModalProduct.stock + parseInt(stockInput, 10)}
              </p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button style={secondaryBtn} onClick={closeStockModal} disabled={updatingStock}>
                Cancel
              </button>
              <button style={{ ...primaryBtn, flex: 1, opacity: updatingStock ? 0.7 : 1 }} onClick={submitStockUpdate} disabled={updatingStock}>
                {updatingStock ? "Updating..." : "Update Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {imageProduct && (
        <div style={modalOverlay}>
          <div style={modalCard}>

            <h3 style={{ ...heading, fontSize: 18, marginBottom: 10 }}>
              {imageProduct.imageUrl ? "Change Product Image" : "Add Product Image"}
            </h3>

            {imageProduct.imageUrl && (
              <img
                src={`http://localhost:5008${imageProduct.imageUrl}`}
                alt=""
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 10,
                  marginBottom: 16,
                  border: "1px solid #ddd"
                }}
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={{ marginBottom: 20 }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button style={secondaryBtn} onClick={() => {
                  setImageProduct(null);
                  setImageFile(null);
                }}>
                Cancel
              </button>

              <button
                style={{
                  ...primaryBtn,
                  flex: 1
                }}
                onClick={updateImage}
              >
                Save Image
              </button>
            </div>

          </div>
        </div>
      )}

      {editProduct && (
        <div style={modalOverlay}>

          <div style={modalCard}>

            <h3 style={{ ...heading, fontSize: 18, marginBottom: 4 }}>Edit Product</h3>
            <p style={{ ...body, color: C.muted, fontSize: 13, marginBottom: 18 }}>{editProduct.name}</p>

            <label style={labelStyle}>Name</label>
            <input
              style={inputStyle}
              value={editForm.name}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  name: e.target.value
                })
              }
            />

            <label style={labelStyle}>Description</label>
            <textarea
              style={textareaStyle}
              value={editForm.description}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  description: e.target.value
                })
              }
            />

            <label style={labelStyle}>Price</label>
            <input
              style={inputStyle}
              type="number"
              value={editForm.price}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  price: e.target.value
                })
              }
            />

            <label style={labelStyle}>Category</label>
            <select
              style={{ ...inputStyle, marginBottom: 18, cursor: "pointer" }}
              value={editForm.category}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  category: e.target.value
                })
              }
            >
              <option value="">— None —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 10 }}>

              <button
                style={secondaryBtn}
                onClick={() =>
                  setEditProduct(null)
                }
                disabled={updatingProduct}
              >
                Cancel
              </button>

              <button
                style={{ ...primaryBtn, flex: 1, opacity: updatingProduct ? 0.7 : 1 }}
                onClick={updateProduct}
                disabled={updatingProduct}
              >
                {updatingProduct ? "Saving..." : "Save"}
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}