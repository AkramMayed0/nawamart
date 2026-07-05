const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'المتجر مطلوب'],
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: [true, 'التاجر مطلوب'],
  },
  code: {
    type: String,
    required: [true, 'كود الخصم مطلوب'],
    trim: true,
    uppercase: true,
    minlength: [3, 'الكود يجب أن يكون 3 أحرف على الأقل'],
    maxlength: [20, 'الكود لا يمكن أن يتجاوز 20 حرف'],
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'نوع الخصم مطلوب'],
  },
  value: {
    type: Number,
    required: [true, 'قيمة الخصم مطلوبة'],
    min: [0, 'القيمة لا يمكن أن تكون سالبة'],
    validate: {
      validator: function (v) {
        if (this.type === 'percentage') return v <= 100;
        return true;
      },
      message: 'نسبة الخصم لا يمكن أن تتجاوز 100%',
    },
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'الحد الأدنى للطلب لا يمكن أن يكون سالباً'],
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: [0, 'الحد الأقصى للخصم لا يمكن أن يكون سالباً'],
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'حد الاستخدام يجب أن يكون 1 على الأقل'],
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  perUserLimit: {
    type: Number,
    default: 1,
    min: [1, 'حد الاستخدام لكل عميل يجب أن يكون 1 على الأقل'],
  },
  appliesTo: {
    type: String,
    enum: ['all', 'specific_products', 'specific_categories'],
    default: 'all',
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  applicableCategories: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  startsAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

discountSchema.virtual('isExpired').get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

discountSchema.virtual('isExhausted').get(function () {
  return this.usageLimit && this.usedCount >= this.usageLimit;
});

discountSchema.index({ store: 1, code: 1 }, { unique: true });
discountSchema.index({ merchant: 1 });
discountSchema.index({ isActive: 1, expiresAt: 1 });
discountSchema.index({ code: 'text' });

module.exports = mongoose.model('Discount', discountSchema);
