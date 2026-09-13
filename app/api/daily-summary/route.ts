import { NextRequest, NextResponse } from 'next/server';
import { proxyToMemoryServer } from '@/lib/server-api';

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date');
  const qs = date ? `?date=${encodeURIComponent(date)}` : '';

  const upstream = await proxyToMemoryServer(`/api/daily-summary${qs}`, {
    method: 'GET',
  });

  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}
