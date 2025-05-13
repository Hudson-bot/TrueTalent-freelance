import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiShare2, FiX, FiCheck, FiPaperclip, FiList, FiUsers, FiLink, FiUserPlus, FiClock } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

// Project card component
const ProjectCard = ({ project, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(project)}
      className="bg-white rounded-xl shadow-md p-6 cursor-pointer border border-gray-100 hover:border-blue-200 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{project.title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          project.status === 'open' ? 'bg-green-100 text-green-800' :
          project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          project.status === 'completed' ? 'bg-purple-100 text-purple-800' :
          'bg-red-100 text-red-800'
        }`}>
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {project.requiredSkills.map((skill, index) => (
          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
            {skill}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <FiUsers className="mr-1" />
          <span>{project.proposals?.length || 0} proposals</span>
        </div>
        <div>
          <span>{project.currency} {project.minBudget}-{project.maxBudget}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Task item component
const TaskItem = ({ task, onToggleComplete, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm mb-2 border border-gray-100">
      <div className="flex items-center">
        <button 
          onClick={() => onToggleComplete(task._id)}
          className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
            task.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
          }`}
        >
          {task.completed && <FiCheck className="text-white text-xs" />}
        </button>
        <span className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
          {task.text}
        </span>
      </div>
      <button 
        onClick={() => onDelete(task._id)}
        className="text-gray-400 hover:text-red-500"
      >
        <FiX />
      </button>
    </div>
  );
};

// File item component
const FileItem = ({ file, onDelete }) => {
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎬';
    if (type.includes('pdf')) return '📄';
    if (type.includes('doc')) return '📝';
    return '📎';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm mb-2 border border-gray-100">
      <div className="flex items-center">
        <span className="mr-2 text-lg">{getFileIcon(file.type)}</span>
        <a 
          href={file.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline truncate max-w-[200px]"
        >
          {file.name}
        </a>
      </div>
      <button 
        onClick={() => onDelete(file._id)}
        className="text-gray-400 hover:text-red-500"
      >
        <FiX />
      </button>
    </div>
  );
};

