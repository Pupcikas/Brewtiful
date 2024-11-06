import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Right from './pages/Right';
import logo from './components/logo.jpg';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Router>
      <header className="flex items-center justify-between mx-4 my-2">
        <nav className="flex items-center gap-8 text-primary font-semibold">
          <Link className="font-semibold text-2xl text-primary" to="/">BREWTIFUL</Link>
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/about">About</Link>
        </nav>
        <nav className="flex items-center gap-4 text-primary font-semibold">
          {isAuthenticated ? (
            <>
              <Link to="/profile">Profile</Link>
              <button onClick={handleLogout} className="bg-primary rounded text-white px-6 py-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="bg-primary rounded text-white px-6 py-2">Register</Link>
            </>
          )}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={

    <section className="mt-4 grid grid-cols-1 md:grid-cols-2 ditems-center">
      <div className="py-12 px-4">            
        <h1 className="text-4xl font-semibold">
          Everything<br/> 
          is better<br/> 
          with&nbsp;
        <span className="text-brown-600 italic">
          Brewtiful
        </span>
        </h1>
        <p className="my-6 text-primary text-sm">
          Drinks for all tastes!
        </p>
        <div className="flex gap-4 text-sm">
          <button className="inline-flex items-center gap-2 bg-primary 
             text-white px-4 py-2 w-auto">
            ORDER NOW
            <Right />
          </button>
          <button className="inline-flex gap-2 px-4 py-2 text-brown-600
            font-semibold w-auto">
            Learn more
            <Right/>
          </button>
        </div>
      </div>
      <div className="w-auto h-auto flex items-center justify-center relative p-40 pt-5">
        <img src={logo} alt="coffee"></img>
      </div>
    </section>
          } />

        {/* Pass setIsAuthenticated to Login */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : 
        
          <div>
            <h1 className='font-bold text-red-700'>Please login to view your profile.</h1>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
