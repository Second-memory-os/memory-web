import { NextRequest, NextResponse } from 'next/server';
import { proxyToMemoryServer } from '@/lib/server-api';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await context.params;
  const upstream = await proxyToMemoryServer(
    `/api/projects/${encodeURIComponent(id)}/documents/${encodeURIComponent(docId)}`,
    {
      method: 'DELETE',
    }
  );

  const data = await upstream.json().catch(() => ({ error: 'Invalid upstream response' }));
  return NextResponse.json(data, { status: upstream.status });
}
