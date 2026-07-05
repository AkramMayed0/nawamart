const mongoose = require('mongoose');

const themeAssetSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'المتجر مطلوب'],
    },
    originalName: {
      type: String,
      required: [true, 'اسم الملف الأصلي مطلوب'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'رابط الملف مطلوب'],
    },
    type: {
      type: String,
      enum: ['image', 'video', 'font', 'icon', 'document'],
      required: [true, 'نوع الملف مطلوب'],
    },
    mimeType: {
      type: String,
      default: null,
    },
    size: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    alt: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    folder: {
      type: String,
      default: '/',
    },
    publicId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

themeAssetSchema.index({ store: 1, folder: 1 });
themeAssetSchema.index({ store: 1, type: 1 });

module.exports = mongoose.model('ThemeAsset', themeAssetSchema);
