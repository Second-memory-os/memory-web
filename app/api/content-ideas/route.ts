import { NextRequest, NextResponse } from 'next/server';
import { proxyToMemoryServer } from '@/lib/server-api';

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || 'idea';
  const limit = request.nextUrl.searchParams.get('limit') || '3';
  const upstream = await proxyToMemoryServer(
    `/api/content-ideas?status=${encodeURIComponent(status)}&limit=${encodeURIComponent(limit)}`,
    { method: 'GET' }
  );
  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}
