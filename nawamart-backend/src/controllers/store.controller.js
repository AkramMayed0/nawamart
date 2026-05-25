const Store = require('../models/Store');
const Merchant = require('../models/Merchant');
const { apiResponse, asyncHandler } = require('../utils/helpers');

function parsePaymentAccounts(value) {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      return undefined;
    }
  }
  return value;
}

function normalizePaymentAccounts(existing = {}, incoming) {
  const parsed = parsePaymentAccounts(incoming);
  if (parsed === undefined) return undefined;
  return {
    cherry: parsed.cherry ?? existing.cherry ?? null,
    kuraimi: parsed.kuraimi ?? existing.kuraimi ?? null,
    oneCash: parsed.oneCash ?? existing.oneCash ?? null,
  };
}

/**
 * POST /api/stores
 * Create a new store for the logged-in merchant
 */
const createStore = asyncHandler(async (req, res) => {
  const { name, type, description, category, contactPhone, paymentAccounts } = req.body;

  // Each merchant owns one public shop.
  const storeCount = await Store.countDocuments({ merchant: req.user._id });
  if (storeCount >= 1) {
    return res.status(400).json({
      success: false,
      message: 'لديك متجر بالفعل — يمكن لكل تاجر امتلاك متجر واحد فقط',
      data: null,
    });
  }

  let logo = null;
  let banner = null;

  if (req.files) {
    if (req.files.logo) logo = req.files.logo[0].path;
    if (req.files.banner) banner = req.files.banner[0].path;
  }

  // Parse paymentAccounts if sent as JSON string (common with multipart/form-data)
  const parsedPaymentAccounts = normalizePaymentAccounts({}, paymentAccounts);

  const store = await Store.create({
    merchant: req.user._id,
    name,
    type: type || 'physical',
    description,
    category,
    contactPhone: contactPhone?.trim() || null,
    paymentAccounts: parsedPaymentAccounts ?? undefined,
    logo,
    banner,
  });

  // Update merchant's stores array
  await Merchant.findByIdAndUpdate(req.user._id, {
    $push: { stores: store._id },
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء المتجر بنجاح',
    data: store,
  });
});

/**
 * GET /api/stores/my
 * Get all stores for the logged-in merchant
 */
const getMyStores = asyncHandler(async (req, res) => {
  const stores = await Store.find({ merchant: req.user._id }).sort({ createdAt: -1 });

  return apiResponse(res, {
    message: 'تم جلب المتاجر بنجاح',
    data: stores,
  });
});

/**
 * GET /api/stores/:slug
 * Get a store by its slug (Public)
 */
const getStoreBySlug = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug, isActive: true });

  if (!store) {
    return res.status(404).json({
      success: false,
      message: 'المتجر غير موجود أو غير مفعل',
      data: null,
    });
  }

  return apiResponse(res, {
    message: 'تم جلب بيانات المتجر',
    data: store,
  });
});

/**
 * PUT /api/stores/:id
 * Update a store (Merchant only)
 */
const updateStore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find store and ensure it belongs to the merchant
  let store = await Store.findOne({ _id: id, merchant: req.user._id });

  if (!store) {
    return res.status(404).json({
      success: false,
      message: 'المتجر غير موجود أو لا تملك صلاحية تعديله',
      data: null,
    });
  }

  const { name, description, category, contactPhone, paymentAccounts, isActive } = req.body;

  let logo = store.logo;
  let banner = store.banner;

  if (req.files) {
    if (req.files.logo) logo = req.files.logo[0].path;
    if (req.files.banner) banner = req.files.banner[0].path;
  }

  const parsedPaymentAccounts = normalizePaymentAccounts(store.paymentAccounts, paymentAccounts);

  store.name = name || store.name;
  if (description !== undefined) store.description = description;
  if (category !== undefined) store.category = category;
  if (contactPhone !== undefined) store.contactPhone = contactPhone?.trim() || null;
  if (parsedPaymentAccounts !== undefined) store.paymentAccounts = parsedPaymentAccounts;
  if (isActive !== undefined) store.isActive = isActive;
  store.logo = logo;
  store.banner = banner;

  await store.save(); // using save() to trigger pre-validate hook if slug logic needs to run (though it only runs on isNew by default)

  return apiResponse(res, {
    message: 'تم تحديث المتجر بنجاح',
    data: store,
  });
});

module.exports = {
  createStore,
  getMyStores,
  getStoreBySlug,
  updateStore,
};
