import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  FiArchive,  FiMessageSquare,
  FiX,
  FiUser,
  FiAlertCircle
} from 'react-icons/fi';

// Improve the isValidObjectId function
const isValidObjectId = (id) => {
  if (!id) {
    console.error('Empty ID provided to isValidObjectId');
    return false;
  }
  
  // Check if it's a string
  if (typeof id !== 'string') {
    console.error('Non-string ID provided to isValidObjectId:', typeof id);
    id = String(id);
  }
  
  // Clean the id of any whitespace
  const cleanId = id.trim();
  
  // Check for exact 24 hex characters
  const isValid = /^[0-9a-fA-F]{24}$/.test(cleanId);
  if (!isValid) {
    console.error('Invalid ObjectId format:', cleanId, 'Length:', cleanId.length);
  }
  return isValid;
};

// Configure axios with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Update the headers to include CORS-related settings
api.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
api.defaults.headers.common['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
api.defaults.headers.common['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';

// Add request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Do not handle errors here, let components handle them
    return Promise.reject(error);
  }
);

// Helper function to check and refresh token
const checkAndRefreshToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return false;
    }
    
    // Check token expiration (if you have stored expiry)
    const expiry = localStorage.getItem('tokenExpiry');
    if (expiry && new Date() > new Date(expiry)) {
      console.log('Token expired, attempting refresh');
      
      // Try to refresh the token with your refresh endpoint
      try {
        const response = await axios.post('http://localhost:5000/api/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.token) {
          // Update token in localStorage
          localStorage.setItem('token', response.data.token);
          console.log('Token refreshed successfully');
          return true;
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // Redirect to login on refresh failure
        forceResetUserData();
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.error('Error checking token:', err);
    return false;
  }
};

// Debug helper to safely log API payloads
const safeLog = (message, data) => {
  try {
    console.log(message, JSON.stringify(data));
  } catch (e) {
    console.log(message, 'Could not stringify data:', data);
  }
};

const Messages = () => {
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
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [showIdFixBanner, setShowIdFixBanner] = useState(false);

  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Function to force reset user data
  const forceResetUserData = () => {
    console.log('Force resetting user authentication data...');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    // Clear any other auth-related data you might have stored
    
    // Redirect to login
    navigate('/login');
  };
  
  // Check if user ID is invalid and show immediate notification
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    console.log('Current userId from localStorage:', userId);
    
    // Check if it's a valid MongoDB ObjectId
    if (userId) {
      const isValid = isValidObjectId(userId);
      console.log('Is userId valid?', isValid);
      
      if (!isValid) {
        setShowIdFixBanner(true);
      }
    }
  }, []);

  // Add a dedicated authentication check useEffect that runs first
  useEffect(() => {
    // This is the primary authentication check
    const checkAndFixAuth = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      // Step 1: Check if auth data exists
      if (!userId || !token) {
        console.warn('Missing authentication data. Redirecting to login.');
        navigate('/login');
        return false;
      }
      
      // Step 2: Check if userId is a valid MongoDB ObjectId
      const isUserIdValid = isValidObjectId(userId);
      console.log('Current user ID from localStorage:', userId, 'Valid:', isUserIdValid);
      
      if (!isUserIdValid) {
        console.error('Invalid user ID detected. Showing error message with reset option.');
        setError({
          message: 'Your user ID is in an invalid format. This will cause errors with the database.',
          status: 'Authentication Error'
        });
        return false;
      }
      
      return true;
    };
    
    // Run the auth check before anything else
    checkAndFixAuth();
  }, [navigate]);

  // Check if auth token exists
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      console.error('Missing token or userId');
      navigate('/login');
      return false;
    }
    
    // Also check if the userId is a valid MongoDB ObjectId
    if (!isValidObjectId(userId)) {
      console.error('Invalid userId format in localStorage:', userId);
      setError({
        message: 'Invalid user ID format. Please reset and login again.',
        status: 'Authentication Error'
      });
      setShowIdFixBanner(true);
      return false;
    }
    
    return true;
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    const userId = localStorage.getItem('userId');
    
    // Skip initialization if no userId (the auth check useEffect will handle redirection)
    if (!userId) return;
    
    // Skip initialization if userId is invalid (let the auth check useEffect handle it)
    if (!isValidObjectId(userId)) return;
    
    const initializeData = async () => {
      try {
        setIsLoading(true);
        await fetchConversations(userId);
        initializeSocketConnection(userId);
      } catch (err) {
        console.log('Error initializing chat');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeSocketConnection = (userId) => {
    // Validate userId before proceeding
    if (!isValidObjectId(userId)) {
      console.log('Invalid userId for socket connection');
      return;
    }

    // Socket connection settings
    const socketUrl = 'http://localhost:5000';
    const userRole = localStorage.getItem('userRole');
    
    try {
      // Set up socket with simplified configuration
      socketRef.current = io(socketUrl, {
        reconnection: true,
        query: {
          userId,
          userRole
        },
        withCredentials: true
      });

      // Socket connection events - use minimal handlers
      socketRef.current.on('connect', () => {
        setSocketConnected(true);
        
        // Rejoin the current conversation room if there is one
        if (selectedConversation && selectedConversation._id) {
          socketRef.current.emit('joinConversation', selectedConversation._id);
        }
      });

      socketRef.current.on('disconnect', () => {
        setSocketConnected(false);
      });

      // Application events
      socketRef.current.on('newMessage', (message) => {
        if (!message || !message._id) {
          return;
        }
        
        // Add message to message list if it's for the currently selected conversation
        if (selectedConversation && message.conversationId === selectedConversation._id) {
          setMessages(prev => [...prev, message]);
          
          // If the message is for the current conversation, mark it as read
          markMessagesAsRead(message.conversationId);
        }
      });

      socketRef.current.on('userTyping', ({ userName, isTyping, conversationId }) => {
        // Only show typing indicator if it's in the current conversation
        if (selectedConversation && selectedConversation._id === conversationId) {
          setIsTyping(isTyping);
          setTypingUser(userName);
        }
      });

      socketRef.current.on('conversationUpdate', (updatedConversation) => {
        setConversations(prev => {
          // Check if the conversation exists
          const conversationExists = prev.some(conv => conv._id === updatedConversation._id);
          
          if (conversationExists) {
            // Update existing conversation
            return prev.map(conv => 
              conv._id === updatedConversation._id ? updatedConversation : conv
            );
          } else {
            // Add new conversation
            return [updatedConversation, ...prev];
          }
        });
      });

      socketRef.current.on('messageNotification', ({ conversationId, message }) => {
        // If this is not the currently selected conversation, increment unread count
        if (!selectedConversation || selectedConversation._id !== conversationId) {
          setConversations(prev => 
            prev.map(conv => 
              conv._id === conversationId 
                ? { ...conv, unread: (conv.unread || 0) + 1, lastMessage: message }
                : conv
            )
          );
        }
      });

      socketRef.current.on('userStatusChange', ({ userId, status }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (status === 'online') {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      });

      socketRef.current.emit('getOnlineUsers', (onlineUserIds) => {
        setOnlineUsers(new Set(onlineUserIds));
      });
    } catch (err) {
      console.log('Socket connection error');
    }
  };

  const fetchConversations = async (userId) => {
    try {
      if (!checkAuth()) {
        return [];
      }
      
      // Validate userId before using it
      if (!isValidObjectId(userId)) {
        console.log('Invalid userId format');
        return [];
      }
      
      // Get the token
      const token = localStorage.getItem('token');
      
      // Make a direct API call
      const response = await axios.get(`http://localhost:5000/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let conversationsData = [];
      
      if (Array.isArray(response.data)) {
        conversationsData = response.data;
      } else if (response.data?.data) {
        conversationsData = response.data.data;
      } else if (response.data?.conversations) {
        conversationsData = response.data.conversations;
      }

      const processedConversations = conversationsData
        .filter(conv => conv && conv._id) // Filter out invalid conversations
        .map(conv => {
          const otherUser = conv.participants?.find(p => 
            p && p._id && p._id !== userId
          );
          
          return {
            ...conv,
            _id: conv._id || conv.id,
            otherUser: otherUser || { name: 'Unknown User' },
            lastMessage: conv.lastMessage || { content: 'Start a conversation' },
            unread: conv.unread || 0
          };
        });

      setConversations(processedConversations);
      return processedConversations;
    } catch (err) {
      console.log('Error fetching conversations');
      return [];
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      if (!checkAuth()) {
        return;
      }
      
      // Validate conversation ID
      if (!conversationId || !isValidObjectId(conversationId)) {
        console.log('Invalid conversation ID');
        setMessages([]);
        return;
      }
      
      // Set loading state
      setIsLoading(true);
      setError(null);
      
      // Join the socket room for this conversation
      if (socketRef.current && socketRef.current.connected) {
        console.log('Joining conversation room:', conversationId);
        socketRef.current.emit('joinConversation', conversationId);
      }
      
      // Get the token
      const token = localStorage.getItem('token');
      
      // Simple direct API call with error handling
      const response = await axios.get(`http://localhost:5000/api/messages/conversation/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let messagesData = [];
      
      if (Array.isArray(response.data)) {
        messagesData = response.data;
      } else if (response.data?.messages) {
        messagesData = response.data.messages;
      } else if (response.data?.data) {
        messagesData = response.data.data;
      }

      // Validate and sanitize messages
      const validMessages = messagesData
        .filter(msg => msg && (msg._id || msg.id))
        .map(msg => ({
          _id: msg._id || msg.id,
          senderId: msg.senderId || msg.sender || '',
          content: msg.content || msg.text || '',
          createdAt: msg.createdAt || msg.timestamp || new Date().toISOString()
        }));

      setMessages(validMessages);
      
      // Mark messages as read
      markMessagesAsRead(conversationId);
    } catch (err) {
      console.log('Error fetching messages');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = (conversationId) => {
    if (!socketRef.current || !socketRef.current.connected) return;
    
    try {
      console.log('Marking messages as read for conversation:', conversationId);
      socketRef.current.emit('markAsRead', { conversationId });
      
      // Also update conversation list to reflect read status
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversationId 
            ? { ...conv, unread: 0 } 
            : conv
        )
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      if (!checkAuth()) {
        return;
      }
      
      setIsLoadingUsers(true);
      setUserSearchQuery('');
      setError(null);
      
      // Get the token
      const token = localStorage.getItem('token');
      
      console.log('Fetching users...');
      
      let response;
      let usersData = [];
      
      // Try multiple endpoints in sequence until one works
      const endpoints = [
        `http://localhost:5000/api/users/messaging`,  // Real messaging API
        `http://localhost:5000/api/users`,            // Regular users endpoint
        `http://localhost:5000/api/users/all`,        // From userMessageRoutes (mock data)
        `http://localhost:5000/api/message/users/all` // Another potential path
      ];
      
      let successfulEndpoint = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });
          successfulEndpoint = endpoint;
          console.log(`Success with endpoint: ${endpoint}`);
          break;
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed:`, error.message);
        }
      }
      
      if (!successfulEndpoint) {
        console.log('All endpoints failed, creating mock data');
        // Create mock data as a last resort
        response = { 
          data: [
            { _id: 'client1', name: 'John Client', email: 'john@example.com', role: 'client' },
            { _id: 'client2', name: 'Jane Client', email: 'jane@example.com', role: 'client' }
          ]
        };
      }
      
      if (Array.isArray(response.data)) {
        usersData = response.data;
        console.log('Response is an array with', usersData.length, 'users');
      } else if (response.data?.users) {
        usersData = response.data.users;
        console.log('Using users property with', usersData.length, 'users');
      } else if (response.data?.data) {
        usersData = response.data.data;
        console.log('Using data property with', usersData.length, 'users');
      } else {
        console.log('Unexpected API response format:', response.data);
      }

      const currentUserId = localStorage.getItem('userId');
      
      // Check for client role users in the data
      const clientUsers = usersData.filter(user => user.role === 'client');
      console.log('Total users:', usersData.length, 'Client users:', clientUsers.length);
      
      // Log a few users for debugging
      if (usersData.length > 0) {
        console.log('Sample user data:');
        usersData.slice(0, 3).forEach(user => {
          console.log(`User ${user._id} (${user.name}): role = ${user.role || 'undefined'}`);
        });
      }
      
      // Filter out the current user
      let filteredUsers = usersData.filter(user => user._id !== currentUserId);
      
      // Specifically filter for client role users only
      filteredUsers = filteredUsers.filter(user => user.role === 'client');
      
      // Map users with online status
      const usersWithStatus = filteredUsers.map(user => ({
        ...user,
        isOnline: onlineUsers.has(user._id)
      }));

      setAllUsers(usersWithStatus);
      
      // Log user count for debugging
      console.log(`Loaded ${usersWithStatus.length} client users`);
    } catch (err) {
      console.log('Error fetching users:', err);
      setAllUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const startNewConversation = async (otherUser) => {
    try {
      // Check authentication first
      if (!checkAuth()) {
        return;
      }
      
      // Show loading indicator
      setIsLoading(true);
      
      const currentUserId = localStorage.getItem('userId');
      
      // Immediately check if the current user ID is valid
      if (!isValidObjectId(currentUserId)) {
        console.error('Current user ID is invalid:', currentUserId);
        setError({
          message: 'Your user ID is in an invalid format. Please reset your account.',
          status: 'Authentication Error'
        });
        setShowIdFixBanner(true);
        return;
      }
      
      if (!otherUser || !otherUser._id) {
        setError({
          message: 'Invalid user selected',
          status: 400
        });
        return;
      }
      
      console.log('Starting conversation with:', otherUser);
      
      // Ensure we're using a clean string value for the ID
      const participantId = String(otherUser._id).trim();
      
      // Validate ObjectId format 
      if (!isValidObjectId(participantId)) {
        // If ID isn't valid, check if we can create a conversation with mock data
        console.log('ID validation failed, creating mock conversation');
        
        // Create a mock conversation with this user
        const mockConversationId = 'conv_' + Date.now();
        const mockConversation = {
          _id: mockConversationId,
          otherUser: otherUser,
          participants: [
            { _id: currentUserId },
            otherUser
          ],
          lastMessage: { content: 'Start a conversation' },
          createdAt: new Date().toISOString(),
          unread: 0
        };
        
        // Add to conversations list
        setConversations(prev => [mockConversation, ...prev]);
        
        // Select the new conversation
        setSelectedConversation(mockConversation);
        setShowNewChatModal(false);
        setMessages([]);
        setIsLoading(false);
        return;
      }
      
      // Get token for API request
      const token = localStorage.getItem('token');
      
      try {
        // Make direct axios call to ensure proper headers
        const response = await axios.post('http://localhost:5000/api/conversations', 
          { participantId }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Conversation created successfully:', response.data);
        handleNewConversationResponse(response, otherUser, currentUserId);
      } catch (err) {
        console.log('API request failed:', err.message);
        
        // Create a mock conversation if API fails
        const mockConversationId = 'conv_' + Date.now();
        const mockConversation = {
          _id: mockConversationId,
          otherUser: otherUser,
          participants: [
            { _id: currentUserId },
            otherUser
          ],
          lastMessage: { content: 'Start a conversation' },
          createdAt: new Date().toISOString(),
          unread: 0
        };
        
        // Add to conversations list
        setConversations(prev => [mockConversation, ...prev]);
        
        // Select the new conversation
        setSelectedConversation(mockConversation);
        setShowNewChatModal(false);
        setMessages([]);
      }
    } catch (err) {
      console.log('Error starting conversation:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to handle new conversation response
  const handleNewConversationResponse = (response, otherUser, currentUserId) => {
    if (!response || !response.data) {
      console.error('Invalid response from server:', response);
      setError({
        message: 'Received invalid response from server',
        status: 500
      });
      return;
    }
    
    // Extract conversation ID, handling different response formats
    const conversationId = response.data._id || response.data.id || response.data.conversationId;
    
    if (!conversationId) {
      console.error('No conversation ID in response:', response.data);
      setError({
        message: 'Could not retrieve conversation ID from server',
        status: 500
      });
      return;
    }
    
    // Create a consistent conversation object regardless of response format
    const newConversation = {
      _id: conversationId,
      otherUser,
      participants: response.data.participants || [
        { _id: currentUserId },
        otherUser
      ],
      lastMessage: response.data.lastMessage || { content: 'Start a conversation' },
      createdAt: response.data.createdAt || new Date().toISOString(),
      unread: 0 // Initialize with no unread messages
    };

    // Update the conversations list
    setConversations(prev => {
      // Check if conversation already exists in the list
      const exists = prev.some(conv => conv._id === conversationId);
      if (exists) {
        // If it exists, replace it
        return prev.map(conv => 
          conv._id === conversationId ? newConversation : conv
        );
      } else {
        // Otherwise add to the beginning
        return [newConversation, ...prev];
      }
    });
    
    // Select the new conversation
    setSelectedConversation(newConversation);
    setShowNewChatModal(false);
    setMessages([]);
    
    // Fetch messages for the new conversation
    try {
      fetchMessages(conversationId);
    } catch (msgErr) {
      console.error('Failed to fetch initial messages:', msgErr);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || 'You';
    
    // Check if this is a mock conversation (ID starting with 'conv_')
    const isMockConversation = selectedConversation._id.startsWith('conv_');
    
    // Create message object
    const messageData = {
      _id: `msg_${Date.now()}`,
      conversationId: selectedConversation._id,
      senderId: userId,
      content: newMessage,
      createdAt: new Date().toISOString()
    };
    
    try {
      if (isMockConversation) {
        console.log('Sending message in mock conversation');
        
        // Add message directly to the messages list
        setMessages(prev => [...prev, messageData]);
        
        // Update conversation with last message
        setConversations(prev => 
          prev.map(conv => 
            conv._id === selectedConversation._id 
              ? { 
                  ...conv, 
                  lastMessage: { 
                    content: newMessage,
                    createdAt: new Date().toISOString() 
                  } 
                } 
              : conv
          )
        );
        
        // Clear the message input
        setNewMessage('');
        
        // Scroll to bottom after sending
        setTimeout(() => scrollToBottom(), 100);
      } else {
        // For real conversations, use socket
        if (!socketRef.current || !socketRef.current.connected) {
          console.log('Socket not connected, adding message locally');
          
          // Add message to list anyway
          setMessages(prev => [...prev, messageData]);
          
          // Update conversation
          setConversations(prev => 
            prev.map(conv => 
              conv._id === selectedConversation._id 
                ? { 
                    ...conv, 
                    lastMessage: { 
                      content: newMessage,
                      createdAt: new Date().toISOString() 
                    } 
                  } 
                : conv
            )
          );
        } else {
          // Send through socket
          socketRef.current.emit('sendMessage', messageData);
          
          // Also directly add to messages for immediate display
          setMessages(prev => [...prev, messageData]);
        }
        
        // Reset typing state
        if (socketRef.current) {
          socketRef.current.emit('typing', {
            conversationId: selectedConversation._id,
            userName,
            isTyping: false
          });
        }
        
        // Clear the message input
        setNewMessage('');
      }
    } catch (err) {
      console.log('Error sending message:', err);
      
      // Still add the message to the UI even if the socket fails
      setMessages(prev => [...prev, messageData]);
    }
  };

  const handleTyping = () => {
    if (!selectedConversation) return;
    
    // Check if this is a mock conversation
    const isMockConversation = selectedConversation._id.startsWith('conv_');
    if (isMockConversation) {
      // Nothing to do for mock conversations
      return;
    }
    
    // Only emit typing for real conversations with active socket
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', {
        conversationId: selectedConversation._id,
        userName: localStorage.getItem('userName') || 'You',
        isTyping: true
      });

      setTimeout(() => {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('typing', {
            conversationId: selectedConversation._id,
            userName: localStorage.getItem('userName') || 'You',
            isTyping: false
          });
        }
      }, 2000);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!conv || !conv.participants) return false;
    
    const otherUser = conv.participants.find(p => 
      p && p._id && p._id !== localStorage.getItem('userId')
    );
    
    if (!otherUser) return false;
    
    // Safely access properties with optional chaining
    const userName = otherUser.name?.toLowerCase() || '';
    const messageContent = (conv.lastMessage?.content || '').toLowerCase();
    const searchQueryLower = searchQuery.toLowerCase();
    
    return !searchQuery || 
      userName.includes(searchQueryLower) ||
      messageContent.includes(searchQueryLower);
  });

  const filteredUsers = allUsers.filter(user => {
    if (!user) return false;
    
    // Safely access properties with optional chaining
    const userName = user.name?.toLowerCase() || '';
    const userEmail = user.email?.toLowerCase() || '';
    const userRole = user.role?.toLowerCase() || '';
    const searchQueryLower = userSearchQuery.toLowerCase();
    
    return !userSearchQuery ||
      userName.includes(searchQueryLower) ||
      userEmail.includes(searchQueryLower) ||
      userRole.includes(searchQueryLower);
  });

  // Add this function after the fetchAllUsers function
  const resetUserAuth = () => {
    console.log('Resetting user authentication...');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Modify the error component to include a reset option for specific errors
  const renderErrorMessage = () => {
    if (!error) return null;

    const isObjectIdError = 
      error.message && (
        error.message.includes('ObjectId') || 
        error.message.includes('ID format')
      );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 bg-red-50 text-red-600 rounded-lg mb-4"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{error.message}</p>
            {error.status && <p className="text-sm">Status: {error.status}</p>}
            
            {isObjectIdError && (
              <div className="mt-2">
                <p className="text-sm mb-1">This appears to be an issue with your user ID format.</p>
                <button
                  onClick={resetUserAuth}
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                  Reset Authentication
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <FiX />
          </button>
        </div>
      </motion.div>
    );
  };

  // Add a new function to retry connection
  const retryConnection = () => {
    console.log('Retrying connection...');
    
    // Reset socket if it exists
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    // Re-initialize data
    const userId = localStorage.getItem('userId');
    if (userId && isValidObjectId(userId)) {
      fetchConversations(userId);
      initializeSocketConnection(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-4">
      {/* Critical ID Fix Banner - Keep only this essential error */}
      {showIdFixBanner && (
        <div className="bg-red-600 text-white p-4 mb-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">USER ID ERROR</h3>
              <p className="mb-2">
                Please log out and sign in again to resolve this issue.
              </p>
            </div>
            <button
              onClick={forceResetUserData}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
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

      {renderErrorMessage()}

      {!socketConnected && (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="animate-pulse mr-2">🔴</div>
            <span>Not connected to chat server. Messages may not send or receive.</span>
          </div>
          <button
            onClick={retryConnection}
            className="ml-4 px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
          >
            Retry Connection
          </button>
        </div>
      )}

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
              {isLoading && (
                <div className="flex items-center justify-center mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                  <span className="text-xs text-blue-500">Loading conversations...</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoading && filteredConversations.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <FiMessageSquare className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500 mb-4">No conversations found</p>
                  <button
                    onClick={() => {
                      fetchAllUsers();
                      setShowNewChatModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Start a new chat
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredConversations.map(conv => (
                    <motion.div
                      key={conv._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?._id === conv._id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedConversation(conv);
                        // For mock conversations, just set selected without fetching
                        if (conv._id.startsWith('conv_')) {
                          // Set empty messages array for new mock conversations
                          if (!messages.length || messages[0].conversationId !== conv._id) {
                            setMessages([]);
                          }
                        } else {
                          // Fetch messages for real conversations
                          fetchMessages(conv._id);
                        }
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
                          <span 
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              onlineUsers.has(conv.otherUser?._id) ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className={`${conv.unread > 0 ? 'font-bold' : 'font-medium'} truncate`}>
                              {conv.otherUser?.name || 'Unknown User'}
                            </h3>
                            <div className="flex items-center">
                              {conv.unread > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">
                                  {conv.unread > 9 ? '9+' : conv.unread}
                                </span>
                              )}
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {conv.lastMessage?.createdAt ? 
                                  format(new Date(conv.lastMessage.createdAt), 'h:mm a') : ''}
                              </span>
                            </div>
                          </div>
                          <p className={`text-sm ${conv.unread > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'} truncate`}>
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
                      <span 
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          onlineUsers.has(selectedConversation.otherUser?._id) ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
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
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                      <FiPhone />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                      <FiVideo />
                    </button>
                    <button 
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                      onClick={() => setIsStarred(!isStarred)}
                    >
                      <FiStar className={isStarred ? 'text-yellow-400 fill-current' : ''} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        {isLoading ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                            <p>Loading messages...</p>
                          </div>
                        ) : error ? (
                          <div className="text-center">
                            <FiAlertCircle className="mx-auto mb-3 text-red-400" size={48} />
                            <div className="text-red-500 whitespace-pre-line">{error.message}</div>
                            <button
                              onClick={() => fetchMessages(selectedConversation._id)}
                              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Try Again
                            </button>
                          </div>
                        ) : (
                          <>
                            <FiMessageSquare className="mx-auto mb-3 text-gray-300" size={48} />
                            <p>No messages yet</p>
                            <p className="text-sm mt-1">Start the conversation!</p>
                          </>
                        )}
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
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <FiSmile />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    >
                      <FiPaperclip />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <p className="text-gray-500 mb-4">
                    Select a conversation from the list to start chatting
                  </p>
                  <button
                    onClick={() => {
                      fetchAllUsers();
                      setShowNewChatModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Start a new conversation
                  </button>
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
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-lg w-96 max-h-[80vh] flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">New Conversation</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={fetchAllUsers}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    title="Refresh client list"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowNewChatModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX />
                  </button>
                </div>
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
                <div className="text-xs text-gray-500 mt-2 flex items-center">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mr-2">client</span>
                  <span>Only client users are displayed for messaging</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {isLoadingUsers ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <FiUser className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No clients found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {userSearchQuery ? 'Try a different search' : 'There are no client users in the system yet'}
                    </p>
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
                            <span 
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <h3 className="font-medium truncate">{user.name || 'Unknown User'}</h3>
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                client
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{user.email || 'No email'}</p>
                            {user.company && (
                              <p className="text-xs text-gray-400 truncate">
                                <span className="font-medium">Company:</span> {user.company}
                              </p>
                            )}
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