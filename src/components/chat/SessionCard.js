import React, { useState } from 'react';
import { CalendarIcon, ClockIcon, UserGroupIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

const SessionCard = ({ session, onRsvp, onViewDetails }) => {
  const { user } = useAuth();
  const userId = user?.id || localStorage.getItem("userId");
  const userRsvp = session.rsvpByUser && session.rsvpByUser[userId];

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            {session.title}
          </h4>
          {session.description && (
            <p className="text-sm text-gray-600 dark:text-dark-textSecondary mt-1 line-clamp-2">
              {session.description}
            </p>
          )}
        </div>
        {session.isPoll && !session.confirmed && (
          <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
            Poll
          </span>
        )}
      </div>

      {session.startTime && (
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-dark-textSecondary mb-3">
          <span className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            {formatDate(session.startTime)} {formatTime(session.startTime)} - {formatTime(session.endTime)}
          </span>
        </div>
      )}

      {session.confirmed && session.rsvpCounts && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <UserGroupIcon className="h-4 w-4" />
              {session.rsvpCounts.yes || 0} Yes
            </span>
            <span className="text-gray-600 dark:text-dark-textSecondary">
              {session.rsvpCounts.no || 0} No
            </span>
            <span className="text-gray-600 dark:text-dark-textSecondary">
              {session.rsvpCounts.maybe || 0} Maybe
            </span>
          </div>
        </div>
      )}

      {session.confirmed && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onRsvp?.(session, 'yes')}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition ${
              userRsvp?.response === 'yes'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => onRsvp?.(session, 'maybe')}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition ${
              userRsvp?.response === 'maybe'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800'
            }`}
          >
            Maybe
          </button>
          <button
            onClick={() => onRsvp?.(session, 'no')}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition ${
              userRsvp?.response === 'no'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
            }`}
          >
            No
          </button>
          <button
            onClick={() => onViewDetails?.(session)}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-dark-input text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-hover transition flex items-center gap-1"
          >
            <EyeIcon className="h-4 w-4" />
            Details
          </button>
        </div>
      )}

      {session.isPoll && !session.confirmed && (
        <div className="mt-3">
          <button
            onClick={() => onViewDetails?.(session)}
            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <EyeIcon className="h-4 w-4" />
            View Poll & Vote
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionCard;

