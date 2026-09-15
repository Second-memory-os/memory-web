import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/**
 * Lightweight production diagnostic (no secrets).
 * GET /api/health/db
 */
export async function GET() {
  const raw = process.env.DATABASE_URL?.trim() || '';
  let host = '';
  let isLocalhost = false;
  try {
    // postgres URLs aren't always valid URL() without rewriting
    const normalized = raw.replace(/^postgresql:/, 'http:').replace(/^postgres:/, 'http:');
    const u = new URL(normalized);
    host = u.hostname;
    isLocalhost = host === 'localhost' || host === '127.0.0.1';
  } catch {
    host = raw ? '(unparseable)' : '(missing)';
  }

  const checks = {
    hasDatabaseUrl: Boolean(raw),
    host,
    isLocalhost,
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    hasEncryptionKey: Boolean(process.env.ENCRYPTION_KEY),
    encryptionKeyLength: process.env.ENCRYPTION_KEY?.length ?? 0,
    authUrl: process.env.AUTH_URL || process.env.NEXTAUTH_URL || null,
  };

  if (!raw || isLocalhost) {
    return NextResponse.json(
      {
        ok: false,
        error: isLocalhost
          ? 'DATABASE_URL points at localhost — Vercel cannot reach it. Use Neon/Supabase/Dokploy Postgres.'
          : 'DATABASE_URL is missing on this deployment.',
        checks,
      },
      { status: 503 }
    );
  }

  try {
    const { ensureUserConnectionsSchema } = await import('@/lib/db/ensure-user-connections');
    await ensureUserConnectionsSchema();

    const result = await pool.query(
      `SELECT current_database() AS db,
              EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'users'
              ) AS has_users,
              EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'user_connections'
                  AND column_name = 'local_tunnel_url'
              ) AS has_tunnel_col`
    );
    const row = result.rows[0] || {};
    return NextResponse.json({
      ok: true,
      checks,
      db: row.db,
      hasUsersTable: Boolean(row.has_users),
      hasTunnelColumn: Boolean(row.has_tunnel_col),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Database connection failed',
        checks,
      },
      { status: 503 }
    );
  }
}
