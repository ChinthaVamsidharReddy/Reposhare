import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { ChatBubbleLeftIcon, ArrowRightIcon, BellSlashIcon, ArchiveBoxIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { use } from 'react';

const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getGroupMessages, getUnreadCount } = useChat();
  const [joinedStudyGroups, setJoinedStudyGroups] = useState([]);
  const [archivedGroups, setArchivedGroups] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
const loadGroups = async () => {
  const id = user?.id || localStorage.getItem("userId");
    const token = user?.token || localStorage.getItem("token");
  if (!id) {
    console.warn("User not logged in – cannot load groups");
    return;
  }
  try {
     // Fetch both created and joined groups with token
    const [createdRes, joinedRes] = await Promise.all([
      fetch(`http://localhost:8080/api/groups/created/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`http://localhost:8080/api/groups/joined/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!createdRes.ok || !joinedRes.ok) {
      throw new Error("Failed to fetch groups");
    }

     const createdGroups = await createdRes.json();
    const joinedGroups = await joinedRes.json();

    console.log("✅ Created groups:", createdGroups);
    console.log("✅ Joined groups:", joinedGroups);

     // Merge and deduplicate
    const allGroupsMap = new Map();
    [...createdGroups, ...joinedGroups].forEach((g) => {
      if (g && g.id) allGroupsMap.set(g.id, g);
    });

   const allGroups = Array.from(allGroupsMap.values());
    console.log("✅ Merged Groups:", allGroups);

    // Separate archived vs active
    const active = allGroups.filter((g) => !g.archived);
    const archived = allGroups.filter((g) => g.archived);

    setJoinedStudyGroups(active);
    setArchivedGroups(archived);

     localStorage.setItem("studyGroups", JSON.stringify(allGroups));
  } catch (error) {
    console.error("❌ Error loading groups:", error);
    

     // Fallback to cached data
    const cached = JSON.parse(localStorage.getItem("studyGroups") || "[]");
    const joined = cached.filter((g) => g.members?.includes(id));
    const active = joined.filter((g) => !g.archived);
    const archived = joined.filter((g) => g.archived);

    setJoinedStudyGroups(active);
    setArchivedGroups(archived);
  }
};

// call on mount and when user changes
useEffect(() => {
  loadGroups();
}, [user?.id]);

  // Listen for localStorage changes (when groups are joined from other components)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'studyGroups' || e.key === null) {
        loadGroups();
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events from same tab
    const handleCustomStorageChange = () => {
      loadGroups();
    };
    window.addEventListener('studyGroupsUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('studyGroupsUpdated', handleCustomStorageChange);
    };
  }, [user?.id]);

  // Add a refresh interval to catch any missed updates
useEffect(() => {
  loadGroups();
}, [user?.id]);

useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === "studyGroups" || e.key === null) {
      loadGroups();
    }
  };

  // Trigger reload when groups are updated in same or other tabs
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("studyGroupsUpdated", handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("studyGroupsUpdated", handleStorageChange);
  };
}, [user?.id]);


  const getGroupSettings = (groupId) => {
    try {
      return JSON.parse(localStorage.getItem(`groupSettings_${groupId}`) || '{}');
    } catch (error) {
      console.error('Error loading group settings:', error);
      return {};
    }
  };

  const getLastMessage = (groupId) => {
    try {
      const messages = getGroupMessages(groupId);
      // if (!messages || messages.length === 0) return 'No messages yet';
      const lastMsg = messages[messages.length - 1];
      // if (!lastMsg || !lastMsg.content) return 'No messages yet';
      const senderName = lastMsg.senderName || 'Unknown';
      const content = lastMsg.content.substring(0, 35);
      return `${senderName}: ${content}${lastMsg.content.length > 35 ? '...' : ''}`;
    } catch (error) {
      console.error('Error getting last message:', error);
      // return 'No messages yet';
    }
  };

  const formatLastMessageTime = (groupId) => {
    try {
      const messages = getGroupMessages(groupId);
      if (!messages || messages.length === 0) return '';
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg || !lastMsg.timestamp) return '';
      
      const date = new Date(lastMsg.timestamp);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      console.error('Error formatting message time:', error);
      return '';
    }
  };

  const GroupItem = ({ group, isArchived = false }) => {
    const unread = getUnreadCount(group.id);
    const settings = getGroupSettings(group.id);
    const lastMessageTime = formatLastMessageTime(group.id);
    
    return (
      
      <button
        key={group.id}
        onClick={() => navigate(`/chat/${group.id}`)}
        className={`p-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg hover:shadow-md transition text-left w-full ${
          isArchived ? 'opacity-75' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl relative">
            {group.avatar || '💬'}
            {settings.muteNotifications && (
              <div className="absolute -bottom-1 -right-1 bg-gray-500 rounded-full p-1">
                <BellSlashIcon className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {group.name}
                </h3>
                {settings.muteNotifications && (
                  <BellSlashIcon className="h-4 w-4 text-gray-500" title="Muted" />
                )}
                {isArchived && (
                  <ArchiveBoxIcon className="h-4 w-4 text-orange-500" title="Archived" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {lastMessageTime && (
                  <span className="text-xs text-gray-500 dark:text-dark-textSecondary">
                    {lastMessageTime}
                  </span>
                )}
                {unread > 0 && !settings.muteNotifications && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 flex-shrink-0">
                    {unread} new
                  </span>
                )}
                {unread > 0 && settings.muteNotifications && (
                  <span className="bg-gray-500 text-white text-xs rounded-full px-2 py-1 flex-shrink-0">
                    {unread}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-dark-textSecondary truncate mb-2">
              {getLastMessage(group.id)}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-dark-textMuted">
                {group.memberCount ?? 0} members • {group.coursename || 'Study Group'}
              </p>
              <ArrowRightIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <ChatBubbleLeftIcon className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Group Chats</h2>
      </div>
      {/* <button
  onClick={loadGroups}
  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-lg"
>
  Refresh
</button> */}


      {joinedStudyGroups.length === 0 && archivedGroups.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border">
          <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-dark-textSecondary mb-4">
            No study groups yet. Join a group to start chatting!
          </p>
          <button
            onClick={() => navigate('/study-groups')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Browse Study Groups
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Groups */}
          {joinedStudyGroups.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {joinedStudyGroups.map((group) => (
                <GroupItem key={group.id} group={group} />
              ))}
            </div>
          )}
          
          {/* Archived Groups Section */}
          {archivedGroups.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="w-full flex items-center gap-2 p-3 bg-gray-50 dark:bg-dark-input rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition text-left"
              >
                {showArchived ? (
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                )}
                <ArchiveBoxIcon className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-white">
                  Archived ({archivedGroups.length})
                </span>
              </button>
              
              {showArchived && (
                <div className="mt-3 grid grid-cols-1 gap-3 pl-4">
                  {archivedGroups.map((group) => (
                    <GroupItem key={group.id} group={group} isArchived={true} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatList;
