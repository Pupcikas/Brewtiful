// src/pages/Cart.js
import React from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import api from "../axiosInstance";
import { FaTrash, FaCreditCard } from "react-icons/fa";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // Calculate Grand Total
  const calculateGrandTotal = () => {
    if (!cart || !Array.isArray(cart)) return "0.00";
    return cart
      .reduce((total, item) => total + parseFloat(item.totalPrice || 0), 0)
      .toFixed(2);
  };

  // Handle Checkout
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

  // Handle Remove Item
  const handleRemove = (itemId) => {
    if (
      window.confirm("Are you sure you want to remove this item from the cart?")
    ) {
      removeFromCart(itemId);
    }
  };

  if (!cart) {
    // Optionally, show a loading state
    return (
      <div className="text-center mt-8 text-gray-700">Loading your cart...</div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center mt-8 text-gray-700">Your cart is empty!</div>
    );
  }

  return (
    <section className="cart-section mt-8 max-w-7xl mx-auto p-4">
      <h1 className="text-center text-black text-4xl mb-6">Your Cart</h1>
      <div className="cart-items grid gap-6">
        {cart.map((item) => (
          <div
            key={item.id}
            className="cart-item bg-white p-6 rounded shadow-md flex flex-col md:flex-row items-center transition-transform transform hover:scale-105 duration-300"
          >
            {/* Item Image */}
            {item.pictureUrl && (
              <img
                src={item.pictureUrl}
                alt={item.name}
                className="w-32 h-32 object-cover rounded-md mb-4 md:mb-0 md:mr-6"
              />
            )}
            {/* Item Details */}
            <div className="flex-grow">
              <h2 className="text-xl font-semibold text-gray-800">
                {item.name}
              </h2>
              <p className="text-gray-700">Price: ${item.totalPrice}</p>
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
            </div>
            {/* Remove Button */}
            <button
              className="mt-4 md:mt-0 bg-accent hover:bg-red-700 text-white p-2 rounded flex items-center transition-colors duration-300"
              onClick={() => handleRemove(item.id)}
              aria-label={`Remove ${item.name} from cart`}
            >
              <FaTrash className="mr-2" />
              Remove
            </button>
          </div>
        ))}
      </div>
      {/* Grand Total and Checkout */}
      <div className="text-right mt-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Grand Total: ${calculateGrandTotal()}
        </h2>
        <button
          className="mt-4 bg-green-500 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center transition-colors duration-300"
          onClick={handleCheckout}
        >
          <FaCreditCard className="mr-2" />
          Checkout
        </button>
      </div>
    </section>
  );
}
