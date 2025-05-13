import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiFileText, FiEdit } from 'react-icons/fi';
import LinkInfoModal from './LinkInfoModal';

const LinksSection = ({ formData, updateFormData, updateMultipleFields }) => {
  const [showModal, setShowModal] = useState(false);
  const userId = localStorage.getItem('userId');
  
  const handleEditClick = () => {
    setShowModal(true);
  };
  
  const handleSaveLinks = (links) => {
    // Update all links at once
    updateMultipleFields({
      github: links.github || '',
      linkedin: links.linkedin || '',
      resume: links.resume || ''
    });
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
          Your Professional Links
        </motion.h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100"
      >
        <div className="p-8 space-y-6">
          {[
            {
              name: 'github',
              value: formData.github,
              label: 'GitHub Profile',
              icon: <FiGithub className="text-gray-700" />,
              placeholder: 'Not provided'
            },
            {
              name: 'linkedin',
              value: formData.linkedin,
              label: 'LinkedIn Profile',
              icon: <FiLinkedin className="text-blue-600" />,
              placeholder: 'Not provided'
            },
            {
              name: 'resume',
              value: formData.resume,
              label: 'Resume/CV',
              icon: <FiFileText className="text-gray-600" />,
              placeholder: 'Not provided'
            }
          ].map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {field.icon}
                </div>
                {field.value ? (
                  <a
                    href={field.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-blue-600 hover:underline truncate"
                  >
                    {field.value}
                  </a>
                ) : (
                  <div className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-400">
                    {field.placeholder}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEditClick}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2 justify-center"
          >
            <FiEdit size={18} />
            Edit Links
          </motion.button>
        </div>
      </motion.div>
      
      {/* Link Info Modal */}
      {showModal && (
        <LinkInfoModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveLinks}
          existingLinks={{
            github: formData.github || '',
            linkedin: formData.linkedin || '',
            resume: formData.resume || ''
          }}
          userId={userId}
        />
      )}
    </div>
  );
};

export default LinksSection;
