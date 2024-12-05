// src/pages/Orders.js
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import Modal from "../components/Modal";

function Orders() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);

  useEffect(() => {
    monitorToken();

    const fetchData = async () => {
      try {
        // Fetch user profile
        const { data: profileData } = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProfile(profileData);

        // Check if user is Admin
        if (profileData.role === "Admin") {
          setModalMessage("Admins should use the Admin Orders page.");
          setModalTitle("Access Denied");
          setIsModalOpen(true);
          return;
        }

        // Fetch user's orders
        const { data: ordersData } = await api.get("/Orders", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setModalMessage("Failed to fetch your orders.");
        setModalTitle("Error");
        setIsModalOpen(true);
      }
    };

    fetchData();
  }, []);

  // Toggle expansion of order details
  const toggleExpand = (orderId) => {
    setExpandedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  if (!profile)
    return <div className="text-center mt-8 text-gray-700">Loading...</div>;

  return (
    <section className="mt-8 max-w-7xl mx-auto p-4">
      <h1 className="text-center text-black text-4xl mb-6">Your Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center text-gray-700">You have no orders.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.Id}
              className="bg-white p-6 rounded shadow-md transition-transform transform hover:scale-105 duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Order #{order.id}
                  </h2>
                  <p className="text-gray-700">
                    <strong>Status:</strong> {order.status}
                  </p>
                  <p className="text-gray-700">
                    <strong>Created At:</strong>
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                  <p className="text-gray-700">
                    <strong>Total Amount:</strong> $
                    {order.totalAmount !== undefined
                      ? order.totalAmount.toFixed(2)
                      : "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => toggleExpand(order.Id)}
                  className="text-secondary hover:underline focus:outline-none"
                >
                  {expandedOrderIds.includes(order.Id)
                    ? "Hide Details ▲"
                    : "View Details ▼"}
                </button>
              </div>

              {expandedOrderIds.includes(order.Id) && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Items:</h3>
                  <ul className="list-disc list-inside mb-4">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <li key={item.itemId} className="text-gray-700 mb-2">
                          <div>
                            <strong>{item.itemName}</strong> - Quantity:{" "}
                            {item.Quantity} - Price: $
                            {item.price !== undefined
                              ? item.price.toFixed(2)
                              : "N/A"}
                          </div>
                          {item.ingredients && item.ingredients.length > 0 && (
                            <ul className="list-circle list-inside ml-5 mt-1">
                              {item.ingredients.map((ingredient) => (
                                <li
                                  key={ingredient.ingredientId}
                                  className="text-gray-600"
                                >
                                  {ingredient.name} - Quantity:{" "}
                                  {ingredient.quantity} - Extra Cost: $
                                  {ingredient.extraCost !== undefined
                                    ? ingredient.extraCost.toFixed(2)
                                    : "N/A"}
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-700">No items found.</li>
                    )}
                  </ul>
                  {order.UpdatedAt && (
                    <div className="mb-2">
                      <strong>Last Updated:</strong>{" "}
                      {new Date(order.UpdatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
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

export default Orders;
