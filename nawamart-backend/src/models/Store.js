const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: [true, 'التاجر مطلوب'],
    },
    name: {
      type: String,
      required: [true, 'اسم المتجر مطلوب'],
      trim: true,
      minlength: [2, 'اسم المتجر يجب أن يكون على الأقل حرفين'],
      maxlength: [100, 'اسم المتجر لا يمكن أن يتجاوز 100 حرف'],
    },
    // URL-friendly unique identifier
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'الوصف لا يمكن أن يتجاوز 1000 حرف'],
      default: null,
    },
    logo: {
      type: String,
      default: null,
    },
    banner: {
      type: String,
      default: null,
    },
    // physical = ships products, digital = delivers via chat
    type: {
      type: String,
      enum: ['physical', 'digital'],
      default: 'physical',
    },
    category: {
      type: String,
      trim: true,
      default: null,
    },
    contactPhone: {
      type: String,
      trim: true,
      default: null,
    },
    // Payment account info (Cherry, Kuraimi, OneCash)
    paymentAccounts: {
      cherry: { type: String, trim: true, default: null },
      kuraimi: { type: String, trim: true, default: null },
      oneCash: { type: String, trim: true, default: null },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ─── Subscription / Plan ─────────────────────────────────────────────────
    plan: {
      type: String,
      enum: ['free', 'pro', 'business'],
      default: 'free',
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    planWaslUrl: {
      type: String,
      default: null,
    },
    // Metrics (updated via atomic ops)
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
// Note: slug index is created automatically by unique:true on the field
storeSchema.index({ merchant: 1 });
storeSchema.index({ isActive: 1 });

// ─── Pre-save: Auto-generate slug from name ──────────────────────────────────
storeSchema.pre('validate', function (next) {
  if (this.isNew && this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '') // Allow Arabic chars + alphanumeric + dash
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now().toString(36); // Suffix to ensure uniqueness
  }
  next();
});

module.exports = mongoose.model('Store', storeSchema);
