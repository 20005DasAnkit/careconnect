import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const res = await api.get("/patient/appointments");
            setAppointments(res.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (id) => {
        try {
            await api.put(`/patient/appointment/cancel/${id}`);
            alert("Appointment cancelled successfully");
            loadAppointments();
        } catch (err) {
            console.log(err);
            alert(err?.response?.data || "Cancel failed");
        }
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    📅 My Appointments
                </h1>
                <p className="text-gray-500 text-sm">
                    View and manage your doctor appointments
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <p className="text-gray-500">Loading appointments...</p>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-x-auto">

                <table className="w-full text-sm text-left">

                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="p-3">Doctor ID</th>
                            <th className="p-3">Availability ID</th>
                            <th className="p-3">Booked At</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Payment</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {appointments.map((a) => (
                            <tr key={a.id} className="border-t">

                                <td className="p-3">
                                    {a.doctorId}
                                </td>

                                <td className="p-3">
                                    {a.doctorAvailabilityId}
                                </td>

                                <td className="p-3">
                                    {new Date(a.bookedAt).toLocaleString()}
                                </td>

                                {/* Status */}
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${a.status === "Confirmed"
                                                ? "bg-green-100 text-green-700"
                                                : a.status === "CancelledByUser"
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {a.status}
                                    </span>
                                </td>

                                {/* Payment */}
                                <td className="p-3">
                                    <span className="text-blue-600 font-semibold">
                                        {a.paymentStatus}
                                    </span>
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        ₹{a.advanceAmount}
                                    </span>
                                </td>

                                {/* Action */}
                                <td className="p-3">

                                    {a.status === "Confirmed" && (
                                        <button
                                            onClick={() => cancelAppointment(a.id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                                        >
                                            Cancel
                                        </button>
                                    )}

                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>

            </div>

            {/* Empty */}
            {!loading && appointments.length === 0 && (
                <p className="text-gray-500">
                    No appointments found
                </p>
            )}

        </div>
    );
}