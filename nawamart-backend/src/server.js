require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const Chat = require('./models/Chat');
const Merchant = require('./models/Merchant');
const Customer = require('./models/Customer');
const { validateEnv } = require('./config/env');

const PORT = process.env.PORT || 5000;
const runtime = validateEnv();

function hasChatAccess(chat, userId, role) {
  const customerId = chat.customer?._id ? chat.customer._id.toString() : chat.customer?.toString();
  const merchantId = chat.merchant?._id ? chat.merchant._id.toString() : chat.merchant?.toString();
  return (role === 'customer' && customerId === userId) || (role === 'merchant' && merchantId === userId);
}

// ─── Create HTTP server (needed for Socket.io) ────────────────────────────────
const httpServer = http.createServer(app);

// ─── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: runtime.allowedOrigins,
    credentials: true,
  },
});

// Attach io instance to app so controllers can emit events
app.set('io', io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = null;
    if (decoded.role === 'merchant') {
      user = await Merchant.findById(decoded.id).select('_id isActive');
    } else if (decoded.role === 'customer') {
      user = await Customer.findById(decoded.id).select('_id isActive');
    }

    if (!user || !user.isActive) {
      return next(new Error('Invalid socket user'));
    }

    socket.user = { id: user._id.toString(), role: decoded.role };
    next();
  } catch (err) {
    next(new Error('Invalid socket token'));
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket] connected: ${socket.id}`);

  // ── Join / leave chat rooms ──
  const joinChatRoom = async (chatId, label = 'chat') => {
    const chat = await Chat.findById(chatId).select('merchant customer');
    if (!chat || !hasChatAccess(chat, socket.user.id, socket.user.role)) {
      socket.emit('socketError', { message: 'Not authorized for this chat' });
      return;
    }

    socket.join(chatId);
    console.log(`[Chat] Socket ${socket.id} joined ${label}: ${chatId}`);
  };

  const canUseRoom = (chatId) => {
    if (chatId && socket.rooms.has(chatId)) return true;
    socket.emit('socketError', { message: 'Join the chat before using this socket event' });
    return false;
  };

  socket.on('joinRoom', (chatId) => {
    joinChatRoom(chatId).catch((err) => {
      console.error('[Socket] joinRoom failed:', err.message);
      socket.emit('socketError', { message: 'Could not join chat' });
    });
  });

  socket.on('join_chat', (chatId) => {
    joinChatRoom(chatId, 'chat (legacy)').catch((err) => {
      console.error('[Socket] join_chat failed:', err.message);
      socket.emit('socketError', { message: 'Could not join chat' });
    });
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
    if (!canUseRoom(chatId)) return;
    socket.to(chatId).emit('userTyping', { name });
  });

  socket.on('stopTyping', ({ chatId }) => {
    if (!canUseRoom(chatId)) return;
    socket.to(chatId).emit('userStopTyping');
  });

  // ── Read receipts ──
  socket.on('markAsRead', ({ chatId, userId }) => {
    if (!canUseRoom(chatId)) return;
    socket.to(chatId).emit('messagesRead', { userId });
  });

  // ── Message acknowledgement ──
  socket.on('messageDelivered', ({ chatId, messageId }) => {
    if (!canUseRoom(chatId)) return;
    socket.to(chatId).emit('messageStatusUpdate', { messageId, status: 'delivered' });
  });

  // ── Request missing messages on reconnect ──
  socket.on('requestMissing', ({ chatId, lastKnownId }) => {
    if (!canUseRoom(chatId)) return;
    // The client can re-fetch from API; we just acknowledge
    socket.emit('missingAck', { chatId });
  });

  // ── Client-to-Client socket sendMessage bypass ──
  socket.on('sendMessage', () => {
    socket.emit('socketError', { message: 'Send messages through the authenticated API' });
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
