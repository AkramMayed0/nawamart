const mongoose = require('mongoose');
const crypto = require('crypto');

const WEBHOOK_EVENTS = [
  'product.created',
  'product.updated',
  'product.deleted',
  'order.created',
  'order.confirmed',
  'order.shipped',
  'order.delivered',
  'order.cancelled',
  'order.rejected',
  'store.updated',
];

const webhookSchema = new mongoose.Schema({
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: [true, 'التاجر مطلوب'],
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'المتجر مطلوب'],
  },
  name: {
    type: String,
    required: [true, 'اسم الويب هوك مطلوب'],
    trim: true,
    maxlength: [100, 'الاسم لا يمكن أن يتجاوز 100 حرف'],
  },
  url: {
    type: String,
    required: [true, 'رابط الويب هوك مطلوب'],
    trim: true,
    maxlength: [2048, 'الرابط طويل جداً'],
  },
  events: {
    type: [String],
    required: [true, 'الأحداث مطلوبة'],
    enum: {
      values: WEBHOOK_EVENTS,
      message: 'حدث غير صالح: {VALUE}',
    },
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'يجب تحديد حدث واحد على الأقل',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  secret: {
    type: String,
    default: null,
  },
  apiVersion: {
    type: String,
    default: 'v1',
  },
  lastTriggeredAt: {
    type: Date,
    default: null,
  },
  lastSuccessAt: {
    type: Date,
    default: null,
  },
  lastFailureAt: {
    type: Date,
    default: null,
  },
  consecutiveFailures: {
    type: Number,
    default: 0,
  },
  headers: {
    type: Map,
    of: String,
    default: {},
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'الوصف لا يمكن أن يتجاوز 500 حرف'],
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

webhookSchema.index({ merchant: 1, store: 1 });
webhookSchema.index({ store: 1, isActive: 1 });

webhookSchema.statics.generateSecret = function () {
  return crypto.randomBytes(32).toString('hex');
};

webhookSchema.statics.getEvents = function () {
  return WEBHOOK_EVENTS;
};

webhookSchema.statics.getScopeLabel = function (scope) {
  const labels = {
    'product.created': 'إنشاء منتج',
    'product.updated': 'تحديث منتج',
    'product.deleted': 'حذف منتج',
    'order.created': 'إنشاء طلب',
    'order.confirmed': 'تأكيد طلب',
    'order.shipped': 'شحن طلب',
    'order.delivered': 'تسليم طلب',
    'order.cancelled': 'إلغاء طلب',
    'order.rejected': 'رفض طلب',
    'store.updated': 'تحديث المتجر',
  };
  return labels[scope] || scope;
};

module.exports = mongoose.model('Webhook', webhookSchema);
