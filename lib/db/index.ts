import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.error(
    '[db] DATABASE_URL is missing. Set it in Vercel Project Settings → Environment Variables.'
  );
}

export const pool = new Pool({
  connectionString,
  // Neon / managed Postgres often need SSL in production
  ssl:
    process.env.NODE_ENV === 'production' ||
    /neon\.tech|supabase\.co|amazonaws\.com|sslmode=require/i.test(connectionString || '')
      ? { rejectUnauthorized: false }
      : undefined,
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { schema });
