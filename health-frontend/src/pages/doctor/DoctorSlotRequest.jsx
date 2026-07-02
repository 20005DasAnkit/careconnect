import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function DoctorSlotRequest() {

    const [hospitals, setHospitals] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [requests, setRequests] = useState([]);

    const [form, setForm] = useState({
        hospitalId: "",
        hospitalSessionId: "",
        requestedFrom: "",
        requestedTo: "",
        maxPatients: 20,
        reason: ""
    });

    useEffect(() => {
        loadHospitals();
        loadRequests();
    }, []);

    async function loadHospitals() {
        try {
            const res = await api.get("/doctor/hospitals");
            setHospitals(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    async function loadRequests() {
        try {
            const res = await api.get("/doctor/slot-requests");
            setRequests(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    async function loadSessions(hospitalId) {
        try {
            const res = await api.get(
                `/doctor/hospital-sessions/${hospitalId}`
            );
            setSessions(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === "hospitalId") {
            loadSessions(value);
            setForm(prev => ({
                ...prev,
                hospitalId: value,
                hospitalSessionId: ""
            }));
        }
    }
    async function submitRequest() {
        if (!form.hospitalId) {
            alert("Select Hospital");
            return;
        }
        if (!form.hospitalSessionId) {
            alert("Select Hospital Session");
            return;
        }
        if (!form.requestedFrom) {
            alert("Select Start Time");
            return;
        }
        if (!form.requestedTo) {
            alert("Select End Time");
            return;
        }
        try {

            const payload = {
                hospitalId: Number(form.hospitalId),
                hospitalSessionId: Number(form.hospitalSessionId),
                requestedFrom: form.requestedFrom,
                requestedTo: form.requestedTo,
                maxPatients: Number(form.maxPatients),
                reason: form.reason
            };
            await api.post("/doctor/request-slot", payload);
            alert("Slot request submitted successfully.");
            setForm({
                hospitalId: "",
                hospitalSessionId: "",
                requestedFrom: "",
                requestedTo: "",
                maxPatients: 20,
                reason: ""
            });

            setSessions([]);
            loadRequests();

        } catch (err) {
            console.log(err);
            alert(
                err.response?.data ||
                "Unable to submit request."
            );
        }
    }
    return (

        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-2xl font-bold mb-6">
                        Request Hospital Slot
                    </h2>

                    <div className="grid md:grid-cols-2 gap-5">

                        <div>

                            <label className="font-semibold">
                                Hospital
                            </label>

                            <select
                                className="w-full border rounded p-2 mt-2"
                                name="hospitalId"
                                value={form.hospitalId}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select Hospital
                                </option>
                                {hospitals.map(h => (

                                    <option
                                        key={h.id}
                                        value={h.id}
                                    >
                                        {h.name}
                                    </option>

                                ))}
                            </select>
                        </div>
                        <div>

                            <label className="font-semibold">
                                Session
                            </label>

                            <select
                                className="w-full border rounded p-2 mt-2"
                                name="hospitalSessionId"
                                value={form.hospitalSessionId}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select Session
                                </option>
                                {sessions.map(s => (

                                    <option
                                        key={s.id}
                                        value={s.id}
                                    >
                                        {s.day} | {s.startTime} - {s.endTime}
                                    </option>

                                ))}
                            </select>
                        </div>
                        <div>

                            <label className="font-semibold">
                                From
                            </label>
                            <input
                                type="datetime-local"
                                name="requestedFrom"
                                value={form.requestedFrom}
                                onChange={handleChange}
                                className="w-full border rounded p-2 mt-2"
                            />
                        </div>
                        <div>

                            <label className="font-semibold">
                                To
                            </label>
                            <input
                                type="datetime-local"
                                name="requestedTo"
                                value={form.requestedTo}
                                onChange={handleChange}
                                className="w-full border rounded p-2 mt-2"
                            />
                        </div>
                        <div>

                            <label className="font-semibold">
                                Maximum Patients
                            </label>
                            <input
                                type="number"
                                name="maxPatients"
                                value={form.maxPatients}
                                onChange={handleChange}
                                className="w-full border rounded p-2 mt-2"
                            />
                        </div>

                        <div className="md:col-span-2">

                            <label className="font-semibold">
                                Reason
                            </label>
                            <textarea
                                name="reason"
                                value={form.reason}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Example: Extra Evening OPD, Emergency Duty, Weekend Checkup"
                                className="w-full border rounded p-3 mt-2"
                            />
                        </div>

                    </div>
                    <button
                        onClick={submitRequest}
                        className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Submit Request
                    </button>
                </div>

                {/* ===================== MY REQUESTS ===================== */}

                <div className="bg-white rounded-xl shadow mt-8 overflow-hidden">
                    <div className="p-5 border-b">
                        <h2 className="text-xl font-bold">
                            My Slot Requests
                        </h2>

                    </div>

                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Hospital</th>
                                <th className="p-3 text-left">From</th>
                                <th className="p-3 text-left">To</th>
                                <th className="p-3 text-left">Patients</th>
                                <th className="p-3 text-left">Reason</th>
                                <th className="p-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>

                            {requests.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="text-center p-6 text-gray-500"
                                    >
                                        No Requests Found
                                    </td>
                                </tr>
                            )}
                            {requests.map(r => (
                                <tr
                                    key={r.id}
                                    className="border-t"
                                >
                                    <td className="p-3">
                                        {r.hospital}
                                    </td>
                                    <td className="p-3">
                                        {new Date(r.requestedFrom).toLocaleString()}
                                    </td>
                                    <td className="p-3">
                                        {new Date(r.requestedTo).toLocaleString()}
                                    </td>
                                    <td className="p-3">
                                        {r.maxPatients}
                                    </td>
                                    <td className="p-3">
                                        {r.reason || "-"}
                                    </td>
                                    <td className="p-3">
                                        {r.status === "Pending" && (
                                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                                                Pending
                                            </span>
                                        )}

                                        {r.status === "Approved" && (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                                Approved
                                            </span>
                                        )}

                                        {r.status === "Rejected" && (
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">
                                                Rejected
                                            </span>
                                        )}

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
