export type AiConnections = {
  claude: { connected: boolean; lastSync: string | null };
  chatgpt: { connected: boolean; lastSync: string | null };
  cursor: { connected: boolean; lastSync: string | null };
};

const NAMES = [
  ['claude', 'Claude'],
  ['chatgpt', 'ChatGPT'],
  ['cursor', 'Cursor'],
] as const;

function when(iso: string | null): string {
  if (!iso) return 'Not connected';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Connected';
  return `Synced ${date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
}

export default function AIConnectionsCard({ connections }: { connections: AiConnections }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI connections</p>
      <ul className="mt-3 space-y-2">
        {NAMES.map(([key, label]) => {
          const row = connections[key];
          return (
            <li key={key} className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">
                {row.connected ? '✓' : '○'} {label}
              </span>
              <span className="text-xs text-slate-500">{when(row.lastSync)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
