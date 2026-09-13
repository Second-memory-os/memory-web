import { pool } from './index';

let ensured = false;

/** Add AI model preference columns if missing (shared auth DB). */
export async function ensureAiModelColumns() {
  if (ensured) return;
  await pool.query(`
    ALTER TABLE user_connections ADD COLUMN IF NOT EXISTS chat_model text;
    ALTER TABLE user_connections ADD COLUMN IF NOT EXISTS vision_model text;
    ALTER TABLE user_connections ADD COLUMN IF NOT EXISTS embedding_model text;
    ALTER TABLE user_connections ADD COLUMN IF NOT EXISTS ai_provider text;
    ALTER TABLE user_connections ADD COLUMN IF NOT EXISTS ai_base_url text;
  `);
  ensured = true;
}
