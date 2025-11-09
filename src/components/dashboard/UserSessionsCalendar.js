// import React, { useEffect, useMemo, useState } from 'react';
// import SessionDetailModal from '../chat/SessionDetailModal';

// const API_BASE = 'http://localhost:8080/api';

// const UserSessionsCalendar = () => {
//   const [joinedGroups, setJoinedGroups] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState(null);
//   const token = localStorage.getItem('token');
//   const userId = localStorage.getItem('userId');

//   useEffect(() => {
//     const load = async () => {
//       try {
//         // fetch joined groups
//         const res = await fetch(`${API_BASE}/groups/joined/${userId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const groups = res.ok ? await res.json() : [];
//         setJoinedGroups(groups || []);

//         // fetch sessions for each group
//         const all = [];
//         for (const g of groups || []) {
//           const sres = await fetch(`${API_BASE}/groups/${g.id}/sessions`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           if (sres.ok) {
//             const data = await sres.json();
//             const confirmed = (data || []).filter((s) => s.confirmed && s.startTime);
//             all.push(...confirmed);
//           }
//         }
//         setSessions(all);
//       } catch (e) {
//         console.error('Error loading sessions', e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [token, userId]);

//   // Local browser reminders
//   useEffect(() => {
//     if (!('Notification' in window)) return;
//     if (Notification.permission === 'default') Notification.requestPermission();

//     const now = Date.now();
//     const timers = [];
//     sessions.forEach((s) => {
//       const options = Array.isArray(s.reminderOptions) ? s.reminderOptions : [];
//       options.forEach((offset) => {
//         const at = new Date(s.startTime).getTime() - offset * 60 * 1000;
//         const delay = at - now;
//         if (delay > 0 && delay < 7 * 24 * 3600 * 1000) {
//           const t = setTimeout(() => {
//             try {
//               if (Notification.permission === 'granted') {
//                 new Notification(s.title || 'Session reminder', {
//                   body: `Starts in ${offset} minutes`,
//                 });
//               }
//             } catch {}
//           }, delay);
//           timers.push(t);
//         }
//       });
//     });
//     return () => timers.forEach(clearTimeout);
//   }, [sessions]);

//   const upcoming = useMemo(() => {
//     return [...sessions].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).slice(0, 8);
//   }, [sessions]);

//   const format = (dt) => new Date(dt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

//   return (
//     <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-4">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h3>
//       </div>
//       {loading ? (
//         <div className="py-6 text-center text-gray-500">Loading…</div>
//       ) : upcoming.length === 0 ? (
//         <div className="py-6 text-center text-gray-500">No upcoming sessions</div>
//       ) : (
//         <div className="space-y-2">
//           {upcoming.map((s) => (
//             <button
//               key={s.id}
//               onClick={() => setSelected(s)}
//               className="w-full text-left p-3 border border-gray-200 dark:border-dark-border rounded hover:bg-gray-50 dark:hover:bg-dark-hover"
//             >
//               <div className="flex items-center justify-between">
//                 <span className="font-medium text-gray-900 dark:text-white truncate">{s.title}</span>
//                 <span className="text-xs text-gray-500">{format(s.startTime)}</span>
//               </div>
//               {s.description && (
//                 <div className="text-xs text-gray-600 dark:text-dark-textSecondary line-clamp-1">{s.description}</div>
//               )}
//             </button>
//           ))}
//         </div>
//       )}

//       {selected && (
//         <SessionDetailModal
//           session={selected}
//           onClose={() => setSelected(null)}
//           onRsvp={() => {}}
//           onVote={() => {}}
//           onFinalize={() => {}}
//           isCreator={false}
//         />
//       )}
//     </div>
//   );
// };

// export default UserSessionsCalendar;





import React, { useEffect, useMemo, useState } from 'react';
import SessionDetailModal from '../chat/SessionDetailModal';

const API_BASE = 'http://localhost:8080/api';

const UserSessionsCalendar = () => {
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/groups/joined/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groups = res.ok ? await res.json() : [];
        setJoinedGroups(groups || []);

        const all = [];
        for (const g of groups || []) {
          const sres = await fetch(`${API_BASE}/groups/${g.id}/sessions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (sres.ok) {
            const data = await sres.json();
            const confirmed = (data || []).filter((s) => s.confirmed && s.startTime && s.endTime);
            all.push(...confirmed);
          }
        }
        setSessions(all);
      } catch (e) {
        console.error('Error loading sessions', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, userId]);

  // Reminder Notifications
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') Notification.requestPermission();

    const now = Date.now();
    const timers = [];
    sessions.forEach((s) => {
      const options = Array.isArray(s.reminderOptions) ? s.reminderOptions : [];
      options.forEach((offset) => {
        const at = new Date(s.startTime).getTime() - offset * 60 * 1000;
        const delay = at - now;
        if (delay > 0 && delay < 7 * 24 * 3600 * 1000) {
          const t = setTimeout(() => {
            if (Notification.permission === 'granted') {
              new Notification(s.title || 'Session reminder', {
                body: `Starts in ${offset} minutes`,
              });
            }
          }, delay);
          timers.push(t);
        }
      });
    });
    return () => timers.forEach(clearTimeout);
  }, [sessions]);

  // ✅ Split sessions based on end time
  const now = new Date();

  const upcoming = useMemo(() => {
    return sessions
      .filter((s) => new Date(s.endTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 8);
  }, [sessions]);

  const completed = useMemo(() => {
    return sessions
      .filter((s) => new Date(s.endTime) <= now)
      .sort((a, b) => new Date(b.endTime) - new Date(a.endTime))
      .slice(0, 8);
  }, [sessions]);

  const format = (dt) =>
    new Date(dt).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-4">
      {/* Upcoming Section */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h3>
      </div>
      {loading ? (
        <div className="py-6 text-center text-gray-500">Loading…</div>
      ) : upcoming.length === 0 ? (
        <div className="py-6 text-center text-gray-500">No upcoming sessions</div>
      ) : (
        <div className="space-y-2 mb-6">
          {upcoming.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="w-full text-left p-3 border border-gray-200 dark:border-dark-border rounded hover:bg-gray-50 dark:hover:bg-dark-hover transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white truncate">{s.title}</span>
                <span className="text-xs text-gray-500">{format(s.startTime)}</span>
              </div>
              {s.description && (
                <div className="text-xs text-gray-600 dark:text-dark-textSecondary line-clamp-1">
                  {s.description}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Completed Section */}
      <div className="flex items-center justify-between mt-6 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Completed Sessions</h3>
      </div>
      {completed.length === 0 ? (
        <div className="py-6 text-center text-gray-500">No completed sessions</div>
      ) : (
        <div className="space-y-2">
          {completed.map((s) => (
            <div
              key={s.id}
              className="w-full text-left p-3 border border-gray-200 dark:border-dark-border rounded bg-gray-50 dark:bg-dark-surface"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{s.title}</span>
                <span className="text-xs text-gray-500">{format(s.endTime)}</span>
              </div>
              {s.description && (
                <div className="text-xs text-gray-600 dark:text-dark-textSecondary line-clamp-1">
                  {s.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <SessionDetailModal
          session={selected}
          onClose={() => setSelected(null)}
          onRsvp={() => {}}
          onVote={() => {}}
          onFinalize={() => {}}
          isCreator={false}
        />
      )}
    </div>
  );
};

export default UserSessionsCalendar;
