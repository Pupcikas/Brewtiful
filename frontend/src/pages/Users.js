// src/pages/Users.js
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import { Link, useLocation } from "react-router-dom";
import Modal from "../components/Modal";

function Users() {
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editedUser, setEditedUser] = useState({
    name: "",
    email: "",
    username: "",
    role: "",
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

        // Fetch users
        const { data: usersData } = await api.get("/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setModalMessage("Failed to fetch users.");
        setModalTitle("Error");
        setIsModalOpen(true);
      }
    };

    fetchData();
  }, []);

  // Handle deleting a user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Remove the deleted user from the state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

      setModalMessage("User deleted successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error deleting user:", error);
      setModalMessage(
        error.response?.data?.message ||
          "An unexpected error occurred while deleting the user."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  // Handle initiating edit
  const handleEditInitiate = (user) => {
    setEditingUser(user.id);
    setEditedUser({
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    });
  };

  // Handle updating a user
  const handleUpdateUser = async (id) => {
    const { name, email, username, role } = editedUser;

    // Validate user fields
    if (!name.trim() || !email.trim() || !username.trim() || !role.trim()) {
      setModalMessage("All fields are required.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }

    try {
      // Send PUT request to update user
      await api.put(
        `/users/${id}`,
        { name, email, username, role },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update user in state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, name, email, username, role } : user
        )
      );

      setModalMessage("User updated successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      setModalMessage(
        error.response?.data?.message ||
          "An unexpected error occurred while updating the user."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  // Handle changes to edited user fields
  const handleEditedUserChange = (field, value) => {
    setEditedUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-primary rounded shadow-md">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Username</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-100 transition-colors duration-300"
              >
                <td className="py-2 px-4 border-b text-gray-700">
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      value={editedUser.name}
                      onChange={(e) =>
                        handleEditedUserChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td className="py-2 px-4 border-b text-gray-700">
                  {editingUser === user.id ? (
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) =>
                        handleEditedUserChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="py-2 px-4 border-b text-gray-700">
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      value={editedUser.username}
                      onChange={(e) =>
                        handleEditedUserChange("username", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td className="py-2 px-4 border-b text-gray-700">
                  {editingUser === user.id ? (
                    <select
                      value={editedUser.role}
                      onChange={(e) =>
                        handleEditedUserChange("role", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td className="py-2 px-4 border-b text-gray-700">
                  {editingUser === user.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateUser(user.id)}
                        className="bg-green-500 hover:bg-green-700 text-black px-3 py-1 rounded transition-colors duration-300 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="bg-gray-500 hover:bg-gray-700 text-black px-3 py-1 rounded transition-colors duration-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditInitiate(user)}
                        className="bg-blue-500 hover:bg-blue-700 text-black px-3 py-1 rounded transition-colors duration-300 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 hover:bg-red-700 text-black px-3 py-1 rounded transition-colors duration-300"
                        aria-label={`Delete user ${user.username}`}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default Users;
