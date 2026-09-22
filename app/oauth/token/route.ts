import { NextRequest, NextResponse } from 'next/server';
import { OAuthError } from '@/lib/oauth/clients';
import {
  exchangeAuthorizationCode,
  exchangeRefreshToken,
} from '@/lib/oauth/store';

export const dynamic = 'force-dynamic';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

/** OAuth token endpoint — authorization_code + refresh_token. */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      const json = await request.json().catch(() => ({}));
      body = Object.fromEntries(
        Object.entries(json).map(([k, v]) => [k, v == null ? '' : String(v)])
      );
    } else {
      const form = await request.formData();
      form.forEach((value, key) => {
        body[key] = String(value);
      });
    }

    const grantType = body.grant_type || '';
    const clientId = body.client_id || '';

    if (!clientId) {
      throw new OAuthError('invalid_client', 'client_id is required');
    }

    if (grantType === 'authorization_code') {
      if (!body.code || !body.redirect_uri || !body.code_verifier) {
        throw new OAuthError(
          'invalid_request',
          'code, redirect_uri, and code_verifier are required'
        );
      }
      const tokens = await exchangeAuthorizationCode({
        code: body.code,
        clientId,
        redirectUri: body.redirect_uri,
        codeVerifier: body.code_verifier,
        resource: body.resource || undefined,
      });
      return NextResponse.json(tokens, { headers: { ...cors, 'Cache-Control': 'no-store' } });
    }

    if (grantType === 'refresh_token') {
      if (!body.refresh_token) {
        throw new OAuthError('invalid_request', 'refresh_token is required');
      }
      const tokens = await exchangeRefreshToken({
        refreshToken: body.refresh_token,
        clientId,
        resource: body.resource || undefined,
      });
      return NextResponse.json(tokens, { headers: { ...cors, 'Cache-Control': 'no-store' } });
    }

    throw new OAuthError('unsupported_grant_type', `Unsupported grant_type: ${grantType}`);
  } catch (error) {
    if (error instanceof OAuthError) {
      return NextResponse.json(
        { error: error.error, error_description: error.errorDescription },
        { status: error.status, headers: cors }
      );
    }
    console.error('[oauth/token]', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Token exchange failed' },
      { status: 500, headers: cors }
    );
  }
}
