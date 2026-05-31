const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
      minlength: [2, 'الاسم يجب أن يكون على الأقل حرفين'],
      maxlength: [100, 'الاسم لا يمكن أن يتجاوز 100 حرف'],
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: 'البريد الإلكتروني غير صالح',
      },
    },
    phone: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
      trim: true,
      validate: {
        validator: (v) => /^[0-9+\-\s()]{7,20}$/.test(v),
        message: 'رقم الهاتف غير صالح',
      },
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'],
      select: false,
    },
    address: {
      city: { type: String, trim: true, default: null },
      district: { type: String, trim: true, default: null },
      details: { type: String, trim: true, default: null },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Timed suspension — null means permanent if isActive=false
    suspendedUntil: {
      type: Date,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
// Allow same email across different stores — compound unique
customerSchema.index({ email: 1, store: 1 }, { unique: true, sparse: true });
customerSchema.index({ phone: 1 });

// ─── Pre-save: Hash password ─────────────────────────────────────────────────
customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance method: Compare password ──────────────────────────────────────
customerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: Safe JSON ───────────────────────────────────────────────
customerSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Customer', customerSchema);
