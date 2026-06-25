import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get("/admin/doctors").then(res => setDoctors(res.data));
  }, []);

  const remove = async (id) => {
    await api.delete(`/admin/doctor/${id}`);
    setDoctors(doctors.filter(d => d.id !== id));
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full bg-gray-100 min-h-screen">
        <Navbar />

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Doctors</h2>

          <table className="w-full bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">ID</th>
                <th>Name</th>
                <th>Specialization</th>
                <th>Hospital</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {doctors.map(d => (
                <tr key={d.id} className="text-center border-b">
                  <td>{d.id}</td>
                  <td>{d.user?.fullName}</td>
                  <td>{d.specialization}</td>
                  <td>{d.hospitalName}</td>
                  <td>
                    <button
                      onClick={() => remove(d.id)}
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