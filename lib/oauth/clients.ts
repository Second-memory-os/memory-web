import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { oauthClients } from '@/lib/db/schema';
import { ensureOauthTables } from '@/lib/db/ensure-oauth';
import { randomToken } from './crypto';

export type OauthClientRecord = {
  clientId: string;
  clientName: string | null;
  redirectUris: string[];
  tokenEndpointAuthMethod: string;
  grantTypes: string[];
  responseTypes: string[];
  source: 'dcr' | 'cimd';
};

export type RegisteredClient = {
  client_id: string;
  client_secret?: string;
  client_name?: string;
  redirect_uris: string[];
  token_endpoint_auth_method: string;
  grant_types: string[];
  response_types: string[];
  client_id_issued_at: number;
};

export async function registerClient(input: {
  client_name?: string;
  redirect_uris: string[];
  token_endpoint_auth_method?: string;
  grant_types?: string[];
  response_types?: string[];
}): Promise<RegisteredClient> {
  await ensureOauthTables();

  const redirectUris = (input.redirect_uris || []).filter(Boolean);
  if (redirectUris.length === 0) {
    throw new OAuthError('invalid_client_metadata', 'redirect_uris is required');
  }

  for (const uri of redirectUris) {
    if (!isAllowedRedirectUri(uri)) {
      throw new OAuthError('invalid_redirect_uri', `redirect_uri not allowed: ${uri}`);
    }
  }

  const authMethod = input.token_endpoint_auth_method || 'none';
  const grantTypes = input.grant_types?.length
    ? input.grant_types
    : ['authorization_code', 'refresh_token'];
  const responseTypes = input.response_types?.length ? input.response_types : ['code'];

  const clientId = `mcp_${randomToken(18)}`;
  const issuedAt = Math.floor(Date.now() / 1000);

  await db.insert(oauthClients).values({
    clientId,
    clientSecretHash: null,
    clientName: input.client_name || null,
    redirectUris,
    tokenEndpointAuthMethod: authMethod,
    grantTypes,
    responseTypes,
  });

  return {
    client_id: clientId,
    client_name: input.client_name,
    redirect_uris: redirectUris,
    token_endpoint_auth_method: authMethod,
    grant_types: grantTypes,
    response_types: responseTypes,
    client_id_issued_at: issuedAt,
  };
}

export async function getClient(clientId: string): Promise<OauthClientRecord | null> {
  await ensureOauthTables();

  const [row] = await db
    .select()
    .from(oauthClients)
    .where(eq(oauthClients.clientId, clientId))
    .limit(1);

  if (row) {
    return {
      clientId: row.clientId,
      clientName: row.clientName,
      redirectUris: row.redirectUris,
      tokenEndpointAuthMethod: row.tokenEndpointAuthMethod,
      grantTypes: row.grantTypes,
      responseTypes: row.responseTypes,
      source: 'dcr',
    };
  }

  // Claude (and MCP hosts) prefer CIMD: client_id is an HTTPS metadata URL.
  if (isCimdClientId(clientId)) {
    return fetchCimdClient(clientId);
  }

  return null;
}

function isCimdClientId(clientId: string): boolean {
  try {
    const u = new URL(clientId);
    if (u.protocol !== 'https:') return false;
    if (!u.pathname || u.pathname === '/') return false;
    if (u.hash) return false;
    if (u.username || u.password) return false;
    if (u.pathname.split('/').some((p) => p === '.' || p === '..')) return false;
    return true;
  } catch {
    return false;
  }
}

async function fetchCimdClient(clientIdUrl: string): Promise<OauthClientRecord | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    const res = await fetch(clientIdUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      redirect: 'error',
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const doc = (await res.json()) as Record<string, unknown>;
    if (String(doc.client_id || '') !== clientIdUrl) {
      throw new OAuthError(
        'invalid_client',
        'CIMD client_id must exactly match the metadata URL'
      );
    }

    const redirectUris = Array.isArray(doc.redirect_uris)
      ? doc.redirect_uris.map(String)
      : [];
    if (redirectUris.length === 0) {
      throw new OAuthError('invalid_client', 'CIMD document missing redirect_uris');
    }

    return {
      clientId: clientIdUrl,
      clientName: typeof doc.client_name === 'string' ? doc.client_name : 'Claude',
      redirectUris,
      tokenEndpointAuthMethod:
        typeof doc.token_endpoint_auth_method === 'string'
          ? doc.token_endpoint_auth_method
          : 'none',
      grantTypes: Array.isArray(doc.grant_types)
        ? doc.grant_types.map(String)
        : ['authorization_code', 'refresh_token'],
      responseTypes: Array.isArray(doc.response_types)
        ? doc.response_types.map(String)
        : ['code'],
      source: 'cimd',
    };
  } catch (error) {
    if (error instanceof OAuthError) throw error;
    console.error('[oauth] CIMD fetch failed', clientIdUrl, error);
    return null;
  }
}

export function clientAllowsRedirect(
  client: { redirectUris: string[] },
  redirectUri: string
): boolean {
  if (client.redirectUris.includes(redirectUri)) return true;

  // Port-agnostic localhost match (Claude Code / some desktop hosts).
  try {
    const requested = new URL(redirectUri);
    if (requested.hostname !== 'localhost' && requested.hostname !== '127.0.0.1') {
      return false;
    }
    return client.redirectUris.some((allowed) => {
      try {
        const a = new URL(allowed);
        return (
          (a.hostname === 'localhost' || a.hostname === '127.0.0.1') &&
          a.protocol === requested.protocol &&
          a.pathname === requested.pathname
        );
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

/** Allow https + http localhost (Claude / Cursor callbacks). */
export function isAllowedRedirectUri(uri: string): boolean {
  try {
    const u = new URL(uri);
    if (u.protocol === 'https:') return true;
    if (u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
      return true;
    }
    if (u.protocol === 'cursor:' || u.protocol === 'claude:') return true;
    return false;
  } catch {
    return false;
  }
}

export class OAuthError extends Error {
  constructor(
    public readonly error: string,
    public readonly errorDescription?: string,
    public readonly status = 400
  ) {
    super(errorDescription || error);
    this.name = 'OAuthError';
  }
}
