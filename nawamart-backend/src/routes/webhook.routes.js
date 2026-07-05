const express = require('express');
const router = express.Router();
const {
  listWebhooks, createWebhook, updateWebhook, deleteWebhook,
  testWebhook, listDeliveries, getDeliveryDetail, rotateWebhookSecret, getEvents,
} = require('../controllers/webhook.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/events', getEvents);

router.get('/:storeId', verifyToken, requireRole('merchant'), listWebhooks);
router.post('/:storeId', verifyToken, requireRole('merchant'), createWebhook);
router.put('/:id', verifyToken, requireRole('merchant'), updateWebhook);
router.delete('/:id', verifyToken, requireRole('merchant'), deleteWebhook);
router.post('/:id/test', verifyToken, requireRole('merchant'), testWebhook);
router.post('/:id/rotate-secret', verifyToken, requireRole('merchant'), rotateWebhookSecret);

router.get('/:id/deliveries', verifyToken, requireRole('merchant'), listDeliveries);
router.get('/:id/deliveries/:deliveryId', verifyToken, requireRole('merchant'), getDeliveryDetail);

module.exports = router;
