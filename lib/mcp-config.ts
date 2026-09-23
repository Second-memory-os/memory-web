import path from 'path';
import { oauthIssuer, mcpResourceUrl } from '@/lib/oauth/config';

export type BuildMcpConfigInput = {
  userId: string;
  memoryServerRoot?: string;
  nodeBin?: string;
  mcpPublicUrl?: string;
  mcpPath?: string;
  /** Live Cloudflare tunnel to this user's Mac Local Core (preferred for Claude). */
  localTunnelUrl?: string;
};

export function resolveNodeBin(nodeBin?: string): string {
  return nodeBin || process.env.MEMORYOS_NODE_BIN || process.env.NODE_BINARY || process.execPath || 'node';
}

export function buildMcpConfig(input: BuildMcpConfigInput) {
  const memoryServerRoot = path.resolve(
    input.memoryServerRoot ||
      process.env.MEMORY_SERVER_PATH ||
      path.join(process.cwd(), '../memory-server')
  );
  const nodeBin = resolveNodeBin(input.nodeBin);
  const tsxCli = path.join(memoryServerRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const entry = path.join(memoryServerRoot, 'src', 'mcp', 'index.ts');
  const nodeDir = path.dirname(nodeBin);

  const claudeMcpConfig = {
    mcpServers: {
      memoryos: {
        command: nodeBin,
        args: [tsxCli, entry],
        cwd: memoryServerRoot,
        env: {
          USER_ID: input.userId,
          PATH: `${nodeDir}:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin`,
        },
      },
    },
  };

  const mcpPath = input.mcpPath || process.env.MCP_PATH || '/mcp';
  const tunnelBase = (input.localTunnelUrl || '').replace(/\/$/, '');
  const mcpPublicBase = (input.mcpPublicUrl || process.env.MCP_PUBLIC_URL || '').replace(/\/$/, '');

  // Local-first: Claude must hit the Mac tunnel, not a cloud Postgres API.
  const remoteMcpUrl = tunnelBase
    ? `${tunnelBase}${mcpPath.startsWith('/') ? mcpPath : `/${mcpPath}`}`
    : mcpPublicBase
      ? `${mcpPublicBase}${mcpPath.startsWith('/') ? mcpPath : `/${mcpPath}`}`
      : mcpResourceUrl();

  const remoteMcpTokenConfigured = Boolean(process.env.MCP_API_TOKEN);
  const oauthConfigured = Boolean(
    process.env.MCP_OAUTH_ISSUER || process.env.AUTH_URL || process.env.NEXTAUTH_URL
  );
  const localFirst = Boolean(tunnelBase);

  const claudeRemoteConnector = {
    name: 'MemoryOS',
    url: remoteMcpUrl || 'https://YOUR_TUNNEL.trycloudflare.com/mcp',
    auth: 'oauth',
    storage: localFirst ? 'local-sqlite-via-tunnel' : 'configured-mcp-public-url',
    note: localFirst
      ? 'Paste url into Claude → Connectors. Data stays on your Mac (SQLite); tunnel is only the door.'
      : 'Open MemoryOS.app on your Mac so a Cloudflare tunnel registers, then refresh Settings.',
  };

  const openaiMcpConfig = {
    type: 'mcp',
    server_label: 'memoryos',
    server_url: remoteMcpUrl || 'https://YOUR_TUNNEL.trycloudflare.com/mcp',
    authorization: remoteMcpTokenConfigured ? 'Bearer ••••••••' : 'Bearer YOUR_MCP_API_TOKEN',
    require_approval: 'never',
  };

  return {
    userId: input.userId,
    memoryServerRoot,
    claudeMcpJson: JSON.stringify(claudeMcpConfig, null, 2),
    claudeRemoteConnectorJson: JSON.stringify(claudeRemoteConnector, null, 2),
    openaiMcpJson: JSON.stringify(openaiMcpConfig, null, 2),
    remoteMcpUrl,
    remoteMcpTokenConfigured,
    oauthIssuer: oauthIssuer(),
    oauthConfigured,
    localFirst,
    localTunnelUrl: tunnelBase,
  };
}

export function buildMcpTestCommands(opts: {
  userId: string;
  memoryServerRoot: string;
  nodeBin: string;
  remoteMcpUrl: string;
  includeToken?: boolean;
}) {
  const tsxCli = path.join(opts.memoryServerRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const entry = path.join(opts.memoryServerRoot, 'src', 'mcp', 'index.ts');
  const token = opts.includeToken ? process.env.MCP_API_TOKEN || 'YOUR_MCP_API_TOKEN' : 'YOUR_MCP_API_TOKEN';
  const url = opts.remoteMcpUrl || 'http://localhost:3002/mcp';
  const issuer =
    process.env.MCP_OAUTH_ISSUER ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000';

  return [
    `# Local-first: these hit your Mac via Cloudflare tunnel`,
    `curl -s ${url.replace(/\/mcp$/, '')}/health`,
    `curl -s ${url}/info`,
    `curl -s ${issuer}/.well-known/oauth-authorization-server`,
    ``,
    `# Optional legacy shared-token smoke:`,
    `curl -s -X POST ${url} -H 'Authorization: Bearer ${token}' -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}',`,
    ``,
    `# Same-Mac Claude Desktop stdio:`,
    `USER_ID=${opts.userId} ${opts.nodeBin} ${tsxCli} ${entry}`,
  ].join('\n');
}
