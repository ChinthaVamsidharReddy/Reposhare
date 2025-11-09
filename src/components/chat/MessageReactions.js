import React, { useState } from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

const MessageReactions = ({ messageId, onReact }) => {
  const [showReactions, setShowReactions] = useState(false);

  const reactions = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Haha' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😠', label: 'Angry' }
  ];

  const handleReact = (emoji) => {
    onReact?.(messageId, emoji);
    setShowReactions(false);
  };

  return (
    <div className="relative group">
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-dark-input rounded transition"
      >
        <EllipsisHorizontalIcon className="h-4 w-4 text-gray-400" />
      </button>

      {showReactions && (
        <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg p-2 flex gap-1 z-50">
          {reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => handleReact(reaction.emoji)}
              className="text-lg hover:scale-125 transition cursor-pointer"
              title={reaction.label}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;
