import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";

// Admin
import AdminDashboard from "../pages/admin/Dashboard";
import Doctors from "../pages/admin/Doctors";
import Products from "../pages/admin/Products";

// Doctor
// import DoctorDashboard from "../pages/doctor/Dashboard";

// Patient
// import PatientDashboard from "../pages/patient/Dashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth */}
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/doctors" element={<Doctors />} />
        <Route path="/admin/products" element={<Products />} />


      </Routes>
    </BrowserRouter>
  );
}