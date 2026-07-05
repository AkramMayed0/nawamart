const express = require('express');
const router = express.Router();
const {
  listDiscounts, createDiscount, updateDiscount, deleteDiscount, validateDiscount,
} = require('../controllers/discount.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

router.get('/:storeId', verifyToken, requireRole('merchant'), listDiscounts);
router.post('/:storeId', verifyToken, requireRole('merchant'), createDiscount);
router.post('/:storeId/validate', validateDiscount);
router.put('/:id', verifyToken, requireRole('merchant'), updateDiscount);
router.delete('/:id', verifyToken, requireRole('merchant'), deleteDiscount);

module.exports = router;
