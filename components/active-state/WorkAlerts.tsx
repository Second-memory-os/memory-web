'use client';

import Button from '@/components/ui/Button';

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
              <Button size="sm" onClick={() => onCreateTask(alert)}>
                Create task
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => onDismiss(alert.id)}>
              Dismiss
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}
