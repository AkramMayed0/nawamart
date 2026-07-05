const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || ACCESS_TOKEN_EXPIRY,
  });
}

function signRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function signMfaToken(userId, storeId = null) {
  const payload = { id: userId, purpose: 'mfa' };
  if (storeId) payload.storeId = storeId;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  signMfaToken,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};
