import React, { useState, useRef } from 'react';
import { PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FileShare = ({ onFileSelect }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    onFileSelect?.(files);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-input rounded-lg transition text-gray-600 dark:text-dark-text"
          title="Attach file"
        >
          <PaperClipIcon className="h-5 w-5" />
        </button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="bg-gray-50 dark:bg-dark-input rounded-lg p-3 space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white dark:bg-dark-surface p-2 rounded border border-gray-200 dark:border-dark-border"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-textSecondary">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-input rounded transition"
              >
                <XMarkIcon className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileShare;