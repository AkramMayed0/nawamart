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
  processOrder,
  cancelOrder,
  returnOrder,
  fulfillOrder,
  getFulfillments,
  capturePayment,
  refundOrder,
  addOrderNote,
  getOrderNotes,
  editOrder,
  generatePackingSlip,
  bulkOrders,
  exportOrders,
} = require('../controllers/order.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { enforceOrderLimit } = require('../middleware/planLimits');
const { validateObjectId } = require('../middleware/security');

// Customer checkout — requires authentication
router.post('/', verifyToken, requireRole('customer'), enforceOrderLimit, createOrder);

router.get('/customer', verifyToken, requireRole('customer'), getCustomerOrders);
router.get('/merchant', verifyToken, requireRole('merchant'), getMerchantOrders);
router.get('/export',   verifyToken, requireRole('merchant'), exportOrders);

// Bulk actions
router.post('/bulk', verifyToken, requireRole('merchant'), bulkOrders);

// Order-level actions (merchant)
router.put('/:id/confirm',         verifyToken, requireRole('merchant'), confirmOrder);
router.put('/:id/reject',          verifyToken, requireRole('merchant'), rejectOrder);
router.put('/:id/ship',            verifyToken, requireRole('merchant'), shipOrder);
router.put('/:id/deliver',         verifyToken, requireRole('merchant'), deliverOrder);
router.put('/:id/process',         verifyToken, requireRole('merchant'), processOrder);
router.post('/:id/cancel',         verifyToken, requireRole('merchant'), cancelOrder);
router.post('/:id/return',         verifyToken, requireRole('merchant'), returnOrder);
router.post('/:id/fulfill',        verifyToken, requireRole('merchant'), fulfillOrder);
router.get('/:id/fulfillments',    verifyToken, requireRole('merchant'), getFulfillments);
router.post('/:id/capture-payment', verifyToken, requireRole('merchant'), capturePayment);
router.post('/:id/refund',         verifyToken, requireRole('merchant'), refundOrder);
router.post('/:id/notes',          verifyToken, requireRole('merchant'), addOrderNote);
router.get('/:id/notes',           verifyToken, requireRole('merchant'), getOrderNotes);
router.put('/:id/edit',            verifyToken, requireRole('merchant'), editOrder);
router.post('/:id/packing-slip',   verifyToken, requireRole('merchant'), generatePackingSlip);

// Single order fetch (customer or merchant)
router.get('/:id', validateObjectId('id'), verifyToken, getOrderById);

module.exports = router;
