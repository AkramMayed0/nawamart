const ApiKey = require('../models/ApiKey');
const Store = require('../models/Store');
const { apiResponse, asyncHandler, paginate } = require('../utils/helpers');

const listApiKeys = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const query = { merchant: req.user._id, store: req.params.storeId };

  const result = await paginate(ApiKey, query, {
    page, limit,
    sort: { createdAt: -1 },
  });

  const data = result.data.map((k) => ({
    _id: k._id,
    name: k.name,
    prefix: k.prefix,
    scopes: k.scopes,
    isActive: k.isActive,
    lastUsedAt: k.lastUsedAt,
    expiresAt: k.expiresAt,
    createdAt: k.createdAt,
  }));

  return apiResponse(res, {
    message: 'تم جلب مفاتيح API',
    data,
    pagination: result.pagination,
  });
});

const createApiKey = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ _id: req.params.storeId, merchant: req.user._id });
  if (!store) {
    return res.status(403).json({ success: false, message: 'المتجر غير موجود أو لا تملك صلاحية الإضافة إليه', data: null });
  }

  const { name, scopes, expiresAt } = req.body;

  if (!name || !scopes || scopes.length === 0) {
    return res.status(400).json({ success: false, message: 'الاسم والصلاحيات مطلوبة', data: null });
  }

  const validScopes = ApiKey.getScopes();
  const invalid = scopes.filter((s) => !validScopes.includes(s));
  if (invalid.length > 0) {
    return res.status(400).json({
      success: false,
      message: `صلاحيات غير صالحة: ${invalid.join(', ')}`,
      data: null,
    });
  }

  const { raw, prefix } = ApiKey.generateKey();
  const hashed = await ApiKey.hashKey(raw);

  const apiKey = await ApiKey.create({
    merchant: req.user._id,
    store: req.params.storeId,
    name,
    prefix,
    key: hashed,
    scopes,
    expiresAt: expiresAt || null,
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء مفتاح API',
    data: {
      _id: apiKey._id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      key: `${prefix}${raw.slice(prefix.length)}`,
      scopes: apiKey.scopes,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    },
  });
});

const deleteApiKey = asyncHandler(async (req, res) => {
  const key = await ApiKey.findOneAndDelete({
    _id: req.params.id,
    merchant: req.user._id,
  });

  if (!key) {
    return res.status(404).json({ success: false, message: 'مفتاح API غير موجود', data: null });
  }

  return apiResponse(res, {
    message: 'تم حذف مفتاح API',
    data: null,
  });
});

const updateApiKey = asyncHandler(async (req, res) => {
  const key = await ApiKey.findOne({
    _id: req.params.id,
    merchant: req.user._id,
  });

  if (!key) {
    return res.status(404).json({ success: false, message: 'مفتاح API غير موجود', data: null });
  }

  const { name, scopes, isActive, expiresAt } = req.body;

  if (name !== undefined) key.name = name;
  if (scopes !== undefined) {
    const validScopes = ApiKey.getScopes();
    const invalid = scopes.filter((s) => !validScopes.includes(s));
    if (invalid.length > 0) {
      return res.status(400).json({
        success: false,
        message: `صلاحيات غير صالحة: ${invalid.join(', ')}`,
        data: null,
      });
    }
    key.scopes = scopes;
  }
  if (isActive !== undefined) key.isActive = isActive;
  if (expiresAt !== undefined) key.expiresAt = expiresAt;

  await key.save();

  return apiResponse(res, {
    message: 'تم تحديث مفتاح API',
    data: {
      _id: key._id,
      name: key.name,
      prefix: key.prefix,
      scopes: key.scopes,
      isActive: key.isActive,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
    },
  });
});

const rotateApiKey = asyncHandler(async (req, res) => {
  const key = await ApiKey.findOne({
    _id: req.params.id,
    merchant: req.user._id,
  });

  if (!key) {
    return res.status(404).json({ success: false, message: 'مفتاح API غير موجود', data: null });
  }

  const { raw, prefix } = ApiKey.generateKey();
  const hashed = await ApiKey.hashKey(raw);

  key.key = hashed;
  key.prefix = prefix;
  await key.save();

  return apiResponse(res, {
    message: 'تم تحديث مفتاح API',
    data: {
      _id: key._id,
      name: key.name,
      prefix: key.prefix,
      key: `${prefix}${raw.slice(prefix.length)}`,
      scopes: key.scopes,
    },
  });
});

const getScopes = asyncHandler(async (req, res) => {
  const scopes = ApiKey.getScopes();
  return apiResponse(res, {
    message: 'تم جلب الصلاحيات المتاحة',
    data: scopes.map((s) => ({
      key: s,
      label: s
        .split(':')
        .map((p) => (p === 'read' ? 'قراءة' : p === 'write' ? 'كتابة' : p === 'manage' ? 'إدارة' : p))
        .join(' / '),
    })),
  });
});

module.exports = { listApiKeys, createApiKey, deleteApiKey, updateApiKey, rotateApiKey, getScopes };
