
import React, { useState } from 'react';
import {
  DocumentIcon,
  PhotoIcon,
  MusicalNoteIcon,
  ArrowUturnLeftIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';
import PollDisplay from './PollDisplay';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

const MessageBubble = ({ message, onReply, onReaction, onPollVote }) => {
  const { user } = useAuth();
  const [showReactions, setShowReactions] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const storedUserId = localStorage.getItem("userId");
  const currentUserId = user?.id || storedUserId;

  const isOwn = message.senderId && currentUserId && String(message.senderId) === String(currentUserId);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <PhotoIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />;
    if (fileType?.startsWith('audio/')) return <MusicalNoteIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />;
    return <DocumentIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />;
  };

  const handleReaction = (emoji) => {
    onReaction?.(message.id, emoji);
    setShowReactions(false);
  };

  const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  // Detect if a text message consists of only emojis (so we can render larger)
  const isEmojiOnly = (text) => {
    if (!text || typeof text !== 'string') return false;
    const stripped = text.replace(/\s/g, '');
    if (!stripped) return false;
    try {
      const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/u;
      return Array.from(stripped).every((ch) => emojiRegex.test(ch));
    } catch {
      // Fallback if Unicode property escapes unsupported
      const basicEmoji = /[\u203C-\u3299\uD800-\uDBFF][\uDC00-\uDFFF]?/;
      return Array.from(stripped).every((ch) => basicEmoji.test(ch));
    }
  };

  const renderMessageContent = () => {

    
    switch (message.type) {
      case 'poll': {
        const pollData = message.poll || {
          id: message.id,
          question: message.pollQuestion || message.content,
          options: message.pollOptions || message.options || [],
        };
        return <PollDisplay poll={pollData} onVote={onPollVote} className="mt-3" />;
      }
      case 'file': {
        // Ensure content is always a string for file messages
        let fileName = "Attachment";
        if (typeof message.content === 'string') {
          fileName = message.content;
        } else if (message.content && typeof message.content === 'object') {
          fileName = message.content.name || message.content.fileName || "Attachment";
        }
        
        // Get file size - check multiple possible locations
        let fileSize = null;
        if (message.size) {
          fileSize = (message.size / 1024).toFixed(1) + " KB";
        } else if (message.fileSize) {
          fileSize = (message.fileSize / 1024).toFixed(1) + " KB";
        } else if (typeof message.content === 'object' && message.content?.size) {
          fileSize = (message.content.size / 1024).toFixed(1) + " KB";
        }

        // Get file URL - check multiple possible locations
        let fileUrl = message.fileUrl || message.url || (typeof message.content === 'object' ? message.content?.fileUrl || message.content?.url : null);
        const fileType = message.fileType || (typeof message.content === 'object' ? message.content?.fileType || message.content?.type : null);

        // Construct full backend URL if fileUrl is relative
        if (fileUrl) {
          if (fileUrl.startsWith('/')) {
            // Relative path: prepend backend URL
            fileUrl = API_BASE.replace('/api', '') + fileUrl;
          } else if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
            // If it's not absolute and not relative, assume it's just the filename
            fileUrl = `${API_BASE}/${fileUrl}`;
          }
        }

        const handleDownload = async (e) => {
          e.preventDefault();
          if (!fileUrl) return;

          try {
            // Fetch the file with credentials for authenticated requests
            const token = localStorage.getItem("token");
            const response = await fetch(fileUrl, {
              method: 'GET',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (!response.ok) {
              throw new Error(`Failed to download file: ${response.statusText}`);
            }

            // Get the blob from the response
            const blob = await response.blob();
            
            // Create a blob URL and trigger download
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          } catch (error) {
            console.error('Error downloading file:', error);
            // Fallback: open in new tab if fetch fails
            window.open(fileUrl, '_blank');
          }
        };

        return (
          <div className="flex items-center gap-2 p-3 bg-white bg-opacity-20 dark:bg-dark-border rounded-xl">
            {getFileIcon(fileType)}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              {fileSize && <p className="text-xs opacity-75">{fileSize}</p>}
            </div>

            {fileUrl ? (
              <button
                onClick={handleDownload}
                className={`text-xs underline ${isOwn ? 'text-blue-100 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'} hover:opacity-80 cursor-pointer bg-transparent border-none p-0`}
                title={`Download ${fileName}`}
              >
                Download
              </button>
            ) : (
              <span className="text-xs text-red-500">No file URL</span>
            )}
          </div>
        );
      }


      case 'voice':
        return (
          <div className="flex items-center gap-3 p-3 bg-white bg-opacity-20 rounded-xl">
            <MusicalNoteIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <div className="w-full h-1 bg-white bg-opacity-30 rounded-full">
              <div className="w-1/3 h-full bg-white rounded-full"></div>
            </div>
            <span className="text-xs">{message.voice?.duration || '0:30'}</span>
          </div>
        );
      default:
        {
          // Ensure content is always a string (never render objects)
          let contentStr = message.content;
          if (typeof contentStr !== 'string') {
            if (contentStr && typeof contentStr === 'object') {
              // If content is an object, try to extract a string representation
              contentStr = contentStr.toString ? contentStr.toString() : JSON.stringify(contentStr);
            } else {
              contentStr = String(contentStr || '');
            }
          }
          
          const emojiOnly = isEmojiOnly(contentStr);
          return (
            <p
              className={
                emojiOnly
                  ? 'break-words leading-tight text-3xl sm:text-4xl'
                  : 'break-words text-sm'
              }
              style={emojiOnly ? { lineHeight: 1.1 } : undefined}
            >
              {contentStr}
            </p>
          );
        }
    }
  };

  return (
    <div
      data-message-id={message?.id}
      className={`flex w-full my-1.5 sm:my-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
      style={{ overflow: 'hidden' }}
    >
      <div
        className={`relative max-w-[90%] sm:max-w-[75%] lg:max-w-[60%] p-2.5 sm:p-3 rounded-2xl shadow-md transition-colors ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-none self-end'
            : 'bg-gray-200 dark:bg-dark-input text-gray-900 dark:text-dark-text rounded-bl-none'
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        style={{ overflow: 'visible' }}
      >
        {!isOwn && (
          <p className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300 opacity-80">
            {message.senderName}
          </p>
        )}

        {message.replyTo && (
          <div
            className={`mb-1.5 px-2.5 py-2 text-xs rounded-lg ${
              isOwn ? 'bg-blue-500 bg-opacity-40' : 'bg-gray-300 dark:bg-dark-border'
            }`}
          >
            <p className="opacity-75">Replying to {message.replyTo.senderName}</p>
            <p className="truncate">{message.replyTo.content}</p>
          </div>
        )}

        {renderMessageContent()}

        <div className="flex items-center justify-between mt-1.5 sm:mt-2 space-x-2 text-[11px]">
          <span
            className={`${
              isOwn ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {formatTime(message.timestamp)}
          </span>
          {isOwn && (
            <span
              className={`text-[10px] opacity-90 ${
                message.status === 'read' ? 'text-blue-200' : ''
              }`}
            >
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'read' && '✓✓'}
            </span>
          )}
        </div>

        {showActions && (
          <div
            className={`absolute -top-9 ${isOwn ? 'right-0' : 'left-0'} flex gap-1.5 bg-white dark:bg-dark-surface shadow-lg rounded-lg p-2`}
          >
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-input rounded text-gray-600 dark:text-dark-text"
              title="React"
            >
              <FaceSmileIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onReply?.(message)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-input rounded text-gray-600 dark:text-dark-text"
              title="Reply"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-3 mt-2">
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  users.includes(user?.id)
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                    : 'bg-gray-100 dark:bg-dark-input border-gray-300 dark:border-dark-border'
                }`}
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{users.length}</span>
              </button>
            ))}
          </div>
        )}

        {showReactions && (
          <div
            className={`absolute z-20 ${isOwn ? 'right-0' : 'left-0'} -top-12 flex bg-white dark:bg-dark-surface shadow-lg rounded-lg p-2 gap-1.5`}
          >
            {commonReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-input rounded text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
