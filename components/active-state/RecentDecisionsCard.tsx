export type DecisionItem = {
  id: string;
  name: string;
  description?: string | null;
};

export default function RecentDecisionsCard({ decisions }: { decisions: DecisionItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent decisions</p>
      {decisions.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Decisions from this week will show up here.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {decisions.map((decision) => (
            <li key={decision.id} className="text-sm text-slate-900">
              <span className="font-medium">• {decision.name}</span>
              {decision.description ? (
                <span className="mt-0.5 block text-slate-500">{decision.description}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
