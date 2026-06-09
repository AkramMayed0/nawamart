const mongoose = require('mongoose');

const themeSettingSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'المتجر مطلوب'],
      unique: true,
    },
    theme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theme',
      default: null,
    },
    colors: {
      primary: { type: String, default: '#18212F' },
      secondary: { type: String, default: '#2D7BE0' },
      accent: { type: String, default: '#C93F2B' },
      background: { type: String, default: '#F6F3EE' },
      surface: { type: String, default: '#FFFFFF' },
      text: { type: String, default: '#1D2430' },
      textMuted: { type: String, default: '#5F6673' },
      header: { type: String, default: '#18212F' },
      footer: { type: String, default: '#18212F' },
      button: { type: String, default: '#C93F2B' },
      buttonText: { type: String, default: '#FFFFFF' },
      success: { type: String, default: '#27AE60' },
      danger: { type: String, default: '#E74C3C' },
      warning: { type: String, default: '#F39C12' },
    },
    fonts: {
      heading: { type: String, default: 'Cairo' },
      body: { type: String, default: 'Cairo' },
      headingUrl: { type: String, default: null },
      bodyUrl: { type: String, default: null },
    },
    layout: {
      headerStyle: {
        type: String,
        enum: ['classic', 'minimal', 'centered', 'compact'],
        default: 'classic',
      },
      footerStyle: {
        type: String,
        enum: ['classic', 'minimal', 'simple', 'compact'],
        default: 'classic',
      },
      productCardStyle: {
        type: String,
        enum: ['grid', 'list', 'compact'],
        default: 'grid',
      },
      sidebarPosition: {
        type: String,
        enum: ['left', 'right', 'none'],
        default: 'right',
      },
      containerWidth: {
        type: String,
        default: '1280px',
      },
      borderRadius: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
        default: 'md',
      },
      animationEnabled: {
        type: Boolean,
        default: true,
      },
    },
    spacing: {
      sectionPadding: { type: String, default: '4rem' },
      elementGap: { type: String, default: '1.5rem' },
      contentPadding: { type: String, default: '1rem' },
    },
    customCss: {
      type: String,
      default: null,
      maxlength: [50000, 'CSS لا يمكن أن يتجاوز 50000 حرف'],
    },
    customHtml: {
      header: { type: String, default: null, maxlength: [10000, 'كود HEAD لا يمكن أن يتجاوز 10000 حرف'] },
      footer: { type: String, default: null, maxlength: [10000, 'كود FOOTER لا يمكن أن يتجاوز 10000 حرف'] },
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

module.exports = mongoose.model('ThemeSetting', themeSettingSchema);
