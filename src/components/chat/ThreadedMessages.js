import React, { useState } from 'react';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

const ThreadedMessages = ({ message, replies = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!replies || replies.length === 0) return null;

  return (
    <div className="mt-2 ml-4 border-l-2 border-blue-300 pl-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        <ChatBubbleBottomCenterTextIcon className="h-3 w-3" />
        {replies.length} repl{replies.length === 1 ? 'y' : 'ies'}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-gray-50 dark:bg-dark-input p-2 rounded text-xs"
            >
              <p className="font-medium text-gray-900 dark:text-dark-text">
                {reply.senderName}
              </p>
              <p className="text-gray-700 dark:text-dark-textSecondary">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreadedMessages;
