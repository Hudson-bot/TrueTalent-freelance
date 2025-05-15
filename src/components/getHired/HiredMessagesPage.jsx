import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMoreVertical, FiSend, FiPaperclip, FiSmile, FiUser, FiMessageSquare, FiX, FiClock, FiDollarSign, FiInfo } from 'react-icons/fi';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import createHiredConversations, { getHiredResponse } from '../../utils/hiredDummyData';

const HiredMessagesPage = () => {
  const location = useLocation();
  const messagesEndRef = useRef(null);
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    name: 'You (Freelancer)',
    role: 'freelancer',
    _id: localStorage.getItem('userId') || 'freelancer_user'
  });
  
  // Status colors for project badges
  const statusColors = {
    just_started: 'bg-purple-100 text-purple-800',
    in_progress: 'bg-blue-100 text-blue-800',
    near_completion: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    on_hold: 'bg-yellow-100 text-yellow-800'
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadDummyData = () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        setTimeout(() => {
          const userId = localStorage.getItem('userId') || 'freelancer_user';
          const dummyConversations = createHiredConversations(userId);
          setConversations(dummyConversations);
          
          // If we have a conversation in the location state, select it
          if (location.state?.conversationId) {
            const conversation = dummyConversations.find(
              conv => conv._id === location.state.conversationId
            );
            if (conversation) {
              setSelectedChat(conversation);
              setMessages(conversation.messages);
            }
          }
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading dummy data:', error);
        setError('Failed to load conversations');
        setIsLoading(false);
      }
    };
    
    loadDummyData();
  }, [location.state?.conversationId]);

  const fetchMessages = (conversationId) => {
    try {
      // Find the conversation in our existing conversations
      const foundConversation = conversations.find(conv => conv._id === conversationId);
      if (foundConversation && foundConversation.messages) {
        // Use the messages already in the conversation object
        setMessages(foundConversation.messages);
        
        // Mark as read by updating the conversation
        setConversations(prev => 
          prev.map(conv => 
            conv._id === conversationId 
              ? { ...conv, unread: 0 } 
              : conv
          )
        );
      } else {
        setError('Could not find messages for this conversation');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Could not load messages');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;

    const userId = localStorage.getItem('userId') || 'freelancer_user';
    
    // Create message object for freelancer (user)
    const messageData = {
      _id: `msg_${Date.now()}`,
      conversationId: selectedChat._id,
      senderId: userId,
      senderName: userData.name,
      senderRole: 'freelancer',
      content: messageInput,
      createdAt: new Date().toISOString(),
      read: true
    };
    
    try {
      // Add message to UI immediately
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
      
      // Simulate client response after a delay
      setTimeout(() => {
        // Show typing indicator
        setIsTyping(true);
        setTypingUser(selectedChat.otherUser.name);
        
        // Create response message after a typing delay
        setTimeout(() => {
          const responseMessage = {
            _id: `msg_response_${Date.now()}`,
            conversationId: selectedChat._id,
            senderId: selectedChat.otherUser._id,
            senderName: selectedChat.otherUser.name,
            senderRole: 'client',
            content: getHiredResponse(messageInput, selectedChat.projectTitle),
            createdAt: new Date().toISOString(),
            read: false
          };
          
          // Hide typing indicator
          setIsTyping(false);
          
          // Add response to UI
          setMessages(prev => [...prev, responseMessage]);
          
          // Update conversation
          setConversations(prev => 
            prev.map(conv => 
              conv._id === selectedChat._id 
                ? { 
                    ...conv, 
                    lastMessage: { 
                      content: responseMessage.content,
                      createdAt: responseMessage.createdAt 
                    },
                    unread: 1
                  } 
                : conv
            )
          );
        }, 3000); // Typing for 3 seconds
      }, 2000 + Math.random() * 3000); // Start typing after 2-5 seconds
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleTyping = () => {
    // Simulate typing for UI purposes only
    console.log('User is typing...');
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => {
    const clientName = conv.otherUser?.name?.toLowerCase() || '';
    const projectTitle = conv.projectTitle?.toLowerCase() || '';
    const lastMessageContent = conv.lastMessage?.content?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return !query || 
           clientName.includes(query) || 
           projectTitle.includes(query) || 
           lastMessageContent.includes(query);
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Project Messages</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 flex justify-between items-center">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="text-red-600 hover:text-red-800"
          >
            <FiX />
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations sidebar */}
          <div className="w-96 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects or messages..."
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
                  <p className="text-gray-500 mb-4">No projects found</p>
                  <p className="text-sm text-gray-400">Projects you're hired for will appear here</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredConversations.map(conv => (
                    <motion.div
                      key={conv._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat?._id === conv._id ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setSelectedChat(conv);
                        fetchMessages(conv._id);
                      }}
                    >
                      <div className="flex items-start">
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
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${conv.otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Project title */}
                          <div className="font-medium mb-1 flex items-center">
                            <h3 className="truncate text-gray-900">
                              {conv.projectTitle}
                            </h3>
                          </div>
                          
                          {/* Client name and project status */}
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs text-gray-600">
                              {conv.otherUser.name}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[conv.projectStatus] || 'bg-gray-100'}`}>
                              {conv.projectStatus.replace('_', ' ')}
                            </span>
                          </div>
                          
                          {/* Last message */}
                          <p className={`text-sm ${conv.unread > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'} truncate`}>
                            {conv.lastMessage?.content || 'No messages yet'}
                          </p>
                          
                          {/* Message time and unread indicator */}
                          <div className="flex justify-between items-center mt-1">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <FiClock className="w-3 h-3" />
                              <span>{format(new Date(conv.projectDeadline), 'MMM d')}</span>
                            </div>
                            
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
                {/* Chat header with project info */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-bold text-lg text-gray-900">
                        {selectedChat.projectTitle}
                      </h2>
                      <div className="flex items-center mt-1">
                        <span className={`mr-3 text-xs px-2 py-1 rounded-full ${statusColors[selectedChat.projectStatus] || 'bg-gray-100'}`}>
                          {selectedChat.projectStatus.replace('_', ' ')}
                        </span>
                        <div className="flex items-center text-sm text-gray-600 mr-3">
                          <FiClock className="mr-1" />
                          <span>Due: {format(new Date(selectedChat.projectDeadline), 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiDollarSign className="mr-1" />
                          <span>{selectedChat.projectBudget}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 flex items-center">
                        {selectedChat.otherUser?.profilePic ? (
                          <img
                            src={selectedChat.otherUser.profilePic}
                            alt={selectedChat.otherUser.name}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 mr-2"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <FiUser className="text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm font-medium">{selectedChat.otherUser.name}</span>
                        <span 
                          className={`ml-2 w-2 h-2 rounded-full ${selectedChat.otherUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                        />
                      </div>
                      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <FiMoreVertical />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <FiMessageSquare className="mx-auto mb-3 text-gray-300" size={48} />
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Start the conversation about this project!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.senderId === userData._id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] p-3 rounded-lg ${
                          msg.senderId === userData._id
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
                      placeholder="Type a message about this project..."
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
                    Select a project from the list to view messages
                  </p>
                  <div className="rounded-lg bg-blue-50 p-4 max-w-md mx-auto">
                    <div className="flex items-start">
                      <FiInfo className="mt-0.5 mr-3 text-blue-500" />
                      <div>
                        <h3 className="font-medium text-blue-700 mb-1">Project Messages</h3>
                        <p className="text-sm text-blue-600">This area contains messages specific to projects you've been hired for. Discuss details, timelines, and deliverables with your clients here.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiredMessagesPage; 