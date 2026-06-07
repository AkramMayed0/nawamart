const mongoose = require('mongoose');

const returnRiskSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    customerName: {
      type: String,
      trim: true,
      default: null,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: null,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isShared: {
      type: Boolean,
      default: true,
    },
    evidenceUrls: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

returnRiskSchema.index({ customerPhone: 1, isShared: 1 });
returnRiskSchema.index({ store: 1, createdAt: -1 });

module.exports = mongoose.model('ReturnRisk', returnRiskSchema);
