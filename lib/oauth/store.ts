import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { oauthAuthorizationCodes, oauthRefreshTokens, users } from '@/lib/db/schema';
import { ensureOauthTables } from '@/lib/db/ensure-oauth';
import {
  AUTH_CODE_TTL_SECONDS,
  MCP_OAUTH_SCOPE,
  REFRESH_TOKEN_TTL_SECONDS,
  mcpResourceUrl,
} from './config';
import { hashToken, randomToken, verifyPkceS256 } from './crypto';
import { mintMcpAccessToken } from './tokens';
import { OAuthError, clientAllowsRedirect, getClient } from './clients';
import { ACCESS_TOKEN_TTL_SECONDS } from './config';

export type AuthorizeParams = {
  response_type: string;
  client_id: string;
  redirect_uri: string;
  state?: string;
  code_challenge: string;
  code_challenge_method?: string;
  scope?: string;
  resource?: string;
};

export function parseAuthorizeParams(searchParams: URLSearchParams): AuthorizeParams {
  return {
    response_type: searchParams.get('response_type') || '',
    client_id: searchParams.get('client_id') || '',
    redirect_uri: searchParams.get('redirect_uri') || '',
    state: searchParams.get('state') || undefined,
    code_challenge: searchParams.get('code_challenge') || '',
    code_challenge_method: searchParams.get('code_challenge_method') || 'S256',
    scope: searchParams.get('scope') || MCP_OAUTH_SCOPE,
    resource: searchParams.get('resource') || undefined,
  };
}

export async function validateAuthorizeRequest(params: AuthorizeParams) {
  if (params.response_type !== 'code') {
    throw new OAuthError('unsupported_response_type', 'Only response_type=code is supported');
  }
  if (!params.client_id) {
    throw new OAuthError('invalid_request', 'client_id is required');
  }
  if (!params.redirect_uri) {
    throw new OAuthError('invalid_request', 'redirect_uri is required');
  }
  if (!params.code_challenge) {
    throw new OAuthError('invalid_request', 'code_challenge is required (PKCE)');
  }
  if ((params.code_challenge_method || 'S256') !== 'S256') {
    throw new OAuthError('invalid_request', 'Only code_challenge_method=S256 is supported');
  }

  const client = await getClient(params.client_id);
  if (!client) {
    throw new OAuthError('invalid_client', 'Unknown client_id');
  }
  if (!clientAllowsRedirect(client, params.redirect_uri)) {
    throw new OAuthError('invalid_request', 'redirect_uri does not match registered client');
  }

  const resource = normalizeResource(params.resource || mcpResourceUrl());
  if (!isAllowedMcpResource(resource)) {
    throw new OAuthError(
      'invalid_target',
      'resource must be your MemoryOS MCP URL (Cloudflare tunnel …/mcp or configured MCP_PUBLIC_URL)'
    );
  }

  return { client, resource, scope: params.scope || MCP_OAUTH_SCOPE };
}

/** Static cloud URL, quick tunnel, or named tunnel hostname (local-first). */
export function isAllowedMcpResource(resource: string): boolean {
  const normalized = normalizeResource(resource);
  const configured = normalizeResource(mcpResourceUrl());
  if (process.env.MCP_PUBLIC_URL && normalized === configured) {
    return true;
  }

  try {
    const u = new URL(normalized);
    if (u.protocol !== 'https:') return false;
    const path = u.pathname.replace(/\/$/, '') || '/';
    if (path !== '/mcp') return false;
    if (
      u.hostname.endsWith('.trycloudflare.com') ||
      u.hostname.endsWith('.cfargotunnel.com') ||
      Boolean(process.env.TUNNEL_HOST_SUFFIX && u.hostname.endsWith(process.env.TUNNEL_HOST_SUFFIX))
    ) {
      return true;
    }
    // Named tunnel on a custom domain (e.g. https://mcp.example.com/mcp)
    return u.hostname.includes('.') && !u.hostname.endsWith('.local');
  } catch {
    return false;
  }
}

/** Prefer the user's live Mac tunnel when present. */
export async function resolveUserMcpResource(userId: string): Promise<string | null> {
  const { userConnections } = await import('@/lib/db/schema');
  const { ensureTunnelColumns } = await import('@/lib/db/ensure-tunnel');
  await ensureTunnelColumns();
  const [row] = await db
    .select({ url: userConnections.localTunnelUrl })
    .from(userConnections)
    .where(eq(userConnections.userId, userId))
    .limit(1);
  const tunnel = row?.url?.replace(/\/$/, '');
  if (!tunnel) return null;
  return `${tunnel}/mcp`;
}

export async function assertResourceForUser(userId: string, resource: string) {
  const normalized = normalizeResource(resource);
  if (!isAllowedMcpResource(normalized)) {
    throw new OAuthError('invalid_target', 'Invalid MCP resource URL');
  }

  // Quick tunnels rotate; named tunnels use a fixed hostname. Sync whatever Claude connected with.
  try {
    const u = new URL(normalized);
    const isTunnelHost =
      u.hostname.endsWith('.trycloudflare.com') ||
      u.hostname.endsWith('.cfargotunnel.com') ||
      Boolean(process.env.TUNNEL_HOST_SUFFIX && u.hostname.endsWith(process.env.TUNNEL_HOST_SUFFIX)) ||
      (u.hostname.includes('.') && !u.hostname.endsWith('.local'));
    if (isTunnelHost) {
      const { userConnections } = await import('@/lib/db/schema');
      const { ensureTunnelColumns } = await import('@/lib/db/ensure-tunnel');
      await ensureTunnelColumns();
      const tunnelBase = `${u.protocol}//${u.host}`;
      const [existing] = await db
        .select({ id: userConnections.id })
        .from(userConnections)
        .where(eq(userConnections.userId, userId))
        .limit(1);
      if (existing) {
        await db
          .update(userConnections)
          .set({
            localTunnelUrl: tunnelBase,
            localTunnelUpdatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userConnections.userId, userId));
      } else {
        await db.insert(userConnections).values({
          userId,
          localTunnelUrl: tunnelBase,
          localTunnelUpdatedAt: new Date(),
        });
      }
    }
  } catch {
    /* non-fatal — auth still proceeds */
  }
}

