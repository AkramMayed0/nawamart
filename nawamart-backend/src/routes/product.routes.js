const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProductsByStore,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { uploadProduct } = require('../utils/cloudinary');

// ─── Public Routes ────────────────────────────────────────────────────────────
// GET /api/products/store/:storeId
router.get('/store/:storeId', getProductsByStore);

// ─── Protected Routes (Merchant Only) ─────────────────────────────────────────
router.use(verifyToken);
router.use(requireRole('merchant'));

// POST /api/products
router.post('/', uploadProduct.single('image'), createProduct);

// PUT /api/products/:id
router.put('/:id', uploadProduct.single('image'), updateProduct);

// DELETE /api/products/:id
router.delete('/:id', deleteProduct);

module.exports = router;
