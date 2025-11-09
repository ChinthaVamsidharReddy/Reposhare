// src/utils/stompClient.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

/**
 * Create or reuse a singleton STOMP client.
 * Uses SockJS to connect with token authentication.
 */
export const getStompClient = (token) => {
  if (stompClient && stompClient.connected) {
    console.log("♻️ Reusing existing STOMP connection");
    return stompClient;
  }

  console.log("⚡ Creating new STOMP client...");
  const socket = new SockJS("http://localhost:8080/ws/chat");

  stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    debug: (msg) => console.log("[STOMP]", msg),
    reconnectDelay: 5000, // auto reconnect
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });

  stompClient.onConnect = (frame) => {
    console.log("✅ STOMP Connected:", frame.headers);
  };

  stompClient.onWebSocketClose = () => {
    console.warn("⚠️ WebSocket closed");
  };

  stompClient.onDisconnect = () => {
    console.warn("⚠️ STOMP disconnected");
  };

  stompClient.onStompError = (frame) => {
    console.error("❌ STOMP Error:", frame.headers["message"], frame.body);
  };

  stompClient.activate();
  return stompClient;
};

/**
 * Disconnect the STOMP client manually (used on logout)
 */
export const disconnectStompClient = () => {
  if (stompClient && stompClient.active) {
    console.log("🔌 Disconnecting STOMP client...");
    stompClient.deactivate();
  }
  stompClient = null;
};
