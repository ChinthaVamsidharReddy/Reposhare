import React, { useState } from 'react';
import { XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

const SessionForm = ({ groupId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    isPoll: false,
    reminderOptions: [30, 15, 14],
    timeSlots: [{ startTime: '', endTime: '' }],
  });
  const [loading, setLoading] = useState(false);

  // Convert local time to IST and return ISO format
  const convertToIST = (dateString) => {
    const date = new Date(dateString);
    return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      const payload = {
        title: formData.title,
        description: formData.description,
        reminderOptions: formData.reminderOptions,
        createdBy: userId ? parseInt(userId, 10) : null,
      };

      if (formData.isPoll) {
        // Poll session with multiple time slots
        payload.isPoll = true;
        payload.timeSlots = formData.timeSlots
          .filter(slot => slot.startTime && slot.endTime)
          .map(slot => ({
            startTime: convertToIST(slot.startTime),
            endTime: convertToIST(slot.endTime),
          }));
      } else {
        // Confirmed session
        payload.isPoll = false;
        payload.startTime = convertToIST(formData.startTime);
        payload.endTime = convertToIST(formData.endTime);
      }

      const res = await fetch(`${API_BASE}/groups/${groupId}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 201) {
        try { await res.json(); } catch {}
        window.alert('Session created successfully');
        onSuccess?.();
        onClose();
      } else {
        let msg = 'Failed to create session';
        try { const j = await res.json(); msg = j.message || msg; } catch { const t = await res.text(); if (t) msg = t; }
        alert(msg);
      }
    } catch (err) {
      console.error('Error creating session:', err);
      alert('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      timeSlots: [...formData.timeSlots, { startTime: '', endTime: '' }],
    });
  };

  const removeTimeSlot = (index) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.filter((_, i) => i !== index),
    });
  };

  const updateTimeSlot = (index, field, value) => {
    const newSlots = [...formData.timeSlots];
    newSlots[index][field] = value;
    setFormData({ ...formData, timeSlots: newSlots });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Session</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-input rounded transition"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-input dark:text-white"
              placeholder="Study Session: Algorithms Review"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-input dark:text-white"
              placeholder="Discuss chapter 5 and solve practice problems..."
            />
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Session Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!formData.isPoll}
                  onChange={() => setFormData({ ...formData, isPoll: false })}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Confirmed Session</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.isPoll}
                  onChange={() => setFormData({ ...formData, isPoll: true })}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Poll (Multiple Time Slots)</span>
              </label>
            </div>
          </div>

          {/* Confirmed Session: Single Time */}
          {!formData.isPoll && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-input dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-input dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Poll Session: Multiple Time Slots */}
          {formData.isPoll && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Time Slots (Users will vote) *
              </label>
              <div className="space-y-3">
                {formData.timeSlots.map((slot, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="datetime-local"
                        required
                        value={slot.startTime}
                        onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-input dark:text-white"
                        placeholder="Start"
                      />
                      <input
                        type="datetime-local"
                        required
                        value={slot.endTime}
                        onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-input dark:text-white"
                        placeholder="End"
                      />
                    </div>
                    {formData.timeSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  + Add Time Slot
                </button>
              </div>
            </div>
          )}

          {/* Reminder Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Reminder Options (minutes before session)
            </label>
            <div className="flex gap-4 flex-wrap">
              {[30, 15, 14, 60, 120].map((minutes) => (
                <label key={minutes} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminderOptions.includes(minutes)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          reminderOptions: [...formData.reminderOptions, minutes].sort((a, b) => b - a),
                        });
                      } else {
                        setFormData({
                          ...formData,
                          reminderOptions: formData.reminderOptions.filter((m) => m !== minutes),
                        });
                      }
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{minutes}m</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-dark-input transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionForm;

