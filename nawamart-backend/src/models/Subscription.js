const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    // Request type: NEW_SUBSCRIPTION (first-ever paid plan) or UPGRADE
    type: {
      type: String,
      enum: ['NEW_SUBSCRIPTION', 'UPGRADE'],
      default: 'NEW_SUBSCRIPTION',
    },
    requestedPlan: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      required: [true, 'الخطة المطلوبة مطلوبة'],
    },
    billing: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    waslUrl: {
      type: String,
      required: [true, 'إيصال الدفع مطلوب'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    reviewNote: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    // ─── Proration / Upgrade tracking ──────────────────────────────────────
    previousPlan: {
      type: String,
      default: null,
    },
    previousExpiresAt: {
      type: Date,
      default: null,
    },
    // remaining value of the previous plan that was credited
    remainingDays: {
      type: Number,
      default: 0,
    },
    creditApplied: {
      type: Number,
      default: 0,
    },
    walletCreditUsed: {
      type: Number,
      default: 0,
    },
    walletCreditGenerated: {
      type: Number,
      default: 0,
    },
    amountDue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ merchant: 1, status: 1 });
subscriptionSchema.index({ store: 1 });
// Only one pending subscription per store at a time
subscriptionSchema.index(
  { store: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
