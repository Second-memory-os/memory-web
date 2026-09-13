'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export interface ProjectItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  goal?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  momentum: 'new' | 'high' | 'moderate' | 'low' | 'stalled';
  websiteUrl?: string;
  repoUrl?: string;
  localFolder?: string;
  lastActiveAt?: string;
  activityCount: number;
  heartbeat?: {
    lastActive?: string;
    activityLast7Days: number;
    recentCodeChanges: number;
    recentConversations: number;
    recentDecisions: number;
    openLoops: number;
    momentum: string;
    needsAttention?: string | null;
  };
}

const MOMENTUM_CONFIG = {
  high: {
    label: 'High Momentum',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500 animate-pulse',
  },
  moderate: {
    label: 'Steady',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  low: {
    label: 'Low Activity',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  stalled: {
    label: 'Stalled',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  new: {
    label: 'Just Started',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
};

function formatTimeAgo(isoString?: string) {
  if (!isoString) return 'No activity yet';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString();
}

export default function ProjectsClient() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');
  const [search, setSearch] = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) {
        throw new Error(`Failed to load projects (${res.status})`);
      }
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message || 'Could not load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projects.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.goal?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Projects
          </h1>
          <p className="text-slate-600 mt-1 text-sm max-w-xl">
            First-class organizing context. MemoryOS connects your daily code, chats, decisions, and files directly to the projects you care about.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/daily"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Daily Digest
          </Link>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Link>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-sm">
          {(['all', 'active', 'paused', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-medium capitalize transition-all ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadProjects}
            className="underline font-semibold hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-white border border-slate-200 p-6 animate-pulse space-y-4"
            >
              <div className="h-6 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-4/5" />
              <div className="pt-6 border-t border-slate-100 flex justify-between">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl bg-white border-2 border-dashed border-slate-200 max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {search ? 'No matching projects found' : 'No projects created yet'}
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto mt-1">
              {search
                ? `No projects matched "${search}". Try another search term or reset filters.`
                : 'Projects give MemoryOS the brain to understand what you are working on, track decisions, and keep AI tools updated.'}
            </p>
          </div>
          <div>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Project
            </Link>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const momentumKey = project.heartbeat?.momentum || project.momentum || 'new';
            const momentum = MOMENTUM_CONFIG[momentumKey as keyof typeof MOMENTUM_CONFIG] || MOMENTUM_CONFIG.new;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-200 relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Top Bar: Status and Momentum Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${momentum.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${momentum.dot}`} />
                      {momentum.label}
                    </span>

                    {project.status !== 'active' && (
                      <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {project.status}
                      </span>
                    )}
                  </div>

                  {/* Title & Goal */}
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {project.name}
                    </h2>
                    {project.goal && (
                      <p className="text-xs font-medium text-indigo-700 line-clamp-1 mt-0.5">
                        Goal: {project.goal}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  {project.description ? (
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No description provided</p>
                  )}

                  {/* Folders or Repo hints */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.localFolder && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 max-w-full truncate">
                        <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="truncate">{project.localFolder.split('/').pop()}</span>
                      </span>
                    )}
                    {project.repoUrl && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate">
                        <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        git
                      </span>
                    )}
                  </div>
                </div>

                {/* Heartbeat / Metrics Footer */}
                <div className="pt-5 mt-4 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 py-1.5 px-2 rounded-lg border border-slate-100">
                      <div className="text-sm font-bold text-slate-800">
                        {project.heartbeat?.activityLast7Days ?? project.activityCount ?? 0}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        Activities
                      </div>
                    </div>
                    <div className="bg-slate-50 py-1.5 px-2 rounded-lg border border-slate-100">
                      <div className="text-sm font-bold text-slate-800">
                        {project.heartbeat?.recentDecisions ?? 0}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        Decisions
                      </div>
                    </div>
                    <div className="bg-slate-50 py-1.5 px-2 rounded-lg border border-slate-100">
                      <div className="text-sm font-bold text-slate-800">
                        {project.heartbeat?.openLoops ?? 0}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        Open Loops
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Active {formatTimeAgo(project.heartbeat?.lastActive || project.lastActiveAt)}</span>
                    <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      View details &rarr;
                    </span>
                  </div>

                  {project.heartbeat?.needsAttention && (
                    <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-md border border-amber-200 flex items-start gap-1.5">
                      <svg className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{project.heartbeat.needsAttention}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
