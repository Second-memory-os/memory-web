import { NextRequest, NextResponse } from 'next/server';
import { proxyToMemoryServer } from '@/lib/server-api';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const upstream = await proxyToMemoryServer(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'GET',
  });

  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const upstream = await proxyToMemoryServer(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const upstream = await proxyToMemoryServer(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}
