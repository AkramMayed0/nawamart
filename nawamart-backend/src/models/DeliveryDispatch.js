const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: null },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    address: { type: String, trim: true, default: null },
  },
  { _id: false }
);

const deliveryDispatchSchema = new mongoose.Schema(
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
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    courier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Courier',
      required: true,
    },
    pickup: {
      type: pointSchema,
      default: {},
    },
    dropoff: {
      type: pointSchema,
      default: {},
    },
    lightweightMapUrl: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['assigned', 'picked_up', 'delivered', 'cancelled'],
      default: 'assigned',
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

deliveryDispatchSchema.index({ store: 1, createdAt: -1 });
deliveryDispatchSchema.index({ order: 1 }, { unique: true });

module.exports = mongoose.model('DeliveryDispatch', deliveryDispatchSchema);
