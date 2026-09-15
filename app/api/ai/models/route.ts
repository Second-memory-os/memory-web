import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { userConnections } from '@/lib/db/schema';
import { decrypt } from '@/lib/crypto';
import { ensureUserConnectionsSchema } from '@/lib/db/ensure-user-connections';
import { detectAiProvider, fetchProviderModels, isSelfHostedProvider } from '@/lib/ai-models';

/**
 * List models available to the signed-in user's saved AI key.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureUserConnectionsSchema();
    const userId = session.user.id;
    const [connection] = await db
      .select()
      .from(userConnections)
      .where(eq(userConnections.userId, userId))
      .limit(1);

    const selfHosted = isSelfHostedProvider(connection?.aiProvider);

    if (!connection?.openaiKeyEncrypted && !(selfHosted && connection?.aiBaseUrl)) {
      return NextResponse.json(
        { error: 'Save an API key, or an Ollama / custom endpoint, first' },
        { status: 400 }
      );
    }

    let apiKey = '';
    if (connection.openaiKeyEncrypted) {
      try {
        apiKey = decrypt(connection.openaiKeyEncrypted, userId);
      } catch {
        return NextResponse.json({ error: 'Could not decrypt API key' }, { status: 500 });
      }
    }

    const provider = detectAiProvider(apiKey, connection.aiProvider);
    const models = await fetchProviderModels(apiKey, provider, connection.aiBaseUrl);
    return NextResponse.json({
      provider,
      models,
      chat: models.filter((m) => m.isChat),
      vision: models.filter((m) => m.isVision),
      embedding: models.filter((m) => m.isEmbedding),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list models';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
