const express = require('express');
const router = express.Router();
const {
  createOrder,
  getCustomerOrders,
  getMerchantOrders,
  getOrderById,
  confirmOrder,
  rejectOrder,
  shipOrder,
  deliverOrder,
} = require('../controllers/order.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { enforceOrderLimit } = require('../middleware/planLimits');
const { validateObjectId } = require('../middleware/security');

// Customer checkout — requires authentication
router.post('/', verifyToken, requireRole('customer'), enforceOrderLimit, createOrder);

router.get('/customer', verifyToken, requireRole('customer'), getCustomerOrders);
router.get('/merchant', verifyToken, requireRole('merchant'), getMerchantOrders);
router.put('/:id/confirm', verifyToken, requireRole('merchant'), confirmOrder);
router.put('/:id/reject', verifyToken, requireRole('merchant'), rejectOrder);
router.put('/:id/ship', verifyToken, requireRole('merchant'), shipOrder);
router.put('/:id/deliver', verifyToken, requireRole('merchant'), deliverOrder);

router.get('/:id', validateObjectId('id'), verifyToken, getOrderById);

module.exports = router;
