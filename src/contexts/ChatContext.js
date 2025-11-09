// src/context/ChatContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const ChatContext = createContext();
export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [unreadCount, setUnreadCount] = useState({});

  const stompRef = useRef(null);
  const subscriptionsRef = useRef({});
  const messageQueueRef = useRef([]);
  const subQueueRef = useRef(new Set());
  const typingTimeoutRef = useRef({});
  const deliveredAckedRef = useRef(new Set());
  const readAckedRef = useRef(new Set());

  const SOCKJS_URL =
    process.env.REACT_APP_WS_URL || "http://localhost:8080/ws/chat";

  /* ---------------------- STOMP Connection ---------------------- */
  const connectStomp = () => {
    if (stompRef.current && stompRef.current.connected) {
      console.log("[chat] STOMP already connected - reuse");
      return;
    }

    const token = localStorage.getItem("token") || "";

    const socketFactory = () => new SockJS(SOCKJS_URL);
    const client = new Client({
      webSocketFactory: socketFactory,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => {
        if (msg && typeof msg === "string") console.log("[STOMP]", msg);
      },
    });

    client.connectHeaders = { Authorization: token ? `Bearer ${token}` : "" };

    client.onConnect = (frame) => {
      console.log("[chat] ✅ STOMP connected:", frame?.headers);
      stompRef.current = client;
      setConnected(true);

      // Resubscribe to queued groups
      if (subQueueRef.current.size > 0) {
        subQueueRef.current.forEach((gId) => _subscribeToGroup(gId));
        subQueueRef.current.clear();
      }

      // Flush queued messages
      if (messageQueueRef.current.length > 0) {
        messageQueueRef.current.forEach(({ destination, body }) => {
          try {
            client.publish({ destination, body });
          } catch (err) {
            console.error("[chat] publish failed during flush", err);
          }
        });
        messageQueueRef.current = [];
      }
    };

    client.onWebSocketClose = () => setConnected(false);
    client.onDisconnect = () => setConnected(false);
    client.onStompError = (frame) =>
      console.error("[chat] ❌ Broker error:", frame?.headers?.message || frame);

    stompRef.current = client;
    client.activate();
  };

  useEffect(() => {
    if (!user?.id && !localStorage.getItem("token")) return;
    connectStomp();

    const onReadReceipt = (e) => {
      const detail = e?.detail || {};
      const { groupId, messageIds } = detail;
      if (!groupId || !Array.isArray(messageIds) || messageIds.length === 0) return;
      const userId = user?.id || localStorage.getItem("userId");
      const toSend = messageIds
        .map((id) => String(id))
        .filter((id) => !readAckedRef.current.has(id));
      if (toSend.length === 0) return;
      toSend.forEach((id) => readAckedRef.current.add(id));
      _publishOrQueue("/app/chat.read", {
        groupId,
        messageIds: toSend,
        userId,
        readAt: new Date().toISOString(),
      });
    };
    window.addEventListener("chat:readReceipt", onReadReceipt);

    return () => {
      const client = stompRef.current;
      if (client) {
        Object.values(subscriptionsRef.current).forEach((sub) =>
          sub.unsubscribe?.()
        );
        subscriptionsRef.current = {};
        if (client.active) client.deactivate();
      }
      stompRef.current = null;
      setConnected(false);
      messageQueueRef.current = [];
      subQueueRef.current.clear();
      window.removeEventListener("chat:readReceipt", onReadReceipt);
    };
  }, [user?.id]);

  /* ---------------------- Helper: Add Message ---------------------- */
  const addMessage = (groupId, msg) => {
    setMessages((prev) => {
      const arr = Array.isArray(prev[groupId]) ? [...prev[groupId]] : [];

      const exists = arr.some(
        (m) =>
          (m.id && msg.id && String(m.id) === String(msg.id)) ||
          (m.content === msg.content &&
            m.timestamp === msg.timestamp &&
            m.senderId === msg.senderId)
      );
      if (exists) return prev;

      arr.push(msg);
      return { ...prev, [groupId]: arr };
    });
  };

  /* ---------------------- Group Subscription ---------------------- */
  const _subscribeToGroup = (groupId) => {
    const client = stompRef.current;
    if (!client || !client.connected) {
      subQueueRef.current.add(groupId);
      return;
    }
    if (subscriptionsRef.current[groupId]) return;

    console.log(`[chat] 🔹 Subscribing to /topic/group.${groupId}`);
    const sub = client.subscribe(`/topic/group.${groupId}`, (msg) => {
      try {
        const payload = JSON.parse(msg.body); // ✅ define payload FIRST
        handleIncoming(payload, String(groupId)); // Pass groupId from topic
      } catch (err) {
        console.error("[chat] Invalid message payload", err);
      }
    });

    subscriptionsRef.current[groupId] = sub;

    // Also subscribe to new chat topic for status payloads
    console.log(`[chat] 🔹 Subscribing to /topic/chat.${groupId}`);
    const sub2 = client.subscribe(`/topic/chat.${groupId}`, (msg) => {
      try {
        const payload = JSON.parse(msg.body);
        handleIncoming(payload, String(groupId)); // Pass groupId from topic
      } catch (err) {
        console.error("[chat] Invalid message payload (chat)", err);
      }
    });
    subscriptionsRef.current[`${groupId}::chat`] = sub2;
  };

  const unsubscribeGroup = (groupId) => {
    const sub = subscriptionsRef.current[groupId];
    if (sub) sub.unsubscribe?.();
    delete subscriptionsRef.current[groupId];
    subQueueRef.current.delete(groupId);
    if (activeGroup === groupId) setActiveGroup(null);
    console.log("[chat] 🔹 Unsubscribed from", groupId);
  };

  /* ---------------------- Message Handling ---------------------- */
  const handleIncoming = (payload, topicGroupId = null) => {
    console.log("📥 [Chat] Incoming:", payload);
    const { type } = payload;
    // Extract groupId - can be from payload.groupId, content, or topic context
    let groupId = payload.groupId;
    
    // If groupId is missing, try to extract from various places
    if (groupId === undefined || groupId === null) {
      // Try to extract from content if it's a poll or has groupId
      if (payload.content && payload.content.groupId !== undefined) {
        groupId = payload.content.groupId;
      }
      // Use topic groupId as fallback (from subscription context)
      if ((groupId === undefined || groupId === null) && topicGroupId) {
        groupId = topicGroupId;
      }
      // Use activeGroup as last resort
      if ((groupId === undefined || groupId === null) && activeGroup) {
        groupId = activeGroup;
      }
    }
    
    // Convert groupId to string for consistency if it's a number
    if (typeof groupId === 'number') {
      groupId = String(groupId);
    }
    
    if (!groupId) {
      console.warn("[chat] No groupId in payload:", payload);
      return;
    }

// helper to update status in a single place
  const updateMessageStatus = (messageId, deliveredBy = [], readBy = [], totalRecipients, statusType) => {
    setMessages((prev) => {
      const arr = Array.isArray(prev[groupId]) ? [...prev[groupId]] : [];
      const updated = arr.map((m) => {
        if (String(m.id) === String(messageId)) {
          const isOwn = String(m.senderId) === String(user?.id || localStorage.getItem("userId"));
          const delivered = Array.isArray(deliveredBy) ? deliveredBy : m.deliveredBy || [];
          const readArr = Array.isArray(readBy) ? readBy : m.readBy || [];
          const total = Number.isInteger(totalRecipients) ? totalRecipients : m.totalRecipients || 1;

          let status = m.status;
          if (isOwn) {
            if ((readArr?.length || 0) >= total) status = "read";
            else if ((delivered?.length || 0) >= total) status = "delivered";
            else status = "sent";
          }

          return { ...m, deliveredBy: delivered, readBy: readArr, totalRecipients: total, status };
        }
        return m;
      });
      return { ...prev, [groupId]: updated };
    });
  };

    switch (type) {
/* ---------- DELIVERY OR READ RECEIPTS ---------- */
    case "status":
    case "delivered":
    case "read_receipt": {
      const content = payload.message || payload.content || payload;
      const { messageId, deliveredBy, readBy, totalRecipients, statusType } = content || {};
      if (!messageId) return;
      updateMessageStatus(messageId, deliveredBy, readBy, totalRecipients, statusType);
      break;
    }

    /* ---------- TYPING INDICATOR ---------- */
    case "typing": {
      const tUser = payload.message || payload;
      if (!tUser?.userId || tUser.userId === user?.id) return;
      const normalizedUser = {
        userId: String(tUser.userId),
        userName: tUser.userName || tUser.username || tUser.name || "Someone",
      };
      setTypingUsers((prev) => {
        const existing = prev[groupId] || [];
        const updated = [...existing.filter((u) => u.userId !== normalizedUser.userId), normalizedUser];
        return { ...prev, [groupId]: updated };
      });
      break;
    }
      case "message": {
        const msg = payload.message;
        if (!msg?.senderId) return;

        setMessages((prev) => {
          const arr = Array.isArray(prev[groupId]) ? [...prev[groupId]] : [];

          const duplicate = arr.some(
            (m) =>
              (m.id && msg.id && String(m.id) === String(msg.id)) ||
              (m.localOnly &&
                m.content === msg.content &&
                String(m.senderId) === String(msg.senderId) &&
                Math.abs(new Date(msg.timestamp) - new Date(m.timestamp)) < 1500)
          );
          if (duplicate) return prev;

          const filtered = arr.filter(
            (m) =>
              !(
                m.localOnly &&
                m.content === msg.content &&
                String(m.senderId) === String(msg.senderId)
              )
          );

          const isOwn = String(msg.senderId) === String(user?.id || localStorage.getItem("userId"));
          // server may include deliveredBy/readBy/totalRecipients
          const deliveredBy = Array.isArray(msg.deliveredBy) ? msg.deliveredBy : [];
          const readBy = Array.isArray(msg.readBy) ? msg.readBy : [];
          const totalRecipients = Number.isInteger(msg.totalRecipients) ? msg.totalRecipients : undefined;
          const status = isOwn ? "sent" : undefined;
          filtered.push({ ...msg, localOnly: false, status, deliveredBy, readBy, totalRecipients });
          return { ...prev, [groupId]: filtered };
        });

        if (activeGroup !== groupId) {
          setUnreadCount((prev) => ({
            ...prev,
            [groupId]: (prev[groupId] || 0) + 1,
          }));
        }

        // auto-delivery ack for messages from others
        const currentUserId = user?.id || localStorage.getItem("userId");
        if (String(msg.senderId) !== String(currentUserId) && msg.id) {
          const key = String(msg.id);
          if (!deliveredAckedRef.current.has(key)) {
            deliveredAckedRef.current.add(key);
            _publishOrQueue("/app/chat.delivered", {
              groupId,
              messageId: msg.id,
              userId: currentUserId,
              deliveredAt: new Date().toISOString(),
            });
          }
        }
        break;
      }
      case "delivered": {
        const upd = payload.message || payload.content || payload;
        const { messageId, deliveredBy, readBy, totalRecipients } = upd;
        if (!messageId) return;
        setMessages((prev) => {
          const arr = Array.isArray(prev[groupId]) ? [...prev[groupId]] : [];
          const updated = arr.map((m) => {
            if (String(m.id) === String(messageId)) {
              const isOwn = String(m.senderId) === String(user?.id || localStorage.getItem("userId"));
              const delivered = Array.isArray(deliveredBy) ? deliveredBy : (Array.isArray(m.deliveredBy) ? m.deliveredBy : []);
              const readArr = Array.isArray(readBy) ? readBy : (Array.isArray(m.readBy) ? m.readBy : []);
              const total = Number.isInteger(totalRecipients) ? totalRecipients : m.totalRecipients;
              let status = m.status;
              if (isOwn && total != null) {
                if ((readArr?.length || 0) >= total) status = "read";
                else if ((delivered?.length || 0) >= total) status = "delivered";
                else status = "sent";
              }
              return { ...m, deliveredBy: delivered, readBy: readArr, totalRecipients: total, status };
            }
            return m;
          });
          return { ...prev, [groupId]: updated };
        });
        break;
      }

      case "read_receipt": {
        const upd = payload.message || payload.content || payload;
        const { messageId, deliveredBy, readBy, totalRecipients } = upd;
        if (!messageId) return;
        setMessages((prev) => {
          const arr = Array.isArray(prev[groupId]) ? [...prev[groupId]] : [];
          const updated = arr.map((m) => {
            if (String(m.id) === String(messageId)) {
              const isOwn = String(m.senderId) === String(user?.id || localStorage.getItem("userId"));
              const delivered = Array.isArray(deliveredBy) ? deliveredBy : (Array.isArray(m.deliveredBy) ? m.deliveredBy : []);
              const readArr = Array.isArray(readBy) ? readBy : (Array.isArray(m.readBy) ? m.readBy : []);
              const total = Number.isInteger(totalRecipients) ? totalRecipients : m.totalRecipients;
              let status = m.status;
              if (isOwn && total != null) {
                if ((readArr?.length || 0) >= total) status = "read";
                else if ((delivered?.length || 0) >= total) status = "delivered";
                else status = "sent";
              }
              return { ...m, deliveredBy: delivered, readBy: readArr, totalRecipients: total, status };
            }
            return m;
          });
          return { ...prev, [groupId]: updated };
        });
        break;
      }

      case "typing": {
        const tUser = payload.message || payload;
        if (!tUser?.userId || tUser.userId === user?.id) return;

        const normalizedUser = {
          userId: String(tUser.userId),
          userName: tUser.userName || tUser.username || tUser.name || "Someone",
        };

        setTypingUsers((prev) => {
          const existing = prev[groupId] || [];
          const updated = [
            ...existing.filter((u) => u.userId !== normalizedUser.userId),
            normalizedUser,
          ];
          return { ...prev, [groupId]: updated };
        });
        break;
      }

      case "typing_stop": {
        const tUser = payload.message || payload;
        if (!tUser?.userId) return;
        setTypingUsers((prev) => ({
          ...prev,
          [groupId]: (prev[groupId] || []).filter(
            (u) => u.userId !== String(tUser.userId)
          ),
        }));
        break;
      }

case "poll": {
  const pollData = payload.content || payload;
  if (!pollData || !pollData.id) return;

  // ✅ Create properly formatted poll message with all required fields
  const pollMessage = {
    id: `poll-${pollData.id}`,
    type: "poll",
    poll: {
      id: pollData.id,
      question: pollData.question,
      options: pollData.options || [],
      allowMultiple: pollData.allowMultiple || false,
      anonymous: pollData.anonymous || false,
      totalVotes: pollData.totalVotes || 0,
      createdAt: pollData.createdAt,
      creatorId: pollData.creatorId || pollData.createdBy,
      creatorName: pollData.creatorName,
    },
    senderId: pollData.creatorId || pollData.createdBy || null,
    senderName: pollData.creatorName || "Unknown",
    timestamp: pollData.createdAt || new Date().toISOString(),
    groupId: groupId, // Use the extracted groupId from handleIncoming
    localOnly: false,
  };

  setMessages((prev) => {
    const arr = Array.isArray(prev[groupId]) ? [...prev[groupId]] : [];

    // ✅ Check for duplicates by poll.id
    const exists = arr.some(
      (m) =>
        m.type === "poll" &&
        (String(m.poll?.id) === String(pollData.id) ||
         String(m.id) === String(pollMessage.id))
    );
    if (exists) {
      // Update existing poll instead of skipping
      return {
        ...prev,
        [groupId]: arr.map((m) =>
          m.type === "poll" && String(m.poll?.id) === String(pollData.id)
            ? pollMessage
            : m
        ),
      };
    }

    arr.push(pollMessage);
    return { ...prev, [groupId]: arr };
  });

    // ✅ Also dispatch event to update oldMessages in ChatPage
    try {
      const event = new CustomEvent("poll:created", {
        detail: { groupId: groupId, pollMessage },
      });
      window.dispatchEvent(event);
    } catch (e) {
      console.error("Error dispatching poll created event:", e);
    }

  // ✅ Increment unread count if not active group
  if (activeGroup !== groupId) {
    setUnreadCount((prev) => ({
      ...prev,
      [groupId]: (prev[groupId] || 0) + 1,
    }));
  }

  break;
}


case "poll_vote": {
  const updatedPoll = payload.content || payload.poll || payload;
  if (!updatedPoll?.id) return;

  // ✅ Update poll in messages state
  setMessages((prev) => {
    const arr = Array.isArray(prev[groupId]) ? [...prev[groupId]] : [];

    const updated = arr.map((m) => {
      if (m.type === "poll" && String(m.poll?.id) === String(updatedPoll.id)) {
        // Merge updated poll data while preserving message metadata
        return {
          ...m,
          poll: {
            ...m.poll,
            ...updatedPoll,
            // Ensure options are properly formatted
            options: updatedPoll.options || m.poll.options,
            totalVotes: updatedPoll.totalVotes !== undefined ? updatedPoll.totalVotes : m.poll.totalVotes,
            createdAt: updatedPoll.createdAt || m.poll.createdAt,
            creatorId: updatedPoll.creatorId || m.poll.creatorId,
            creatorName: updatedPoll.creatorName || m.poll.creatorName,
          },
        };
      }
      return m;
    });

    return { ...prev, [groupId]: updated };
  });

  // ✅ Dispatch event to update oldMessages in ChatPage
  try {
    const event = new CustomEvent("poll:voteUpdate", {
      detail: { groupId, poll: updatedPoll },
    });
    window.dispatchEvent(event);
  } catch (e) {
    console.error("Error dispatching poll vote update event:", e);
  }

  break;
}

case "file": {
  // Handle file messages from SocketPayload (from FileService)
  const fileData = payload.content || payload;
  if (!fileData) return;

  setMessages((prev) => {
    const arr = Array.isArray(prev[groupId]) ? [...prev[groupId]] : [];

    // Convert MessageFileDTO to message format
    const fileMessage = {
      id: fileData.messageId || fileData.id || `file-${Date.now()}`,
      type: "file",
      groupId: payload.groupId || groupId,
      senderId: fileData.senderId,
      senderName: fileData.senderName || "Unknown",
      content: fileData.fileName || fileData.name || "File",
      fileUrl: fileData.fileUrl || fileData.url,
      fileType: fileData.fileType || fileData.type,
      size: fileData.size || fileData.fileSize,
      timestamp: fileData.timestamp || new Date().toISOString(),
      localOnly: false,
    };

    // Check for duplicates
    const exists = arr.some(
      (m) =>
        m.type === "file" &&
        (String(m.id) === String(fileMessage.id) ||
         (m.fileUrl && fileMessage.fileUrl && m.fileUrl === fileMessage.fileUrl &&
          String(m.senderId) === String(fileMessage.senderId)))
    );
    if (exists) return prev;

    arr.push(fileMessage);
    return { ...prev, [groupId]: arr };
  });

  if (activeGroup !== groupId) {
    setUnreadCount((prev) => ({
      ...prev,
      [groupId]: (prev[groupId] || 0) + 1,
    }));
  }

  // Auto-delivery ack for file messages from others
  const currentUserId = user?.id || localStorage.getItem("userId");
  const fileId = fileData.messageId || fileData.id;
  if (fileId && String(fileData.senderId) !== String(currentUserId)) {
    const key = String(fileId);
    if (!deliveredAckedRef.current.has(key)) {
      deliveredAckedRef.current.add(key);
      _publishOrQueue("/app/chat.delivered", {
        groupId: payload.groupId || groupId,
        messageId: fileId,
        userId: currentUserId,
        deliveredAt: new Date().toISOString(),
      });
    }
  }
  break;
}

case "session": {
  // Handle session events (created, voted, finalized, rsvp, deleted)
  const sessionData = payload.session || payload;
  if (!sessionData || !sessionData.groupId) return;

  // Dispatch custom event for session updates
  try {
    const event = new CustomEvent("session:update", {
      detail: { 
        action: payload.action || "created",
        groupId: sessionData.groupId || groupId,
        session: sessionData 
      },
    });
    window.dispatchEvent(event);
  } catch (e) {
    console.error("Error dispatching session update event:", e);
  }

  // Also show browser notification for reminders
  if (payload.action === "reminder" || payload.type === "session_reminder") {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(sessionData.title || "Session Reminder", {
        body: `Session starts in ${payload.minutesBefore || 0} minutes`,
        icon: "/favicon.ico",
      });
    }
  }
  break;
}

      case "presence":
        setOnlineUsers((prev) => ({
          ...prev,
          [groupId]: payload.onlineUsers || [],
        }));
        break;

      default:
        console.debug("[chat] unhandled payload:", type);
    }
  };

  /* ---------------------- Helpers ---------------------- */
  const _publishOrQueue = (destination, payload) => {
    const client = stompRef.current;
    const body = JSON.stringify(payload);

    if (client?.connected) {
      try {
        client.publish({ destination, body });
        return;
      } catch (err) {
        console.error("[chat] publish error, queueing", err);
      }
    }
    messageQueueRef.current.push({ destination, body });
  };

  const handleLocalMessageStatus = (message) => {
  // Initialize ticks locally as "sent"
  message.deliveredBy = [user.id]; // mark sender as delivered
  message.readBy = []; // sender never counts as reader
  message.totalRecipients = message.totalRecipients || (message.members?.length || 1);

  // Optimistically update UI so tick shows instantly
  setMessages((prev) => ({
  ...prev,
  [message.groupId]: [...(prev[message.groupId] || []), message],
}));

};


  /* ---------------------- Send Message ---------------------- */
  const sendMessage = (groupId, content) => {
    if (!groupId || !content) return;
    const senderId = user?.id || localStorage.getItem("userId");
    const senderName = user?.name || localStorage.getItem("name");

    const message = {
      groupId,
      senderId,
      senderName,
      content,
      timestamp: new Date().toISOString(),
      type: "text",
      localOnly: true,
      deliveredBy: [],
      readBy: [],
    };
    handleLocalMessageStatus(message);

    _publishOrQueue("/app/chat.sendMessage", message);
    setUnreadCount((prev) => ({ ...prev, [groupId]: 0 }));

    // 🚀 Immediately assign single tick + auto-updates from socket

  };


  // new code here below

  const sendPoll = (groupId, pollData) => {
  if (!groupId || !pollData) return;

  const userId = user?.id || localStorage.getItem("userId");
  const userName =
    user?.name || user?.username || localStorage.getItem("name") || "Anonymous";

  const cleanedPollData = {
    question: pollData.question,
    options: pollData.options.map((o) => ({
      id: null,
      text: o.text,
      votes: [],
    })),
    allowMultiple: pollData.allowMultiple || false,
    anonymous: pollData.anonymous || false,
    groupId,
    creatorId: pollData.creatorId || userId,        // ✅ add creatorId
    creatorName: pollData.creatorName || userName,  // ✅ add creatorName
  };

  const tempId = `temp-poll-${Date.now()}`;
  const optimisticPoll = {
    id: tempId,
    type: "poll",
    poll: {
      ...cleanedPollData,
      id: null,
      createdAt: new Date().toISOString(),
      totalVotes: 0,
    },
    senderId: userId,
    senderName: userName,
    timestamp: new Date().toISOString(),
    localOnly: true,
  };

  addMessage(groupId, optimisticPoll);

  const payload = {
    ...cleanedPollData,
    type: "poll",
    senderId: userId,
    senderName: userName,
    timestamp: new Date().toISOString(),
  };

  _publishOrQueue("/app/chat.sendPoll", payload);
};

  

  /* ---------------------- Typing Indicator ---------------------- */
  const sendTypingIndicator = (groupId) => {
    if (!groupId || !stompRef.current?.connected) return;

    const userId = user?.id || localStorage.getItem("userId");
    const userName =
      user?.name || user?.username || localStorage.getItem("name") || "Anonymous";

    const typingPayload = { type: "typing", groupId, userId, userName };

    stompRef.current.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify(typingPayload),
    });

    if (typingTimeoutRef.current[groupId])
      clearTimeout(typingTimeoutRef.current[groupId]);
    typingTimeoutRef.current[groupId] = setTimeout(() => {
      stompRef.current.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify({
          type: "typing_stop",
          groupId,
          userId,
          userName,
        }),
      });
    }, 2500);
  };

  const sendTypingStopIndicator = (groupId) => {
    if (!groupId || !stompRef.current?.connected) return;
    const payload = {
      type: "typing_stop",
      groupId,
      typingUser: { id: user?.id, name: user?.name },
    };
    stompRef.current.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify(payload),
    });
  };

  /* ---------------------- Reactions / Polls ---------------------- */
  const addReaction = (groupId, messageId, emoji) =>
    _publishOrQueue("/app/chat.reaction", {
      type: "reaction",
      groupId,
      messageId,
      emoji,
      userId: user?.id,
    });

