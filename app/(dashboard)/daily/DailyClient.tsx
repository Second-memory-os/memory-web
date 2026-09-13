'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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

const MOMENTUM_COLORS: Record<string, { badge: string; dot: string; text: string }> = {
  high: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500 animate-pulse', text: 'text-emerald-700' },
  moderate: { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700' },
  low: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', text: 'text-amber-700' },
  stalled: { badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', text: 'text-rose-700' },
  new: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', text: 'text-indigo-700' },
};

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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Daily Project Digest
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Synthesized overview of what you worked on, decisions made, and what needs follow-up.
          </p>
        </div>

        {/* Date Switcher & Copy */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-xs">
            <button
              onClick={() => changeDateOffset(-1)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="Previous day"
            >
              &larr;
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold text-slate-800 border-none bg-transparent px-2 py-0.5 focus:outline-none"
            />
            <button
              onClick={() => changeDateOffset(1)}
              disabled={isToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next day"
            >
              &rarr;
            </button>
          </div>

          <button
            onClick={copyToClipboard}
            disabled={!summary || summary.projects.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy for Standup</span>
              </>
            )}
          </button>
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
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-center">
              <div className="text-2xl font-black text-slate-900">
                {summary.totalActivities}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                Activities Attributed
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-center">
              <div className="text-2xl font-black text-amber-600">
                {summary.totalDecisions}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                Decisions Recorded
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-center">
              <div className="text-2xl font-black text-indigo-600">
                {summary.totalOpenLoops}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                Follow-ups / Loops
              </div>
            </div>
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
                const momentumKey = p.project.momentum || 'new';
                const style = MOMENTUM_COLORS[momentumKey] || MOMENTUM_COLORS.new;

                return (
                  <div
                    key={p.project.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5"
                  >
                    {/* Project Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/projects/${p.project.id}`}
                          className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {p.project.name}
                        </Link>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          <span className="capitalize">{p.project.momentum} momentum</span>
                        </span>
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
