const Merchant     = require('../models/Merchant');
const Customer     = require('../models/Customer');
const Store        = require('../models/Store');
const Order        = require('../models/Order');
const Subscription = require('../models/Subscription');
const SubscriptionEvent = require('../models/SubscriptionEvent');
const Product      = require('../models/Product');
const BillingService = require('../services/BillingService');
const { asyncHandler, apiResponse, getPaginationParams, paginateResponse } = require('../utils/helpers');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// Platform-wide overview metrics
// ─────────────────────────────────────────────────────────────────────────────
const getStats = asyncHandler(async (req, res) => {
  const [
    totalMerchants,
    totalCustomers,
    totalStores,
    totalOrders,
    totalProducts,
    pendingSubscriptions,
    revenueAgg,
  ] = await Promise.all([
    Merchant.countDocuments(),
    Customer.countDocuments(),
    Store.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments({ isDeleted: { $ne: true } }),
    Subscription.countDocuments({ status: 'pending' }),
    Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total ?? 0;

  return apiResponse(res, {
    message: 'تم جلب إحصائيات المنصة',
    data: {
      totalMerchants,
      totalCustomers,
      totalStores,
      totalOrders,
      totalProducts,
      pendingSubscriptions,
      totalRevenue,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/merchants
// List all merchants with pagination + search
// ─────────────────────────────────────────────────────────────────────────────
const getMerchants = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPaginationParams(req);
  const { search, isActive } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const [merchants, total] = await Promise.all([
    Merchant.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Merchant.countDocuments(filter),
  ]);

  return apiResponse(res, {
    message: 'تم جلب قائمة التجار',
    data: merchants,
    pagination: paginateResponse(total, page, limit),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/merchants/:id
// Get a single merchant with their stores
// ─────────────────────────────────────────────────────────────────────────────
const getMerchantById = asyncHandler(async (req, res) => {
  const merchant = await Merchant.findById(req.params.id).select('-password');
  if (!merchant) {
    return res.status(404).json({ success: false, data: null, message: 'التاجر غير موجود' });
  }

  const [stores, orderCount] = await Promise.all([
    Store.find({ merchant: merchant._id }),
    Order.countDocuments({ merchant: merchant._id }),
  ]);

  return apiResponse(res, {
    message: 'تم جلب بيانات التاجر',
    data: { merchant, stores, orderCount },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/merchants/:id/toggle-active
// Activate or suspend a merchant account (supports timed suspension)
// ─────────────────────────────────────────────────────────────────────────────
const toggleMerchantActive = asyncHandler(async (req, res) => {
  const merchant = await Merchant.findById(req.params.id);
  if (!merchant) {
    return res.status(404).json({ success: false, data: null, message: 'التاجر غير موجود' });
  }

  const { days } = req.body;

  if (merchant.isActive) {
    // Suspend
    merchant.isActive = false;
    merchant.suspendedUntil = days && days > 0
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      : null;
  } else {
    // Activate
    merchant.isActive = true;
    merchant.suspendedUntil = null;
  }

  await merchant.save();

  return apiResponse(res, {
    message: merchant.isActive
      ? 'تم تفعيل حساب التاجر'
      : days && days > 0
        ? `تم تعليق حساب التاجر لمدة ${days} يوم`
        : 'تم تعليق حساب التاجر',
    data: { _id: merchant._id, isActive: merchant.isActive, suspendedUntil: merchant.suspendedUntil },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stores
// List all stores with pagination + search
// ─────────────────────────────────────────────────────────────────────────────
const getStores = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPaginationParams(req);
  const { search, plan, isActive } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }
  if (plan)     filter.plan     = plan;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const [stores, total] = await Promise.all([
    Store.find(filter)
      .populate('merchant', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Store.countDocuments(filter),
  ]);

  return apiResponse(res, {
    message: 'تم جلب قائمة المتاجر',
    data: stores,
    pagination: paginateResponse(total, page, limit),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/stores/:id/toggle-active
// Activate or deactivate a store (supports timed suspension)
// ─────────────────────────────────────────────────────────────────────────────
const toggleStoreActive = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) {
    return res.status(404).json({ success: false, data: null, message: 'المتجر غير موجود' });
  }

  const { days } = req.body;

  if (store.isActive) {
    store.isActive = false;
    store.suspendedUntil = days && days > 0
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      : null;
  } else {
    store.isActive = true;
    store.suspendedUntil = null;
  }

  await store.save();

  return apiResponse(res, {
    message: store.isActive
      ? 'تم تفعيل المتجر'
      : days && days > 0
        ? `تم إيقاف المتجر لمدة ${days} يوم`
        : 'تم إيقاف المتجر',
    data: { _id: store._id, isActive: store.isActive, suspendedUntil: store.suspendedUntil },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/stores/:id/set-plan
// Manually override a store's subscription plan
// ─────────────────────────────────────────────────────────────────────────────
const setStorePlan = asyncHandler(async (req, res) => {
  const { plan, days } = req.body;

  if (!['starter', 'pro', 'business'].includes(plan)) {
    return res.status(400).json({ success: false, data: null, message: 'الخطة غير صالحة' });
  }

  const store = await Store.findById(req.params.id);
  if (!store) {
    return res.status(404).json({ success: false, data: null, message: 'المتجر غير موجود' });
  }

  // Determine Free Trial status for upgrade validation
  const lastApprovedSub = await Subscription.findOne({
    store: store._id,
    status: 'approved',
    expiresAt: { $ne: null },
  }).sort({ approvedAt: -1 });
  const isFreeTrial = !lastApprovedSub && store.plan === 'starter';

  // Block downgrades on admin set-plan too (but not for Free Trial)
  try {
    BillingService.validateUpgrade(store.plan, plan, isFreeTrial);
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: null,
      message: err.message,
    });
  }

  const previousPlan = store.plan;
  const previousExpiresAt = store.planExpiresAt;

  store.plan = plan;
  if (days) {
    const expires = new Date();
    expires.setDate(expires.getDate() + Number(days));
    store.planExpiresAt = expires;
  }

  await store.save();

  // Sync the approved subscription's expiresAt so the merchant dashboard shows the correct date
  if (days) {
    await Subscription.findOneAndUpdate(
      { store: store._id, status: 'approved' },
      { expiresAt: store.planExpiresAt }
    );
  }

  // Audit event for admin plan change
  await SubscriptionEvent.create({
    merchant: store.merchant,
    store: store._id,
    eventType: 'admin_changed',
    previousPlan,
    newPlan: plan,
    previousExpiresAt,
    newExpiresAt: store.planExpiresAt,
    description: `تغيير يدوي من الإدارة: ${previousPlan} ← ${plan}${days ? ` لمدة ${Number(days)} يوم` : ''}`,
    performedBy: req.user._id,
  });

  return apiResponse(res, {
    message: `تم تحديث خطة المتجر إلى ${plan}`,
    data: store,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/orders
// List all platform orders with pagination + filter
// ─────────────────────────────────────────────────────────────────────────────
const getOrders = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPaginationParams(req);
  const { status, storeId, merchantId } = req.query;

  const filter = {};
  if (status)     filter.status   = status;
  if (storeId)    filter.store    = storeId;
  if (merchantId) filter.merchant = merchantId;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('customer',  'name email phone')
      .populate('merchant',  'name email')
      .populate('store',     'name slug plan')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return apiResponse(res, {
    message: 'تم جلب قائمة الطلبات',
    data: orders,
    pagination: paginateResponse(total, page, limit),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/customers
// List all customers with pagination + search
// ─────────────────────────────────────────────────────────────────────────────
const getCustomers = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPaginationParams(req);
  const { search, isActive } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const [customers, total] = await Promise.all([
    Customer.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Customer.countDocuments(filter),
  ]);

  return apiResponse(res, {
    message: 'تم جلب قائمة العملاء',
    data: customers,
    pagination: paginateResponse(total, page, limit),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/customers/:id/toggle-active
// Activate or suspend a customer account (supports timed suspension)
// ─────────────────────────────────────────────────────────────────────────────
const toggleCustomerActive = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ success: false, data: null, message: 'العميل غير موجود' });
  }

  const { days } = req.body;

  if (customer.isActive) {
    customer.isActive = false;
    customer.suspendedUntil = days && days > 0
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      : null;
  } else {
    customer.isActive = true;
    customer.suspendedUntil = null;
  }

  await customer.save();

  return apiResponse(res, {
    message: customer.isActive
      ? 'تم تفعيل حساب العميل'
      : days && days > 0
        ? `تم تعليق حساب العميل لمدة ${days} يوم`
        : 'تم تعليق حساب العميل',
    data: { _id: customer._id, isActive: customer.isActive, suspendedUntil: customer.suspendedUntil },
  });
});

module.exports = {
  getStats,
  getMerchants,
  getMerchantById,
  toggleMerchantActive,
  getStores,
  toggleStoreActive,
  setStorePlan,
  getOrders,
  getCustomers,
  toggleCustomerActive,
};
