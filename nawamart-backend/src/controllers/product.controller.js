const Product = require('../models/Product');
const Store = require('../models/Store');
const { apiResponse, asyncHandler, getPaginationParams, paginateResponse } = require('../utils/helpers');
const { logActivity } = require('../services/audit');
const { fire } = require('../services/webhookService');
const InventoryService = require('../services/InventoryService');

function uploadedImageUrls(req) {
  if (Array.isArray(req.files)) return req.files.map((file) => file.path);
  if (req.file) return [req.file.path];
  return [];
}

function bodyArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseMaybeJSON(value, fallback = undefined) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function buildDigitalDelivery(body, existing = {}) {
  const raw = parseMaybeJSON(body.digitalDelivery, null);
  const source = raw && typeof raw === 'object' ? raw : body;
  const serialCodes = parseMaybeJSON(source.serialCodes, undefined);

  const next = { ...existing };
  if (source.digitalDeliveryEnabled !== undefined || source.enabled !== undefined) {
    next.enabled = source.digitalDeliveryEnabled === 'true' || source.digitalDeliveryEnabled === true || source.enabled === true;
  }
  if (source.deliveryType || source.type) next.type = source.deliveryType || source.type;
  if (source.fileUrl !== undefined) next.fileUrl = source.fileUrl || null;
  if (source.externalUrl !== undefined) next.externalUrl = source.externalUrl || null;
  if (source.instructions !== undefined) next.instructions = source.instructions || null;
  if (Array.isArray(serialCodes)) {
    next.serialCodes = serialCodes
      .map((code) => (typeof code === 'string' ? { code } : code))
      .filter((item) => item?.code)
      .map((item) => ({
        code: String(item.code).trim(),
        isClaimed: Boolean(item.isClaimed),
        claimedAt: item.claimedAt || null,
        order: item.order || null,
      }));
  }
  return next;
}

/**
 * POST /api/products
 * Create a new product (Merchant only)
 */
const createProduct = asyncHandler(async (req, res) => {
  const { storeId, name, description, price, salePrice, stock, category, weight, unlimitedStock, sku, brand, barcode, isFeatured } = req.body;

  // 1. Verify that the store belongs to the merchant
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return res.status(403).json({
      success: false,
      message: 'المتجر غير موجود أو لا تملك صلاحية الإضافة إليه',
      data: null,
    });
  }

  const images = uploadedImageUrls(req);

  const product = await Product.create({
    store: storeId,
    merchant: store.merchant,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    name,
    description,
    price,
    salePrice: salePrice || undefined,
    stock: stock || 0,
    category: category || undefined,
    weight: weight || undefined,
    unlimitedStock: unlimitedStock === 'true' || unlimitedStock === true,
    sku: sku || undefined,
    brand: brand || undefined,
    barcode: barcode || undefined,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    images,
    digitalDelivery: store.type === 'digital' ? buildDigitalDelivery(req.body) : undefined,
  });

  await InventoryService.getOrCreateItem(product, storeId, store.merchant);

  await logActivity(req, {
    action: 'product.create',
    resourceType: 'product',
    resourceId: product._id,
    resourceName: product.name,
    details: `تم إنشاء المنتج ${product.name}`,
  });

  fire('product.created', product.toObject(), store._id, store.merchant);

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إضافة المنتج بنجاح',
    data: product,
  });
});

/**
 * GET /api/products/store/:storeId
 * Get all products for a specific store (Public)
 */
const getProductsByStore = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { limit, skip, page } = getPaginationParams(req);
  const { search, category, type, visibility, brand, minPrice, maxPrice, sort } = req.query;
  const store = await Store.findOne({ _id: storeId, isActive: true });
  if (!store) {
    return res.status(404).json({
      success: false,
      message: 'المتجر غير موجود أو غير مفعل',
      data: null,
    });
  }
  const query = { store: storeId, isDeleted: false, isActive: true };
  if (category) query.category = category;
  if (type) query.type = type;
  if (brand) query.brand = new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (visibility === 'featured') query.isFeatured = true;
  if (visibility === 'hidden') query.isActive = false;
  if (visibility === 'visible') query.isActive = true;
  if (search) { query.$text = { $search: search }; }
  const [products, total] = await Promise.all([
    Product.find(query)
      .select('-digitalDelivery.fileUrl -digitalDelivery.externalUrl -digitalDelivery.serialCodes')
      .sort(sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : sort === 'name' ? { name: 1 } : { createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
  ]);
  return res.status(200).json({
    success: true,
    message: 'تم جلب المنتجات بنجاح',
    data: products,
    pagination: paginateResponse(total, page, limit),
  });
});

