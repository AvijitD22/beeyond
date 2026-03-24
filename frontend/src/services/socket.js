import { io } from 'socket.io-client';
import API_BASE_URL from "../config/api";

let socket;

export const connectSocket = () => {
  if (socket) return socket;

  socket = io(`${API_BASE_URL}`, {
    withCredentials: true,
    // ❌ DO NOT force websocket
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      // only log, do NOT null it out unless you really want to
    });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default socket;