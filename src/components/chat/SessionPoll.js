import React, { useState } from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

const SessionPoll = ({ session, onVote, onFinalize, isCreator }) => {
  const { user } = useAuth();
  const userId = user?.id || localStorage.getItem("userId");
  const [voting, setVoting] = useState(false);

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleVote = async (timeSlot) => {
    if (voting) return;
    setVoting(true);

    try {
      const res = await fetch(`${API_BASE}/sessions/${session.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId ? parseInt(userId, 10) : null,
          startTime: new Date(timeSlot.startTime).toISOString(),
        }),
      });

      if (res.ok) {
        const updatedSession = await res.json();
        onVote?.(updatedSession);
      } else if (res.status === 403) {
        alert('Not authorized. Please sign in again.');
      } else {
        try { const j = await res.json(); alert(j.message || 'Failed to vote'); }
        catch { alert('Failed to vote'); }
      }
    } catch (err) {
      console.error('Error voting:', err);
      alert('Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const handleFinalize = async (selectedStartTime) => {
    if (!window.confirm('Finalize this session with the selected time slot?')) {
      return;
    }

    try {
      const adminId = userId ? parseInt(userId, 10) : null;
      const res = await fetch(
        `${API_BASE}/sessions/${session.id}/finalize?adminId=${adminId}&selectedStartTime=${new Date(selectedStartTime).toISOString()}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const finalized = await res.json();
        onFinalize?.(finalized);
      } else {
        alert('Failed to finalize session');
      }
    } catch (err) {
      console.error('Error finalizing:', err);
      alert('Failed to finalize session');
    }
  };

  // Find user's vote
  const userVote = session.timeSlotVotes?.find((slot, idx) => {
    // Check if user voted for this slot (we'd need to track this on backend or check votes)
    // For now, we'll show all slots and let user vote
    return false;
  });

  // Get vote counts from timeSlotVotes
  const getVoteCount = (timeSlot) => {
    const slot = session.timeSlotVotes?.find(
      (v) => new Date(v.startTime).getTime() === new Date(timeSlot.startTime).getTime()
    );
    return slot?.voteCount || 0;
  };

  // Find slot with most votes
  const getTopSlot = () => {
    if (!session.timeSlotVotes || session.timeSlotVotes.length === 0) return null;
    return session.timeSlotVotes.reduce((top, slot) =>
      (slot.voteCount || 0) > (top.voteCount || 0) ? slot : top
    );
  };

  const topSlot = getTopSlot();

  return (
    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{session.title}</h4>
      {session.description && (
        <p className="text-sm text-gray-600 dark:text-dark-textSecondary mb-4">{session.description}</p>
      )}

      <div className="space-y-2">
        {session.timeSlots?.map((slot, index) => {
          const voteCount = getVoteCount(slot);
          const isTop = topSlot && new Date(topSlot.startTime).getTime() === new Date(slot.startTime).getTime();

          return (
            <div
              key={index}
              className={`p-3 border rounded-lg transition ${
                isTop
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-dark-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(slot.startTime)} - {formatTime(slot.endTime)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {voteCount} vote{voteCount !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => handleVote(slot)}
                disabled={voting}
                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <CheckCircleIcon className="h-4 w-4" />
                Vote for this time
              </button>
            </div>
          );
        })}
      </div>

      {isCreator && topSlot && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
          <button
            onClick={() => handleFinalize(topSlot.startTime)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Finalize Session ({formatDate(topSlot.startTime)})
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionPoll;

