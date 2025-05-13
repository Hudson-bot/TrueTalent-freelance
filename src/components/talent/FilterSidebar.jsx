import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiStar } from 'react-icons/fi';

export const FilterSidebar = ({ filters, onFilterChange, onClose, isVisible }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  
  const handleChange = (category, value) => {
    const updatedFilters = { ...localFilters, [category]: value };
    setLocalFilters(updatedFilters);
  };
  
  const handleRangeChange = (category, key, value) => {
    const updatedRange = { ...localFilters[category], [key]: value };
    const updatedFilters = { ...localFilters, [category]: updatedRange };
    setLocalFilters(updatedFilters);
  };
  
  const applyFilters = () => {
    onFilterChange(localFilters);
    if (window.innerWidth < 768) onClose();
  };
  
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: isVisible ? 0 : -300, opacity: isVisible ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`bg-white shadow-lg p-4 fixed md:static top-0 left-0 h-full md:h-auto z-40 w-72 overflow-y-auto ${
        isVisible ? 'block' : 'hidden md:block'
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 md:hidden">
          <FiX size={20} />
        </button>
      </div>
      
      {/* Skills filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
        <div className="space-y-2">
          {['UI/UX Design', 'React', 'Node.js', 'JavaScript', 'Python', 'Content Writing', 'SEO'].map((skill) => (
            <label key={skill} className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.skills.includes(skill)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  handleChange(
                    'skills',
                    isChecked
                      ? [...localFilters.skills, skill]
                      : localFilters.skills.filter((s) => s !== skill)
                  );
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2 text-sm text-gray-600">{skill}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Hourly rate filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Hourly Rate: ${localFilters.hourlyRate.min} - ${localFilters.hourlyRate.max}
        </h3>
        <div className="space-y-4 px-1">
          <input
            type="range"
            min="5"
            max="200"
            value={localFilters.hourlyRate.min}
            onChange={(e) => handleRangeChange('hourlyRate', 'min', parseInt(e.target.value))}
            className="w-full"
          />
          <input
            type="range"
            min="5"
            max="200"
            value={localFilters.hourlyRate.max}
            onChange={(e) => handleRangeChange('hourlyRate', 'max', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Availability filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Availability</h3>
        <div className="space-y-2">
          {['Full-time', 'Part-time', 'Hourly', 'Weekends only'].map((option) => (
            <label key={option} className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.availability.includes(option)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  handleChange(
                    'availability',
                    isChecked
                      ? [...localFilters.availability, option]
                      : localFilters.availability.filter((a) => a !== option)
                  );
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2 text-sm text-gray-600">{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Experience filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Experience</h3>
        <div className="space-y-2">
          {['Entry level', 'Intermediate', 'Expert'].map((level) => (
            <label key={level} className="flex items-center">
              <input
                type="radio"
                name="experience"
                checked={localFilters.experience === level}
                onChange={() => handleChange('experience', level)}
                className="border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2 text-sm text-gray-600">{level}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Location filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
        <div className="space-y-2">
          {['Remote', 'United States', 'Europe', 'Asia', 'Worldwide'].map((location) => (
            <label key={location} className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.location.includes(location)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  handleChange(
                    'location',
                    isChecked
                      ? [...localFilters.location, location]
                      : localFilters.location.filter((l) => l !== location)
                  );
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2 text-sm text-gray-600">{location}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Rating filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h3>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleChange('minRating', star)}
              className={`p-1 ${
                localFilters.minRating >= star ? 'text-yellow-500' : 'text-gray-300'
              }`}
            >
              <FiStar fill={localFilters.minRating >= star ? 'currentColor' : 'none'} />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">{localFilters.minRating}+</span>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={applyFilters}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Apply Filters
        </button>
        <button
          onClick={() => {
            const defaultFilters = {
              skills: [],
              hourlyRate: { min: 5, max: 150 },
              availability: [],
              experience: '',
              location: [],
              minRating: 0
            };
            setLocalFilters(defaultFilters);
            onFilterChange(defaultFilters);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </motion.div>
  );
}; 