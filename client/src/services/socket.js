import { io } from 'socket.io-client';

// Connect to your server
const URL = 'http://localhost:3001';
export const socket = io(URL, {
  autoConnect: false, // Don't connect automatically
});