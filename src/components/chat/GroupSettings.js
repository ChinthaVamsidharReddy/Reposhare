import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  XMarkIcon,
  BellSlashIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const GroupSettings = ({ groupId, groupName, members = [] }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const [settings, setSettings] = useState({
    notifications: true,
    muteNotifications: false,
    showPreview: true,
    archived: false,
  });

  const [groupInfo, setGroupInfo] = useState(null);

  // 🧠 Load group settings from localStorage (or API later)
  useEffect(() => {
    if (!groupId) return;

    try {
      const savedSettings = JSON.parse(
        localStorage.getItem(`groupSettings_${groupId}`) || '{}'
      );
      setSettings(prev => ({ ...prev, ...savedSettings }));

      // Load group info from localStorage for now
      const studyGroups = JSON.parse(localStorage.getItem('studyGroups') || '[]');
      const group = studyGroups.find(g => g.id === groupId);
      setGroupInfo(group || null);
    } catch (error) {
      console.error('Error loading group settings:', error);
      setGroupInfo(null);
    }
  }, [groupId]);

  // 💾 Save settings (can later replace with API)
  useEffect(() => {
    if (!groupId) return;
    try {
      localStorage.setItem(`groupSettings_${groupId}`, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving group settings:', error);
    }
  }, [settings, groupId]);

  // 🛎️ Toggle settings
  const handleToggle = key => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: !prev[key],
      };

      if (key === 'muteNotifications' && newSettings.muteNotifications) {
        newSettings.notifications = false;
      } else if (key === 'notifications' && newSettings.notifications) {
        newSettings.muteNotifications = false;
      }

      return newSettings;
    });
  };

  // 📦 Archive or unarchive group
  const handleArchiveGroup = () => {
    if (!groupId) return;

    try {
      const studyGroups = JSON.parse(localStorage.getItem('studyGroups') || '[]');
      const groupIndex = studyGroups.findIndex(g => g && g.id === groupId);

      if (groupIndex !== -1) {
        studyGroups[groupIndex].archived = !settings.archived;
        localStorage.setItem('studyGroups', JSON.stringify(studyGroups));
        setSettings(prev => ({ ...prev, archived: !prev.archived }));

        const action = !settings.archived ? 'archived' : 'unarchived';
        alert(`Group ${action} successfully!`);
      }
    } catch (error) {
      console.error('Error archiving group:', error);
      alert('Error archiving group. Please try again.');
    }
  };

  // 🚪 Leave group
  const handleLeaveGroup = () => {
    if (!groupId || !user?.id) {
      alert('Unable to leave group. Please try again.');
      return;
    }

    try {
      const studyGroups = JSON.parse(localStorage.getItem('studyGroups') || '[]');
      const groupIndex = studyGroups.findIndex(g => g && g.id === groupId);

      if (groupIndex !== -1) {
        const group = studyGroups[groupIndex];
        group.members = (group.members || []).filter(m => m !== user.id);
        group.memberCount = group.members.length;

        // If group is empty or user is creator, delete the group
        if (group.members.length === 0 || group.createdBy === user.id) {
          studyGroups.splice(groupIndex, 1);
        } else {
          studyGroups[groupIndex] = group;
        }

        localStorage.setItem('studyGroups', JSON.stringify(studyGroups));
        localStorage.removeItem(`groupSettings_${groupId}`);

        setIsOpen(false);
        setShowLeaveConfirm(false);
        window.location.href = '/dashboard';
      } else {
        alert('Group not found.');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Error leaving group. Please try again.');
    }
  };

  // 👥 View Members
  const handleViewMembers = () => {
    setShowMembersModal(true);
  };

  return (
    <>
      {/* ⚙️ Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-input rounded-lg transition text-gray-600 dark:text-dark-text"
        title="Group settings (⚙️)"
      >
        <Cog6ToothIcon className="h-6 w-6" />
      </button>

      {/* ⚙️ Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Group Settings
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-input rounded transition"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Group Name and Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {groupName}
                  </h4>
                  {settings.muteNotifications && (
                    <BellSlashIcon
                      className="h-4 w-4 text-gray-500"
                      title="Muted"
                    />
                  )}
                  {settings.archived && (
                    <ArchiveBoxIcon
                      className="h-4 w-4 text-orange-500"
                      title="Archived"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-dark-textSecondary">
                  {groupInfo?.coursename || 'Study Group'} • 👥{' '}
                  {members.length ?? 0} members
                </p>
                <p className="text-xs text-gray-400 dark:text-dark-textMuted">
                  {groupInfo?.privacy === 'PRIVATE'
                    ? '🔒 Private Group'
                    : '🌍 Public Group'}
                </p>
              </div>

              {/* Settings toggles */}
              <div className="space-y-3 border-t border-gray-200 dark:border-dark-border pt-4">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-input p-2 rounded">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={() => handleToggle('notifications')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-dark-text flex-1">
                    Enable notifications
                  </span>
                  {settings.notifications && (
                    <span className="text-xs text-green-600">✓ On</span>
                  )}
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-input p-2 rounded">
                  <input
                    type="checkbox"
                    checked={settings.muteNotifications}
                    onChange={() => handleToggle('muteNotifications')}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-white flex-1 flex items-center gap-2">
                    Mute notifications
                    {settings.muteNotifications && (
                      <BellSlashIcon className="h-4 w-4 text-orange-500" />
                    )}
                  </span>
                  {settings.muteNotifications && (
                    <span className="text-xs text-orange-600">🔇 Muted</span>
                  )}
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-input p-2 rounded">
                  <input
                    type="checkbox"
                    checked={settings.showPreview}
                    onChange={() => handleToggle('showPreview')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-dark-text flex-1">
                    Show message preview
                  </span>
                </label>

                <button
                  onClick={handleArchiveGroup}
                  className={`w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-dark-hover transition ${
                    settings.archived
                      ? 'text-orange-600'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  <ArchiveBoxIcon
                    className={`h-4 w-4 ${
                      settings.archived
                        ? 'text-orange-500'
                        : 'text-gray-400'
                    }`}
                  />
                  <span className="text-sm flex-1 text-left">
                    {settings.archived ? 'Unarchive group' : 'Archive group'}
                  </span>
                  {settings.archived && (
                    <span className="text-xs text-orange-600">📦 Archived</span>
                  )}
                </button>
              </div>

              {/* View Members & Leave */}
              <div className="border-t border-gray-200 dark:border-dark-border pt-4 space-y-2">
                <button
                  onClick={handleViewMembers}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-input text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-dark-hover transition flex items-center justify-center gap-2"
                >
                  <UserGroupIcon className="h-4 w-4" />
                  View Members ({members.length ?? 0})
                </button>
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/50 transition flex items-center justify-center gap-2"
                >
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  Leave Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👥 Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                Members ({members.length})
              </h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-input rounded"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-dark-border">
              {members.length > 0 ? (
                members.map(m => (
                  <div
                    key={m.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-input transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{m.avatar || '👤'}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-dark-text">
                          {m.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-textSecondary">
                          {m.role || 'Member'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No members found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🚪 Leave Group Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card rounded-lg max-w-sm w-full mx-4 p-6">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Leave Group?
              </h3>
              <p className="text-sm text-gray-600 dark:text-dark-textSecondary mb-6">
                Are you sure you want to leave "{groupName}"? You'll need to be re-invited to rejoin.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeaveGroup}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupSettings;
