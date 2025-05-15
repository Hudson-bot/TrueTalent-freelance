import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMoreVertical, FiSend, FiPaperclip, FiSmile, FiUser, FiMessageSquare, FiX, FiPlus } from 'react-icons/fi';
import TalentSidebar from './TalentSidebar';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import socketService from '../../utils/socketService';

// Temporary function to generate random responses
const generateRandomResponse = (message) => {
  const lowercaseMessage = message.toLowerCase();
  
  // Check for question about rate/pricing
  if (lowercaseMessage.includes('rate') || lowercaseMessage.includes('cost') || 
      lowercaseMessage.includes('price') || lowercaseMessage.includes('charge')) {
    return "I'm happy to discuss your rates. For this kind of project, our budget is around $30-50 per hour. Does that work for you?";
  }
  
  // Check for question about timeline/deadline
  if (lowercaseMessage.includes('timeline') || lowercaseMessage.includes('deadline') || 
      lowercaseMessage.includes('when') || lowercaseMessage.includes('how long')) {
    return "We're hoping to complete this within 3-4 weeks. Is that timeline feasible for you?";
  }
  
  // Check for question about availability
  if (lowercaseMessage.includes('available') || lowercaseMessage.includes('schedule') || 
      lowercaseMessage.includes('start')) {
    return "Great! We're looking to get started next week. What's your availability like?";
  }
  
  // Check for skills/experience questions
  if (lowercaseMessage.includes('experience') || lowercaseMessage.includes('skill') || 
      lowercaseMessage.includes('portfolio')) {
    return "Your experience looks great! Do you have experience with similar projects in our industry?";
  }
  
  // Default responses
  const defaultResponses = [
    "That sounds great! Can you tell me more about your approach?",
    "Excellent. Looking forward to working with you on this.",
    "Thanks for the information. Do you have any questions about the project?",
    "Perfect. When can we schedule a call to discuss further?",
    "I appreciate your quick response. Let's move forward with this.",
    "This sounds promising. Can you start soon?",
    "Thank you for sharing that. Is there anything else you need from me?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

const MessagesPage = () => {
  const location = useLocation();
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  
  // Initialize user data for development mode if not present
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (!localStorage.getItem('userId')) {
        // Create a test user ID for development
        const testUserId = `user_${Date.now()}`;
        localStorage.setItem('userId', testUserId);
        
        // If token doesn't exist, create a dummy one
        if (!localStorage.getItem('token')) {
          localStorage.setItem('token', 'dev_token_123456');
        }
        
        console.log('Development mode: Created test user ID:', testUserId);
      }
    }
  }, []);
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    profilePic: null
  });
  const [allUsers, setAllUsers] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      try {
        // Fetch user data
        const userResponse = await axios.get(`http://localhost:5000/api/personal-info/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userResponse.data);
        
        // We'll only fetch users when needed (when the + button is clicked)
        // This improves performance by not loading unnecessary data on initial load

        // Fetch conversations
        let processedConversations = [];
        let conversationsLoaded = false;

        try {
          // Try to fetch real conversations
          const conversationsResponse = await axios.get(`http://localhost:5000/api/conversations`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Process conversations to ensure consistent format
          processedConversations = conversationsResponse.data.map(conv => {
            // Find the other user in the conversation
            const otherUser = conv.participants?.find(p => 
              p && p._id && p._id !== userId
            );
            
            return {
              ...conv,
              _id: conv._id || conv.id,
              otherUser: otherUser || { name: 'Unknown User', isOnline: false },
              lastMessage: conv.lastMessage || { content: 'Start a conversation' },
              unread: conv.unread || 0
            };
          });
          
          conversationsLoaded = processedConversations.length > 0;
        } catch (conversationError) {
          console.log('Error fetching conversations:', conversationError);
        }
        
        // If no conversations were loaded, set empty array
        if (!conversationsLoaded) {
          processedConversations = [];
        }
        
        setConversations(processedConversations);

        // Initialize Socket.io connection via shared service
        socketService.connect(userId, userResponse.data.role || 'freelancer');
        setSocketConnected(socketService.isSocketConnected());

        // Register socket event handlers
        socketService.on('newMessage', (message) => {
          if (selectedChat && message.conversationId === selectedChat._id) {
            setMessages(prev => [...prev, message]);
            
            // Mark messages as read
            socketService.markAsRead(message.conversationId);
          }
          
          // Update conversation with new message
          setConversations(prev => 
            prev.map(conv => 
              conv._id === message.conversationId 
                ? { 
                    ...conv, 
                    lastMessage: { 
                      content: message.content,
                      createdAt: message.createdAt
                    },
                    unread: selectedChat && selectedChat._id === message.conversationId ? 0 : (conv.unread || 0) + 1
                  } 
                : conv
            )
          );
        });

        socketService.on('userTyping', ({ userName, isTyping, conversationId }) => {
          if (selectedChat && selectedChat._id === conversationId) {
            setIsTyping(isTyping);
            setTypingUser(userName);
          }
        });

        socketService.on('conversationUpdate', (updatedConversation) => {
          setConversations(prev => {
            const exists = prev.some(conv => conv._id === updatedConversation._id);
            if (exists) {
              return prev.map(conv => 
                conv._id === updatedConversation._id ? updatedConversation : conv
              );
            } else {
              return [updatedConversation, ...prev];
            }
          });
        });

        // Handle user status changes
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
          
          // Update the online status in conversations list
          setConversations(prev => 
            prev.map(conv => 
              conv.otherUser?._id === changedUserId
                ? { ...conv, otherUser: { ...conv.otherUser, isOnline: status === 'online' } }
                : conv
            )
          );
        });
        
        // Handle initial online users list
        socketService.on('onlineUsers', (onlineUserIds) => {
          console.log('Received online users:', onlineUserIds);
          
          // Add current user to online users list (since we know we're online)
          const currentUserId = localStorage.getItem('userId');
          const updatedOnlineUsers = new Set([...onlineUserIds, currentUserId]);
          
          setOnlineUsers(updatedOnlineUsers);
          
          // Update conversations with online status
          setConversations(prev => 
            prev.map(conv => {
              const otherUserId = conv.otherUser?._id;
              if (otherUserId && updatedOnlineUsers.has(otherUserId)) {
                return { 
                  ...conv, 
                  otherUser: { ...conv.otherUser, isOnline: true } 
                };
              }
              return conv;
            })
          );
        });

        // If we have a conversationId in the navigation state, select that conversation
        if (location.state?.conversationId) {
          const conversation = processedConversations.find(
            conv => conv._id === location.state.conversationId
          );
          if (conversation) {
            setSelectedChat(conversation);
            fetchMessages(conversation._id);
          }
        }
      } catch (error) {
        console.log('Error fetching data:', error);
        setError('Failed to load conversations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    return () => {
      // Cleanup socket listeners
      socketService.off('newMessage');
      socketService.off('userTyping');
      socketService.off('conversationUpdate');
      socketService.off('userStatusChange');
      socketService.off('onlineUsers');
    };
  }, [location.state?.conversationId, selectedChat]);

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Join the socket room for this conversation
      socketService.joinConversation(conversationId);
      
      // Fetch messages from API
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/conversation/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Process messages to ensure consistent format
        let messagesData = [];
        
        if (Array.isArray(response.data)) {
          messagesData = response.data;
        } else if (response.data?.messages) {
          messagesData = response.data.messages;
        } else if (response.data?.data) {
          messagesData = response.data.data;
        }
        
        const processedMessages = messagesData
          .filter(msg => msg && (msg._id || msg.id))
          .map(msg => ({
            _id: msg._id || msg.id,
            senderId: msg.senderId || msg.sender || '',
            content: msg.content || msg.text || '',
            createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
            conversationId
          }));
          
        setMessages(processedMessages);
        
        // Mark messages as read
        socketService.markAsRead(conversationId);
          
        // Update conversation to remove unread count
        setConversations(prev => 
          prev.map(conv => 
            conv._id === conversationId 
              ? { ...conv, unread: 0 } 
              : conv
          )
        );
      } catch (apiError) {
        console.log('Error fetching messages from API:', apiError);
        setMessages([]);
        setError('Could not load messages. Please try again later.');
      }
    } catch (error) {
      console.log('Error in fetchMessages:', error);
      setError('Could not load messages. Please try again later.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;

    const userId = localStorage.getItem('userId');
    
    // Create message object with required fields
    const messageData = {
      _id: `msg_${Date.now()}`,
      conversationId: selectedChat._id,
      senderId: userId,
      senderName: userData.name || 'Freelancer',
      senderRole: 'freelancer',
      content: messageInput,
      createdAt: new Date().toISOString()
    };
    
    try {
      // Add message to UI immediately for better UX
      setMessages(prev => [...prev, messageData]);
      
      // Update conversation with last message
      setConversations(prev => 
        prev.map(conv => 
          conv._id === selectedChat._id 
            ? { 
                ...conv, 
                lastMessage: { 
                  content: messageInput,
                  createdAt: new Date().toISOString() 
                } 
              } 
            : conv
        )
      );
      
      // Reset message input
      setMessageInput('');
      
      // Send message via socket service if connected
      if (socketService.isSocketConnected()) {
        socketService.sendMessage(messageData);
        
        // Reset typing state
        socketService.typing({
          conversationId: selectedChat._id,
          userName: userData.name || 'Freelancer',
          isTyping: false
        });
      } else {
        // If socket not connected, try direct API call
        // The API expects a simpler structure with just conversationId and content
        try {
          await axios.post(`http://localhost:5000/api/messages`, {
            conversationId: selectedChat._id,
            content: messageInput
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
        } catch (err) {
          console.log('Error sending message via API:', err);
          setError('Failed to send message. Please try again.');
        }
      }
    } catch (err) {
      console.log('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleTyping = () => {
    if (!selectedChat) return;
    
    // Only emit typing for conversations with active socket
    if (socketService.isSocketConnected()) {
      socketService.typing({
        conversationId: selectedChat._id,
        userName: userData.name || 'Freelancer',
        isTyping: true
      });

      setTimeout(() => {
        if (socketService.isSocketConnected()) {
          socketService.typing({
            conversationId: selectedChat._id,
            userName: userData.name || 'Freelancer',
            isTyping: false
          });
        }
      }, 2000);
    }
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => {
    const otherUserName = conv.otherUser?.name?.toLowerCase() || '';
    const lastMessageContent = conv.lastMessage?.content?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return !query || otherUserName.includes(query) || lastMessageContent.includes(query);
  });

  const startNewConversation = async (selectedUser) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    console.log('Starting conversation with user:', selectedUser);
    
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => {
      const otherUserId = conv.otherUser?._id;
      return otherUserId === selectedUser._id;
    });
    
    if (existingConversation) {
      // If conversation exists, select it and fetch messages
      setSelectedChat(existingConversation);
      fetchMessages(existingConversation._id);
      setShowNewChatModal(false);
      return;
    }
    
    try {
      // Create new conversation through API
      const response = await axios.post(
        'http://localhost:5000/api/conversations',
        { participants: [userId, selectedUser._id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newConversation = response.data;
      console.log('New conversation created:', newConversation);
      
      // Ensure user has all required fields
      const processedUser = {
        _id: selectedUser._id,
        name: selectedUser.name || 'Unknown User',
        role: selectedUser.role || 'client',
        title: selectedUser.title || '',
        profilePic: selectedUser.profilePic || null,
        isOnline: selectedUser.isOnline || false
      };
      
      // Process the new conversation
      const processedConversation = {
        ...newConversation,
        _id: newConversation._id || newConversation.id,
        otherUser: processedUser,
        lastMessage: { content: 'Start a conversation' },
        unread: 0
      };
      
      // Add to conversations list
      setConversations(prev => [processedConversation, ...prev]);
      
      // Select the new conversation
      setSelectedChat(processedConversation);
      setMessages([]);
      
      // Join socket room
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('joinConversation', processedConversation._id);
      }
      
      setShowNewChatModal(false);
    } catch (error) {
      console.log('Error creating conversation:', error);
      
      // In development mode, create a dummy conversation
      if (process.env.NODE_ENV === 'development') {
        const dummyConversationId = `conv_${Date.now()}`;
        
        // Ensure user has all required fields
        const processedUser = {
          _id: selectedUser._id,
          name: selectedUser.name || 'Unknown User',
          role: selectedUser.role || 'client',
          title: selectedUser.title || '',
          profilePic: selectedUser.profilePic || null,
          isOnline: selectedUser.isOnline || false
        };
        
        const dummyConversation = {
          _id: dummyConversationId,
          otherUser: processedUser,
          lastMessage: { content: 'Start a conversation' },
          unread: 0,
          messages: [] // Initialize with empty messages array
        };
        
        // Add to conversations list
        setConversations(prev => [dummyConversation, ...prev]);
        
        // Select the new conversation
        setSelectedChat(dummyConversation);
        setMessages([]);
        setShowNewChatModal(false);
      } else {
        setError('Failed to create conversation. Please try again.');
      }
    }
  };
  
  // Filter users based on search query
  const filteredUsers = allUsers.filter(user => {
    const userName = user.name?.toLowerCase() || '';
    const query = userSearchQuery.toLowerCase();
    
    return !query || userName.includes(query);
  });

  // Function to fetch all users when plus button is clicked
  const fetchAllUsers = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    try {
      setIsLoading(true);
      
      // Fetch all users from the database
      const response = await axios.get('http://localhost:5000/api/users/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('All users response:', response.data);
      
      // Filter out current user
      const filteredUsers = Array.isArray(response.data) 
        ? response.data.filter(user => user && user._id !== userId)
        : [];
        
      setAllUsers(filteredUsers);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching all users:', error);
      setIsLoading(false);
      
      // Try alternative endpoint
      try {
        const altResponse = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter out current user
        const filteredUsers = Array.isArray(altResponse.data) 
          ? altResponse.data.filter(user => user && user._id !== userId)
          : [];
          
        setAllUsers(filteredUsers);
      } catch (altError) {
        console.error('Error fetching users from alternative endpoint:', altError);
        // Leave users empty
        setAllUsers([]);
      }
    }
  };
  
  // Handle plus button click
  const handleNewChatClick = () => {
    fetchAllUsers();
    setShowNewChatModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <TalentSidebar activeTab="messages" />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <TalentSidebar activeTab="messages" />
      
      <div className="flex flex-1">
        {/* Chat list sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-gray-800">Messages</h1>
              <button 
                onClick={handleNewChatClick}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                title="New conversation"
              >
                <FiPlus />
              </button>
            </div>
            
            {/* Search */}
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
                <p className="text-gray-500 mb-4">No conversations found</p>
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
                      selectedChat?._id === conv._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      setSelectedChat(conv);
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
                        <span 
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                            conv.otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
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
                        <p className="text-xs text-gray-500 -mt-0.5 mb-0.5 truncate">
                          {conv.otherUser?.title || conv.otherUser?.role || ''}
                        </p>
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
          {selectedChat ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="relative mr-3">
                    {selectedChat.otherUser?.profilePic ? (
                      <img
                        src={selectedChat.otherUser.profilePic}
                        alt={selectedChat.otherUser.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="text-gray-400" />
                      </div>
                    )}
                    <span 
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        selectedChat.otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {selectedChat.otherUser?.name || 'Unknown User'}
                    </h2>
                    <p className="text-sm text-gray-500 flex items-center">
                      <span className="mr-2">{selectedChat.otherUser?.title || ''}</span>
                      <span className={`inline-block w-2 h-2 rounded-full ${selectedChat.otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'} mr-1`}></span>
                      <span>{selectedChat.otherUser.isOnline ? 'Online' : 'Offline'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <FiMoreVertical />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <FiMessageSquare className="mx-auto mb-3 text-gray-300" size={48} />
                      <p>No messages yet</p>
                      <p className="text-sm mt-1">Start the conversation!</p>
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
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-full max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Conversation</h2>
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <FiX />
              </button>
            </div>
            
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {userSearchQuery ? 'No users found matching your search' : 'No users available'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <div 
                      key={user._id}
                      onClick={() => startNewConversation(user)}
                      className="p-3 flex items-center hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div className="relative mr-3">
                        {user.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt={user.name || 'User'}
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
                      <div>
                        <h3 className="font-medium text-gray-800">{user.name || 'Unknown User'}</h3>
                        <p className="text-sm text-gray-500">{user.title || user.email || user.role || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;  