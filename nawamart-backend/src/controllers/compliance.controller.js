const Consent = require('../models/Consent');
const DataRequest = require('../models/DataRequest');
const LegalPage = require('../models/LegalPage');
const Store = require('../models/Store');
const Customer = require('../models/Customer');
const { apiResponse, asyncHandler, paginate } = require('../utils/helpers');
const { logActivity } = require('../services/audit');
const { generateExport, deleteMerchantData, deleteCustomerData } = require('../services/dataExportService');

// ─── Consent ──────────────────────────────────────────────────────────────────

const recordConsent = asyncHandler(async (req, res) => {
  const { type, granted, version, details } = req.body;

  if (!type) {
    return res.status(400).json({ success: false, message: 'نوع الموافقة مطلوب', data: null });
  }

  const visitorId = req.headers['x-visitor-id'] || null;
  const storeId = req.params.storeId || req.body.storeId || null;

  const consent = await Consent.create({
    store: storeId,
    user: req.user?._id || null,
    userRole: req.userRole || 'visitor',
    visitorId,
    ip: req.ip,
    userAgent: req.headers['user-agent'] || null,
    type,
    granted: granted !== undefined ? granted : true,
    version: version || '1.0',
    details: details || null,
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم تسجيل الموافقة',
    data: consent,
  });
});

const getConsentHistory = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const storeId = req.params.storeId || req.query.storeId;

  const query = {};
  if (storeId) query.store = storeId;
  if (req.user?._id) query.user = req.user._id;
  if (req.query.type) query.type = req.query.type;

  const result = await paginate(Consent, query, {
    page, limit,
    sort: { consentDate: -1 },
  });

  return apiResponse(res, {
    message: 'تم جلب سجل الموافقات',
    data: result.data,
    pagination: result.pagination,
  });
});

const getConsentTypes = asyncHandler(async (req, res) => {
  const types = Consent.getTypes();
  return apiResponse(res, {
    message: 'تم جلب أنواع الموافقات',
    data: types.map((t) => ({ key: t, label: Consent.getTypeLabel(t) })),
  });
});

// ─── Data Requests (GDPR/CCPA) ────────────────────────────────────────────────

const requestDataExport = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId || req.body.storeId || req.user?.store || null;

  const request = await DataRequest.create({
    store: storeId,
    merchant: req.userRole === 'merchant' ? req.user._id : null,
    customer: req.userRole === 'customer' ? req.user._id : null,
    type: 'export',
    requestedBy: req.userRole || 'customer',
    requestedEmail: req.user?.email || req.body.email,
    reason: req.body.reason || null,
    exportFormat: req.body.format || 'json',
    status: 'pending',
  });

  generateExport(request._id).catch((err) => {
    console.error('Data export failed:', err.message);
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم تقديم طلب تصدير البيانات. سيتم إعلامك عند الانتهاء',
    data: {
      _id: request._id,
      type: request.type,
      status: request.status,
      createdAt: request.createdAt,
    },
  });
});

const requestDataDeletion = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId || req.body.storeId || req.user?.store || null;
  const { reason } = req.body;

  const request = await DataRequest.create({
    store: storeId,
    merchant: req.userRole === 'merchant' ? req.user._id : null,
    customer: req.userRole === 'customer' ? req.user._id : null,
    type: 'deletion',
    requestedBy: req.userRole || 'customer',
    requestedEmail: req.user?.email || req.body.email,
    reason: reason || null,
    status: 'pending',
  });

  // Run deletion in the background after response is sent
  setImmediate(async () => {
    try {
      request.status = 'processing';
      await request.save();

      if (req.userRole === 'merchant') {
        await deleteMerchantData(req.user._id);
      } else if (req.userRole === 'customer') {
        await deleteCustomerData(req.user._id, storeId);
      }

      request.status = 'completed';
      request.completedAt = new Date();
      await request.save();

      await logActivity(req, {
        action: 'data.deletion',
        resourceType: 'data_request',
        resourceId: request._id,
        details: `تم حذف البيانات: ${req.userRole}`,
      });
    } catch (err) {
      try {
        request.status = 'rejected';
        request.rejectionReason = err.message;
        await request.save();
      } catch (saveErr) {
        // Log but don't rethrow — we're in a background callback
        const logger = require('../utils/logger');
        logger.error('[Compliance] Failed to save deletion rejection status:', saveErr.message);
      }
    }
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم تقديم طلب حذف البيانات. سيتم حذف بياناتك خلال 30 يوماً',
    data: {
      _id: request._id,
      type: request.type,
      status: request.status,
      createdAt: request.createdAt,
    },
  });
});

