/**
 * BillingService — orchestrates billing operations & re-exports sub-services.
 *
 * Entry point for all billing operations. Delegates to:
 *   - PlanService   (plan data, hierarchy, validation)
 *   - ProrationService (proration math & estimates)
 *   - WalletService    (wallet balance & ledger entries)
 *
 * Business rules, constants, and pure calculation functions are imported
 * from the sub-services and re-exported here for backward compatibility.
 *
 * Money is stored in whole YER (ريال يمني). All calculations use integer
 * arithmetic to avoid floating-point precision errors.
 */
const Store = require('../models/Store');
const Subscription = require('../models/Subscription');
const SubscriptionEvent = require('../models/SubscriptionEvent');
const {
  getPlanPrice,
  getBillingDays,
  validateUpgrade,
  VALID_PLANS,
  VALID_BILLING,
  PLAN_PRICES,
  PLAN_HIERARCHY,
} = require('./PlanService');
const { calculateProration, getProrationEstimate } = require('./ProrationService');
const { getWalletBalance, addLedgerEntry } = require('./WalletService');

// ─── Re-export sub-service constants & pure functions ─────────────────────────
module.exports = {
  // PlanService re-exports
  VALID_PLANS,
  VALID_BILLING,
  PLAN_PRICES,
  PLAN_HIERARCHY,
  getPlanPrice,
  getBillingDays,
  validateUpgrade,

  // ProrationService re-exports
  calculateProration,
  getProrationEstimate,

  // WalletService re-exports
  getWalletBalance,
  addLedgerEntry,

  // Local: approve (orchestrator)
  approveWithProration,
};

// ─── Approve subscription with full proration ─────────────────────────────────

/**
 * Approve a pending subscription with prorated credit calculation.
 *
 * Write order (DESIGNED for crash recovery):
 *   1. Store plan update (most visible — admin can verify)
 *   2. Subscription fields update (proration data)
 *   3. Wallet ledger entries (append-only)
 *   4. Subscription event (audit log)
 *
 * The caller is responsible for atomic claiming via findOneAndUpdate.
 * This function ASSUMES the subscription has already been claimed (status !== 'pending').
 */
async function approveWithProration(subscription, adminId) {
  const store = subscription.store;
  if (!store) throw new Error('store not found on subscription');
  if (!subscription.waslUrl) {
    throw new Error('cannot approve subscription without a payment receipt (waslUrl)');
  }

  const now = new Date();

  // 1. Determine current billing from last approved subscription (exclude the
  //    current one — its expiresAt is still null at this point in the flow)
  const lastApproved = await Subscription.findOne({
    store: store._id,
    status: 'approved',
    expiresAt: { $ne: null },
  }).sort({ approvedAt: -1 });

  const currentBilling = lastApproved?.billing ?? null;
  const hasApprovedSub = !!lastApproved;
  const isFreeTrial = !lastApproved || !lastApproved.expiresAt;

  // 1.5 Defense-in-depth: billing cycle must match for upgrades
  if (currentBilling && subscription.billing && currentBilling !== subscription.billing) {
    throw new Error('الترقية مسموحة فقط ضمن نفس دورة الفوترة');
  }

  // 2. Calculate proration
  const proration = calculateProration({
    currentPlan: store.plan,
    currentExpiresAt: store.planExpiresAt,
    currentBilling,
    hasApprovedSub,
    isFreeTrial,
    newPlan: subscription.requestedPlan,
    newBilling: subscription.billing,
  });

  // 3. Calculate new expiry (always a full billing cycle from today)
  const billingDays = getBillingDays(subscription.billing);
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + billingDays);

  // 4. Apply wallet balance toward the upgrade cost
  let walletUsed = 0;
  let remainingDue = proration.upgradeCost;

  if (remainingDue > 0) {
    const walletBalance = await getWalletBalance(store.merchant);
    walletUsed = Math.min(walletBalance, remainingDue);
    remainingDue -= walletUsed;
  }

  // 5. UPDATE STORE FIRST — most visible change, admin can see it immediately
  const previousPlan = store.plan;
  const previousExpiresAt = store.planExpiresAt;
  store.plan = subscription.requestedPlan;
  store.planExpiresAt = expiresAt;
  await store.save();

  // 6. Update subscription with full proration data
  subscription.approvedAt = now;
  subscription.expiresAt = expiresAt;
  subscription.previousPlan = previousPlan;
  subscription.previousExpiresAt = previousExpiresAt;
  subscription.remainingDays = proration.remainingDays;
  subscription.creditApplied = proration.remainingValue;
  subscription.walletCreditUsed = walletUsed;
  subscription.walletCreditGenerated = proration.walletCredit;
  subscription.amountDue = proration.upgradeCost;
  await subscription.save();

  // 7. Wallet ledger entries (append-only, always safe)
  if (walletUsed > 0) {
    await addLedgerEntry({
      merchant: store.merchant,
      type: 'wallet_use',
      amount: walletUsed,
      reference: subscription._id,
      referenceModel: 'Subscription',
      description: `استخدام رصيد المحفظة لاشتراك ${subscription.requestedPlan}`,
      createdBy: adminId,
    });
  }

  if (proration.walletCredit > 0) {
    await addLedgerEntry({
      merchant: store.merchant,
      type: 'upgrade_credit',
      amount: proration.walletCredit,
      reference: subscription._id,
      referenceModel: 'Subscription',
      description: `رصيد متبقي من تغيير الخطة (${subscription.previousPlan} → ${subscription.requestedPlan})`,
      createdBy: adminId,
    });
  }

  // 8. Subscription event (audit log — append-only)
  const eventType = hasApprovedSub && proration.isUpgrade ? 'upgraded' : 'approved';

  await SubscriptionEvent.create({
    subscription: subscription._id,
    merchant: store.merchant,
    store: store._id,
    eventType,
    previousPlan: subscription.previousPlan,
    newPlan: subscription.requestedPlan,
    previousExpiresAt: subscription.previousExpiresAt,
    newExpiresAt: expiresAt,
    billing: subscription.billing,
    amountCharged: proration.upgradeCost,
    creditApplied: proration.remainingValue,
    walletCreditApplied: walletUsed,
    walletCreditGenerated: proration.walletCredit,
    description: hasApprovedSub
      ? `ترقية من ${subscription.previousPlan} إلى ${subscription.requestedPlan}`
      : `اشتراك جديد في خطة ${subscription.requestedPlan}`,
    performedBy: adminId,
  });

  return { subscription, proration };
}
