/** Canonical public issuer for MemoryOS OAuth (Claude custom connectors). */
export function oauthIssuer(): string {
  const raw =
    process.env.MCP_OAUTH_ISSUER ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

export function mcpResourceUrl(): string {
  const base = (process.env.MCP_PUBLIC_URL || '').replace(/\/$/, '');
  const path = normalizeMcpPath(process.env.MCP_PATH || '/mcp');
  if (!base) {
    // Dev fallback: same host as web (not ideal for prod).
    return `${oauthIssuer()}${path}`;
  }
  return `${base}${path}`;
}

export function normalizeMcpPath(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  return path.replace(/\/$/, '') || '/mcp';
}

export const MCP_OAUTH_SCOPE = 'mcp:tools';
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60; // 1 hour
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const AUTH_CODE_TTL_SECONDS = 10 * 60; // 10 minutes

export function authorizationServerMetadata() {
  const issuer = oauthIssuer();
  return {
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    registration_endpoint: `${issuer}/oauth/register`,
    revocation_endpoint: `${issuer}/oauth/revoke`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none', 'client_secret_post'],
    scopes_supported: [MCP_OAUTH_SCOPE],
    resource_indicators_supported: true,
    // Required for Claude's preferred Client ID Metadata Document flow
    client_id_metadata_document_supported: true,
  };
}
