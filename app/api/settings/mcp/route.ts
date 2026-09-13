import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildMcpConfig } from '@/lib/mcp-config';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * MCP config for macOS menu bar (Claude JSON copyable; token reveal stays web-only).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  let userId: string | null = null;

  if (bearer) {
    try {
      const { jwtVerify } = await import('jose');
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET missing');
      const { payload } = await jwtVerify(bearer, new TextEncoder().encode(secret));
      userId = (payload.id as string) || (payload.sub as string) || null;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: corsHeaders });
    }
  } else {
    const session = await auth();
    userId = session?.user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const config = buildMcpConfig({ userId });

  return NextResponse.json(config, { headers: corsHeaders });
}
