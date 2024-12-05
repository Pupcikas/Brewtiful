// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "../pages/monitorToken";
import { Link, useLocation } from "react-router-dom";
import Modal from "../components/Modal";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const location = useLocation();

  useEffect(() => {
    monitorToken();

    const fetchProfile = async () => {
      try {
        const { data: profileData } = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setModalMessage("Failed to fetch profile information.");
        setIsModalOpen(true);
      }
    };

    fetchProfile();
  }, []);

  if (!profile)
    return <div className="text-center mt-8 text-gray-700">Loading...</div>;

  return (
    <section className="mt-8 max-w-7xl mx-auto p-4">
      {profile.role === "Admin" && (
        <div className="flex mx-auto items-center justify-center gap-2 my-4 tabs">
          <Link
            className={`${
              location.pathname === "/profile" ? "active" : ""
            } px-4 py-2 bg-primary text-black rounded hover:bg-primary-dark transition-colors duration-300`}
            to="/profile"
          >
            Profile
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
      )}

      <h1 className="text-center text-black text-4xl mb-6">
        {profile.name}'s Profile
      </h1>
      <form className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-gray-700 font-semibold mb-2"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={profile.name}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-gray-700 font-semibold mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={profile.username}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-semibold mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={profile.email}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-700 font-semibold mb-2"
          >
            Role
          </label>
          <input
            type="text"
            id="role"
            value={profile.role}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
          />
        </div>
        {/* Future enhancements: Add edit functionality */}
      </form>

      {/* Feedback Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Profile Error"
      >
        <p>{modalMessage}</p>
      </Modal>
    </section>
  );
}

export default Profile;
