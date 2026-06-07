const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 20),
      minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 0),
      serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000),
      socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000),
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    logger.info(`[DB] MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`[DB] MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('[DB] MongoDB disconnected');
    });

  } catch (error) {
    logger.error(`[DB] MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
