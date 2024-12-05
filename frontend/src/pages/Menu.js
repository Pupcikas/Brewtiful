import React, { useEffect, useState } from "react";
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
  const [categories, setCategories] = useState({});
  const [modalTitle, setModalTitle] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    monitorToken();

    const fetchItems = async () => {
      try {
        const { data: profileData } = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProfile(profileData);

        if (profileData.role === "Admin") {
          setModalMessage("Admins should use the Admin Orders page.");
          setModalTitle("Access Denied");
          setIsModalOpen(true);
          return;
        }

        // Fetch categories
        const { data: categoryData } = await api.get("/Category", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        // Convert categories into a mapping of id -> name
        const categoryMap = categoryData.reduce((map, category) => {
          map[category.id] = category.name;
          return map;
        }, {});
        setCategories(categoryMap);

        const { data: itemsData } = await api.get("/Item", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const itemsWithDynamicQuantities = itemsData.map((item) => ({
          ...item,
          ingredients: item.ingredients.map((ing) => ({
            ...ing,
            quantity: ing.defaultQuantity,
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
                  ? { ...ing, quantity: newQuantity }
                  : ing
              ),
            }
          : item
      )
    );
  };

  const calculatePrice = (item) => {
    const basePrice = item.price;
    const extraCost = item.ingredients.reduce(
      (acc, ing) => acc + (ing.quantity - ing.defaultQuantity) * ing.extraCost,
      0
    );
    return basePrice + extraCost;
  };

  const handleAddToCart = async (item) => {
    try {
      const ingredientQuantities = Object.fromEntries(
        item.ingredients.map((ing) => [ing.name, ing.quantity])
      );
      const totalPrice = calculatePrice(item);

      const payload = {
        ItemId: item.id,
        Quantity: 1,
        IngredientQuantities: ingredientQuantities,
      };

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

  const groupedItems = items.reduce((acc, item) => {
    const category = categories[item.categoryId] || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  if (!profile)
    return <div className="text-center mt-8 text-gray-700">Loading...</div>;

  return (
    <section className="mt-8 max-w-7xl mx-auto p-4">
      <h1 className="text-center text-black text-4xl mb-6">Our Menu</h1>
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
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg flex flex-col transition-transform transform hover:scale-105 duration-300 border border-gray-200"
                >
                  {item.pictureUrl && (
                    <img
                      src={item.pictureUrl}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded mb-4"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    <strong>Price:</strong> ${item.price.toFixed(2)}
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
                    {item.ingredients.map((ing) => (
                      <li key={ing.id}>
                        {ing.name} - Qty: {ing.quantity} (Extra Cost: $
                        {ing.extraCost.toFixed(2)})
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="mt-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
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
