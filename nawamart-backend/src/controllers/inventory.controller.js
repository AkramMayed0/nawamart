const InventoryItem = require('../models/InventoryItem');
const InventoryLocation = require('../models/InventoryLocation');
const InventoryAdjustment = require('../models/InventoryAdjustment');
const Product = require('../models/Product');
const Store = require('../models/Store');
const InventoryService = require('../services/InventoryService');
const { apiResponse, asyncHandler, getPaginationParams, paginateResponse } = require('../utils/helpers');
const { logActivity } = require('../services/audit');

function requireStore(storeId, merchantId) {
  return Store.findOne({ _id: storeId, merchant: merchantId });
}

// ─── Inventory Items ──────────────────────────────────────────────────────────

const getInventoryItems = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ success: false, message: 'معرّف المتجر مطلوب', data: null });

  const store = await requireStore(storeId, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const { limit, skip, page } = getPaginationParams(req);
  const { search, state, location, lowStock, sort } = req.query;

  const query = { store: storeId };
  if (state) query.inventoryState = state;
  if (location) query.location = location;
  if (lowStock === 'true') query.isLowStock = true;
  if (search) {
    const products = await Product.find({
      store: storeId,
      isDeleted: false,
      name: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    }).select('_id');
    query.product = { $in: products.map((p) => p._id) };
  }

  const sortOpt = sort === 'quantity_asc' ? { quantity: 1 } : sort === 'quantity_desc' ? { quantity: -1 } : sort === 'name' ? { 'product.name': 1 } : { updatedAt: -1 };

  const [items, total] = await Promise.all([
    InventoryItem.find(query)
      .populate('product', 'name price salePrice images isActive isDeleted sku')
      .populate('location', 'name')
      .sort(sortOpt)
      .skip(skip)
      .limit(limit),
    InventoryItem.countDocuments(query),
  ]);

  return apiResponse(res, {
    message: 'تم جلب عناصر المخزون',
    data: items,
    pagination: paginateResponse(total, page, limit),
  });
});

const getInventoryItem = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findById(req.params.id)
    .populate('product', 'name price salePrice images isActive description sku barcode')
    .populate('location', 'name address')
    .populate('components.product', 'name price salePrice images sku');

  if (!item) {
    return res.status(404).json({ success: false, message: 'عنصر المخزون غير موجود', data: null });
  }

  const store = await requireStore(item.store, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'لا تملك صلاحية الوصول', data: null });

  return apiResponse(res, { message: 'تم جلب بيانات المخزون', data: item });
});

const updateInventoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let item = await InventoryItem.findById(id).populate('product', 'name');

  if (!item) return res.status(404).json({ success: false, message: 'عنصر المخزون غير موجود', data: null });

  const store = await requireStore(item.store, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'لا تملك صلاحية الوصول', data: null });

  const { trackQuantity, inventoryState, lowStockThreshold, location, sku, barcode, isBundle, components } = req.body;

  if (trackQuantity !== undefined) item.trackQuantity = trackQuantity;
  if (inventoryState !== undefined) {
    if (!['in_stock', 'out_of_stock', 'backorder', 'coming_soon'].includes(inventoryState)) {
      return res.status(400).json({ success: false, message: 'حالة مخزون غير صالحة', data: null });
    }
    item.inventoryState = inventoryState;
  }
  if (lowStockThreshold !== undefined) item.lowStockThreshold = lowStockThreshold;
  if (location !== undefined) item.location = location || null;
  if (sku !== undefined) item.sku = sku || null;
  if (barcode !== undefined) item.barcode = barcode || null;
  if (isBundle !== undefined) item.isBundle = isBundle;
  if (components !== undefined) item.components = Array.isArray(components) ? components : [];

  await item.save();
  await InventoryService.syncWithProduct(item.product._id);

  await logActivity(req, {
    action: 'inventory.update',
    resourceType: 'inventory',
    resourceId: item._id,
    resourceName: item.product?.name || 'مخزون',
    details: `تم تحديث إعدادات المخزون للمنتج ${item.product?.name || ''}`,
  });

  return apiResponse(res, { message: 'تم تحديث المخزون', data: item });
});

