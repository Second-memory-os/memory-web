import { NextResponse } from 'next/server';
import { proxyToMemoryServer } from '@/lib/server-api';

export async function GET() {
  const upstream = await proxyToMemoryServer('/graph', { method: 'GET' });
  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}
