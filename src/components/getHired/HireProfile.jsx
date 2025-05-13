import React from 'react';

const StarRating = ({ rating }) => {
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
  const profileData = {
    name: "Ayush Kumar",
    age: 25,
    location: "Mumbai, India",
    address: "123 Tech Park, Andheri East",
    memberSince: "January 2023",
    rating: 4,
    clientEngagement: 95,
    verified: true,
    contact: {
      email: "ayush.kumar@example.com",
      phone: "+91 9876543210"
    },
    projectsPosted: 15,
    successfulHires: 12
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{profileData.name}</h1>
          <p className="text-gray-600">{profileData.location}</p>
        </div>
        <VerificationBadge verified={profileData.verified} />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Profile Statistics</h2>
          <div className="space-y-2">
            <div>
              <p className="text-gray-600">Member Since</p>
              <p className="font-medium">{profileData.memberSince}</p>
            </div>
            <div>
              <p className="text-gray-600">Projects Posted</p>
              <p className="font-medium">{profileData.projectsPosted}</p>
            </div>
            <div>
              <p className="text-gray-600">Successful Hires</p>
              <p className="font-medium">{profileData.successfulHires}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Performance</h2>
          <div className="space-y-2">
            <div>
              <p className="text-gray-600">Rating</p>
              <StarRating rating={profileData.rating} />
            </div>
            <div>
              <p className="text-gray-600">Client Engagement</p>
              <p className="font-medium">{profileData.clientEngagement}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{profileData.contact.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="font-medium">{profileData.contact.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HireProfile;
