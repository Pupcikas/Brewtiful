import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
} from "react-router-dom";
import api from "../axiosInstance";
import monitorToken from "./monitorToken";

function Profile() {
  const [profile, setProfile] = useState(null);
  const location = useLocation();

  useEffect(() => {
    monitorToken();
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <section className="mt-8">
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
          <Link
            className={location.pathname === "/orders" ? "active" : ""}
            to="/orders"
          >
            Orders
          </Link>
        </div>
      )}
      <h1 className="text-center text-primary text-4xl mb-4">
        {profile.name}'s Profile
      </h1>
      <form className="max-w-md mx-auto">
        <div className="flex gap-4 items-center">
          <div className="grow">
            <label>Name</label>
            <input type="text" value={profile.name} placeholder="Name" />
            <label>Username</label>
            <input
              type="text"
              value={profile.username}
              placeholder="Username"
            />
            <label>Email</label>
            <input type="email" value={profile.email} placeholder="Email" />
            <label>Role</label>
            <input type="text" value={profile.role} placeholder="Role" />
          </div>
        </div>
      </form>
    </section>
  );
}

export default Profile;
