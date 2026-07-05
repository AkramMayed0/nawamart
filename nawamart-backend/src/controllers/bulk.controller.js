const Product = require('../models/Product');
const Store = require('../models/Store');
const { apiResponse, asyncHandler } = require('../utils/helpers');
const { logActivity } = require('../services/audit');

const bulkArchiveProducts = asyncHandler(async (req, res) => {
  const { ids, storeId } = req.body;
  if (!ids?.length) return res.status(400).json({ success: false, message: 'اختر منتجات على الأقل', data: null });

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const result = await Product.updateMany(
    { _id: { $in: ids }, store: storeId, merchant: req.user._id },
    { $set: { isActive: false, updatedBy: req.user._id } },
  );

  await logActivity(req, {
    action: 'bulk.archive',
    resourceType: 'product',
    resourceId: storeId,
    resourceName: store.name,
      details: `تم أرشفة ${result.modifiedCount} منتج`,
  });

  return apiResponse(res, { message: `تم أرشفة ${result.modifiedCount} منتج`, data: { modifiedCount: result.modifiedCount } });
});

const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { ids, storeId } = req.body;
  if (!ids?.length) return res.status(400).json({ success: false, message: 'اختر منتجات على الأقل', data: null });

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const result = await Product.updateMany(
    { _id: { $in: ids }, store: storeId, merchant: req.user._id },
    { $set: { isDeleted: true, isActive: false, deletedAt: new Date(), updatedBy: req.user._id } },
  );

  await logActivity(req, {
    action: 'bulk.delete',
    resourceType: 'product',
    resourceId: storeId,
    resourceName: store.name,
    details: `تم حذف ${result.modifiedCount} منتج`,
  });

  return apiResponse(res, { message: `تم حذف ${result.modifiedCount} منتج`, data: { modifiedCount: result.modifiedCount } });
});

const bulkUpdatePrice = asyncHandler(async (req, res) => {
  const { ids, storeId, operation, value } = req.body;
  if (!ids?.length) return res.status(400).json({ success: false, message: 'اختر منتجات على الأقل', data: null });
  if (!['set', 'increase', 'decrease'].includes(operation) || !value || value < 0) {
    return res.status(400).json({ success: false, message: 'عملية أو قيمة غير صالحة', data: null });
  }

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const products = await Product.find({ _id: { $in: ids }, store: storeId, merchant: req.user._id });
  const bulkOps = products.map(product => {
    let newPrice = product.price;
    if (operation === 'set') newPrice = value;
    else if (operation === 'increase') newPrice = product.price + value;
    else if (operation === 'decrease') newPrice = Math.max(0, product.price - value);
    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { price: newPrice, updatedBy: req.user._id } },
      },
    };
  });

  await Product.bulkWrite(bulkOps);

  await logActivity(req, {
    action: 'bulk.price_update',
    resourceType: 'product',
    resourceId: storeId,
    resourceName: store.name,
    details: `تم تحديث أسعار ${products.length} منتج (${operation}: ${value})`,
  });

  return apiResponse(res, { message: `تم تحديث أسعار ${products.length} منتج`, data: { modifiedCount: products.length } });
});

const bulkUpdateStock = asyncHandler(async (req, res) => {
  const { ids, storeId, operation, value } = req.body;
  if (!ids?.length) return res.status(400).json({ success: false, message: 'اختر منتجات على الأقل', data: null });
  if (!['set', 'increase', 'decrease'].includes(operation) || value === undefined || value < 0) {
    return res.status(400).json({ success: false, message: 'عملية أو قيمة غير صالحة', data: null });
  }

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const products = await Product.find({ _id: { $in: ids }, store: storeId, merchant: req.user._id, unlimitedStock: { $ne: true } });
  const bulkOps = products.map(product => {
    let newStock = product.stock;
    if (operation === 'set') newStock = value;
    else if (operation === 'increase') newStock = product.stock + value;
    else if (operation === 'decrease') newStock = Math.max(0, product.stock - value);
    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { stock: newStock, isActive: newStock > 0, updatedBy: req.user._id } },
      },
    };
  });

  await Product.bulkWrite(bulkOps);

  await logActivity(req, {
    action: 'bulk.stock_update',
    resourceType: 'product',
    resourceId: storeId,
    resourceName: store.name,
    details: `تم تحديث مخزون ${products.length} منتج (${operation}: ${value})`,
  });

  return apiResponse(res, { message: `تم تحديث مخزون ${products.length} منتج`, data: { modifiedCount: products.length } });
});

module.exports = { bulkArchiveProducts, bulkDeleteProducts, bulkUpdatePrice, bulkUpdateStock };
