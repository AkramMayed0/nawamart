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
    requestedPlan: {
      type: String,
      enum: ['pro', 'business'],
      required: [true, 'الخطة المطلوبة مطلوبة'],
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
  },
  { timestamps: true }
);

subscriptionSchema.index({ merchant: 1, status: 1 });
subscriptionSchema.index({ store: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
