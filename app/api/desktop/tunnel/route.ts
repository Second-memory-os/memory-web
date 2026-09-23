import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { userConnections } from '@/lib/db/schema';
import { auth } from '@/auth';
import { ensureTunnelColumns } from '@/lib/db/ensure-tunnel';
import { ensureAiModelColumns } from '@/lib/db/ensure-ai-models';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

const TUNNEL_STALE_MS = 5 * 60 * 1000;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

async function resolveUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (bearer) {
    try {
      const { jwtVerify } = await import('jose');
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET missing');
      const { payload } = await jwtVerify(bearer, new TextEncoder().encode(secret));
      return (payload.id as string) || (payload.sub as string) || null;
    } catch {
      return null;
    }
  }

  const session = await auth();
  return session?.user?.id ?? null;
}

function isValidTunnelUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return false;
    // Quick tunnels + named Cloudflare tunnel hostnames (custom domain or *.cfargotunnel.com)
    if (
      u.hostname.endsWith('.trycloudflare.com') ||
      u.hostname.endsWith('.cfargotunnel.com')
    ) {
      return true;
    }
    if (process.env.TUNNEL_HOST_SUFFIX && u.hostname.endsWith(process.env.TUNNEL_HOST_SUFFIX)) {
      return true;
    }
    // Named tunnel with user-owned domain (e.g. mcp.example.com) — authenticated Mac app only.
    return u.hostname.includes('.') && !u.hostname.endsWith('.local');
  } catch {
    return false;
  }
}

async function ensureConnectionRow(userId: string) {
  await ensureAiModelColumns();
  await ensureTunnelColumns();
  const [existing] = await db
    .select({ id: userConnections.id })
    .from(userConnections)
    .where(eq(userConnections.userId, userId))
    .limit(1);
  if (!existing) {
    await db.insert(userConnections).values({ userId });
  }
}

/** Mac app registers its public relay base (Dokploy MCP_PUBLIC_URL) when the reverse tunnel is up. */
export async function POST(request: NextRequest) {
  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders });
  }

  const url = (body.url || '').trim().replace(/\/$/, '');
  if (!url || !isValidTunnelUrl(url)) {
    return NextResponse.json(
      { error: 'url must be an https host (Dokploy MCP_PUBLIC_URL or tunnel)' },
      { status: 400, headers: corsHeaders }
    );
  }

  await ensureConnectionRow(userId);
  await db
    .update(userConnections)
    .set({
      localTunnelUrl: url,
      localTunnelUpdatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userConnections.userId, userId));

  return NextResponse.json({ ok: true, url }, { headers: corsHeaders });
}

/** Clear tunnel when Mac app quits or tunnel dies. */
export async function DELETE(request: NextRequest) {
  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  await ensureTunnelColumns();
  await db
    .update(userConnections)
    .set({
      localTunnelUrl: null,
      localTunnelUpdatedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(userConnections.userId, userId));

  return NextResponse.json({ ok: true }, { headers: corsHeaders });
}

/** Web UI / proxy: tunnel registration + live health of Mac Local Core. */
export async function GET(request: NextRequest) {
  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  await ensureTunnelColumns();
  const [row] = await db
    .select({
      url: userConnections.localTunnelUrl,
      updatedAt: userConnections.localTunnelUpdatedAt,
    })
    .from(userConnections)
    .where(eq(userConnections.userId, userId))
    .limit(1);

  const url = row?.url || null;
  const updatedAt = row?.updatedAt ? new Date(row.updatedAt).toISOString() : null;
  const ageMs = row?.updatedAt ? Date.now() - new Date(row.updatedAt).getTime() : null;
  const stale = ageMs != null ? ageMs > TUNNEL_STALE_MS : true;

  let healthy = false;
  let engine: string | undefined;
  let mode: string | undefined;
  let pathHint: string | undefined;
  let error: string | undefined;
  let agentOnline: boolean | undefined;

  if (url) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const authHeader = request.headers.get('authorization') || '';

      // Preferred: reverse-tunnel agent presence on Dokploy memory-server.
      const statusRes = await fetch(`${url}/tunnel/v1/status`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: authHeader ? { Authorization: authHeader } : {},
      });
      if (statusRes.ok) {
        const status = (await statusRes.json()) as { online?: boolean; relay?: boolean };
        if (status.relay) {
          agentOnline = Boolean(status.online);
          healthy = Boolean(status.online);
          mode = status.online ? 'local-core-via-tunnel' : 'relay-waiting';
          engine = 'sqlite';
          if (!status.online) {
            error = 'Mac agent offline — open MemoryOS and stay signed in';
          }
          clearTimeout(timeout);
        }
      }

      if (agentOnline === undefined) {
        const res = await fetch(`${url}/health`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data = (await res.json()) as {
            storage?: { engine?: string; mode?: string; pathHint?: string; path?: string };
          };
          healthy = true;
          engine = data.storage?.engine;
          mode = data.storage?.mode;
          pathHint = data.storage?.pathHint || data.storage?.path;
        } else {
          error = `HTTP ${res.status}`;
        }
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Tunnel unreachable';
    }
  } else {
    error = 'No tunnel registered — open MemoryOS on your Mac';
  }

  return NextResponse.json(
    {
      url,
      updatedAt,
      stale,
      healthy,
      agentOnline,
      engine,
      mode,
      pathHint,
      error: healthy ? undefined : error,
      localFirst: true,
    },
    { headers: corsHeaders }
  );
}
