const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'مفتاح الميزة مطلوب'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, 'اسم الميزة مطلوب'],
      trim: true,
    },
    description: { type: String, trim: true, default: null },
    enabled: { type: Boolean, default: false },
    rolloutPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    beta: { type: Boolean, default: false },
    optInMerchants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' }],
    requiredPlan: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter',
    },
    storeTypes: {
      type: [String],
      enum: ['physical', 'digital'],
      default: ['physical', 'digital'],
    },
    toggleKey: { type: String, trim: true, default: null },
    stagingOnly: { type: Boolean, default: false },
    deprecated: { type: Boolean, default: false },
    deprecatedAt: { type: Date, default: null },
    sunsetDate: { type: Date, default: null },
    deprecationMessage: { type: String, trim: true, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  {
    timestamps: true,
  }
);

featureFlagSchema.index({ enabled: 1, beta: 1 });
featureFlagSchema.index({ key: 1, enabled: 1 });

module.exports = mongoose.model('FeatureFlag', featureFlagSchema);
