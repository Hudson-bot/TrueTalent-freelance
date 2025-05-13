import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiMoreVertical, FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';
import TalentSidebar from './TalentSidebar';

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  const chats = [
    {
      id: 1,
      name: 'John Smith',
      lastMessage: 'Thanks for your proposal!',
      time: '2m ago',
      unread: 2,
      avatar: '/path/to/avatar1.jpg',
      online: true,
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      lastMessage: 'When can we schedule a call?',
      time: '1h ago',
      unread: 0,
      avatar: '/path/to/avatar2.jpg',
      online: false,
    },
    // Add more mock chats as needed
  ];

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
              {chats.map((chat) => (
                <motion.div
                  key={chat.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat?.id === chat.id
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full">
                        {/* Avatar would go here */}
                      </div>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-gray-800">{chat.name}</h3>
                        <span className="text-xs text-gray-500">{chat.time}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0 && (
                      <div className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unread}
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
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      {selectedChat.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <h2 className="font-medium text-gray-800">{selectedChat.name}</h2>
                      <p className="text-xs text-gray-500">
                        {selectedChat.online ? 'Online' : 'Offline'}
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
                {/* Messages would go here */}
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs md:max-w-md">
                      <p className="text-gray-800">Hey, I saw your profile and I'm interested in your services.</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs md:max-w-md">
                      <p>Thanks for reaching out! I'd be happy to discuss your project.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <FiPaperclip />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <FiSmile />
                  </button>
                  <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                    <FiSend />
                  </button>
                </div>
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