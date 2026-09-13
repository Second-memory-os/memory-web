import { NextRequest, NextResponse } from 'next/server';
import { proxyToMemoryServer } from '@/lib/server-api';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const upstream = await proxyToMemoryServer('/memory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}
