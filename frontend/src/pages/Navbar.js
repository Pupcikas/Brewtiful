// src/components/Navbar.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaShoppingCart, FaUser } from "react-icons/fa";
import logo from "../components/logo.png"; // Ensure the path is correct

function Navbar({ isAuthenticated, userRole, handleLogout, cartCount }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Logo" className="h-8 w-auto mr-2" />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6 items-center">
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
                className="hover:text-secondary transition-colors duration-300"
              >
                <FaUser className="inline mr-1" />
                Profile
              </Link>
              {userRole === "User" && (
                <Link
                  to="/cart"
                  className="relative hover:text-secondary transition-colors duration-300"
                >
                  <FaShoppingCart className="inline mr-1" />
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-secondary hover:bg-accent text-white px-4 py-2 rounded transition-colors duration-300"
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
                className="bg-secondary hover:bg-accent text-white px-4 py-2 rounded transition-colors duration-300"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} aria-label="Toggle Menu">
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-primary text-white">
          <ul className="flex flex-col space-y-2 p-4">
            <li>
              <Link
                to="/"
                onClick={toggleMenu}
                className="block hover:text-secondary transition-colors duration-300"
              >
                Home
              </Link>
            </li>
            {userRole === "User" && (
              <li>
                <Link
                  to="/menu"
                  onClick={toggleMenu}
                  className="block hover:text-secondary transition-colors duration-300"
                >
                  Menu
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/about"
                onClick={toggleMenu}
                className="block hover:text-secondary transition-colors duration-300"
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
                      onClick={toggleMenu}
                      className="block hover:text-secondary transition-colors duration-300"
                    >
                      Orders
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    to="/profile"
                    onClick={toggleMenu}
                    className="block hover:text-secondary transition-colors duration-300"
                  >
                    <FaUser className="inline mr-1" />
                    Profile
                  </Link>
                </li>
                {userRole === "User" && (
                  <li>
                    <Link
                      to="/cart"
                      onClick={toggleMenu}
                      className="block hover:text-secondary transition-colors duration-300"
                    >
                      <FaShoppingCart className="inline mr-1" />
                      Cart
                      {cartCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="w-full text-left bg-secondary hover:bg-accent text-white px-4 py-2 rounded transition-colors duration-300"
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
                    onClick={toggleMenu}
                    className="block hover:text-secondary transition-colors duration-300"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    onClick={toggleMenu}
                    className="block bg-secondary hover:bg-accent text-white px-4 py-2 rounded transition-colors duration-300"
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
  );
}

export default Navbar;
