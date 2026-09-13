import { NextRequest, NextResponse } from 'next/server';
import { proxyToMemoryServer } from '@/lib/server-api';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const limit = request.nextUrl.searchParams.get('limit') || '20';
  const qs = `?limit=${encodeURIComponent(limit)}`;

  const upstream = await proxyToMemoryServer(
    `/api/projects/${encodeURIComponent(id)}/activities${qs}`,
    {
      method: 'GET',
    }
  );

  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}
