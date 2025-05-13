import React, { useState } from "react";
import { motion } from "framer-motion";
import PersonalInfoModal from "./PersonalInfoModal";

const ProfileSection = ({ formData, updateFormData, updateMultipleFields }) => {
  const [showModal, setShowModal] = useState(false);
  
  const handleEditClick = () => {
    setShowModal(true);
  };
  
  const handleSaveProfile = (updatedData) => {
    // Create an object with only the fields that have values
    const updates = {};
    if (updatedData.name) updates.name = updatedData.name;
    if (updatedData.title) updates.title = updatedData.title;
    if (updatedData.email) updates.email = updatedData.email;
    if (updatedData.bio) updates.bio = updatedData.bio;
    
    // Also update links if they're included
    if (updatedData.github) updates.github = updatedData.github;
    if (updatedData.linkedin) updates.linkedin = updatedData.linkedin;
    if (updatedData.resume) updates.resume = updatedData.resume;
    
    // Update all fields at once
    updateMultipleFields(updates);
    
    setShowModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Your Profile
        </h2>
        <p className="text-gray-500 mt-2">View and manage your personal information</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20"
      >
        <div className="p-8 space-y-6">
          {[
            { label: "Full Name", value: formData.name, icon: "👤" },
            { label: "Professional Title", value: formData.title, icon: "💼" },
            { label: "Email Address", value: formData.email, icon: "✉️" },
            { label: "Bio", value: formData.bio, icon: "📝", isMultiline: true }
          ].map((field, index) => (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-full text-indigo-600">
                <span className="text-xl">{field.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">{field.label}</p>
                {field.isMultiline ? (
                  <p className="mt-1 text-gray-800 whitespace-pre-line">
                    {field.value || <span className="text-gray-400">Not provided</span>}
                  </p>
                ) : (
                  <p className="mt-1 text-gray-800 truncate">
                    {field.value || <span className="text-gray-400">Not provided</span>}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEditClick}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Edit Profile
          </motion.button>
        </div>
      </motion.div>
      {/* Personal Info Modal */}
      {showModal && (
        <PersonalInfoModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveProfile}
          existingData={formData}
        />
      )}
    </div>
  );
};

export default ProfileSection;
