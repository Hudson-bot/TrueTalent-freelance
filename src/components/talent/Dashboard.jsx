import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiBriefcase, FiMessageSquare, 
  FiTrendingUp, FiClock, FiCalendar, FiCheckCircle 
} from 'react-icons/fi';
import TalentSidebar from './TalentSidebar';
import { useLocation } from 'react-router-dom';

const TalentOverview = () => {
  const location = useLocation();

  // Get active tab from current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/talent/dashboard')) return 'dashboard';
    if (path.includes('/talent/browse')) return 'talents';
    if (path.includes('/talent/messages')) return 'messages';
    if (path.includes('/talent/community')) return 'community';
    if (path.includes('/favorites')) return 'favorites';
    if (path.includes('/saved')) return 'saved';
    return '';
  };

  // Recent talent interactions
  const recentActivities = [
    { id: 1, title: 'New application from John Doe', time: '2 hours ago', type: 'application' },
    { id: 2, title: 'Sarah Smith viewed your project', time: '5 hours ago', type: 'view' },
    { id: 3, title: 'Interview scheduled with Mike Brown', time: '1 day ago', type: 'interview' }
  ];

  // Active project postings
  const activeProjects = [
    { id: 1, title: 'Frontend Developer Needed', applications: 12, status: 'Active', postedDate: '2 days ago' },
    { id: 2, title: 'UI/UX Designer for Mobile App', applications: 8, status: 'Active', postedDate: '3 days ago' },
    { id: 3, title: 'React Native Developer', applications: 5, status: 'Draft', postedDate: 'Not posted' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <TalentSidebar activeTab={getActiveTab()} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Welcome back!</h1>
            <p className="text-gray-600">Here's an overview of your project postings and talent engagement</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Posted Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Projects</p>
                  <h3 className="text-2xl font-bold text-gray-800">4</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FiBriefcase className="text-blue-600 text-xl" />
                </div>
              </div>
              <p className="text-blue-600 text-sm mt-2 flex items-center">
                <FiTrendingUp className="mr-1" />
                2 new this week
              </p>
            </motion.div>

            {/* Total Applications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Applications</p>
                  <h3 className="text-2xl font-bold text-gray-800">25</h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FiUsers className="text-purple-600 text-xl" />
                </div>
              </div>
              <p className="text-purple-600 text-sm mt-2">8 new applications</p>
            </motion.div>

            {/* Messages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Unread Messages</p>
                  <h3 className="text-2xl font-bold text-gray-800">12</h3>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FiMessageSquare className="text-green-600 text-xl" />
                </div>
              </div>
              <p className="text-green-600 text-sm mt-2">3 new today</p>
            </motion.div>
          </div>

          {/* Recent Activity and Active Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <FiClock className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Projects */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Projects</h2>
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-full mr-3">
                      <FiBriefcase className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-800 font-medium">{project.title}</p>
                          <p className="text-sm text-gray-500">
                            {project.applications} applications • Posted {project.postedDate}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          project.status === 'Active' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentOverview; 