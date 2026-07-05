const ActivityLog = require('../models/ActivityLog');
const Store = require('../models/Store');
const { apiResponse, asyncHandler, getPaginationParams, paginateResponse } = require('../utils/helpers');

const listActivity = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { limit, skip, page } = getPaginationParams(req);
  const { action, userId, date_from, date_to } = req.query;

  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({
      success: false,
      message: 'المتجر غير موجود',
      data: null,
    });
  }

  const isOwner = store.merchant.toString() === req.user._id.toString();
  if (!isOwner && req.storeRole !== 'store_owner' && req.storeRole !== 'store_manager') {
    return res.status(403).json({
      success: false,
      message: 'ليس لديك صلاحية لعرض سجل النشاطات',
      data: null,
    });
  }

  const query = { store: storeId };
  if (action) query.action = action;
  if (userId) query.user = userId;
  if (date_from || date_to) {
    query.createdAt = {};
    if (date_from) query.createdAt.$gte = new Date(date_from);
    if (date_to) query.createdAt.$lte = new Date(date_to);
  }

  const [logs, total] = await Promise.all([
    ActivityLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments(query),
  ]);

  const actionLabels = {
    'product.create': 'إنشاء منتج',
    'product.update': 'تحديث منتج',
    'product.delete': 'حذف منتج',
    'order.confirm': 'تأكيد طلب',
    'order.reject': 'رفض طلب',
    'order.ship': 'شحن طلب',
    'order.deliver': 'تسليم طلب',
    'staff.create': 'إضافة موظف',
    'staff.update': 'تحديث موظف',
    'staff.delete': 'إزالة موظف',
    'store.update': 'تحديث المتجر',
    'store.settings': 'تغيير إعدادات المتجر',
    'export.products': 'تصدير منتجات',
    'export.orders': 'تصدير طلبات',
    'export.customers': 'تصدير عملاء',
    'export.reports': 'تصدير تقارير',
  };

  const enriched = logs.map((log) => ({
    ...log.toObject(),
    actionLabel: actionLabels[log.action] || log.action,
  }));

  return apiResponse(res, {
    message: 'تم جلب سجل النشاطات',
    data: enriched,
    pagination: paginateResponse(total, page, limit),
  });
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId || req.user?.store;

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: 'معرّف المتجر مطلوب',
      data: null,
    });
  }

  const logs = await ActivityLog.find({ store: storeId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(20);

  const actionLabels = {
    'product.create': 'إنشاء منتج',
    'product.update': 'تحديث منتج',
    'product.delete': 'حذف منتج',
    'order.confirm': 'تأكيد طلب',
    'order.reject': 'رفض طلب',
    'order.ship': 'شحن طلب',
    'order.deliver': 'تسليم طلب',
    'staff.create': 'إضافة موظف',
    'staff.update': 'تحديث موظف',
    'staff.delete': 'إزالة موظف',
    'store.update': 'تحديث المتجر',
    'store.settings': 'تغيير إعدادات المتجر',
  };

  const enriched = logs.map((log) => ({
    ...log.toObject(),
    actionLabel: actionLabels[log.action] || log.action,
  }));

  return apiResponse(res, {
    message: 'تم جلب آخر النشاطات',
    data: enriched,
  });
});

module.exports = { listActivity, getRecentActivity };