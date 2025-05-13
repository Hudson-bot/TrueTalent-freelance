import { motion } from 'framer-motion';
import { FiMessageSquare, FiUser, FiLink, FiAward, FiCompass } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, userData, handleFileChange, fetchLinks, fetchSkills }) => {
  const navigate = useNavigate();
  
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'links') {
      fetchLinks && fetchLinks();
    } else if (tabName === 'skills') {
      fetchSkills && fetchSkills();
    }
  };

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white shadow-lg flex flex-col h-screen"
    >
      {/* Logo Section */}
      <div 
        className="p-4 border-b border-gray-100 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <h1 className="text-2xl font-bold text-indigo-600 text-center">
          TrueTalent
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {[
          { icon: <FiCompass />, name: 'Community' },
          { icon: <FiMessageSquare />, name: 'Messages' },
          { icon: <FiLink />, name: 'Links' },
          { icon: <FiAward />, name: 'Skills' },
        ].map((item) => (
          <motion.button
            whileHover={{ x: 5 }}
            key={item.name}
            onClick={() => handleTabClick(item.name.toLowerCase())}
            className={`flex items-center w-full p-3 rounded-lg text-left ${
              activeTab === item.name.toLowerCase() ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </div>
          </motion.button>
        ))}
      </nav>

      {/* Profile Section - Clickable */}
      <div 
        className="p-4 border-t border-gray-100 hover:bg-gray-50 cursor-pointer group transition-colors"
        onClick={() => handleTabClick('profile')}
        title="View and manage your personal information"
      >
        <div className={`flex items-center space-x-3 p-2 rounded-lg ${
          activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : ''
        }`}>
          <div className="relative">
            <img 
              src={userData.profilePic || 'https://www.vectorstock.com/royalty-free-vector/guy-anime-avatar-vector-43916661'} 
              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
              alt="Profile"
            />
            <label className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full cursor-pointer">
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileChange} 
                accept="image/*"
                onClick={(e) => e.stopPropagation()} // Prevent profile click when changing image
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </label>
          </div>
          <div>
            <h3 className="font-medium flex items-center space-x-2">
              <span>{userData.name || 'New User'}</span>
              <FiUser className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </h3>
            <p className="text-xs text-gray-500">{userData.title || 'Your Title'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;