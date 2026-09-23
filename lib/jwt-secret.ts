/** Shared JWT secret for API + MCP OAuth (Vercel and Dokploy must match). */
export function resolveJwtSecret(): string {
  const secret =
    process.env.JWT_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    '';
  return secret;
}
