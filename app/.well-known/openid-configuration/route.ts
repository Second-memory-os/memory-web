import { NextRequest, NextResponse } from 'next/server';
import { authorizationServerMetadata } from '@/lib/oauth/config';

export const dynamic = 'force-dynamic';

/**
 * Some MCP clients also probe OpenID discovery.
 * Point them at the same MemoryOS OAuth AS metadata.
 */
export async function GET(_request: NextRequest) {
  const meta = authorizationServerMetadata();
  return NextResponse.json(
    {
      ...meta,
      // Minimal OIDC-compatible aliases (we are not a full OIDC provider).
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['HS256'],
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
