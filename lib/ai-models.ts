export type AiProvider = 'openrouter' | 'openai' | 'nvidia' | 'ollama' | 'custom';

/** Providers the user runs themselves, reached over a base URL instead of a key. */
export const SELF_HOSTED_PROVIDERS = ['ollama', 'custom'] as const;

export function isSelfHostedProvider(provider: string | null | undefined): boolean {
  return (SELF_HOSTED_PROVIDERS as readonly string[]).includes((provider || '').trim());
}

export const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434/v1';

/**
 * Embeddings use one fixed model per hosted provider and are not user-selectable,
 * so every stored vector stays comparable. Self-hosted endpoints are the
 * exception: the user picks whichever embedding model they pulled. Mirrors
 * FIXED_EMBEDDING_MODELS in memory-server/src/services/ai/embedding-models.ts.
 */
export const FIXED_EMBEDDING_MODELS: Record<AiProvider, string> = {
  openai: 'text-embedding-3-small',
  openrouter: 'openai/text-embedding-3-small',
  nvidia: 'nvidia/nv-embedqa-e5-v5',
  ollama: 'nomic-embed-text',
  custom: '',
};

/** Normalizes a user-entered endpoint to an OpenAI-compatible `/v1` root. */
export function normalizeBaseUrl(raw: string, provider: AiProvider): string {
  const trimmed = (raw || '').trim().replace(/\/+$/, '');
  if (!trimmed) return provider === 'ollama' ? DEFAULT_OLLAMA_BASE_URL : '';
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  return /\/v\d+$/.test(withScheme) ? withScheme : `${withScheme}/v1`;
}

export type AiModelPrefs = {
  chatModel: string;
  visionModel: string;
  embeddingModel: string;
};

export const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';
export const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
export const OPENAI_API_BASE = 'https://api.openai.com/v1';

export const DEFAULT_MODELS_BY_PROVIDER: Record<AiProvider, AiModelPrefs> = {
  openrouter: {
    chatModel: 'openai/gpt-4o-mini',
    visionModel: 'openai/gpt-4o-mini',
    embeddingModel: FIXED_EMBEDDING_MODELS.openrouter,
  },
  openai: {
    chatModel: 'gpt-4o-mini',
    visionModel: 'gpt-4o-mini',
    embeddingModel: FIXED_EMBEDDING_MODELS.openai,
  },
  nvidia: {
    chatModel: 'meta/llama-3.1-8b-instruct',
    visionModel: 'nvidia/llama-3.2-11b-vision-instruct',
    embeddingModel: FIXED_EMBEDDING_MODELS.nvidia,
  },
  ollama: {
    chatModel: 'llama3.2',
    visionModel: 'llama3.2-vision',
    embeddingModel: FIXED_EMBEDDING_MODELS.ollama,
  },
  custom: {
    chatModel: '',
    visionModel: '',
    embeddingModel: '',
  },
};

/** @deprecated use DEFAULT_MODELS_BY_PROVIDER */
export const DEFAULT_AI_MODELS = DEFAULT_MODELS_BY_PROVIDER.openrouter;

export type ProviderModel = {
  id: string;
  name: string;
  contextLength?: number;
  pricing?: { prompt?: string; completion?: string };
  isVision: boolean;
  isEmbedding: boolean;
  isChat: boolean;
};

/** @deprecated alias */
export type OpenRouterModel = ProviderModel;

type RawModel = {
  id?: string;
  name?: string;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
  architecture?: {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
  };
};

export function detectAiProvider(apiKey: string, hint?: string | null): AiProvider {
  const h = (hint || '').trim().toLowerCase();
  if (h === 'ollama') return 'ollama';
  if (h === 'custom') return 'custom';
  if (h === 'nvidia' || apiKey.startsWith('nvapi-')) return 'nvidia';
  if (h === 'openrouter' || apiKey.startsWith('sk-or-')) return 'openrouter';
  if (h === 'openai') return 'openai';
  return 'openai';
}

export function providerLabel(provider: AiProvider): string {
  switch (provider) {
    case 'openrouter':
      return 'OpenRouter';
    case 'nvidia':
      return 'NVIDIA';
    case 'ollama':
      return 'Ollama';
    case 'custom':
      return 'Custom endpoint';
    default:
      return 'OpenAI';
  }
}

