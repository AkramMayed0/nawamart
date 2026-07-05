const crypto = require('crypto');
const mongoose = require('mongoose');

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const sanitized = {};
  for (const [key, childValue] of Object.entries(value)) {
    if (BLOCKED_KEYS.has(key) || key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = sanitizeValue(childValue);
  }
  return sanitized;
}

function requestId(req, res, next) {
  const incoming = req.headers['x-request-id'];
  req.id = typeof incoming === 'string' && incoming.length <= 128
    ? incoming
    : crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

function sanitizeRequest(req, res, next) {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  next();
}

function validateObjectId(paramName) {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'معرّف المورد غير صالح',
      });
    }
    next();
  };
}

const HTML_TAG_RE = /<[^>]*>/g;

function stripStrings(value) {
  if (typeof value === 'string') {
    return value.replace(HTML_TAG_RE, '');
  }
  if (Array.isArray(value)) {
    return value.map(stripStrings);
  }
  if (value && typeof value === 'object') {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = stripStrings(val);
    }
    return sanitized;
  }
  return value;
}

function stripHtml(req, res, next) {
  if (req.body) req.body = stripStrings(req.body);
  if (req.query) req.query = stripStrings(req.query);
  if (req.params) req.params = stripStrings(req.params);
  next();
}

function ipAllowlist(storeIdResolver) {
  return async (req, res, next) => {
    try {
      const storeId = typeof storeIdResolver === 'function'
        ? storeIdResolver(req)
        : req.params.storeId || req.body.storeId || req.query.storeId;
      if (!storeId) return next();

      const Store = mongoose.model('Store');
      const store = await Store.findById(storeId).select('ipAllowlist storeStatus').lean();
      if (!store || !store.ipAllowlist || store.ipAllowlist.length === 0) return next();

      const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.ip
        || req.connection?.remoteAddress
        || '';

      if (clientIp && !store.ipAllowlist.includes(clientIp)) {
        return res.status(403).json({
          success: false,
          data: null,
          message: 'عنوان IP الخاص بك غير مسموح بالوصول إلى لوحة تحكم هذا المتجر',
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  requestId,
  sanitizeRequest,
  stripHtml,
  validateObjectId,
  ipAllowlist,
};
