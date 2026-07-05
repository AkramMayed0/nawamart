const rateLimit = require('express-rate-limit');
const Store = require('../models/Store');

const PLAN_TIERS = {
  starter:  { windowMs: 60 * 60 * 1000, max: 100 },
  pro:      { windowMs: 60 * 60 * 1000, max: 1000 },
  business: { windowMs: 60 * 60 * 1000, max: 10000 },
};

const storePlanCache = new Map();

async function getPlan(storeId) {
  if (!storeId) return 'starter';

  const key = storeId.toString();
  const cached = storePlanCache.get(key);
  if (cached && Date.now() - cached.ts < 60_000) return cached.plan;

  try {
    const store = await Store.findById(storeId).select('plan planExpiresAt');
    if (!store) return 'starter';

    let plan = store.plan || 'starter';
    if (plan !== 'starter' && store.planExpiresAt && store.planExpiresAt < new Date()) {
      plan = 'starter';
    }

    storePlanCache.set(key, { plan, ts: Date.now() });
    return plan;
  } catch {
    return 'starter';
  }
}

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: async (req) => {
    const storeId = req.apiKeyStore?._id || req.apiKeyStore;
    const plan = await getPlan(storeId);
    const tier = PLAN_TIERS[plan] || PLAN_TIERS.starter;
    return tier.max;
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
  message: {
    success: false,
    data: null,
    message: 'تجاوزت حد الطلبات المسموح — قم بترقية خطتك لزيادة الحد',
  },
});

function createApiRateLimiter() {
  return apiLimiter;
}

module.exports = { createApiRateLimiter, PLAN_TIERS };
