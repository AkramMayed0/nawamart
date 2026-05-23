const express = require('express');
const router = express.Router();
const { uploadWasl: uploadWaslController } = require('../controllers/upload.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { uploadWasl: multerWasl } = require('../utils/cloudinary');

// ─── Protected Routes (Customer Only) ─────────────────────────────────────────
router.use(verifyToken);
router.use(requireRole('customer'));

// POST /api/upload/wasl
router.post('/wasl', multerWasl.single('wasl'), uploadWaslController);

module.exports = router;