export function providerBaseUrl(provider: AiProvider, customBaseUrl?: string | null): string {
  if (isSelfHostedProvider(provider)) {
    return normalizeBaseUrl(customBaseUrl || '', provider);
  }
  switch (provider) {
    case 'nvidia':
      return process.env.NVIDIA_API_BASE || NVIDIA_API_BASE;
    case 'openrouter':
      return process.env.OPENROUTER_BASE_URL || OPENROUTER_API_BASE;
    default:
      return OPENAI_API_BASE;
  }
}

export function modelsListUrl(provider: AiProvider, customBaseUrl?: string | null): string {
  return `${providerBaseUrl(provider, customBaseUrl).replace(/\/$/, '')}/models`;
}

export function classifyOpenRouterModel(raw: RawModel): ProviderModel | null {
  const id = (raw.id || '').trim();
  if (!id) return null;

  const input = raw.architecture?.input_modalities || [];
  const output = raw.architecture?.output_modalities || [];
  const modality = (raw.architecture?.modality || '').toLowerCase();
  const idLower = id.toLowerCase();

  const isEmbedding =
    idLower.includes('embedding') ||
    idLower.includes('embed') ||
    output.includes('embeddings') ||
    modality.includes('embed');

  const isVision =
    input.includes('image') ||
    modality.includes('image') ||
    idLower.includes('vision') ||
    idLower.includes('gpt-4o') ||
    idLower.includes('gemini') ||
    idLower.includes('claude-3') ||
    idLower.includes('claude-4') ||
    idLower.includes('llama-3.2') ||
    idLower.includes('vlm');

  const isChat =
    !isEmbedding &&
    (output.includes('text') || modality.includes('->text') || !output.length);

  return {
    id,
    name: raw.name || id,
    contextLength: raw.context_length,
    pricing: raw.pricing,
    isVision: isVision && !isEmbedding,
    isEmbedding,
    isChat,
  };
}

export function classifyNvidiaModel(raw: RawModel): ProviderModel | null {
  const id = (raw.id || '').trim();
  if (!id) return null;
  const idLower = id.toLowerCase();

  const isEmbedding =
    idLower.includes('embed') ||
    idLower.includes('embedding') ||
    idLower.includes('nv-embed');

  const isVision =
    !isEmbedding &&
    (idLower.includes('vision') ||
      idLower.includes('vlm') ||
      idLower.includes('llama-3.2') ||
      idLower.includes('llama-3.3') && idLower.includes('90b-vision') ||
      idLower.includes('neva') ||
      idLower.includes('vila'));

  const isChat = !isEmbedding;

  return {
    id,
    name: raw.name || id,
    isVision,
    isEmbedding,
    isChat,
  };
}

export function isOpenAiChatModel(id: string): boolean {
  const idLower = id.toLowerCase();
  if (
    idLower.includes('embedding') ||
    idLower.includes('whisper') ||
    idLower.includes('tts') ||
    idLower.includes('dall-e') ||
    idLower.includes('davinci') ||
    idLower.includes('babbage') ||
    idLower.includes('curie') ||
    idLower.includes('codex') ||
    idLower.includes('-instruct') ||
    idLower.startsWith('text-') ||
    idLower.includes('moderation') ||
    idLower.includes('realtime') ||
    idLower.includes('transcribe') ||
    idLower.includes('sora')
  ) {
    return false;
  }
  return (
    idLower.startsWith('gpt-') ||
    idLower.startsWith('o1') ||
    idLower.startsWith('o3') ||
    idLower.startsWith('o4') ||
    idLower.startsWith('chatgpt-')
  );
}

export function isOpenAiVisionModel(id: string): boolean {
  const idLower = id.toLowerCase();
  if (idLower.includes('-instruct') || idLower.includes('embedding')) return false;
  // Base gpt-4 / gpt-4-32k are text-only — they reject image_url inputs.
  if (/^gpt-4(-\d{4})?$/.test(idLower) || idLower === 'gpt-4-32k') return false;
  return (
    idLower.includes('gpt-4o') ||
    idLower.includes('gpt-4-turbo') ||
    idLower.includes('gpt-4-vision') ||
    idLower.includes('gpt-4.1')
  );
}

export function isOpenAiEmbeddingModel(id: string): boolean {
  return id.toLowerCase().includes('embedding');
}

