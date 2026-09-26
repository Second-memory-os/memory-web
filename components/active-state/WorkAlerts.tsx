'use client';

export type WorkAlert = {
  id: string;
  kind: 'stalled' | 'overdue' | 'stale' | 'blocked' | 'deviation';
  title: string;
  description: string;
};

export default function WorkAlerts({
  alerts,
  onCreateTask,
  onDismiss,
}: {
  alerts: WorkAlert[];
  onCreateTask: (alert: WorkAlert) => void;
  onDismiss: (id: string) => void;
}) {
  if (alerts.length === 0) return null;
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <section
          key={alert.id}
          className={`rounded-2xl border p-4 ${
            alert.kind === 'deviation'
              ? 'border-sky-200 bg-sky-50'
              : 'border-amber-200 bg-amber-50'
          }`}
        >
          <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
          <p className="mt-1 text-sm text-slate-700">{alert.description}</p>
          <div className="mt-3 flex gap-2">
            {alert.kind === 'stalled' || alert.kind === 'overdue' ? (
              <button
                type="button"
                onClick={() => onCreateTask(alert)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Create task
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onDismiss(alert.id)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white"
            >
              Dismiss
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}
