const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const {
  bulkArchiveProducts, bulkDeleteProducts, bulkUpdatePrice, bulkUpdateStock,
} = require('../controllers/bulk.controller');

router.use(verifyToken, requireRole('merchant'));

router.post('/archive', bulkArchiveProducts);
router.post('/delete', bulkDeleteProducts);
router.post('/update-price', bulkUpdatePrice);
router.post('/update-stock', bulkUpdateStock);

module.exports = router;
