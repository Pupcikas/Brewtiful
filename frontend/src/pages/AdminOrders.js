// src/pages/AdminOrders.js
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";

const ORDER_STATUSES = [
  "All",
  "Pending",
  "Processing",
  "Completed",
  "Cancelled",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const fetchAllOrders = async (status = "All") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in as an admin to view this page.");
        return;
      }

      // Build the API endpoint with the status query parameter if not 'All'
      let endpoint = "/Orders/all";
      if (status !== "All") {
        endpoint += `?status=${encodeURIComponent(status)}`;
      }

      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      alert(
        error.response?.data?.message ||
          "An error occurred while fetching orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders(selectedStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in as an admin to perform this action.");
        return;
      }

      const response = await api.put(
        `/Orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert("Order status updated successfully.");
        // Update the local state to reflect the change
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while updating order status.";
      alert(message);
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    setLoading(true);
    fetchAllOrders(newStatus);
  };

  if (loading)
    return <div className="text-center mt-8 text-gray-700">Loading...</div>;

  if (orders.length === 0)
    return (
      <div className="text-center mt-8 text-gray-700">No orders found.</div>
    );

  return (
    <section className="orders-section mt-8 max-w-7xl mx-auto px-4">
      <h1 className="text-center text-black text-4xl mb-6">All Orders</h1>

      {/* Filter UI */}
      <div className="flex justify-end mb-4">
        <label
          htmlFor="statusFilter"
          className="mr-2 font-semibold text-gray-700"
        >
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          value={selectedStatus}
          onChange={handleStatusChange}
          className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      {orders.map((order) => (
        <div
          key={order.id}
          className="order bg-white p-6 rounded shadow-md mb-6 transition-transform transform hover:scale-105 duration-300"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Order ID: {order.id}
            </h2>
            <div>
              <label
                htmlFor={`status-${order.id}`}
                className="mr-2 text-gray-700 font-medium"
              >
                Update Status:
              </label>
              <select
                id={`status-${order.id}`}
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <p className="mb-2 text-gray-700">
            <strong>User ID:</strong> {order.userId}
          </p>
          <p className="mb-2 text-gray-700">
            <strong>Status:</strong> {order.status}
          </p>
          <p className="mb-4 text-gray-700">
            <strong>Created At:</strong>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700">
            {order.items.map((item, index) => (
              <li key={index}>
                <strong>{item.itemName}</strong> x {item.quantity} - $
                {(item.price * item.quantity).toFixed(2)}
                <ul className="list-disc list-inside ml-6 text-gray-600">
                  {item.ingredients.map((ing) => (
                    <li key={ing.ingredientId}>
                      {ing.name} (Qty: {ing.quantity}) - Extra Cost: $
                      {ing.extraCost.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="text-xl font-semibold text-gray-800">
            Total Amount: ${order.totalAmount.toFixed(2)}
          </p>
        </div>
      ))}
    </section>
  );
}
