// src/pages/Items.js
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "../pages/monitorToken";
import { Link, useLocation } from "react-router-dom";
import Modal from "../components/Modal";

function Items() {
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    categoryId: "",
    ingredientIds: [],
    picture: null, // For picture upload
  });
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [fileLabel, setFileLabel] = useState("Choose File");
  const [editedItem, setEditedItem] = useState({
    name: "",
    price: "",
    categoryId: "",
    ingredientIds: [],
    picture: null,
  });
  const location = useLocation();

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
        if (profileData.role !== "Admin") {
          setModalMessage("You are not authorized to view this page.");
          setModalTitle("Authorization Error");
          setIsModalOpen(true);
          return;
        }

        // Fetch items
        const { data: itemsData } = await api.get("/Item", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setItems(itemsData);

        // Fetch categories
        const { data: categoriesData } = await api.get("/Category", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCategories(categoriesData);

        // Fetch ingredients
        const { data: ingredientsData } = await api.get("/Ingredient", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setIngredients(ingredientsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setModalMessage("Failed to fetch items, categories, or ingredients.");
        setModalTitle("Error");
        setIsModalOpen(true);
      }
    };

    fetchData();
  }, []);

  // Handle changes to new item fields
  const handleNewItemChange = (field, value) => {
    setNewItem((prevItem) => ({
      ...prevItem,
      [field]: value,
    }));
  };

  // Handle adding/removing ingredients for new item
  const handleNewItemIngredientChange = (ingredientId) => {
    setNewItem((prevItem) => {
      const ingredientIds = prevItem.ingredientIds.includes(ingredientId)
        ? prevItem.ingredientIds.filter((id) => id !== ingredientId)
        : [...prevItem.ingredientIds, ingredientId];
      return { ...prevItem, ingredientIds };
    });
  };

  // Handle creating a new item
  const handleCreateItem = async (e) => {
    e.preventDefault();

    // Validate new item fields
    if (!newItem.name.trim()) {
      setModalMessage("Please enter an item name.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }
    if (!newItem.price || isNaN(newItem.price) || Number(newItem.price) <= 0) {
      setModalMessage("Please enter a valid price.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }
    if (!newItem.categoryId) {
      setModalMessage("Please select a category.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("price", newItem.price);
      formData.append("categoryId", newItem.categoryId);
      newItem.ingredientIds.forEach((id) =>
        formData.append("ingredientIds", id)
      );
      if (newItem.picture) {
        formData.append("picture", newItem.picture);
      }
      // Handle file input change
      const handleNewItemChange = (field, value) => {
        if (field === "picture") {
          setFileLabel(value ? value.name : "No File Chosen"); // Update the file label
        }
        setNewItem((prevItem) => ({
          ...prevItem,
          [field]: value,
        }));
      };
      // Send POST request to create item
      await api.post("/Item", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // "Content-Type" is handled automatically by the browser
        },
      });

      // Fetch updated items list
      const { data: itemsData } = await api.get("/Item", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setItems(itemsData);

      // Clear new item fields
      setNewItem({
        name: "",
        price: "",
        categoryId: "",
        ingredientIds: [],
        picture: null,
      });

      setModalMessage("Item created successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error creating item:", error);
      setModalMessage(
        error.response?.data?.detail ||
          "An unexpected error occurred while creating the item."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  // Handle initiating edit
  const handleEditInitiate = (item) => {
    setEditingItem(item.id);
    setEditedItem({
      name: item.name,
      price: item.price,
      categoryId: item.categoryId,
      ingredientIds: item.ingredientIds || [],
      picture: null,
    });
  };

  // Handle updating an existing item
  const handleUpdateItem = async (id) => {
    const { name, price, categoryId, ingredientIds, picture } = editedItem;

    // Validate item fields
    if (!name.trim()) {
      setModalMessage("Item name cannot be empty.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      setModalMessage("Please enter a valid price.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }
    if (!categoryId) {
      setModalMessage("Please select a category.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("categoryId", categoryId);
      ingredientIds.forEach((id) => formData.append("ingredientIds", id));
      if (picture) {
        formData.append("picture", picture);
      }

      // Send PUT request to update item
      await api.put(`/Item/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // "Content-Type" is handled automatically by the browser
        },
      });

      // Fetch updated items list
      const { data: itemsData } = await api.get("/Item", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setItems(itemsData);

      setModalMessage("Item updated successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating item:", error);
      setModalMessage(
        error.response?.data?.detail ||
          "An unexpected error occurred while updating the item."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      await api.delete(`/Item/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Remove the deleted item from the state
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));

      setModalMessage("Item deleted successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error deleting item:", error);
      setModalMessage(
        error.response?.data?.detail ||
          "An unexpected error occurred while deleting the item."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  // Handle changes to editing item fields
  const handleEditedItemChange = (field, value) => {
    setEditedItem((prevItem) => ({
      ...prevItem,
      [field]: value,
    }));
  };

  // Handle adding/removing ingredients for editing item
  const handleEditedItemIngredientChange = (ingredientId) => {
    setEditedItem((prevItem) => {
      const ingredientIds = prevItem.ingredientIds.includes(ingredientId)
        ? prevItem.ingredientIds.filter((id) => id !== ingredientId)
        : [...prevItem.ingredientIds, ingredientId];
      return { ...prevItem, ingredientIds };
    });
  };

  return (
    <section className="mt-8 max-w-7xl mx-auto p-4">
      {/* Tabs for Admin Navigation */}
      <div className="flex mx-auto items-center justify-center gap-2 my-4">
        <Link
          className={`${
            location.pathname === "/profile" ? "active" : ""
          } px-4 py-2 bg-primary text-black rounded hover:bg-primary-dark transition-colors duration-300`}
          to="/profile"
        >
          Account
        </Link>
        <Link
          className={`${
            location.pathname === "/categories" ? "active" : ""
          } px-4 py-2 bg-primary text-black rounded hover:bg-primary-dark transition-colors duration-300`}
          to="/categories"
        >
          Categories
        </Link>
        <Link
          className={`${
            location.pathname === "/items" ? "active" : ""
          } px-4 py-2 bg-primary text-black rounded hover:bg-primary-dark transition-colors duration-300`}
          to="/items"
        >
          Items
        </Link>
        <Link
          className={`${
            location.pathname === "/ingredients" ? "active" : ""
          } px-4 py-2 bg-primary text-black rounded hover:bg-primary-dark transition-colors duration-300`}
          to="/ingredients"
        >
          Ingredients
        </Link>
        <Link
          className={`${
            location.pathname === "/users" ? "active" : ""
          } px-4 py-2 bg-primary text-black rounded hover:bg-primary-dark transition-colors duration-300`}
          to="/users"
        >
          Users
        </Link>
        <Link
          className={`${
            location.pathname === "/admin/orders" ? "active" : ""
          } px-4 py-2 bg-primary text-black rounded hover:bg-primary-dark transition-colors duration-300`}
          to="/admin/orders"
        >
          Orders
        </Link>
      </div>

      {/* Item Creation Form */}
      <form
        className="mt-8 w-full md:w-2/3 lg:w-1/2 mx-auto bg-white p-6 rounded shadow-md"
        onSubmit={handleCreateItem}
      >
        <h2 className="text-center text-black text-2xl font-semibold mb-4">
          Create New Item
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="item-name"
              className="block text-gray-700 font-medium mb-2"
            >
              Item Name
            </label>
            <input
              type="text"
              id="item-name"
              value={newItem.name}
              onChange={(e) => handleNewItemChange("name", e.target.value)}
              placeholder="Enter item name"
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="item-price"
              className="block text-gray-700 font-medium mb-2"
            >
              Price ($)
            </label>
            <input
              type="number"
              id="item-price"
              value={newItem.price}
              onChange={(e) => handleNewItemChange("price", e.target.value)}
              placeholder="Enter price"
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="item-category"
              className="block text-gray-700 font-medium mb-2"
            >
              Category
            </label>
            <select
              id="item-category"
              value={newItem.categoryId}
              onChange={(e) =>
                handleNewItemChange("categoryId", Number(e.target.value))
              }
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option
                  key={`category-${category.id}`}
                  value={Number(category.id)}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Ingredients
            </label>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <label
                  key={`ingredient-${ingredient.id}`}
                  className="flex items-center space-x-1 text-gray-700"
                >
                  <input
                    type="checkbox"
                    value={Number(ingredient.id)}
                    checked={newItem.ingredientIds.includes(
                      Number(ingredient.id)
                    )}
                    onChange={() =>
                      handleNewItemIngredientChange(Number(ingredient.id))
                    }
                    className="form-checkbox h-5 w-5 text-primary"
                  />
                  <span>{ingredient.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="item-picture"
              className="block text-gray-700 font-medium mb-2"
            >
              Picture{" "}
              <span className="mr-4 font-bold text-black underline hover:cursor-pointer">
                {fileLabel}
              </span>
            </label>
            <input
              type="file"
              id="item-picture"
              accept="image/*"
              onChange={(e) =>
                handleNewItemChange("picture", e.target.files[0])
              }
              className="hidden"
            />
          </div>
          <button
            type="submit"
            className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded transition-colors duration-300"
          >
            Create Item
          </button>
        </div>
      </form>

      {/* Existing Items List */}
      <div className="mt-8">
        <h2 className="text-center text-black text-2xl font-semibold mb-4">
          Existing Items
        </h2>
        {items.length === 0 ? (
          <p className="text-center text-gray-700">No items available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded shadow-md flex flex-col transition-transform transform hover:scale-105 duration-300"
              >
                {/* Item Image */}
                {item.pictureUrl && (
                  <img
                    src={item.pictureUrl}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded mb-4"
                  />
                )}

                {/* Item Details */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {editingItem === item.id ? (
                    <input
                      type="text"
                      value={editedItem.name}
                      onChange={(e) =>
                        setEditedItem((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    item.name
                  )}
                </h3>
                <p className="text-gray-700">
                  <strong>Price:</strong>{" "}
                  {editingItem === item.id ? (
                    <input
                      type="number"
                      value={editedItem.price}
                      onChange={(e) =>
                        setEditedItem((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0.01"
                      step="0.01"
                    />
                  ) : (
                    `$${item.price.toFixed(2)}`
                  )}
                </p>
                <p className="text-gray-700">
                  <strong>Category:</strong>{" "}
                  {editingItem === item.id ? (
                    <select
                      value={editedItem.categoryId}
                      onChange={(e) =>
                        setEditedItem((prev) => ({
                          ...prev,
                          categoryId: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option
                          key={`edit-category-${category.id}`}
                          value={Number(category.id)}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    categories.find((cat) => cat.id === item.categoryId)
                      ?.name || "N/A"
                  )}
                </p>
                <p className="text-gray-700">
                  <strong>Ingredients:</strong>{" "}
                  {editingItem === item.id ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {ingredients.map((ingredient) => (
                        <label
                          key={`edit-item-${item.id}-ingredient-${ingredient.id}`}
                          className="flex items-center space-x-1 text-gray-700"
                        >
                          <input
                            type="checkbox"
                            value={Number(ingredient.id)}
                            checked={editedItem.ingredientIds.includes(
                              Number(ingredient.id)
                            )}
                            onChange={() =>
                              setEditedItem((prev) => {
                                const ingredientIds =
                                  prev.ingredientIds.includes(
                                    Number(ingredient.id)
                                  )
                                    ? prev.ingredientIds.filter(
                                        (id) => id !== Number(ingredient.id)
                                      )
                                    : [
                                        ...prev.ingredientIds,
                                        Number(ingredient.id),
                                      ];
                                return { ...prev, ingredientIds };
                              })
                            }
                            className="form-checkbox h-5 w-5 text-primary"
                          />
                          <span>{ingredient.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    item.ingredients.map((ing) => ing.name).join(", ") || "N/A"
                  )}
                </p>

                {/* Action Buttons */}
                <div className="mt-auto flex justify-end space-x-2">
                  {editingItem === item.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateItem(item.id)}
                        className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors duration-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditInitiate(item)}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors duration-300"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

export default Items;
