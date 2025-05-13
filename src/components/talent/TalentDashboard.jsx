import { useState, useEffect } from 'react';
import {
  FiSearch, FiStar, FiFilter, FiGrid, FiList,
  FiClock, FiMapPin, FiDollarSign, FiCheckCircle, FiMessageSquare,
  FiHeart, FiBookmark, FiX, FiChevronDown, FiChevronUp, FiUsers
} from 'react-icons/fi';
import TalentSidebar from './TalentSidebar';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

// Main TalentDashboard component
export default function TalentDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [talents, setTalents] = useState([]);
  const [view, setView] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('match');
  const [error, setError] = useState(null);
  const location = useLocation();
  const [filters, setFilters] = useState({
    skills: [],
  });

  // Get active tab from current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/talent/browse')) return 'talents';
    if (path.includes('/talent/dashboard')) return 'dashboard';
    if (path.includes('/talent/messages')) return 'messages';
    if (path.includes('/talent/community')) return 'community';
    if (path.includes('/favorites')) return 'favorites';
    if (path.includes('/saved')) return 'saved';
    return '';
  };

  // Fetch talents data
  useEffect(() => {
    const fetchTalents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/all', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Transform the user data to match our talent structure
        const transformedTalents = response.data.map(user => ({
          _id: user._id,
          name: user.name,
          title: user.title || 'Freelancer',
          skills: user.skills || [],
          bio: user.bio || 'No bio available',
          languages: user.languages || [],
          marks: user.marks || 'Not specified',
          profilePic: user.profilePic || '/api/placeholder/160/160',
          isFavorite: false,
          isSaved: false,
          matchPercentage: Math.floor(Math.random() * 30) + 70
        }));

        setTalents(transformedTalents);
      } catch (error) {
        console.error("Error fetching talents:", error);
        setError("Failed to load talents. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTalents();
  }, []);

  // Handle toggling favorite status
  const handleToggleFavorite = async (talentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/favorites/${talentId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTalents(
        talents.map(talent =>
          talent._id === talentId
            ? { ...talent, isFavorite: !talent.isFavorite }
            : talent
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Handle toggling saved status
  const handleToggleSaved = async (talentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/saved/${talentId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTalents(
        talents.map(talent =>
          talent._id === talentId
            ? { ...talent, isSaved: !talent.isSaved }
            : talent
        )
      );
    } catch (error) {
      console.error("Error toggling saved:", error);
    }
  };

  // Handle sending message to talent
  const handleSendMessage = async (talentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/messages/create`, {
        recipientId: talentId,
        message: 'Hi, I would like to connect with you!'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // You might want to show a success message or navigate to the messages page
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Filter talents based on search and filters
  const filteredTalents = talents.filter(talent => {
    const matchesSearch = talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSkills = filters.skills.length === 0 ||
      filters.skills.some(skill => talent.skills.includes(skill));

    return matchesSearch && matchesSkills;
  }).sort((a, b) => {
    if (sortOption === 'match') {
      return (b.matchPercentage || 0) - (a.matchPercentage || 0);
    }
    return 0;
  });

  // Handle applying filters
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col space-y-4 w-full max-w-4xl">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="flex flex-wrap gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-4 w-full md:w-80 h-64">
                <div className="flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiUsers size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Error Loading Talents</h3>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <TalentSidebar activeTab={getActiveTab()} />
      <div className="flex-1 overflow-hidden flex flex-col">
        <main className="p-6 flex-1 overflow-y-auto">
          {/* Search and filter header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 bg-gray-50 z-10 py-3">
            <div className="relative flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search by name, title, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 flex items-center"
              >
                <FiFilter className="mr-2" />
                Filters
                {Object.values(filters).flat().some(val =>
                  Array.isArray(val) ? val.length > 0 : val !== ''
                ) && (
                    <span className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      !
                    </span>
                  )}
              </button>

              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="match">Best Match</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* View toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setView('grid')}
                  className={`px-3 py-2 flex items-center ${view === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                    }`}
                >
                  <FiGrid className="mr-1" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-2 flex items-center ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                    }`}
                >
                  <FiList className="mr-1" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main content with filters and talents */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters sidebar */}
            {showFilters && (
              <div className="md:w-64 bg-white p-4 rounded-lg shadow-sm border border-gray-100 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-800">Filters</h2>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                    <FiX size={18} />
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
                          checked={filters.skills.includes(skill)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const newSkills = isChecked
                              ? [...filters.skills, skill]
                              : filters.skills.filter((s) => s !== skill);
                            handleFilterChange({ ...filters, skills: newSkills });
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-gray-600">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset filters button */}
                <button
                  onClick={() => {
                    const defaultFilters = {
                      skills: [],
                    };
                    handleFilterChange(defaultFilters);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Talents grid/list */}
            <div className="flex-1 min-h-0">
              {filteredTalents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <FiUsers size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No talents found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search criteria</p>
                </div>
              ) : (
                <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredTalents.map((talent) => (
                    <TalentCard
                      key={talent._id}
                      talent={talent}
                      view={view}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleSaved={handleToggleSaved}
                      onSendMessage={handleSendMessage}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Talent card component
function TalentCard({ talent, view, onToggleFavorite, onToggleSaved, onSendMessage }) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate match percentage based on skills match
  const matchPercentage = talent.matchPercentage || Math.floor(Math.random() * 30) + 70;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all ${view === 'grid' ? 'p-4' : 'p-6'}`}
    >
      <div className={`flex ${view === 'grid' ? 'flex-col' : 'flex-row gap-6'}`}>
        {/* Profile image and match score */}
        <div className={`${view === 'grid' ? 'mb-4 text-center' : 'w-1/5'}`}>
          <div className="relative inline-block">
            <img
              src={talent.profilePic || "/api/placeholder/160/160"}
              alt={talent.name}
              className={`rounded-full object-cover border-2 border-gray-100 ${view === 'grid' ? 'w-20 h-20 mx-auto' : 'w-24 h-24'}`}
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
                  aria-label={talent.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <FiHeart fill={talent.isFavorite ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSaved(talent._id);
                  }}
                  className={`p-2 rounded-full ${talent.isSaved ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  aria-label={talent.isSaved ? "Unsave profile" : "Save profile"}
                >
                  <FiBookmark fill={talent.isSaved ? "currentColor" : "none"} />
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
              className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm w-full transition-colors"
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
                  aria-label={talent.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <FiHeart fill={talent.isFavorite ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSaved(talent._id);
                  }}
                  className={`p-2 rounded-full ${talent.isSaved ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  aria-label={talent.isSaved ? "Unsave profile" : "Save profile"}
                >
                  <FiBookmark fill={talent.isSaved ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-100"
                  aria-label={showDetails ? "Hide details" : "Show details"}
                >
                  {showDetails ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>
            )}
          </div>

          {/* Collapsible details for grid view */}
          {view === 'grid' && showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-gray-600 text-sm mb-2">{talent.bio}</p>
              <div className="text-xs text-gray-500">
                <div className="flex items-start mb-1">
                  <span className="font-medium mr-2">Languages:</span>
                  <span>{talent.languages.join(', ')}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium mr-2">Marks:</span>
                  <span>{talent.marks}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}