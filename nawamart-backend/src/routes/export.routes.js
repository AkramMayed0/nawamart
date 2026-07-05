const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { exportProducts, exportOrders, exportCustomers } = require('../controllers/export.controller');

router.get('/products', verifyToken, requireRole('merchant'), exportProducts);
router.get('/orders', verifyToken, requireRole('merchant'), exportOrders);
router.get('/customers', verifyToken, requireRole('merchant'), exportCustomers);

module.exports = router;
