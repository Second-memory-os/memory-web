'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

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
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight">
            Projects
          </h1>
          <p className="text-slate-600 mt-1 text-sm max-w-xl">
            First-class organizing context. MemoryOS connects your daily code, chats, decisions, and files directly to the projects you care about.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button href="/daily" variant="secondary" size="sm">
            Daily
          </Button>
          <Button href="/projects/new" size="sm">
            New Project
          </Button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-sm">
          {(['all', 'active', 'paused', 'archived'] as const).map((tab) => (
            <Button
              key={tab}
              variant="toggle"
              pressed={filter === tab}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </Button>
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
          <Button variant="ghost" size="sm" onClick={loadProjects}>
            Retry
          </Button>
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
            <Button href="/projects/new" size="sm">
              Create your first project
            </Button>
          </div>
        </div>
      )}

      {!loading && filteredProjects.length > 0 && (
        <ul className="border-y border-[var(--mkt-line)]">
          {filteredProjects.map((project) => {
            const momentumKey = project.heartbeat?.momentum || project.momentum || 'new';
            const status = project.status !== 'active' ? project.status : momentumKey;
            return (
              <li key={project.id} className="border-b border-[var(--mkt-line)] last:border-b-0">
                <Link href={`/projects/${project.id}`} className="flex items-baseline justify-between gap-6 py-4">
                  <span>
                    <span className="text-lg">{project.name}</span>
                    {project.goal ? (
                      <span className="mt-1 block text-sm text-[var(--mkt-muted)]">{project.goal}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-sm text-[var(--mkt-muted)]">
                    {status} · {formatTimeAgo(project.heartbeat?.lastActive || project.lastActiveAt)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

    </div>
  );
}
