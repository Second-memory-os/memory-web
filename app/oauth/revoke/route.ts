import { NextRequest, NextResponse } from 'next/server';
import { revokeToken } from '@/lib/oauth/store';

export const dynamic = 'force-dynamic';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';
  let token = '';

  if (contentType.includes('application/json')) {
    const json = await request.json().catch(() => ({}));
    token = String(json.token || '');
  } else {
    const form = await request.formData();
    token = String(form.get('token') || '');
  }

  if (token) {
    await revokeToken(token);
  }

  // RFC 7009 — always 200
  return new NextResponse(null, { status: 200, headers: cors });
}
