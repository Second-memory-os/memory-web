import { auth } from '@/auth';
import { mintApiAccessToken } from '@/lib/api-auth';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { userConnections } from '@/lib/db/schema';
import { ensureTunnelColumns } from '@/lib/db/ensure-tunnel';

function getLocalApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';
  return url.replace(/\/$/, '');
}

function isLoopbackApi(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  } catch {
    return false;
  }
}

/**
 * Resolve where memory data lives for this user.
 * 1) Registered relay base (Dokploy) while Mac reverse tunnel is online
 * 2) Same-machine Local Core via NEXT_PUBLIC_API_URL (web+server on the Mac)
 */
export async function resolveMemoryApiBaseUrl(userId: string): Promise<{
  apiBaseUrl: string;
  viaTunnel: boolean;
  sameMachine: boolean;
  tunnelUrl: string | null;
}> {
  await ensureTunnelColumns();
  const [row] = await db
    .select({
      url: userConnections.localTunnelUrl,
      updatedAt: userConnections.localTunnelUpdatedAt,
    })
    .from(userConnections)
    .where(eq(userConnections.userId, userId))
    .limit(1);

  const tunnelUrl = row?.url?.replace(/\/$/, '') || null;
  if (tunnelUrl) {
    return { apiBaseUrl: tunnelUrl, viaTunnel: true, sameMachine: false, tunnelUrl };
  }

  const local = getLocalApiBaseUrl();
  return {
    apiBaseUrl: local,
    viaTunnel: false,
    sameMachine: isLoopbackApi(local),
    tunnelUrl: null,
  };
}

export async function getAuthenticatedApiContext() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const token = await mintApiAccessToken({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });

  const resolved = await resolveMemoryApiBaseUrl(session.user.id);

  return {
    userId: session.user.id,
    token,
    apiBaseUrl: resolved.apiBaseUrl,
    viaTunnel: resolved.viaTunnel,
    sameMachine: resolved.sameMachine,
    tunnelUrl: resolved.tunnelUrl,
  };
}

export async function proxyToMemoryServer(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const ctx = await getAuthenticatedApiContext();
  if (!ctx) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${ctx.token}`);

  try {
    return await fetch(`${ctx.apiBaseUrl}${path}`, {
      ...init,
      headers,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : undefined;
    if (ctx.viaTunnel) {
      return Response.json(
        {
          error: 'Tunnel unreachable',
          code: 'LOCAL_TUNNEL_UNREACHABLE',
          message:
            'Could not reach MemoryOS on your Mac. Open the MemoryOS app → Settings → Endpoints → “Save & restart tunnel”.',
          detail,
        },
        { status: 503 }
      );
    }
    return Response.json(
      {
        error: 'Local Core offline',
        code: 'LOCAL_CORE_UNREACHABLE',
        message:
          'Could not reach Local Core at ' +
          ctx.apiBaseUrl +
          '. Open the MemoryOS app (or start memory-server in local-core mode on port 3002).',
        detail,
      },
      { status: 503 }
    );
  }
}
