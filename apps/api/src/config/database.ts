import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { config } from './index.js';

let db: ReturnType<typeof drizzle>;

export async function connectDatabase() {
  try {
    // For development, use SQLite (no external database needed)
    const isDev = config.NODE_ENV === 'development';
    
    if (isDev) {
      const sqlite = new Database('./dev.db');
      db = drizzle(sqlite);
      console.log('Successfully connected to SQLite database (development)');
    } else {
      // For production, you can switch back to PostgreSQL
      console.log('Database connection configured for:', config.DATABASE_URL);
      // TODO: Add PostgreSQL connection for production
    }
    
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