const Subscription = require('../models/Subscription');
const SubscriptionEvent = require('../models/SubscriptionEvent');
const Invoice = require('../models/Invoice');
const Store = require('../models/Store');
const { asyncHandler, apiResponse } = require('../utils/helpers');
const { getNextSequence } = require('../utils/counters');
const BillingService = require('../services/BillingService');

// ─── POST /api/subscriptions/request ─────────────────────────────────────────
const requestSubscription = asyncHandler(async (req, res) => {
  const { storeId, requestedPlan, waslUrl, billing } = req.body;

  if (!storeId || !requestedPlan || !waslUrl) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'يرجى تقديم معرف المتجر والخطة المطلوبة وإيصال الدفع',
    });
  }

  if (!BillingService.VALID_PLANS.includes(requestedPlan)) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'الخطة المطلوبة غير صالحة',
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

  // Determine Free Trial status + request type from last completed subscription
  const lastApprovedSub = await Subscription.findOne({
    store: store._id,
    status: 'approved',
    expiresAt: { $ne: null },
  }).sort({ approvedAt: -1 });

  const isFreeTrial = !lastApprovedSub && store.plan === 'starter';
  const requestType = lastApprovedSub ? 'UPGRADE' : 'NEW_SUBSCRIPTION';

  // Validate upgrade rules (block same-plan, downgrades, and cross-cycle upgrades, but NOT for Free Trial)
  const currentBilling = lastApprovedSub?.billing ?? null;
  const targetBilling = billing === 'yearly' ? 'yearly' : 'monthly';
  try {
    BillingService.validateUpgrade(store.plan, requestedPlan, isFreeTrial, currentBilling, targetBilling);
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: null,
      message: err.message,
    });
  }
  const proration = await BillingService.getProrationEstimate(store, requestedPlan, targetBilling);

  // Create the subscription. A partial unique index on {store, status: 'pending'}
  // prevents duplicate pending requests even under concurrent access.
  let subscription;
  try {
    subscription = await Subscription.create({
      type: requestType,
      merchant: req.user._id,
      store: storeId,
      requestedPlan,
      billing: targetBilling,
      waslUrl,
      status: 'pending',
      previousPlan: store.plan,
      previousExpiresAt: store.planExpiresAt,
      remainingDays: proration.remainingDays,
      creditApplied: proration.remainingValue,
      amountDue: proration.upgradeCost,
      walletCreditGenerated: proration.walletCredit,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'يوجد طلب اشتراك معلق بالفعل لهذا المتجر — يرجى انتظار مراجعة الإدارة',
      });
    }
    throw err;
  }

  // Create invoice for this subscription request
  const year = new Date().getFullYear();
  const seq = await getNextSequence(`invoice-${year}`);
  const invoiceNumber = `INV-${year}-${String(seq).padStart(5, '0')}`;

  await Invoice.create({
    invoiceNumber,
    merchant: req.user._id,
    subscription: subscription._id,
    plan: requestedPlan,
    billing: targetBilling,
    planPrice: proration.newPlanPrice,
    creditApplied: proration.remainingValue,
    amountDue: proration.upgradeCost,
    previousPlan: store.plan,
    remainingDays: proration.remainingDays,
    remainingValue: proration.remainingValue,
    walletCreditGenerated: proration.walletCredit,
    waslUrl,
    status: 'paid', // receipt already uploaded
  });

  // Save waslUrl to store as well for reference
  store.planWaslUrl = waslUrl;
  await store.save();

  // Audit event for request
  const eventDesc = requestType === 'UPGRADE'
    ? `طلب ترقية من ${store.plan} إلى ${requestedPlan}`
    : `طلب اشتراك ${requestedPlan}`;

  await SubscriptionEvent.create({
    subscription: subscription._id,
    merchant: req.user._id,
    store: storeId,
    eventType: 'requested',
    previousPlan: store.plan,
    newPlan: requestedPlan,
    previousExpiresAt: store.planExpiresAt,
    billing: targetBilling,
    description: eventDesc,
  });

  return apiResponse(res, {
    statusCode: 201,
    data: {
      subscription,
      invoice: { invoiceNumber, amountDue: proration.upgradeCost },
      proration,
    },
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

// ─── GET /api/subscriptions/prorate ───────────────────────────────────────────
// Returns proration estimate for a target plan (no DB mutations)
const getProration = asyncHandler(async (req, res) => {
  const { targetPlan, billing } = req.query;

  if (!targetPlan || !BillingService.VALID_PLANS.includes(targetPlan)) {
    return res.status(400).json({ success: false, data: null, message: 'الخطة المطلوبة غير صالحة' });
  }

  const store = await Store.findOne({ merchant: req.user._id });
  if (!store) {
    return res.status(404).json({ success: false, data: null, message: 'لم يتم العثور على متجر' });
  }

  // Determine Free Trial status (no completed subscription on starter)
  const lastApprovedSub = await Subscription.findOne({
    store: store._id,
    status: 'approved',
    expiresAt: { $ne: null },
  }).sort({ approvedAt: -1 });
  const isFreeTrial = !lastApprovedSub && store.plan === 'starter';

  // Validate upgrade rules upfront (but not for Free Trial)
  const currentBilling = lastApprovedSub?.billing ?? null;
  const targetBilling = billing === 'yearly' ? 'yearly' : 'monthly';
  try {
    BillingService.validateUpgrade(store.plan, targetPlan, isFreeTrial, currentBilling, targetBilling);
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: null,
      message: err.message,
    });
  }
  const proration = await BillingService.getProrationEstimate(store, targetPlan, targetBilling);

  return apiResponse(res, {
    message: 'تم حساب المبلغ المتبقي',
    data: proration,
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
  // Atomically claim the pending subscription to prevent race conditions.
  // Only one request will find it with status === 'pending'; all others get null.
  const subscription = await Subscription.findOneAndUpdate(
    { _id: req.params.id, status: 'pending' },
    { $set: { status: 'approved', approvedAt: new Date(), reviewedBy: req.user._id } },
    { new: true }
  ).populate('store');

  if (!subscription) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'تم البت في هذا الطلب مسبقاً',
    });
  }

  // Run proration + store update + ledger entries inside a try-catch.
  // If anything fails, roll back the subscription status so it can be retried
  // instead of leaving a phantom 'approved' subscription in the database.
  let result;
  try {
    result = await BillingService.approveWithProration(subscription, req.user._id);
  } catch (err) {
    await Subscription.findByIdAndUpdate(subscription._id, {
      $set: { status: 'pending', reviewedBy: null, approvedAt: null },
    });
    throw err;
  }

  // Mark the invoice as verified
  await Invoice.findOneAndUpdate(
    { subscription: subscription._id },
    { $set: { status: 'verified', verifiedBy: req.user._id, verifiedAt: new Date() } }
  );

  return apiResponse(res, {
    message: `تم تفعيل خطة ${subscription.requestedPlan} للمتجر (${subscription.billing === 'yearly' ? 'سنوي' : 'شهري'})`,
    data: {
      subscription: result.subscription,
      proration: result.proration,
    },
  });
});

