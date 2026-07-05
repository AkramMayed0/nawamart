const mongoose = require('mongoose');

const CONSENT_TYPES = [
  'essential',
  'functional',
  'analytics',
  'marketing',
  'gdpr',
  'ccpa',
  'terms',
  'privacy',
];

const consentSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    default: null,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  userRole: {
    type: String,
    enum: ['merchant', 'customer', 'visitor'],
    default: 'visitor',
  },
  visitorId: {
    type: String,
    default: null,
  },
  ip: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    enum: {
      values: CONSENT_TYPES,
      message: 'نوع الموافقة غير صالح: {VALUE}',
    },
    required: [true, 'نوع الموافقة مطلوب'],
  },
  granted: {
    type: Boolean,
    required: [true, 'حالة الموافقة مطلوبة'],
  },
  version: {
    type: String,
    default: '1.0',
  },
  consentDate: {
    type: Date,
    default: Date.now,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

consentSchema.index({ store: 1, user: 1, type: 1 });
consentSchema.index({ visitorId: 1, type: 1 });
consentSchema.index({ consentDate: -1 });

consentSchema.statics.getTypes = function () {
  return CONSENT_TYPES;
};

consentSchema.statics.getTypeLabel = function (type) {
  const labels = {
    essential: 'أساسي',
    functional: 'وظيفي',
    analytics: 'تحليلات',
    marketing: 'تسويق',
    gdpr: 'اللائحة العامة لحماية البيانات (GDPR)',
    ccpa: 'قانون خصوصية المستهلك في كاليفورنيا (CCPA)',
    terms: 'شروط الخدمة',
    privacy: 'سياسة الخصوصية',
  };
  return labels[type] || type;
};

module.exports = mongoose.model('Consent', consentSchema);
