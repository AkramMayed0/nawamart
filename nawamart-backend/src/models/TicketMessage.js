const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['merchant', 'customer', 'admin'],
      required: true,
    },
    senderName: {
      type: String,
      trim: true,
      default: null,
    },
    content: {
      type: String,
      required: [true, 'محتوى الرسالة مطلوب'],
      trim: true,
      maxlength: [5000, 'الرسالة لا يمكن أن تتجاوز 5000 حرف'],
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, trim: true },
        size: { type: Number },
        mimeType: { type: String },
      },
    ],
    isInternal: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

ticketMessageSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model('TicketMessage', ticketMessageSchema);
