import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiFileText, FiX } from 'react-icons/fi';
import axios from 'axios';

const LinkInfoModal = ({ onSave, existingLinks, onClose, userId }) => {
  const [links, setLinks] = useState({
    github: '',
    linkedin: '',
    resume: ''
  });
  const [isValid, setIsValid] = useState({
    github: false,
    linkedin: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingLinks) {
      setLinks({
        github: existingLinks.github || '',
        linkedin: existingLinks.linkedin || '',
        resume: existingLinks.resume || ''
      });
      validateLinks({
        github: existingLinks.github || '',
        linkedin: existingLinks.linkedin || '',
        resume: existingLinks.resume || ''
      });
    }
  }, [existingLinks]);

  const validateLinks = (updated) => {
    setIsValid({
      github: !updated.github || updated.github.startsWith('https://github.com/'),
      linkedin: !updated.linkedin || updated.linkedin.startsWith('https://linkedin.com/in/')
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...links, [name]: value };
    setLinks(updated);
    validateLinks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid.github || !isValid.linkedin) {
      setError('Please provide valid URLs for GitHub and LinkedIn');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the onSave callback provided by the parent component
      // This ensures we use the correct endpoint
      await onSave({
        github: links.github,
        linkedin: links.linkedin,
        resume: links.resume
      });
      
      // onClose will be called by the parent component after onSave succeeds
    } catch (error) {
      console.error('Failed to save links:', error);
      setError(
        error.response?.data?.message ||
        'Failed to save links. Please try again.'
      );
      setLoading(false);
    }
  };


  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl relative border border-gray-100"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100">
          <FiX className="text-gray-500" size={20} />
        </button>

        <div className="p-8">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent text-center mb-4"
          >
            {existingLinks ? 'Update Your Links' : 'Add Social Links'}
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              {
                name: 'github',
                placeholder: 'https://github.com/username',
                icon: <FiGithub />,
                error: !isValid.github && links.github ? 'Must start with https://github.com/' : null
              },
              {
                name: 'linkedin',
                placeholder: 'https://linkedin.com/in/username',
                icon: <FiLinkedin className="text-blue-600" />,
                error: !isValid.linkedin && links.linkedin ? 'Must start with https://linkedin.com/in/' : null
              },
              {
                name: 'resume',
                placeholder: 'Google Drive or other resume URL',
                icon: <FiFileText className="text-gray-600" />
              }
            ].map((field) => (
              <div key={field.name} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {field.icon}
                </div>
                <input
                  name={field.name}
                  type="url"
                  value={links[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${field.error ? 'border-red-300' : 'border-gray-200'
                    } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required={field.name !== 'resume'}
                />
                {field.error && (
                  <p className="mt-1 text-sm text-red-500">{field.error}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={!isValid.github || !isValid.linkedin || loading}
              className={`w-full py-3.5 rounded-xl font-medium transition-all ${!isValid.github || !isValid.linkedin || loading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:shadow-md'
                }`}
            >
              {loading ? 'Saving...' : 'Save Links'}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-center text-red-500">{error}</p>
              {error.includes('check the URLs') && (
                <p className="text-center text-sm text-red-400 mt-1">
                  Example formats:<br />
                  GitHub: https://github.com/username<br />
                  LinkedIn: https://linkedin.com/in/username
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LinkInfoModal;