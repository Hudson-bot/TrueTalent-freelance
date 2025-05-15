import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  FiMessageSquare,
  FiX,
  FiUser,
  FiAlertCircle
} from 'react-icons/fi';
import socketService from '../../utils/socketService';

// API configuration
const API_BASE_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Improved ID validation
const isValidId = (id) => {
  if (!id) return false;
  // Check for MongoDB ObjectId or simple string ID
  return /^[0-9a-fA-F]{24}$/.test(id) || typeof id === 'string';
};

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Authentication check
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      navigate('/login');
      return false;
    }
    
    if (!isValidId(userId)) {
      setError('Invalid user ID format. Please login again.');
      return false;
    }
    
    return true;
  };

  // Initialize socket connection
  const initializeSocketConnection = (userId) => {
    if (!isValidId(userId)) return;

    try {
      // Use the shared socket service
      socketService.connect(userId, localStorage.getItem('userRole') || 'client');
      setSocketConnected(socketService.isSocketConnected());

      // Register event handlers
      socketService.on('newMessage', (message) => {
        if (selectedConversation && message.conversationId === selectedConversation._id) {
          setMessages(prev => [...prev, message]);
          markMessagesAsRead(message.conversationId);
        }
        
        // Update conversation with new message
        updateConversationWithMessage(message);
      });

      socketService.on('userTyping', ({ userName, isTyping, conversationId }) => {
        if (selectedConversation && selectedConversation._id === conversationId) {
          setIsTyping(isTyping);
          setTypingUser(userName);
        }
      });

      socketService.on('conversationUpdate', (updatedConversation) => {
        setConversations(prev => {
          const exists = prev.some(conv => conv._id === updatedConversation._id);
          return exists 
            ? prev.map(conv => conv._id === updatedConversation._id ? updatedConversation : conv)
            : [updatedConversation, ...prev];
        });
      });

      socketService.on('userStatusChange', ({ userId: changedUserId, status }) => {
        console.log(`User ${changedUserId} is now ${status}`);
        
        // Update the online users set
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (status === 'online') {
            newSet.add(changedUserId);
          } else {
            newSet.delete(changedUserId);
          }
          return newSet;
        });
        
        // Update conversation list with online status
        setConversations(prev => 
          prev.map(conv => {
            const otherUser = conv.participants?.find(p => p?._id !== userId);
            if (otherUser && otherUser._id === changedUserId) {
              return {
                ...conv,
                otherUser: { ...otherUser, isOnline: status === 'online' }
              };
            }
            return conv;
          })
        );
      });
      
      // Handle initial online users list
      socketService.on('onlineUsers', (onlineUserIds) => {
        console.log('Received online users:', onlineUserIds);
        
        // Add current user to online users list (since we know we're online)
        const currentUserId = localStorage.getItem('userId');
        const updatedOnlineUsers = new Set([...onlineUserIds, currentUserId]);
        
        setOnlineUsers(updatedOnlineUsers);
        
        // Update conversation list with online status
        setConversations(prev => 
          prev.map(conv => {
            const otherUser = conv.participants?.find(p => p?._id !== userId);
            if (otherUser && updatedOnlineUsers.has(otherUser._id)) {
              return {
                ...conv,
                otherUser: { ...otherUser, isOnline: true }
              };
            }
            return conv;
          })
        );
        
        // Update users list if available
        if (allUsers.length > 0) {
          setAllUsers(prev => 
            prev.map(user => ({
              ...user,
              isOnline: updatedOnlineUsers.has(user._id)
            }))
          );
        }
      });
    } catch (err) {
      console.error('Socket connection error:', err);
    }
  };

  // Update conversation with new message
  const updateConversationWithMessage = (message) => {
    setConversations(prev => 
      prev.map(conv => 
        conv._id === message.conversationId 
          ? { 
              ...conv, 
              lastMessage: { 
                content: message.content,
                createdAt: message.createdAt
              },
              unread: selectedConversation && selectedConversation._id === message.conversationId ? 0 : (conv.unread || 0) + 1
            } 
          : conv
      )
    );
  };

  // Mark messages as read
  const markMessagesAsRead = (conversationId) => {
    if (!isValidId(conversationId)) return;
    
    socketService.markAsRead(conversationId);
    
    // Update UI to reflect messages as read
    setConversations(prev => 
      prev.map(conv => conv._id === conversationId ? { ...conv, unread: 0 } : conv)
    );
  };

  // Fetch conversations
  const fetchConversations = async () => {
    if (!checkAuth()) return;

    try {
      const response = await api.get('/conversations');
      const data = response.data?.data || response.data?.conversations || response.data || [];
      
      const userId = localStorage.getItem('userId');
      const processed = data
        .filter(conv => conv && conv._id)
        .map(conv => {
          const otherUser = conv.participants?.find(p => p?._id !== userId);
          return {
            ...conv,
            otherUser: otherUser || { name: 'Unknown User' },
            lastMessage: conv.lastMessage || { content: 'Start a conversation' },
            unread: conv.unread || 0
          };
        });

      setConversations(processed);
      return processed;
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
      return [];
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    if (!checkAuth() || !isValidId(conversationId)) return;

    try {
      setIsLoading(true);
      
      // Join the conversation room
      socketService.joinConversation(conversationId);
      
      const response = await api.get(`/messages/conversation/${conversationId}`);
      
      const data = response.data?.data || response.data?.messages || response.data || [];
      const processed = data
        .filter(msg => msg && (msg._id || msg.id))
        .map(msg => ({
          _id: msg._id || msg.id,
          senderId: msg.senderId || msg.sender || '',
          content: msg.content || msg.text || '',
          createdAt: msg.createdAt || msg.timestamp || new Date().toISOString()
        }));

      setMessages(processed);
      markMessagesAsRead(conversationId);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    if (!checkAuth()) return;

    try {
      const response = await api.get('/users/clients');
      const data = response.data?.data || response.data?.users || response.data || [];
      
      const currentUserId = localStorage.getItem('userId');
      const filtered = data
        .filter(user => user._id !== currentUserId && user.role === 'client')
        .map(user => ({
          ...user,
          isOnline: onlineUsers.has(user._id)
        }));

      setAllUsers(filtered);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    }
  };

  // Start new conversation
  const startNewConversation = async (otherUser) => {
    if (!checkAuth() || !otherUser?._id) return;

    try {
      setIsLoading(true);
      const response = await api.post('/conversations', {
        participantId: otherUser._id
      });

      const newConv = {
        _id: response.data._id,
        otherUser,
        participants: response.data.participants || [
          { _id: localStorage.getItem('userId') },
          otherUser
        ],
        lastMessage: response.data.lastMessage || { content: 'Start a conversation' },
        createdAt: response.data.createdAt || new Date().toISOString(),
        unread: 0
      };

      setConversations(prev => [newConv, ...prev]);
      setSelectedConversation(newConv);
      setShowNewChatModal(false);
      setMessages([]);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const messageData = {
      conversationId: selectedConversation._id,
      senderId: userId,
      senderName: localStorage.getItem('userName') || 'Client',
      senderRole: 'client',
      content: newMessage,
      createdAt: new Date().toISOString()
    };

    // Add message to UI immediately for better UX
    setMessages(prev => [...prev, messageData]);
    
    // Update conversation with new message
    updateConversationWithMessage(messageData);
    
    // Clear input
    setNewMessage('');

    try {
      // Send message via socket
      if (socketService.isSocketConnected()) {
        socketService.sendMessage(messageData);
      } else {
        // Fallback to API if socket not connected
        // The API expects a simpler structure with just conversationId and content
        await api.post('/messages', {
          conversationId: selectedConversation._id,
          content: newMessage
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };
  
  // Handle typing indicator
  const handleTyping = () => {
    if (!selectedConversation) return;
    
    if (socketService.isSocketConnected()) {
      socketService.typing({
        conversationId: selectedConversation._id,
        userName: localStorage.getItem('userName') || 'Client',
        isTyping: true
      });
      
      // Auto-reset typing after delay
      setTimeout(() => {
        if (socketService.isSocketConnected()) {
          socketService.typing({
            conversationId: selectedConversation._id,
            userName: localStorage.getItem('userName') || 'Client',
            isTyping: false
          });
        }
      }, 2000);
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize component
  useEffect(() => {
    const init = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
        return;
      }

      await fetchConversations();
      initializeSocketConnection(userId);
      setIsLoading(false);
    };

    init();

    return () => {
      // Clean up socket event listeners
      socketService.off('newMessage');
      socketService.off('userTyping');
      socketService.off('conversationUpdate');
      socketService.off('userStatusChange');
      socketService.off('onlineUsers');
      socketService.off('markAsRead');
    };
  }, []);

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants?.find(p => p?._id !== localStorage.getItem('userId'));
    const searchLower = searchQuery.toLowerCase();
    
    return !searchQuery || 
      (otherUser?.name?.toLowerCase().includes(searchLower)) ||
      (conv.lastMessage?.content?.toLowerCase().includes(searchLower));
  });

  // Filter users
  const filteredUsers = allUsers.filter(user => {
    const searchLower = userSearchQuery.toLowerCase();
    return !userSearchQuery ||
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-4">
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 flex justify-between">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="text-red-600">
            <FiX />
          </button>
        </div>
      )}

      {/* Connection status */}
      {!socketConnected && (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg mb-4">
          <p>Chat server disconnected. Some features may not work.</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <button
          onClick={() => {
            fetchAllUsers();
            setShowNewChatModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <FiMessageSquare className="mr-2" />
          New Conversation
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <FiMessageSquare className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">No conversations found</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredConversations.map(conv => (
                    <motion.div
                      key={conv._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?._id === conv._id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedConversation(conv);
                        fetchMessages(conv._id);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="relative mr-3">
                          {conv.otherUser?.profilePic ? (
                            <img
                              src={conv.otherUser.profilePic}
                              alt={conv.otherUser.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiUser className="text-gray-400" />
                            </div>
                          )}
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                            onlineUsers.has(conv.otherUser?._id) ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h3 className={`${conv.unread > 0 ? 'font-bold' : 'font-medium'} truncate`}>
                              {conv.otherUser?.name || 'Unknown User'}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conv.lastMessage?.createdAt ? 
                                format(new Date(conv.lastMessage.createdAt), 'h:mm a') : ''}
                            </span>
                          </div>
                          <p className={`text-sm ${conv.unread > 0 ? 'text-gray-800' : 'text-gray-500'} truncate`}>
                            {conv.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="relative mr-3">
                      {selectedConversation.otherUser?.profilePic ? (
                        <img
                          src={selectedConversation.otherUser.profilePic}
                          alt={selectedConversation.otherUser.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <FiUser className="text-gray-400" />
                        </div>
                      )}
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        onlineUsers.has(selectedConversation.otherUser?._id) ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h2 className="font-semibold">
                        {selectedConversation.otherUser?.name || 'Unknown User'}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {onlineUsers.has(selectedConversation.otherUser?._id) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <FiMessageSquare className="mx-auto mb-3 text-gray-300" size={48} />
                        <p>No messages yet</p>
                      </div>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.senderId === localStorage.getItem('userId') ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] p-3 rounded-lg ${
                          msg.senderId === localStorage.getItem('userId') 
                            ? 'bg-blue-100' 
                            : 'bg-gray-100'
                        }`}>
                          <p>{msg.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(msg.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center text-gray-500 text-sm"
                    >
                      <div className="flex space-x-1 mr-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>{typingUser} is typing...</span>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <FiSend />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FiMessageSquare className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New chat modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-lg w-96 max-h-[80vh] flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between">
                <h2 className="text-xl font-semibold">New Conversation</h2>
                <button onClick={() => setShowNewChatModal(false)}>
                  <FiX />
                </button>
              </div>
              
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <FiUser className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No clients found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredUsers.map(user => (
                      <motion.div
                        key={user._id}
                        whileHover={{ backgroundColor: 'rgba(243, 244, 246, 1)' }}
                        className="p-3 cursor-pointer"
                        onClick={() => startNewConversation(user)}
                      >
                        <div className="flex items-center">
                          <div className="relative mr-3">
                            {user.profilePic ? (
                              <img
                                src={user.profilePic}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FiUser className="text-gray-400" />
                              </div>
                            )}
                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{user.name}</h3>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Messages;