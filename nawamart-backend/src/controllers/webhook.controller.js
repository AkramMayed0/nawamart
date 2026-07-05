const Webhook = require('../models/Webhook');
const WebhookDelivery = require('../models/WebhookDelivery');
const Store = require('../models/Store');
const { apiResponse, asyncHandler, paginate } = require('../utils/helpers');
const { logActivity } = require('../services/audit');
const webhookService = require('../services/webhookService');

const listWebhooks = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const query = { merchant: req.user._id, store: req.params.storeId };

  const result = await paginate(Webhook, query, {
    page, limit,
    sort: { createdAt: -1 },
  });

  return apiResponse(res, {
    message: 'تم جلب الـ webhooks',
    data: result.data,
    pagination: result.pagination,
  });
});

const createWebhook = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ _id: req.params.storeId, merchant: req.user._id });
  if (!store) {
    return res.status(403).json({ success: false, message: 'المتجر غير موجود أو لا تملك صلاحية الإضافة إليه', data: null });
  }

  const { name, url, events, apiVersion, headers, description } = req.body;

  if (!name || !url || !events || events.length === 0) {
    return res.status(400).json({ success: false, message: 'الاسم والرابط والأحداث مطلوبة', data: null });
  }

  const validEvents = Webhook.getEvents();
  const invalid = events.filter((e) => !validEvents.includes(e));
  if (invalid.length > 0) {
    return res.status(400).json({
      success: false,
      message: `أحداث غير صالحة: ${invalid.join(', ')}`,
      data: null,
    });
  }

  let urlObj;
  try {
    urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch (e) {
    return res.status(400).json({ success: false, message: 'رابط غير صالح — يجب أن يبدأ بـ http:// أو https://', data: null });
  }

  const secret = Webhook.generateSecret();

  const webhook = await Webhook.create({
    merchant: req.user._id,
    store: req.params.storeId,
    name,
    url,
    events,
    secret,
    apiVersion: apiVersion || 'v1',
    headers: headers || {},
    description: description || null,
  });

  await logActivity(req, {
    action: 'webhook.created',
    resourceType: 'webhook',
    resourceId: webhook._id,
    resourceName: webhook.name,
    details: `تم إنشاء webhook: ${webhook.name}`,
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء الـ webhook',
    data: webhook.toObject(),
  });
});

const updateWebhook = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOne({
    _id: req.params.id,
    merchant: req.user._id,
  });

  if (!webhook) {
    return res.status(404).json({ success: false, message: 'الـ webhook غير موجود', data: null });
  }

  const { name, url, events, isActive, apiVersion, headers, description } = req.body;

  if (name !== undefined) webhook.name = name;

  if (url !== undefined) {
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) throw new Error('Invalid protocol');
      webhook.url = url;
    } catch (e) {
      return res.status(400).json({ success: false, message: 'رابط غير صالح', data: null });
    }
  }

  if (events !== undefined) {
    const validEvents = Webhook.getEvents();
    const invalid = events.filter((e) => !validEvents.includes(e));
    if (invalid.length > 0) {
      return res.status(400).json({
        success: false,
        message: `أحداث غير صالحة: ${invalid.join(', ')}`,
        data: null,
      });
    }
    webhook.events = events;
  }

  if (isActive !== undefined) webhook.isActive = isActive;
  if (apiVersion !== undefined) webhook.apiVersion = apiVersion;
  if (headers !== undefined) webhook.headers = headers;
  if (description !== undefined) webhook.description = description;

  await webhook.save();

  await logActivity(req, {
    action: 'webhook.updated',
    resourceType: 'webhook',
    resourceId: webhook._id,
    resourceName: webhook.name,
    details: `تم تحديث webhook: ${webhook.name}`,
  });

  return apiResponse(res, {
    message: 'تم تحديث الـ webhook',
    data: webhook,
  });
});

const deleteWebhook = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOneAndDelete({
    _id: req.params.id,
    merchant: req.user._id,
  });

  if (!webhook) {
    return res.status(404).json({ success: false, message: 'الـ webhook غير موجود', data: null });
  }

  await logActivity(req, {
    action: 'webhook.deleted',
    resourceType: 'webhook',
    resourceId: req.params.id,
    resourceName: webhook.name,
    details: `تم حذف webhook: ${webhook.name}`,
  });

  return apiResponse(res, {
    message: 'تم حذف الـ webhook',
    data: null,
  });
});

const testWebhook = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOne({
    _id: req.params.id,
    merchant: req.user._id,
  });

  if (!webhook) {
    return res.status(404).json({ success: false, message: 'الـ webhook غير موجود', data: null });
  }

  const testPayload = {
    event: 'webhook.test',
    storeId: webhook.store.toString(),
    merchantId: webhook.merchant.toString(),
    timestamp: new Date().toISOString(),
    data: {
      message: 'هذا اختبار من لوحة تحكم نوامارت',
      webhookName: webhook.name,
    },
  };

  const { deliverWebhook } = require('../services/webhookService');
  const delivery = await deliverWebhook(webhook, 'webhook.test', testPayload);

  return apiResponse(res, {
    message: 'تم إرسال اختبار الـ webhook',
    data: delivery,
  });
});

const listDeliveries = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;

  const query = {
    webhook: req.params.id,
    merchant: req.user._id,
  };

  if (status) query.status = status;

  const result = await paginate(WebhookDelivery, query, {
    page, limit,
    sort: { createdAt: -1 },
  });

  return apiResponse(res, {
    message: 'تم جلب سجل التسليم',
    data: result.data,
    pagination: result.pagination,
  });
});

const getDeliveryDetail = asyncHandler(async (req, res) => {
  const delivery = await WebhookDelivery.findOne({
    _id: req.params.deliveryId,
    webhook: req.params.id,
    merchant: req.user._id,
  });

  if (!delivery) {
    return res.status(404).json({ success: false, message: 'سجل التسليم غير موجود', data: null });
  }

  return apiResponse(res, {
    message: 'تم جلب تفاصيل التسليم',
    data: delivery,
  });
});

const rotateWebhookSecret = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOne({
    _id: req.params.id,
    merchant: req.user._id,
  });

  if (!webhook) {
    return res.status(404).json({ success: false, message: 'الـ webhook غير موجود', data: null });
  }

  webhook.secret = Webhook.generateSecret();
  await webhook.save();

  return apiResponse(res, {
    message: 'تم تحديث السر',
    data: { secret: webhook.secret },
  });
});

const getEvents = asyncHandler(async (req, res) => {
  const events = Webhook.getEvents();
  return apiResponse(res, {
    message: 'تم جلب الأحداث المتاحة',
    data: events.map((e) => ({
      key: e,
      label: Webhook.getScopeLabel(e),
    })),
  });
});

module.exports = {
  listWebhooks, createWebhook, updateWebhook, deleteWebhook,
  testWebhook, listDeliveries, getDeliveryDetail, rotateWebhookSecret, getEvents,
};
