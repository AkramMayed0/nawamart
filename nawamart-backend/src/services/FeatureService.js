const { getEffectivePlan } = require('../middleware/planLimits');

const PLAN_RANK = Object.freeze({
  starter: 1,
  pro: 2,
  business: 3,
});

const FEATURES = Object.freeze({
  lightweight_storefront: {
    minPlan: 'pro',
    storeTypes: ['physical', 'digital'],
  },
  manual_wallet_receipt_payment: {
    minPlan: 'pro',
    storeTypes: ['physical', 'digital'],
  },
  multi_tenant_live_chat: {
    minPlan: 'pro',
    storeTypes: ['physical', 'digital'],
  },
  digital_product_auto_delivery: {
    minPlan: 'pro',
    storeTypes: ['digital'],
  },
  anti_fraud_return_shield: {
    minPlan: 'business',
    storeTypes: ['physical'],
  },
  whatsapp_commerce_bot: {
    minPlan: 'business',
    storeTypes: ['physical', 'digital'],
  },
  whatsapp_cart_retriever: {
    minPlan: 'business',
    storeTypes: ['physical', 'digital'],
  },
  local_courier_dispatcher: {
    minPlan: 'business',
    storeTypes: ['physical'],
  },
});

function normalizeStoreType(type) {
  return String(type || '').toLowerCase();
}

function canUseFeature(store, featureKey) {
  const feature = FEATURES[featureKey];
  if (!store || !feature) return false;

  const plan = getEffectivePlan(store);
  const planRank = PLAN_RANK[plan] || 0;
  const requiredRank = PLAN_RANK[feature.minPlan] || Infinity;
  const storeType = normalizeStoreType(store.type);

  return planRank >= requiredRank && feature.storeTypes.includes(storeType);
}

function getFeatureAccessMap(store) {
  return Object.keys(FEATURES).reduce((acc, key) => {
    acc[key] = canUseFeature(store, key);
    return acc;
  }, {});
}

function describeFeature(featureKey) {
  return FEATURES[featureKey] || null;
}

module.exports = {
  FEATURES,
  canUseFeature,
  getFeatureAccessMap,
  describeFeature,
};