// ─── PUT /api/subscriptions/:id/reject (admin only) ──────────────────────────
const rejectSubscription = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  // Atomically claim for rejection — prevents race with approve
  const subscription = await Subscription.findOneAndUpdate(
    { _id: req.params.id, status: 'pending' },
    {
      $set: {
        status: 'rejected',
        reviewedBy: req.user._id,
        reviewNote: reason || 'لم يتم قبول الطلب',
      },
    },
    { new: true }
  );

  if (!subscription) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'تم البت في هذا الطلب مسبقاً',
    });
  }

  // Cancel the linked invoice
  await Invoice.findOneAndUpdate(
    { subscription: subscription._id },
    { $set: { status: 'cancelled' } }
  );

  // Audit event for rejection
  const store = await Store.findById(subscription.store);
  await SubscriptionEvent.create({
    subscription: subscription._id,
    merchant: store?.merchant ?? subscription.merchant,
    store: subscription.store,
    eventType: 'rejected',
    newPlan: subscription.requestedPlan,
    billing: subscription.billing,
    description: reason || 'لم يتم قبول الطلب',
    performedBy: req.user._id,
  });

  return apiResponse(res, {
    message: 'تم رفض طلب الاشتراك',
    data: subscription,
  });
});

module.exports = {
  requestSubscription,
  getMySubscriptions,
  getProration,
  getAllSubscriptions,
  approveSubscription,
  rejectSubscription,
};
