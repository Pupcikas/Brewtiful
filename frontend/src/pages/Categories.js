// src/pages/Categories.js
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "../pages/monitorToken";
import { Link, useLocation } from "react-router-dom";
import Modal from "../components/Modal";

function Categories() {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedName, setEditedName] = useState("");
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

        // Fetch categories
        const { data: categoriesData } = await api.get("/Category", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setModalMessage("Failed to fetch categories.");
        setModalTitle("Error");
        setIsModalOpen(true);
      }
    };

    fetchData();
  }, []);

  // Handle changes to new category fields
  const handleNewCategoryChange = (field, value) => {
    setNewCategory((prevCategory) => ({
      ...prevCategory,
      [field]: value,
    }));
  };

  // Handle creating a new category
  const handleCreateCategory = async (e) => {
    e.preventDefault();

    // Validate new category fields
    if (!newCategory.name.trim()) {
      setModalMessage("Please enter a category name.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }

    try {
      // Send POST request to create category
      await api.post(
        "/Category",
        {
          name: newCategory.name,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Fetch updated categories list
      const { data: categoriesData } = await api.get("/Category", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCategories(categoriesData);

      // Clear new category fields
      setNewCategory({
        name: "",
      });

      setModalMessage("Category created successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error creating category:", error);
      setModalMessage(
        error.response?.data?.detail ||
          "An unexpected error occurred while creating the category."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  // Handle initiating edit
  const handleEditInitiate = (category) => {
    setEditingCategory(category.id);
    setEditedName(category.name);
  };

  // Handle updating an existing category
  const handleUpdateCategory = async (id) => {
    if (!editedName.trim()) {
      setModalMessage("Category name cannot be empty.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }

    try {
      // Send PUT request to update category
      await api.put(
        `/Category/${id}`,
        {
          name: editedName,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the category in the state
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === id ? { ...category, name: editedName } : category
        )
      );

      setModalMessage("Category updated successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
      setModalMessage(
        error.response?.data?.detail ||
          "An unexpected error occurred while updating the category."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await api.delete(`/Category/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Remove the deleted category from the state
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== id)
      );

      setModalMessage("Category deleted successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error deleting category:", error);
      setModalMessage(
        error.response?.data?.detail ||
          "An unexpected error occurred while deleting the category."
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

      {/* Category Creation Form */}
      <form
        className="mt-8 w-full md:w-1/2 mx-auto bg-white p-6 rounded shadow-md"
        onSubmit={handleCreateCategory}
      >
        <h2 className="text-center text-black text-2xl font-semibold mb-4">
          Create New Category
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="category-name"
              className="block text-gray-700 font-medium mb-2"
            >
              Category Name
            </label>
            <input
              type="text"
              id="category-name"
              value={newCategory.name}
              onChange={(e) => handleNewCategoryChange("name", e.target.value)}
              placeholder="Enter category name"
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded transition-colors duration-300"
          >
            Create Category
          </button>
        </div>
      </form>

      {/* Existing Categories List */}
      <div className="mt-8">
        <h2 className="text-center text-black text-2xl font-semibold mb-4">
          Existing Categories
        </h2>
        {categories.length === 0 ? (
          <p className="text-center text-gray-700">No categories available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white p-6 rounded shadow-md flex flex-col transition-transform transform hover:scale-105 duration-300"
              >
                {/* Category Name */}
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {editingCategory === category.id ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    category.name
                  )}
                </h3>

                {/* Action Buttons */}
                <div className="mt-auto flex justify-end space-x-2">
                  {editingCategory === category.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateCategory(category.id)}
                        className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors duration-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditInitiate(category)}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
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

export default Categories;
