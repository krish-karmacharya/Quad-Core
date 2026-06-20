function validateEnv() {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const mockAi = String(process.env.MOCK_AI).toLowerCase() === 'true';
  if (!mockAi && !process.env.AI_SERVICE_URL) {
    throw new Error('AI_SERVICE_URL is required when MOCK_AI is not true');
  }

  if (
    process.env.NODE_ENV === 'production' &&
    process.env.JWT_SECRET === 'change_this_to_a_long_random_secret'
  ) {
    throw new Error('JWT_SECRET must be changed before running in production');
  }
}

module.exports = validateEnv;
