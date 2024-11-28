import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import { Link, useLocation } from "react-router-dom";

export default function Categories() {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]); // Add items state
  const [newCategory, setNewCategory] = useState({
    name: "",
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

        // Fetch categories and initialize edited fields and success state
        const { data: categoriesData } = await api.get("/Category", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const categoriesWithExtras = categoriesData.map((category) => ({
          ...category,
          editedName: category.name,
          success: false,
        }));
        setCategories(categoriesWithExtras);

        // Fetch items
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
      alert("Please enter a category name.");
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
      const categoriesWithExtras = categoriesData.map((category) => ({
        ...category,
        editedName: category.name,
        success: false,
      }));
      setCategories(categoriesWithExtras);

      // Clear new category fields
      setNewCategory({
        name: "",
      });

      alert("Category created successfully.");
    } catch (error) {
      console.error("Error creating category:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.response && error.response.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred while creating the category.");
      }
    }
  };

  // Handle changes to existing categories
  const handleCategoryChange = (index, field, value) => {
    setCategories((prevCategories) => {
      const updatedCategories = [...prevCategories];
      updatedCategories[index][field] = value;
      return updatedCategories;
    });
  };

  // Handle updating an existing category
  const handleUpdateCategory = async (id, index) => {
    const category = categories[index];

    // Validate category fields
    if (!category.editedName.trim()) {
      alert("Category name cannot be empty.");
      return;
    }

    try {
      // Send PUT request to update category
      await api.put(
        `/Category/${id}`,
        {
          name: category.editedName,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the category in the state and set success to true
      setCategories((prevCategories) => {
        const updatedCategories = [...prevCategories];
        updatedCategories[index].name = category.editedName;
        updatedCategories[index].success = true;
        return updatedCategories;
      });

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setCategories((prevCategories) => {
          const updatedCategories = [...prevCategories];
          if (updatedCategories[index]) {
            updatedCategories[index].success = false;
          }
          return updatedCategories;
        });
      }, 3000);
    } catch (error) {
      console.error("Error updating category:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.response && error.response.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred while updating the category.");
      }
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (id) => {
    // Fetch the number of items associated with this category
    const associatedItems = items.filter((item) => item.categoryId === id);
    const itemCount = associatedItems.length;

    // Construct the confirmation message
    const confirmationMessage =
      itemCount > 0
        ? `Deleting this category will also delete ${itemCount} associated item(s). Are you sure you want to proceed?`
        : "Are you sure you want to delete this category?";

    if (!window.confirm(confirmationMessage)) {
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

      // Remove associated items from the state
      setItems((prevItems) =>
        prevItems.filter((item) => item.categoryId !== id)
      );

      alert("Category and associated items deleted successfully.");
    } catch (error) {
      console.error("Error deleting category:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.response && error.response.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred while deleting the category.");
      }
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <section className="mt-8 max-w-7xl mx-auto">
      {profile.role === "Admin" && (
        <div className="flex mx-auto items-center justify-center gap-2 my-4 tabs">
          <Link
            className={location.pathname === "/profile" ? "active" : ""}
            to="/profile"
          >
            Profile
          </Link>
          <Link
            className={location.pathname === "/categories" ? "active" : ""}
            to="/categories"
          >
            Categories
          </Link>
          <Link
            className={location.pathname === "/items" ? "active" : ""}
            to="/items"
          >
            Items
          </Link>
          <Link
            className={location.pathname === "/ingredients" ? "active" : ""}
            to="/ingredients"
          >
            Ingredients
          </Link>
          <Link
            className={location.pathname === "/users" ? "active" : ""}
            to="/users"
          >
            Users
          </Link>
        </div>
      )}

      {/* Category Creation Form */}
      <form className="mt-8 w-1/2 mx-auto" onSubmit={handleCreateCategory}>
        <h2 className="text-center text-primary text-4xl mb-4">
          Create New Category
        </h2>
        <div className="flex flex-col gap-2">
          <div>
            <label className="info">Category Name</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => handleNewCategoryChange("name", e.target.value)}
            />
          </div>
          <button className="px-6 py-2 mt-2" type="submit">
            Create Category
          </button>
        </div>
      </form>

      {/* Existing Categories Grid */}
      <div className="mt-8">
        <h2 className="text-center text-primary text-4xl mb-4">
          Existing Categories:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="bg-white p-4 rounded shadow-md flex flex-col"
            >
              {/* Success Message */}
              {category.success && (
                <span className="text-green-600 mb-2">
                  Updated successfully
                </span>
              )}
              <div className="flex flex-col gap-2 flex-grow">
                <div>
                  <label className="font-semibold">Category Name</label>
                  <input
                    type="text"
                    value={category.editedName}
                    onChange={(e) =>
                      handleCategoryChange(index, "editedName", e.target.value)
                    }
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-white rounded hover:bg-gray-600"
                  onClick={() => handleUpdateCategory(category.id, index)}
                >
                  Update
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