// Proposal item component
const ProposalItem = ({ proposal }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm mb-3 border border-gray-100">
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
          {proposal.user.name ? proposal.user.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{proposal.user.name}</h4>
          <p className="text-sm text-gray-500">{proposal.user.title || 'Freelancer'}</p>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-3">{proposal.message}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          Bid: {proposal.bidAmount} {proposal.currency}
        </span>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
            Message
          </button>
          <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

// Share project modal
const ShareProjectModal = ({ project, onClose, onShare }) => {
  const [username, setUsername] = useState('');
  const [shareLink, setShareLink] = useState(project.shareLink || '');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [sharedUsers, setSharedUsers] = useState(project.sharedWith || []);
  
  const generateShareLink = async () => {
    setIsGeneratingLink(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/projects/${project._id}/share-link`);
      setShareLink(response.data.shareLink);
    } catch (error) {
      console.error('Error generating share link:', error);
    } finally {
      setIsGeneratingLink(false);
    }
  };
  
  const shareWithUser = async () => {
    if (!username.trim()) return;
    
    try {
      const response = await axios.post(`http://localhost:5000/api/projects/${project._id}/share`, {
        username
      });
      setSharedUsers([...sharedUsers, response.data.user]);
      setUsername('');
    } catch (error) {
      console.error('Error sharing project:', error);
      alert(error.response?.data?.message || 'Failed to share project');
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Share Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX />
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Share via Link</h3>
          <div className="flex items-center">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="No share link generated yet"
            />
            {shareLink ? (
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-lg hover:bg-gray-200"
              >
                Copy
              </button>
            ) : (
              <button
                onClick={generateShareLink}
                disabled={isGeneratingLink}
                className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isGeneratingLink ? 'Generating...' : 'Generate'}
              </button>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Invite by Username</h3>
          <div className="flex items-center">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
            <button
              onClick={shareWithUser}
              disabled={!username.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              Invite
            </button>
          </div>
        </div>
        
        {sharedUsers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Shared With</h3>
            <div className="max-h-40 overflow-y-auto">
              {sharedUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="text-sm text-gray-700">{user.name || user.username}</span>
                  </div>
                  <button className="text-gray-400 hover:text-red-500">
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Main HireDashboard component
const HireDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [showShareModal, setShowShareModal] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newFile, setNewFile] = useState(null);
  
  // Fetch user's projects
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          navigate('/');
          return;
        }
        
        const response = await axios.get(`http://localhost:5000/api/projects/user/${userId}`);
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [navigate]);
  
  // Handle project selection
  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setActiveTab('description');
  };
  
  // Handle adding a new task
  const handleAddTask = async () => {
    if (!newTask.trim() || !selectedProject) return;
    
    try {
      const response = await axios.post(`http://localhost:5000/api/projects/${selectedProject._id}/tasks`, {
        text: newTask,
        completed: false
      });
      
      // Update the selected project with the new task
      setSelectedProject({
        ...selectedProject,
        tasks: [...(selectedProject.tasks || []), response.data]
      });
      
      // Update the project in the projects list
      setProjects(projects.map(p => 
        p._id === selectedProject._id 
          ? { ...p, tasks: [...(p.tasks || []), response.data] }
          : p
      ));
      
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };
  
  // Handle toggling task completion
  const handleToggleTaskComplete = async (taskId) => {
    if (!selectedProject) return;
    
    try {
      const task = selectedProject.tasks.find(t => t._id === taskId);
      if (!task) return;
      
      const response = await axios.put(`http://localhost:5000/api/projects/${selectedProject._id}/tasks/${taskId}`, {
        completed: !task.completed
      });
      
      // Update the selected project with the updated task
      const updatedTasks = selectedProject.tasks.map(t => 
        t._id === taskId ? { ...t, completed: !t.completed } : t
      );
      
      setSelectedProject({
        ...selectedProject,
        tasks: updatedTasks
      });
      
      // Update the project in the projects list
      setProjects(projects.map(p => 
        p._id === selectedProject._id 
          ? { ...p, tasks: updatedTasks }
          : p
      ));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };
  
  // Handle deleting a task
  const handleDeleteTask = async (taskId) => {
    if (!selectedProject) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/projects/${selectedProject._id}/tasks/${taskId}`);
      
      // Update the selected project without the deleted task
      const updatedTasks = selectedProject.tasks.filter(t => t._id !== taskId);
      
      setSelectedProject({
        ...selectedProject,
        tasks: updatedTasks
      });
      
      // Update the project in the projects list
      setProjects(projects.map(p => 
        p._id === selectedProject._id 
          ? { ...p, tasks: updatedTasks }
          : p
      ));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedProject) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/projects/${selectedProject._id}/files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update the selected project with the new file
      setSelectedProject({
        ...selectedProject,
        files: [...(selectedProject.files || []), response.data]
      });
      
      // Update the project in the projects list
      setProjects(projects.map(p => 
        p._id === selectedProject._id 
          ? { ...p, files: [...(p.files || []), response.data] }
          : p
      ));
      
      setNewFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
  
  // Handle deleting a file
  const handleDeleteFile = async (fileId) => {
    if (!selectedProject) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/projects/${selectedProject._id}/files/${fileId}`);
      
      // Update the selected project without the deleted file
      const updatedFiles = selectedProject.files.filter(f => f._id !== fileId);
      
      setSelectedProject({
        ...selectedProject,
        files: updatedFiles
      });
      
      // Update the project in the projects list
      setProjects(projects.map(p => 
        p._id === selectedProject._id 
          ? { ...p, files: updatedFiles }
          : p
      ));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };
  
  // Handle closing bidding
  const handleCloseBidding = async () => {
    if (!selectedProject) return;
    
    try {
      const response = await axios.put(`http://localhost:5000/api/projects/${selectedProject._id}`, {
        ...selectedProject,
        status: 'in-progress'
      });
      
      // Update the selected project with the new status
      setSelectedProject({
        ...selectedProject,
        status: 'in-progress'
      });
      
      // Update the project in the projects list
      setProjects(projects.map(p => 
        p._id === selectedProject._id 
          ? { ...p, status: 'in-progress' }
          : p
      ));
    } catch (error) {
      console.error('Error closing bidding:', error);
    }
  };
  
  // Handle deleting a project
  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/projects/${selectedProject._id}`);
      
      // Remove the project from the projects list
      setProjects(projects.filter(p => p._id !== selectedProject._id));
      
      // Clear the selected project
      setSelectedProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };
  
  // Handle editing a project
  const handleEditProject = () => {
    if (!selectedProject) return;
    
    // Navigate to the post project page with the selected project ID
    navigate(`/post-project?edit=${selectedProject._id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar activeTab="hire" />
      
      <div className="flex-1 overflow-hidden flex">
        {/* Projects list */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
            <button
              onClick={() => navigate('/post-project')}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiPlus size={16} />
              New Project
            </button>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FiList size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4">Create your first project to get started</p>
              <button
                onClick={() => navigate('/post-project')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onSelect={handleSelectProject}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Project details */}
        <div className="w-2/3 overflow-y-auto">
          {selectedProject ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">{selectedProject.title}</h1>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiClock className="mr-1" />
                    <span>Posted {new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedProject.status === 'open' ? 'bg-green-100 text-green-800' :
                      selectedProject.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      selectedProject.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <FiShare2 size={16} />
                    Share
                  </button>
                  <button
                    onClick={handleEditProject}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <FiEdit size={16} />
                    Edit
                  </button>
                  {selectedProject.status === 'open' && (
                    <button
                      onClick={handleCloseBidding}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FiCheck size={16} />
                      Close Bidding
                    </button>
                  )}
                  <button
                    onClick={handleDeleteProject}
                    className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <FiTrash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'description'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('proposals')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'proposals'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Proposals ({selectedProject.proposals?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'files'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Files ({selectedProject.files?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'tasks'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Tasks ({selectedProject.tasks?.filter(t => t.completed).length || 0}/{selectedProject.tasks?.length || 0})
                  </button>
                </nav>
              </div>
              
              {/* Tab content */}
              <div className="pb-6">
                {activeTab === 'description' && (
                  <div>
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Description</h2>
                      <p className="text-gray-700 whitespace-pre-line">{selectedProject.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Details</h2>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Content Focus:</span>
                            <span className="text-gray-700 font-medium">{selectedProject.contentFocus || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Target Audience:</span>
                            <span className="text-gray-700 font-medium">{selectedProject.targetAudience || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Budget:</span>
                            <span className="text-gray-700 font-medium">
                              {selectedProject.currency} {selectedProject.minBudget}-{selectedProject.maxBudget}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Required Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.requiredSkills.map((skill, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'proposals' && (
                  <div>
                    {(selectedProject.proposals?.length || 0) === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <div className="text-gray-400 mb-4">
                          <FiUsers size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No proposals yet</h3>
                        <p className="text-gray-500">
                          Share your project to receive proposals from freelancers
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(selectedProject.proposals || []).map((proposal, index) => (
                          <ProposalItem key={index} proposal={proposal} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'files' && (
                  <div>
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Project Files</h2>
                        <label className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                          <FiPaperclip size={16} />
                          Add File
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </label>
                      </div>
                      
                      {(selectedProject.files?.length || 0) === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-4">
                            <FiPaperclip size={36} className="mx-auto" />
                          </div>
                          <p className="text-gray-500">
                            No files uploaded yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(selectedProject.files || []).map((file, index) => (
                            <FileItem
                              key={index}
                              file={file}
                              onDelete={handleDeleteFile}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {selectedProject.attachmentUrl && (
                      <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Original Attachment</h2>
                        {selectedProject.attachmentType?.startsWith('image/') ? (
                          <img
                            src={selectedProject.attachmentUrl}
                            alt="Project attachment"
                            className="max-w-full h-auto rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <FiPaperclip className="text-gray-500 mr-2" />
                            <a
                              href={selectedProject.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Original Attachment
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'tasks' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Tasks</h2>
                    
                    <div className="flex items-center mb-6">
                      <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                      />
                      <button
                        onClick={handleAddTask}
                        disabled={!newTask.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-blue-300"
                      >
                        Add
                      </button>
                    </div>
                    
                    {(selectedProject.tasks?.length || 0) === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-4">
                          <FiList size={36} className="mx-auto" />
                        </div>
                        <p className="text-gray-500">
                          No tasks added yet
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">
                            In Progress ({selectedProject.tasks?.filter(t => !t.completed).length || 0})
                          </h3>
                          <div className="space-y-2">
                            {(selectedProject.tasks || [])
                              .filter(task => !task.completed)
                              .map((task, index) => (
                                <TaskItem
                                  key={index}
                                  task={task}
                                  onToggleComplete={handleToggleTaskComplete}
                                  onDelete={handleDeleteTask}
                                />
                              ))}
                          </div>
                        </div>
                        
                        {(selectedProject.tasks || []).some(task => task.completed) && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">
                              Completed ({selectedProject.tasks?.filter(t => t.completed).length || 0})
                            </h3>
                            <div className="space-y-2">
                              {(selectedProject.tasks || [])
                                .filter(task => task.completed)
                                .map((task, index) => (
                                  <TaskItem
                                    key={index}
                                    task={task}
                                    onToggleComplete={handleToggleTaskComplete}
                                    onDelete={handleDeleteTask}
                                  />
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <FiList size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Select a project</h3>
                <p className="text-gray-500">
                  Choose a project from the list or create a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Share modal */}
      <AnimatePresence>
        {showShareModal && selectedProject && (
          <ShareProjectModal
            project={selectedProject}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HireDashboard;