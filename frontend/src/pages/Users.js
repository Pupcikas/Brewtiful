import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import { Link, useLocation } from "react-router-dom";

export default function Users() {
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
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
          alert("You are not authorized to view this page.");
          return;
        }

        // Fetch users
        const { data: usersData } = await api.get("/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response && error.response.status === 403) {
          alert("You are not authorized to view this page.");
        }
      }
    };

    fetchData();
  }, []);

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

      alert("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(`Error: ${error.response.data.message}`);
      } else if (error.response && error.response.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred while deleting the user.");
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

      <div className="mt-8">
        <h2 className="text-center text-primary text-4xl mb-4">Users List:</h2>
        <table className="min-w-full bg-white">
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
              <tr key={user.id}>
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.username}</td>
                <td className="py-2 px-4 border-b">{user.role}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
