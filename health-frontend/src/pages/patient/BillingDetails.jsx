import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function BillingDetails() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const slot = state?.slot;
    const doctor = state?.doctor;

    const [useProfile, setUseProfile] = useState(true);

    const [form, setForm] = useState({
        patientName: "",
        patientPhone: "",
        patientEmail: "",
        patientDob: "",
        gender: "",
        bloodGroup: "",
        address: "",
        relationship: "Self"
    });

    useEffect(() => {
        if (useProfile) {
            api.get("/patient/profile")
                .then(res => {
                    setForm({
                        patientName: res.data.fullName || "",
                        patientPhone: res.data.phone || "",
                        patientEmail: res.data.email || "",
                        patientDob: res.data.dob?.substring(0, 10) || "",
                        gender: res.data.gender || "",
                        bloodGroup: res.data.bloodGroup || "",
                        address: res.data.address || "",
                        relationship: "Self"
                    });
                });
        }
    }, [useProfile]);

    const next = () => {

        if (!form.patientName.trim())
            return toast.error("Patient name required");

        if (!form.patientPhone.trim())
            return toast.error("Phone required");

        navigate("/patient/payment", {
            state: {
                slot,
                doctor,
                patient: form
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6">

            <h2 className="text-3xl font-bold mb-6">
                Billing Details
            </h2>

            <label className="flex items-center gap-3 mb-6">

                <input
                    type="checkbox"
                    checked={useProfile}
                    onChange={() => setUseProfile(!useProfile)}
                />

                Use My Profile Details

            </label>

            <div className="grid grid-cols-2 gap-5">

                <input
                    placeholder="Patient Name"
                    value={form.patientName}
                    onChange={e =>
                        setForm({
                            ...form,
                            patientName: e.target.value
                        })
                    }
                />

                <input
                    placeholder="Phone"
                    value={form.patientPhone}
                    onChange={e =>
                        setForm({
                            ...form,
                            patientPhone: e.target.value
                        })
                    }
                />

                <input
                    placeholder="Email"
                    value={form.patientEmail}
                    onChange={e =>
                        setForm({
                            ...form,
                            patientEmail: e.target.value
                        })
                    }
                />

                <input
                    type="date"
                    value={form.patientDob}
                    onChange={e =>
                        setForm({
                            ...form,
                            patientDob: e.target.value
                        })
                    }
                />

                <input
                    placeholder="Gender"
                    value={form.gender}
                    onChange={e =>
                        setForm({
                            ...form,
                            gender: e.target.value
                        })
                    }
                />

                <input
                    placeholder="Blood Group"
                    value={form.bloodGroup}
                    onChange={e =>
                        setForm({
                            ...form,
                            bloodGroup: e.target.value
                        })
                    }
                />

                <input
                    placeholder="Relationship"
                    value={form.relationship}
                    onChange={e =>
                        setForm({
                            ...form,
                            relationship: e.target.value
                        })
                    }
                />

                <input
                    placeholder="Address"
                    value={form.address}
                    onChange={e =>
                        setForm({
                            ...form,
                            address: e.target.value
                        })
                    }
                />

            </div>

            <button
                onClick={next}
                className="mt-8 bg-[#16332B] text-white px-8 py-3 rounded-xl"
            >
                Continue to Payment
            </button>

        </div>
    );
}