const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProductsByStore,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { uploadProduct } = require('../utils/cloudinary');
const { enforceProductLimit } = require('../middleware/planLimits');

// ─── Public Routes ────────────────────────────────────────────────────────────
// GET /api/products/store/:storeId
router.get('/store/:storeId', getProductsByStore);

// GET /api/products/:id
router.get('/:id', getProductById);

// ─── Protected Routes (Merchant Only) ─────────────────────────────────────────
router.use(verifyToken);
router.use(requireRole('merchant'));

// POST /api/products — enforces per-plan product cap
router.post('/', enforceProductLimit, uploadProduct.array('images', 10), createProduct);

// PUT /api/products/:id
router.put('/:id', uploadProduct.array('images', 10), updateProduct);

// DELETE /api/products/:id
router.delete('/:id', deleteProduct);

module.exports = router;
