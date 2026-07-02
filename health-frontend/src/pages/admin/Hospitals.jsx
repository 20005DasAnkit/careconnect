import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
  });

  useEffect(() => {
    loadHospitals();
  }, []);

  async function loadHospitals() {
    try {
      const res = await api.get("/admin/hospitals");
      setHospitals(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function saveHospital() {
    try {
      if (editingId) {
        await api.put(`/admin/hospital/${editingId}`, form);
        alert("Hospital Updated");
      } else {
        await api.post("/admin/hospital", form);
        alert("Hospital Added");
      }

      setForm({
        name: "",
        address: "",
        city: "",
        phone: "",
      });

      setEditingId(null);
      setShowForm(false);

      loadHospitals();
    } catch (err) {
      console.log(err);
      alert(err.response?.data);
    }
  }

  function editHospital(h) {
    setEditingId(h.id);

    setForm({
      name: h.name,
      address: h.address,
      city: h.city,
      phone: h.phone,
    });

    setShowForm(true);
  }

  async function removeHospital(id) {
    if (!window.confirm("Delete Hospital?")) return;

    await api.delete(`/admin/hospital/${id}`);

    loadHospitals();
  }

  return (
    <div className="flex">

      <Sidebar />

      <div className="ml-64 w-full bg-gray-100 min-h-screen">

        <Navbar />

        <div className="p-6">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-2xl font-bold">
              Hospitals
            </h2>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);

                setForm({
                  name: "",
                  address: "",
                  city: "",
                  phone: "",
                });
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {showForm ? "Close" : "+ Add Hospital"}
            </button>

          </div>

          {showForm && (

            <div className="bg-white shadow rounded p-5 mb-6">

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Hospital Name"
                className="input w-full mb-3"
              />

              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
                className="input w-full mb-3"
              />

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="input w-full mb-3"
              />

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="input w-full mb-3"
              />

              <button
                onClick={saveHospital}
                className="bg-green-600 text-white px-5 py-2 rounded"
              >
                {editingId ? "Update Hospital" : "Create Hospital"}
              </button>

            </div>

          )}

          <div className="grid md:grid-cols-3 gap-5">

            {hospitals.map((h) => (

              <div
                key={h.id}
                className="bg-white rounded shadow p-5"
              >

                <h3 className="font-bold text-lg">
                  {h.name}
                </h3>

                <p className="text-gray-600 mt-2">
                  {h.address}
                </p>

                <p>{h.city}</p>

                <p>{h.phone}</p>

                <div className="flex gap-2 mt-5">

                  <button
                    onClick={() => editHospital(h)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => removeHospital(h.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}