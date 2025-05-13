// import React, { useState } from 'react';
// import { motion } from 'framer-motion';

// const ProjectSlider = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const projects = [
//     { name: "E-commerce Platform", type: "Web Development", cost: "$2000-$5000" },
//     { name: "Mobile App", type: "React Native", cost: "$3000-$7000" },
//     { name: "Portfolio Website", type: "Frontend", cost: "$1000-$2000" },
//     { name: "CMS Development", type: "Full Stack", cost: "$4000-$8000" },
//     { name: "API Integration", type: "Backend", cost: "$2500-$4500" },
//   ];

//   const nextSlide = () => {
//     setCurrentIndex((prev) => (prev + 1) % (projects.length - 2));
//   };

//   const prevSlide = () => {
//     setCurrentIndex((prev) => (prev - 1 + (projects.length - 2)) % (projects.length - 2));
//   };

//   return (
//     <div className="mt-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-white/20">
//       <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Featured Projects</h3>
//       <div className="relative overflow-hidden">
//         <motion.div
//           className="flex gap-6"
//           animate={{ x: `${-currentIndex * (288 + 24)}px` }} // 288px (w-72) + 24px (gap-6)
//           transition={{ type: "spring", stiffness: 300, damping: 30 }}
//           style={{ paddingLeft: '12px', paddingRight: '12px' }}
//         >
//           {projects.map((project, index) => (
//             <div
//               key={index}
//               className="flex-shrink-0 w-72 bg-white rounded-xl shadow-md overflow-hidden border border-purple-100"
//             >
//               <div className="p-6">
//                 <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.name}</h3>
//                 <p className="text-purple-600 font-medium mb-2">{project.type}</p>
//                 <p className="text-gray-600">{project.cost}</p>
//               </div>
//             </div>
//           ))}
//         </motion.div>
//         <button
//           onClick={prevSlide}
//           className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white/100 border border-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//           disabled={currentIndex === 0}
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//           </svg>
//         </button>
//         <button
//           onClick={nextSlide}
//           className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white/100 border border-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//           disabled={currentIndex === projects.length - 3}
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//           </svg>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProjectSlider;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCalendar, FiTag, FiTarget, FiUser, FiX, FiMessageSquare, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CommunityPage = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all projects
        const projectsResponse = await axios.get('http://localhost:5000/api/projects');

        // Fetch all users
        const usersResponse = await axios.get('http://localhost:5000/api/users/all');

        // Create a map of userId to user for quick lookup
        const userMap = {};
        usersResponse.data.forEach(user => {
          userMap[user.userId] = user;
        });

        setUsers(userMap);

        // Log all projects for debugging
        console.log('All projects:', projectsResponse.data);

        // Check if "ecomm" project exists
        const ecommProject = projectsResponse.data.find(project =>
          project.title.toLowerCase().includes('ecomm')
        );
        console.log('Ecomm project found:', ecommProject);

        // Show all projects without filtering by role
        setProjects(projectsResponse.data);

        // Log user roles for debugging
        console.log('User roles:');
        Object.entries(userMap).forEach(([userId, user]) => {
          console.log(`User ${userId} (${user.name}): role = ${user.role || 'undefined'}`);
        });
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle project card click
  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  // Close project detail view
  const closeProjectDetail = () => {
    setSelectedProject(null);
  };

  // Open contact modal
  const openContactModal = (e) => {
    e.stopPropagation();
    setShowContactModal(true);
    setMessageSent(false);
  };

  // Close contact modal
  const closeContactModal = (e) => {
    if (e) e.stopPropagation();
    setShowContactModal(false);
    setMessage('');
  };

  // Handle message change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      // In a real app, you would send the message to the backend
      // For now, we'll just simulate a successful message send
      console.log('Sending message to user:', users[selectedProject.userId]?.name);
      console.log('Message content:', message);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessageSent(true);
      setTimeout(() => {
        closeContactModal();
      }, 2000);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Developer Community
        </h1>
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No projects found from hiring users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        Developer Community
      </h1>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const user = users[project.userId] || {};

          return (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-white/20 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => handleProjectClick(project)}
            >
              {/* Project Header */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold line-clamp-2 mb-2">{project.title}</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <FiCalendar className="mr-1" />
                  <span>Posted {formatDate(project.createdAt)}</span>
                </div>
              </div>

              {/* Project Details */}
              <div className="p-6">
                <p className="text-gray-700 mb-4 line-clamp-3">{project.description}</p>

                {/* Project Metadata */}
                <div className="space-y-3">
                  {/* Budget */}
                  <div className="flex items-center text-gray-700">
                    <FiDollarSign className="mr-2 text-purple-500" />
                    <span>
                      {formatCurrency(project.minBudget, project.currency)} - {formatCurrency(project.maxBudget, project.currency)}
                    </span>
                  </div>

                  {/* Content Focus */}
                  {project.contentFocus && (
                    <div className="flex items-center text-gray-700">
                      <FiTag className="mr-2 text-purple-500" />
                      <span>{project.contentFocus}</span>
                    </div>
                  )}

                  {/* Target Audience */}
                  {project.targetAudience && (
                    <div className="flex items-center text-gray-700">
                      <FiTarget className="mr-2 text-purple-500" />
                      <span>{project.targetAudience}</span>
                    </div>
                  )}

                  {/* Posted By */}
                  <div className="flex items-center text-gray-700">
                    <FiUser className="mr-2 text-purple-500" />
                    <span>{user.name || 'Unknown User'}</span>
                  </div>
                </div>

                {/* Skills */}
                {project.requiredSkills && project.requiredSkills.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {project.requiredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="mt-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${project.status === 'open' ? 'bg-green-100 text-green-600' :
                      project.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                        project.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                          'bg-red-100 text-red-600'
                    }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeProjectDetail}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={closeProjectDetail}
            >
              <FiX size={20} />
            </button>

            {/* Project navigation */}
            <div className="flex justify-between p-4">
              <button
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  const currentIndex = projects.findIndex(p => p._id === selectedProject._id);
                  if (currentIndex > 0) {
                    setSelectedProject(projects[currentIndex - 1]);
                  }
                }}
                disabled={projects.findIndex(p => p._id === selectedProject._id) === 0}
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  const currentIndex = projects.findIndex(p => p._id === selectedProject._id);
                  if (currentIndex < projects.length - 1) {
                    setSelectedProject(projects[currentIndex + 1]);
                  }
                }}
                disabled={projects.findIndex(p => p._id === selectedProject._id) === projects.length - 1}
              >
                <FiChevronRight size={20} />
              </button>
            </div>

            <div className="p-6 pt-0">
              {/* Project Header */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedProject.title}</h2>
                <div className="flex items-center text-gray-600 mb-4">
                  <FiCalendar className="mr-2" />
                  <span>Posted {formatDate(selectedProject.createdAt)}</span>
                </div>

                {/* Status Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedProject.status === 'open' ? 'bg-green-100 text-green-600' :
                    selectedProject.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                      selectedProject.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                        'bg-red-100 text-red-600'
                  }`}>
                  {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                </span>
              </div>

              {/* Project Details */}
              <div className="py-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold mb-4">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{selectedProject.description}</p>
              </div>

              {/* Project Metadata */}
              <div className="py-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold mb-4">Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Budget */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Budget</h4>
                    <p className="text-gray-800 font-medium">
                      {formatCurrency(selectedProject.minBudget, selectedProject.currency)} - {formatCurrency(selectedProject.maxBudget, selectedProject.currency)}
                    </p>
                  </div>

                  {/* Content Focus */}
                  {selectedProject.contentFocus && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Content Focus</h4>
                      <p className="text-gray-800 font-medium">{selectedProject.contentFocus}</p>
                    </div>
                  )}

                  {/* Target Audience */}
                  {selectedProject.targetAudience && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Target Audience</h4>
                      <p className="text-gray-800 font-medium">{selectedProject.targetAudience}</p>
                    </div>
                  )}

                  {/* Posted By */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Posted By</h4>
                    <p className="text-gray-800 font-medium">{users[selectedProject.userId]?.name || 'Unknown User'}</p>
                  </div>
                </div>
              </div>

              {/* Required Skills */}
              {selectedProject.requiredSkills && selectedProject.requiredSkills.length > 0 && (
                <div className="py-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Button */}
              <div className="py-6">
                <button
                  onClick={openContactModal}
                  className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FiMessageSquare className="mr-2" />
                  Contact Project Owner
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Contact Modal */}
      {selectedProject && showContactModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeContactModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                Contact {users[selectedProject.userId]?.name || 'Project Owner'}
              </h3>

              {messageSent ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700 mb-2">Message sent successfully!</p>
                  <p className="text-gray-500 text-sm">We'll notify you when they respond.</p>
                </div>
              ) : (
                <form onSubmit={sendMessage}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="5"
                      placeholder="Introduce yourself and explain why you're interested in this project..."
                      value={message}
                      onChange={handleMessageChange}
                      required
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeContactModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      disabled={!message.trim()}
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CommunityPage;