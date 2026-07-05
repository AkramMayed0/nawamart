const mongoose = require('mongoose');

const themePresetSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'المتجر مطلوب'],
    },
    name: {
      type: String,
      required: [true, 'اسم الإعداد المسبق مطلوب'],
      trim: true,
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'الإعدادات مطلوبة'],
    },
    screenshot: {
      type: String,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

themePresetSchema.index({ store: 1 });
themePresetSchema.index({ isPublic: 1 });

module.exports = mongoose.model('ThemePreset', themePresetSchema);
