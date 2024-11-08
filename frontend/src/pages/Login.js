import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
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
      navigate("/profile");
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
    }
  };

  return (
    <section className="mt-8">
      <h1 className="text-center text-primary text-4xl mb-4">Login</h1>
      <form className="block max-w-xs mx-auto" onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </section>
  );
}

export default Login;
