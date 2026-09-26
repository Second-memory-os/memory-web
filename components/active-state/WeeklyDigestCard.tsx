export default function WeeklyDigestCard({
  digest,
}: {
  digest: { completed: string[]; needsAttention: string[]; patterns: string[] } | null;
}) {
  if (!digest) return null;
  const empty = digest.completed.length + digest.needsAttention.length + digest.patterns.length === 0;
  if (empty) return null;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">This week</p>
      {digest.completed.length > 0 ? (
        <div className="mt-3">
          <p className="text-sm font-medium text-slate-900">Completed</p>
          <ul className="mt-1 space-y-1 text-sm text-slate-600">
            {digest.completed.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {digest.needsAttention.length > 0 ? (
        <div className="mt-3">
          <p className="text-sm font-medium text-slate-900">Needs attention</p>
          <ul className="mt-1 space-y-1 text-sm text-slate-600">
            {digest.needsAttention.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {digest.patterns.length > 0 ? (
        <div className="mt-3">
          <p className="text-sm font-medium text-slate-900">Patterns noticed</p>
          <ul className="mt-1 space-y-1 text-sm text-slate-600">
            {digest.patterns.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
