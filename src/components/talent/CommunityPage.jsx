import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiMessageCircle, FiHeart } from 'react-icons/fi';

const CommunityPage = () => {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Community</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center mb-4">
            <FiUsers className="text-blue-500 text-xl mr-2" />
            <h2 className="text-lg font-semibold text-gray-700">Active Members</h2>
          </div>
          <p className="text-3xl font-bold text-gray-800">5,234</p>
          <p className="text-sm text-gray-500 mt-1">+123 this week</p>
        </motion.div>

        {/* Discussions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center mb-4">
            <FiMessageCircle className="text-green-500 text-xl mr-2" />
            <h2 className="text-lg font-semibold text-gray-700">Active Discussions</h2>
          </div>
          <p className="text-3xl font-bold text-gray-800">1,892</p>
          <p className="text-sm text-gray-500 mt-1">+48 new topics today</p>
        </motion.div>

        {/* Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center mb-4">
            <FiHeart className="text-red-500 text-xl mr-2" />
            <h2 className="text-lg font-semibold text-gray-700">Total Engagements</h2>
          </div>
          <p className="text-3xl font-bold text-gray-800">25.4K</p>
          <p className="text-sm text-gray-500 mt-1">+2.1K this month</p>
        </motion.div>
      </div>

      {/* Recent Discussions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Discussions</h2>
        <div className="bg-white rounded-xl shadow-sm divide-y">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Best practices for remote collaboration</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Started by Alex Johnson • 2 hours ago • 15 replies
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                  Discussion
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Members */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Featured Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((member) => (
            <div key={member} className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-800">Sarah Parker</h3>
                  <p className="text-sm text-gray-500">Full Stack Developer</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">React</span>
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">Node.js</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">TypeScript</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage; 