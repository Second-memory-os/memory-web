import { NextRequest, NextResponse } from 'next/server';
import { proxyToMemoryServer } from '@/lib/server-api';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const upstream = await proxyToMemoryServer('/memory/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}
