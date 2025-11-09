// src/components/chat/MessageInput.js
import React, { useState, useEffect, useRef } from "react";
import {
  PaperAirplaneIcon,
  XMarkIcon,
  ChartBarIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import EmojiPicker from "./EmojiPicker";
import PollCreator from "./PollCreator";
import { useAuth } from "../../contexts/AuthContext";
import FileUpload from "./FileUpload";



const MessageInput = ({
  onSendMessage,
  onSendPoll,
  onSendFile,  
  onTyping,
  replyTo,
  onCancelReply,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState("");
  const [showPollCreator, setShowPollCreator] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const { user } = useAuth();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [message]);

  // Typing events (debounced)
  const handleTyping = (value) => {
    setMessage(value);
    if (!onTyping) return;
    if (!isTypingRef.current && value.trim().length > 0) {
      isTypingRef.current = true;
      onTyping(true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        onTyping(false);
        isTypingRef.current = false;
      }
    }, 1200);
  };

  // Send message
  const handleSend = (e) => {
    e?.preventDefault();
    const content = message.trim();
    if (!content) return;
    onSendMessage({ content, type: "text", replyTo: replyTo || null });
    setMessage("");
    if (isTypingRef.current) {
      onTyping(false);
      isTypingRef.current = false;
    }
    if (replyTo) onCancelReply?.();
  };

  // Enter to send (Shift+Enter → newline)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Create poll
  const handlePollCreate = (poll) => {
    const creatorId = user?.id || localStorage.getItem("userId");
    const creatorName =
      user?.name || user?.username || localStorage.getItem("name") || "Anonymous";
    const pollWithCreator = { ...poll, creatorId, creatorName };
    onSendPoll?.(pollWithCreator);
    onCancelReply?.();
    setShowPollCreator(false);
  };

  // Emoji select
  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setMessage(message + emoji);
    }
  };

   // ✅ Handle file upload
  const handleFileSelect = (fileData) => {
    const messageData = {
      type: fileData.type === "voice" ? "voice" : "file",
      file: fileData,
      content:
        fileData.type === "voice" ? "Voice message" : fileData.name || "File",
      replyTo: replyTo || null,
    };
    onSendFile?.(messageData);
    onCancelReply?.();
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current) onTyping(false);
    };
  }, []);
return (
    <div className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border">
      {/* Reply Section */}
      {replyTo && (
        <div className="px-3 sm:px-4 py-2 bg-gray-50 dark:bg-dark-input border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <ArrowUturnLeftIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-dark-textSecondary">
                  Replying to {replyTo.senderName}
                </p>
                <p className="text-sm text-gray-900 dark:text-dark-text truncate">
                  {replyTo.content}
                </p>
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1 hover:bg-gray-200 dark:hover:bg-dark-border rounded flex-shrink-0"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Main Input Row */}
      <div className="px-3 sm:px-4 py-3">
        <form onSubmit={handleSend} className="flex items-end gap-2 sm:gap-3">
          {/* Left controls - Mobile & Desktop */}
          <div className="flex items-center gap-1 pb-2">
            <FileUpload
              onFileSelect={handleFileSelect}
            />
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            <button
              type="button"
              onClick={() => setShowPollCreator(true)}
              className="p-1.5 sm:p-2 text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-input rounded-lg transition"
              title="Create poll"
            >
              <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Message Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-dark-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-input dark:text-dark-text resize-none transition scrollbar-hide overflow-hidden"
              style={{ 
                minHeight: "40px", 
                maxHeight: "100px",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
            />
          </div>

          {/* Send Button */}
          <div className="pb-1">
            <button
              type="submit"
              disabled={!message.trim()}
              className="h-10 w-10 sm:h-11 sm:w-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
              style={{ minHeight: "40px", minWidth: "40px" }}
            >
              <PaperAirplaneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Poll Creator Modal */}
      {showPollCreator && (
        <PollCreator
          onCreatePoll={handlePollCreate}
          onClose={() => setShowPollCreator(false)}
        />
      )}
    </div>
  );
};

export default MessageInput;
