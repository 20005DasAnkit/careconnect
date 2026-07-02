import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function AdminSlotRequests() {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    async function loadRequests() {

        try {

            const res = await api.get("/admin/slot-requests");

            setRequests(res.data);

        }
        catch (err) {
            console.log(err);
        }

        setLoading(false);

    }

    async function approve(id) {

        try {

            await api.put("/admin/slot-request", {
                requestId: id,
                approve: true,
                adminRemark: "Approved"
            });

            alert("Request Approved");

            loadRequests();

        }
        catch (err) {

            console.log(err);

            alert(err.response?.data);

        }

    }

    async function reject(id) {

        const remark = prompt("Reason for rejection");

        if (!remark)
            return;

        try {

            await api.put("/admin/slot-request", {
                requestId: id,
                approve: false,
                adminRemark: remark
            });

            alert("Request Rejected");

            loadRequests();

        }
        catch (err) {

            console.log(err);

            alert(err.response?.data);

        }

    }

    if (loading)
        return <h2 className="p-10">Loading...</h2>;

    return (

        <div className="flex">

            <Sidebar />

            <div className="ml-64 w-full bg-gray-100 min-h-screen">

                <Navbar />

                <div className="p-6">

                    <h1 className="text-3xl font-bold mb-6">
                        Doctor Slot Requests
                    </h1>

                    <div className="bg-white rounded-xl shadow overflow-hidden">

                        <table className="w-full">

                            <thead className="bg-gray-100">

                                <tr>

                                    <th className="p-4 text-left">
                                        Doctor
                                    </th>

                                    <th className="p-4 text-left">
                                        Hospital
                                    </th>

                                    <th className="p-4 text-left">
                                        From
                                    </th>

                                    <th className="p-4 text-left">
                                        To
                                    </th>

                                    <th className="p-4 text-left">
                                        Patients
                                    </th>

                                    <th className="p-4 text-left">
                                        Status
                                    </th>

                                    <th className="p-4 text-center">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>
                                                            {requests.length === 0 && (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="text-center py-10 text-gray-500"
                                    >
                                        No Slot Requests Found
                                    </td>

                                </tr>

                            )}

                            {requests.map((r) => (

                                <tr
                                    key={r.id}
                                    className="border-t hover:bg-gray-50"
                                >

                                    <td className="p-4 font-medium">
                                        {r.doctorName}
                                    </td>

                                    <td className="p-4">
                                        {r.hospital}
                                    </td>

                                    <td className="p-4">
                                        {new Date(r.requestedFrom).toLocaleString()}
                                    </td>

                                    <td className="p-4">
                                        {new Date(r.requestedTo).toLocaleString()}
                                    </td>

                                    <td className="p-4">
                                        {r.maxPatients}
                                    </td>

                                    <td className="p-4">

                                        {r.status === "Pending" && (
                                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                                                Pending
                                            </span>
                                        )}

                                        {r.status === "Approved" && (
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                                Approved
                                            </span>
                                        )}

                                        {r.status === "Rejected" && (
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                                                Rejected
                                            </span>
                                        )}

                                    </td>

                                    <td className="p-4">

                                        {r.status === "Pending" ? (

                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() => approve(r.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    onClick={() => reject(r.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                                >
                                                    Reject
                                                </button>

                                            </div>

                                        ) : (

                                            <span className="text-gray-500">
                                                Completed
                                            </span>

                                        )}

                                    </td>

                                </tr>

                            ))}
                                                        </tbody>

                        </table>

                    </div>

                    {/* Summary */}

                    <div className="grid grid-cols-4 gap-4 mt-8">

                        <div className="bg-white rounded-xl shadow p-5">
                            <h3 className="text-gray-500">
                                Total Requests
                            </h3>

                            <p className="text-3xl font-bold mt-2">
                                {requests.length}
                            </p>
                        </div>

                        <div className="bg-yellow-50 rounded-xl shadow p-5">

                            <h3 className="text-yellow-700">
                                Pending
                            </h3>

                            <p className="text-3xl font-bold mt-2">

                                {
                                    requests.filter(
                                        x => x.status === "Pending"
                                    ).length
                                }

                            </p>

                        </div>

                        <div className="bg-green-50 rounded-xl shadow p-5">

                            <h3 className="text-green-700">
                                Approved
                            </h3>

                            <p className="text-3xl font-bold mt-2">

                                {
                                    requests.filter(
                                        x => x.status === "Approved"
                                    ).length
                                }

                            </p>

                        </div>

                        <div className="bg-red-50 rounded-xl shadow p-5">

                            <h3 className="text-red-700">
                                Rejected
                            </h3>

                            <p className="text-3xl font-bold mt-2">

                                {
                                    requests.filter(
                                        x => x.status === "Rejected"
                                    ).length
                                }

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}