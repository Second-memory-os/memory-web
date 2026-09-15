import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { userConnections } from '@/lib/db/schema';
import { decrypt } from '@/lib/crypto';
import { auth } from '@/auth';
import { mintApiAccessToken } from '@/lib/api-auth';
import { ensureAiModelColumns } from '@/lib/db/ensure-ai-models';
import {
  detectAiProvider,
  providerBaseUrl,
  resolveAiModels,
  type AiProvider,
} from '@/lib/ai-models';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * Returns decrypted AI credentials for the signed-in desktop JWT user.
 * Used by the macOS agent to call OpenRouter locally for vision summaries.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  let userId: string | null = null;

  if (bearer) {
    try {
      const { jwtVerify } = await import('jose');
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET missing');
      const { payload } = await jwtVerify(bearer, new TextEncoder().encode(secret));
      userId = (payload.id as string) || (payload.sub as string) || null;
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401, headers: corsHeaders }
      );
    }
  } else {
    const session = await auth();
    userId = session?.user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: corsHeaders }
    );
  }

  await ensureAiModelColumns();

  const [connection] = await db
    .select()
    .from(userConnections)
    .where(eq(userConnections.userId, userId))
    .limit(1);

  let aiKey = '';
  let provider: AiProvider | null = null;

  if (connection?.openaiKeyEncrypted) {
    try {
      aiKey = decrypt(connection.openaiKeyEncrypted, userId);
      provider = detectAiProvider(aiKey, connection.aiProvider);
    } catch {
      aiKey = '';
    }
  }

  // A self-hosted endpoint has no key to detect the provider from.
  if (!provider && connection?.aiProvider) {
    provider = connection.aiProvider as AiProvider;
  }

  const models = resolveAiModels(
    {
      chatModel: connection?.chatModel,
      visionModel: connection?.visionModel,
      embeddingModel: connection?.embeddingModel,
    },
    provider || 'openrouter'
  );

  const token = await mintApiAccessToken({ id: userId });

  // Mac Local Core must verify JWTs minted by this web app, and may load
  // encrypted AI prefs from the shared auth DB. Memories stay in Mac SQLite.
  return NextResponse.json(
    {
      userId,
      token,
      aiKey: aiKey || null,
      provider,
      // Mac always writes/reads memory via Local Core on loopback.
      apiBaseUrl: 'http://127.0.0.1:3002',
      openRouterBaseUrl: provider
        ? providerBaseUrl(provider, connection?.aiBaseUrl)
        : 'https://openrouter.ai/api/v1',
      visionModel: models.visionModel,
      chatModel: models.chatModel,
      embeddingModel: models.embeddingModel,
      jwtSecret: process.env.JWT_SECRET || null,
      encryptionKey: process.env.ENCRYPTION_KEY || null,
      authDatabaseUrl:
        process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL || null,
      localFirst: true,
    },
    { headers: corsHeaders }
  );
}
