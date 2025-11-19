import { io } from "socket.io-client";

// Connect to your server - uses environment variable
const URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export const socket = io(URL, {
  autoConnect: false, // Don't connect automatically
  transports: ["websocket", "polling"], // Try WebSocket first, fallback to polling
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
