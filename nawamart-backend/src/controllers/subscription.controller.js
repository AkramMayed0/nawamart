const Subscription = require('../models/Subscription');
const Store = require('../models/Store');
const { asyncHandler, apiResponse } = require('../utils/helpers');

// ─── POST /api/subscriptions/request ─────────────────────────────────────────
const requestSubscription = asyncHandler(async (req, res) => {
  const { storeId, requestedPlan, waslUrl } = req.body;

  if (!storeId || !requestedPlan || !waslUrl) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'يرجى تقديم معرف المتجر والخطة المطلوبة وإيصال الدفع',
    });
  }

  if (!['pro', 'business'].includes(requestedPlan)) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'الخطة المطلوبة غير صالحة — اختر pro أو business',
    });
  }

  // Ensure this is the merchant's own store
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'المتجر غير موجود أو لا تملك صلاحية إدارته',
    });
  }

  // Block duplicate pending requests
  const existing = await Subscription.findOne({
    store: storeId,
    status: 'pending',
  });
  if (existing) {
    return res.status(409).json({
      success: false,
      data: null,
      message: 'يوجد طلب اشتراك معلق بالفعل لهذا المتجر — يرجى انتظار مراجعة الإدارة',
    });
  }

  const subscription = await Subscription.create({
    merchant: req.user._id,
    store: storeId,
    requestedPlan,
    waslUrl,
    status: 'pending',
  });

  // Save waslUrl to store as well for reference
  store.planWaslUrl = waslUrl;
  await store.save();

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إرسال طلب الاشتراك بنجاح — سيتم مراجعته من قبل الإدارة',
    data: subscription,
  });
});

// ─── GET /api/subscriptions/my ────────────────────────────────────────────────
const getMySubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ merchant: req.user._id })
    .populate('store', 'name slug plan')
    .sort('-createdAt');

  return apiResponse(res, {
    message: 'تم جلب طلبات الاشتراك',
    data: subscriptions,
  });
});

// ─── GET /api/subscriptions (admin only) ─────────────────────────────────────
const getAllSubscriptions = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const subscriptions = await Subscription.find(filter)
    .populate('merchant', 'name email')
    .populate('store', 'name slug plan planExpiresAt')
    .sort('-createdAt');

  return apiResponse(res, {
    message: 'تم جلب جميع طلبات الاشتراك',
    data: subscriptions,
  });
});

// ─── PUT /api/subscriptions/:id/approve (admin only) ─────────────────────────
const approveSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id).populate('store');

  if (!subscription) {
    return res.status(404).json({ success: false, data: null, message: 'طلب الاشتراك غير موجود' });
  }

  if (subscription.status !== 'pending') {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'تم البت في هذا الطلب مسبقاً',
    });
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  // Approve subscription
  subscription.status = 'approved';
  subscription.reviewedBy = req.user._id;
  subscription.approvedAt = now;
  subscription.expiresAt = expiresAt;
  await subscription.save();

  // Upgrade the store plan
  await Store.findByIdAndUpdate(subscription.store._id, {
    plan: subscription.requestedPlan,
    planExpiresAt: expiresAt,
  });

  return apiResponse(res, {
    message: `تم تفعيل خطة ${subscription.requestedPlan} للمتجر لمدة 30 يوماً`,
    data: subscription,
  });
});

// ─── PUT /api/subscriptions/:id/reject (admin only) ──────────────────────────
const rejectSubscription = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return res.status(404).json({ success: false, data: null, message: 'طلب الاشتراك غير موجود' });
  }

  if (subscription.status !== 'pending') {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'تم البت في هذا الطلب مسبقاً',
    });
  }

  subscription.status = 'rejected';
  subscription.reviewedBy = req.user._id;
  subscription.reviewNote = reason || 'لم يتم قبول الطلب';
  await subscription.save();

  return apiResponse(res, {
    message: 'تم رفض طلب الاشتراك',
    data: subscription,
  });
});

module.exports = {
  requestSubscription,
  getMySubscriptions,
  getAllSubscriptions,
  approveSubscription,
  rejectSubscription,
};
