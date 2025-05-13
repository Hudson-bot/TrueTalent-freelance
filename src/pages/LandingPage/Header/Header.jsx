import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isClient = currentUser?.role === 'client';
  const isFreelancer = currentUser?.role === 'freelancer';

  return (
    <header className="header">
      <motion.div
        className="container header-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="logo"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          True<span className="highlight">Talent</span>
        </motion.div>
        <nav className="nav">
          <ul className="nav-links">
            {["Services", "How It Works", "Top Talent", "Pricing"].map(
              (item, index) => (
                <motion.li
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}>
                    {item}
                  </a>
                </motion.li>
              )
            )}
          </ul>
        </nav>
        <div className="header-buttons">
          {!currentUser ? (
            <>
              <motion.button
                className="btn btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
              >
                Log In
              </motion.button>
              <motion.button
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </motion.button>
            </>
          ) : (
            <>
              <div className="relative">
                <motion.button
                  className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {getInitials(currentUser.name)}
                </motion.button>
                
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                    >
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Conditional buttons based on user role */}
              {/* {!isFreelancer && (
                <motion.button
                  className="btn btn-primary ml-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/hire/profile')}
                >
                  Hire a Freelancer
                </motion.button>
              )}

              {!isClient && (
                <motion.button
                  className="btn btn-secondary ml-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/gethired/dashboard')}
                >
                  Become a Freelancer
                </motion.button>
              )} */}
            </>
          )}
        </div>
      </motion.div>
    </header>
  );
};

export default Header;