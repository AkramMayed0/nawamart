const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProductsByStore,
  getProductById,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getMerchantProducts,
} = require('../controllers/product.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { uploadProduct } = require('../utils/cloudinary');
const { enforceProductLimit } = require('../middleware/planLimits');

// ─── Public Routes ────────────────────────────────────────────────────────────
// GET /api/products/store/:storeId
router.get('/store/:storeId', getProductsByStore);

// GET /api/products/merchant — must come BEFORE /:id to avoid route capture
router.get('/merchant', verifyToken, requireRole('merchant'), getMerchantProducts);

// GET /api/products/:id
router.get('/:id', getProductById);

// ─── Protected Routes (Merchant Only) ─────────────────────────────────────────
// POST /api/products — enforces per-plan product cap
router.post('/', verifyToken, requireRole('merchant'), enforceProductLimit, uploadProduct.array('images', 10), createProduct);

// PUT /api/products/:id
router.put('/:id', verifyToken, requireRole('merchant'), uploadProduct.array('images', 10), updateProduct);

// DELETE /api/products/:id
router.delete('/:id', verifyToken, requireRole('merchant'), deleteProduct);

// POST /api/products/:id/restore — restore soft-deleted product
router.post('/:id/restore', verifyToken, requireRole('merchant'), restoreProduct);

module.exports = router;
