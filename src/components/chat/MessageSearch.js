import React, { useState, useMemo } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon, CalendarIcon } from '@heroicons/react/24/outline';

const MessageSearch = ({ groupId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    messageType: 'all', // all, text, file, poll, voice
    sender: 'all',
    dateRange: 'all' // all, today, week, month
  });
  const { getGroupMessages } = useChat();

  const messages = getGroupMessages(groupId);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && filters.messageType === 'all' && filters.sender === 'all' && filters.dateRange === 'all') {
      return [];
    }

    let filteredMessages = messages;

    // Text search
    if (searchQuery.trim()) {
      filteredMessages = filteredMessages.filter(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Message type filter
    if (filters.messageType !== 'all') {
      filteredMessages = filteredMessages.filter(msg => 
        msg.type === filters.messageType || 
        (filters.messageType === 'text' && !msg.type)
      );
    }

    // Sender filter
    if (filters.sender !== 'all') {
      filteredMessages = filteredMessages.filter(msg => msg.senderId === filters.sender);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const messageDate = new Date(msg.timestamp);
      
      filteredMessages = filteredMessages.filter(msg => {
        const msgDate = new Date(msg.timestamp);
        switch (filters.dateRange) {
          case 'today':
            return msgDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return msgDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return msgDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filteredMessages.slice(0, 20); // Limit results
  }, [searchQuery, messages, filters]);

  const uniqueSenders = useMemo(() => {
    const senders = new Set();
    messages.forEach(msg => {
      if (msg.senderId && msg.senderName) {
        senders.add(JSON.stringify({ id: msg.senderId, name: msg.senderName }));
      }
    });
    return Array.from(senders).map(sender => JSON.parse(sender));
  }, [messages]);

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'poll': return '📊';
      case 'file': return '📄';
      case 'voice': return '🎤';
      default: return '💬';
    }
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : 
        part
    );
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search messages, files, polls..."
            className="w-full px-3 py-2 pl-9 pr-10 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-input dark:text-dark-text text-sm"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-2 top-2 p-1 hover:bg-gray-100 dark:hover:bg-dark-border rounded transition ${
              Object.values(filters).some(f => f !== 'all') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
            }`}
            title="Filters"
          >
            <FunnelIcon className="h-4 w-4" />
          </button>
        </div>
        {(searchQuery || Object.values(filters).some(f => f !== 'all')) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilters({ messageType: 'all', sender: 'all', dateRange: 'all' });
              setIsOpen(false);
              setShowFilters(false);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-input rounded transition"
            title="Clear all"
          >
            <XMarkIcon className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-dark-input rounded-lg border border-gray-200 dark:border-dark-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                Message Type
              </label>
              <select
                value={filters.messageType}
                onChange={(e) => setFilters(prev => ({ ...prev, messageType: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
              >
                <option value="all">All Types</option>
                <option value="text">Text Messages</option>
                <option value="file">Files</option>
                <option value="poll">Polls</option>
                <option value="voice">Voice Messages</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                Sender
              </label>
              <select
                value={filters.sender}
                onChange={(e) => setFilters(prev => ({ ...prev, sender: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
              >
                <option value="all">All Senders</option>
                {uniqueSenders.map(sender => (
                  <option key={sender.id} value={sender.id}>{sender.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {isOpen && (searchQuery || Object.values(filters).some(f => f !== 'all')) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-dark-textSecondary text-sm">
              No messages found
            </div>
          ) : (
            <>
              <div className="p-2 border-b border-gray-200 dark:border-dark-border">
                <p className="text-xs text-gray-500 dark:text-dark-textSecondary">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-dark-border">
                {searchResults.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-dark-input transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{getMessageTypeIcon(msg.type)}</span>
                      <p className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary">
                        {msg.senderName}
                      </p>
                      <p className="text-xs text-gray-400 ml-auto">
                        {new Date(msg.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-dark-text">
                      {highlightText(msg.content, searchQuery)}
                    </p>
                    {msg.type === 'poll' && msg.poll && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Poll: {msg.poll.question}
                      </p>
                    )}
                    {msg.type === 'file' && msg.file && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        File: {msg.file.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;
