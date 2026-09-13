import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import path from 'path';
import { getSettingsState } from '@/lib/actions/settings';
import { ensureManagedMemoryConnection } from '@/lib/memory-provisioning';
import { buildMcpConfig, buildMcpTestCommands, resolveNodeBin } from '@/lib/mcp-config';
import DashboardNav from '@/components/DashboardNav';
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
  const mcpBuilt = buildMcpConfig({ userId: settings.userId, memoryServerRoot, nodeBin });
  const mcpConfigJson = mcpBuilt.claudeMcpJson;
  const remoteMcpUrl = mcpBuilt.remoteMcpUrl;
  const remoteMcpTokenConfigured = mcpBuilt.remoteMcpTokenConfigured;
  const openaiMcpJson = mcpBuilt.openaiMcpJson;

  const remoteMcpToken = process.env.MCP_API_TOKEN || '';

  const mcpTestCommands = buildMcpTestCommands({
    userId: settings.userId,
    memoryServerRoot,
    nodeBin,
    remoteMcpUrl,
    includeToken: Boolean(remoteMcpToken),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav current="settings" userEmail={session.user?.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-2">
            Configure your memory database, AI provider, MCP, and macOS agent
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
          webAppUrl={process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
        />
      </main>
    </div>
  );
}
