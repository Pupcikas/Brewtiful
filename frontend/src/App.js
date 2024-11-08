import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Right from "./pages/Right";
import logo from "./components/logo.png";
import background from "./components/background.png";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("token");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Router>
      <div className=" flex flex-col min-h-screen">
        <header className="flex items-center justify-between shadow-md pt-2 pb-2">
          <nav className="flex items-center gap-8 text-primary font-semibold mx-4">
            <Link className="font-semibold text-2xl text-primary" to="/">
              <img src={logo} alt="logo"></img>
            </Link>
            <Link to="/">Home</Link>
            <Link to="/menu">Menu</Link>
            <Link to="/about">About</Link>
          </nav>
          <nav className="flex items-center gap-4 text-primary font-semibold mx-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile">Profile</Link>
                <button
                  onClick={handleLogout}
                  className="bg-primary rounded text-white px-6 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link
                  to="/register"
                  className="bg-primary rounded text-white px-6 py-2"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </header>
        <Routes>
          <Route
            path="/"
            element={
              <section className="items-center">
                <div
                  style={{
                    backgroundImage: `url(${background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "90vh",
                    width: "100%",
                  }}
                ></div>
              </section>
            }
          />

          <Route path="/about" element={<About />} />
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <Profile />
              ) : (
                <div>
                  <h1 className="font-bold text-red-700">
                    Please login to view your profile.
                  </h1>
                </div>
              )
            }
          />
        </Routes>
        <footer
          style={{ boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)" }}
          className="primary py-4 mt-auto"
        >
          <div className="container mx-auto text-center">
            <p className="text-sm">
              © 2024 Brewtiful - Domas Gladkauskas IFK-2.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
