const ApiKey = require('../models/ApiKey');
const Store = require('../models/Store');

async function apiAuth(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'مفتاح API مطلوب — يرجى إضافة X-API-Key في الترويسة',
      });
    }

    const allKeys = await ApiKey.find({ isActive: true }).select('+key').populate('store', 'plan storeStatus');
    let matched = null;
    for (const k of allKeys) {
      const ok = await ApiKey.compareKey(apiKey, k.key);
      if (ok) {
        matched = k;
        break;
      }
    }

    if (!matched) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'مفتاح API غير صالح',
      });
    }

    if (!matched.isActive) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'مفتاح API معطل',
      });
    }

    if (matched.isExpired) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'مفتاح API منتهي الصلاحية',
      });
    }

    const store = matched.store;
    if (!store || store.storeStatus === 'closed') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'المتجر غير متاح',
      });
    }

    matched.lastUsedAt = new Date();
    await matched.save();

    req.apiKey = matched;
    req.apiKeyScopes = matched.scopes;
    req.apiKeyMerchant = matched.merchant;
    req.apiKeyStore = matched.store;
    req.isApiAuthenticated = true;

    next();
  } catch (error) {
    next(error);
  }
}

function requireScope(...scopes) {
  return (req, res, next) => {
    if (!req.apiKeyScopes) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'مطلوب مصادقة API',
      });
    }

    const hasAll = scopes.every((s) => req.apiKeyScopes.includes(s));
    if (!hasAll) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `مفتاح API لا يملك الصلاحية: ${scopes.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = { apiAuth, requireScope };
