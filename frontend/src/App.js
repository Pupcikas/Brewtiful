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
import background from "./components/background.png";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    monitorToken();
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("api/auth/logout", {
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
    <CartProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
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
                  <Link to="/cart">
                    <div className="flex justify-center items-center">
                      <div className="relative py-2">
                        <div className="t-0 absolute left-3">
                          <p className="flex h-2 w-2 items-center justify-center rounded-full bg-red-500 p-3 text-xs text-white">
                            {/* Cart Count */}
                          </p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="file: mt-4 h-6 w-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
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
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
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
                  <div>
                    <h1 className="font-bold text-red-700">
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
                  <div>
                    <h1 className="font-bold text-red-700">
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
                  <div>
                    <h1 className="font-bold text-red-700">
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
                  <div>
                    <h1 className="font-bold text-red-700">
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
                  <div>
                    <h1 className="font-bold text-red-700">
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
                  <div>
                    <h1 className="font-bold text-red-700">
                      You do not have permission to view this page.
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
    </CartProvider>
  );
}

export default App;