// ─── Inventory Adjustments ─────────────────────────────────────────────────────

const createAdjustment = asyncHandler(async (req, res) => {
  const { storeId, productId, location, quantity, reason, notes } = req.body;

  if (!storeId) return res.status(400).json({ success: false, message: 'معرّف المتجر مطلوب', data: null });
  if (!productId) return res.status(400).json({ success: false, message: 'المنتج مطلوب', data: null });
  if (quantity === undefined || quantity === 0) {
    return res.status(400).json({ success: false, message: 'الكمية يجب ألا تكون صفراً', data: null });
  }

  const store = await requireStore(storeId, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const { inventoryItem, adjustment } = await InventoryService.manualAdjustment({
    store: storeId,
    merchant: store.merchant,
    productId,
    location: location || null,
    quantity: Number(quantity),
    reason: reason || null,
    notes: notes || null,
    performedBy: req.user._id,
  });

  await logActivity(req, {
    action: 'inventory.adjust',
    resourceType: 'inventory',
    resourceId: adjustment._id,
    resourceName: inventoryItem.product?.name || 'مخزون',
    details: `تعديل مخزون: ${quantity > 0 ? '+' : ''}${quantity} (${reason || 'تعديل يدوي'})`,
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم تعديل المخزون بنجاح',
    data: { inventoryItem, adjustment },
  });
});

const getAdjustments = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ success: false, message: 'معرّف المتجر مطلوب', data: null });

  const store = await requireStore(storeId, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const { limit, skip, page } = getPaginationParams(req);
  const { productId, type, date_from, date_to } = req.query;

  const query = { store: storeId };
  if (productId) query.product = productId;
  if (type) query.type = type;
  if (date_from || date_to) {
    query.createdAt = {};
    if (date_from) query.createdAt.$gte = new Date(date_from);
    if (date_to) query.createdAt.$lte = new Date(date_to);
  }

  const [adjustments, total] = await Promise.all([
    InventoryAdjustment.find(query)
      .populate('product', 'name images sku')
      .populate('location', 'name')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    InventoryAdjustment.countDocuments(query),
  ]);

  return apiResponse(res, {
    message: 'تم جلب سجل التعديلات',
    data: adjustments,
    pagination: paginateResponse(total, page, limit),
  });
});

// ─── Inventory Locations ───────────────────────────────────────────────────────

const createLocation = asyncHandler(async (req, res) => {
  const { storeId, name, address } = req.body;
  if (!storeId) return res.status(400).json({ success: false, message: 'معرّف المتجر مطلوب', data: null });
  if (!name) return res.status(400).json({ success: false, message: 'اسم الموقع مطلوب', data: null });

  const store = await requireStore(storeId, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  if (store.plan === 'starter') {
    return res.status(403).json({ success: false, message: 'مواقع المخزون متاحة للخطة الاحترافية فما فوق', data: null });
  }

  const location = await InventoryLocation.create({
    store: storeId,
    merchant: store.merchant,
    name,
    address: address || undefined,
  });

  return apiResponse(res, { statusCode: 201, message: 'تم إضافة الموقع', data: location });
});

const getLocations = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ success: false, message: 'معرّف المتجر مطلوب', data: null });

  const store = await requireStore(storeId, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const locations = await InventoryLocation.find({ store: storeId }).sort({ createdAt: -1 });

  const itemsCount = await InventoryItem.aggregate([
    { $match: { store: storeId, location: { $ne: null } } },
    { $group: { _id: '$location', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
  ]);

  const countMap = {};
  for (const row of itemsCount) {
    countMap[row._id.toString()] = { itemCount: row.count, totalQuantity: row.totalQty };
  }

  const data = locations.map((loc) => ({
    ...loc.toObject(),
    itemCount: countMap[loc._id.toString()]?.itemCount || 0,
    totalQuantity: countMap[loc._id.toString()]?.totalQuantity || 0,
  }));

  return apiResponse(res, { message: 'تم جلب المواقع', data });
});

const updateLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const location = await InventoryLocation.findById(id);
  if (!location) return res.status(404).json({ success: false, message: 'الموقع غير موجود', data: null });

  const store = await requireStore(location.store, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'لا تملك صلاحية الوصول', data: null });

  const { name, address, isActive } = req.body;
  if (name !== undefined) location.name = name;
  if (address !== undefined) location.address = address || null;
  if (isActive !== undefined) location.isActive = isActive;

  await location.save();
  return apiResponse(res, { message: 'تم تحديث الموقع', data: location });
});

const deleteLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const location = await InventoryLocation.findById(id);
  if (!location) return res.status(404).json({ success: false, message: 'الموقع غير موجود', data: null });

  const store = await requireStore(location.store, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'لا تملك صلاحية الوصول', data: null });

  await InventoryItem.updateMany({ location: id }, { $set: { location: null } });
  await InventoryLocation.findByIdAndDelete(id);

  return apiResponse(res, { message: 'تم حذف الموقع', data: null });
});

// ─── Inventory Transfers ───────────────────────────────────────────────────────

const transferStock = asyncHandler(async (req, res) => {
  const { storeId, productId, fromLocation, toLocation, quantity, reason } = req.body;

  if (!storeId || !productId || !fromLocation || !toLocation || !quantity) {
    return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة', data: null });
  }

  const store = await requireStore(storeId, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  if (store.plan === 'starter') {
    return res.status(403).json({ success: false, message: 'نقل المخزون متاح للخطة الاحترافية فما فوق', data: null });
  }

  const result = await InventoryService.transferStock({
    store: storeId,
    merchant: store.merchant,
    productId,
    fromLocation,
    toLocation,
    quantity: Number(quantity),
    reason: reason || null,
    performedBy: req.user._id,
  });

  return apiResponse(res, { message: 'تم نقل المخزون بنجاح', data: result });
});

// ─── Reports ───────────────────────────────────────────────────────────────────

const getValuationReport = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ success: false, message: 'معرّف المتجر مطلوب', data: null });

  const store = await requireStore(storeId, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const report = await InventoryService.getValuationReport(storeId);
  return apiResponse(res, { message: 'تم جلب تقرير التقييم', data: report });
});

const getLowStockReport = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ success: false, message: 'معرّف المتجر مطلوب', data: null });

  const store = await requireStore(storeId, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const items = await InventoryService.getLowStockItems(storeId);
  return apiResponse(res, { message: 'تم جلب تقرير المخزون المنخفض', data: items });
});

const getProjectedDepletion = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ success: false, message: 'معرّف المتجر مطلوب', data: null });

  const store = await requireStore(storeId, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const items = await InventoryService.getProjectedDepletion(storeId);
  return apiResponse(res, { message: 'تم جلب تقرير الاستنزاف المتوقع', data: items });
});

const getInventoryHistory = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ success: false, message: 'معرّف المتجر مطلوب', data: null });

  const store = await requireStore(storeId, req.user._id);
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const { limit, skip, page } = getPaginationParams(req);
  const { productId, type, date_from, date_to } = req.query;

  const history = await InventoryService.getHistory(storeId, { productId, type, date_from, date_to });

  const total = history.length;
  const paginated = history.slice(skip, skip + limit);

  return apiResponse(res, {
    message: 'تم جلب سجل المخزون',
    data: paginated,
    pagination: paginateResponse(total, page, limit),
  });
});

module.exports = {
  getInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  createAdjustment,
  getAdjustments,
  createLocation,
  getLocations,
  updateLocation,
  deleteLocation,
  transferStock,
  getValuationReport,
  getLowStockReport,
  getProjectedDepletion,
  getInventoryHistory,
};
