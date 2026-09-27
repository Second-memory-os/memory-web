export const MCP_CAPABILITIES = [
  'CORE',
  'GOALS',
  'PROJECTS',
  'CONTENT',
  'DECISIONS',
  'COMMITMENTS',
  'PEOPLE',
  'ACTIONS',
] as const;

export type McpCapability = (typeof MCP_CAPABILITIES)[number];
export type McpClientKey = 'chatgpt' | 'cursor' | 'claude' | 'unknown';

export const DEFAULT_GRANTS: Record<McpClientKey, McpCapability[]> = {
  chatgpt: ['CORE', 'GOALS', 'PROJECTS', 'CONTENT'],
  cursor: ['CORE', 'GOALS', 'PROJECTS', 'DECISIONS'],
  claude: ['CORE', 'GOALS', 'PROJECTS', 'CONTENT', 'DECISIONS'],
  unknown: ['CORE'],
};

export const CAPABILITY_LABELS: Record<McpCapability, string> = {
  CORE: 'Today, next actions, open loops, and due commitments',
  GOALS: 'Goals and goal context',
  PROJECTS: 'Projects and project memory',
  CONTENT: 'Content ideas',
  DECISIONS: 'Decisions for a project or goal',
  COMMITMENTS: 'Project and person commitments',
  PEOPLE: 'People directory',
  ACTIONS: 'Create and update tasks, notes, goals, and decisions',
};

export function resolveClientKey(...parts: Array<string | null | undefined>): McpClientKey {
  const blob = parts.filter((part): part is string => Boolean(part && part.trim())).join(' ').toLowerCase();
  if (/\bcursor\b/.test(blob) || blob.includes('cursor.com') || blob.includes('cursor.sh')) return 'cursor';
  if (/\bchatgpt\b/.test(blob) || blob.includes('openai') || blob.includes('chatgpt.com')) return 'chatgpt';
  if (/\bclaude\b/.test(blob) || blob.includes('anthropic') || blob.includes('claude.ai')) return 'claude';
  return 'unknown';
}

export function scopeFromCapabilities(capabilities: readonly string[]): string {
  const allowed = new Set(MCP_CAPABILITIES);
  const scopes = capabilities
    .map((item) => item.trim().toUpperCase())
    .filter((item): item is McpCapability => allowed.has(item as McpCapability))
    .map((item) => `mcp:${item.toLowerCase()}`);
  return scopes.length ? scopes.join(' ') : 'mcp:core';
}
