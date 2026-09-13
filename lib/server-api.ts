import { auth } from '@/auth';
import { mintApiAccessToken } from '@/lib/api-auth';

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return url.replace(/\/$/, '');
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

  return {
    userId: session.user.id,
    token,
    apiBaseUrl: getApiBaseUrl(),
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

  return fetch(`${ctx.apiBaseUrl}${path}`, {
    ...init,
    headers,
  });
}
