export const config = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  HOST: process.env.HOST ?? '0.0.0.0',
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  CORS_ORIGINS: true, // Allow all by default; customize as needed
  JWT_SECRET: process.env.JWT_SECRET ?? 'changeme',
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
  RATE_LIMIT_MAX_REQUESTS: 100,
  RATE_LIMIT_WINDOW_MS: 60_000, // 1 minute
  API_URL: process.env.API_URL ?? 'http://localhost:3000',
};