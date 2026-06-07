const express = require('express');
const router = express.Router();
const {
  getWhatsAppSettings,
  upsertWhatsAppSettings,
} = require('../controllers/whatsapp.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { requireFeature } = require('../middleware/requireFeature');

router.use(verifyToken, requireRole('merchant'));
router.use(requireFeature('whatsapp_commerce_bot'));

router.get('/settings', getWhatsAppSettings);
router.put('/settings', upsertWhatsAppSettings);

module.exports = router;
