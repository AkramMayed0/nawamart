const mongoose = require('mongoose');

const whatsappAutomationSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      unique: true,
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    commerceBotEnabled: {
      type: Boolean,
      default: false,
    },
    botGreeting: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    cartRetrieverEnabled: {
      type: Boolean,
      default: false,
    },
    abandonedCartDelayMinutes: {
      type: Number,
      min: 15,
      max: 10080,
      default: 120,
    },
    discountEnabled: {
      type: Boolean,
      default: false,
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 80,
      default: 0,
    },
    quietHours: {
      start: { type: String, default: null },
      end: { type: String, default: null },
    },
    connectedPhone: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

whatsappAutomationSchema.index({ merchant: 1 });

module.exports = mongoose.model('WhatsAppAutomation', whatsappAutomationSchema);
