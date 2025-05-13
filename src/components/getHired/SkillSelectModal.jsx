import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';

const defaultSkills = {
  Frontend: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Tailwind CSS', 'Vue.js', 'TypeScript'],
  Backend: ['Node.js', 'Express.js', 'Django', 'Flask', 'Ruby on Rails', 'Java (Spring Boot)', '.NET'],
  'Database & DevOps': ['MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Docker', 'AWS', 'Git/GitHub'],
  'Testing & Tools': ['Jest', 'Cypress', 'Playwright', 'Postman', 'Webpack', 'Vite'],
  'Other Cool Stuff': ['Python', 'C++', 'Figma', 'REST APIs', 'GraphQL', 'Machine Learning', 'UI/UX Design']
};

const SkillSelectModal = ({ onSave, onClose, existingSkills = [] }) => {
  const [selectedSkills, setSelectedSkills] = useState(existingSkills);
  const [customSkill, setCustomSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSelectedSkills(existingSkills);
  }, [existingSkills]);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  const removeSkill = (skill) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Update UI immediately for better user experience
      onSave(selectedSkills);
      onClose();
      
      // Then save to backend
      const id = localStorage.getItem('userId');
      await axios.patch(
        `http://localhost:5000/api/users/${id}/skills`,
        { skills: selectedSkills }
      );
    } catch (error) {
      console.error('Error updating skills:', error);
      // Since we've already closed the modal, we can't show the error there
      // But we log it for debugging purposes
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FiX className="text-gray-500" size={20} />
        </button>

        <div className="p-8">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent"
          >
            {existingSkills.length ? 'Edit Your Skills' : 'Choose Your Skills'}
          </motion.h2>

          {selectedSkills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Selected Skills ({selectedSkills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(skill => (
                  <motion.div
                    key={skill}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-blue-600 hover:text-blue-800">
                      <FiX size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
              placeholder="Add custom skill"
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
            />
            <button
              onClick={addCustomSkill}
              disabled={!customSkill.trim()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2">
            {Object.entries(defaultSkills).map(([category, skills]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <motion.button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected && <FiCheck size={16} />}
                        {skill}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6">
            {error && (
              <p className="text-red-500 text-center mb-4">{error}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={loading}
              className={`w-full py-3.5 ${
                loading 
                  ? 'bg-gray-400'
                  : 'bg-gradient-to-r from-blue-600 to-teal-500'
              } text-white rounded-xl font-medium`
              }
            >
              {loading ? 'Saving...' : existingSkills.length ? 'Update Skills' : 'Save & Continue'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SkillSelectModal;
