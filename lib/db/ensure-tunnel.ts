import { pool } from './index';

let ensured = false;

/** Add local-tunnel columns if missing (shared auth DB). */
export async function ensureTunnelColumns() {
  if (ensured) return;
  await pool.query(`
    ALTER TABLE user_connections ADD COLUMN IF NOT EXISTS local_tunnel_url text;
    ALTER TABLE user_connections ADD COLUMN IF NOT EXISTS local_tunnel_updated_at timestamptz;
  `);
  ensured = true;
}
