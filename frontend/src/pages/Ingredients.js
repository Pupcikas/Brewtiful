// src/pages/Ingredients.js
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "../pages/monitorToken";
import { Link, useLocation } from "react-router-dom";
import Modal from "../components/Modal";

function Ingredients() {
  const [profile, setProfile] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    defaultQuantity: "",
    extraCost: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [editedIngredient, setEditedIngredient] = useState({
    name: "",
    defaultQuantity: "",
    extraCost: "",
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

        // Fetch ingredients
        const { data: ingredientsData } = await api.get("/Ingredient", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setIngredients(ingredientsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setModalMessage("Failed to fetch ingredients.");
        setModalTitle("Error");
        setIsModalOpen(true);
      }
    };

    fetchData();
  }, []);

  // Handle changes to new ingredient fields
  const handleNewIngredientChange = (field, value) => {
    setNewIngredient((prevIngredient) => ({
      ...prevIngredient,
      [field]: value,
    }));
  };

  // Handle creating a new ingredient
  const handleCreateIngredient = async (e) => {
    e.preventDefault();

    // Validate new ingredient fields
    if (!newIngredient.name.trim()) {
      setModalMessage("Please enter an ingredient name.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }
    if (
      !newIngredient.defaultQuantity ||
      isNaN(newIngredient.defaultQuantity) ||
      Number(newIngredient.defaultQuantity) <= 0
    ) {
      setModalMessage("Please enter a valid default quantity.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }
    if (
      newIngredient.extraCost === "" ||
      isNaN(newIngredient.extraCost) ||
      Number(newIngredient.extraCost) < 0
    ) {
      setModalMessage("Please enter a valid extra cost.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }

    try {
      // Send POST request to create ingredient
      await api.post(
        "/Ingredient",
        {
          name: newIngredient.name,
          defaultQuantity: Number(newIngredient.defaultQuantity),
          extraCost: Number(newIngredient.extraCost),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Fetch updated ingredients list
      const { data: ingredientsData } = await api.get("/Ingredient", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setIngredients(ingredientsData);

      // Clear new ingredient fields
      setNewIngredient({
        name: "",
        defaultQuantity: "",
        extraCost: "",
      });

      setModalMessage("Ingredient created successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error creating ingredient:", error);
      setModalMessage(
        error.response?.data?.detail ||
          "An unexpected error occurred while creating the ingredient."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  // Handle initiating edit
  const handleEditInitiate = (ingredient) => {
    setEditingIngredient(ingredient.id);
    setEditedIngredient({
      name: ingredient.name,
      defaultQuantity: ingredient.defaultQuantity,
      extraCost: ingredient.extraCost,
    });
  };

  // Handle updating an existing ingredient
  const handleUpdateIngredient = async (id) => {
    const { name, defaultQuantity, extraCost } = editedIngredient;

    // Validate ingredient fields
    if (!name.trim()) {
      setModalMessage("Ingredient name cannot be empty.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }
    if (
      !defaultQuantity ||
      isNaN(defaultQuantity) ||
      Number(defaultQuantity) <= 0
    ) {
      setModalMessage("Please enter a valid default quantity.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }
    if (extraCost === "" || isNaN(extraCost) || Number(extraCost) < 0) {
      setModalMessage("Please enter a valid extra cost.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }

    try {
      // Send PUT request to update ingredient
      await api.put(
        `/Ingredient/${id}`,
        {
          name,
          defaultQuantity: Number(defaultQuantity),
          extraCost: Number(extraCost),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the ingredient in the state
      setIngredients((prevIngredients) =>
        prevIngredients.map((ingredient) =>
          ingredient.id === id
            ? {
                ...ingredient,
                name,
                defaultQuantity: Number(defaultQuantity),
                extraCost: Number(extraCost),
              }
            : ingredient
        )
      );

      setModalMessage("Ingredient updated successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
      setEditingIngredient(null);
    } catch (error) {
      console.error("Error updating ingredient:", error);
      setModalMessage(
        error.response?.data?.detail ||
          "An unexpected error occurred while updating the ingredient."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  // Handle deleting an ingredient
  const handleDeleteIngredient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ingredient?")) {
      return;
    }

    try {
      await api.delete(`/Ingredient/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Remove the deleted ingredient from the state
      setIngredients((prevIngredients) =>
        prevIngredients.filter((ingredient) => ingredient.id !== id)
      );

      setModalMessage("Ingredient deleted successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      setModalMessage(
        error.response?.data?.detail ||
          "An unexpected error occurred while deleting the ingredient."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  if (!profile)
    return <div className="text-center mt-8 text-gray-700">Loading...</div>;

  return (
    <section className="mt-8 max-w-7xl mx-auto p-4">
      {/* Tabs for Admin Navigation */}
      <div className="flex mx-auto items-center justify-center gap-2 my-4">
        <Link
          className={`${
            location.pathname === "/profile" ? "active" : ""
          } px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-300`}
          to="/profile"
        >
          Profile
        </Link>
        <Link
          className={`${
            location.pathname === "/categories" ? "active" : ""
          } px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-300`}
          to="/categories"
        >
          Categories
        </Link>
        <Link
          className={`${
            location.pathname === "/items" ? "active" : ""
          } px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-300`}
          to="/items"
        >
          Items
        </Link>
        <Link
          className={`${
            location.pathname === "/ingredients" ? "active" : ""
          } px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-300`}
          to="/ingredients"
        >
          Ingredients
        </Link>
        <Link
          className={`${
            location.pathname === "/users" ? "active" : ""
          } px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-300`}
          to="/users"
        >
          Users
        </Link>
        <Link
          className={`${
            location.pathname === "/admin/orders" ? "active" : ""
          } px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-300`}
          to="/admin/orders"
        >
          Orders
        </Link>
      </div>

      {/* Ingredient Creation Form */}
      <form
        className="mt-8 w-full md:w-2/3 lg:w-1/2 mx-auto bg-white p-6 rounded shadow-md"
        onSubmit={handleCreateIngredient}
      >
        <h2 className="text-center text-primary text-2xl font-semibold mb-4">
          Create New Ingredient
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="ingredient-name"
              className="block text-gray-700 font-medium mb-2"
            >
              Ingredient Name
            </label>
            <input
              type="text"
              id="ingredient-name"
              value={newIngredient.name}
              onChange={(e) =>
                handleNewIngredientChange("name", e.target.value)
              }
              placeholder="Enter ingredient name"
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="default-quantity"
              className="block text-gray-700 font-medium mb-2"
            >
              Default Quantity
            </label>
            <input
              type="number"
              id="default-quantity"
              value={newIngredient.defaultQuantity}
              onChange={(e) =>
                handleNewIngredientChange("defaultQuantity", e.target.value)
              }
              placeholder="Enter default quantity"
              required
              min="1"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label
              htmlFor="extra-cost"
              className="block text-gray-700 font-medium mb-2"
            >
              Extra Cost ($)
            </label>
            <input
              type="number"
              id="extra-cost"
              value={newIngredient.extraCost}
              onChange={(e) =>
                handleNewIngredientChange("extraCost", e.target.value)
              }
              placeholder="Enter extra cost"
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded transition-colors duration-300"
          >
            Create Ingredient
          </button>
        </div>
      </form>

      {/* Existing Ingredients List */}
      <div className="mt-8">
        <h2 className="text-center text-primary text-2xl font-semibold mb-4">
          Existing Ingredients
        </h2>
        {ingredients.length === 0 ? (
          <p className="text-center text-gray-700">No ingredients available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="bg-white p-6 rounded shadow-md flex flex-col transition-transform transform hover:scale-105 duration-300"
              >
                {/* Ingredient Details */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {editingIngredient === ingredient.id ? (
                    <input
                      type="text"
                      value={editedIngredient.name}
                      onChange={(e) =>
                        setEditedIngredient((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    ingredient.name
                  )}
                </h3>
                <p className="text-gray-700">
                  <strong>Default Quantity:</strong>{" "}
                  {editingIngredient === ingredient.id ? (
                    <input
                      type="number"
                      value={editedIngredient.defaultQuantity}
                      onChange={(e) =>
                        setEditedIngredient((prev) => ({
                          ...prev,
                          defaultQuantity: e.target.value,
                        }))
                      }
                      className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                    />
                  ) : (
                    ingredient.defaultQuantity
                  )}
                </p>
                <p className="text-gray-700">
                  <strong>Extra Cost:</strong>{" "}
                  {editingIngredient === ingredient.id ? (
                    <input
                      type="number"
                      value={editedIngredient.extraCost}
                      onChange={(e) =>
                        setEditedIngredient((prev) => ({
                          ...prev,
                          extraCost: e.target.value,
                        }))
                      }
                      className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    `$${ingredient.extraCost.toFixed(2)}`
                  )}
                </p>

                {/* Action Buttons */}
                <div className="mt-auto flex justify-end space-x-2">
                  {editingIngredient === ingredient.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateIngredient(ingredient.id)}
                        className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingIngredient(null)}
                        className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors duration-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditInitiate(ingredient)}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteIngredient(ingredient.id)}
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

export default Ingredients;
