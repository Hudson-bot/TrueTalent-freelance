import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMoreVertical, FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';
import TalentSidebar from './TalentSidebar';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { format } from 'date-fns';

const MessagesPage = () => {
  const location = useLocation();
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    role: '',
    profilePic: null
  });

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
      const token = localStorage.getItem('token');
      
      try {
        // Fetch user data
        const userResponse = await axios.get(`http://localhost:5000/api/personal-info/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userResponse.data);

        // Fetch conversations
        const conversationsResponse = await axios.get(`http://localhost:5000/api/conversations/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(conversationsResponse.data);

        // Initialize Socket.io connection
        socketRef.current = io('http://localhost:5000', {
          query: {
            userId,
            userRole: userResponse.data.role
          }
        });

        // If we have a conversationId in the navigation state, select that conversation
        if (location.state?.conversationId) {
          const conversation = conversationsResponse.data.find(
            conv => conv._id === location.state.conversationId
          );
          if (conversation) {
            setSelectedChat(conversation);
            fetchMessages(conversation._id);
          }
        }

        // Socket event listeners
        socketRef.current.on('newMessage', (message) => {
          setMessages(prev => [...prev, message]);
        });

        socketRef.current.on('userTyping', ({ userName, isTyping }) => {
          setIsTyping(isTyping);
          setTypingUser(userName);
        });

        socketRef.current.on('conversationUpdate', (updatedConversation) => {
          setConversations(prev => 
            prev.map(conv => 
              conv._id === updatedConversation._id ? updatedConversation : conv
            )
          );
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserData();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [location.state?.conversationId]);

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;

    const userId = localStorage.getItem('userId');
    try {
      const messageData = {
        conversationId: selectedChat._id,
        senderId: userId,
        content: messageInput,
        senderRole: userData.role
      };

      // Emit the message through socket
      socketRef.current.emit('sendMessage', messageData);

      setMessageInput('');
      // Stop typing indicator
      socketRef.current.emit('typing', {
        conversationId: selectedChat._id,
        userName: userData.name,
        isTyping: false
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (selectedChat) {
      socketRef.current.emit('typing', {
        conversationId: selectedChat._id,
        userName: userData.name,
        isTyping: true
      });

      // Clear typing indicator after delay
      setTimeout(() => {
        socketRef.current.emit('typing', {
          conversationId: selectedChat._id,
          userName: userData.name,
          isTyping: false
        });
      }, 2000);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <TalentSidebar activeTab="messages" />
      
      <div className="flex flex-1">
        {/* Chat list sidebar */}
        <div className="w-80 bg-white border-r border-gray-200">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-800 mb-4">Messages</h1>
            
            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Chat list */}
            <div className="space-y-2">
              {conversations.map((chat) => (
                <motion.div
                  key={chat._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedChat(chat);
                    fetchMessages(chat._id);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat?._id === chat._id
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <img 
                        src={chat.otherUser.profilePic || 'https://www.vectorstock.com/royalty-free-vector/guy-anime-avatar-vector-43916661'} 
                        alt={chat.otherUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {chat.otherUser.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-gray-800">{chat.otherUser.name}</h3>
                        <span className="text-xs text-gray-500">
                          {chat.lastMessage?.createdAt ? format(new Date(chat.lastMessage.createdAt), 'HH:mm') : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage?.content || 'Start a conversation'}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <img 
                        src={selectedChat.otherUser.profilePic || 'https://www.vectorstock.com/royalty-free-vector/guy-anime-avatar-vector-43916661'} 
                        alt={selectedChat.otherUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {selectedChat.otherUser.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <h2 className="font-medium text-gray-800">{selectedChat.otherUser.name}</h2>
                      <p className="text-xs text-gray-500">
                        {selectedChat.otherUser.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <FiMoreVertical />
                  </button>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col space-y-4">
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
                              ? 'bg-blue-500 text-white'
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

              {/* Message input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full">
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
                  <button type="button" className="p-2 hover:bg-gray-100 rounded-full">
                    <FiSmile />
                  </button>
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-medium text-gray-800 mb-2">Select a conversation</h2>
                <p className="text-gray-500">Choose a chat from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 