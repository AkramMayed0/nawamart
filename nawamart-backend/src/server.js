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

  // Join a chat room (support both join_chat and frontend's joinRoom)
  socket.on('joinRoom', (chatId) => {
    socket.join(chatId);
    console.log(`[Chat] Socket ${socket.id} joined chat: ${chatId}`);
  });

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`[Chat] Socket ${socket.id} joined chat (legacy): ${chatId}`);
  });

  // Leave a chat room (support both leaveRoom and leave_chat)
  socket.on('leaveRoom', (chatId) => {
    socket.leave(chatId);
    console.log(`[Chat] Socket ${socket.id} left chat: ${chatId}`);
  });

  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
    console.log(`[Chat] Socket ${socket.id} left chat (legacy): ${chatId}`);
  });

  // Client-to-Client socket sendMessage bypass (just in case they emit directly)
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
