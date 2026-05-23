const express = require('express');
const router = express.Router();
const { uploadWasl: uploadWaslController, uploadChatFile: uploadChatFileController } = require('../controllers/upload.controller');
const { verifyToken } = require('../middleware/verifyToken');
const { uploadWasl: multerWasl, uploadChatFile: multerChat } = require('../utils/cloudinary');

// ─── Protected Routes (Merchant & Customer) ───────────────────────────────────
router.use(verifyToken); // Both roles can upload chat files

// POST /api/upload/chat-file
router.post('/chat-file', multerChat.single('file'), uploadChatFileController);

// POST /api/upload/wasl (Customer only handled in logic if needed, but since verifyToken is here it's fine)
router.post('/wasl', multerWasl.single('wasl'), uploadWaslController);

module.exports = router;
