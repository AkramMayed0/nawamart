const mongoose = require('mongoose');
const { getNextSequence } = require('../utils/counters');

const invoiceSchema = new mongoose.Schema(
  {
    // Human-readable invoice number, e.g. INV-2026-00001
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    // The subscription plan this invoice is for
    plan: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      required: true,
    },
    billing: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    // ─── Amounts (whole YER) ──────────────────────────────────
    planPrice: {
      type: Number,
      required: true,
    },
    creditApplied: {
      type: Number,
      default: 0,
    },
    amountDue: {
      type: Number,
      required: true,
    },
    // ─── Proration breakdown ──────────────────────────────────
    previousPlan: {
      type: String,
      default: null,
    },
    remainingDays: {
      type: Number,
      default: 0,
    },
    remainingValue: {
      type: Number,
      default: 0,
    },
    walletCreditGenerated: {
      type: Number,
      default: 0,
    },
    // ─── Payment info ─────────────────────────────────────────
    waslUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'pending',       // created, awaiting payment
        'paid',          // receipt uploaded, awaiting admin verification
        'verified',      // admin verified the payment
        'cancelled',     // invoice cancelled (e.g. subscription rejected)
      ],
      default: 'pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

invoiceSchema.index({ merchant: 1, status: 1 });
invoiceSchema.index({ subscription: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