// ✅ Send poll vote (user → backend)
const votePoll = (groupId, messageId, pollId, optionIds) => {
  const userId = user?.id || localStorage.getItem("userId");
  // Ensure userId is a number (Long) for backend
  const userIdLong = userId ? (typeof userId === 'string' ? parseInt(userId, 10) : userId) : null;
  const payload = { 
    groupId: typeof groupId === 'string' ? parseInt(groupId, 10) : groupId,
    pollId: typeof pollId === 'string' ? parseInt(pollId, 10) : pollId,
    optionIds: Array.isArray(optionIds) ? optionIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id) : [],
    userId: userIdLong
  };
  _publishOrQueue("/app/chat.pollVote", payload);
};


  /* ---------------------- Getters ---------------------- */
  const getGroupMessages = (groupId) => messages[groupId] || [];
  const getTypingUsers = (groupId) => typingUsers[groupId] || [];
  const getOnlineUsers = (groupId) => onlineUsers[groupId] || [];
  const getUnreadCount = (groupId) => unreadCount[groupId] || 0;

  const openGroup = (groupId) => {
    if (!groupId) return;
    if (activeGroup && activeGroup !== groupId) unsubscribeGroup(activeGroup);
    setActiveGroup(groupId);
    _subscribeToGroup(groupId);
    setUnreadCount((prev) => ({ ...prev, [groupId]: 0 }));
  };

  const markAsRead = (groupId) =>
    setUnreadCount((prev) => ({ ...prev, [groupId]: 0 }));

  /* ---------------------- Context Value ---------------------- */
  const value = {
    connected,
    activeGroup,
    setActiveGroup,
    openGroup,
    closeGroup: unsubscribeGroup,
    sendMessage,
    sendTypingIndicator,
    addReaction,
    sendTypingStopIndicator,
    sendPoll,
    votePoll,
    getGroupMessages,
    getTypingUsers,
    getOnlineUsers,
    getUnreadCount,
    markAsRead,
    _subscribeToGroup,
    messages,
    typingUsers,
    onlineUsers,
    unreadCount,
    votePoll,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