const getDataRequests = asyncHandler(async (req, res) => {
  const { page, limit, status, type } = req.query;

  const query = {};
  if (req.userRole === 'merchant') query.merchant = req.user._id;
  else if (req.userRole === 'customer') query.customer = req.user._id;
  if (status) query.status = status;
  if (type) query.type = type;

  const result = await paginate(DataRequest, query, {
    page, limit,
    sort: { createdAt: -1 },
  });

  return apiResponse(res, {
    message: 'تم جلب طلبات البيانات',
    data: result.data,
    pagination: result.pagination,
  });
});

const getDataRequestById = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id };
  if (req.userRole === 'merchant') query.merchant = req.user._id;
  else if (req.userRole === 'customer') query.customer = req.user._id;

  const request = await DataRequest.findOne(query);
  if (!request) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  return apiResponse(res, {
    message: 'تم جلب الطلب',
    data: request,
  });
});

const downloadExport = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id, type: 'export' };
  if (req.userRole === 'merchant') query.merchant = req.user._id;
  else if (req.userRole === 'customer') query.customer = req.user._id;

  const request = await DataRequest.findOne(query);
  if (!request || request.status !== 'completed') {
    return res.status(404).json({ success: false, message: 'التصدير غير متاح', data: null });
  }

  if (request.isExpired) {
    return res.status(410).json({ success: false, message: 'التصدير منتهي الصلاحية', data: null });
  }

  return apiResponse(res, {
    message: 'تم جلب البيانات',
    data: request.dataPayload,
  });
});

// ─── Legal Pages ──────────────────────────────────────────────────────────────

const getLegalPages = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const storeId = req.params.storeId;

  const query = { store: storeId, merchant: req.user._id };
  if (req.query.type) query.type = req.query.type;

  const result = await paginate(LegalPage, query, {
    page, limit,
    sort: { type: 1 },
  });

  return apiResponse(res, {
    message: 'تم جلب الصفحات القانونية',
    data: result.data,
    pagination: result.pagination,
  });
});

const createLegalPage = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ _id: req.params.storeId, merchant: req.user._id });
  if (!store) {
    return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });
  }

  const { type, title, content, isPublished, effectiveDate } = req.body;

  if (!type || !title || !content) {
    return res.status(400).json({ success: false, message: 'النوع والعنوان والمحتوى مطلوبون', data: null });
  }

  const exists = await LegalPage.findOne({ store: req.params.storeId, type });
  if (exists) {
    return res.status(409).json({ success: false, message: `صفحة ${LegalPage.getTypeLabel(type)} موجودة مسبقاً. استخدم التحديث بدلاً من ذلك`, data: null });
  }

  const page = await LegalPage.create({
    store: req.params.storeId,
    merchant: req.user._id,
    type,
    title,
    content,
    isPublished: isPublished || false,
    isDefault: !exists,
    effectiveDate: effectiveDate || new Date(),
  });

  await logActivity(req, {
    action: 'legal_page.created',
    resourceType: 'legal_page',
    resourceId: page._id,
    resourceName: page.title,
    details: `تم إنشاء صفحة ${page.title}`,
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء الصفحة القانونية',
    data: page,
  });
});

