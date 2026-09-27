'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import LocalCoreOfflineBanner from '@/components/LocalCoreOfflineBanner';
import { type ActiveProject } from '@/components/active-state/ActiveProjectsCard';
import { type DecisionItem } from '@/components/active-state/RecentDecisionsCard';
import { type MemoryStats } from '@/components/active-state/MemoryStatsCard';
import AIConnectionsCard, { type AiConnections } from '@/components/active-state/AIConnectionsCard';
import { type WorkAlert } from '@/components/active-state/WorkAlerts';
import WeeklyDigestCard from '@/components/active-state/WeeklyDigestCard';
import { type TodayItem } from '@/components/active-state/TodayCard';

type Memory = {
  id: string;
  content: string;
  summary?: string | null;
  heading?: string | null;
  description?: string | null;
  metadata?: { kind?: string } | null;
  createdAt: string;
};

type GraphLists = {
  decisions: Array<{ id: string; name: string; description?: string | null }>;
  commitments: Array<{ id: string; what: string; who?: string | null; when_due?: string | null }>;
  preferences: Array<{ id: string; domain: string; preference: string }>;
  workflows: Array<{ id: string; name: string; description?: string | null }>;
  relationships: Array<{
    source_name: string;
    relation_type: string;
    target_name: string;
  }>;
};

type GoalView = {
  id: string;
  title: string;
  statement?: string | null;
  importance: number;
  milestone: { id: string; title: string; nextAction?: string | null } | null;
  projects: Array<{ id: string; name: string }>;
  progress: Array<{ id: string; summary: string; at: string }>;
};

type ContentIdea = {
  id: string;
  topic: string;
  lesson?: string | null;
  kind?: string | null;
  status: string;
};

type ProjectOption = { id: string; name: string };

const emptyGraph: GraphLists = {
  decisions: [],
  commitments: [],
  preferences: [],
  workflows: [],
  relationships: [],
};

type GroupedMemories = {
  today: Memory[];
  yesterday: Memory[];
  lastWeek: Memory[];
  lastMonth: Memory[];
};

function groupMemories(memories: Memory[]): GroupedMemories {
  const grouped: GroupedMemories = {
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
  };

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const monthStart = new Date(todayStart);
  monthStart.setMonth(monthStart.getMonth() - 1);

  for (const memory of memories) {
    const memDate = new Date(memory.createdAt);
    if (memDate >= todayStart) {
      grouped.today.push(memory);
    } else if (memDate >= yesterdayStart) {
      grouped.yesterday.push(memory);
    } else if (memDate >= weekStart) {
      grouped.lastWeek.push(memory);
    } else if (memDate >= monthStart) {
      grouped.lastMonth.push(memory);
    }
  }

  return grouped;
}

