import React, { useEffect, useState } from "react";
import api from "../axiosInstance";

function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
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
