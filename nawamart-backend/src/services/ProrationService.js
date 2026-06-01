/**
 * ProrationService — proration math & estimate queries.
 *
 * Handles calculating the financial impact of plan changes.
 * Pure calculation functions plus a read-only estimate that queries the DB.
 */
const Subscription = require('../models/Subscription');
const { VALID_PLANS, getPlanPrice, getBillingDays, daysBetween } = require('./PlanService');

/**
 * Calculate proration when moving from one plan to another.
 *
 * Formula (integer-safe):
 *   remaining_value = remainingDays * currentPlanPrice / totalPlanDays
 *   upgrade_cost    = max(0, newPlanPrice - remaining_value)
 *   wallet_credit   = max(0, remaining_value - newPlanPrice)
 *
 * Free Trial rules (isFreeTrial = true):
 *   - remaining_value = 0
 *   - wallet_credit   = 0
 *   - upgrade_cost    = newPlanPrice (user pays full price)
 *
 * @param {Object} params
 * @param {string} params.currentPlan
 * @param {Date|null} params.currentExpiresAt
 * @param {string|null} params.currentBilling  - 'monthly' | 'yearly' | null (null = trial)
 * @param {boolean} params.hasApprovedSub
 * @param {boolean} [params.isFreeTrial=false]
 * @param {string} params.newPlan
 * @param {string} params.newBilling
 * @returns {{ remainingDays, totalPlanDays, remainingValue, newPlanPrice, upgradeCost, walletCredit, isUpgrade, isDowngrade }}
 */
function calculateProration({
  currentPlan,
  currentExpiresAt,
  currentBilling,
  hasApprovedSub,
  isFreeTrial = false,
  newPlan,
  newBilling,
}) {
  if (isFreeTrial) {
    const newPlanPrice = getPlanPrice(newPlan, newBilling);
    return {
      remainingDays: 0,
      totalPlanDays: 0,
      remainingValue: 0,
      newPlanPrice,
      upgradeCost: newPlanPrice,
      walletCredit: 0,
      isUpgrade: currentPlan !== newPlan,
      isDowngrade: false,
    };
  }

  const now = new Date();
  let remainingDays = 0;
  let totalPlanDays = 0;
  let currentPlanPrice = 0;
  let remainingValue = 0;

  const expiresDate = currentExpiresAt ? new Date(currentExpiresAt) : null;

  if (
    hasApprovedSub &&
    currentBilling &&
    expiresDate &&
    expiresDate > now &&
    VALID_PLANS.includes(currentPlan)
  ) {
    totalPlanDays = getBillingDays(currentBilling);
    remainingDays = Math.min(daysBetween(now, expiresDate), totalPlanDays);
    currentPlanPrice = getPlanPrice(currentPlan, currentBilling);
    remainingValue = Math.round((remainingDays * currentPlanPrice) / totalPlanDays);
  }

  const newPlanPrice = getPlanPrice(newPlan, newBilling);
  const upgradeCost = Math.max(0, newPlanPrice - remainingValue);
  const walletCredit = Math.max(0, remainingValue - newPlanPrice);

  return {
    remainingDays,
    totalPlanDays,
    remainingValue,
    newPlanPrice,
    upgradeCost,
    walletCredit,
    isUpgrade: currentPlan !== newPlan,
    isDowngrade: currentPlan !== newPlan && newPlanPrice < currentPlanPrice,
  };
}

/**
 * Calculate proration without mutating anything (for frontend display).
 */
async function getProrationEstimate(store, targetPlan, targetBilling) {
  const lastApproved = await Subscription.findOne({
    store: store._id,
    status: 'approved',
    expiresAt: { $ne: null },
  }).sort({ approvedAt: -1 });

  const hasApprovedSub = !!lastApproved;
  const isFreeTrial = !lastApproved || !lastApproved.expiresAt;

  return calculateProration({
    currentPlan: store.plan,
    currentExpiresAt: store.planExpiresAt,
    currentBilling: lastApproved?.billing ?? null,
    hasApprovedSub,
    isFreeTrial,
    newPlan: targetPlan,
    newBilling: targetBilling,
  });
}

module.exports = {
  calculateProration,
  getProrationEstimate,
};
