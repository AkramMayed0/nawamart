const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const SCOPES = [
  'products:read', 'products:write',
  'orders:read', 'orders:write',
  'customers:read', 'customers:write',
  'store:read', 'store:write',
  'webhooks:manage',
  'analytics:read',
];

const apiKeySchema = new mongoose.Schema({
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
    required: [true, 'اسم المفتاح مطلوب'],
    trim: true,
    maxlength: [100, 'الاسم لا يمكن أن يتجاوز 100 حرف'],
  },
  prefix: {
    type: String,
    default: null,
  },
  key: {
    type: String,
    required: true,
    select: false,
  },
  scopes: {
    type: [String],
    enum: {
      values: SCOPES,
      message: 'صلاحية غير صالحة: {VALUE}',
    },
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'يجب تحديد صلاحية واحدة على الأقل',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUsedAt: {
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

apiKeySchema.virtual('isExpired').get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

apiKeySchema.virtual('fullPrefix').get(function () {
  return this.prefix ? `${this.prefix}...` : null;
});

apiKeySchema.index({ merchant: 1, store: 1 });
apiKeySchema.index({ key: 1 });
apiKeySchema.index({ store: 1, isActive: 1 });

apiKeySchema.statics.generateKey = function () {
  const raw = `nw_${crypto.randomBytes(32).toString('hex')}`;
  const prefix = raw.slice(0, 12);
  return { raw, prefix };
};

apiKeySchema.statics.hashKey = async function (rawKey) {
  return bcrypt.hash(rawKey, 10);
};

apiKeySchema.statics.compareKey = async function (rawKey, hashedKey) {
  return bcrypt.compare(rawKey, hashedKey);
};

apiKeySchema.statics.getScopes = function () {
  return SCOPES;
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
