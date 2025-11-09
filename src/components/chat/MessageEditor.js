import React, { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MessageEditor = ({ message, onSave, onCancel }) => {
  const [editedContent, setEditedContent] = useState(message.content);

  const handleSave = () => {
    if (editedContent.trim()) {
      onSave(message.id, editedContent.trim());
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="flex-1 px-3 py-2 border border-blue-500 rounded-lg dark:bg-dark-input dark:text-dark-text"
        autoFocus
      />
      <button
        onClick={handleSave}
        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition"
      >
        <CheckIcon className="h-4 w-4" />
      </button>
      <button
        onClick={onCancel}
        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default MessageEditor;
