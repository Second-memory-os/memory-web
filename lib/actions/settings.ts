'use server';

import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { userConnections } from '@/lib/db/schema';
import { encrypt, decrypt } from '@/lib/crypto';
import { getManagedMemoryDatabaseUrl } from '@/lib/memory-provisioning';
import { ensureUserConnectionsSchema } from '@/lib/db/ensure-user-connections';
import {
  DEFAULT_MODELS_BY_PROVIDER,
  detectAiProvider,
  isOpenAiChatModel,
  isOpenAiVisionModel,
  isSelfHostedProvider,
  isValidAiKey,
  modelsListUrl,
  normalizeBaseUrl,
  providerLabel,
  resolveAiModels,
  type AiProvider,
} from '@/lib/ai-models';

const postgresUrlSchema = z
  .string()
  .min(1, 'PostgreSQL URL is required')
  .refine(
    (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
    'URL must start with postgresql:// or postgres://'
  );

const aiKeySchema = z
  .string()
  .min(1, 'AI API key is required')
  .refine(
    (key) =>
      key.startsWith('sk-or-') ||
      (key.startsWith('sk-') && !key.startsWith('sk-or-')) ||
      key.startsWith('nvapi-'),
    'Key must start with sk-or- (OpenRouter), sk- (OpenAI), or nvapi- (NVIDIA)'
  );

export type SettingsActionState = {
  error?: string;
  success?: string;
  verified?: boolean;
};

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export async function getSettingsState() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  await ensureUserConnectionsSchema();

  const userId = session.user.id;
  const [connection] = await db
    .select()
    .from(userConnections)
    .where(eq(userConnections.userId, userId))
    .limit(1);

  let postgresUrl = '';
  let hasOpenaiKey = false;
  const managedUrl = getManagedMemoryDatabaseUrl();

  if (connection?.postgresUrlEncrypted) {
    try {
      postgresUrl = decrypt(connection.postgresUrlEncrypted, userId);
    } catch {
      postgresUrl = '';
    }
  }

  let aiProvider: AiProvider | null = (connection?.aiProvider as AiProvider | null) ?? null;
  if (connection?.openaiKeyEncrypted) {
    hasOpenaiKey = true;
    try {
      const raw = decrypt(connection.openaiKeyEncrypted, userId);
      aiProvider = aiProvider || detectAiProvider(raw);
    } catch {
      aiProvider = null;
    }
  }

  const usingManaged =
    Boolean(managedUrl) && Boolean(postgresUrl) && postgresUrl === managedUrl;

  const models = resolveAiModels(
    {
      chatModel: connection?.chatModel,
      visionModel: connection?.visionModel,
      embeddingModel: connection?.embeddingModel,
    },
    aiProvider || 'openrouter'
  );

  return {
    userId,
    email: session.user.email ?? '',
    postgresUrl: usingManaged ? '' : postgresUrl,
    usingManaged,
    managedAvailable: Boolean(managedUrl),
    connectionVerified: connection?.connectionVerified ?? false,
    hasOpenaiKey,
    aiProvider,
    aiBaseUrl: connection?.aiBaseUrl ?? '',
    chatModel: models.chatModel,
    visionModel: models.visionModel,
    embeddingModel: models.embeddingModel,
  };
}

export async function testPostgresConnection(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    await requireUserId();
    const parsed = postgresUrlSchema.safeParse(formData.get('postgresUrl'));
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Invalid PostgreSQL URL' };
    }

    const pool = new Pool({
      connectionString: parsed.data,
      max: 1,
      connectionTimeoutMillis: 8000,
      ssl: parsed.data.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    });

    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      await pool.end();
      return { success: 'Connection successful', verified: true };
    } catch (error) {
      await pool.end().catch(() => undefined);
      const message = error instanceof Error ? error.message : 'Connection failed';
      return { error: `Connection failed: ${message}`, verified: false };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unauthorized' };
  }
}

