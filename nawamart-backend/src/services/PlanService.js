/**
 * PlanService — single source of truth for plan data & upgrade validation.
 *
 * All plan-related constants and pure (stateless) validation functions
 * live here. No database access, no side effects.
 */

const PLAN_PRICES = {
  starter:  { monthly: 2500,  yearly: 24900 },
  pro:      { monthly: 8000,  yearly: 79680 },
  business: { monthly: 13000, yearly: 129480 },
};

const BILLING_DAYS = { monthly: 30, yearly: 365 };

const VALID_PLANS = Object.freeze(['starter', 'pro', 'business']);
const VALID_BILLING = Object.freeze(['monthly', 'yearly']);

const PLAN_HIERARCHY = Object.freeze({
  starter:  1,
  pro:      2,
  business: 3,
});

function getPlanPrice(plan, billing) {
  if (!VALID_PLANS.includes(plan)) throw new Error(`Invalid plan: ${plan}`);
  if (!VALID_BILLING.includes(billing)) throw new Error(`Invalid billing: ${billing}`);
  return PLAN_PRICES[plan][billing];
}

function getBillingDays(billing) {
  if (!VALID_BILLING.includes(billing)) throw new Error(`Invalid billing: ${billing}`);
  return BILLING_DAYS[billing];
}

function validateUpgrade(currentPlan, requestedPlan, isFreeTrial = false) {
  // Free Trial is NOT a paid plan — can upgrade to any plan without restriction
  if (isFreeTrial) return;

  if (currentPlan === requestedPlan) {
    throw new Error('أنت مشترك بالفعل في هذه الخطة');
  }

  const currentRank = PLAN_HIERARCHY[currentPlan];
  const requestedRank = PLAN_HIERARCHY[requestedPlan];

  if (!currentRank || !requestedRank) {
    throw new Error('الخطة المحددة غير صالحة');
  }

  if (requestedRank < currentRank) {
    throw new Error('التخفيض غير مدعوم حالياً');
  }
}

function daysBetween(a, b) {
  return Math.max(0, Math.floor((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)));
}

module.exports = {
  VALID_PLANS,
  VALID_BILLING,
  PLAN_PRICES,
  PLAN_HIERARCHY,
  BILLING_DAYS,
  getPlanPrice,
  getBillingDays,
  validateUpgrade,
  daysBetween,
};
