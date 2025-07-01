import { Pool } from 'pg';
import { MongoClient, Db } from 'mongodb';

// PostgreSQL connection for relational data (users, workspaces, workflows metadata)
export const createPostgresPool = () => {
  return new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'flowforge_dev',
    user: process.env.POSTGRES_USER || 'flowforge',
    password: process.env.POSTGRES_PASSWORD || 'flowforge_dev_password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};

// MongoDB connection for document data (workflow definitions, execution logs)
export const createMongoConnection = async (): Promise<Db> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowforge_dev';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    return client.db();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

// Database health check
export const checkDatabaseHealth = async (pgPool: Pool, mongodb: Db) => {
  const health = {
    postgres: false,
    mongodb: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check PostgreSQL
    const pgResult = await pgPool.query('SELECT NOW()');
    health.postgres = !!pgResult.rows[0];
  } catch (error) {
    console.warn('PostgreSQL health check failed:', error);
  }

  try {
    // Check MongoDB
    const mongoResult = await mongodb.admin().ping();
    health.mongodb = !!mongoResult.ok;
  } catch (error) {
    console.warn('MongoDB health check failed:', error);
  }

  return health;
};