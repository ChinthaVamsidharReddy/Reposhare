import React, { useState } from 'react';
import { XMarkIcon, CalendarIcon, ClockIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import SessionPoll from './SessionPoll';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

const SessionDetailModal = ({ session, onClose, onRsvp, onVote, onFinalize, isCreator }) => {
  const { user } = useAuth();
  const userId = user?.id || localStorage.getItem("userId");
  const userRsvp = session.rsvpByUser && session.rsvpByUser[userId];
  const [syncing, setSyncing] = useState(false);

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRsvp = async (response) => {
    await onRsvp?.(session, response);
  };

  const handleSyncGoogleCalendar = async () => {
    setSyncing(true);
    // Scaffold for Google Calendar OAuth2 integration
    // In production, this would:
    // 1. Open OAuth2 consent screen
    // 2. Get access token
    // 3. Create calendar event via Google Calendar API
    alert('Google Calendar sync - OAuth2 integration scaffolded. In production, this would sync the session to your Google Calendar.');
    setSyncing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {session.title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-input rounded transition"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Description */}
          {session.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h4>
              <p className="text-sm text-gray-600 dark:text-dark-textSecondary">{session.description}</p>
            </div>
          )}

          {/* Poll Session */}
          {session.isPoll && !session.confirmed && (
            <SessionPoll
              session={session}
              onVote={onVote}
              onFinalize={onFinalize}
              isCreator={isCreator}
            />
          )}

          {/* Confirmed Session */}
          {session.confirmed && session.startTime && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-textSecondary">
                <ClockIcon className="h-4 w-4" />
                <span>{formatDate(session.startTime)}</span>
                <span>-</span>
                <span>{formatTime(session.endTime)}</span>
              </div>

              {/* RSVP Counts */}
              {session.rsvpCounts && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <UserGroupIcon className="h-4 w-4" />
                    {session.rsvpCounts.yes || 0} Yes
                  </span>
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {session.rsvpCounts.maybe || 0} Maybe
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    {session.rsvpCounts.no || 0} No
                  </span>
                </div>
              )}

              {/* RSVP Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRsvp('yes')}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg transition ${
                    userRsvp?.response === 'yes'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                  }`}
                >
                  <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                  Yes
                </button>
                <button
                  onClick={() => handleRsvp('maybe')}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg transition ${
                    userRsvp?.response === 'maybe'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                  }`}
                >
                  Maybe
                </button>
                <button
                  onClick={() => handleRsvp('no')}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg transition ${
                    userRsvp?.response === 'no'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                  }`}
                >
                  No
                </button>
              </div>

              {/* Google Calendar Sync */}
              <button
                onClick={handleSyncGoogleCalendar}
                disabled={syncing}
                className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {syncing ? 'Syncing...' : 'Sync to Google Calendar'}
              </button>
            </>
          )}

          {/* Reminder Options */}
          {session.reminderOptions && session.reminderOptions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reminders</h4>
              <p className="text-sm text-gray-600 dark:text-dark-textSecondary">
                You'll receive reminders {session.reminderOptions.join(', ')} minutes before the session.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetailModal;

