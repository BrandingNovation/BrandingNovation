import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from './index.js';

let db: ReturnType<typeof drizzle>;

export async function connectDatabase() {
  try {
    const client = postgres(config.DATABASE_URL);
    db = drizzle(client);
    
    console.log('Successfully connected to PostgreSQL database');
    return db;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
}