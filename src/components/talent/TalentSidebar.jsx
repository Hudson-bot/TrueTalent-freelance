import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiMessageSquare, FiHeart, FiBookmark, 
  FiSettings, FiLogOut, FiUser, FiGrid, FiUsers as FiCommunity,
  FiHome, FiFolder, FiPlusCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const TalentSidebar = ({ activeTab }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/talent/dashboard', id: 'dashboard' },
    { icon: FiGrid, label: 'Browse Talent', path: '/talent/browse', id: 'talents' },
    { icon: FiFolder, label: 'Projects', path: '/hire/projects', id: 'projects' },
    { icon: FiPlusCircle, label: 'Post a Project', path: '/talent/post', id: 'post' },
    // { icon: FiCommunity, label: 'Community', path: '/talent/community', id: 'community' }, //community page
    { icon: FiMessageSquare, label: 'Messages', path: '/talent/messages', id: 'messages' },
    { icon: FiHeart, label: 'Favorites', path: '/favorites', id: 'favorites' },
    { icon: FiBookmark, label: 'Saved', path: '/saved', id: 'saved' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Profile section */}
      <div className="p-4 border-b border-gray-200">
        <Link to="/profile" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FiUser className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Your Profile</h3>
            <p className="text-sm text-gray-500">View and edit profile</p>
          </div>
        </Link>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom menu */}
      <div className="p-4 border-t border-gray-200">
        <ul className="space-y-2">
          <li>
            <Link
              to="/settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiSettings size={20} />
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full"
            >
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TalentSidebar; 