const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    label: {
      type: String,
      default: null,
    },
    settings: {
      backgroundColor: { type: String, default: null },
      textColor: { type: String, default: null },
      paddingTop: { type: String, default: null },
      paddingBottom: { type: String, default: null },
      isFullWidth: { type: Boolean, default: false },
      showOnMobile: { type: Boolean, default: true },
      showOnTablet: { type: Boolean, default: true },
      showOnDesktop: { type: Boolean, default: true },
    },
    blocks: [blockSchema],
  },
  { _id: false }
);

const pageSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'المتجر مطلوب'],
    },
    title: {
      type: String,
      required: [true, 'عنوان الصفحة مطلوب'],
      trim: true,
      maxlength: [200, 'عنوان الصفحة لا يمكن أن يتجاوز 200 حرف'],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['home', 'about', 'contact', 'policy', 'custom'],
      default: 'custom',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isHomePage: {
      type: Boolean,
      default: false,
    },
    seo: {
      title: { type: String, default: null, maxlength: 70 },
      description: { type: String, default: null, maxlength: 160 },
      keywords: [{ type: String, trim: true }],
    },
    sections: [sectionSchema],
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

pageSchema.index({ store: 1, slug: 1 }, { unique: true });
pageSchema.index({ store: 1, type: 1 });

module.exports = mongoose.model('Page', pageSchema);
