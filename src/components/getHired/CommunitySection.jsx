import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import QuizGenerator from "./QuizGenerator";
import ProjectSlider from './ProjectSlider';

const CommunitySection = ({ personalInfo }) => {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/personal-info/${userId}`);
        if (response.data && response.data.name) {
          setUserName(response.data.name);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (!personalInfo?.name) {
      fetchUserData();
    } else {
      setUserName(personalInfo.name);
    }
  }, [personalInfo]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          {userName ? `Hey, ${userName}!` : "Welcome to the Community!"}
        </h2>
        <p className="text-gray-600 mt-2">Connect, share, and grow with fellow developers</p>
        {localStorage.getItem('quizScores') && (
          <div className="mt-3">
            <p className="text-lg font-semibold text-purple-600">
              Your Latest Score: {
                JSON.parse(localStorage.getItem('quizScores')).slice(-1)[0]?.average.toFixed(1) || 0
              }/10
            </p>
          </div>
        )}
      </motion.div>

      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 space-y-6 border border-white/20"
      >
        <div className="text-center">
          <p className="text-lg text-gray-700">
            🚀 Join discussions, showcase your work, and support others in the community.
          </p>
          <p className="text-md text-gray-500 mt-2">
            We’re excited to see what you'll bring!
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <motion.button
            onClick={() => navigate('/community')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition"
          >
            Explore Community
          </motion.button>
          <motion.button
            onClick={() => setIsTestModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition"
          >
            Take Test
          </motion.button>
        </div>
      </motion.div>

      <ProjectSlider />

      {isTestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-4 pb-4">
              <QuizGenerator
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitySection;
