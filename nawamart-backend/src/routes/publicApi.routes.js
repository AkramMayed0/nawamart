const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Store = require('../models/Store');
const Order = require('../models/Order');
const { apiResponse, asyncHandler, paginate } = require('../utils/helpers');
const { apiAuth, requireScope } = require('../middleware/apiAuth');
const { createApiRateLimiter } = require('../middleware/apiRateLimiter');
const { apiVersioning } = require('../middleware/apiVersioning');

const apiLimiter = createApiRateLimiter();

router.use(apiVersioning);
router.use(apiAuth);
router.use(apiLimiter);

router.get('/store', asyncHandler(async (req, res) => {
  const store = await Store.findById(req.apiKeyStore).select('-paymentAccounts -constructionPassword');
  if (!store) {
    return res.status(404).json({ success: false, message: 'المتجر غير موجود', data: null });
  }
  return apiResponse(res, { message: 'تم جلب بيانات المتجر', data: store });
}));

router.get('/products', requireScope('products:read'), asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const query = { store: req.apiKeyStore, isDeleted: { $ne: true }, isActive: true };

  const result = await paginate(Product, query, {
    page, limit,
    sort: { createdAt: -1 },
    select: '-updatedBy -createdBy',
  });

  return apiResponse(res, {
    message: 'تم جلب المنتجات',
    data: result.data,
    pagination: result.pagination,
  });
}));

router.get('/products/:id', requireScope('products:read'), asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    store: req.apiKeyStore,
    isDeleted: { $ne: true },
  });

  if (!product) {
    return res.status(404).json({ success: false, message: 'المنتج غير موجود', data: null });
  }

  return apiResponse(res, { message: 'تم جلب المنتج', data: product });
}));

router.get('/orders', requireScope('orders:read'), asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const query = { store: req.apiKeyStore, merchant: req.apiKeyMerchant };

  if (status) query.status = status;

  const result = await paginate(Order, query, {
    page, limit,
    sort: { createdAt: -1 },
  });

  return apiResponse(res, {
    message: 'تم جلب الطلبات',
    data: result.data,
    pagination: result.pagination,
  });
}));

router.get('/orders/:id', requireScope('orders:read'), asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    store: req.apiKeyStore,
    merchant: req.apiKeyMerchant,
  });

  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  return apiResponse(res, { message: 'تم جلب الطلب', data: order });
}));

module.exports = router;
