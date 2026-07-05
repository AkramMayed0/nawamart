const mongoose = require('mongoose');

const knowledgeArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'عنوان المقال مطلوب'],
      trim: true,
      maxlength: [300, 'العنوان لا يمكن أن يتجاوز 300 حرف'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'محتوى المقال مطلوب'],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, 'الملخص لا يمكن أن يتجاوز 500 حرف'],
      default: null,
    },
    category: {
      type: String,
      enum: [
        'getting_started', 'account', 'store_setup', 'products',
        'orders', 'payments', 'shipping', 'digital_delivery',
        'subscription', 'billing', 'troubleshooting', 'integrations',
        'api', 'security', 'general',
      ],
      default: 'general',
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    helpfulCount: { type: Number, default: 0 },
    notHelpfulCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

knowledgeArticleSchema.virtual('helpfulnessRate').get(function () {
  const total = this.helpfulCount + this.notHelpfulCount;
  if (total === 0) return null;
  return Math.round((this.helpfulCount / total) * 100);
});

knowledgeArticleSchema.index({ category: 1, isPublished: 1 });
knowledgeArticleSchema.index({ tags: 1 });

knowledgeArticleSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now().toString(36);
  }
  next();
});

module.exports = mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
