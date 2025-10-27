import { io } from "socket.io-client";

// Connect to your server
const URL = "https://restaurant-me21.onrender.com";
export const socket = io(URL, {
  autoConnect: false, // Don't connect automatically
});
