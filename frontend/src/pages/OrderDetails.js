// src/pages/OrderDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import Modal from "../components/Modal";

function OrderDetails() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [order, setOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
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

        // Check if user is not Admin
        if (profileData.role === "Admin") {
          setModalMessage("Admins should use the Admin Orders page.");
          setModalTitle("Access Denied");
          setIsModalOpen(true);
          return;
        }

        // Fetch specific order details
        const { data: orderData } = await api.get(`/Orders/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setOrder(orderData);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setModalMessage("Failed to fetch order details.");
        setModalTitle("Error");
        setIsModalOpen(true);
      }
    };

    fetchOrderDetails();
  }, [id]);

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
        to="/orders"
        className="text-secondary hover:underline mb-4 inline-block"
      >
        &larr; Back to Orders
      </Link>
      <h1 className="text-center text-primary text-3xl mb-6">
        Order #{order.id} Details
      </h1>
      <div className="bg-white p-6 rounded shadow-md">
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
      </div>

      {/* Feedback Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => navigate("/orders")}
        title={modalTitle}
      >
        <p>{modalMessage}</p>
      </Modal>
    </section>
  );
}

export default OrderDetails;
