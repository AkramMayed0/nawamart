const PLACEHOLDER_VALUES = new Set([
  'your_super_secret_jwt_key_here_change_this_in_production',
  'changeme',
  'change_me',
]);

function parseCsvEnv(value, fallback = []) {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .concat(fallback)
    .filter((item, index, arr) => arr.indexOf(item) === index);
}

const VALID_ENVIRONMENTS = new Set(['development', 'production', 'test']);

function validateEnv() {
  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';

  if (!VALID_ENVIRONMENTS.has(env)) {
    throw new Error(`NODE_ENV must be one of: ${[...VALID_ENVIRONMENTS].join(', ')}`);
  }

  const required = ['MONGODB_URI', 'JWT_SECRET'];

  if (isProduction) {
    required.push('CLIENT_URL');
  }

  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (isProduction) {
    const jwtSecret = process.env.JWT_SECRET || '';
    if (jwtSecret.length < 32 || PLACEHOLDER_VALUES.has(jwtSecret)) {
      throw new Error('JWT_SECRET must be a non-placeholder value with at least 32 characters in production');
    }
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  if (!Number.isSafeInteger(port) || port < 1024 || port > 65535) {
    throw new Error('PORT must be an integer between 1024 and 65535');
  }

  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '600', 10);
  if (!Number.isFinite(rateLimitMax) || rateLimitMax < 1) {
    throw new Error('RATE_LIMIT_MAX must be a positive integer');
  }

  return {
    env,
    isProduction,
    port,
    allowedOrigins: parseCsvEnv(
      process.env.CLIENT_URL,
      isProduction ? [] : ['http://localhost:3000', 'http://localhost:5173'],
    ),
  };
}

module.exports = { parseCsvEnv, validateEnv };
