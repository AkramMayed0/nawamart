const mongoose = require('mongoose');

const inventoryLocationSchema = new mongoose.Schema(
  {
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
    name: {
      type: String,
      required: [true, 'اسم الموقع مطلوب'],
      trim: true,
      minlength: [2, 'اسم الموقع يجب أن يكون على الأقل حرفين'],
      maxlength: [200, 'اسم الموقع لا يمكن أن يتجاوز 200 حرف'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'العنوان لا يمكن أن يتجاوز 500 حرف'],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

inventoryLocationSchema.virtual('itemCount', {
  ref: 'InventoryItem',
  localField: '_id',
  foreignField: 'location',
  count: true,
});

inventoryLocationSchema.index({ store: 1 });

module.exports = mongoose.model('InventoryLocation', inventoryLocationSchema);
