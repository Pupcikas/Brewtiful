// src/pages/OrderDetailsAdmin.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import Modal from "../components/Modal";

function OrderDetailsAdmin() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [order, setOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    monitorToken();

    const fetchOrderDetails = async () => {
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

        // Fetch specific order details
        const { data: orderData } = await api.get(`/Orders/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setOrder(orderData);
        setNewStatus(orderData.status);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setModalMessage("Failed to fetch order details.");
        setModalTitle("Error");
        setIsModalOpen(true);
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      await api.put(
        `/Orders/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update order in state
      setOrder((prevOrder) => ({ ...prevOrder, status: newStatus }));

      setModalMessage("Order status updated successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
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

  if (!order)
    return (
      <div className="text-center mt-8 text-gray-700">
        Loading order details...
      </div>
    );

  return (
    <section className="mt-8 max-w-3xl mx-auto p-4">
      <Link
        to="/admin/orders"
        className="text-secondary hover:underline mb-4 inline-block"
      >
        &larr; Back to Orders
      </Link>
      <h1 className="text-center text-primary text-3xl mb-6">
        Order #{order.id} Details
      </h1>
      <div className="bg-white p-6 rounded shadow-md">
        <p className="text-gray-700 mb-2">
          <strong>User:</strong> {order.user.name} ({order.user.username})
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Status:</strong> {order.status}
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Created At:</strong>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Items:</h2>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          {order.items.map((item, index) => (
            <li key={index}>
              <strong>{item.name}</strong> x {item.quantity} - $
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

        {/* Status Update Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Update Order Status
          </h3>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary mb-4"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button
            onClick={handleStatusUpdate}
            className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded transition-colors duration-300"
          >
            Update Status
          </button>
        </div>
      </div>

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

export default OrderDetailsAdmin;