export async function savePostgresConnection(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    const userId = await requireUserId();
    const parsed = postgresUrlSchema.safeParse(formData.get('postgresUrl'));
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Invalid PostgreSQL URL' };
    }

    const pool = new Pool({
      connectionString: parsed.data,
      max: 1,
      connectionTimeoutMillis: 8000,
      ssl: parsed.data.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    });

    let verified = false;
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      verified = true;
      await pool.end();
    } catch (error) {
      await pool.end().catch(() => undefined);
      const message = error instanceof Error ? error.message : 'Connection failed';
      return { error: `Cannot save — connection failed: ${message}`, verified: false };
    }

    const encrypted = encrypt(parsed.data, userId);
    const [existing] = await db
      .select({ id: userConnections.id })
      .from(userConnections)
      .where(eq(userConnections.userId, userId))
      .limit(1);

    if (existing) {
      await db
        .update(userConnections)
        .set({
          postgresUrlEncrypted: encrypted,
          connectionVerified: verified,
          updatedAt: new Date(),
        })
        .where(eq(userConnections.userId, userId));
    } else {
      await db.insert(userConnections).values({
        userId,
        postgresUrlEncrypted: encrypted,
        connectionVerified: verified,
      });
    }

    return { success: 'PostgreSQL connection saved', verified: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to save connection' };
  }
}

