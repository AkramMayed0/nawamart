const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    feedbackType: {
      type: String,
      enum: ['nps', 'general', 'feature_request', 'bug_report'],
      required: [true, 'نوع الملاحظات مطلوب'],
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      default: null,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    // NPS
    npsScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    npsCategory: {
      type: String,
      enum: ['promoter', 'passive', 'detractor', null],
      default: null,
    },
    // General feedback
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [2000, 'الرسالة لا يمكن أن تتجاوز 2000 حرف'],
      default: null,
    },
    // Feature request
    featureTitle: {
      type: String,
      trim: true,
      maxlength: [200, 'العنوان لا يمكن أن يتجاوز 200 حرف'],
      default: null,
    },
    featureDescription: {
      type: String,
      trim: true,
      maxlength: [3000, 'الوصف لا يمكن أن يتجاوز 3000 حرف'],
      default: null,
    },
    featureCategory: {
      type: String,
      enum: ['storefront', 'dashboard', 'payments', 'shipping', 'products', 'marketing', 'analytics', 'integrations', 'other', null],
      default: null,
    },
    votes: {
      type: Number,
      default: 0,
    },
    voters: [
      {
        user: { type: mongoose.Schema.Types.ObjectId },
        userRole: { type: String, enum: ['merchant', 'customer', 'admin'] },
        votedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['under_review', 'planned', 'in_progress', 'completed', 'declined'],
      default: 'under_review',
    },
    adminResponse: {
      content: { type: String, trim: true, default: null },
      respondedAt: { type: Date, default: null },
    },
    source: {
      type: String,
      enum: ['in_app', 'widget', 'email', 'nps_survey'],
      default: 'in_app',
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ feedbackType: 1, createdAt: -1 });
feedbackSchema.index({ feedbackType: 1, status: 1 });
feedbackSchema.index({ 'voters.user': 1 });

feedbackSchema.pre('save', function (next) {
  if (this.isModified('npsScore') && this.npsScore !== null) {
    if (this.npsScore >= 9) this.npsCategory = 'promoter';
    else if (this.npsScore >= 7) this.npsCategory = 'passive';
    else this.npsCategory = 'detractor';
  }
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);
