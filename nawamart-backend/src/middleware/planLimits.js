const Store = require('../models/Store');
const Product = require('../models/Product');
const Order = require('../models/Order');

// ─── Plan Limits ─────────────────────────────────────────────────────────────
const PLAN_LIMITS = {
  starter:  { maxProducts: 10, maxOrdersPerMonth: 30 },
  pro:      { maxProducts: 50, maxOrdersPerMonth: 300 },
  business: { maxProducts: Infinity, maxOrdersPerMonth: Infinity },
  expired:  { maxProducts: 0, maxOrdersPerMonth: 0 },
};

/**
 * Returns the effective plan of a store.
 * - Starter with expired planExpiresAt → trial ended, fully blocked ('expired')
 * - Pro/Business with expired planExpiresAt → downgraded to 'starter'
 */
const getEffectivePlan = (store) => {
  if (store.plan === 'starter') {
    if (store.planExpiresAt && store.planExpiresAt < new Date()) return 'expired';
    return 'starter';
  }
  if (store.planExpiresAt && store.planExpiresAt < new Date()) return 'starter';
  return store.plan;
};

// ─── Middleware: enforce product limit ────────────────────────────────────────
const enforceProductLimit = async (req, res, next) => {
  try {
    // Require the storeId in the body
    const storeId = req.body.storeId || req.body.store;
    if (!storeId) return next(); // validation handled by controller

    const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
    if (!store) return next(); // 403 handled by controller

    const plan = getEffectivePlan(store);
    const limit = PLAN_LIMITS[plan].maxProducts;

    if (limit === Infinity) return next();

    const count = await Product.countDocuments({ store: storeId, isDeleted: { $ne: true } });

    if (count >= limit) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `لقد وصلت للحد الأقصى من المنتجات في خطتك الحالية (${limit} منتجات). يرجى الترقية للاستمرار.`,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

// ─── Middleware: enforce monthly order limit ───────────────────────────────────
const enforceOrderLimit = async (req, res, next) => {
  try {
    const storeId = req.body.storeId || req.body.store;
    if (!storeId) return next();

    const store = await Store.findById(storeId);
    if (!store) return next();

    const plan = getEffectivePlan(store);
    const limit = PLAN_LIMITS[plan].maxOrdersPerMonth;

    if (limit === Infinity) return next();

    // Count orders this calendar month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const count = await Order.countDocuments({
      store: storeId,
      createdAt: { $gte: startOfMonth },
    });

    if (count >= limit) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `وصل المتجر للحد الأقصى من الطلبات هذا الشهر (${limit} طلبات). يرجى الترقية للاستمرار.`,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { enforceProductLimit, enforceOrderLimit, getEffectivePlan, PLAN_LIMITS };
