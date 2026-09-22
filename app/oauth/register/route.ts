import { NextRequest, NextResponse } from 'next/server';
import { OAuthError, registerClient } from '@/lib/oauth/clients';

export const dynamic = 'force-dynamic';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

/** RFC 7591 — Dynamic Client Registration (public clients for Claude). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const registered = await registerClient({
      client_name: typeof body.client_name === 'string' ? body.client_name : undefined,
      redirect_uris: Array.isArray(body.redirect_uris) ? body.redirect_uris.map(String) : [],
      token_endpoint_auth_method:
        typeof body.token_endpoint_auth_method === 'string'
          ? body.token_endpoint_auth_method
          : 'none',
      grant_types: Array.isArray(body.grant_types) ? body.grant_types.map(String) : undefined,
      response_types: Array.isArray(body.response_types)
        ? body.response_types.map(String)
        : undefined,
    });

    return NextResponse.json(registered, { status: 201, headers: cors });
  } catch (error) {
    if (error instanceof OAuthError) {
      return NextResponse.json(
        { error: error.error, error_description: error.errorDescription },
        { status: error.status, headers: cors }
      );
    }
    console.error('[oauth/register]', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Registration failed' },
      { status: 500, headers: cors }
    );
  }
}
