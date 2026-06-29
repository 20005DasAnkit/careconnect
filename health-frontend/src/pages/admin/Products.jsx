import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const CATEGORIES = ["Tablets", "Syrups", "Injections", "Vitamins", "Powder", "Skincare", "Devices"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: ""
  });

  // --- Edit Category modal state ---
  const [editCatProduct, setEditCatProduct] = useState(null);
  const [editCatValue, setEditCatValue] = useState("");
  const [updatingCat, setUpdatingCat] = useState(false);

  // --- Add Stock modal state ---
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [stockInput, setStockInput] = useState("");
  const [updatingStock, setUpdatingStock] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/admin/products");
    setProducts(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createProduct = async () => {
    if (!form.name || !form.price || !form.stock) {
      alert("Name, price and stock are required");
      return;
    }

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category || null
      };

      await api.post("/admin/product", payload);

      setForm({ name: "", description: "", price: "", stock: "", category: "" });
      setShowForm(false);
      load();
    } catch (err) {
      alert(JSON.stringify(err.response?.data, null, 2));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/admin/product/${id}`);
    setProducts(products.filter(p => p.id !== id));
  };

  // --- Edit Category modal handlers ---
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
      await api.put(`/admin/product/${editCatProduct.id}/category`, {
        category: editCatValue || null
      });

      setProducts(products.map(p =>
        p.id === editCatProduct.id ? { ...p, category: editCatValue } : p
      ));

      closeEditCat();
    } catch (err) {
      alert(err.response?.data || "Error updating category");
    } finally {
      setUpdatingCat(false);
    }
  };

  // --- Add Stock modal handlers ---
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
      await api.put(`/admin/product/${stockModalProduct.id}/stock`, {
        stock: newStock
      });

      setProducts(products.map(p =>
        p.id === stockModalProduct.id ? { ...p, stock: newStock } : p
      ));

      closeStockModal();
    } catch (err) {
      alert(err.response?.data || "Error updating stock");
    } finally {
      setUpdatingStock(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full bg-gray-100 min-h-screen">
        <Navbar />

        <div className="p-6">

          {/* HEADER */}
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold">Products</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {showForm ? "Close" : "+ Add Product"}
            </button>
          </div>

          {/* FORM */}
          {showForm && (
            <div className="bg-white p-4 mb-6 shadow rounded">
              <input
                name="name"
                onChange={handleChange}
                value={form.name}
                placeholder="Product Name *"
                className="input w-full mb-2"
              />

              <input
                name="description"
                onChange={handleChange}
                value={form.description}
                placeholder="Description"
                className="input w-full mb-2"
              />

              <input
                name="price"
                type="number"
                onChange={handleChange}
                value={form.price}
                placeholder="Price *"
                className="input w-full mb-2"
              />

              <input
                name="stock"
                type="number"
                onChange={handleChange}
                value={form.stock}
                placeholder="Stock *"
                className="input w-full mb-2"
              />

              {/* CATEGORY DROPDOWN */}
              <select
                name="category"
                onChange={handleChange}
                value={form.category}
                className="input w-full mb-4 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700"
              >
                <option value="">Select Category (optional)</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button
                onClick={createProduct}
                className="bg-green-600 text-white px-4 py-2 w-full rounded"
              >
                Create Product
              </button>
            </div>
          )}

          {/* TABLE */}
          <div className="bg-white shadow rounded overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 text-sm text-gray-600">
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3 text-gray-500">{p.id}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">
                      {p.category ? (
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {p.category}
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-400 text-xs px-2.5 py-1 rounded-full">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">₹{p.price}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock < 10 ? "text-red-500 font-semibold" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => openEditCat(p)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Set Category
                        </button>
                        <button
                          onClick={() => openStockModal(p)}
                          className="bg-emerald-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Add Stock
                        </button>
                        <button
                          onClick={() => remove(p.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* ── SET CATEGORY MODAL ── */}
      {editCatProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-1">Set Category</h3>
            <p className="text-sm text-gray-500 mb-4">{editCatProduct.name}</p>

            <label className="text-sm text-gray-600 mb-1 block">Category</label>
            <select
              value={editCatValue}
              onChange={(e) => setEditCatValue(e.target.value)}
              className="border border-gray-300 rounded w-full px-3 py-2 mb-4 text-sm"
            >
              <option value="">— None —</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={closeEditCat}
                disabled={updatingCat}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitCategoryUpdate}
                disabled={updatingCat}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {updatingCat ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD STOCK MODAL ── */}
      {stockModalProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-1">Add Stock</h3>
            <p className="text-sm text-gray-500 mb-4">
              {stockModalProduct.name} — current stock: {stockModalProduct.stock}
            </p>

            <label className="text-sm text-gray-600 mb-1 block">Quantity to add</label>
            <input
              type="number"
              min="1"
              autoFocus
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              placeholder="e.g. 50"
              className="border border-gray-300 rounded w-full px-3 py-2 mb-1"
            />

            {stockInput && !isNaN(parseInt(stockInput, 10)) && (
              <p className="text-xs text-gray-500 mb-4">
                New total: {stockModalProduct.stock + parseInt(stockInput, 10)}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={closeStockModal}
                disabled={updatingStock}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitStockUpdate}
                disabled={updatingStock}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {updatingStock ? "Updating..." : "Update Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}