import { useState, useContext } from "react";
import { loginUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await loginUser({ email, password });

      login(data);

      if (data.role === "Admin") navigate("/admin");
      else if (data.role === "Doctor") navigate("/doctor");
      else navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE (branding) */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-700 to-purple-700 text-white flex-col justify-center items-center p-10">
        <h1 className="text-4xl font-bold mb-4">CareConnenct</h1>
        <p className="text-center text-lg opacity-80">
          Smart Hospital System<br />
          Doctor | Ambulance | Pharmacy
        </p>
      </div>

      {/* RIGHT SIDE (form) */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-100">

        <div className="bg-white p-8 rounded-2xl shadow-xl w-96">

          <h2 className="text-2xl font-bold text-center mb-6">
            Welcome Back 👋
          </h2>

          <p className="text-center text-gray-500 mb-6">
            Login to your account
          </p>

          <input
            className="w-full border p-3 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center mt-4 text-sm text-gray-500">
            Doctor • User • Admin System
          </div>

        </div>
      </div>

    </div>
  );
}