import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import { Link, useLocation } from "react-router-dom";

export default function Items() {
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

        // Fetch items and initialize edited fields and success state
        const { data: itemsData } = await api.get("/Item", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const itemsWithExtras = itemsData.map((item) => ({
          ...item,
          editedName: item.name,
          editedPrice: item.price,
          editedCategoryId: item.categoryId,
          editedIngredientIds: Array.isArray(item.ingredientIds)
            ? item.ingredientIds.map((id) => Number(id))
            : [],
          pictureUrl: item.pictureUrl || "",
          editedPicture: null,
          success: false,
        }));
        console.log("Initialized Items with Extras:", itemsWithExtras); // Debugging
        setItems(itemsWithExtras);

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
      alert("Please enter an item name.");
      return;
    }
    if (!newItem.price || isNaN(newItem.price) || Number(newItem.price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }
    if (!newItem.categoryId) {
      alert("Please select a category.");
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

      // Send POST request to create item
      await api.post("/Item", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // "Content-Type" is handled automatically by the browser
        },
      });

      // Fetch updated items list and initialize edited fields and success state
      const { data: itemsData } = await api.get("/Item", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const itemsWithExtras = itemsData.map((item) => ({
        ...item,
        editedName: item.name,
        editedPrice: item.price,
        editedCategoryId: item.categoryId,
        editedIngredientIds: Array.isArray(item.ingredientIds)
          ? item.ingredientIds.map((id) => Number(id))
          : [],
        pictureUrl: item.pictureUrl || "",
        editedPicture: null,
        success: false,
      }));
      console.log("Fetched Updated Items:", itemsWithExtras); // Debugging
      setItems(itemsWithExtras);

      // Clear new item fields
      setNewItem({
        name: "",
        price: "",
        categoryId: "",
        ingredientIds: [],
        picture: null,
      });

      alert("Item created successfully.");
    } catch (error) {
      console.error("Error creating item:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.response && error.response.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred while creating the item.");
      }
    }
  };

  // Handle changes to existing items
  const handleItemChange = (itemId, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  // Handle adding/removing ingredients for existing items
  const handleItemIngredientChange = (itemId, event) => {
    const ingredientId = Number(event.target.value);
    const isChecked = event.target.checked;

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          let updatedIngredientIds;
          if (isChecked) {
            // Add ingredient if not already present
            if (!item.editedIngredientIds.includes(ingredientId)) {
              updatedIngredientIds = [
                ...item.editedIngredientIds,
                ingredientId,
              ];
            } else {
              updatedIngredientIds = item.editedIngredientIds;
            }
          } else {
            // Remove ingredient if present
            updatedIngredientIds = item.editedIngredientIds.filter(
              (id) => id !== ingredientId
            );
          }

          console.log(
            `Updated ingredient IDs for item ${itemId}:`,
            updatedIngredientIds
          ); // Debugging

          return { ...item, editedIngredientIds: updatedIngredientIds };
        }
        return item;
      })
    );
  };

  // Handle updating an existing item
  const handleUpdateItem = async (id) => {
    const item = items.find((item) => item.id === id);

    if (!item) {
      alert("Item not found.");
      return;
    }

    // Validate item fields
    if (!item.editedName.trim()) {
      alert("Item name cannot be empty.");
      return;
    }
    if (
      !item.editedPrice ||
      isNaN(item.editedPrice) ||
      Number(item.editedPrice) <= 0
    ) {
      alert("Please enter a valid price.");
      return;
    }
    if (!item.editedCategoryId) {
      alert("Please select a category.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", item.editedName);
      formData.append("price", item.editedPrice);
      formData.append("categoryId", item.editedCategoryId);
      item.editedIngredientIds.forEach((id) =>
        formData.append("ingredientIds", id)
      );
      if (item.editedPicture) {
        formData.append("picture", item.editedPicture);
      }

      // Send PUT request to update item
      await api.put(`/Item/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // "Content-Type" is handled automatically by the browser
        },
      });

      // Update the item in the state and set success to true
      setItems((prevItems) =>
        prevItems.map((itm) =>
          itm.id === id
            ? {
                ...itm,
                name: itm.editedName,
                price: itm.editedPrice,
                categoryId: itm.editedCategoryId,
                ingredientIds: itm.editedIngredientIds,
                pictureUrl: itm.editedPicture
                  ? `${itm.pictureUrl}?timestamp=${new Date().getTime()}`
                  : itm.pictureUrl,
                editedPicture: null,
                success: true,
              }
            : itm
        )
      );

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setItems((prevItems) =>
          prevItems.map((itm) =>
            itm.id === id ? { ...itm, success: false } : itm
          )
        );
      }, 3000);
    } catch (error) {
      console.error("Error updating item:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.response && error.response.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred while updating the item.");
      }
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

      alert("Item deleted successfully.");
    } catch (error) {
      console.error("Error deleting item:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.response && error.response.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred while deleting the item.");
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

      {/* Item Creation Form */}
      <form
        className="mt-8 w-1/2 mx-auto new-item-form"
        onSubmit={handleCreateItem}
      >
        <h2 className="text-center text-primary text-4xl mb-4">
          Create New Item
        </h2>
        <div className="flex flex-col gap-2">
          <div>
            <label className="info">Item Name</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => handleNewItemChange("name", e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="info">Price</label>
            <br />
            <input
              type="number"
              step="0.01"
              value={newItem.price}
              onChange={(e) => handleNewItemChange("price", e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="info">Category</label>
            <br />
            <select
              value={newItem.categoryId}
              onChange={
                (e) => handleNewItemChange("categoryId", Number(e.target.value)) // Ensure it's a number
              }
              className="w-full mt-1 p-2 border rounded"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={Number(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="info">Ingredients</label>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <label
                  key={`ingredient-${ingredient.id}`}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    value={Number(ingredient.id)} // Ensure it's a number
                    checked={newItem.ingredientIds.includes(
                      Number(ingredient.id)
                    )}
                    onChange={() =>
                      handleNewItemIngredientChange(Number(ingredient.id))
                    }
                    className="mr-1"
                  />
                  {ingredient.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="info">Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleNewItemChange("picture", e.target.files[0])
              }
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <button
            className="px-6 py-2 mt-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            type="submit"
          >
            Create Item
          </button>
        </div>
      </form>

      {/* Existing Items Grid */}
      <div className="mt-8">
        <h2 className="text-center text-primary text-4xl mb-4">
          Existing Items:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded shadow-md flex flex-col"
            >
              {/* Success Message */}
              {item.success && (
                <span className="text-green-600 mb-2">
                  Updated successfully
                </span>
              )}
              <div className="flex flex-col gap-2 flex-grow">
                <div>
                  <label className="font-semibold">Item Name</label>
                  <input
                    type="text"
                    value={item.editedName}
                    onChange={(e) =>
                      handleItemChange(item.id, "editedName", e.target.value)
                    }
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.editedPrice}
                    onChange={(e) =>
                      handleItemChange(item.id, "editedPrice", e.target.value)
                    }
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold">Category</label>
                  <select
                    value={item.editedCategoryId}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "editedCategoryId",
                        Number(e.target.value) // Ensure it's a number
                      )
                    }
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option
                        key={`item-category-${category.id}`}
                        value={Number(category.id)}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold">Ingredients</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {ingredients.map((ingredient) => (
                      <label
                        key={`item-${item.id}-ingredient-${ingredient.id}`}
                        className="flex items-center"
                      >
                        <input
                          type="checkbox"
                          value={Number(ingredient.id)} // Ensure it's a number
                          checked={item.editedIngredientIds.includes(
                            Number(ingredient.id)
                          )}
                          onChange={(e) =>
                            handleItemIngredientChange(item.id, e)
                          }
                          className="mr-1"
                        />
                        {ingredient.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-semibold">Picture</label>
                  {item.pictureUrl && (
                    <img
                      src={item.pictureUrl}
                      alt={item.name}
                      className="w-full h-auto mt-2"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "editedPicture",
                        e.target.files[0]
                      )
                    }
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="button" // Prevent form submission
                  className="px-4 py-2 bg-gray-300 text-white rounded hover:bg-gray-600"
                  onClick={() => handleUpdateItem(item.id)}
                >
                  Update
                </button>
                <button
                  type="button" // Prevent form submission
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                  onClick={() => handleDeleteItem(item.id)}
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
