import { NextResponse } from 'next/server';
import { proxyToMemoryServer } from '@/lib/server-api';

export async function GET() {
  const upstream = await proxyToMemoryServer('/work-intelligence', { method: 'GET' });
  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const upstream = await proxyToMemoryServer('/work-intelligence/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}
