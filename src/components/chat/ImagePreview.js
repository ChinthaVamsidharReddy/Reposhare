import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ImagePreview = ({ imageUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-screen">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white dark:bg-dark-surface rounded-lg hover:bg-gray-100 dark:hover:bg-dark-input transition"
        >
          <XMarkIcon className="h-6 w-6 text-gray-900 dark:text-dark-text" />
        </button>

        {isLoading && (
          <div className="flex items-center justify-center w-96 h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        <img
          src={imageUrl}
          alt="Preview"
          onLoad={() => setIsLoading(false)}
          className={`max-w-full max-h-screen ${isLoading ? 'hidden' : ''}`}
        />
      </div>
    </div>
  );
};

export default ImagePreview;
