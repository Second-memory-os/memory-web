import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import path from 'path';
import { getSettingsState } from '@/lib/actions/settings';
import { ensureManagedMemoryConnection } from '@/lib/memory-provisioning';
import { buildMcpConfig, buildMcpTestCommands, resolveNodeBin } from '@/lib/mcp-config';
import AppFrame from '@/components/AppFrame';
import SettingsForms from './SettingsForms';

function resolveNodeBinLegacy() {
  return resolveNodeBin();
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  await ensureManagedMemoryConnection(session.user.id);

  const settings = await getSettingsState();
  if (!settings) {
    redirect('/login');
  }

  const memoryServerRoot =
    process.env.MEMORY_SERVER_PATH ||
    path.resolve(process.cwd(), '../memory-server');

  const nodeBin = resolveNodeBinLegacy();
  const mcpBuilt = buildMcpConfig({
    userId: settings.userId,
    memoryServerRoot,
    nodeBin,
    localTunnelUrl: settings.localTunnelUrl,
  });
  const mcpConfigJson = mcpBuilt.claudeMcpJson;
  const remoteMcpUrl = mcpBuilt.remoteMcpUrl;
  const remoteMcpTokenConfigured = mcpBuilt.remoteMcpTokenConfigured;
  const openaiMcpJson = mcpBuilt.openaiMcpJson;
  const claudeRemoteConnectorJson = mcpBuilt.claudeRemoteConnectorJson;
  const oauthIssuer = mcpBuilt.oauthIssuer;
  const oauthConfigured = mcpBuilt.oauthConfigured;
  const localFirst = mcpBuilt.localFirst;

  const remoteMcpToken = process.env.MCP_API_TOKEN || '';

  const mcpTestCommands = buildMcpTestCommands({
    userId: settings.userId,
    memoryServerRoot,
    nodeBin,
    remoteMcpUrl,
    includeToken: Boolean(remoteMcpToken),
  });

  return (
    <AppFrame current="settings" userEmail={session.user?.email}>
        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight">Settings</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--mkt-muted)]">
            Database, model, and the apps allowed to read your memory.
          </p>
        </div>

        <SettingsForms
          userId={settings.userId}
          postgresUrl={settings.postgresUrl}
          usingManaged={settings.usingManaged}
          managedAvailable={settings.managedAvailable}
          connectionVerified={settings.connectionVerified}
          hasOpenaiKey={settings.hasOpenaiKey}
          aiProvider={settings.aiProvider}
          aiBaseUrl={settings.aiBaseUrl}
          chatModel={settings.chatModel}
          visionModel={settings.visionModel}
          embeddingModel={settings.embeddingModel}
          mcpConfigJson={mcpConfigJson}
          mcpTestCommands={mcpTestCommands}
          memoryServerRoot={memoryServerRoot}
          remoteMcpUrl={remoteMcpUrl}
          remoteMcpToken={remoteMcpToken}
          remoteMcpTokenConfigured={remoteMcpTokenConfigured}
          openaiMcpJson={openaiMcpJson}
          claudeRemoteConnectorJson={claudeRemoteConnectorJson}
          oauthIssuer={oauthIssuer}
          oauthConfigured={oauthConfigured}
          localFirst={localFirst}
          webAppUrl={process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
        />
    </AppFrame>
  );
}
