import React, { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

const SessionCalendar = ({ groupId, onSessionClick }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs().tz("Asia/Kolkata").toDate());

  useEffect(() => {
    if (groupId) {
      fetchSessions();
    }
  }, [groupId]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/groups/${groupId}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // ✅ Filter confirmed sessions
        const confirmed = data.filter((s) => s.confirmed && !s.isPoll);
        setSessions(confirmed);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Convert UTC → IST for display
 const formatTime = (dateTime) => {
  if (!dateTime) return '';
  return dayjs(dateTime).tz("Asia/Kolkata").format("hh:mm A");
};

const formatDate = (dateTime) => {
  if (!dateTime) return '';
  return dayjs(dateTime).tz("Asia/Kolkata").format("MMM D, YYYY");
};


  // ✅ Fix date filtering by converting to IST day
  const getSessionsForDate = (date) => {
    const selectedDay = dayjs(date).tz("Asia/Kolkata").format("YYYY-MM-DD");
    return sessions.filter((s) => {
      if (!s.startTime) return false;
      const sessionDay = dayjs.utc(s.startTime).tz("Asia/Kolkata").format("YYYY-MM-DD");
      return sessionDay === selectedDay;
    });
  };

  const todaySessions = getSessionsForDate(selectedDate);

  const upcomingSessions = sessions
    .filter((s) => s.startTime && dayjs.utc(s.startTime).isAfter(dayjs()))
    .sort((a, b) => dayjs.utc(a.startTime).diff(dayjs.utc(b.startTime)))
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Group Sessions
        </h3>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading sessions...</div>
      ) : (
        <div className="space-y-4">
          {/* Selected Date Sessions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="date"
                value={dayjs(selectedDate).format("YYYY-MM-DD")}
                onChange={(e) =>
                  setSelectedDate(dayjs(e.target.value).tz("Asia/Kolkata").toDate())
                }
                className="text-sm border border-gray-300 dark:border-dark-border rounded px-2 py-1 dark:bg-dark-input dark:text-white"
              />
            </div>
            {todaySessions.length > 0 ? (
              <div className="space-y-2">
                {todaySessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSessionClick?.(session)}
                    className="p-3 border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-input cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{session.title}</h4>
                        {session.description && (
                          <p className="text-sm text-gray-600 dark:text-dark-textSecondary mt-1 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-dark-textSecondary">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                      </span>
                      {session.rsvpCounts && (
                        <span className="flex items-center gap-1">
                          <UserGroupIcon className="h-4 w-4" />
                          {session.rsvpCounts.yes || 0} attending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-dark-textSecondary text-center py-4">
                No sessions on this date
              </p>
            )}
          </div>

          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upcoming</h4>
              <div className="space-y-2">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSessionClick?.(session)}
                    className="p-2 border border-gray-200 dark:border-dark-border rounded hover:bg-gray-50 dark:hover:bg-dark-input cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{session.title}</span>
                      <span className="text-xs text-gray-500">{formatDate(session.startTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionCalendar;