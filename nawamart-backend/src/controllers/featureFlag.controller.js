const FeatureFlag = require('../models/FeatureFlag');
const { apiResponse, asyncHandler, getPaginationParams, paginateResponse } = require('../utils/helpers');

const listFlags = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.stagingOnly !== undefined) query.stagingOnly = req.query.stagingOnly === 'true';
  if (req.query.enabled !== undefined) query.enabled = req.query.enabled === 'true';
  if (req.query.beta !== undefined) query.beta = req.query.beta === 'true';
  if (req.query.deprecated !== undefined) query.deprecated = req.query.deprecated === 'true';

  const flags = await FeatureFlag.find(query).sort({ key: 1 }).lean();
  return apiResponse(res, { message: 'تم جلب الميزات', data: flags });
});

const getFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlag.findById(req.params.id).lean();
  if (!flag) return res.status(404).json({ success: false, data: null, message: 'الميزة غير موجودة' });
  return apiResponse(res, { message: 'تم جلب الميزة', data: flag });
});

const createFlag = asyncHandler(async (req, res) => {
  const existing = await FeatureFlag.findOne({ key: req.body.key });
  if (existing) {
    return res.status(409).json({ success: false, data: null, message: 'مفتاح الميزة مستخدم بالفعل' });
  }

  const flag = await FeatureFlag.create({
    ...req.body,
    createdBy: req.user._id,
  });
  return apiResponse(res, { statusCode: 201, message: 'تم إنشاء الميزة', data: flag });
});

const updateFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlag.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!flag) return res.status(404).json({ success: false, data: null, message: 'الميزة غير موجودة' });
  return apiResponse(res, { message: 'تم تحديث الميزة', data: flag });
});

const deleteFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlag.findByIdAndDelete(req.params.id);
  if (!flag) return res.status(404).json({ success: false, data: null, message: 'الميزة غير موجودة' });
  return apiResponse(res, { message: 'تم حذف الميزة', data: null });
});

const merchantFeatures = asyncHandler(async (req, res) => {
  const flags = await FeatureFlag.find({ stagingOnly: false }).lean();
  const store = req.featureStore || {};
  const merchantId = req.user._id.toString();
  const PLAN_RANK = { starter: 1, pro: 2, business: 3 };
  const planRank = PLAN_RANK[store.plan] || 1;
  const crypto = require('crypto');

  const result = flags.map((f) => {
    const meetsPlan = planRank >= (PLAN_RANK[f.requiredPlan] || 1);
    const meetsType = f.storeTypes.includes(store.type);
    const isOptedIn = f.optInMerchants.some((id) => id.toString() === merchantId);
    const isToggleOn = !f.toggleKey || (store.featureToggles && store.featureToggles[f.toggleKey] !== false);

    let rolloutEnabled = false;
    if (f.rolloutPercentage >= 100) {
      rolloutEnabled = true;
    } else if (f.rolloutPercentage > 0) {
      const hash = crypto.createHash('md5').update(`${f.key}:${merchantId}`).digest('hex');
      const hashNum = parseInt(hash.substring(0, 8), 16);
      rolloutEnabled = (hashNum % 100) < f.rolloutPercentage;
    }

    const accessible = f.enabled && meetsPlan && meetsType && isToggleOn && (rolloutEnabled || isOptedIn || f.beta === isOptedIn);

    return {
      _id: f._id,
      key: f.key,
      name: f.name,
      description: f.description,
      beta: f.beta,
      deprecated: f.deprecated,
      sunsetDate: f.sunsetDate,
      deprecationMessage: f.deprecationMessage,
      accessible,
      isOptedIn,
      rolloutPercentage: f.rolloutPercentage,
      requiredPlan: f.requiredPlan,
    };
  });

  return apiResponse(res, { message: 'تم جلب الميزات المتاحة', data: result });
});

const optIn = asyncHandler(async (req, res) => {
  const { featureKey, optIn } = req.body;
  if (!featureKey) {
    return res.status(400).json({ success: false, data: null, message: 'مفتاح الميزة مطلوب' });
  }

  const flag = await FeatureFlag.findOne({ key: featureKey, beta: true, enabled: true });
  if (!flag) {
    return res.status(404).json({ success: false, data: null, message: 'الميزة غير متاحة للاشتراك التجريبي' });
  }

  const merchantId = req.user._id;
  if (optIn === true) {
    if (!flag.optInMerchants.some((id) => id.toString() === merchantId.toString())) {
      flag.optInMerchants.push(merchantId);
    }
  } else {
    flag.optInMerchants = flag.optInMerchants.filter((id) => id.toString() !== merchantId.toString());
  }

  await flag.save();
  return apiResponse(res, {
    message: optIn ? 'تم الاشتراك في الميزة التجريبية' : 'تم إلغاء الاشتراك في الميزة التجريبية',
    data: { featureKey, optIn: !!optIn },
  });
});

module.exports = {
  listFlags,
  getFlag,
  createFlag,
  updateFlag,
  deleteFlag,
  merchantFeatures,
  optIn,
};
