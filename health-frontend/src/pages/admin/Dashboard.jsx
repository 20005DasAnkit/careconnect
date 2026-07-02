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
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

            <Card title="Patients" value={data.totalPatients || 0} color="bg-blue-500" />

            <Card title="Doctors" value={data.totalDoctors || 0} color="bg-green-500" />

            <Card title="Hospitals" value={data.totalHospitals || 0} color="bg-cyan-600" />

            <Card title="Products" value={data.totalProducts || 0} color="bg-purple-500" />

            <Card title="Ambulances" value={data.totalAmbulances || 0} color="bg-red-500" />

            <Card title="Appointments" value={data.totalAppointments || 0} color="bg-yellow-500" />

            <Card title="Orders" value={data.totalOrders || 0} color="bg-indigo-500" />

            <Card title="Pending Appointments" value={data.pendingAppointments || 0} color="bg-orange-500" />

            <Card title="Pending Ambulance" value={data.pendingAmbulanceRequests || 0} color="bg-pink-500" />

          </div>
        </div>
      </div>
    </div>
  );
}