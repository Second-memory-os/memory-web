import { ensureAiModelColumns } from '@/lib/db/ensure-ai-models';
import { ensureTunnelColumns } from '@/lib/db/ensure-tunnel';

/**
 * Bring `user_connections` up to date before any select that uses the full schema.
 * Missing columns (e.g. local_tunnel_url) cause Vercel dashboard 500s.
 */
export async function ensureUserConnectionsSchema() {
  await ensureAiModelColumns();
  await ensureTunnelColumns();
}