const emptyStats: MemoryStats = { memories: 0, people: 0, projects: 0, openLoops: 0 };
const emptyConnections: AiConnections = {
  claude: { connected: false, lastSync: null },
  chatgpt: { connected: false, lastSync: null },
  cursor: { connected: false, lastSync: null },
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function homeDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

function greeting(name: string, date: Date): string {
  const hour = date.getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${hello}, ${name}.`;
}

export default function DashboardClient({
  connectionReady,
  userName,
  view,
}: {
  connectionReady: boolean;
  userName: string;
  view: 'home' | 'timeline' | 'learned';
}) {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [grouped, setGrouped] = useState<GroupedMemories>({
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
  });
  const [graph, setGraph] = useState<GraphLists>(emptyGraph);
  const [todayItems, setTodayItems] = useState<TodayItem[]>([]);
  const [notToday, setNotToday] = useState<TodayItem[]>([]);
  const [goal, setGoal] = useState<GoalView | null>(null);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [goalForm, setGoalForm] = useState(false);
  const [goalDraft, setGoalDraft] = useState({
    title: '',
    statement: '',
    importance: '3',
    milestone: '',
    nextAction: '',
    projectId: '',
  });
  const [projects, setProjects] = useState<ActiveProject[]>([]);
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [stats, setStats] = useState<MemoryStats>(emptyStats);
  const [connections, setConnections] = useState<AiConnections>(emptyConnections);
  const [alerts, setAlerts] = useState<WorkAlert[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [digest, setDigest] = useState<{
    completed: string[];
    needsAttention: string[];
    patterns: string[];
  } | null>(null);

  const loadTimeline = useCallback(async () => {
    if (!connectionReady) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/timeline?range=month&limit=100');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load timeline');
      }
      setGrouped(groupMemories(data.timeline || []));
      const graphRes = await fetch('/api/graph');
      if (graphRes.ok) {
        const graphData = await graphRes.json();
        setGraph({
          decisions: graphData.decisions || [],
          commitments: graphData.commitments || [],
          preferences: graphData.preferences || [],
          workflows: graphData.workflows || [],
          relationships: graphData.relationships || [],
        });
      }
      const stateRes = await fetch('/api/active-state');
      if (stateRes.ok) {
        const state = await stateRes.json();
        setTodayItems(state.today || []);
        setNotToday(state.notToday || []);
        setGoal(state.goal || null);
        setProjects(state.activeProjects || []);
        setDecisions(state.recentDecisions || []);
        setStats(state.stats || emptyStats);
        setConnections(state.aiConnections || emptyConnections);
      }
      const workRes = await fetch('/api/work-intelligence');
      if (workRes.ok) {
        const work = await workRes.json();
        setAlerts(work.alerts || []);
        setDigest(work.digest || null);
      }
      const ideaRes = await fetch('/api/content-ideas?limit=3');
      if (ideaRes.ok) {
        const ideaData = await ideaRes.json();
        setIdeas(ideaData.ideas || []);
      }
      const projectRes = await fetch('/api/projects');
      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProjectOptions(
          (projectData.projects || []).map((project: { id: string; name: string }) => ({
            id: project.id,
            name: project.name,
          }))
        );
      }
    } catch (error) {
      setMessage({
        type: 'err',
        text: error instanceof Error ? error.message : 'Failed to load timeline',
      });
    } finally {
      setLoading(false);
    }
  }, [connectionReady]);

  useEffect(() => {
    loadTimeline();
    const stored = window.localStorage.getItem('memoryos-dismissed-alerts');
    if (stored) {
      try {
        setDismissed(JSON.parse(stored) as string[]);
      } catch {
        setDismissed([]);
      }
    }
  }, [loadTimeline]);

  const saveGoal = async () => {
    if (!goalDraft.title.trim()) return;
    setSaving(true);
    const body = {
      title: goalDraft.title.trim(),
      statement: goalDraft.statement.trim(),
      importance: Number(goalDraft.importance) || 3,
      milestone: goalDraft.milestone.trim()
        ? {
            id: goal?.milestone?.id,
            title: goalDraft.milestone.trim(),
            nextAction: goalDraft.nextAction.trim(),
          }
        : undefined,
      projectIds: goalDraft.projectId ? [goalDraft.projectId] : [],
    };
    const res = await fetch(goal ? `/api/goals/${goal.id}` : '/api/goals', {
      method: goal ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage({ type: 'err', text: data.error || 'Could not save goal' });
      return;
    }
    setGoalForm(false);
    await loadTimeline();
  };

  const dismissIdea = async (id: string) => {
    setIdeas((current) => current.filter((idea) => idea.id !== id));
    await fetch(`/api/content-ideas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'dismissed' }),
    });
  };

  const itemDetail = (item: TodayItem) => {
    if (item.status === 'waiting' && item.waitingOn) {
      const when = item.followUpAt ? ` · follow up ${item.followUpAt.slice(0, 10)}` : '';
      return `Waiting on ${item.waitingOn}${when}`;
    }
    if (item.reason === 'due-today') return 'Due';
    if (item.reason === 'overdue') return 'Overdue';
    if (item.reason === 'goal') return 'Goal';
    if (item.reason === 'later') return 'Later';
    if (item.reason === 'elsewhere') return 'Not today';
    if (item.reason === 'waiting') return 'Waiting';
    return 'Now';
  };

  const handleCapture = async () => {
    if (!content.trim() && !selectedFile) return;
    setSaving(true);
    setMessage(null);

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await fetch('/api/memory/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        setSelectedFile(null);
      } else {
        const res = await fetch('/api/memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, type: 'text' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save memory');
        setContent('');
      }

      setMessage({ type: 'ok', text: 'Memory saved' });
      await loadTimeline();
    } catch (error) {
      setMessage({
        type: 'err',
        text: error instanceof Error ? error.message : 'Failed to save memory',
      });
    } finally {
      setSaving(false);
    }
  };

  const total =
    grouped.today.length +
    grouped.yesterday.length +
    grouped.lastWeek.length +
    grouped.lastMonth.length;

  const renderGroup = (title: string, memories: Memory[]) => {
    if (memories.length === 0) return null;
    return (
      <section className="mb-8">
        <h3 className="mb-3 text-xs uppercase tracking-[0.14em] text-[var(--mkt-muted)]">{title}</h3>
        <div className="space-y-3">
          {memories.map((memory) => {
            const heading = (memory.heading || '').trim();
            const summary = (memory.summary || '').trim();
            const content = (memory.content || '').trim();
            const description = (memory.description || '').trim();
            const isEpisode = memory.metadata?.kind === 'episode';
            const headline = heading || summary || content;
            const body = isEpisode ? summary || content : summary || description || content;
            const detail = body && body !== headline ? body : '';
            return (
            <article key={memory.id} className="border-b border-[var(--mkt-line)] py-4">
              <p className="text-[var(--mkt-ink)] whitespace-pre-wrap">{headline}</p>
              {detail ? <p className="mt-1 text-sm text-[var(--mkt-muted)]">{detail}</p> : null}
              <p className="mt-2 text-xs text-[var(--mkt-muted)]">{new Date(memory.createdAt).toISOString().slice(0, 10)}</p>
            </article>
            );
          })}
        </div>
      </section>
    );
  };

  const now = new Date();
  const visibleAlerts = alerts.filter((alert) => !dismissed.includes(alert.id)).slice(0, 3);
  const pageTitle =
    view === 'timeline' ? 'Timeline' : view === 'learned' ? 'Learned' : greeting(userName, now);

  return (
    <div>
      <p className="text-sm text-[var(--mkt-muted)]">{view === 'home' ? homeDate(now) : 'MemoryOS'}</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-[var(--mkt-ink)]">
        {pageTitle}
      </h1>

      <LocalCoreOfflineBanner />

      {view === 'home' ? (
        <div className="mt-12 grid items-start gap-16 lg:grid-cols-[minmax(0,1.45fr)_18rem]">
          <section>
            {visibleAlerts.length > 0 ? (
              <ul className="mb-8 space-y-4">
                {visibleAlerts.map((alert) => (
                  <li key={alert.id} className="text-sm">
                    <p className="text-[var(--mkt-ink)]">{alert.title}</p>
                    <p className="mt-1 text-[var(--mkt-muted)]">{alert.description}</p>
                    <div className="mt-2 flex gap-4 text-xs">
                      {alert.kind === 'stalled' || alert.kind === 'overdue' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            void fetch('/api/work-intelligence', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ text: alert.description }),
                            }).then(() => loadTimeline());
                          }}
                        >
                          Create task
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const next = [...dismissed, alert.id];
                          setDismissed(next);
                          window.localStorage.setItem('memoryos-dismissed-alerts', JSON.stringify(next));
                        }}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="text-xs tracking-[0.14em] text-[var(--mkt-muted)] uppercase">Goal</p>
            {goal && !goalForm ? (
              <div className="mt-3">
                <p className="text-lg text-[var(--mkt-ink)]">{goal.title}</p>
                {goal.statement ? <p className="mt-1 text-sm text-[var(--mkt-muted)]">{goal.statement}</p> : null}
                {goal.milestone ? (
                  <p className="mt-3 text-sm text-[var(--mkt-ink)]">
                    {goal.milestone.title}
                    {goal.milestone.nextAction ? ` — ${goal.milestone.nextAction}` : ''}
                  </p>
                ) : null}
                {goal.progress[0] ? (
                  <p className="mt-2 text-sm text-[var(--mkt-muted)]">{goal.progress[0].summary}</p>
                ) : null}
                <button
                  type="button"
                  className="mt-3 text-xs underline decoration-[var(--mkt-line)] underline-offset-4"
                  onClick={() => {
                    setGoalDraft({
                      title: goal.title,
                      statement: goal.statement || '',
                      importance: String(goal.importance || 3),
                      milestone: goal.milestone?.title || '',
                      nextAction: goal.milestone?.nextAction || '',
                      projectId: goal.projects[0]?.id || '',
                    });
                    setGoalForm(true);
                  }}
                >
                  Edit goal
                </button>
              </div>
            ) : (
              <form
                className="mt-3 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveGoal();
                }}
              >
                <input
                  className="w-full border-b border-[var(--mkt-line)] bg-transparent py-2 text-sm outline-none"
                  placeholder="Goal, for example get 10 paying customers"
                  value={goalDraft.title}
                  onChange={(event) => setGoalDraft({ ...goalDraft, title: event.target.value })}
                />
                <input
                  className="w-full border-b border-[var(--mkt-line)] bg-transparent py-2 text-sm outline-none"
                  placeholder="Why this matters"
                  value={goalDraft.statement}
                  onChange={(event) => setGoalDraft({ ...goalDraft, statement: event.target.value })}
                />
                <input
                  className="w-full border-b border-[var(--mkt-line)] bg-transparent py-2 text-sm outline-none"
                  placeholder="Current milestone"
                  value={goalDraft.milestone}
                  onChange={(event) => setGoalDraft({ ...goalDraft, milestone: event.target.value })}
                />
                <input
                  className="w-full border-b border-[var(--mkt-line)] bg-transparent py-2 text-sm outline-none"
                  placeholder="Next action"
                  value={goalDraft.nextAction}
                  onChange={(event) => setGoalDraft({ ...goalDraft, nextAction: event.target.value })}
                />
                {projectOptions.length > 0 ? (
                  <select
                    className="w-full bg-transparent py-2 text-sm"
                    value={goalDraft.projectId}
                    onChange={(event) => setGoalDraft({ ...goalDraft, projectId: event.target.value })}
                  >
                    <option value="">Link a project</option>
                    {projectOptions.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                ) : null}
                <div className="flex gap-4">
                  <Button size="sm" type="submit" disabled={saving}>
                    Save goal
                  </Button>
                  {goal ? (
                    <Button size="sm" variant="ghost" type="button" onClick={() => setGoalForm(false)}>
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </form>
            )}

            <p className="mt-10 text-xs tracking-[0.14em] text-[var(--mkt-muted)] uppercase">Today</p>
            <p className="mt-3 text-lg text-[var(--mkt-ink)]">
              {todayItems.length === 0
                ? 'Nothing should move today.'
                : todayItems[0]?.text}
            </p>
            {todayItems.length > 0 ? (
              <ol className="mt-6 border-y border-[var(--mkt-line)]">
                {todayItems.map((item, index) => (
                  <li key={item.id} className="flex items-baseline justify-between gap-6 border-b border-[var(--mkt-line)] py-3 text-sm last:border-b-0">
                    <span>
                      {index + 1}. {item.text}
                    </span>
                    <span className={item.reason === 'overdue' || item.reason === 'due-today' ? 'text-[var(--mkt-accent)]' : 'text-[var(--mkt-muted)]'}>
                      {itemDetail(item)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
            {notToday.length > 0 ? (
              <>
                <p className="mt-8 text-xs tracking-[0.14em] text-[var(--mkt-muted)] uppercase">Not today</p>
                <ul className="mt-3">
                  {notToday.map((item) => (
                    <li key={item.id} className="py-1.5 text-sm text-[var(--mkt-muted)]">
                      {item.text}
                      <span className="ml-2 text-xs">{itemDetail(item)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {ideas.length > 0 ? (
              <>
                <p className="mt-8 text-xs tracking-[0.14em] text-[var(--mkt-muted)] uppercase">Worth posting</p>
                <ul className="mt-3">
                  {ideas.map((idea) => (
                    <li key={idea.id} className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
                      <span>
                        {idea.topic}
                        {idea.lesson ? <span className="mt-1 block text-[var(--mkt-muted)]">{idea.lesson}</span> : null}
                      </span>
                      <button type="button" className="text-xs text-[var(--mkt-muted)]" onClick={() => void dismissIdea(idea.id)}>
                        Dismiss
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <p className="mt-8 flex gap-5 text-sm">
              <Link href="/dashboard?view=timeline" className="underline decoration-[var(--mkt-line)] underline-offset-4">
                Timeline
              </Link>
              <Link href="/dashboard?view=learned" className="underline decoration-[var(--mkt-line)] underline-offset-4">
                Learned
              </Link>
            </p>
          </section>
          <aside className="space-y-10 border-t border-[var(--mkt-line)] pt-8 text-sm lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--mkt-muted)]">Active</p>
              <ul className="mt-3 space-y-2">
                {projects.slice(0, 3).map((project) => (
                  <li key={project.id}>
                    <Link href={`/projects/${project.id}`} className="hover:text-[var(--mkt-accent)]">
                      {project.name}
                    </Link>
                  </li>
                ))}
                {projects.length === 0 ? <li className="text-[var(--mkt-muted)]">No project this week</li> : null}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--mkt-muted)]">Decision</p>
              <p className="mt-3">{decisions[0]?.name || 'None this week'}</p>
              {decisions[0]?.description ? (
                <p className="mt-1 text-[var(--mkt-muted)]">{decisions[0].description}</p>
              ) : null}
            </div>
            <p className="text-[var(--mkt-muted)]">
              <Link href="/dashboard?view=timeline">{stats.memories} memories</Link>
              {' · '}
              {stats.people} people
              {' · '}
              <Link href="/projects">{stats.projects} projects</Link>
              {' · '}
              {stats.openLoops} open loops
            </p>
          </aside>
        </div>
      ) : null}

      {view === 'learned' ? (
        <div className="mt-12">
          <StructuredGrid graph={graph} />
          <div className="mt-10">
            <WeeklyDigestCard digest={digest} />
          </div>
        </div>
      ) : null}

      {view === 'timeline' ? (
        <div className="mt-12 space-y-12">
          {!connectionReady ? (
            <p className="text-sm">
              Add a model key in <Link href="/settings" className="underline">Settings</Link> before capturing notes.
            </p>
          ) : (
            <details className="group">
              <summary className="cursor-pointer text-sm text-[var(--mkt-muted)]">Add a note</summary>
              <div className="mt-4 space-y-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="mkt-input min-h-28 resize-y"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      void handleCapture();
                    }
                  }}
                />
                {message ? <p className="text-sm text-[var(--mkt-muted)]">{message.text}</p> : null}
                <div className="flex items-center justify-between">
                  <label className="cursor-pointer text-sm text-[var(--mkt-muted)]">
                    {selectedFile ? selectedFile.name : 'Attach a file'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <Button
                    size="sm"
                    onClick={() => void handleCapture()}
                    disabled={saving || (!content.trim() && !selectedFile)}
                  >
                    {saving ? 'Saving' : 'Save'}
                  </Button>
                </div>
              </div>
            </details>
          )}
          {loading ? (
            <p className="text-sm text-[var(--mkt-muted)]">Loading</p>
          ) : total === 0 ? (
            <p className="text-sm text-[var(--mkt-muted)]">No memories yet.</p>
          ) : (
            <div>
              {renderGroup('Today', grouped.today)}
              {renderGroup('Yesterday', grouped.yesterday)}
              {renderGroup('Last week', grouped.lastWeek)}
              {renderGroup('Last month', grouped.lastMonth)}
            </div>
          )}
          <AIConnectionsCard connections={connections} />
        </div>
      ) : null}
    </div>
  );
}

function StructuredGrid({ graph }: { graph: GraphLists }) {
  const sections = [
    { title: 'Decisions', items: graph.decisions.map((item) => item.name) },
    {
      title: 'Commitments',
      items: graph.commitments.map((item) =>
        item.who ? `${item.what} (${item.who})` : item.what
      ),
    },
    {
      title: 'Preferences',
      items: graph.preferences.map((item) => `${item.domain}: ${item.preference}`),
    },
    {
      title: 'Workflows',
      items: graph.workflows.map((item) => item.name),
    },
    {
      title: 'Relationships',
      items: graph.relationships.map(
        (item) => `${item.source_name} ${item.relation_type.replaceAll('_', ' ')} ${item.target_name}`
      ),
    },
  ].filter((section) => section.items.length > 0);

  if (sections.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
        Nothing structured yet. Decisions and promises show up here after a capture names them.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-xs uppercase tracking-[0.14em] text-[var(--mkt-muted)]">{section.title}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {section.items.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
