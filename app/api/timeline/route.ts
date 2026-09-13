import { NextRequest, NextResponse } from 'next/server';
import { proxyToMemoryServer } from '@/lib/server-api';

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get('range') || 'month';
  const limit = request.nextUrl.searchParams.get('limit') || '50';
  const qs = new URLSearchParams({ range, limit });

  const upstream = await proxyToMemoryServer(`/timeline?${qs.toString()}`, {
    method: 'GET',
  });

  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}
