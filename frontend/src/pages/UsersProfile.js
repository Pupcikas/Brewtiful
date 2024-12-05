// src/pages/UsersProfile.js
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";
import Modal from "../components/Modal";

function UsersProfile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    monitorToken();

    const fetchProfile = async () => {
      try {
        // Fetch user profile
        const { data: profileData } = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProfile(profileData);
        setEditedProfile({
          name: profileData.name,
          email: profileData.email,
          password: "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setModalMessage("Failed to fetch profile information.");
        setModalTitle("Error");
        setIsModalOpen(true);
      }
    };

    fetchProfile();
  }, []);

  // Handle changes to edited profile fields
  const handleEditedProfileChange = (field, value) => {
    setEditedProfile((prevProfile) => ({
      ...prevProfile,
      [field]: value,
    }));
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validate profile fields
    if (!editedProfile.name.trim() || !editedProfile.email.trim()) {
      setModalMessage("Name and Email are required.");
      setModalTitle("Validation Error");
      setIsModalOpen(true);
      return;
    }

    try {
      // Prepare payload
      const payload = {
        name: editedProfile.name,
        email: editedProfile.email,
      };
      if (editedProfile.password) {
        payload.password = editedProfile.password;
      }

      // Send PUT request to update profile
      const { data: updatedProfile } = await api.put("/auth/profile", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setProfile(updatedProfile);
      setModalMessage("Profile updated successfully.");
      setModalTitle("Success");
      setIsModalOpen(true);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setModalMessage(
        error.response?.data?.message ||
          "An unexpected error occurred while updating your profile."
      );
      setModalTitle("Error");
      setIsModalOpen(true);
    }
  };

  if (!profile)
    return <div className="text-center mt-8 text-gray-700">Loading...</div>;

  return (
    <section className="mt-8 max-w-md mx-auto p-4">
      <h1 className="text-center text-primary text-3xl mb-6">My Profile</h1>
      <form
        className="bg-white p-6 rounded shadow-md"
        onSubmit={handleUpdateProfile}
      >
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-gray-700 font-medium mb-2"
          >
            Name
          </label>
          {editMode ? (
            <input
              type="text"
              id="name"
              value={editedProfile.name}
              onChange={(e) =>
                handleEditedProfileChange("name", e.target.value)
              }
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <p className="text-gray-700">{profile.name}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-2"
          >
            Email
          </label>
          {editMode ? (
            <input
              type="email"
              id="email"
              value={editedProfile.email}
              onChange={(e) =>
                handleEditedProfileChange("email", e.target.value)
              }
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <p className="text-gray-700">{profile.email}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-2"
          >
            Password
          </label>
          {editMode ? (
            <input
              type="password"
              id="password"
              value={editedProfile.password}
              onChange={(e) =>
                handleEditedProfileChange("password", e.target.value)
              }
              placeholder="Enter new password (leave blank to keep current)"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <p className="text-gray-700">••••••••</p>
          )}
        </div>
        {editMode ? (
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-gray-500 hover:bg-gray-700 text-black px-4 py-2 rounded transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-secondary hover:bg-secondary-dark text-black px-4 py-2 rounded transition-colors duration-300"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="bg-primary hover:bg-primary-dark text-black px-4 py-2 rounded transition-colors duration-300"
            >
              Edit Profile
            </button>
          </div>
        )}
      </form>

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

export default UsersProfile;
