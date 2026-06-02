require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// ─── Create HTTP server (needed for Socket.io) ────────────────────────────────
const httpServer = http.createServer(app);

// ─── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: (process.env.CLIENT_URL || 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  },
});

// Attach io instance to app so controllers can emit events
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket] connected: ${socket.id}`);

  // ── Join / leave chat rooms ──
  socket.on('joinRoom', (chatId) => {
    socket.join(chatId);
    console.log(`[Chat] Socket ${socket.id} joined chat: ${chatId}`);
  });

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`[Chat] Socket ${socket.id} joined chat (legacy): ${chatId}`);
  });

  socket.on('leaveRoom', (chatId) => {
    socket.leave(chatId);
    console.log(`[Chat] Socket ${socket.id} left chat: ${chatId}`);
  });

  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
    console.log(`[Chat] Socket ${socket.id} left chat (legacy): ${chatId}`);
  });

  // ── Typing indicator ──
  socket.on('typing', ({ chatId, name }) => {
    socket.to(chatId).emit('userTyping', { name });
  });

  socket.on('stopTyping', ({ chatId }) => {
    socket.to(chatId).emit('userStopTyping');
  });

  // ── Read receipts ──
  socket.on('markAsRead', ({ chatId, userId }) => {
    socket.to(chatId).emit('messagesRead', { userId });
  });

  // ── Message acknowledgement ──
  socket.on('messageDelivered', ({ chatId, messageId }) => {
    socket.to(chatId).emit('messageStatusUpdate', { messageId, status: 'delivered' });
  });

  // ── Request missing messages on reconnect ──
  socket.on('requestMissing', ({ chatId, lastKnownId }) => {
    // The client can re-fetch from API; we just acknowledge
    socket.emit('missingAck', { chatId });
  });

  // ── Client-to-Client socket sendMessage bypass ──
  socket.on('sendMessage', (msgData) => {
    if (msgData && msgData.chatId) {
      io.to(msgData.chatId).emit('receiveMessage', msgData);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] disconnected: ${socket.id}`);
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log('');
    console.log('[Startup] NawaMart API is running!');
    console.log(`[Server]  : http://localhost:${PORT}`);
    console.log(`[Env]     : ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Health]  : http://localhost:${PORT}/api/health`);
    console.log('');
  });
};

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n[Shutdown] ${signal} received — shutting down gracefully...`);
  httpServer.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled rejection safety net
process.on('unhandledRejection', (reason) => {
  console.error('[Error] Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});

start();
