import { SignJWT } from 'jose';

/** Mint a JWT the memory-server API accepts (must share JWT_SECRET). */
export async function mintApiAccessToken(user: {
  id: string;
  email?: string | null;
  name?: string | null;
}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const key = new TextEncoder().encode(secret);

  return new SignJWT({
    id: user.id,
    email: user.email ?? undefined,
    name: user.name ?? undefined,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .setSubject(user.id)
    .sign(key);
}

export const DESKTOP_DEEP_LINK_SCHEME = 'memoryos';

export function buildDesktopCallbackUrl(token: string) {
  return `${DESKTOP_DEEP_LINK_SCHEME}://auth/callback?token=${encodeURIComponent(token)}`;
}
