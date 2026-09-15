import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const rawConnectionString = process.env.DATABASE_URL?.trim();

if (!rawConnectionString) {
  console.error(
    '[db] DATABASE_URL is missing. Set it in Vercel Project Settings → Environment Variables.'
  );
}

function wantsSsl(url: string): boolean {
  const lower = url.toLowerCase();
  if (
    process.env.DATABASE_SSL === 'false' ||
    lower.includes('sslmode=disable') ||
    lower.includes('ssl=false')
  ) {
    return false;
  }
  if (process.env.DATABASE_SSL === 'true') return true;
  if (
    lower.includes('sslmode=require') ||
    lower.includes('sslmode=verify') ||
    lower.includes('ssl=true')
  ) {
    return true;
  }
  return /neon\.tech|supabase\.co|amazonaws\.com|render\.com|vercel-storage/i.test(url);
}

/** Remove sslmode/ssl query params so `pg` does not auto-enable TLS from the URL. */
function stripSslParams(url: string): string {
  try {
    const u = new URL(url.replace(/^postgresql:/i, 'http:').replace(/^postgres:/i, 'http:'));
    u.searchParams.delete('sslmode');
    u.searchParams.delete('ssl');
    const protocol = url.toLowerCase().startsWith('postgres://') ? 'postgres:' : 'postgresql:';
    return protocol + u.toString().slice(u.protocol.length);
  } catch {
    return url
      .replace(/[?&]sslmode=[^&]*/gi, '')
      .replace(/[?&]ssl=[^&]*/gi, '')
      .replace(/\?&/, '?')
      .replace(/\?$/, '');
  }
}

const useSsl = rawConnectionString ? wantsSsl(rawConnectionString) : false;
const connectionString = rawConnectionString
  ? useSsl
    ? rawConnectionString
    : stripSslParams(rawConnectionString)
  : undefined;

export const pool = new Pool({
  connectionString,
  // Explicit false disables TLS even if something else tries to enable it.
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { schema });
