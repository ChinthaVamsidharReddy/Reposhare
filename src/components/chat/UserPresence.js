import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

const UserPresence = ({ groupId, members = [] }) => {
  const { user } = useAuth();
  const { getOnlineUsers, getTypingUsers } = useChat();
  const [showDetails, setShowDetails] = useState(false);

  const onlineUsers = getOnlineUsers(groupId) || [];
  const typingUsers = getTypingUsers(groupId) || [];

  const currentUserId = user?.id || localStorage.getItem("userId");

  // Filter typing users — exclude the one who's currently logged in
  const activeTypers = typingUsers.filter(
    (u) => String(u.userId) !== String(currentUserId)
  );

  // Combine members with online status
  const enhancedMembers = members.map((m) => ({
    id: m.id || m.userId || m._id || m.name,
    name: m.name || m.userName || 'Member',
    avatar: m.avatar || '👤',
    status: onlineUsers.includes(m.id) ? 'online' : 'offline',
    lastSeen: new Date(),
  }));

  const onlineCount = enhancedMembers.filter((m) => m.status === 'online').length;

  // ✅ Show either "typing" or online status
  const getStatusText = () => {
    if (activeTypers.length > 0) {
      const names = activeTypers
        .map((u) => u.userName || u.name)
        .filter(Boolean);

      if (names.length === 1) return `${names[0]} is typing...`;
      if (names.length > 1) return `${names.join(", ")} are typing...`;
    }

    const names=activeTypers;
    if (onlineCount === 1) return '1 member online';
    if (onlineCount > 1) return `${onlineCount} members online`;
    return names;
  };

  const formatLastSeen = (lastSeen) => {
    const now = new Date();
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return lastSeen.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="relative">
      {/* Compact View */}
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-input rounded-lg p-1 transition"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 dark:text-dark-textSecondary">
            {getStatusText()}
          </div>
        </div>
      </div>

      {/* Full Details Dropdown */}
      {showDetails && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-dark-surface shadow-lg rounded-lg border border-gray-200 dark:border-dark-border p-3 min-w-64 z-50">
          <h4 className="text-sm font-medium text-gray-900 dark:text-dark-text mb-2">
            Group Members ({enhancedMembers.length})
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {enhancedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-dark-input rounded"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white">
                    {member.avatar}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-dark-surface ${getStatusColor(member.status)}`}
                  ></div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-textSecondary">
                    {member.status === 'online'
                      ? 'Online'
                      : `Last seen ${formatLastSeen(member.lastSeen)}`}
                  </p>
                </div>

                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPresence;
