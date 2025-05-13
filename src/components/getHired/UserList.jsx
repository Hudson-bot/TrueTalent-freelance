import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        if (response.data.success) {
          setUsers(response.data.data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {users.map((user) => (
        <div key={user._id} className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          {user.skills && (
            <div className="mt-2">
              <p className="font-semibold">Skills:</p>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-2 space-y-1">
            {user.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline block">
                GitHub
              </a>
            )}
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                 className="text-blue-600 hover:underline block">
                LinkedIn
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
