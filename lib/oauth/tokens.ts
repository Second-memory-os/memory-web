import { SignJWT } from 'jose';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  MCP_OAUTH_SCOPE,
  oauthIssuer,
} from './config';
import { resolveJwtSecret } from '@/lib/jwt-secret';

/** Mint a short-lived MCP access JWT. `aud` MUST be the MCP resource URL. */
export async function mintMcpAccessToken(input: {
  userId: string;
  email?: string | null;
  name?: string | null;
  clientId: string;
  resource: string;
  scope?: string;
}) {
  const secret = resolveJwtSecret();
  if (!secret) throw new Error('JWT_SECRET (or AUTH_SECRET) is not configured');

  const key = new TextEncoder().encode(secret);
  const scope = input.scope || MCP_OAUTH_SCOPE;

  return new SignJWT({
    id: input.userId,
    email: input.email ?? undefined,
    name: input.name ?? undefined,
    client_id: input.clientId,
    scope,
    token_use: 'mcp_access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(oauthIssuer())
    .setAudience(input.resource)
    .setSubject(input.userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(key);
}
