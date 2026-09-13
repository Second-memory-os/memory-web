import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { desktopLoginSessions } from '@/lib/db/schema';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session');
  if (!sessionId) {
    return NextResponse.json(
      { error: 'session is required' },
      { status: 400, headers: corsHeaders }
    );
  }

  const [row] = await db
    .select()
    .from(desktopLoginSessions)
    .where(
      and(
        eq(desktopLoginSessions.id, sessionId),
        eq(desktopLoginSessions.consumed, false),
        gt(desktopLoginSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!row) {
    return NextResponse.json({ pending: true }, { headers: corsHeaders });
  }

  await db
    .update(desktopLoginSessions)
    .set({ consumed: true })
    .where(eq(desktopLoginSessions.id, sessionId));

  return NextResponse.json(
    {
      pending: false,
      token: row.token,
      userId: row.userId,
    },
    { headers: corsHeaders }
  );
}
