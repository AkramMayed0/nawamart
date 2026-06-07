const express = require('express');
const router = express.Router();
const {
  getMyChats,
  initChat,
  initDeliveryChat,
  getChat,
  sendMessage,
  uploadAttachment,
  confirmReceipt,
  markAsRead,
  retryMessage,
  sendProductCard,
} = require('../controllers/chat.controller');

const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { uploadChatFile } = require('../utils/cloudinary');

// All chat routes require authentication
router.use(verifyToken);

// GET /api/chats
router.get('/', getMyChats);

// POST /api/chats (Init chat - Customer only)
router.post('/', requireRole('customer'), initChat);

// POST /api/chats/init-delivery (Init delivery chat - Merchant only)
router.post('/init-delivery', requireRole('merchant'), initDeliveryChat);

// GET /api/chats/:chatId
router.get('/:chatId', getChat);

// POST /api/chats/:chatId/message
router.post('/:chatId/message', sendMessage);

// POST /api/chats/:chatId/attachment
router.post('/:chatId/attachment', uploadChatFile.single('file'), uploadAttachment);

// POST /api/chats/:chatId/confirm-receipt
router.post('/:chatId/confirm-receipt', requireRole('customer'), confirmReceipt);

// POST /api/chats/:chatId/read - Mark messages as read
router.post('/:chatId/read', markAsRead);

// POST /api/chats/:chatId/retry/:messageId - Retry sending a message
router.post('/:chatId/retry/:messageId', retryMessage);

// POST /api/chats/:chatId/product-card - Merchant sends a product card
router.post('/:chatId/product-card', requireRole('merchant'), sendProductCard);

module.exports = router;

