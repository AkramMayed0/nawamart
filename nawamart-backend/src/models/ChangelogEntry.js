const mongoose = require('mongoose');

const changelogEntrySchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: [true, 'رقم الإصدار مطلوب'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'عنوان التحديث مطلوب'],
      trim: true,
      maxlength: [200, 'العنوان لا يمكن أن يتجاوز 200 حرف'],
    },
    description: { type: String, trim: true, default: null },
    type: {
      type: String,
      enum: ['new_feature', 'improvement', 'bugfix', 'deprecation', 'breaking'],
      default: 'improvement',
    },
    featureKey: {
      type: String,
      trim: true,
      default: null,
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  {
    timestamps: true,
  }
);

changelogEntrySchema.index({ publishedAt: -1 });
changelogEntrySchema.index({ isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model('ChangelogEntry', changelogEntrySchema);
