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
        message: 'Invalid resource id',
      });
    }
    next();
  };
}

module.exports = {
  requestId,
  sanitizeRequest,
  validateObjectId,
};
