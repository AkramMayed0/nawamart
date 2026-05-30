const mongoose = require('mongoose');

const subscriptionEventSchema = new mongoose.Schema(
  {
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
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
    eventType: {
      type: String,
      enum: [
        'requested',
        'approved',
        'rejected',
        'upgraded',
        'admin_changed',
      ],
      required: true,
    },
    previousPlan: {
      type: String,
      default: null,
    },
    newPlan: {
      type: String,
      required: true,
    },
    previousExpiresAt: {
      type: Date,
      default: null,
    },
    newExpiresAt: {
      type: Date,
      default: null,
    },
    billing: {
      type: String,
      enum: ['monthly', 'yearly', null],
      default: null,
    },
    amountCharged: {
      type: Number,
      default: 0,
    },
    creditApplied: {
      type: Number,
      default: 0,
    },
    walletCreditApplied: {
      type: Number,
      default: 0,
    },
    walletCreditGenerated: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  { timestamps: true }
);

subscriptionEventSchema.index({ merchant: 1, createdAt: -1 });
subscriptionEventSchema.index({ store: 1, createdAt: -1 });
subscriptionEventSchema.index({ subscription: 1 });

module.exports = mongoose.model('SubscriptionEvent', subscriptionEventSchema);
