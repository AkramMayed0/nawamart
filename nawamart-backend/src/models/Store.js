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
    logo: { type: String, default: null },
    banner: { type: String, default: null },
    type: {
      type: String,
      enum: ['physical', 'digital'],
      default: 'physical',
    },
    category: { type: String, trim: true, default: null },
    contactPhone: { type: String, trim: true, default: null },
    paymentAccounts: {
      kuraimi: { type: String, trim: true, default: null },
      oneCash: { type: String, trim: true, default: null },
      jaib: { type: String, trim: true, default: null },
    },
    // ─── Store Profile (Settings & Configuration) ─────────────────────────────
    legalBusinessName:   { type: String, trim: true, default: null },
    contactEmail:        { type: String, trim: true, lowercase: true, default: null },
    physicalAddress: {
      street:  { type: String, trim: true, default: null },
      city:    { type: String, trim: true, default: null },
      state:   { type: String, trim: true, default: null },
      zip:     { type: String, trim: true, default: null },
      country: { type: String, trim: true, default: 'YE' },
    },
    // ─── Status ────────────────────────────────────────────────────────────────
    storeStatus: {
      type: String,
      enum: ['live', 'under_construction', 'paused', 'closed'],
      default: 'under_construction',
    },
    constructionPassword: { type: String, default: null },
    suspendedUntil: { type: Date, default: null },
    // ─── Subscription / Plan ─────────────────────────────────────────────────
    plan: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter',
    },
    planExpiresAt: { type: Date, default: null },
    planWaslUrl: { type: String, default: null },
    // ─── Theme ──────────────────────────────────────────────────────────────────
    activeTheme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theme',
      default: null,
    },
    // ─── Domain ────────────────────────────────────────────────────────────────
    subdomain: { type: String, trim: true, lowercase: true, default: null },
    customDomain: { type: String, trim: true, default: null },
    domainVerified: { type: Boolean, default: false },
    // ─── Localization ──────────────────────────────────────────────────────────
    locale: { type: String, default: 'ar-YE' },
    currency: { type: String, default: 'YER' },
    language: { type: String, enum: ['ar', 'en'], default: 'ar' },
    timezone: { type: String, default: 'Asia/Aden' },
    dateFormat: {
      type: String,
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
      default: 'DD/MM/YYYY',
    },
    numberFormat: {
      type: String,
      enum: ['1,234.56', '1.234,56', '1 234,56'],
      default: '1,234.56',
    },
    // ─── Hosting ───────────────────────────────────────────────────────────────
    tenantType: {
      type: String,
      enum: ['shared', 'dedicated'],
      default: 'shared',
    },
    dedicatedInfrastructure: {
      subdomain: { type: String, trim: true, default: null },
      hostingStatus: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
      provisionedAt: { type: Date, default: null },
    },
    // ─── Security ──────────────────────────────────────────────────────────────
    staffPasswordPolicy: {
      minLength:        { type: Number, default: 8, min: 4, max: 128 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumber:    { type: Boolean, default: true },
      requireSpecial:   { type: Boolean, default: true },
    },
    ipAllowlist: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    // ─── Feature Toggles ───────────────────────────────────────────────────────
    featureToggles: {
      blog:            { type: Boolean, default: false },
      reviews:         { type: Boolean, default: false },
      wishlists:       { type: Boolean, default: false },
      multiLanguage:   { type: Boolean, default: false },
      dropshipping:    { type: Boolean, default: false },
    },
    // ─── Integrations ──────────────────────────────────────────────────────────
    integrations: {
      paymentGateways: {
        type: [{ type: String, trim: true }],
        default: [],
      },
      shippingCarriers: {
        type: [{ type: String, trim: true }],
        default: [],
      },
      marketingTools: {
        type: [{ type: String, trim: true }],
        default: [],
      },
      accounting: {
        type: [{ type: String, trim: true }],
        default: [],
      },
    },
    // ─── Shipping Fees (physical stores only) ──────────────────────────────────
    shippingFees: [
      {
        city: { type: String, trim: true, required: true },
        fee:  { type: Number, required: true, min: 0 },
      },
    ],
    // ─── Metrics ─────────────────────────────────────────────────────────────
    totalProducts: { type: Number, default: 0 },
    totalOrders:  { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

storeSchema.index({ merchant: 1 });
storeSchema.index({ subdomain: 1 }, { sparse: true });
storeSchema.index({ storeStatus: 1 });

storeSchema.pre('validate', function (next) {
  if (this.isNew && this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now().toString(36);
  }
  next();
});

module.exports = mongoose.model('Store', storeSchema);
