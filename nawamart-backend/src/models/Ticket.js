const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      default: null,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    subject: {
      type: String,
      required: [true, 'عنوان التذكرة مطلوب'],
      trim: true,
      maxlength: [200, 'العنوان لا يمكن أن يتجاوز 200 حرف'],
    },
    description: {
      type: String,
      required: [true, 'وصف التذكرة مطلوب'],
      trim: true,
      maxlength: [5000, 'الوصف لا يمكن أن يتجاوز 5000 حرف'],
    },
    category: {
      type: String,
      enum: [
        'technical', 'billing', 'account', 'feature_request',
        'bug_report', 'general', 'other',
      ],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_on_merchant', 'waiting_on_customer', 'resolved', 'closed'],
      default: 'open',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    source: {
      type: String,
      enum: ['in_app', 'email', 'api', 'widget'],
      default: 'in_app',
    },
    tags: [{ type: String, trim: true }],
    internalNotes: [
      {
        content: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    closedAt: { type: Date, default: null },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    firstResponseAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    satisfactionRating: {
      score: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, trim: true, default: null },
      ratedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ticketSchema.virtual('responseTimeHours').get(function () {
  if (!this.firstResponseAt) return null;
  return ((this.firstResponseAt - this.createdAt) / (1000 * 60 * 60)).toFixed(1);
});

ticketSchema.virtual('resolutionTimeHours').get(function () {
  if (!this.resolvedAt) return null;
  return ((this.resolvedAt - this.createdAt) / (1000 * 60 * 60)).toFixed(1);
});

ticketSchema.index({ merchant: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
