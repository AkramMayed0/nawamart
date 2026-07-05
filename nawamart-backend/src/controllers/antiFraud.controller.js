const ReturnRisk = require('../models/ReturnRisk');
const { apiResponse, asyncHandler, getPaginationParams, paginateResponse } = require('../utils/helpers');

const listReturnRisks = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPaginationParams(req);
  const store = req.featureStore;
  const query = { store: store._id };

  if (req.query.phone) query.customerPhone = String(req.query.phone).trim();
  if (req.query.severity) query.severity = req.query.severity;

  const [items, total] = await Promise.all([
    ReturnRisk.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ReturnRisk.countDocuments(query),
  ]);

  return apiResponse(res, {
    message: 'تم جلب سجلات مخاطر الإرجاع',
    data: items,
    pagination: paginateResponse(total, page, limit),
  });
});

const createReturnRisk = asyncHandler(async (req, res) => {
  const store = req.featureStore;
  const { customerName, customerPhone, city, reason, severity, orderId, evidenceUrls, isShared } = req.body;

  if (!customerPhone || !reason) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'رقم هاتف العميل وسبب المخاطرة مطلوبان',
    });
  }

  const risk = await ReturnRisk.create({
    store: store._id,
    merchant: req.user._id,
    order: orderId || null,
    customerName: customerName || null,
    customerPhone: String(customerPhone).trim(),
    city: city || null,
    reason,
    severity: severity || 'medium',
    evidenceUrls: Array.isArray(evidenceUrls) ? evidenceUrls.slice(0, 10) : [],
    isShared: isShared !== false,
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إضافة سجل مخاطرة الإرجاع',
    data: risk,
  });
});

const checkReturnRisk = asyncHandler(async (req, res) => {
  const store = req.featureStore;
  const phone = String(req.query.phone || req.body.phone || '').trim();

  if (!phone) {
    return res.status(400).json({ success: false, data: null, message: 'رقم الهاتف مطلوب' });
  }

  const matches = await ReturnRisk.find({
    customerPhone: phone,
    $or: [{ store: store._id }, { isShared: true }],
  })
    .sort({ createdAt: -1 })
    .limit(20);

  const highRiskCount = matches.filter((item) => item.severity === 'high').length;
  const score = Math.min(100, matches.length * 20 + highRiskCount * 20);

  return apiResponse(res, {
    message: 'تم التحقق من مستوى مخاطرة الإرجاع',
    data: {
      phone,
      score,
      riskLevel: score >= 80 ? 'high' : score >= 40 ? 'medium' : 'low',
      matches,
    },
  });
});

module.exports = {
  listReturnRisks,
  createReturnRisk,
  checkReturnRisk,
};