/**
 * Self-hosted catalogs expose no capability metadata, so nothing is filtered
 * out: only embedding models are recognizable, by name.
 */
export function classifySelfHostedModel(raw: RawModel): ProviderModel | null {
  const id = (raw.id || '').trim();
  if (!id) return null;
  const idLower = id.toLowerCase();
  const isEmbedding = idLower.includes('embed');
  return {
    id,
    name: raw.name || id,
    isEmbedding,
    isVision: !isEmbedding,
    isChat: !isEmbedding,
  };
}

export function classifyOpenAiModel(raw: RawModel): ProviderModel | null {
  const id = (raw.id || '').trim();
  if (!id) return null;

  const isEmbedding = isOpenAiEmbeddingModel(id);
  const isVision = !isEmbedding && isOpenAiVisionModel(id);
  const isChat = !isEmbedding && isOpenAiChatModel(id);

  if (!isChat && !isVision && !isEmbedding) return null;

  return {
    id,
    name: id,
    isEmbedding,
    isVision,
    isChat,
  };
}

export async function fetchProviderModels(
  apiKey: string,
  providerHint?: string | null,
  customBaseUrl?: string | null
): Promise<ProviderModel[]> {
  const provider = detectAiProvider(apiKey, providerHint);
  const url = modelsListUrl(provider, customBaseUrl);
  if (!url.startsWith('http')) {
    throw new Error('Set the endpoint URL before listing models');
  }

  const res = await fetch(url, {
    headers: {
      // Self-hosted gateways usually ignore the header; sending it only when a
      // key exists keeps keyless Ollama working.
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...(provider === 'openrouter'
        ? {
            'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:3000',
            'X-Title': process.env.OPENROUTER_APP_TITLE || 'MemoryOS',
          }
        : {}),
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Failed to list ${providerLabel(provider)} models (check API key)`);
  }

  const json = (await res.json()) as { data?: RawModel[] };
  const rows = Array.isArray(json.data) ? json.data : [];

  const classify =
    provider === 'openrouter'
      ? classifyOpenRouterModel
      : provider === 'nvidia'
        ? classifyNvidiaModel
        : isSelfHostedProvider(provider)
          ? classifySelfHostedModel
          : classifyOpenAiModel;

  return rows
    .map(classify)
    .filter((m): m is ProviderModel => Boolean(m))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function resolveAiModels(
  partial?: {
    chatModel?: string | null;
    visionModel?: string | null;
    embeddingModel?: string | null;
  },
  provider: AiProvider = 'openrouter'
): AiModelPrefs {
  const defaults = DEFAULT_MODELS_BY_PROVIDER[provider];
  let chatModel = partial?.chatModel?.trim() || defaults.chatModel;
  let visionModel = partial?.visionModel?.trim() || defaults.visionModel;
  let embeddingModel = partial?.embeddingModel?.trim() || defaults.embeddingModel;

  // Self-hosted model tags are arbitrary; only the user knows what is installed.
  if (isSelfHostedProvider(provider)) {
    return { chatModel, visionModel, embeddingModel };
  }

  if (provider === 'openai') {
    if (!isOpenAiChatModel(chatModel)) chatModel = defaults.chatModel;
    if (!isOpenAiVisionModel(visionModel)) {
      visionModel = isOpenAiVisionModel(defaults.visionModel)
        ? defaults.visionModel
        : 'gpt-4o-mini';
    }
    if (!isOpenAiEmbeddingModel(embeddingModel)) embeddingModel = defaults.embeddingModel;
  }

  return { chatModel, visionModel, embeddingModel };
}

export function isValidAiKey(key: string, providerHint?: string | null): boolean {
  const p = (providerHint || '').trim().toLowerCase();
  // Self-hosted endpoints accept any token their gateway happens to require.
  if (isSelfHostedProvider(p)) return true;
  if (p === 'nvidia') return key.startsWith('nvapi-') && key.length > 10;
  if (p === 'openrouter') return key.startsWith('sk-or-') && key.length > 10;
  if (p === 'openai') return key.startsWith('sk-') && !key.startsWith('sk-or-') && key.length > 10;
  return (
    key.startsWith('sk-or-') ||
    (key.startsWith('sk-') && !key.startsWith('sk-or-')) ||
    key.startsWith('nvapi-')
  );
}
