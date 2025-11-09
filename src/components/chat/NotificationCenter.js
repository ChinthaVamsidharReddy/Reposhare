import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

const NotificationCenter = () => {
  const { unreadCount } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const demoGroups = [
    { id: 'group1', name: 'CS101 - Intro to CS' },
    { id: 'group2', name: 'MATH201 - Calculus II' },
    { id: 'group3', name: 'PHYS301 - Quantum Mechanics' }
  ];

  useEffect(() => {
    const notifs = demoGroups
      .filter(group => unreadCount[group.id] > 0)
      .map(group => ({
        id: group.id,
        name: group.name,
        count: unreadCount[group.id],
        timestamp: new Date().toLocaleTimeString()
      }));
    setNotifications(notifs);
  }, [unreadCount]);

  const totalUnread = Object.values(unreadCount).reduce((a, b) => a + b, 0);

  const dismissNotification = (groupId) => {
    setNotifications(notifications.filter(n => n.id !== groupId));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-input rounded-lg transition"
      >
        <BellIcon className="h-6 w-6" />
        {totalUnread > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-white dark:bg-dark-surface rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-dark-border">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-dark-textSecondary">
              No new notifications
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-dark-border">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-dark-input transition flex items-start justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-dark-text">
                      {notif.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-dark-textSecondary">
                      {notif.count} new message{notif.count > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
                  </div>
                  <button
                    onClick={() => dismissNotification(notif.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-dark-border rounded transition"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NotificationCenter;
