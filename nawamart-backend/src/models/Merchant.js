const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const merchantSchema = new mongoose.Schema(
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
      unique: true,
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
      minlength: [8, 'كلمة المرور يجب أن تكون على الأقل 8 أحرف'],
      select: false, // Never return password in queries by default
    },
    isVerified: {
      type: Boolean,
      default: false,
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
    // ─── MFA ──────────────────────────────────────────────────────────────────
    mfaSecret: {
      type: String,
      default: null,
      select: false,
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaBackupCodes: [
      {
        code: { type: String },
        used: { type: Boolean, default: false },
      },
    ],
    // ─── Store Role (for staff members) ────────────────────────────────────────
    storeRole: {
      type: String,
      enum: ['store_owner', 'store_manager', 'staff', 'designer', 'content_editor', 'viewer', null],
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    // Reference to stores owned by this merchant
    stores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
// Note: email index is created automatically by unique:true on the field
merchantSchema.index({ phone: 1 });

// ─── Pre-save: Hash password ─────────────────────────────────────────────────
merchantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance method: Compare password ──────────────────────────────────────
merchantSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: Safe JSON (hide sensitive fields) ───────────────────────
merchantSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.mfaSecret;
  delete obj.mfaBackupCodes;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Merchant', merchantSchema);
