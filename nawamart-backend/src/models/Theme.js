const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم القالب مطلوب'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'الرابط المختصر للقالب مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    category: {
      type: String,
      enum: ['fashion', 'electronics', 'food', 'digital', 'general'],
      required: [true, 'تصنيف القالب مطلوب'],
    },
    type: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    preview: {
      type: String,
      default: null,
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    author: {
      type: String,
      default: 'NawaMart',
    },
    features: {
      type: [String],
      default: [],
    },
    settings: {
      colors: {
        primary: { type: String, default: '#18212F' },
        secondary: { type: String, default: '#2D7BE0' },
        accent: { type: String, default: '#C93F2B' },
        background: { type: String, default: '#F6F3EE' },
        surface: { type: String, default: '#FFFFFF' },
        text: { type: String, default: '#1D2430' },
        textMuted: { type: String, default: '#5F6673' },
        header: { type: String, default: '#18212F' },
        footer: { type: String, default: '#18212F' },
        button: { type: String, default: '#C93F2B' },
        buttonText: { type: String, default: '#FFFFFF' },
        success: { type: String, default: '#27AE60' },
        danger: { type: String, default: '#E74C3C' },
        warning: { type: String, default: '#F39C12' },
      },
      fonts: {
        heading: { type: String, default: 'Cairo' },
        body: { type: String, default: 'Cairo' },
      },
      layout: {
        headerStyle: { type: String, default: 'classic' },
        footerStyle: { type: String, default: 'classic' },
        productCardStyle: { type: String, default: 'grid' },
        sidebarPosition: { type: String, default: 'right' },
        containerWidth: { type: String, default: '1280px' },
      },
      spacing: {
        sectionPadding: { type: String, default: '4rem' },
        elementGap: { type: String, default: '1.5rem' },
      },
    },
    assets: {
      css: { type: String, default: null },
      js: { type: String, default: null },
      templates: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    installCount: {
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

themeSchema.index({ category: 1, type: 1 });
themeSchema.index({ isActive: 1 });

module.exports = mongoose.model('Theme', themeSchema);
