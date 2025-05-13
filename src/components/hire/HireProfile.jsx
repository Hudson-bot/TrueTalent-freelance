import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TalentSidebar from '../talent/TalentSidebar';
import ClientInfoModal from './ClientInfoModal';

const StarRating = ({ rating = 0 }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className={`w-5 h-5 ${
            index < rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const VerificationBadge = ({ verified }) => {
  return verified ? (
    <div className="flex items-center text-green-600">
      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span>Verified</span>
    </div>
  ) : (
    <div className="flex items-center text-gray-500">
      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <span>Not Verified</span>
    </div>
  );
};

const HireProfile = () => {
  const [clientInfo, setClientInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to fetch client info from API
  const fetchClientInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5000/api/client-info', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setClientInfo(response.data);
      console.log('Client info fetched:', response.data);
    } catch (err) {
      console.error('Error fetching client info:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch client info on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchClientInfo();
  }, [refreshTrigger]);

  // Handle saving client info changes
  const handleSaveClientInfo = async (updatedInfo) => {
    try {
      console.log('Saving client info:', updatedInfo);
      
      // First update local state for immediate UI feedback
      setClientInfo({
        ...clientInfo,
        ...updatedInfo
      });
      
      // Then trigger a refresh to get the latest data from the server
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
        console.log('Refreshing client info after save');
      }, 500); // Small delay to ensure backend has processed the save
      
      // Close the modal
      setShowModal(false);
    } catch (error) {
      console.error('Error handling save:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 font-sans">
        <TalentSidebar activeTab="profile" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 font-sans">
        <TalentSidebar activeTab="profile" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no client info exists yet, show a message and button to create profile
  if (!clientInfo) {
    return (
      <div className="flex h-screen bg-gray-50 font-sans">
        <TalentSidebar activeTab="profile" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Complete Your Client Profile</h2>
            <p className="text-gray-600 mb-6">Please complete your profile to start hiring freelancers</p>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Complete Profile
            </button>
            {showModal && (
              <ClientInfoModal 
                onSave={handleSaveClientInfo} 
                onClose={() => setShowModal(false)} 
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Calculate membership duration
  const memberSince = clientInfo.createdAt 
    ? new Date(clientInfo.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'Recently joined';

  return (
    <div className="flex h-screen bg-gray-50">
      <TalentSidebar activeTab="profile" />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{clientInfo.name || 'Client'}</h1>
              <p className="text-gray-600">{clientInfo.location || 'Location not specified'}</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </button>
              <VerificationBadge verified={clientInfo.role === 'client'} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Profile Statistics</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-600">Member Since</p>
                  <p className="font-medium">{memberSince}</p>
                </div>
                <div>
                  <p className="text-gray-600">Company</p>
                  <p className="font-medium">{clientInfo.company || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Industry</p>
                  <p className="font-medium">{clientInfo.industry || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{clientInfo.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium">{clientInfo.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info Modal */}
          {showModal && (
            <ClientInfoModal 
              onSave={handleSaveClientInfo} 
              onClose={() => setShowModal(false)} 
              existingData={clientInfo}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HireProfile;