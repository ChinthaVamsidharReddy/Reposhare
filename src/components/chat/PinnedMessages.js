import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { BookmarkIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PinnedMessages = ({ groupId }) => {
  const { getGroupMessages } = useChat();
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const messages = getGroupMessages(groupId);

  const handlePinMessage = (messageId) => {
    const message = messages.find((m) => m.id === messageId);
    if (message && !pinnedMessages.find((m) => m.id === messageId)) {
      setPinnedMessages([...pinnedMessages, message]);
    }
  };

  const handleUnpinMessage = (messageId) => {
    setPinnedMessages(pinnedMessages.filter((m) => m.id !== messageId));
  };

  if (pinnedMessages.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-input rounded-lg transition text-gray-600 dark:text-dark-text relative"
        title="Pinned messages (📌)"
      >
        <BookmarkIcon className="h-6 w-6" />
        <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {pinnedMessages.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 dark:border-dark-border font-semibold text-gray-900 dark:text-dark-text">
            Pinned Messages ({pinnedMessages.length})
          </div>

          <div className="divide-y divide-gray-200 dark:divide-dark-border">
            {pinnedMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-3 hover:bg-gray-50 dark:hover:bg-dark-input transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary">
                      {msg.senderName}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-dark-text mt-1 break-words">
                      {msg.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnpinMessage(msg.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-dark-border rounded transition flex-shrink-0"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PinnedMessages;
