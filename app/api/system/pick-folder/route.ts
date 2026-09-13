import { NextResponse } from 'next/server';
import { proxyToMemoryServer } from '@/lib/server-api';

export async function POST() {
  const upstream = await proxyToMemoryServer('/api/system/pick-folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });

  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}
