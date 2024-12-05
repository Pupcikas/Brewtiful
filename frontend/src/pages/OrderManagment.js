// src/pages/OrderManagement.js
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";

function OrderManagement() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    monitorToken();

    const fetchOrders = async () => {
      try {
        // Fetch user profile
        const { data: profileData } = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProfile(profileData);

        // Check if user is Admin
        if (profileData.role !== "Admin") {
          setModalMessage("You are not authorized to view this page.");
          setModalTitle("Authorization Error");
          setIsModalOpen(true);
          return;
        }

        // Fetch all orders
        const { data: ordersData } = await api.get("/Orders/all", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setModalMessage("Failed to fetch orders.");
        setModalTitle("Error");
        setIsModalOpen(true);
      }
    };

    fetchOrders();
  }, []);

  // Handle status change
  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
  };

  // Submit status update
  const submitStatusUpdate = async () => {
    try {
      await api.put(
        `/Orders/${selectedOrder.id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update order in state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: newStatus }
            : order
        )
      );

      setModalMessage("Order status updated successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      setModalMessage(
        error.response?.data?.message ||
          "An unexpected error occurred while updating order status."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  if (!profile)
    return <div className="text-center mt-8 text-gray-700">Loading...</div>;

  return (
    <section className="mt-8 max-w-7xl mx-auto p-4">
      <h1 className="text-center text-black text-4xl mb-6">Manage Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center text-gray-700">No orders available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow-md">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Order ID</th>
                <th className="py-2 px-4 border-b">User</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Created At</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-100 transition-colors duration-300"
                >
                  <td className="py-2 px-4 border-b text-gray-700">
                    {order.id}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-700">
                    {order.user.name} ({order.user.username})
                  </td>
                  <td className="py-2 px-4 border-b text-gray-700">
                    {order.status}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-700">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-700">
                    <button
                      onClick={() => handleStatusChange(order)}
                      className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors duration-300 mr-2"
                      aria-label={`Change status for order ${order.id}`}
                    >
                      Change Status
                    </button>
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="bg-secondary hover:bg-secondary-dark text-white px-3 py-1 rounded transition-colors duration-300"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Update Status for Order #${selectedOrder.id}`}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="status-select"
                className="block text-gray-700 font-medium mb-2"
              >
                Select New Status
              </label>
              <select
                id="status-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={submitStatusUpdate}
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors duration-300"
              >
                Update Status
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Feedback Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <p>{modalMessage}</p>
      </Modal>
    </section>
  );
}

export default OrderManagement;
