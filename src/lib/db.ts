import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db/schema';
import { sql } from 'drizzle-orm';

// Neon Postgres connection - DATABASE_URL is required for server-side code
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required for server-side database operations');
}

// Create postgres client for Neon Postgres
const client = postgres(connectionString, {
  ssl: 'require', // Enable SSL for Neon
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Disable prepared statements for better compatibility
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Production-ready connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown handling
process.on('beforeExit', async () => {
  if (client) {
    await client.end();
  }
});

// Export schema for convenience
export { schema };