import React from "react";
import { useCart } from "./CartContext";

export default function Cart() {
  const { cart, removeFromCart } = useCart();

  const calculateGrandTotal = () =>
    cart
      .reduce((total, item) => total + parseFloat(item.totalPrice), 0)
      .toFixed(2);

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
              {item.ingredientsInfo.map((ingredient) => (
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
      </div>
    </section>
  );
}
