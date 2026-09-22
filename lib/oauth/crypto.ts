import { createHash, randomBytes } from 'crypto';

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function sha256Base64Url(value: string): string {
  return createHash('sha256').update(value).digest('base64url');
}

export function hashToken(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Verify PKCE S256: BASE64URL(SHA256(code_verifier)) === code_challenge */
export function verifyPkceS256(codeVerifier: string, codeChallenge: string): boolean {
  if (!codeVerifier || !codeChallenge) return false;
  return sha256Base64Url(codeVerifier) === codeChallenge;
}
