import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiX } from 'react-icons/fi';

const ClientInfoModal = ({ onSave, onClose, existingData = {} }) => {
  const [formData, setFormData] = useState({
    name: existingData.name || localStorage.getItem('userName') || '',
    email: existingData.email || localStorage.getItem('userEmail') || '',
    phone: existingData.phone || '',
    location: existingData.location || '',
    company: existingData.company || '',
    industry: existingData.industry || ''
  });

  // Update form data when specific existingData properties change
  useEffect(() => {
    if (existingData) {
      setFormData(prevData => ({
        ...prevData,
        name: existingData.name || prevData.name,
        email: existingData.email || prevData.email,
        phone: existingData.phone || prevData.phone,
        location: existingData.location || prevData.location,
        company: existingData.company || prevData.company,
        industry: existingData.industry || prevData.industry
      }));
    }
  }, [
    existingData.name,
    existingData.email,
    existingData.phone,
    existingData.location,
    existingData.company,
    existingData.industry
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSaving(true);

      // Log the form data being sent
      console.log('Sending client data to backend:', formData);

      // Save to backend first
      const response = await axios.post('http://localhost:5000/api/client-info', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Backend response:', response.data);

      // Only call onSave after successful save to backend
      onSave(formData);

      // Update localStorage with the new name if it changed
      if (formData.name !== localStorage.getItem('userName')) {
        localStorage.setItem('userName', formData.name);
      }

      setIsSaving(false);
    } catch (err) {
      console.error('Failed to save client info:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
      setIsSaving(false);

      // Return false to indicate failure
      return false;
    }

    // Return true to indicate success
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/30 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden border border-white/20 my-4"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FiX className="text-gray-500" size={20} />
        </button>
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {existingData.name ? 'Edit Your Client Profile' : 'Complete Your Client Profile'}
            </h2>
            <p className="text-gray-500 mt-1">Let's get you set up to hire freelancers</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {[
              { name: 'name', placeholder: 'Your Full Name', icon: '👤' },
              { name: 'email', placeholder: 'Email Address', icon: '✉️', disabled: true },
              { name: 'phone', placeholder: 'Phone Number', icon: '📱' },
              { name: 'location', placeholder: 'Your Location', icon: '📍' },
              { name: 'company', placeholder: 'Company Name (Optional)', icon: '🏢' },
              { name: 'industry', placeholder: 'Industry (Optional)', icon: '🔍' }
            ].map((field) => (
              <motion.div key={field.name} whileHover={{ x: field.disabled ? 0 : 2 }} className="flex items-center space-x-3">
                <span className="text-xl text-indigo-500">{field.icon}</span>
                <input
                  type={field.name === 'email' ? 'email' : field.name === 'phone' ? 'tel' : 'text'}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-all ${field.disabled
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200'
                      : 'bg-white/80 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    }`}
                />
              </motion.div>
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-center mb-3">{error}</p>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 rounded-lg font-medium shadow-md transition-all bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!formData.name || !formData.email || !formData.phone || isSaving}
              className={`flex-1 py-3 rounded-lg font-medium shadow-md transition-all ${!formData.name || !formData.email || !formData.phone || isSaving
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg'
                }`}
            >
              {isSaving ? 'Saving...' : existingData.name ? 'Save Changes' : 'Save & Continue'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ClientInfoModal;