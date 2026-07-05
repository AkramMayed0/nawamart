const mongoose = require('mongoose');

const sectionTypes = [
  'hero',
  'featuredProducts',
  'imageText',
  'testimonials',
  'newsletter',
  'gallery',
  'video',
  'countdown',
  'blogPosts',
  'instagram',
  'customHtml',
  'divider',
  'iconCards',
  'brands',
  'stats',
];

const homepageSectionSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'المتجر مطلوب'],
    },
    type: {
      type: String,
      enum: sectionTypes,
      required: [true, 'نوع القسم مطلوب'],
    },
    order: {
      type: Number,
      default: 0,
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    visible: {
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

homepageSectionSchema.index({ store: 1, order: 1 });

module.exports = mongoose.model('HomepageSection', homepageSectionSchema);
