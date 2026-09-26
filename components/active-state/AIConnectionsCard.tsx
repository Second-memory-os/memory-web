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
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `Synced ${months[date.getMonth()]} ${date.getDate()}`;
}

export default function AIConnectionsCard({ connections }: { connections: AiConnections }) {
  return (
    <section>
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--mkt-muted)]">AI connections</p>
      <ul className="mt-3 space-y-2">
        {NAMES.map(([key, label]) => {
          const row = connections[key];
          return (
            <li key={key} className="flex items-center justify-between text-sm">
              <span>{label}</span>
              <span className={row.connected ? 'text-[var(--mkt-accent)]' : 'text-[var(--mkt-muted)]'}>
                {row.connected ? when(row.lastSync) : 'Not connected'}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
