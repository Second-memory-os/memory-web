'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export interface DailyProjectItem {
  project: {
    id: string;
    name: string;
    slug: string;
    momentum: string;
    goal?: string;
  };
  activities: Array<{
    id: string;
    activityType: string;
    whatHappened: string;
    whatChanged?: string;
    createdAt: string;
  }>;
  decisions: string[];
  openLoops: string[];
  nextLikelyAction?: string;
}

export interface DailySummaryData {
  date: string;
  projects: DailyProjectItem[];
  totalActivities: number;
  totalDecisions: number;
  totalOpenLoops: number;
}

export default function DailyClient() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadSummary = useCallback(async (dateStr: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/daily-summary?date=${encodeURIComponent(dateStr)}`);
      if (!res.ok) throw new Error(`Failed to load daily summary (${res.status})`);
      const data = await res.json();
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || 'Could not load summary');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary(selectedDate);
  }, [selectedDate, loadSummary]);

  const changeDateOffset = (offsetDays: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const copyToClipboard = () => {
    if (!summary) return;

    let text = `MemoryOS — Daily Update — ${new Date(summary.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}\n\n`;

    if (summary.projects.length === 0) {
      text += 'No activity recorded today.\n';
    } else {
      for (const p of summary.projects) {
        text += `📊 ${p.project.name} (${p.project.momentum} momentum)\n`;
        if (p.activities.length > 0) {
          text += 'Today you:\n';
          for (const act of p.activities) {
            text += `✓ ${act.whatHappened}${act.whatChanged ? ` (${act.whatChanged})` : ''}\n`;
          }
        }
        if (p.decisions.length > 0) {
          text += `Decisions: ${p.decisions.join('; ')}\n`;
        }
        if (p.openLoops.length > 0) {
          text += `Open loops: → ${p.openLoops.join('; ')}\n`;
        }
        if (p.nextLikelyAction) {
          text += `Tomorrow: → ${p.nextLikelyAction}\n`;
        }
        text += '\n';
      }
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/projects" className="hover:text-slate-800">Projects</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Daily Summary</span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight">
            Daily
          </h1>
          <p className="mt-2 text-sm text-[var(--mkt-muted)]">
            What already happened today. What to do next lives on Home.
          </p>
        </div>

        {/* Date Switcher & Copy */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-xs">
            <Button variant="secondary" size="sm" onClick={() => changeDateOffset(-1)} title="Previous day">
              Previous
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold text-slate-800 border-none bg-transparent px-2 py-0.5 focus:outline-none"
            />
            <Button variant="secondary" size="sm" onClick={() => changeDateOffset(1)} disabled={isToday} title="Next day">
              Next
            </Button>
          </div>

          <Button size="sm" onClick={copyToClipboard} disabled={!summary || summary.projects.length === 0}>
            {copied ? 'Copied' : 'Copy for standup'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-white border border-slate-200 rounded-2xl" />
          <div className="h-64 bg-white border border-slate-200 rounded-2xl" />
        </div>
      )}

      {!loading && summary && (
        <div className="space-y-6">
          {/* Key Metrics Banner */}
          <div className="flex gap-8 border-y border-[var(--mkt-line)] py-4 text-sm">
            <p><span className="text-[var(--mkt-muted)]">Activity </span>{summary.totalActivities}</p>
            <p><span className="text-[var(--mkt-muted)]">Decisions </span>{summary.totalDecisions}</p>
            <p><span className="text-[var(--mkt-muted)]">Open loops </span>{summary.totalOpenLoops}</p>
          </div>

          {/* Project Summaries */}
          {summary.projects.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                No activity recorded on {new Date(summary.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Activities captured from Cursor, terminal, browser, or documents will automatically appear here grouped by project.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {summary.projects.map((p) => {
                return (
                  <div
                    key={p.project.id}
                    className="space-y-4 border-b border-[var(--mkt-line)] py-8"
                  >
                    {/* Project Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/projects/${p.project.id}`}
                          className="text-lg hover:text-[var(--mkt-accent)]"
                        >
                          {p.project.name}
                        </Link>
                        <span className="text-sm text-[var(--mkt-muted)]">{p.project.momentum}</span>
                      </div>

                      <Link
                        href={`/projects/${p.project.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Project Details &rarr;
                      </Link>
                    </div>

                    {/* Today you worked on */}
                    {p.activities.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Today you:
                        </h4>
                        <ul className="space-y-2">
                          {p.activities.map((act) => (
                            <li key={act.id} className="flex items-start gap-2 text-sm text-slate-800">
                              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                              <div className="flex-1">
                                <span className="font-medium">{act.whatHappened}</span>
                                {act.whatChanged && (
                                  <span className="text-xs font-mono text-slate-500 ml-2 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                    {act.whatChanged}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Decisions & Open Loops Row */}
                    {(p.decisions.length > 0 || p.openLoops.length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {p.decisions.length > 0 && (
                          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1.5">
                            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                              Decisions Made:
                            </span>
                            <ul className="text-xs text-amber-950 space-y-1">
                              {p.decisions.map((d, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="font-bold">•</span>
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {p.openLoops.length > 0 && (
                          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200/80 space-y-1.5">
                            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
                              Open Loops / Next:
                            </span>
                            <ul className="text-xs text-indigo-950 space-y-1">
                              {p.openLoops.map((loop, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="font-bold">&rarr;</span>
                                  <span>{loop}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tomorrow Suggestion */}
                    {p.nextLikelyAction && (
                      <div className="pt-2 text-xs text-slate-600 flex items-center gap-2 border-t border-slate-100">
                        <span className="font-bold text-slate-700">Next likely action:</span>
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                          {p.nextLikelyAction}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
