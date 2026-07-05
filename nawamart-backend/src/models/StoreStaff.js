const mongoose = require('mongoose');
const { ROLES } = require('../utils/permissions');

const storeStaffSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'المتجر مطلوب'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: [true, 'المستخدم مطلوب'],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.staff,
      required: [true, 'الدور مطلوب'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      default: null,
    },
    joinedAt: {
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

storeStaffSchema.index({ store: 1, user: 1 }, { unique: true });
storeStaffSchema.index({ user: 1 });

module.exports = mongoose.model('StoreStaff', storeStaffSchema);
