const express = require('express');
const router = express.Router();
const {
  getMyChats,
  initChat,
  getChat,
  sendMessage,
  uploadAttachment,
  confirmReceipt,
} = require('../controllers/chat.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { uploadChatFile } = require('../utils/cloudinary');

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

// POST /api/chats/:chatId/attachment
router.post('/:chatId/attachment', uploadChatFile.single('file'), uploadAttachment);

// POST /api/chats/:chatId/confirm-receipt
router.post('/:chatId/confirm-receipt', requireRole('customer'), confirmReceipt);

module.exports = router;
