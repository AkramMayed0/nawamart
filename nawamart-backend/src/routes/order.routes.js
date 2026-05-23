const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMerchantOrders,
  confirmOrder,
  rejectOrder,
  shipOrder,
  deliverOrder,
} = require('../controllers/order.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.use(verifyToken);

// ─── Customer Routes ──────────────────────────────────────────────────────────
router.post('/', requireRole('customer'), createOrder);

// ─── Merchant Routes ──────────────────────────────────────────────────────────
router.get('/merchant', requireRole('merchant'), getMerchantOrders);
router.put('/:id/confirm', requireRole('merchant'), confirmOrder);
router.put('/:id/reject', requireRole('merchant'), rejectOrder);
router.put('/:id/ship', requireRole('merchant'), shipOrder);
router.put('/:id/deliver', requireRole('merchant'), deliverOrder);

module.exports = router;
