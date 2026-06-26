import { useEffect, useState } from "react";

export default function Profile() {

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });

useEffect(() => {
  const email = localStorage.getItem("email");

  const savedProfile = localStorage.getItem(`profile_${email}`);

  if (savedProfile) {
    setForm(JSON.parse(savedProfile));
  } else {
    setForm({
      fullName: localStorage.getItem("name") || "",
      email: email || "",
      phone: "",
      gender: "",
      dob: "",
      bloodGroup: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
    });
  }
}, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const saveProfile = () => {
  const email = localStorage.getItem("email");

  const profile = {
    ...form,
    email,
  };

  localStorage.setItem(
    `profile_${email}`,
    JSON.stringify(profile)
  );

  localStorage.setItem("name", profile.fullName);

  alert("Profile Saved Successfully");
};

  return (

<div className="min-h-screen bg-[#F8F6F0] py-10">

<div className="max-w-5xl mx-auto bg-white rounded-[35px] shadow-xl border border-[#E7E1D7] p-10">

<h1
className="text-5xl text-[#16332B]"
style={{fontFamily:"Playfair Display"}}
>
My Profile
</h1>

<p className="mt-2 text-gray-500">
Manage your account information
</p>

<div className="mt-10 flex items-center gap-6">

<img
src="https://i.pravatar.cc/150"
className="w-28 h-28 rounded-full object-cover"
/>

<div>

<h2 className="text-2xl font-semibold text-[#16332B]">
{form.fullName || "Patient"}
</h2>

<p className="text-gray-500">
{form.email}
</p>

</div>

</div>

<div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Full Name */}

          <div>

            <label className="block mb-2 text-sm font-medium text-[#16332B]">
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full h-14 rounded-2xl border border-[#D8D2C7] px-5 outline-none focus:ring-4 focus:ring-green-100"
            />

          </div>

          {/* Email */}

          <div>

            <label className="block mb-2 text-sm font-medium text-[#16332B]">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full h-14 rounded-2xl border border-[#D8D2C7] px-5 outline-none focus:ring-4 focus:ring-green-100"
            />

          </div>

          {/* Phone */}

          <div>

            <label className="block mb-2 text-sm font-medium text-[#16332B]">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full h-14 rounded-2xl border border-[#D8D2C7] px-5 outline-none focus:ring-4 focus:ring-green-100"
            />

          </div>

          {/* Gender */}

          <div>

            <label className="block mb-2 text-sm font-medium text-[#16332B]">
              Gender
            </label>

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full h-14 rounded-2xl border border-[#D8D2C7] px-5 outline-none focus:ring-4 focus:ring-green-100"
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

          </div>

          {/* DOB */}

          <div>

            <label className="block mb-2 text-sm font-medium text-[#16332B]">
              Date of Birth
            </label>

            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="w-full h-14 rounded-2xl border border-[#D8D2C7] px-5 outline-none focus:ring-4 focus:ring-green-100"
            />

          </div>

          {/* Blood Group */}

          <div>

            <label className="block mb-2 text-sm font-medium text-[#16332B]">
              Blood Group
            </label>

            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              className="w-full h-14 rounded-2xl border border-[#D8D2C7] px-5 outline-none focus:ring-4 focus:ring-green-100"
            >
              <option value="">Select</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>

          </div>

          {/* Address */}

          <div className="md:col-span-2">

            <label className="block mb-2 text-sm font-medium text-[#16332B]">
              Address
            </label>

            <textarea
              rows="4"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[#D8D2C7] p-5 outline-none focus:ring-4 focus:ring-green-100"
            />

          </div>
                    {/* City */}

          <div>

            <label className="block mb-2 text-sm font-medium text-[#16332B]">
              City
            </label>

            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full h-14 rounded-2xl border border-[#D8D2C7] px-5 outline-none focus:ring-4 focus:ring-green-100"
            />

          </div>

          {/* State */}

          <div>

            <label className="block mb-2 text-sm font-medium text-[#16332B]">
              State
            </label>

            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full h-14 rounded-2xl border border-[#D8D2C7] px-5 outline-none focus:ring-4 focus:ring-green-100"
            />

          </div>

          {/* Country */}

          <div>

            <label className="block mb-2 text-sm font-medium text-[#16332B]">
              Country
            </label>

            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full h-14 rounded-2xl border border-[#D8D2C7] px-5 outline-none focus:ring-4 focus:ring-green-100"
            />

          </div>

          {/* PIN Code */}

          <div>

            <label className="block mb-2 text-sm font-medium text-[#16332B]">
              PIN Code
            </label>

            <input
              type="text"
              name="pinCode"
              value={form.pinCode}
              onChange={handleChange}
              className="w-full h-14 rounded-2xl border border-[#D8D2C7] px-5 outline-none focus:ring-4 focus:ring-green-100"
            />

          </div>

        </div>

        {/* Save Button */}

        <div className="mt-10 flex justify-end">

          <button
            onClick={saveProfile}
            className="px-10 py-4 rounded-2xl bg-[#16332B] text-white font-semibold hover:bg-[#245242] transition-all duration-300"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>

  );
}