const express = require('express');
const router = express.Router();
const {
  getMyChats,
  initChat,
  getChat,
  sendMessage,
} = require('../controllers/chat.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

// All chat routes require authentication
router.use(verifyToken);

// GET /api/chats
router.get('/', getMyChats);

// POST /api/chats (Init chat - Customer only)
router.post('/', requireRole('customer'), initChat);

// GET /api/chats/:chatId
router.get('/:chatId', getChat);

// POST /api/chats/:chatId/message
router.post('/:chatId/message', sendMessage);

module.exports = router;
