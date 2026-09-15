import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.error(
    '[db] DATABASE_URL is missing. Set it in Vercel Project Settings → Environment Variables.'
  );
}

function resolveSsl(url: string | undefined): false | { rejectUnauthorized: boolean } | undefined {
  if (!url) return undefined;
  const lower = url.toLowerCase();

  // Explicit off (Dokploy / plain Postgres often need this from Vercel)
  if (
    lower.includes('sslmode=disable') ||
    lower.includes('ssl=false') ||
    process.env.DATABASE_SSL === 'false'
  ) {
    return false;
  }

  // Explicit on / managed providers that require TLS
  if (
    lower.includes('sslmode=require') ||
    lower.includes('sslmode=verify') ||
    lower.includes('ssl=true') ||
    /neon\.tech|supabase\.co|amazonaws\.com|render\.com|vercel-storage/i.test(url) ||
    process.env.DATABASE_SSL === 'true'
  ) {
    return { rejectUnauthorized: false };
  }

  // Default: no SSL (self-hosted / Dokploy Postgres)
  return undefined;
}

export const pool = new Pool({
  connectionString,
  ssl: resolveSsl(connectionString),
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { schema });