const updateLegalPage = asyncHandler(async (req, res) => {
  const page = await LegalPage.findOne({
    _id: req.params.id,
    merchant: req.user._id,
  });

  if (!page) {
    return res.status(404).json({ success: false, message: 'الصفحة غير موجودة', data: null });
  }

  const { title, content, isPublished, effectiveDate } = req.body;

  if (title !== undefined) page.title = title;
  if (content !== undefined) {
    page.content = content;
    page.version = (parseFloat(page.version) + 0.1).toFixed(1);
  }
  if (isPublished !== undefined) page.isPublished = isPublished;
  if (effectiveDate !== undefined) page.effectiveDate = effectiveDate;

  page.lastReviewedAt = new Date();
  page.lastReviewedBy = req.user._id;

  await page.save();

  await logActivity(req, {
    action: 'legal_page.updated',
    resourceType: 'legal_page',
    resourceId: page._id,
    resourceName: page.title,
    details: `تم تحديث صفحة ${page.title} (إصدار ${page.version})`,
  });

  return apiResponse(res, {
    message: 'تم تحديث الصفحة القانونية',
    data: page,
  });
});

const generateFromTemplate = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ _id: req.params.storeId, merchant: req.user._id });
  if (!store) {
    return res.status(403).json({ success: false, message: 'المتجر غير موجود', data: null });
  }

  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ success: false, message: 'نوع الصفحة مطلوب', data: null });
  }

  const exists = await LegalPage.findOne({ store: req.params.storeId, type });
  if (exists) {
    return res.status(409).json({ success: false, message: `الصفحة موجودة مسبقاً`, data: null });
  }

  const content = LegalPage.getDefaultTemplate(type, store);
  const title = LegalPage.getTypeLabel(type);

  const page = await LegalPage.create({
    store: req.params.storeId,
    merchant: req.user._id,
    type,
    title,
    content,
    isPublished: false,
    isDefault: true,
    effectiveDate: new Date(),
  });

  return apiResponse(res, {
    statusCode: 201,
    message: `تم إنشاء صفحة ${title} من القالب`,
    data: page,
  });
});

const getPublicLegalPage = asyncHandler(async (req, res) => {
  const { slug, type } = req.params;

  const store = await Store.findOne({ slug }).select('_id name');
  if (!store) {
    return res.status(404).json({ success: false, message: 'المتجر غير موجود', data: null });
  }

  const page = await LegalPage.findOne({
    store: store._id,
    type,
    isPublished: true,
  });

  if (!page) {
    return res.status(404).json({ success: false, message: 'الصفحة غير موجودة', data: null });
  }

  return apiResponse(res, {
    message: 'تم جلب الصفحة القانونية',
    data: {
      title: page.title,
      content: page.content,
      type: page.type,
      version: page.version,
      effectiveDate: page.effectiveDate,
      updatedAt: page.updatedAt,
    },
  });
});

const getStoreLegalPageTypes = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const pages = await LegalPage.find({ store: storeId, isPublished: true }).select('type title version effectiveDate updatedAt');

  return apiResponse(res, {
    message: 'تم جلب الصفحات القانونية المنشورة',
    data: pages,
  });
});

const getLegalPageTypes = asyncHandler(async (req, res) => {
  const types = LegalPage.getTypes();
  return apiResponse(res, {
    message: 'تم جلب أنواع الصفحات القانونية',
    data: types.map((t) => ({ key: t, label: LegalPage.getTypeLabel(t) })),
  });
});

module.exports = {
  recordConsent, getConsentHistory, getConsentTypes,
  requestDataExport, requestDataDeletion, getDataRequests, getDataRequestById, downloadExport,
  getLegalPages, createLegalPage, updateLegalPage, generateFromTemplate,
  getPublicLegalPage, getStoreLegalPageTypes, getLegalPageTypes,
};
