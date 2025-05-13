import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import SkillSelectModal from './SkillSelectModal';

const SkillsSection = ({ formData, updateFormData, updateMultipleFields }) => {
  const [showModal, setShowModal] = useState(false);
  
  const handleEditClick = () => {
    setShowModal(true);
  };
  
  const handleSaveSkills = (skills) => {
    // Update skills in a single state update
    updateMultipleFields({ skills });
    setShowModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent"
        >
          Your Skills
        </motion.h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEditClick}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
        >
          <FiEdit2 size={18} />
          Edit Skills
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100"
      >
        {formData.skills && formData.skills.length > 0 ? (
          <div className="p-6 flex flex-wrap gap-3">
            {formData.skills.map(skill => (
              <motion.div
                key={skill}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            You haven't added any skills yet. Click "Edit Skills" to get started.
          </div>
        )}
      </motion.div>
      
      {/* Skill Select Modal */}
      {showModal && (
        <SkillSelectModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveSkills}
          existingSkills={formData.skills || []}
        />
      )}
    </div>
  );
};

export default SkillsSection;