export async function useManagedPostgres(
  _prev: SettingsActionState,
  _formData: FormData
): Promise<SettingsActionState> {
  try {
    const userId = await requireUserId();
    const managedUrl = getManagedMemoryDatabaseUrl();
    if (!managedUrl) {
      return { error: 'MemoryOS Postgres is not configured on this deployment' };
    }

    const encrypted = encrypt(managedUrl, userId);
    const [existing] = await db
      .select({ id: userConnections.id })
      .from(userConnections)
      .where(eq(userConnections.userId, userId))
      .limit(1);

    if (existing) {
      await db
        .update(userConnections)
        .set({
          postgresUrlEncrypted: encrypted,
          connectionVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(userConnections.userId, userId));
    } else {
      await db.insert(userConnections).values({
        userId,
        postgresUrlEncrypted: encrypted,
        connectionVerified: true,
      });
    }

    return { success: 'Switched to MemoryOS-hosted Postgres', verified: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to switch database' };
  }
}

export async function saveOpenaiKey(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    await ensureUserConnectionsSchema();
    const userId = await requireUserId();
    const rawKey = String(formData.get('openaiKey') ?? '').trim();
    const providerHint = String(formData.get('aiProvider') ?? '').trim() as AiProvider;
    const selfHosted = isSelfHostedProvider(providerHint);
    const defaults = DEFAULT_MODELS_BY_PROVIDER[providerHint] || DEFAULT_MODELS_BY_PROVIDER.openrouter;
    let chatModel = String(formData.get('chatModel') ?? '').trim();
    let visionModel = String(formData.get('visionModel') ?? '').trim();
    // Fixed per hosted provider so stored vectors stay comparable; only a
    // self-hosted user picks this, since we cannot know what they installed.
    let embeddingModel = selfHosted
      ? String(formData.get('embeddingModel') ?? '').trim() || defaults.embeddingModel
      : defaults.embeddingModel;

    let resolvedProvider: AiProvider = providerHint || 'openrouter';

    const baseUrl = selfHosted
      ? normalizeBaseUrl(String(formData.get('aiBaseUrl') ?? ''), resolvedProvider)
      : null;

    if (!chatModel) {
      return { error: 'Choose a chat model before saving. MemoryOS does not pick a default paid model.' };
    }
    if (!visionModel) {
      return { error: 'Choose a vision model before saving. MemoryOS does not pick a default paid model.' };
    }

    if (selfHosted) {
      if (!baseUrl) {
        return { error: 'Endpoint URL is required for a self-hosted provider' };
      }
      if (!embeddingModel) {
        return { error: 'Enter the embedding model name as it appears on your endpoint' };
      }
    }

    if (resolvedProvider === 'openai' && !isOpenAiChatModel(chatModel)) {
      return {
        error: `"${chatModel}" is not a chat model. Pick a model like gpt-4o-mini (not *-instruct or completion models).`,
      };
    }

    if (resolvedProvider === 'openai' && !isOpenAiVisionModel(visionModel)) {
      return {
        error: `"${visionModel}" cannot read screenshots. Pick a vision model like gpt-4o-mini (not plain gpt-4).`,
      };
    }

    ({ chatModel, visionModel, embeddingModel } = resolveAiModels(
      { chatModel, visionModel, embeddingModel },
      resolvedProvider
    ));

    let apiKeyToSave: string | null = null;

    if (selfHosted) {
      // Reaching the endpoint is the credential; a key is only forwarded when
      // the user's gateway asks for one.
      const probe = await fetch(`${baseUrl}/models`, {
        headers: rawKey && rawKey !== '••••••••' ? { Authorization: `Bearer ${rawKey}` } : {},
      }).catch(() => null);

      if (!probe?.ok) {
        return {
          error: `Could not reach ${baseUrl}. Check that the server is running and the URL is correct.`,
        };
      }

      if (rawKey && rawKey !== '••••••••') {
        apiKeyToSave = rawKey;
      }
    } else if (!rawKey || rawKey === '••••••••') {
      const [existing] = await db
        .select({ openaiKeyEncrypted: userConnections.openaiKeyEncrypted, aiProvider: userConnections.aiProvider })
        .from(userConnections)
        .where(eq(userConnections.userId, userId))
        .limit(1);

      if (!existing?.openaiKeyEncrypted) {
        return { error: 'AI API key is required' };
      }
      if (existing.aiProvider) {
        resolvedProvider = existing.aiProvider as AiProvider;
      }
    } else {
      if (!isValidAiKey(rawKey, providerHint)) {
        return {
          error:
            providerHint === 'nvidia'
              ? 'NVIDIA key must start with nvapi-'
              : providerHint === 'openrouter'
                ? 'OpenRouter key must start with sk-or-'
                : 'OpenAI key must start with sk- (not sk-or-)',
        };
      }

      const parsed = aiKeySchema.safeParse(rawKey);
      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? 'Invalid AI API key' };
      }

      resolvedProvider = detectAiProvider(parsed.data, providerHint);
      const probeUrl = modelsListUrl(resolvedProvider);

      const probe = await fetch(probeUrl, {
        headers: {
          Authorization: `Bearer ${parsed.data}`,
          ...(resolvedProvider === 'openrouter'
            ? {
                'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:3000',
                'X-Title': process.env.OPENROUTER_APP_TITLE || 'MemoryOS',
              }
            : {}),
        },
      });

      if (!probe.ok) {
        return {
          error: `${providerLabel(resolvedProvider)} API key is invalid or unauthorized`,
        };
      }

      apiKeyToSave = parsed.data;
    }

    const [existing] = await db
      .select({ id: userConnections.id })
      .from(userConnections)
      .where(eq(userConnections.userId, userId))
      .limit(1);

    const modelPatch = {
      chatModel,
      visionModel,
      embeddingModel,
      aiProvider: resolvedProvider,
      aiBaseUrl: baseUrl,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(userConnections)
        .set({
          ...(apiKeyToSave ? { openaiKeyEncrypted: encrypt(apiKeyToSave, userId) } : {}),
          ...modelPatch,
        })
        .where(eq(userConnections.userId, userId));
    } else {
      if (!apiKeyToSave && !selfHosted) {
        return { error: 'AI API key is required' };
      }
      await db.insert(userConnections).values({
        userId,
        ...(apiKeyToSave ? { openaiKeyEncrypted: encrypt(apiKeyToSave, userId) } : {}),
        connectionVerified: false,
        ...modelPatch,
      });
    }

    return {
      success: selfHosted
        ? `${providerLabel(resolvedProvider)} endpoint and models saved`
        : apiKeyToSave
          ? `${providerLabel(resolvedProvider)} key and models saved`
          : 'AI models saved',
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to save API key' };
  }
}