export async function issueAuthorizationCode(input: {
  clientId: string;
  userId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  resource: string;
  scope: string;
}) {
  await ensureOauthTables();
  const code = randomToken(32);
  const expiresAt = new Date(Date.now() + AUTH_CODE_TTL_SECONDS * 1000);

  await db.insert(oauthAuthorizationCodes).values({
    code,
    clientId: input.clientId,
    userId: input.userId,
    redirectUri: input.redirectUri,
    codeChallenge: input.codeChallenge,
    codeChallengeMethod: input.codeChallengeMethod || 'S256',
    resource: input.resource,
    scope: input.scope,
    expiresAt,
  });

  return code;
}

export async function exchangeAuthorizationCode(input: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
  resource?: string;
}) {
  await ensureOauthTables();

  const [row] = await db
    .select()
    .from(oauthAuthorizationCodes)
    .where(eq(oauthAuthorizationCodes.code, input.code))
    .limit(1);

  if (!row || row.usedAt) {
    throw new OAuthError('invalid_grant', 'Invalid or used authorization code');
  }
  if (row.expiresAt.getTime() < Date.now()) {
    throw new OAuthError('invalid_grant', 'Authorization code expired');
  }
  if (row.clientId !== input.clientId) {
    throw new OAuthError('invalid_grant', 'client_id mismatch');
  }
  if (row.redirectUri !== input.redirectUri) {
    throw new OAuthError('invalid_grant', 'redirect_uri mismatch');
  }
  if (!verifyPkceS256(input.codeVerifier, row.codeChallenge)) {
    throw new OAuthError('invalid_grant', 'PKCE verification failed');
  }

  const resource = normalizeResource(input.resource || row.resource);
  if (resource !== normalizeResource(row.resource)) {
    throw new OAuthError('invalid_target', 'resource mismatch');
  }

  await db
    .update(oauthAuthorizationCodes)
    .set({ usedAt: new Date() })
    .where(eq(oauthAuthorizationCodes.id, row.id));

  return issueTokenPair({
    userId: row.userId,
    clientId: row.clientId,
    resource: row.resource,
    scope: row.scope,
  });
}

export async function exchangeRefreshToken(input: {
  refreshToken: string;
  clientId: string;
  resource?: string;
}) {
  await ensureOauthTables();
  const tokenHash = hashToken(input.refreshToken);

  const [row] = await db
    .select()
    .from(oauthRefreshTokens)
    .where(
      and(
        eq(oauthRefreshTokens.tokenHash, tokenHash),
        isNull(oauthRefreshTokens.revokedAt)
      )
    )
    .limit(1);

  if (!row) {
    throw new OAuthError('invalid_grant', 'Invalid refresh token');
  }
  if (row.expiresAt.getTime() < Date.now()) {
    throw new OAuthError('invalid_grant', 'Refresh token expired');
  }
  if (row.clientId !== input.clientId) {
    throw new OAuthError('invalid_grant', 'client_id mismatch');
  }

  const resource = normalizeResource(input.resource || row.resource);
  if (resource !== normalizeResource(row.resource)) {
    throw new OAuthError('invalid_target', 'resource mismatch');
  }

  // Rotate refresh token
  await db
    .update(oauthRefreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(oauthRefreshTokens.id, row.id));

  return issueTokenPair({
    userId: row.userId,
    clientId: row.clientId,
    resource: row.resource,
    scope: row.scope,
  });
}

export async function revokeToken(token: string) {
  await ensureOauthTables();
  const tokenHash = hashToken(token);
  await db
    .update(oauthRefreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(oauthRefreshTokens.tokenHash, tokenHash));
}

async function issueTokenPair(input: {
  userId: string;
  clientId: string;
  resource: string;
  scope: string;
}) {
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);

  if (!user) {
    throw new OAuthError('invalid_grant', 'User no longer exists', 400);
  }

  const accessToken = await mintMcpAccessToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    clientId: input.clientId,
    resource: input.resource,
    scope: input.scope,
  });

  const refreshToken = randomToken(48);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

  await db.insert(oauthRefreshTokens).values({
    tokenHash: hashToken(refreshToken),
    clientId: input.clientId,
    userId: user.id,
    resource: input.resource,
    scope: input.scope,
    expiresAt,
  });

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    refresh_token: refreshToken,
    scope: input.scope,
  };
}

function normalizeResource(url: string): string {
  return url.replace(/\/$/, '');
}

export function buildAuthorizeRedirect(
  redirectUri: string,
  params: Record<string, string | undefined>
): string {
  const u = new URL(redirectUri);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) u.searchParams.set(k, v);
  }
  return u.toString();
}
