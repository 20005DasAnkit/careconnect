import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function Dashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    api.get("/admin/dashboard").then(res => setData(res.data));
  }, []);

  const Card = ({ title, value, color }) => (
    <div className={`p-5 rounded-xl shadow text-white ${color}`}>
      <h3 className="text-lg">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full bg-gray-100 min-h-screen">
        <Navbar />

        <div className="p-6 grid grid-cols-4 gap-4">
          <Card title="Patients" value={data.totalPatients} color="bg-blue-500" />
          <Card title="Doctors" value={data.totalDoctors} color="bg-green-500" />
          <Card title="Products" value={data.totalProducts} color="bg-purple-500" />
          <Card title="Ambulance" value={data.totalAmbulances} color="bg-red-500" />
          <Card title="Appointments" value={data.totalAppointments} color="bg-yellow-500" />
          <Card title="Orders" value={data.totalOrders} color="bg-indigo-500" />
          <Card title="Pending Appointments" value={data.pendingAppointments} color="bg-orange-500" />
          <Card title="Pending Requests" value={data.pendingAmbulanceRequests} color="bg-pink-500" />
        </div>
      </div>
    </div>
  );
}