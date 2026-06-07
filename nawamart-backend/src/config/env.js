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

function validateEnv() {
  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';
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

  return {
    env,
    isProduction,
    allowedOrigins: parseCsvEnv(
      process.env.CLIENT_URL,
      isProduction ? [] : ['http://localhost:3000', 'http://localhost:5173'],
    ),
  };
}

module.exports = { parseCsvEnv, validateEnv };
