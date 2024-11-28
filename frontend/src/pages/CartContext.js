// src/components/CartContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../axiosInstance";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    try {
      const response = await api.get("/Cart");

      if (response.status === 200) {
        console.log("Cart Data Received:", response.data);
        setCart(response.data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      // Optionally, handle errors (e.g., show a notification)
    }
  };

  const addToCart = async (
    item,
    ingredientsInfo,
    ingredientQuantities,
    totalPrice
  ) => {
    try {
      // Prepare the payload
      const payload = {
        ItemId: item.id,
        Quantity: 1, // or dynamic based on user input
        IngredientQuantities: ingredientQuantities,
      };

      // Make API call to add item to cart
      const response = await api.post("/Cart/add", payload);

      if (response.status === 200) {
        // Fetch the updated cart
        fetchCart();
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      alert(
        error.response?.data?.message ||
          "An error occurred while adding to cart."
      );
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const payload = { ItemId: itemId };

      const response = await api.post("/Cart/remove", payload);

      if (response.status === 200) {
        // Fetch the updated cart
        fetchCart();
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      alert(
        error.response?.data?.message ||
          "An error occurred while removing from cart."
      );
    }
  };

  const clearCart = () => setCart([]);

  useEffect(() => {
    fetchCart();
    // Optionally, set up polling or subscriptions for real-time updates
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
