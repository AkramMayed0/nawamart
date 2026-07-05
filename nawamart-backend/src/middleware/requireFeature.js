const Store = require('../models/Store');
const { canUseFeature, describeFeature } = require('../services/FeatureService');

function defaultStoreIdResolver(req) {
  return req.params.storeId || req.body.storeId || req.query.storeId || req.body.store;
}

function requireFeature(featureKey, options = {}) {
  const resolveStoreId = options.resolveStoreId || defaultStoreIdResolver;

  return async (req, res, next) => {
    try {
      const storeId = resolveStoreId(req);
      if (!storeId) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'معرّف المتجر مطلوب لهذه الميزة',
        });
      }

      const query = { _id: storeId };
      if (options.requireMerchantOwnership !== false && req.userRole === 'merchant') {
        query.merchant = req.user._id;
      }

      const store = await Store.findOne(query);
      if (!store) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'المتجر غير موجود أو لا تملك صلاحية الوصول إليه',
        });
      }

      if (!canUseFeature(store, featureKey)) {
        const feature = describeFeature(featureKey);
        const toggleDisabled = store.featureToggles && store.featureToggles[featureKey] === false;
        return res.status(403).json({
          success: false,
          data: {
            feature: featureKey,
            requiredPlan: feature?.minPlan || null,
            allowedStoreTypes: feature?.storeTypes || [],
            currentPlan: store.plan,
            currentStoreType: store.type,
            toggleDisabled,
          },
          message: toggleDisabled
            ? 'هذه الميزة معطلة في إعدادات متجرك'
            : 'هذه الميزة غير متاحة في خطتك الحالية أو لنوع متجرك',
        });
      }

      req.featureStore = store;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireFeature };
