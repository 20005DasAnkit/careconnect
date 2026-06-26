import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { registerUser } from "../../services/authService";

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Patient",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  setLoading(true);

  try {
    const payload = {
      fullName: form.name,
      email: form.email,
      password: form.password,
    };

    console.log(payload);

    await registerUser(payload);

    alert("Registration Successful");
    navigate("/login");
  } catch (err) {
    console.log(err.response?.data);
    alert(
      err.response?.data?.message ||
      err.response?.data ||
      "Registration Failed"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#F7F4EE]">

      <div className="grid lg:grid-cols-2 min-h-screen max-w-7xl mx-auto">

        {/* LEFT */}

        <div className="hidden lg:flex relative overflow-hidden flex-col justify-center px-20">

          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-green-100 blur-3xl"></div>

          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-emerald-100 blur-3xl"></div>

          <div className="relative">

            <span className="uppercase tracking-[6px] text-sm font-semibold text-[#2F5E52]">
              CareConnect
            </span>

            <h1
              className="mt-6 text-6xl leading-tight text-[#16352E]"
              style={{
                fontFamily: "Playfair Display, serif",
              }}
            >
              Create
              <br />
              Account
            </h1>

            <p className="mt-8 max-w-md leading-8 text-[#58766B] text-lg">

              Join CareConnect and experience
              a smarter, faster and secure
              healthcare platform.

            </p>

            <div className="mt-14 rounded-[30px] border border-green-200 bg-white/60 backdrop-blur-xl shadow-xl p-8">

              <h2
                className="text-3xl text-[#16352E]"
                style={{
                  fontFamily:
                    "Playfair Display, serif",
                }}
              >
                Healthcare
                Simplified
              </h2>

              <p className="mt-5 leading-8 text-[#58766B]">

                Register once and access
                appointments, pharmacy,
                ambulance and healthcare
                records anytime.

              </p>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex justify-center items-center px-8 py-12">

          <div className="w-full max-w-md rounded-[35px] bg-white/70 backdrop-blur-xl border border-white shadow-2xl p-10">

            <h2
              className="text-4xl text-[#16352E]"
              style={{
                fontFamily:
                  "Playfair Display, serif",
              }}
            >
              Sign Up
            </h2>

            <p className="mt-2 text-[#58766B]">

              Create your account

            </p>
                        {/* Full Name */}

            <div className="mt-8">

              <label className="mb-2 block text-sm font-medium text-[#16352E]">
                Full Name
              </label>

              <div className="relative">

                <User
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#58766B]"
                />

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl border border-green-200 bg-white pl-12 pr-4 text-[#16352E] outline-none transition-all duration-300 focus:border-[#2D6A4F] focus:ring-4 focus:ring-green-100"
                />

              </div>

            </div>

            {/* Email */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-[#16352E]">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#58766B]"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl border border-green-200 bg-white pl-12 pr-4 text-[#16352E] outline-none transition-all duration-300 focus:border-[#2D6A4F] focus:ring-4 focus:ring-green-100"
                />

              </div>

            </div>

            {/* Phone */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-[#16352E]">
                Phone Number
              </label>

              <div className="relative">

                <Phone
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#58766B]"
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl border border-green-200 bg-white pl-12 pr-4 text-[#16352E] outline-none transition-all duration-300 focus:border-[#2D6A4F] focus:ring-4 focus:ring-green-100"
                />

              </div>

            </div>
                        {/* Password */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-[#16352E]">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#58766B]"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl border border-green-200 bg-white pl-12 pr-14 text-[#16352E] outline-none transition-all duration-300 focus:border-[#2D6A4F] focus:ring-4 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#58766B]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>

              </div>

            </div>

            {/* Confirm Password */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-[#16352E]">
                Confirm Password
              </label>

              <div className="relative">

                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#58766B]"
                />

                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl border border-green-200 bg-white pl-12 pr-14 text-[#16352E] outline-none transition-all duration-300 focus:border-[#2D6A4F] focus:ring-4 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#58766B]"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>

              </div>

            </div>

            {/* Role */}


            {/* Register Button */}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="mt-8 h-14 w-full rounded-2xl bg-[#16352E] text-white font-semibold transition-all duration-300 hover:bg-[#2D6A4F] hover:shadow-xl disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="mt-8 text-center text-[#58766B]">

              Already have an account?

              <Link
                to="/login"
                className="ml-2 font-semibold text-[#16352E] hover:text-[#2D6A4F]"
              >
                Sign In
              </Link>

            </p>

          </div>

        </div>

      </div>

      {/* Decoration */}

      <div className="hidden lg:block">

        <div className="absolute top-20 right-24 h-40 w-40 rounded-full bg-green-100 blur-3xl opacity-70"></div>

        <div className="absolute bottom-16 left-20 h-52 w-52 rounded-full bg-emerald-100 blur-3xl opacity-60"></div>

      </div>

    </div>
  );
}