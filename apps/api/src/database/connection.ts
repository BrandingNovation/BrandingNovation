import { Pool, PoolClient } from 'pg';
import { MongoClient, Db } from 'mongodb';
import Redis from 'ioredis';

// PostgreSQL Connection
let pgPool: Pool | null = null;

export function createPostgresPool(): Pool {
  if (pgPool) {
    return pgPool;
  }

  pgPool = new Pool({
    user: process.env.POSTGRES_USER || 'flowforge',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'flowforge',
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
    connectionTimeoutMillis: 2000, // How long to wait for a connection
  });

  pgPool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
  });

  return pgPool;
}

export async function getPostgresClient(): Promise<PoolClient> {
  const pool = createPostgresPool();
  return await pool.connect();
}

export async function closePostgresPool(): Promise<void> {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
}

// MongoDB Connection
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

export async function createMongoConnection(): Promise<Db> {
  if (mongoDb) {
    return mongoDb;
  }

  const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB || 'flowforge';

  mongoClient = new MongoClient(mongoUrl);
  await mongoClient.connect();
  mongoDb = mongoClient.db(dbName);

  console.log('Connected to MongoDB');
  return mongoDb;
}

export async function getMongoDb(): Promise<Db> {
  if (!mongoDb) {
    return await createMongoConnection();
  }
  return mongoDb;
}

export async function closeMongoConnection(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
  }
}

// Redis Connection
let redisClient: Redis | null = null;

export function createRedisConnection(): Redis {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  });

  redisClient.on('error', (err: Error) => {
    console.error('Redis connection error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });

  return redisClient;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    return createRedisConnection();
  }
  return redisClient;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Database Health Check
export async function checkDatabaseHealth(): Promise<{
  postgres: boolean;
  mongodb: boolean;
  redis: boolean;
}> {
  const health = {
    postgres: false,
    mongodb: false,
    redis: false,
  };

  // Check PostgreSQL
  try {
    const client = await getPostgresClient();
    await client.query('SELECT 1');
    client.release();
    health.postgres = true;
  } catch (error) {
    console.error('PostgreSQL health check failed:', error);
  }

  // Check MongoDB
  try {
    const db = await getMongoDb();
    await db.admin().ping();
    health.mongodb = true;
  } catch (error) {
    console.error('MongoDB health check failed:', error);
  }

  // Check Redis
  try {
    const redis = getRedisClient();
    await redis.ping();
    health.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  return health;
}

// Graceful shutdown
export async function closeAllConnections(): Promise<void> {
  await Promise.all([
    closePostgresPool(),
    closeMongoConnection(),
    closeRedisConnection(),
  ]);
}

// Transaction helper for PostgreSQL
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPostgresClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}