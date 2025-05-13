import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { format } from 'date-fns';
import {
  FiSend,
  FiPaperclip,
  FiSearch,
  FiMoreVertical,
  FiImage,
  FiSmile,
  FiVideo,
  FiPhone,
  FiStar,
  FiArchive,
  FiMessageSquare
} from 'react-icons/fi';

// Accept props from the parent component (GetHiredDashboard)
const Messages = ({ formData = {}, updateFormData = () => {}, updateMultipleFields = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5173/api/personal-info/${userId}`);
        if (response.data) {
          if (response.data.role) {
            updateFormData('role', response.data.role);
          }
          
          const conversations = await fetchConversations(userId);
          
          // Fetch all users for new conversations
          await fetchAllUsers();
          
          // If we have a conversationId in the navigation state, select that conversation
          if (location.state?.conversationId) {
            const conversation = conversations.find(conv => conv._id === location.state.conversationId);
            if (conversation) {
              setSelectedConversation(conversation);
              fetchMessages(conversation._id);
            }
          }

          // Initialize Socket.io connection
          socketRef.current = io('http://localhost:5173', {
            query: {
              userId,
              userRole: (formData && formData.role) || response.data.role
            }
          });

          // Listen for new messages
          socketRef.current.on('newMessage', (message) => {
            setMessages(prev => [...prev, message]);
          });

          // Listen for typing events
          socketRef.current.on('userTyping', ({ userName, isTyping }) => {
            setIsTyping(isTyping);
            setTypingUser(userName);
          });

          // Listen for conversation updates
          socketRef.current.on('conversationUpdate', (updatedConversation) => {
            setConversations(prev => 
              prev.map(conv => 
                conv._id === updatedConversation._id ? updatedConversation : conv
              )
            );
          });
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();

    // Cleanup socket connection
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [navigate, location.state?.conversationId, updateFormData]);

  const fetchConversations = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5173/api/conversations/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fetched conversations response:', response.data);
      
      // Ensure response.data is an array
      const conversationsData = Array.isArray(response.data) ? response.data : [];
      setConversations(conversationsData);
      return conversationsData;
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setConversations([]);
      return [];
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5173/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching users with token:', token);
      const response = await axios.get('http://localhost:5173/api/users/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched users:', response.data);
      
      // Ensure response.data is an array before filtering
      if (Array.isArray(response.data)) {
        // Filter out the current user
        const filteredUsers = response.data.filter(user => user._id !== localStorage.getItem('userId'));
        console.log('Filtered users:', filteredUsers);
        setAllUsers(filteredUsers);
      } else {
        console.error('Expected users data to be an array but got:', typeof response.data);
        setAllUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setAllUsers([]); // Ensure we always set an array
    }
  };

  const startNewConversation = async (otherUser) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Starting conversation with:', otherUser);
      console.log('Using token:', token);
      
      const response = await axios.post('http://localhost:5173/api/conversations', {
        participantId: otherUser._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('New conversation response:', response.data);
      
      // Add the new conversation to the list
      const newConversation = response.data;
      setConversations(prev => [newConversation, ...prev]);
      
      // Select the new conversation
      setSelectedConversation(newConversation);
      setShowNewChatModal(false);
      
      // Clear messages since it's a new conversation
      setMessages([]);
    } catch (err) {
      console.error('Error starting new conversation:', err);
      alert(`Failed to start conversation: ${err.message}`);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const userId = localStorage.getItem('userId');
    try {
      const messageData = {
        conversationId: selectedConversation._id,
        senderId: userId,
        content: newMessage,
        senderRole: formData?.role || 'user'
      };

      // Emit the message through socket
      socketRef.current.emit('sendMessage', messageData);

      setNewMessage('');
      // Stop typing indicator
      socketRef.current.emit('typing', {
        conversationId: selectedConversation._id,
        userName: formData?.name || 'User',
        isTyping: false
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleTyping = () => {
    if (selectedConversation) {
      socketRef.current.emit('typing', {
        conversationId: selectedConversation._id,
        userName: formData?.name || 'User',
        isTyping: true
      });

      // Clear typing indicator after delay
      setTimeout(() => {
        socketRef.current.emit('typing', {
          conversationId: selectedConversation._id,
          userName: formData?.name || 'User',
          isTyping: false
        });
      }, 2000);
    }
  };

  const formatMessageTime = (date) => {
    return format(new Date(date), 'h:mm a');
  };

  const getMessageStyle = (msg) => {
    const isOwn = msg.senderId === localStorage.getItem('userId');
    const baseStyle = 'max-w-md px-4 py-2 rounded-2xl shadow-sm';
    const roleStyle = msg.senderRole === 'client' 
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
      : 'bg-gradient-to-r from-green-500 to-green-600 text-white';
    
    return `${baseStyle} ${isOwn ? roleStyle : 'bg-white border'}`;
  };

  // Filter conversations properly with null safety
  // Ensure conversations is an array before filtering
  const filteredConversations = Array.isArray(conversations) 
    ? conversations.filter(conv => {
        // Make sure conversation and other user properties exist
        if (!conv || !conv.participants) return false;
        
        // Find the other participant (not the current user)
        const otherUser = conv.participants.find(p => 
          p._id !== localStorage.getItem('userId')
        );
        
        if (!otherUser) return false;
        
        // Store the other user in a property for easy access in the UI
        conv.otherUser = otherUser;
        
        // Filter by name or message content if search query exists
        return !searchQuery || 
          otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (conv.lastMessage?.content || '').toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];

  return (
    <div className="max-w-full mx-auto">
      <div className="flex mb-6">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent"
        >
          Messages
        </motion.h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 flex"
      >
        {/* Left Sidebar - Conversations */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Chats</h3>
              <button
                onClick={() => {
                  fetchAllUsers();
                  setShowNewChatModal(true);
                }}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* New Chat Modal */}
          {showNewChatModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-96 max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">New Conversation</h2>
                    <button
                      onClick={() => setShowNewChatModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full p-2 border border-gray-200 rounded-lg mb-4"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="overflow-y-auto max-h-96">
                    {allUsers
                      .filter(user => 
                        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(user => (
                        <div
                          key={user._id}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg"
                          onClick={() => startNewConversation(user)}
                        >
                          <img
                            src={user.profilePic || 'https://www.vectorstock.com/royalty-free-vector/guy-anime-avatar-vector-43916661'}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="ml-3">
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filteredConversations.map((conv) => (
                <motion.div
                  key={conv._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50
                    ${selectedConversation?._id === conv._id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
                  onClick={() => {
                    setSelectedConversation(conv);
                    fetchMessages(conv._id);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={conv.otherUser.profilePic || 'https://www.vectorstock.com/royalty-free-vector/guy-anime-avatar-vector-43916661'}
                        alt={conv.otherUser.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                      <span 
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                          ${conv.otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">{conv.otherUser.name}</h3>
                        <span className="text-xs text-gray-500">
                          {conv.lastMessage?.createdAt ? format(new Date(conv.lastMessage.createdAt), 'HH:mm') : ''}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          conv.otherUser.role === 'client' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {conv.otherUser.role}
                        </span>
                        <p className="text-sm text-gray-500 truncate ml-2">
                          {conv.lastMessage?.content || 'Start a conversation'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={selectedConversation.otherUser.profilePic || 'https://www.vectorstock.com/royalty-free-vector/guy-anime-avatar-vector-43916661'}
                        alt={selectedConversation.otherUser.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                      <span 
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                          ${selectedConversation.otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedConversation.otherUser.name}</h2>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          selectedConversation.otherUser.role === 'client' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {selectedConversation.otherUser.role}
                        </span>
                        <span className="text-sm text-gray-500">
                          {selectedConversation.otherUser.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                      <FiPhone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                      <FiVideo className="w-5 h-5" />
                    </button>
                    <button 
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={() => setIsStarred(!isStarred)}
                    >
                      <FiStar className={`w-5 h-5 ${isStarred ? 'text-yellow-400 fill-current' : ''}`} />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                      <FiArchive className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                      <FiMoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex ${msg.senderId === localStorage.getItem('userId') ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${msg.senderId === localStorage.getItem('userId') ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2 rounded-2xl shadow-sm ${
                            msg.senderId === localStorage.getItem('userId')
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-900'
                          }`}>
                            {msg.content}
                          </div>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs text-gray-500">
                              {format(new Date(msg.createdAt), 'HH:mm')}
                            </span>
                            {msg.senderId === localStorage.getItem('userId') && (
                              <span className="text-xs text-gray-500">
                                {msg.isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-gray-500"
                    >
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm">{typingUser} is typing...</span>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 px-6 py-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <FiSmile className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiPaperclip className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiImage className="w-6 h-6" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiMessageSquare className="w-12 h-12 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Messages</h2>
                <p className="text-gray-500 max-w-sm">
                  Select a conversation from the list to start chatting with freelancers and clients
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Messages; 