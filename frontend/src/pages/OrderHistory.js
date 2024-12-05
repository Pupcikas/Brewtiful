// src/pages/OrderHistory.js
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";

function OrderHistory() {
  const [profile, setProfile] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    monitorToken();

    const fetchOrderHistory = async () => {
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

        // Fetch user's order history
        const { data: historyData } = await api.get("/Orders", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setOrderHistory(historyData);
      } catch (error) {
        console.error("Error fetching order history:", error);
        // Extract detailed error message if available
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to fetch your order history.";
        setModalMessage(errorMsg);
        setModalTitle("Error");
        setIsModalOpen(true);
      }
    };

    fetchOrderHistory();
  }, []);

  if (!profile)
    return <div className="text-center mt-8 text-gray-700">Loading...</div>;

  return (
    <section className="mt-8 max-w-7xl mx-auto p-4">
      <h1 className="text-center text-primary text-4xl mb-6">Order History</h1>
      {orderHistory.length === 0 ? (
        <div className="text-center text-gray-700">
          You have no past orders.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orderHistory.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded shadow-md transition-transform transform hover:scale-105 duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Order #{order.id}
              </h2>
              <p className="text-gray-700 mb-2">
                <strong>Status:</strong> {order.status}
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Created At:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>
              <Link
                to={`/orders/${order.id}`}
                className="text-secondary hover:underline"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
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

export default OrderHistory;
