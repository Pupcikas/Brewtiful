import React, { useEffect, useState, useMemo } from "react";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import { Link } from "react-router-dom";
import { useCart } from "./CartContext";
import Modal from "../components/Modal";

function Menu() {
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const { addToCart } = useCart();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    monitorToken();

    const fetchItems = async () => {
      try {
        const { data: categoriesData } = await api.get("/Category", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCategories(categoriesData);
        const categoryMap = Object.fromEntries(
          categories.map((cat) => [cat.id, cat.name])
        );

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

        // Fetch items
        const { data: itemsData } = await api.get("/Item", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        // Initialize dynamic quantities
        const itemsWithDynamicQuantities = itemsData.map((item) => ({
          ...item,
          ingredients: item.ingredients.map((ing) => ({
            ...ing,
            quantity: ing.defaultQuantity, // Start with default quantity
          })),
        }));

        setItems(itemsWithDynamicQuantities);
      } catch (error) {
        console.error("Error fetching items:", error);
        setModalMessage("Failed to fetch menu items.");
        setModalTitle("Error");
        setIsModalOpen(true);
      }
    };

    fetchItems();
  }, []);

  // Handle ingredient quantity change
  const handleIngredientQuantityChange = (
    itemId,
    ingredientId,
    newQuantity
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ingredients: item.ingredients.map((ing) =>
                ing.id === ingredientId
                  ? { ...ing, quantity: Math.max(newQuantity, 1) } // Minimum quantity is 1
                  : ing
              ),
            }
          : item
      )
    );
  };

  // Calculate updated price based on ingredient quantities
  const calculatePrice = (item) => {
    const basePrice = item.price;
    const extraCost = item.ingredients.reduce(
      (acc, ing) => acc + (ing.quantity - ing.defaultQuantity) * ing.extraCost,
      0
    );
    return basePrice + extraCost;
  };

  // Handle adding item to cart
  const handleAddToCart = async (item) => {
    try {
      const ingredientQuantities = item.ingredients.reduce(
        (acc, ing) => ({
          ...acc,
          [ing.id]: ing.quantity,
        }),
        {}
      );
      const totalPrice = calculatePrice(item);

      await addToCart(item, item.ingredients, ingredientQuantities, totalPrice);
      setModalMessage(`${item.name} added to cart.`);
      setModalTitle("Success");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setModalMessage(
        error.response?.data?.message ||
          "An unexpected error occurred while adding the item to the cart."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  if (!profile)
    return <div className="text-center mt-8 text-gray-700">Loading...</div>;

  // Map categoryId to category name
  const categoryMap = Object.fromEntries(
    categories.map((cat) => [cat.id, cat.name])
  );

  const groupedItems = items.reduce((acc, item) => {
    const categoryName = categoryMap[item.categoryId] || "Uncategorized";
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(item);
    return acc;
  }, {});

  return (
    <section className="mt-8 max-w-7xl mx-auto p-4">
      <h1 className="text-center text-black text-4xl mb-6">MENU</h1>
      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center text-gray-700">No items available.</div>
      ) : (
        Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded shadow-md flex flex-col transition-transform transform hover:scale-105 duration-300"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-700 mb-2">
                    <strong>Price:</strong> ${calculatePrice(item).toFixed(2)}
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mb-4">
                    {item.ingredients.map((ing) => (
                      <li key={ing.id}>
                        {ing.name} - Qty:{" "}
                        <button
                          onClick={() =>
                            handleIngredientQuantityChange(
                              item.id,
                              ing.id,
                              ing.quantity - 1
                            )
                          }
                          className="px-2 py-1 bg-gray-200 rounded"
                          disabled={ing.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="mx-2">{ing.quantity}</span>
                        <button
                          onClick={() =>
                            handleIngredientQuantityChange(
                              item.id,
                              ing.id,
                              ing.quantity + 1
                            )
                          }
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          +
                        </button>{" "}
                        (Extra Cost: ${ing.extraCost.toFixed(2)})
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="mt-auto bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded transition-colors duration-300"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
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

export default Menu;
