'use client';

import { useActionState, useCallback, useEffect, useState } from 'react';
import {
  saveOpenaiKey,
  type SettingsActionState,
} from '@/lib/actions/settings';
import {
  DEFAULT_OLLAMA_BASE_URL,
  isOpenAiChatModel,
  isOpenAiVisionModel,
  isSelfHostedProvider,
  type AiProvider,
} from '@/lib/ai-models';

const initialState: SettingsActionState = {};

type ModelOption = {
  id: string;
  name: string;
  isVision: boolean;
  isEmbedding: boolean;
  isChat: boolean;
};

type Props = {
  userId: string;
  postgresUrl: string;
  usingManaged: boolean;
  managedAvailable: boolean;
  connectionVerified: boolean;
  hasOpenaiKey: boolean;
  aiProvider: AiProvider | null;
  aiBaseUrl: string;
  chatModel: string;
  visionModel: string;
  embeddingModel: string;
  mcpConfigJson: string;
  mcpTestCommands: string;
  memoryServerRoot: string;
  remoteMcpUrl: string;
  remoteMcpToken: string;
  remoteMcpTokenConfigured: boolean;
  openaiMcpJson: string;
  webAppUrl: string;
};

function StatusBanner({ state }: { state: SettingsActionState }) {
  if (state.error) {
    return (
      <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        {state.success}
      </p>
    );
  }
  return null;
}

function CodeBlock({
  title,
  value,
  copyKey,
  copiedKey,
  onCopy,
}: {
  title: string;
  value: string;
  copyKey: string;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <button
          type="button"
          onClick={() => onCopy(copyKey, value)}
          className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
        >
          {copiedKey === copyKey ? 'Copied' : 'Copy JSON'}
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
        <pre className="overflow-x-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-slate-900">
          {value}
        </pre>
      </div>
    </div>
  );
}

/**
 * Free-text model name with suggestions. Self-hosted catalogs are open-ended,
 * so the user must be able to type a tag we have never seen.
 */
