import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function ProductOrders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const res = await api.get("/admin/product-orders");
        setOrders(res.data);
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(
                `/admin/product-order/${id}/status`,
                JSON.stringify(status),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            // Reload latest data
            await load();

        } catch (err) {
            console.log(err);
            alert("Failed to update status");
        }
    };

    const STATUS = {
        Pending: "bg-yellow-100 text-yellow-700",
        Confirmed: "bg-blue-100 text-blue-700",
        Packed: "bg-purple-100 text-purple-700",
        "Out for Delivery": "bg-orange-100 text-orange-700",
        Delivered: "bg-green-100 text-green-700",
        Cancelled: "bg-red-100 text-red-700",
    };

    const markPayment = async (id) => {
        await api.put(`/admin/product-order/${id}/payment`);
        await load();
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="ml-64 w-full min-h-screen bg-gray-100">
                <Navbar />

                <div className="p-6">

                    <h2 className="text-3xl font-bold mb-6">
                        Product Orders
                    </h2>

                    <div className="bg-white rounded shadow overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-blue-700 text-white">

                                <tr>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Product</th>
                                    <th className="p-3">Qty</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Total</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Date</th>
                                </tr>

                            </thead>

                            <tbody>

                                {orders.map(o => (

                                    <tr key={o.orderId} className="border-b">

                                        <td className="p-3">{o.customerName}</td>
                                        <td className="p-3">{o.customerEmail}</td>
                                        <td className="p-3">{o.productName}</td>
                                        <td className="p-3">{o.quantity}</td>
                                        <td className="p-3">₹{o.unitPrice}</td>
                                        <td className="p-3">₹{o.total}</td>
                                        <td className="p-3">
                                            <div className="flex flex-col gap-2">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${STATUS[o.status]}`}
                                                >
                                                    {o.status}
                                                </span>

                                                {o.status === "Pending" && (
                                                    <button
                                                        onClick={() => updateStatus(o.orderId, "Confirmed")}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                                    >
                                                        ✓ Accept
                                                    </button>
                                                )}

                                                {o.status === "Confirmed" && (
                                                    <button
                                                        onClick={() => updateStatus(o.orderId, "Packed")}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
                                                    >
                                                        📦 Pack
                                                    </button>
                                                )}

                                                {o.status === "Packed" && (
                                                    <button
                                                        onClick={() => updateStatus(o.orderId, "Out for Delivery")}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded"
                                                    >
                                                        🚚 Dispatch
                                                    </button>
                                                )}

                                                {o.status === "Out for Delivery" && (
                                                    <button
                                                        onClick={() => updateStatus(o.orderId, "Delivered")}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                                                    >
                                                        ✅ Deliver
                                                    </button>
                                                )}

                                                {o.status === "Delivered" && o.paymentStatus !== "Paid" && (
                                                    <button
                                                        onClick={() => markPayment(o.orderId)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded"
                                                    >
                                                        💳 Payment Received
                                                    </button>
                                                )}

                                                {o.status === "Delivered" && o.paymentStatus === "Paid" && (
                                                    <span className="text-green-600 font-bold">
                                                        ✔ Completed
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {o.paymentStatus === "Paid" ? (
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    ✅ Paid
                                                </span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {new Date(o.orderDate).toLocaleString()}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    );
}