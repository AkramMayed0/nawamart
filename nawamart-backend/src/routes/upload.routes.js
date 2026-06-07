const express = require('express');
const router = express.Router();
const {
  uploadWasl: uploadWaslController,
  uploadChatFile: uploadChatFileController,
} = require('../controllers/upload.controller');
const { verifyToken } = require('../middleware/verifyToken');
const { uploadWasl: multerWasl, uploadChatFile: multerChat } = require('../utils/cloudinary');

router.use(verifyToken);

router.post('/wasl', multerWasl.single('wasl'), uploadWaslController);
router.post('/chat-file', multerChat.single('file'), uploadChatFileController);

module.exports = router;
