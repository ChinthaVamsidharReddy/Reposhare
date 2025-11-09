import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const GroupDebugInfo = () => {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  const loadGroups = () => {
    try {
      const groups = JSON.parse(localStorage.getItem("studyGroups") || '[]');
      setStudyGroups(groups);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error loading groups:', error);
      setStudyGroups([]);
    }
  };

  useEffect(() => {
    loadGroups();
    
    // Listen for updates
    const handleUpdate = () => {
      loadGroups();
    };
    
    window.addEventListener('studyGroupsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    return () => {
      window.removeEventListener('studyGroupsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const userGroups = studyGroups.filter(g => g && g.members && g.members.includes(user?.id));

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-xs max-w-sm z-50 shadow-lg">
      <h4 className="font-bold mb-2">Debug: User Groups</h4>
      <p className="mb-2">User ID: {user?.id || 'Not logged in'}</p>
      <p className="mb-2">Last Update: {lastUpdate}</p>
      <p className="mb-2">Total Groups: {studyGroups.length}</p>
      <p className="mb-2">User's Groups: {userGroups.length}</p>
      
      {userGroups.length > 0 && (
        <div>
          <p className="font-semibold mb-1">Joined Groups:</p>
          <ul className="space-y-1">
            {userGroups.map(group => (
              <li key={group.id} className="text-xs">
                • {group.name} ({group.memberCount} members)
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <button 
        onClick={loadGroups}
        className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
      >
        Refresh
      </button>
    </div>
  );
};

export default GroupDebugInfo;
