import { NextResponse } from 'next/server';
import { and, eq, isNull, gt } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { oauthClients, oauthRefreshTokens } from '@/lib/db/schema';
import { proxyToMemoryServer } from '@/lib/server-api';

type Tool = 'claude' | 'chatgpt' | 'cursor';

function toolFrom(name: string | null, redirectUris: string[] | null): Tool | null {
  const blob = `${name || ''} ${(redirectUris || []).join(' ')}`.toLowerCase();
  if (blob.includes('cursor')) return 'cursor';
  if (blob.includes('claude')) return 'claude';
  if (blob.includes('chatgpt') || blob.includes('openai')) return 'chatgpt';
  return null;
}

export async function GET() {
  const session = await auth();
  const upstream = await proxyToMemoryServer('/active-state', { method: 'GET' });
  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const connections: Record<Tool, { connected: boolean; lastSync: string | null }> = {
    claude: { connected: false, lastSync: null },
    chatgpt: { connected: false, lastSync: null },
    cursor: { connected: false, lastSync: null },
  };

  if (session?.user?.id) {
    try {
      const tokens = await db
        .select({
          clientId: oauthRefreshTokens.clientId,
          createdAt: oauthRefreshTokens.createdAt,
        })
        .from(oauthRefreshTokens)
        .where(
          and(
            eq(oauthRefreshTokens.userId, session.user.id),
            isNull(oauthRefreshTokens.revokedAt),
            gt(oauthRefreshTokens.expiresAt, new Date())
          )
        );
      const clientIds = [...new Set(tokens.map((token) => token.clientId))];
      const clients = clientIds.length
        ? await db.select().from(oauthClients)
        : [];
      const byId = new Map(clients.map((client) => [client.clientId, client]));
      for (const token of tokens) {
        const client = byId.get(token.clientId);
        const tool = toolFrom(client?.clientName || token.clientId, client?.redirectUris || null);
        if (!tool) continue;
        const stamp = token.createdAt?.toISOString() || null;
        const current = connections[tool];
        if (!current.lastSync || (stamp && stamp > current.lastSync)) {
          connections[tool] = { connected: true, lastSync: stamp };
        }
      }
    } catch {
      // OAuth tables can be absent on a fresh local database.
    }
  }

  return NextResponse.json({ ...data, aiConnections: connections });
}
