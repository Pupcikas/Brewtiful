// src/pages/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Modal from "../components/Modal";

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
      setMessage("Login successful");
      navigate("/");
    } catch (error) {
      if (error.response) {
        console.log("Error Response Data:", error.response.data);
        console.log("Error Response Status:", error.response.status);
        console.log("Error Response Headers:", error.response.headers);
        setMessage(
          "Login failed: " +
            (error.response.data.message || "Unexpected error occurred.")
        );
      } else if (error.request) {
        console.log("Error Request:", error.request);
        setMessage(
          "No response from server. Check your internet connection and try again."
        );
      } else {
        console.log("Error Message:", error.message);
        console.log("Error Config:", error.config);
        setMessage("Error in setting up login request. Please try again.");
      }
      setIsModalOpen(true);
    }
  };

  return (
    <section className="mt-8">
      <h1 className="text-center text-black text-4xl mb-4">Login</h1>
      <form
        className="block max-w-md mx-auto bg-white p-6 rounded shadow-md"
        onSubmit={handleLogin}
      >
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
          className="w-full bg-secondary text-white py-2 px-4 rounded hover:bg-secondary-dark transition-colors duration-300"
        >
          Login
        </button>
      </form>
      <p className="text-center mt-4 text-gray-700">
        Don't have an account?{" "}
        <Link to="/register" className="text-black font-bold hover:underline">
          Register here
        </Link>
      </p>

      {/* Error Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Login Error"
      >
        <p>{message}</p>
      </Modal>
    </section>
  );
}

export default Login;
