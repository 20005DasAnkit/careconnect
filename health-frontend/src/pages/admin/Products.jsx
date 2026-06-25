import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/admin/products").then(res => setProducts(res.data));
  }, []);

  const remove = async (id) => {
    await api.delete(`/admin/product/${id}`);
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full bg-gray-100 min-h-screen">
        <Navbar />

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Products</h2>

          <table className="w-full bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200">
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map(p => (
                <tr key={p.id} className="text-center border-b">
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>₹ {p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button
                      onClick={() => remove(p.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}