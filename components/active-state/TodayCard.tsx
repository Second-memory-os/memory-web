export type TodayItem = {
  id: string;
  text: string;
  reason: 'due-today' | 'overdue' | 'stale' | 'repeated' | 'recent';
};

const REASON: Record<TodayItem['reason'], string> = {
  'due-today': 'Due today',
  overdue: 'Overdue',
  stale: 'Quiet for 3 days',
  repeated: 'Mentioned again',
  recent: 'New',
};

export default function TodayCard({ items }: { items: TodayItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today</p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900">
        {items.length === 0
          ? 'Nothing is waiting on you'
          : `${items.length} ${items.length === 1 ? 'thing needs' : 'things need'} your attention`}
      </h2>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-slate-900">→ {item.text}</span>
              <span className="shrink-0 text-xs text-slate-500">{REASON[item.reason]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Commitments and open loops will land here.</p>
      )}
    </section>
  );
}
