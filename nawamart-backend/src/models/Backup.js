const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
    },
    type: {
      type: String,
      enum: ['manual', 'scheduled', 'pre-upgrade'],
      default: 'manual',
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    filePath: { type: String, default: null },
    fileSize: { type: Number, default: null },
    metadata: {
      productCount: { type: Number, default: 0 },
      orderCount: { type: Number, default: 0 },
      storeCount: { type: Number, default: 0 },
      customerCount: { type: Number, default: 0 },
      sizeBytes: { type: Number, default: 0 },
    },
    errorMessage: { type: String, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

backupSchema.index({ store: 1, createdAt: -1 });
backupSchema.index({ status: 1 });
backupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Backup', backupSchema);
