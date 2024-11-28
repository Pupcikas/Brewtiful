import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import { Link, useLocation } from "react-router-dom";

export default function Ingredients() {
  const [profile, setProfile] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
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

        // Fetch ingredients and initialize edited fields and success state
        const { data: ingredientsData } = await api.get("/Ingredient", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const ingredientsWithExtras = ingredientsData.map((ingredient) => ({
          ...ingredient,
          editedName: ingredient.name,
          editedDefaultQuantity: ingredient.defaultQuantity,
          editedExtraCost: ingredient.extraCost,
          success: false,
        }));
        setIngredients(ingredientsWithExtras);
      } catch (error) {
        console.error("Error fetching data:", error);
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
      alert("Please enter an ingredient name.");
      return;
    }
    if (
      !newIngredient.defaultQuantity ||
      isNaN(newIngredient.defaultQuantity) ||
      Number(newIngredient.defaultQuantity) <= 0
    ) {
      alert("Please enter a valid default quantity.");
      return;
    }
    if (
      newIngredient.extraCost === "" ||
      isNaN(newIngredient.extraCost) ||
      Number(newIngredient.extraCost) < 0
    ) {
      alert("Please enter a valid extra cost.");
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
      const ingredientsWithExtras = ingredientsData.map((ingredient) => ({
        ...ingredient,
        editedName: ingredient.name,
        editedDefaultQuantity: ingredient.defaultQuantity,
        editedExtraCost: ingredient.extraCost,
        success: false,
      }));
      setIngredients(ingredientsWithExtras);

      // Clear new ingredient fields
      setNewIngredient({
        name: "",
        defaultQuantity: "",
        extraCost: "",
      });

      alert("Ingredient created successfully.");
    } catch (error) {
      console.error("Error creating ingredient:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.response && error.response.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred while creating the ingredient.");
      }
    }
  };

  // Handle changes to existing ingredients
  const handleIngredientChange = (index, field, value) => {
    setIngredients((prevIngredients) => {
      const updatedIngredients = [...prevIngredients];
      updatedIngredients[index][field] = value;
      return updatedIngredients;
    });
  };

  // Handle updating an existing ingredient
  const handleUpdateIngredient = async (id, index) => {
    const ingredient = ingredients[index];

    // Validate ingredient fields
    if (!ingredient.editedName.trim()) {
      alert("Ingredient name cannot be empty.");
      return;
    }
    if (
      !ingredient.editedDefaultQuantity ||
      isNaN(ingredient.editedDefaultQuantity) ||
      Number(ingredient.editedDefaultQuantity) <= 0
    ) {
      alert("Please enter a valid default quantity.");
      return;
    }
    if (
      ingredient.editedExtraCost === "" ||
      isNaN(ingredient.editedExtraCost) ||
      Number(ingredient.editedExtraCost) < 0
    ) {
      alert("Please enter a valid extra cost.");
      return;
    }

    try {
      // Send PUT request to update ingredient
      await api.put(
        `/Ingredient/${id}`,
        {
          name: ingredient.editedName,
          defaultQuantity: Number(ingredient.editedDefaultQuantity),
          extraCost: Number(ingredient.editedExtraCost),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the ingredient in the state and set success to true
      setIngredients((prevIngredients) => {
        const updatedIngredients = [...prevIngredients];
        updatedIngredients[index].name = ingredient.editedName;
        updatedIngredients[index].defaultQuantity =
          ingredient.editedDefaultQuantity;
        updatedIngredients[index].extraCost = ingredient.editedExtraCost;
        updatedIngredients[index].success = true;
        return updatedIngredients;
      });

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setIngredients((prevIngredients) => {
          const updatedIngredients = [...prevIngredients];
          if (updatedIngredients[index]) {
            updatedIngredients[index].success = false;
          }
          return updatedIngredients;
        });
      }, 3000);
    } catch (error) {
      console.error("Error updating ingredient:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.response && error.response.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred while updating the ingredient.");
      }
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

      alert("Ingredient deleted successfully.");
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else if (error.response && error.response.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred while deleting the ingredient.");
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

      {/* Ingredient Creation Form */}
      <form className="mt-8 w-1/2 mx-auto" onSubmit={handleCreateIngredient}>
        <h2 className="text-center text-primary text-4xl mb-4">
          Create New Ingredient
        </h2>
        <div className="flex flex-col gap-2">
          <div>
            <label className="info">Ingredient Name</label>
            <input
              type="text"
              value={newIngredient.name}
              onChange={(e) =>
                handleNewIngredientChange("name", e.target.value)
              }
            />
          </div>
          <div>
            <label className="info">Default Quantity</label>
            <br />
            <input
              type="number"
              value={newIngredient.defaultQuantity}
              onChange={(e) =>
                handleNewIngredientChange("defaultQuantity", e.target.value)
              }
            />
          </div>
          <div>
            <label className="info">Extra Cost</label>
            <br />
            <input
              type="number"
              step="0.01"
              value={newIngredient.extraCost}
              onChange={(e) =>
                handleNewIngredientChange("extraCost", e.target.value)
              }
            />
          </div>
          <button className="px-6 py-2 mt-2" type="submit">
            Create Ingredient
          </button>
        </div>
      </form>

      {/* Existing Ingredients Grid */}
      <div className="mt-8">
        <h2 className="text-center text-primary text-4xl mb-4">
          Existing Ingredients:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ingredients.map((ingredient, index) => (
            <div
              key={ingredient.id}
              className="bg-white p-4 rounded shadow-md flex flex-col"
            >
              {/* Success Message */}
              {ingredient.success && (
                <span className="text-green-600 mb-2">
                  Updated successfully
                </span>
              )}
              <div className="flex flex-col gap-2 flex-grow">
                <div>
                  <label className="font-semibold">Ingredient Name</label>
                  <input
                    type="text"
                    value={ingredient.editedName}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "editedName",
                        e.target.value
                      )
                    }
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold">Default Quantity</label>
                  <input
                    type="number"
                    value={ingredient.editedDefaultQuantity}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "editedDefaultQuantity",
                        e.target.value
                      )
                    }
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold">Extra Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ingredient.editedExtraCost}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "editedExtraCost",
                        e.target.value
                      )
                    }
                    className="w-full mt-1 p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-white rounded hover:bg-gray-600"
                  onClick={() => handleUpdateIngredient(ingredient.id, index)}
                >
                  Update
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                  onClick={() => handleDeleteIngredient(ingredient.id)}
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
