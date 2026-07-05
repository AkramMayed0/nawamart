const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    userName: {
      type: String,
      default: null,
    },
    userRole: {
      type: String,
      enum: ['store_owner', 'store_manager', 'staff', 'designer', 'content_editor', 'viewer', null],
      default: null,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'product.create', 'product.update', 'product.delete',
        'order.confirm', 'order.reject', 'order.ship', 'order.deliver',
        'staff.create', 'staff.update', 'staff.delete',
        'store.update', 'store.settings',
        'export.products', 'export.orders', 'export.customers', 'export.reports',
        'login', 'logout',
        'inventory.update', 'inventory.adjust', 'inventory.transfer',
      ],
    },
    resource: {
      type: {
        type: String,
        enum: ['product', 'order', 'staff', 'store', 'export', 'session', 'inventory'],
        required: true,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      name: {
        type: String,
        default: null,
      },
    },
    details: {
      type: String,
      default: null,
    },
    changes: {
      before: { type: mongoose.Schema.Types.Mixed, default: null },
      after: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ store: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ 'resource.type': 1, 'resource.id': 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);