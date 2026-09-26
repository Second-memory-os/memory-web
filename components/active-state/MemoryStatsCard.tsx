export type MemoryStats = {
  memories: number;
  people: number;
  projects: number;
  openLoops: number;
};

export default function MemoryStatsCard({ stats }: { stats: MemoryStats }) {
  const rows = [
    [stats.memories, stats.memories === 1 ? 'memory' : 'memories'],
    [stats.people, stats.people === 1 ? 'person' : 'people'],
    [stats.projects, stats.projects === 1 ? 'active project' : 'active projects'],
    [stats.openLoops, stats.openLoops === 1 ? 'open loop' : 'open loops'],
  ] as const;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Memory</p>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        {rows.map(([value, label]) => (
          <div key={label}>
            <dt className="text-2xl font-semibold text-slate-900">{value.toLocaleString()}</dt>
            <dd className="text-sm text-slate-500">{label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
