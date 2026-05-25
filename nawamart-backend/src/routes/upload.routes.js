const express = require('express');
const router = express.Router();
const {
  uploadWasl: uploadWaslController,
  uploadChatFile: uploadChatFileController,
} = require('../controllers/upload.controller');
const { verifyToken } = require('../middleware/verifyToken');
const { uploadWasl: multerWasl, uploadChatFile: multerChat } = require('../utils/cloudinary');

// Public checkout uploads the receipt before the order exists.
router.post('/wasl', multerWasl.single('wasl'), uploadWaslController);

router.use(verifyToken);

router.post('/chat-file', multerChat.single('file'), uploadChatFileController);

module.exports = router;
