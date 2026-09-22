import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { OAuthError } from '@/lib/oauth/clients';
import {
  buildAuthorizeRedirect,
  parseAuthorizeParams,
  validateAuthorizeRequest,
} from '@/lib/oauth/store';
import { oauthIssuer } from '@/lib/oauth/config';

export const dynamic = 'force-dynamic';

/**
 * OAuth 2.1 authorization endpoint.
 * Unauthenticated users are sent to MemoryOS login, then back here, then consent.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = parseAuthorizeParams(url.searchParams);

  try {
    await validateAuthorizeRequest(params);
  } catch (error) {
    if (error instanceof OAuthError) {
      // If redirect_uri is known-valid enough, bounce error there; else JSON.
      if (params.redirect_uri && params.client_id) {
        try {
          return NextResponse.redirect(
            buildAuthorizeRedirect(params.redirect_uri, {
              error: error.error,
              error_description: error.errorDescription,
              state: params.state,
            })
          );
        } catch {
          /* fall through */
        }
      }
      return NextResponse.json(
        { error: error.error, error_description: error.errorDescription },
        { status: error.status }
      );
    }
    throw error;
  }

  const session = await auth();
  if (!session?.user?.id) {
    const login = new URL('/login', oauthIssuer());
    login.searchParams.set('callbackUrl', `${url.pathname}${url.search}`);
    return NextResponse.redirect(login);
  }

  const consent = new URL('/oauth/consent', oauthIssuer());
  for (const [key, value] of url.searchParams.entries()) {
    consent.searchParams.set(key, value);
  }
  return NextResponse.redirect(consent);
}
