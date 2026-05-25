const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMerchantOrders,
  getOrderById,
  confirmOrder,
  rejectOrder,
  shipOrder,
  deliverOrder,
} = require('../controllers/order.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { enforceOrderLimit } = require('../middleware/planLimits');

// Public storefront checkout and public order confirmation/tracking.
router.post('/', enforceOrderLimit, createOrder);

router.get('/merchant', verifyToken, requireRole('merchant'), getMerchantOrders);
router.put('/:id/confirm', verifyToken, requireRole('merchant'), confirmOrder);
router.put('/:id/reject', verifyToken, requireRole('merchant'), rejectOrder);
router.put('/:id/ship', verifyToken, requireRole('merchant'), shipOrder);
router.put('/:id/deliver', verifyToken, requireRole('merchant'), deliverOrder);

router.get('/:id', getOrderById);

module.exports = router;
