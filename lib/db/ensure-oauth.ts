import { pool } from './index';

let ensured = false;

/** Create OAuth AS tables used by Claude custom connectors (idempotent). */
export async function ensureOauthTables() {
  if (ensured) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS oauth_clients (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id text NOT NULL UNIQUE,
      client_secret_hash text,
      client_name text,
      redirect_uris text[] NOT NULL,
      token_endpoint_auth_method text NOT NULL DEFAULT 'none',
      grant_types text[] NOT NULL,
      response_types text[] NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code text NOT NULL UNIQUE,
      client_id text NOT NULL,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      redirect_uri text NOT NULL,
      code_challenge text NOT NULL,
      code_challenge_method text NOT NULL DEFAULT 'S256',
      resource text NOT NULL,
      scope text NOT NULL DEFAULT 'mcp:tools',
      expires_at timestamptz NOT NULL,
      used_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      token_hash text NOT NULL UNIQUE,
      client_id text NOT NULL,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      resource text NOT NULL,
      scope text NOT NULL DEFAULT 'mcp:tools',
      expires_at timestamptz NOT NULL,
      revoked_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS oauth_authorization_codes_client_idx
      ON oauth_authorization_codes (client_id);
    CREATE INDEX IF NOT EXISTS oauth_refresh_tokens_user_idx
      ON oauth_refresh_tokens (user_id);
  `);

  ensured = true;
}
