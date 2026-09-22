import { NextResponse } from 'next/server';
import { authorizationServerMetadata } from '@/lib/oauth/config';

export const dynamic = 'force-dynamic';

/** RFC 8414 — OAuth 2.0 Authorization Server Metadata */
export async function GET() {
  return NextResponse.json(authorizationServerMetadata(), {
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
