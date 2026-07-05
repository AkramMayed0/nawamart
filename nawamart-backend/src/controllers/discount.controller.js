const Discount = require('../models/Discount');
const Store = require('../models/Store');
const { apiResponse, asyncHandler, getPaginationParams, paginateResponse } = require('../utils/helpers');

const listDiscounts = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPaginationParams(req);
  const { isActive } = req.query;
  const query = { store: req.params.storeId, merchant: req.user._id };
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const [discounts, total] = await Promise.all([
    Discount.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Discount.countDocuments(query),
  ]);

  return apiResponse(res, {
    message: 'تم جلب أكواد الخصم',
    data: discounts,
    pagination: paginateResponse(total, page, limit),
  });
});

const createDiscount = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ _id: req.params.storeId, merchant: req.user._id });
  if (!store) {
    return res.status(403).json({ success: false, message: 'المتجر غير موجود أو لا تملك صلاحية الإضافة إليه', data: null });
  }

  const existing = await Discount.findOne({ store: req.params.storeId, code: req.body.code?.toUpperCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'كود الخصم موجود مسبقاً', data: null });
  }

  if (req.body.type === 'fixed' && req.body.value > 999999) {
    return res.status(400).json({ success: false, message: 'قيمة الخصم كبيرة جداً', data: null });
  }

  const discount = await Discount.create({
    store: req.params.storeId,
    merchant: req.user._id,
    ...req.body,
    code: req.body.code?.toUpperCase(),
  });

  return apiResponse(res, { statusCode: 201, message: 'تم إنشاء كود الخصم', data: discount });
});

const updateDiscount = asyncHandler(async (req, res) => {
  let discount = await Discount.findOne({ _id: req.params.id, merchant: req.user._id });
  if (!discount) {
    return res.status(404).json({ success: false, message: 'كود الخصم غير موجود', data: null });
  }

  const updates = req.body;
  if (updates.code) updates.code = updates.code.toUpperCase();

  if (updates.code && updates.code !== discount.code) {
    const dup = await Discount.findOne({ store: discount.store, code: updates.code, _id: { $ne: discount._id } });
    if (dup) return res.status(400).json({ success: false, message: 'كود الخصم موجود مسبقاً', data: null });
  }

  Object.assign(discount, updates);
  await discount.save();

  return apiResponse(res, { message: 'تم تحديث كود الخصم', data: discount });
});

const deleteDiscount = asyncHandler(async (req, res) => {
  const discount = await Discount.findOneAndDelete({ _id: req.params.id, merchant: req.user._id });
  if (!discount) {
    return res.status(404).json({ success: false, message: 'كود الخصم غير موجود', data: null });
  }
  return apiResponse(res, { message: 'تم حذف كود الخصم', data: null });
});

const validateDiscount = asyncHandler(async (req, res) => {
  const { code, orderAmount, customerId } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'كود الخصم مطلوب', data: null });
  }

  const discount = await Discount.findOne({
    store: req.params.storeId,
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!discount) {
    return res.status(404).json({ success: false, data: { valid: false }, message: 'كود الخصم غير صالح' });
  }

  if (discount.expiresAt && new Date() > discount.expiresAt) {
    return res.status(400).json({ success: false, data: { valid: false }, message: 'انتهت صلاحية كود الخصم' });
  }

  if (discount.startsAt && new Date() < discount.startsAt) {
    return res.status(400).json({ success: false, data: { valid: false }, message: 'كود الخصم لم يبدأ بعد' });
  }

  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    return res.status(400).json({ success: false, data: { valid: false }, message: 'تم استنفاذ كود الخصم' });
  }

  if (orderAmount && orderAmount < discount.minOrderAmount) {
    return res.status(400).json({
      success: false, data: { valid: false, minOrderAmount: discount.minOrderAmount },
      message: `الحد الأدنى للطلب ${discount.minOrderAmount} ريال`,
    });
  }

  let discountAmount = discount.type === 'percentage'
    ? Math.min(orderAmount * (discount.value / 100), discount.maxDiscount || Infinity)
    : discount.value;

  return apiResponse(res, {
    data: { valid: true, discount: discount.toObject(), discountAmount: Math.round(discountAmount) },
    message: 'كود الخصم صالح',
  });
});

module.exports = { listDiscounts, createDiscount, updateDiscount, deleteDiscount, validateDiscount };
