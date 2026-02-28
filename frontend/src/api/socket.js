import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  // Use polling first (more reliable on Render/Vercel), then upgrade to websocket
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,  // Keep trying forever
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,                  // 20s connection timeout (Render can be slow to wake)
  upgrade: true,                   // Upgrade polling → websocket after connected
  forceNew: false,
});

export default socket;
