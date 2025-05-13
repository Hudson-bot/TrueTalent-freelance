import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PersonalInfoModal from "./PersonalInfoModal";
import { FiMessageCircle, FiSend, FiPaperclip, FiImage, FiSmile, FiMoreVertical } from 'react-icons/fi';
import axios from 'axios';
import { format } from 'date-fns';

const ProfileSection = ({ formData, updateFormData, updateMultipleFields }) => {
  const [showModal, setShowModal] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recentChats, setRecentChats] = useState([]);
  
  useEffect(() => {
    // Fetch recent chats
    const fetchRecentChats = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/conversations/${localStorage.getItem('userId')}`);
        setRecentChats(response.data);
      } catch (error) {
        console.error('Error fetching recent chats:', error);
      }
    };
    
    fetchRecentChats();
  }, []);

  const handleEditClick = () => {
    setShowModal(true);
  };
  
  const handleSaveProfile = (updatedData) => {
    const updates = {};
    if (updatedData.name) updates.name = updatedData.name;
    if (updatedData.title) updates.title = updatedData.title;
    if (updatedData.email) updates.email = updatedData.email;
    if (updatedData.bio) updates.bio = updatedData.bio;
    if (updatedData.github) updates.github = updatedData.github;
    if (updatedData.linkedin) updates.linkedin = updatedData.linkedin;
    if (updatedData.resume) updates.resume = updatedData.resume;
    updateMultipleFields(updates);
    setShowModal(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Add message sending logic here
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex gap-8">
        {/* Profile Information */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Your Profile
            </h2>
            <p className="text-gray-500 mt-2">View and manage your personal information</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20"
          >
            <div className="p-8 space-y-6">
              {[
                { label: "Full Name", value: formData.name, icon: "👤" },
                { label: "Professional Title", value: formData.title, icon: "💼" },
                { label: "Email Address", value: formData.email, icon: "✉️" },
                { label: "Bio", value: formData.bio, icon: "📝", isMultiline: true }
              ].map((field, index) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-full text-indigo-600">
                    <span className="text-xl">{field.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500">{field.label}</p>
                    {field.isMultiline ? (
                      <p className="mt-1 text-gray-800 whitespace-pre-line">
                        {field.value || <span className="text-gray-400">Not provided</span>}
                      </p>
                    ) : (
                      <p className="mt-1 text-gray-800 truncate">
                        {field.value || <span className="text-gray-400">Not provided</span>}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMessages(!showMessages)}
                className="px-6 py-2 bg-white border border-indigo-500 text-indigo-500 rounded-lg shadow-sm hover:bg-indigo-50 transition-all flex items-center space-x-2"
              >
                <FiMessageCircle className="w-5 h-5" />
                <span>Messages</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEditClick}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Edit Profile
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Messages Section */}
        <AnimatePresence>
          {showMessages && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-96 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Recent Messages</h3>
              </div>

              <div className="h-[500px] flex flex-col">
                {/* Recent Chats */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {recentChats.map((chat) => (
                    <motion.div
                      key={chat._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={chat.otherUser.profilePic || 'https://www.vectorstock.com/royalty-free-vector/guy-anime-avatar-vector-43916661'}
                          alt={chat.otherUser.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          chat.otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-900 truncate">{chat.otherUser.name}</h4>
                          <span className="text-xs text-gray-500">
                            {chat.lastMessage?.createdAt ? format(new Date(chat.lastMessage.createdAt), 'HH:mm') : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FiSmile className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FiPaperclip className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiSend className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Personal Info Modal */}
      {showModal && (
        <PersonalInfoModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveProfile}
          existingData={formData}
        />
      )}
    </div>
  );
};

export default ProfileSection;