/**
 * GET /api/products/:id
 * Get a single active product for a public storefront.
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: false,
    isActive: true,
  })
    .select('-digitalDelivery.fileUrl -digitalDelivery.externalUrl -digitalDelivery.serialCodes')
    .populate('store', 'name slug type isActive');

  if (!product || !product.store?.isActive) {
    return res.status(404).json({
      success: false,
      message: 'المنتج غير موجود أو غير متاح',
      data: null,
    });
  }

  return apiResponse(res, {
    message: 'تم جلب بيانات المنتج بنجاح',
    data: product,
  });
});

/**
 * PUT /api/products/:id
 * Update a product (Merchant only)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 1. Find product
  let product = await Product.findById(id).populate('store', 'merchant');
  
  if (!product || product.isDeleted) {
    return res.status(404).json({
      success: false,
      message: 'المنتج غير موجود',
      data: null,
    });
  }

  // 2. Ensure merchant owns the store of this product
  if (product.store.merchant.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'لا تملك صلاحية تعديل هذا المنتج',
      data: null,
    });
  }

  const { name, description, price, salePrice, stock, category, isActive, weight, unlimitedStock, sku, brand, barcode, isFeatured } = req.body;

  const existingImages = bodyArray(req.body.existingImages || req.body['existingImages[]']);
  const newImages = uploadedImageUrls(req);
  const images = [...existingImages, ...newImages].slice(0, 10);

  product.name = name || product.name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  
  // Reset salePrice if empty string or null passed, else update
  if (salePrice === '' || salePrice === null) {
    product.salePrice = undefined;
  } else if (salePrice !== undefined) {
    product.salePrice = salePrice;
  }

  if (stock !== undefined) {
    product.stock = stock;
    // Auto-enable if stock restocked
    if (stock > 0 && !product.isActive) product.isActive = true;
  }
  if (category !== undefined) product.category = category;
  if (weight !== undefined) product.weight = weight;
  if (unlimitedStock !== undefined) product.unlimitedStock = unlimitedStock === 'true' || unlimitedStock === true;
  if (isActive !== undefined) product.isActive = isActive;
  if (sku !== undefined) product.sku = sku || null;
  if (brand !== undefined) product.brand = brand || null;
  if (barcode !== undefined) product.barcode = barcode || null;
  if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
  if (
    product.store?.type === 'digital' ||
    req.body.digitalDelivery !== undefined ||
    req.body.digitalDeliveryEnabled !== undefined ||
    req.body.deliveryType !== undefined ||
    req.body.serialCodes !== undefined
  ) {
    product.digitalDelivery = buildDigitalDelivery(req.body, product.digitalDelivery?.toObject?.() || product.digitalDelivery || {});
  }
  if (existingImages.length > 0 || newImages.length > 0) {
    product.images = images;
  }

  product.updatedBy = req.user._id;
  await product.save();

  await InventoryService.syncWithProduct(product._id);

  await logActivity(req, {
    action: 'product.update',
    resourceType: 'product',
    resourceId: product._id,
    resourceName: product.name,
    details: `تم تحديث المنتج ${product.name}`,
  });

  fire('product.updated', product.toObject(), product.store._id, product.store.merchant);

  return apiResponse(res, {
    message: 'تم تحديث المنتج بنجاح',
    data: product,
  });
});

/**
 * DELETE /api/products/:id
 * Soft delete a product (Merchant only)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let product = await Product.findById(id).populate('store', 'merchant');

  if (!product || product.isDeleted) {
    return res.status(404).json({
      success: false,
      message: 'المنتج غير موجود',
      data: null,
    });
  }

  if (product.store.merchant.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'لا تملك صلاحية حذف هذا المنتج',
      data: null,
    });
  }

  // Soft delete with 30-day recovery window
  product.isDeleted = true;
  product.isActive = false;
  product.deletedAt = new Date();
  product.updatedBy = req.user._id;
  await product.save();

  await logActivity(req, {
    action: 'product.delete',
    resourceType: 'product',
    resourceId: product._id,
    resourceName: product.name,
    details: `تم حذف المنتج ${product.name}`,
  });

  fire('product.deleted', { _id: product._id, name: product.name }, product.store._id, product.store.merchant);

  return apiResponse(res, {
    message: 'تم حذف المنتج بنجاح',
    data: null,
  });
});

/**
 * POST /api/products/:id/restore
 * Restore a soft-deleted product (Merchant only)
 */
const restoreProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let product = await Product.findById(id).populate('store', 'merchant');

  if (!product || !product.isDeleted) {
    return res.status(404).json({
      success: false,
      message: 'المنتج غير موجود أو لم يتم حذفه',
      data: null,
    });
  }

  if (product.store.merchant.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'لا تملك صلاحية استعادة هذا المنتج',
      data: null,
    });
  }

  product.isDeleted = false;
  product.isActive = true;
  product.deletedAt = null;
  product.updatedBy = req.user._id;
  await product.save();

  await logActivity(req, {
    action: 'product.restore',
    resourceType: 'product',
    resourceId: product._id,
    resourceName: product.name,
    details: `تمت استعادة المنتج ${product.name}`,
  });

  fire('product.restored', product.toObject(), product.store._id, product.store.merchant);

  return apiResponse(res, {
    message: 'تمت استعادة المنتج بنجاح',
    data: product,
  });
});

const getMerchantProducts = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ success: false, message: 'معرّف المتجر مطلوب', data: null });

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });

  const { limit, skip, page } = getPaginationParams(req);
  const { search, category, visibility, brand, minPrice, maxPrice, sort, type } = req.query;

  const query = { store: storeId, isDeleted: false };
  if (category) query.category = category;
  if (brand) query.brand = new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (type) query.type = type;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (visibility === 'featured') query.isFeatured = true;
  if (visibility === 'archived') query.isActive = false;
  if (visibility === 'active') query.isActive = true;
  if (search) query.$text = { $search: search };

  const [products, total] = await Promise.all([
    Product.find(query)
      .select('-digitalDelivery.fileUrl -digitalDelivery.externalUrl -digitalDelivery.serialCodes')
      .sort(sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : sort === 'name' ? { name: 1 } : { createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return apiResponse(res, {
    message: 'تم جلب المنتجات',
    data: products,
    pagination: paginateResponse(total, page, limit),
  });
});

module.exports = {
  createProduct,
  getProductsByStore,
  getProductById,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getMerchantProducts,
};
