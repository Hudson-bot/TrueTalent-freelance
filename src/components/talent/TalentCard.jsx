import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiHeart, FiBookmark, FiChevronDown, FiChevronUp,
  FiMapPin, FiDollarSign, FiClock, FiStar, FiMessageSquare
} from 'react-icons/fi';

export const TalentCard = ({ talent, view, onToggleFavorite, onToggleSaved, onSendMessage }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Calculate match percentage based on skills match
  const matchPercentage = talent.matchPercentage || Math.floor(Math.random() * 30) + 70;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-xl shadow-md border border-gray-100 hover:border-blue-200 transition-all ${
        view === 'grid' ? 'p-4' : 'p-6'
      }`}
    >
      <div className={`flex ${view === 'grid' ? 'flex-col' : 'flex-row gap-6'}`}>
        {/* Profile image and match score */}
        <div className={`${view === 'grid' ? 'mb-4 text-center' : 'w-1/5'}`}>
          <div className="relative inline-block">
            <img 
              src={talent.profilePic || "/api/placeholder/160/160"} 
              alt={talent.name}
              className={`rounded-full object-cover border-2 border-gray-100 ${
                view === 'grid' ? 'w-20 h-20 mx-auto' : 'w-24 h-24'
              }`}
            />
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
              {matchPercentage}%
            </div>
          </div>
          
          {view === 'grid' && (
            <h3 className="font-semibold text-gray-800 mt-2 text-center">{talent.name}</h3>
          )}
          
          {view === 'grid' && (
            <p className="text-sm text-gray-500 text-center">{talent.title}</p>
          )}
        </div>

        {/* Main talent info */}
        <div className={view === 'grid' ? '' : 'flex-1'}>
          {view === 'list' && (
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{talent.name}</h3>
                <p className="text-gray-600">{talent.title}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(talent._id);
                  }}
                  className={`p-2 rounded-full ${talent.isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <FiHeart />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSaved(talent._id);
                  }}
                  className={`p-2 rounded-full ${talent.isSaved ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <FiBookmark />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {talent.skills.slice(0, view === 'grid' ? 3 : 5).map((skill, index) => (
              <span key={index} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs">
                {skill}
              </span>
            ))}
            {talent.skills.length > (view === 'grid' ? 3 : 5) && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                +{talent.skills.length - (view === 'grid' ? 3 : 5)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <FiMapPin className="mr-1" />
              <span>{talent.location}</span>
            </div>
            <div className="flex items-center">
              <FiDollarSign className="mr-1" />
              <span>{talent.hourlyRate}/hr</span>
            </div>
            <div className="flex items-center">
              <FiClock className="mr-1" />
              <span>{talent.availability}</span>
            </div>
            <div className="flex items-center">
              <FiStar className="mr-1 text-yellow-500" />
              <span>{talent.rating} ({talent.totalReviews} reviews)</span>
            </div>
          </div>
          
          {view === 'list' && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{talent.bio}</p>
          )}

          {/* Action buttons */}
          <div className={`flex ${view === 'grid' ? 'flex-col space-y-2' : 'space-x-3'} mt-2`}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSendMessage(talent._id);
              }}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm w-full"
            >
              <FiMessageSquare size={16} />
              <span>Message</span>
            </button>
            
            {view === 'grid' && (
              <div className="flex justify-between">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(talent._id);
                  }}
                  className={`p-2 rounded-full ${talent.isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <FiHeart />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSaved(talent._id);
                  }}
                  className={`p-2 rounded-full ${talent.isSaved ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <FiBookmark />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-100"
                >
                  {showDetails ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>
            )}
          </div>
          
          {/* Collapsible details for grid view */}
          {view === 'grid' && showDetails && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 pt-3 border-t border-gray-100"
            >
              <p className="text-gray-600 text-sm mb-2">{talent.bio}</p>
              <div className="text-xs text-gray-500">
                <div className="flex items-start mb-1">
                  <span className="font-medium mr-2">Experience:</span>
                  <span>{talent.experience} years</span>
                </div>
                <div className="flex items-start mb-1">
                  <span className="font-medium mr-2">Languages:</span>
                  <span>{talent.languages.join(', ')}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium mr-2">Education:</span>
                  <span>{talent.education}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}; 