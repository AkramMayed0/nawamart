const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['motorbike', 'car', 'walking', 'other'],
      default: 'motorbike',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentStatus: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  { timestamps: true }
);

courierSchema.index({ store: 1, isActive: 1 });
courierSchema.index({ merchant: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Courier', courierSchema);
