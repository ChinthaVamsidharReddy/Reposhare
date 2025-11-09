import React from 'react';

const QuickReply = ({ onSelect }) => {
  const quickReplies = [
    '👍 Sounds good!',
    '❤️ Love it!',
    '😂 Haha!',
    '🙌 Great!',
    '⏰ Later',
    '🤔 Let me think',
    '✅ Done',
    '❌ Not now'
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {quickReplies.map((reply, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(reply)}
          className="px-3 py-1 bg-gray-100 dark:bg-dark-input hover:bg-gray-200 dark:hover:bg-dark-border text-sm text-gray-900 dark:text-dark-text rounded-full transition"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

export default QuickReply;
