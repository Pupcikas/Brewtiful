// src/pages/Register.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Modal from "../components/Modal";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://woven-ceremony-440709-s5.lm.r.appspot.com/api/auth/register",
        { email, password, username, name }
      );
      setMessage("Registration successful. Please log in.");
      setIsModalOpen(true);
      // Optionally, redirect to login after a delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response) {
        setMessage(
          "Registration failed: " +
            (error.response.data.message || "Unexpected error occurred.")
        );
      } else if (error.request) {
        setMessage(
          "No response from server. Check your internet connection and try again."
        );
      } else {
        setMessage(
          "Error in setting up registration request. Please try again."
        );
      }
      setIsModalOpen(true);
    }
  };

  return (
    <section className="mt-8">
      <h1 className="text-center text-black text-4xl mb-4">Register</h1>
      <form
        className="block max-w-md mx-auto bg-white p-6 rounded shadow-md"
        onSubmit={handleRegister}
      >
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-semibold mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-secondary text-black py-2 px-4 rounded hover:bg-secondary-dark transition-colors duration-300"
        >
          Register
        </button>
      </form>
      <p className="text-center mt-4 text-gray-700">
        Already have an account?{" "}
        <Link to="/login" className="text-black font-bold hover:underline">
          Login here
        </Link>
      </p>

      {/* Feedback Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          message.startsWith("Registration successful")
            ? "Success"
            : "Registration Error"
        }
      >
        <p>{message}</p>
      </Modal>
    </section>
  );
}

export default Register;
