const mongoose = require('mongoose');

const walletLedgerSchema = new mongoose.Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'subscription_payment',
        'subscription_refund',
        'upgrade_credit',
        'admin_adjustment',
        'wallet_use',
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceModel',
      default: null,
    },
    referenceModel: {
      type: String,
      enum: ['Subscription', 'Admin'],
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  { timestamps: true }
);

walletLedgerSchema.index({ merchant: 1, createdAt: -1 });

module.exports = mongoose.model('WalletLedger', walletLedgerSchema);