function ModelTextInput({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: ModelOption[];
  placeholder: string;
}) {
  return (
    <>
      <input
        id={id}
        name={name}
        type="text"
        list={`${id}-options`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-900 bg-white font-mono"
      />
      <datalist id={`${id}-options`}>
        {options.map((m) => (
          <option key={m.id} value={m.id} />
        ))}
      </datalist>
    </>
  );
}

export default function SettingsForms({
  userId,
  postgresUrl,
  usingManaged,
  managedAvailable,
  connectionVerified,
  hasOpenaiKey,
  aiProvider,
  aiBaseUrl: initialBaseUrl,
  chatModel: initialChatModel,
  visionModel: initialVisionModel,
  embeddingModel: initialEmbeddingModel,
  mcpConfigJson,
  mcpTestCommands,
  memoryServerRoot,
  remoteMcpUrl,
  remoteMcpToken,
  remoteMcpTokenConfigured,
  openaiMcpJson,
  webAppUrl,
}: Props) {
  const [openaiKey, setOpenaiKey] = useState(hasOpenaiKey ? '••••••••' : '');
  const [provider, setProvider] = useState<AiProvider>(aiProvider ?? 'openrouter');
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [chatModel, setChatModel] = useState(initialChatModel);
  const [visionModel, setVisionModel] = useState(initialVisionModel);
  const [embeddingModel, setEmbeddingModel] = useState(initialEmbeddingModel);
  const selfHosted = isSelfHostedProvider(provider);
  // Self-hosted endpoints stand in for a key, so configuration is complete
  // without one.
  const aiConfigured = hasOpenaiKey || (selfHosted && Boolean(initialBaseUrl));
  const [models, setModels] = useState<ModelOption[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  const [saveAiState, saveAiAction, saveAiPending] = useActionState(saveOpenaiKey, initialState);

  const loadModels = useCallback(async () => {
    if (!aiConfigured && (!openaiKey || openaiKey === '••••••••')) {
      setModels([]);
      return;
    }
    setModelsLoading(true);
    setModelsError(null);
    try {
      const res = await fetch('/api/ai/models', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setModelsError(data.error || 'Could not load models');
        setModels([]);
        return;
      }
      setModels(Array.isArray(data.models) ? data.models : []);
    } catch (err) {
      setModelsError(err instanceof Error ? err.message : 'Could not load models');
      setModels([]);
    } finally {
      setModelsLoading(false);
    }
  }, [aiConfigured, openaiKey]);

  useEffect(() => {
    if (aiConfigured) {
      void loadModels();
    }
  }, [aiConfigured, loadModels, provider]);

  useEffect(() => {
    if (saveAiState.success) {
      void loadModels();
    }
  }, [saveAiState.success, loadModels]);

  const copyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const authHeader = remoteMcpToken ? `Bearer ${remoteMcpToken}` : 'Bearer YOUR_MCP_API_TOKEN';

  const chatOptions = models.filter((m) => m.isChat);
  const visionOptions = models.filter((m) => m.isVision);
  const embeddingOptions = models.filter((m) => m.isEmbedding);

  function ensureSelected(list: ModelOption[], selected: string, kind: 'chat' | 'vision' | 'embedding') {
    if (!selected) return list;
    if (list.some((m) => m.id === selected)) return list;
    if (aiProvider === 'openai' && kind === 'chat' && !isOpenAiChatModel(selected)) {
      return list;
    }
    return [
      {
        id: selected,
        name: selected,
        isChat: kind === 'chat',
        isVision: kind === 'vision',
        isEmbedding: kind === 'embedding',
      },
      ...list,
    ];
  }

  return (
    <div className="space-y-6 text-slate-900">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Memory database</h2>
            <p className="text-slate-600 mt-1">
              All memories and embeddings live in the public schema of your Postgres database,
              isolated by user. Auth users stay in the same <code className="rounded bg-slate-100 px-1 text-slate-900">public</code> schema.
            </p>
          </div>
          <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            public schema
          </span>
        </div>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5">
          <li>
            Default path:{' '}
            <code className="rounded bg-slate-100 px-1 text-[11px] text-slate-900">
              ~/Library/Application Support/MemoryOS/memory.sqlite
            </code>
          </li>
          <li>
            Override with{' '}
            <code className="rounded bg-slate-100 px-1 text-slate-900">MEMORY_SQLITE_PATH</code> in
            memory-server/.env
          </li>
          <li>Deleting the Mac app/server means no remote memory DB retains your content</li>
        </ul>
        {(usingManaged || postgresUrl) && (
          <p className="mt-3 text-xs text-slate-500">
            Legacy Postgres URL fields are ignored for memories. Auth login may still use a local
            Postgres auth database.
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">AI Configuration</h2>
        <p className="text-slate-600 mb-4">
          Add your own provider key, or point MemoryOS at a model you run yourself with Ollama or
          any OpenAI-compatible endpoint. It is used for summaries, vision, audio, and entity
          extraction. Hosted providers use a fixed embedding model so stored memories stay
          searchable; for your own endpoint you pick the embedding model.
        </p>

        <form action={saveAiAction} className="space-y-4">
          <input type="hidden" name="aiProvider" value={provider} />
          <div>
            <label htmlFor="aiProvider" className="block text-sm font-medium text-slate-700 mb-2">
              AI provider
            </label>
            <select
              id="aiProvider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as AiProvider)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-900 bg-white"
            >
              <option value="openrouter">OpenRouter</option>
              <option value="openai">OpenAI</option>
              <option value="nvidia">NVIDIA NIM</option>
              <option value="ollama">Ollama — a model you run yourself</option>
              <option value="custom">Custom endpoint — any OpenAI-compatible URL</option>
            </select>
          </div>

          {selfHosted && (
            <div>
              <label htmlFor="aiBaseUrl" className="block text-sm font-medium text-slate-700 mb-2">
                Endpoint URL
              </label>
              <input
                id="aiBaseUrl"
                name="aiBaseUrl"
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={provider === 'ollama' ? DEFAULT_OLLAMA_BASE_URL : 'https://my-gateway.example.com/v1'}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono text-sm text-slate-900 bg-white"
              />
              <p className="text-xs text-slate-500 mt-1">
                {provider === 'ollama'
                  ? `Leave blank to use ${DEFAULT_OLLAMA_BASE_URL}. Run "ollama serve" first, and note that the server must be able to reach this address.`
                  : 'Any OpenAI-compatible endpoint: vLLM, LM Studio, LiteLLM, Together, or your own gateway.'}
              </p>
            </div>
          )}
          <div>
            <label htmlFor="openaiKey" className="block text-sm font-medium text-slate-700 mb-2">
              {selfHosted
                ? 'API key (optional)'
                : provider === 'openrouter'
                  ? 'OpenRouter API Key'
                  : provider === 'nvidia'
                    ? 'NVIDIA API Key'
                    : 'OpenAI API Key'}
            </label>
            <input
              id="openaiKey"
              name="openaiKey"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder={
                selfHosted
                  ? 'Only if your endpoint requires one'
                  : provider === 'openrouter'
                    ? 'sk-or-...'
                    : provider === 'nvidia'
                      ? 'nvapi-...'
                      : 'sk-...'
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono text-sm text-slate-900 bg-white"
            />
            {hasOpenaiKey && (
              <p className="text-xs text-slate-500 mt-1">
                A key is already saved
                {aiProvider ? ` (${aiProvider})` : ''}. Enter a new key to replace it, or leave
                masked and save to keep it.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Models</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {selfHosted
                    ? 'Loaded from your endpoint once it is saved'
                    : `Loaded from your ${
                        provider === 'openrouter'
                          ? 'OpenRouter'
                          : provider === 'nvidia'
                            ? 'NVIDIA'
                            : 'OpenAI'
                      } key`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadModels()}
                disabled={modelsLoading || !aiConfigured}
                className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                {modelsLoading ? 'Loading…' : 'Refresh models'}
              </button>
            </div>

            {modelsError && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {modelsError}
                {!aiConfigured
                  ? selfHosted
                    ? ' Save your endpoint first, then refresh.'
                    : ' Save your API key first, then refresh.'
                  : ''}
              </p>
            )}

            <div>
              <label htmlFor="chatModel" className="block text-sm font-medium text-slate-700 mb-2">
                Chat / merge model (required)
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Must support chat completions. MemoryOS does not auto-select a paid model.
              </p>
              {selfHosted ? (
                <ModelTextInput
                  id="chatModel"
                  name="chatModel"
                  value={chatModel}
                  onChange={setChatModel}
                  options={chatOptions}
                  placeholder="llama3.2"
                />
              ) : (
                <select
                  id="chatModel"
                  name="chatModel"
                  value={chatModel}
                  onChange={(e) => setChatModel(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-900 bg-white font-mono"
                >
                  <option value="">Select a chat model…</option>
                  {ensureSelected(chatOptions, chatModel, 'chat').map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="visionModel" className="block text-sm font-medium text-slate-700 mb-2">
                Vision model (macOS capture, required)
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Must support image input for screen capture. No silent gpt-4o-mini fallback.
              </p>
              {selfHosted ? (
                <ModelTextInput
                  id="visionModel"
                  name="visionModel"
                  value={visionModel}
                  onChange={setVisionModel}
                  options={visionOptions.length ? visionOptions : chatOptions}
                  placeholder="llama3.2-vision"
                />
              ) : (
                <select
                  id="visionModel"
                  name="visionModel"
                  value={visionModel}
                  onChange={(e) => setVisionModel(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-900 bg-white font-mono"
                >
                  <option value="">Select a vision model…</option>
                  {ensureSelected(
                    visionOptions.length ? visionOptions : chatOptions,
                    visionModel,
                    'vision'
                  ).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selfHosted ? (
              <div>
                <label
                  htmlFor="embeddingModel"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Embedding model (search)
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Name it exactly as your endpoint exposes it, e.g.{' '}
                  <code className="text-[11px]">nomic-embed-text</code>. Changing this later makes
                  existing memories unsearchable until you re-embed them.
                </p>
                <ModelTextInput
                  id="embeddingModel"
                  name="embeddingModel"
                  value={embeddingModel}
                  onChange={setEmbeddingModel}
                  options={embeddingOptions}
                  placeholder="nomic-embed-text"
                />
              </div>
            ) : (
              <div>
                <p className="block text-sm font-medium text-slate-700 mb-1">
                  Embedding model (search)
                </p>
                <p className="text-xs text-slate-600">
                  Fixed at <code className="text-[11px]">{embeddingModel}</code>. Changing it would
                  make existing memories unsearchable, so it is not configurable here.
                </p>
              </div>
            )}
          </div>

          <StatusBanner state={saveAiState} />

          <button
            type="submit"
            disabled={saveAiPending}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            {saveAiPending ? 'Saving…' : 'Save AI key & models'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">macOS Menu Bar</h2>
        <p className="text-slate-600 mb-3">
          Install MemoryOS Desktop to capture active-window context. Sign-in opens this site, then
          returns via <code className="rounded bg-slate-100 px-1 text-slate-900">memoryos://</code>.
        </p>
        <a
          href="/downloads/MemoryOS.dmg"
          download
          className="mb-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/memoryos-icon.png" alt="" width={20} height={20} className="rounded-md" />
          Download MemoryOS for Mac
        </a>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>Default capture every 5s with smart update-in-place sessions</li>
          <li>Grant Screen Recording and Accessibility when prompted</li>
          <li>Save a provider key above to enable vision summaries</li>
          <li>
            Web app URL:{' '}
            <code className="rounded bg-slate-100 px-1 text-slate-900">{webAppUrl}</code>
          </li>
        </ul>
      </div>

      <div id="mcp-configuration" className="bg-white rounded-lg border border-slate-200 p-6 scroll-mt-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">MCP Configuration</h2>
        <p className="text-slate-600 mb-4">
          MemoryOS MCP v2 uses two lanes: <strong>timeline</strong> (macOS capture) and{' '}
          <strong>agent</strong> (Claude/ChatGPT/Perplexity tabs). Cross-agent bridge example:
          in ChatGPT call{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">get_agent_context</code> with{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">platform: &quot;claude&quot;</code> and
          your tab title — e.g. &quot;Founders Summit planning&quot;.
        </p>

        <div className="mb-6 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950">
          <p className="font-semibold">Dual-lane tools (v2)</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <code>save_timeline_memory</code> / <code>get_timeline</code> — life/work capture only
            </li>
            <li>
              <code>save_agent_context</code> / <code>get_agent_context</code> — AI chat by tab title
            </li>
            <li>
              <code>get_context</code> — unified router (timeline_today, agent_tab, hybrid)
            </li>
            <li>
              Legacy names (<code>save_memory</code>, <code>timeline</code>) still work as deprecated aliases
            </li>
          </ul>
        </div>

        <p className="text-slate-600 mb-4">
          Local stdio for Claude Desktop / Cursor. Remote Streamable HTTP for OpenAI / ChatGPT.
          User ID:{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-900">{userId}</code>
        </p>

        <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          <p className="font-semibold text-sky-950">OpenAI / ChatGPT (remote MCP over tunnel)</p>
          <p className="mt-2 text-sky-950">
            Claude/ChatGPT reach <strong>this Mac only</strong> via an HTTPS tunnel to localhost:3001.
            Tool calls read/write the public Postgres schema — memory rows are isolated by your user id.
          </p>
          <p className="mt-2 text-sky-950">
            <span className="font-medium">Server URL:</span>{' '}
            <code className="rounded bg-white border border-sky-200 px-1.5 py-0.5 text-slate-900 break-all">
              {remoteMcpUrl || '(set MCP_PUBLIC_URL to your ngrok/Cloudflare tunnel)'}
            </code>
          </p>
          <p className="mt-2 text-sky-950">
            <span className="font-medium">Auth header:</span>{' '}
            <code className="rounded bg-white border border-sky-200 px-1.5 py-0.5 text-slate-900 break-all">
              Authorization: {showToken ? authHeader : 'Bearer ••••••••'}
            </code>
            {remoteMcpTokenConfigured ? (
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="ml-2 text-xs underline underline-offset-2"
              >
                {showToken ? 'Hide token' : 'Show token'}
              </button>
            ) : (
              <span className="ml-2 text-amber-800">(MCP_API_TOKEN missing in env)</span>
            )}
          </p>
          <p className="mt-3 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sky-950">
            Opening <code className="text-slate-900">/mcp</code> in a browser will always say
            Unauthorized. That endpoint is not a webpage — OpenAI must send the Bearer token. Use{' '}
            <code className="text-slate-900">/mcp/info</code> to check the server without auth.
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sky-950">
            <li>
              Run <code className="text-slate-900">memory-server</code> on this Mac (port 3001)
            </li>
            <li>
              Expose it with ngrok or Cloudflare Tunnel, set{' '}
              <code className="text-slate-900">MCP_PUBLIC_URL</code>
            </li>
            <li>Restart memory-server, then paste the OpenAI JSON below</li>
          </ol>

          <CodeBlock
            title="OpenAI MCP tool JSON"
            value={openaiMcpJson}
            copyKey="openai"
            copiedKey={copiedKey}
            onCopy={copyText}
          />
        </div>

        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">Claude Desktop setup (local)</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              Open Claude Desktop → <strong>Settings → Developer → Edit Config</strong>
            </li>
            <li>Merge the Claude JSON below under top-level <code>mcpServers</code></li>
            <li>Fully quit Claude Desktop (Cmd+Q), then reopen</li>
          </ol>
          <p className="mt-2">
            Config path:{' '}
            <code className="rounded bg-white border border-amber-200 px-1 text-slate-900">
              ~/Library/Application Support/Claude/claude_desktop_config.json
            </code>
          </p>
        </div>

        <p className="mb-2 text-sm text-slate-700">
          Processing runs inline on memory-server (Redis/worker optional). Keep{' '}
          <code className="rounded bg-slate-100 px-1 text-slate-900">pnpm dev</code> running in{' '}
          <code className="rounded bg-slate-100 px-1 text-slate-900">{memoryServerRoot}</code>.
        </p>

        <CodeBlock
          title="Claude Desktop / Cursor MCP JSON"
          value={mcpConfigJson}
          copyKey="claude"
          copiedKey={copiedKey}
          onCopy={copyText}
        />

        <CodeBlock
          title="Manual smoke-test commands"
          value={mcpTestCommands}
          copyKey="smoke"
          copiedKey={copiedKey}
          onCopy={copyText}
        />
      </div>
    </div>
  );
}
