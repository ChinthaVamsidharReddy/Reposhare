import React, { useState, useRef } from 'react';
import { 
  PaperClipIcon, 
  PhotoIcon, 
  DocumentIcon, 
  XMarkIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const FileUpload = ({ onFileSelect }) => {
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleFileSelect = (event, type = 'file') => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const fileData = {
        file,
        type,
        name: file.name,
        size: formatFileSize(file.size),
        url: URL.createObjectURL(file)
      };
      onFileSelect(fileData);
    });
    setShowOptions(false);
    event.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };



  const uploadOptions = [
    {
      icon: <DocumentIcon className="h-5 w-5" />,
      label: 'Document',
      accept: '.pdf,.doc,.docx,.txt,.xlsx,.pptx',
      onClick: () => fileInputRef.current?.click()
    },
    {
      icon: <PhotoIcon className="h-5 w-5" />,
      label: 'Photo/Video',
      accept: 'image/*,video/*',
      onClick: () => imageInputRef.current?.click()
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="p-1.5 sm:p-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-input rounded-lg transition"
        title="Attach file"
      >
        <PaperClipIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {showOptions && (
        <div className="absolute bottom-full left-0 sm:left-0 mb-2 bg-white dark:bg-dark-surface shadow-lg rounded-lg border border-gray-200 dark:border-dark-border p-2 min-w-48 sm:min-w-48 w-screen max-w-xs sm:w-auto z-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text">
              Attach
            </h3>
            <button
              onClick={() => setShowOptions(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-dark-input rounded"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-1">
            {uploadOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.onClick}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-dark-input rounded-lg transition text-gray-700 dark:text-dark-text"
              >
                {option.icon}
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
        onChange={(e) => handleFileSelect(e, 'file')}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => handleFileSelect(e, 'media')}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;