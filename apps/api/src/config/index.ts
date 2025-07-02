import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001'),
  HOST: process.env.HOST || '0.0.0.0',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/flowforge',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'development-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Security
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  
  // Rate limiting
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  
  // File uploads
  MAX_FILE_SIZE_BYTES: parseInt(process.env.MAX_FILE_SIZE_BYTES || '10485760'), // 10MB
  
  // External APIs
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
  
  // Sendgrid
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@flowforge.ai',
  
  // AWS S3
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  S3_BUCKET: process.env.S3_BUCKET,
  
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // API URL
  API_URL: process.env.API_URL || 'http://localhost:3001',
};