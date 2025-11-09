// src/components/widgets/MessagingWidget.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  ChatBubbleLeftIcon,
  XMarkIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  BellSlashIcon,
} from "@heroicons/react/24/outline";
import MessageBubble from "../chat/MessageBubble"; // adjust import path to your project
import MessageInput from "../chat/MessageInput"; // optional - if you want to reuse your MessageInput

const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

const MessagingWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    _subscribeToGroup,
    closeGroup,
    sendMessage,
    getGroupMessages,
    getUnreadCount,
    markAsRead,
  } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // old messages fetched from backend (paginated/initial)
  const [oldMessages, setOldMessages] = useState([]);
  const [loadingOld, setLoadingOld] = useState(false);

  const [newMessage, setNewMessage] = useState("");

  const observerRef = useRef(null);
  const observedIdsRef = useRef(new Set());
  const messagesEndRef = useRef(null);

  // Load groups (created + joined) - same pattern as you used before
  const loadGroups = async () => {
    const id = user?.id || localStorage.getItem("userId");
    const t = user?.token || localStorage.getItem("token");
    if (!id || !t) return;

    try {
      const [createdRes, joinedRes] = await Promise.all([  
        fetch(`${API_BASE}/groups/created/${id}`, {
          headers: { Authorization: `Bearer ${t}` },
        }),
        fetch(`${API_BASE}/groups/joined/${id}`, {
          headers: { Authorization: `Bearer ${t}` },
        }),
      ]);

      const createdGroups = (await createdRes.json()) || [];
      const joinedGroupsRes = (await joinedRes.json()) || [];

      // merge dedupe & filter archived
      const allMap = new Map();
      [...createdGroups, ...joinedGroupsRes].forEach((g) => {
        if (g && g.id) allMap.set(g.id, g);
      });
      const allGroups = Array.from(allMap.values()).filter((g) => !g.archived);

      setJoinedGroups(allGroups);
      localStorage.setItem("studyGroups", JSON.stringify(allGroups));
    } catch (err) {
      console.error("Error loading groups:", err);
      // fallback
      const cached = JSON.parse(localStorage.getItem("studyGroups") || "[]");
      setJoinedGroups(cached);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [user?.id]);

  // fetch old messages (same normalization + status logic you provided)
  const fetchOldMessages = async (groupId) => {
    setLoadingOld(true);
    try {
      const res = await fetch(`${API_BASE}/chat/messages/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error("Failed to fetch old messages:", res.status);
        setOldMessages([]);
        return;
      }
      let data = await res.json();

      // Normalize poll messages (same as ChatPage)
      data = data.map((m) => {
        if (m.type === "poll" || m.pollQuestion) {
          return {
            id: m.id,
            type: "poll",
            poll: {
              id: m.pollId || m.id,
              question: m.pollQuestion || m.content,
              options: m.pollOptions || m.options || [],
              allowMultiple: m.allowMultiple || false,
              anonymous: m.anonymous || false,
              createdAt: m.createdAt,
            },
            senderId: m.senderId,
            senderName: m.senderName,
            timestamp: m.createdAt,
          };
        }
        return m;
      });

      // compute initial status for own messages if delivered/read arrays provided
      const currentUserId = user?.id || localStorage.getItem("userId");
      const withStatus = (data || []).map((m) => {
        if (String(m.senderId) !== String(currentUserId)) return m;
        const total = Number.isInteger(m.totalRecipients)
          ? m.totalRecipients
          : undefined;
        const delivered = Array.isArray(m.deliveredBy) ? m.deliveredBy.length : 0;
        const read = Array.isArray(m.readBy) ? m.readBy.length : 0;
        if (total != null) {
          if (read >= total) return { ...m, status: "read" };
          if (delivered >= total) return { ...m, status: "delivered" };
          return { ...m, status: "sent" };
        }
        return m;
      });

      setOldMessages(withStatus);
    } catch (err) {
      console.error("Error fetching old messages:", err);
      setOldMessages([]);
    } finally {
      setLoadingOld(false);
    }
  };

  // IntersectionObserver for read receipts (same logic as ChatPage)
  useEffect(() => {
    if (!selectedGroup) return;
    const groupId = selectedGroup.id;
    const currentUserId = user?.id || localStorage.getItem("userId");

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const idsToAck = [];
        // merge local oldMessages + live messages
        const live = getGroupMessages(groupId) || [];
        const mergedList = [...oldMessages, ...live];

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const id = el.getAttribute("data-message-id");
          if (id && !observedIdsRef.current.has(id)) {
            const msg = mergedList.find((m) => String(m.id) === String(id));
            if (msg && String(msg.senderId) !== String(currentUserId)) {
              observedIdsRef.current.add(id);
              idsToAck.push(id);
            }
          }
        });

        if (idsToAck.length > 0) {
          try {
            const evt = new CustomEvent("chat:readReceipt", {
              detail: { groupId, messageIds: idsToAck },
            });
            window.dispatchEvent(evt);
          } catch (e) {
            /* ignore */
          }
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.6 }
    );

    // Observe message nodes (small delay to ensure DOM rendered)
    setTimeout(() => {
      document.querySelectorAll("[data-message-id]")?.forEach((el) => {
        observerRef.current?.observe(el);
      });
    }, 120);

    return () => {
      observerRef.current?.disconnect();
      observedIdsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup, oldMessages]); // live messages are read inside observer via getGroupMessages

  // subscribe/unsubscribe when selecting a group
  useEffect(() => {
    if (!selectedGroup) return;

    const gid = selectedGroup.id;
    // mark as read locally & fetch old messages
    markAsRead(gid);
    fetchOldMessages(gid);

    // subscribe to STOMP topic for this group
    try {
      if (typeof _subscribeToGroup === "function") {
        _subscribeToGroup(gid);
      }
    } catch (err) {
      console.warn("subscribe failed", err);
    }

    // cleanup when switching away
    return () => {
      try {
        if (typeof closeGroup === "function") {
          closeGroup(gid);
        }
      } catch (err) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  // Merge old + live messages and sort by timestamp
  const combinedMessages = React.useMemo(() => {
    if (!selectedGroup) return [];
    const gid = selectedGroup.id;
    const live = (getGroupMessages(gid) || []).slice();
    const merged = [...(oldMessages || []), ...live];

    // dedupe by id (prefer live message object when ids match)
    const map = new Map();
    for (const m of merged) {
      const key = m.id || `${m.type || "text"}-${m.timestamp || Math.random()}`;
      if (!map.has(String(key))) map.set(String(key), m);
    }
    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const tA = new Date(a.timestamp || a.createdAt || 0).getTime();
      const tB = new Date(b.timestamp || b.createdAt || 0).getTime();
      return tA - tB;
    });
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oldMessages, getGroupMessages, selectedGroup]);

  // Helper to group by date label (Today / Yesterday / dd MMM yyyy)
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((m) => {
      const date = new Date(m.timestamp || m.createdAt || Date.now());
      const today = new Date();
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const diffDays = Math.round((t - d) / (1000 * 60 * 60 * 24));
      let label;
      if (diffDays === 0) label = "Today";
      else if (diffDays === 1) label = "Yesterday";
      else
        label = date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

      if (!groups[label]) groups[label] = [];
      groups[label].push(m);
    });
    return groups;
  };

  const handleSelectGroup = (g) => {
    setSelectedGroup(g);
  };

  const handleBackToList = () => {
    if (selectedGroup) {
      closeGroup(selectedGroup.id);
      setSelectedGroup(null);
      setOldMessages([]);
      observedIdsRef.current.clear();
    }
  };

  const handleSend = (text) => {
    if (!selectedGroup) return;
    if (!text?.trim()) return;
    sendMessage(selectedGroup.id, text.trim());
    // optimistic scroll
    setTimeout(() => scrollToBottom(), 50);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // whenever combinedMessages changes, scroll to bottom slightly
    scrollToBottom();
  }, [combinedMessages.length]);

  // Rendering helpers
  const grouped = groupMessagesByDate(combinedMessages);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((s) => !s)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition transform hover:scale-110 z-40"
        title="Messages"
      >
        <div className="relative">
          <ChatBubbleLeftIcon className="h-6 w-6" />
          {joinedGroups.reduce((sum, g) => sum + (getUnreadCount(g.id) || 0), 0) > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {joinedGroups.reduce((sum, g) => sum + (getUnreadCount(g.id) || 0), 0) > 9 ? "9+" : joinedGroups.reduce((sum, g) => sum + (getUnreadCount(g.id) || 0), 0)}
            </span>
          )}
        </div>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[30rem] bg-white dark:bg-dark-surface rounded-lg shadow-2xl z-50 flex flex-col">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!selectedGroup ? (
                <h3 className="font-semibold">Messages</h3>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={handleBackToList} className="p-1">
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <h3 className="font-semibold">{selectedGroup.name}</h3>
                </div>
              )}
            </div>

            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-blue-700 rounded">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Group list */}
          {!selectedGroup ? (
            <div className="flex-1 overflow-y-auto">
              {joinedGroups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSelectGroup(g)}
                  className="w-full px-4 py-3 border-b border-gray-100 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-2xl">💬</div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{g.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        { (getGroupMessages(g.id) || []).slice(-1)[0]?.content || "No messages yet" }
                      </div>
                    </div>
                  </div>

                  <div>
                    {getUnreadCount(g.id) > 0 && (
                      <span className={`text-white text-xs rounded-full w-6 h-6 flex items-center justify-center ${getUnreadCount(g.id) ? "bg-red-500" : "bg-gray-400"}`}>
                        {getUnreadCount(g.id) > 9 ? "9+" : getUnreadCount(g.id)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Chat view
            <div className="flex-1 flex flex-col">
              <div
  className="flex-1 px-3 py-3 space-y-3 overflow-y-auto"
  style={{ maxHeight: "calc(30rem - 70px)" }}   // header + input removed height
>

                {loadingOld && <div className="text-xs text-gray-500">Loading messages...</div>}

                {Object.entries(grouped).map(([dateLabel, msgs]) => (
                  <div key={dateLabel}>
                    <div className="flex justify-center my-2">
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs px-3 py-1 rounded-full">
                        {dateLabel}
                      </span>
                    </div>

                    {msgs.map((msg) => {
                      // Poll normalization if needed: message.type === 'poll'
                      if (msg.type === "poll" || msg.poll) {
                        // you already have a PollDisplay component in ChatPage - reuse it if desired
                        // For minimal widget, show MessageBubble which handles poll too (your MessageBubble already renders PollDisplay)
                      }
                      return (
                        <div key={msg.id || `${msg.type}-${msg.timestamp}`} data-message-id={msg.id || ""}>
                          <MessageBubble
                            message={msg}
                            isOwn={String(msg.senderId) === String(user?.id || localStorage.getItem("userId"))}
                            onReply={() => {}}
                            onReaction={() => {}}
                            onPollVote={() => {}}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t bg-white sticky bottom-0">

                {/* If you have MessageInput component that fits, use it. Otherwise minimal input below: */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSend(newMessage);
                        setNewMessage("");
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-md border bg-gray-50 dark:bg-dark-input text-sm"
                  />
                  <button
                    onClick={() => {
                      handleSend(newMessage);
                      setNewMessage("");
                    }}
                    className="bg-blue-600 text-white px-3 py-2 rounded-md"
                  >
                      <PaperAirplaneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MessagingWidget;