// src/components/Cart.js
import React from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import api from "../axiosInstance";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // Debugging: Log cart data
  console.log("Cart Data:", cart);

  const calculateGrandTotal = () => {
    if (!cart || !Array.isArray(cart)) return "0.00";
    return cart
      .reduce((total, item) => total + parseFloat(item.totalPrice || 0), 0)
      .toFixed(2);
  };

  const handleCheckout = async () => {
    try {
      const response = await api.post("/Orders/checkout", {});

      if (response.status === 200) {
        alert("Checkout successful!");
        clearCart();
        navigate("/orders"); // Redirect to Orders page
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(
        error.response?.data?.message || "An error occurred during checkout."
      );
    }
  };

  if (!cart) {
    // Optionally, show a loading state
    return <div className="text-center mt-8">Loading your cart...</div>;
  }

  if (cart.length === 0) {
    return <div className="text-center mt-8">Your cart is empty!</div>;
  }

  return (
    <section className="cart-section mt-8 max-w-7xl mx-auto">
      <h1 className="text-center text-primary text-4xl mb-6">Your Cart</h1>
      <div className="cart-items grid gap-6">
        {cart.map((item) => (
          <div
            key={item.id}
            className="cart-item bg-white p-4 rounded shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-700">{item.name}</h2>
            <p className="text-gray-500">Price: ${item.totalPrice}</p>
            <ul className="list-disc list-inside text-gray-600">
              {item.ingredientsInfo &&
                item.ingredientsInfo.map((ingredient) => (
                  <li key={ingredient.id}>
                    {ingredient.name} - Quantity:{" "}
                    {item.ingredientQuantities[ingredient.id] ||
                      ingredient.defaultQuantity}
                  </li>
                ))}
            </ul>
            <button
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
              onClick={() => removeFromCart(item.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="text-right mt-6">
        <h2 className="text-2xl font-semibold">
          Grand Total: ${calculateGrandTotal()}
        </h2>
        <button
          className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
          onClick={handleCheckout}
        >
          Checkout
        </button>
      </div>
    </section>
  );
}
