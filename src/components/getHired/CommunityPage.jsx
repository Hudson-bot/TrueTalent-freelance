import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const CommunityPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [activeTab, setActiveTab] = useState('community');
  const [userData, setUserData] = useState({
    name: '',
    title: '',
    profilePic: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/personal-info/${userId}`);
        if (response.data) {
          setUserData(response.data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/all');
        const filteredUsers = response.data.filter(user => user.name && user.email);
        setUsers(filteredUsers);
      } catch (err) {
        setError('Failed to fetch users. Please try again later.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChat = (user, e) => {
    e.stopPropagation();
    setSelectedUser(user);
    setShowChatModal(true);
    setMessageSent(false);
  };

  const closeChat = () => {
    setShowChatModal(false);
    setMessage('');
    setSelectedUser(null);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      console.log('Sending message to:', selectedUser.name);
      console.log('Message:', message);

      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessageSent(true);
      setTimeout(closeChat, 2000);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({
          ...prev,
          profilePic: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    switch(tabName) {
      case 'messages':
        navigate('/messages');
        break;
      case 'links':
        navigate('/get-hired', { state: { initialTab: 'links' } });
        break;
      case 'skills':
        navigate('/skills');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'community':
        // Already on community page
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        userData={userData}
        handleFileChange={handleFileChange}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Developer Community
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/20"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user.name || 'Anonymous'}</h3>
                    <p className="text-gray-600">{user.email || 'No email provided'}</p>
                  </div>
                </div>
                {user.skills && user.skills.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={(e) => handleChat(user, e)}
                  className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Chat with {user.name}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Chat with {selectedUser?.name}</h3>
            {messageSent ? (
              <div className="text-green-500 text-center mb-4">Message sent successfully!</div>
            ) : (
              <form onSubmit={sendMessage}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 border rounded-lg mb-4 h-32"
                  placeholder="Type your message here..."
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeChat}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;