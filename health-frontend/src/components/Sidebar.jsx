import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-blue-900 text-white p-5 fixed">
      <h1 className="text-2xl font-bold mb-8">HealthCare</h1>

      <div className="flex flex-col gap-4">
        <Link to="/admin" className="hover:bg-blue-700 p-2 rounded">Dashboard</Link>
        <Link to="/admin/doctors" className="hover:bg-blue-700 p-2 rounded">Doctors</Link>
        <Link to="/admin/products" className="hover:bg-blue-700 p-2 rounded">Products</Link>
        <Link to="/admin/appointments" className="hover:bg-blue-700 p-2 rounded">Appointments</Link>
        <Link to="/admin/ambulance" className="hover:bg-blue-700 p-2 rounded">Ambulance</Link>
      </div>
    </div>
  );
}