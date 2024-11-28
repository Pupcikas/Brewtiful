import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import { useCart } from "./CartContext";

export default function Menu() {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [ingredientsInfo, setIngredientsInfo] = useState([]);
  const [ingredientQuantities, setIngredientQuantities] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    monitorToken();

    const fetchData = async () => {
      try {
        const { data: profileData } = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProfile(profileData);

        const { data: categoriesData } = await api.get("/Category", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCategories(categoriesData);

        const { data: itemsData } = await api.get("/Item", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setItems(itemsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = async (item) => {
    setSelectedItem(item);
    try {
      const ingredientPromises = item.ingredientIds.map((id) =>
        api.get(`/Ingredient/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      );
      const ingredientResponses = await Promise.all(ingredientPromises);
      const ingredientData = ingredientResponses.map((res) => res.data);
      setIngredientsInfo(ingredientData);

      const initialQuantities = {};
      ingredientData.forEach(
        (ingredient) =>
          (initialQuantities[ingredient.id] = ingredient.defaultQuantity)
      );
      setIngredientQuantities(initialQuantities);
    } catch (error) {
      console.error("Error fetching ingredients info:", error);
    }
  };

  const handleQuantityChange = (ingredientId, delta) => {
    setIngredientQuantities((prevQuantities) => {
      const updatedQuantities = { ...prevQuantities };
      updatedQuantities[ingredientId] = Math.max(
        0,
        (updatedQuantities[ingredientId] || 0) + delta
      );
      return updatedQuantities;
    });
  };

  const calculateTotalPrice = () => {
    if (!selectedItem) return 0;

    let totalPrice = selectedItem.price;
    ingredientsInfo.forEach((ingredient) => {
      const quantity = ingredientQuantities[ingredient.id] || 0;
      const extraQuantity = Math.max(0, quantity - ingredient.defaultQuantity);
      totalPrice += extraQuantity * ingredient.extraCost;
    });
    return totalPrice.toFixed(2);
  };

  const handleAddToOrder = () => {
    addToCart(
      selectedItem,
      ingredientsInfo,
      ingredientQuantities,
      calculateTotalPrice()
    );
    alert(`Item ${selectedItem.name} added to your cart!`);
    closeModal();
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIngredientsInfo([]);
    setIngredientQuantities({});
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <section className="menu-section mt-8 max-w-7xl mx-auto">
      <h1 className="text-center text-primary text-4xl mb-6">Menu</h1>
      {categories.map((category) => (
        <div key={category.id} className="category-section mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {category.name}
          </h2>
          <div className="items-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items
              .filter((item) => item.categoryId === category.id)
              .map((item) => (
                <div
                  key={item.id}
                  className="item-card bg-white p-4 rounded shadow-md"
                >
                  {item.pictureUrl && (
                    <img
                      src={item.pictureUrl}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {item.name}
                  </h3>
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 flex justify-center items-center mt-2"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart - ${item.price}
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-1/3 p-6 rounded shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {selectedItem.name}
            </h2>
            {selectedItem.pictureUrl && (
              <img
                src={selectedItem.pictureUrl}
                alt={selectedItem.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            <p className="text-gray-600 mb-4">
              Updated Price: ${calculateTotalPrice()}
            </p>
            <p className="text-gray-500 mb-4">Ingredients:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              {ingredientsInfo.map((ingredient) => (
                <li
                  key={ingredient.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <strong>{ingredient.name}</strong> - ($
                    {ingredient.extraCost} per extra)
                  </div>
                  <div className="flex items-center">
                    <button
                      className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={() => handleQuantityChange(ingredient.id, -1)}
                    >
                      -
                    </button>
                    <span className="px-4">
                      {ingredientQuantities[ingredient.id] ||
                        ingredient.defaultQuantity}
                    </span>
                    <button
                      className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={() => handleQuantityChange(ingredient.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
                onClick={handleAddToOrder}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
