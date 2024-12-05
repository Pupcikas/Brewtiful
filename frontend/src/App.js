// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { CartProvider } from "./pages/CartContext"; // Import the CartProvider
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Categories from "./pages/Categories";
import Items from "./pages/Items";
import Ingredients from "./pages/Ingredients";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart"; // Import Cart Page
import monitorToken from "./pages/monitorToken";
import logo from "./components/logo.png";
import AdminOrders from "./pages/AdminOrders";
import jwt_decode, { jwtDecode } from "jwt-decode";
import background from "./components/background.png";
import { FaBars, FaTimes, FaShoppingCart, FaUser } from "react-icons/fa";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    monitorToken();
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role); // Assuming the token has a 'role' claim
      } catch (error) {
        console.error("Failed to decode token:", error);
        setUserRole(null);
        setIsAuthenticated(false);
        localStorage.removeItem("token");
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUserRole(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Function to toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when a link is clicked
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <CartProvider>
      <Router>
        <div className="flex flex-col min-h-screen font-recoleta">
          {/* Header */}
          <header className="bg-primary text-black shadow-lg">
            <div className="container mx-auto flex items-center justify-between p-4">
              <Link
                to="/"
                className="flex items-center space-x-2"
                onClick={closeMenu}
              >
                <img src={logo} alt="logo" className="h-8 w-auto" />
              </Link>
              {/* Desktop Menu */}
              <nav className="hidden md:flex space-x-6">
                <Link
                  to="/"
                  className="hover:text-secondary transition-colors duration-300"
                >
                  Home
                </Link>
                {userRole === "User" && (
                  <Link
                    to="/menu"
                    className="hover:text-secondary transition-colors duration-300"
                  >
                    Menu
                  </Link>
                )}
                <Link
                  to="/about"
                  className="hover:text-secondary transition-colors duration-300"
                >
                  About
                </Link>
              </nav>
              {/* User Actions */}
              <nav className="hidden md:flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    {userRole === "User" && (
                      <Link
                        to="/orders"
                        className="hover:text-secondary transition-colors duration-300"
                      >
                        Orders
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center space-x-1 hover:text-secondary transition-colors duration-300"
                    >
                      <FaUser />
                      <span>Account</span>
                    </Link>
                    {userRole === "User" && (
                      <Link
                        to="/cart"
                        className="flex items-center space-x-1 hover:text-secondary transition-colors duration-300"
                      >
                        <FaShoppingCart />
                        <span>Cart</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="bg-secondary hover:bg-secondary-dark transition-colors duration-300 text-white px-4 py-2 rounded"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="hover:text-secondary transition-colors duration-300"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-secondary hover:bg-secondary-dark transition-colors duration-300 text-primary px-4 py-2 rounded"
                    >
                      Register
                    </Link>
                  </>
                )}
              </nav>
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button onClick={toggleMenu} aria-label="Toggle Menu">
                  {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
              </div>
            </div>
            {/* Mobile Menu */}
            {isMenuOpen && (
              <nav className="md:hidden bg-primary text-black">
                <ul className="flex flex-col space-y-2 p-4">
                  <li>
                    <Link
                      to="/"
                      onClick={closeMenu}
                      className="hover:text-secondary transition-colors duration-300"
                    >
                      Home
                    </Link>
                  </li>
                  {userRole === "User" && (
                    <li>
                      <Link
                        to="/menu"
                        onClick={closeMenu}
                        className="hover:text-secondary transition-colors duration-300"
                      >
                        Menu
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      to="/about"
                      onClick={closeMenu}
                      className="hover:text-secondary transition-colors duration-300"
                    >
                      About
                    </Link>
                  </li>
                  {isAuthenticated ? (
                    <>
                      {userRole === "User" && (
                        <li>
                          <Link
                            to="/orders"
                            onClick={closeMenu}
                            className="hover:text-secondary transition-colors duration-300"
                          >
                            Orders
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link
                          to="/profile"
                          onClick={closeMenu}
                          className="hover:text-secondary transition-colors duration-300"
                        >
                          Account
                        </Link>
                      </li>
                      {userRole === "User" && (
                        <li>
                          <Link
                            to="/cart"
                            onClick={closeMenu}
                            className="hover:text-secondary transition-colors duration-300"
                          >
                            Cart
                          </Link>
                        </li>
                      )}
                      <li>
                        <button
                          onClick={() => {
                            handleLogout();
                            closeMenu();
                          }}
                          className="w-full text-left !text-white hover:text-secondary transition-colors duration-300"
                        >
                          Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          to="/login"
                          onClick={closeMenu}
                          className="hover:text-secondary transition-colors duration-300"
                        >
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/register"
                          onClick={closeMenu}
                          className="bg-secondary hover:bg-secondary-dark transition-colors duration-300 text-black px-4 py-2 rounded"
                        >
                          Register
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </nav>
            )}
          </header>

          {/* Main Content */}
          <main className="flex-grow bg-background p-6">
            <Routes>
              <Route
                path="/"
                element={
                  <section className="flex items-center justify-center">
                    <div
                      style={{
                        backgroundImage: `url(${background})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        height: "90vh",
                        width: "100%",
                      }}
                      className="flex items-center justify-center bg-opacity-50"
                    ></div>
                  </section>
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route
                path="/login"
                element={<Login setIsAuthenticated={setIsAuthenticated} />}
              />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile/*"
                element={
                  isAuthenticated ? (
                    <Profile />
                  ) : (
                    <div className="text-center mt-8 text-red-500">
                      <h1 className="font-bold">
                        Please login to view your profile.
                      </h1>
                    </div>
                  )
                }
              />
              <Route
                path="/categories"
                element={
                  isAuthenticated ? (
                    <Categories />
                  ) : (
                    <div className="text-center mt-8 text-red-500">
                      <h1 className="font-bold">
                        You do not have permission to view this page.
                      </h1>
                    </div>
                  )
                }
              />
              <Route
                path="/items"
                element={
                  isAuthenticated ? (
                    <Items />
                  ) : (
                    <div className="text-center mt-8 text-red-500">
                      <h1 className="font-bold">
                        You do not have permission to view this page.
                      </h1>
                    </div>
                  )
                }
              />
              <Route
                path="/ingredients"
                element={
                  isAuthenticated ? (
                    <Ingredients />
                  ) : (
                    <div className="text-center mt-8 text-red-500">
                      <h1 className="font-bold">
                        You do not have permission to view this page.
                      </h1>
                    </div>
                  )
                }
              />
              <Route
                path="/users"
                element={
                  isAuthenticated ? (
                    <Users />
                  ) : (
                    <div className="text-center mt-8 text-red-500">
                      <h1 className="font-bold">
                        You do not have permission to view this page.
                      </h1>
                    </div>
                  )
                }
              />
              <Route
                path="/orders"
                element={
                  isAuthenticated ? (
                    <Orders />
                  ) : (
                    <div className="text-center mt-8 text-red-500">
                      <h1 className="font-bold">
                        You do not have permission to view this page.
                      </h1>
                    </div>
                  )
                }
              />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-primary text-black text-center py-4 shadow-inner">
            <div className="container mx-auto">
              <p className="text-sm">
                2024 Brewtiful - Domas Gladkauskas IFK-2.
              </p>
              {/* Optional Social Icons */}
              <div className="flex justify-center space-x-4 mt-2">
                <a
                  href="https://github.com/Pupcikas/Brewtiful"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary transition-colors duration-300"
                >
                  <FaUser size={20} />
                </a>
                {/* Add more social icons as needed */}
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
}
export default App;
