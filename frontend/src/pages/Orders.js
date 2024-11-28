// src/components/Orders.js
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to view your orders.");
        return;
      }

      const response = await api.get("/Orders", {
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
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  if (orders.length === 0)
    return <div className="text-center mt-8">You have no orders.</div>;

  return (
    <section className="orders-section mt-8 max-w-7xl mx-auto">
      <h1 className="text-center text-primary text-4xl mb-6">Your Orders</h1>
      {orders.map((order) => (
        <div
          key={order.id}
          className="order bg-white p-6 rounded shadow-md mb-6"
        >
          <h2 className="text-2xl font-semibold mb-4">Order ID: {order.id}</h2>
          <p className="mb-2">
            <strong>Status:</strong> {order.status}
          </p>
          <p className="mb-4">
            <strong>Created At:</strong>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>
          <ul className="list-disc list-inside mb-4">
            {order.items.map((item, index) => (
              <li key={index}>
                <strong>{item.itemName}</strong> x {item.quantity} - $
                {(item.price * item.quantity).toFixed(2)}
                <ul className="list-disc list-inside ml-6">
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
          <p className="text-xl font-semibold">
            Total Amount: ${order.totalAmount.toFixed(2)}
          </p>
        </div>
      ))}
    </section>
  );
}
