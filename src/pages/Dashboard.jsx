import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ProfileSection from '../components/ProfileSection';
import LinksSection from '../components/LinksSection';
import SkillsSection from '../components/SkillsSection';
import CommunitySection from '../components/CommunitySection';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // Start with profile tab
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    github: '',
    linkedin: '',
    resume: '',
    skills: [],
    profilePic: null
  });

  // Function to fetch links data
  const fetchLinks = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/users/social/${userId}`);
      if (response.data) {
        // Update only the links-related fields in formData
        setFormData(prevData => ({
          ...prevData,
          github: response.data.github || '',
          linkedin: response.data.linkedin || '',
          resume: response.data.resume || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching links data:', error);
    }
  };

  // Function to fetch skills data
  const fetchSkills = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/${userId}/skills`);
      if (response.data && response.data.skills) {
        // Update only the skills field in formData
        setFormData(prevData => ({
          ...prevData,
          skills: response.data.skills || []
        }));
      }
    } catch (error) {
      console.error('Error fetching skills data:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setIsLoading(false);
        navigate('/personal');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/personal-info/${userId}`);
        if (response.data) {
          setFormData(response.data);
          setShowWelcomeModal(false);
        } else {
          navigate('/personal');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 404) {
          navigate('/personal');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  
  // Function to update multiple fields at once
  const updateMultipleFields = (updates) => {
    setFormData(prevData => ({
      ...prevData,
      ...updates
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      updateFormData('profilePic', URL.createObjectURL(e.target.files[0]));
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('profileCompleted', 'true');
    setShowWelcomeModal(false);
    setActiveTab('community'); // Switch to community after completion
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcomeModal && (
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
              <h2 className="text-2xl font-bold mb-4">Welcome! Let's get started</h2>
              <p className="mb-6 text-gray-600">
                Please complete your profile information and select your skills to continue.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={completeOnboarding}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userData={formData}
        handleFileChange={handleFileChange}
        fetchLinks={fetchLinks}
        fetchSkills={fetchSkills}
      />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              <ProfileSection 
                formData={formData} 
                updateFormData={updateFormData}
                updateMultipleFields={updateMultipleFields}
              />
            </motion.div>
          )}

          {activeTab === 'links' && (
            <motion.div
              key="links"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              <LinksSection 
                formData={formData} 
                updateFormData={updateFormData}
                updateMultipleFields={updateMultipleFields}
              />
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              <SkillsSection 
                formData={formData} 
                updateFormData={updateFormData}
                updateMultipleFields={updateMultipleFields}
                onComplete={completeOnboarding}
              />
            </motion.div>
          )}

          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              <CommunitySection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;