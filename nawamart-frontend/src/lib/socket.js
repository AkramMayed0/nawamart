/**
 * Socket.io singleton — one connection across the app.
 * Import `socket` to use it directly, or call connect/disconnect.
 */
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

let socket = null

/**
 * Initialize and return the socket (idempotent).
 * @param {string} token  JWT from authStore
 */
export function getSocket(token) {
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1500,
    autoConnect: true,
  })

  socket.on('connect', () => {
    console.info('[socket] connected:', socket.id)
  })

  socket.on('connect_error', (err) => {
    console.warn('[socket] connect error:', err.message)
  })

  socket.on('disconnect', (reason) => {
    console.info('[socket] disconnected:', reason)
  })

  return socket
}

/** Disconnect and clear the singleton. Call on logout. */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export default { getSocket, disconnectSocket }
