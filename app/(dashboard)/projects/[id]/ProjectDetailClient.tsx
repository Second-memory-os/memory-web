'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LocalFolderField from '@/components/LocalFolderField';

export interface ProjectDetail {
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
  profile?: {
    whatItIs?: string;
    goal?: string;
    currentPriorities?: string[];
    people?: string[];
    importantDecisions?: string[];
    links?: Record<string, string>;
  };
  lastActiveAt?: string;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  activityType: string;
  whatHappened: string;
  whatChanged?: string;
  createsTask: boolean;
  createsDecision: boolean;
  confidence: number;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  doc_type: string;
  content: string;
  file_path?: string;
  created_at: string;
}

export interface HeartbeatData {
  lastActive?: string;
  activityLast7Days: number;
  recentCodeChanges: number;
  recentConversations: number;
  recentDecisions: number;
  openLoops: number;
  momentum: string;
  needsAttention?: string | null;
}

const MOMENTUM_BADGES: Record<string, { label: string; bg: string; dot: string }> = {
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

const ACTIVITY_ICONS: Record<string, { icon: string; bg: string; text: string }> = {
  code: { icon: '💻', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  communication: { icon: '💬', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  research: { icon: '🔍', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
  decision: { icon: '⚡', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  document: { icon: '📄', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700' },
  meeting: { icon: '👥', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
};

export default function ProjectDetailClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [heartbeat, setHeartbeat] = useState<HeartbeatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Document modal / add state
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docType, setDocType] = useState('document');
  const [savingDoc, setSavingDoc] = useState(false);

  // Edit project state
  const [showEdit, setShowEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editGoal, setEditGoal] = useState('');
  const [editStatus, setEditStatus] = useState<ProjectDetail['status']>('active');
  const [editLocalFolder, setEditLocalFolder] = useState('');
  const [editRepoUrl, setEditRepoUrl] = useState('');
  const [editWebsiteUrl, setEditWebsiteUrl] = useState('');
  const [editPeople, setEditPeople] = useState('');
  const [editPriorities, setEditPriorities] = useState('');
  const [editDecisions, setEditDecisions] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'documents'>('overview');

  const openEdit = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description || '');
    setEditGoal(project.goal || '');
    setEditStatus(project.status);
    setEditLocalFolder(project.localFolder || '');
    setEditRepoUrl(project.repoUrl || '');
    setEditWebsiteUrl(project.websiteUrl || '');
    setEditPeople((project.profile?.people || []).join(', '));
    setEditPriorities((project.profile?.currentPriorities || []).join('\n'));
    setEditDecisions((project.profile?.importantDecisions || []).join('\n'));
    setEditError(null);
    setShowEdit(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError('Project name is required');
      return;
    }
    setSavingEdit(true);
    setEditError(null);
    try {
      const profile = {
        ...(project?.profile || {}),
        people: editPeople
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
        currentPriorities: editPriorities
          .split('\n')
          .map((p) => p.trim())
          .filter(Boolean),
        importantDecisions: editDecisions
          .split('\n')
          .map((d) => d.trim())
          .filter(Boolean),
      };

      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
          goal: editGoal.trim() || null,
          status: editStatus,
          localFolder: editLocalFolder.trim() || '',
          repoUrl: editRepoUrl.trim() || null,
          websiteUrl: editWebsiteUrl.trim() || null,
          profile,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update project');
      }
      setProject(data.project);
      setShowEdit(false);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update project');
    } finally {
      setSavingEdit(false);
    }
  };

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        throw new Error(`Failed to load project (${res.status})`);
      }
      const data = await res.json();
      setProject(data.project);
      setActivities(data.activities || []);
      setDocuments(data.documents || []);
      setHeartbeat(data.heartbeat);
    } catch (err: any) {
      setError(err.message || 'Could not load project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docContent.trim()) return;

    setSavingDoc(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: docName.trim(),
          content: docContent.trim(),
          docType,
        }),
      });
      if (!res.ok) throw new Error('Failed to save document');
      const data = await res.json();
      setDocuments((prev) => [data.document, ...prev]);
      setShowAddDoc(false);
      setDocName('');
      setDocContent('');
    } catch (err: any) {
      alert(err.message || 'Failed to add document');
    } finally {
      setSavingDoc(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete "${project?.name}"?`)) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      router.push('/projects');
    } catch (err: any) {
      alert(err.message || 'Could not delete project');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-40 bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 space-y-4">
        <div className="text-rose-600 font-bold text-lg">Project not found</div>
        <p className="text-sm text-slate-600">{error || 'Unable to retrieve project details.'}</p>
        <Link
          href="/projects"
          className="inline-block px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const momentumKey = heartbeat?.momentum || project.momentum || 'new';
  const momentum = MOMENTUM_BADGES[momentumKey] || MOMENTUM_BADGES.new;

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/projects" className="hover:text-slate-900 transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{project.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Project
          </button>
          <button
            onClick={() => setShowAddDoc(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Doc
          </button>
          <button
            onClick={handleDeleteProject}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete project"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${momentum.bg}`}>
                <span className={`w-2 h-2 rounded-full ${momentum.dot}`} />
                {momentum.label}
              </span>
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {project.status}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {project.name}
            </h1>

            {project.description && (
              <p className="text-base text-slate-700 leading-relaxed">
                {project.description}
              </p>
            )}

            {project.goal && (
              <div className="inline-flex items-center gap-2 text-sm bg-indigo-50/80 text-indigo-900 px-3.5 py-1.5 rounded-xl border border-indigo-100">
                <span className="font-bold text-xs uppercase tracking-wider text-indigo-700">Goal:</span>
                <span>{project.goal}</span>
              </div>
            )}

            {/* Context Signals / Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {project.localFolder && (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {project.localFolder}
                </span>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Repository
                </a>
              )}
              {project.websiteUrl && (
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg border border-slate-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Heartbeat Metrics Panel */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 w-full md:w-64 space-y-3 flex-shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Project Heartbeat
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">7-Day Activities:</span>
                <span className="font-bold text-slate-900">{heartbeat?.activityLast7Days ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Code Changes:</span>
                <span className="font-bold text-slate-900">{heartbeat?.recentCodeChanges ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Conversations:</span>
                <span className="font-bold text-slate-900">{heartbeat?.recentConversations ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Decisions:</span>
                <span className="font-bold text-slate-900">{heartbeat?.recentDecisions ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Open Loops:</span>
                <span className="font-bold text-amber-700">{heartbeat?.openLoops ?? 0}</span>
              </div>
            </div>

            {heartbeat?.needsAttention && (
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-start gap-1.5">
                  <svg className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{heartbeat.needsAttention}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-t border-slate-100 mt-6 pt-4 text-sm font-semibold">
          {(
            [
              { id: 'overview', label: 'Overview & Profile' },
              { id: 'activities', label: `Activities (${activities.length})` },
              { id: 'documents', label: `Documents (${documents.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-1 transition-colors relative ${
                activeTab === t.id
                  ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Priorities & People */}
          <div className="md:col-span-2 space-y-6">
            {/* Priorities */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Current Priorities
              </h2>
              {project.profile?.currentPriorities && project.profile.currentPriorities.length > 0 ? (
                <ul className="space-y-2">
                  {project.profile.currentPriorities.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">No priorities defined yet.</p>
              )}
            </div>

            {/* Decisions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Important Decisions Recorded
              </h2>
              {project.profile?.importantDecisions && project.profile.importantDecisions.length > 0 ? (
                <ul className="space-y-2.5">
                  {project.profile.importantDecisions.map((dec, i) => (
                    <li key={i} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-sm text-amber-950 flex items-start gap-2">
                      <span className="font-bold text-amber-600">✓</span>
                      <span>{dec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">No decisions logged yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar: People & Quick Context */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Key People
              </h2>
              {project.profile?.people && project.profile.people.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {project.profile.people.map((p, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No people tagged yet.</p>
              )}
            </div>

            {/* MCP Hint */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5 space-y-2 text-xs text-indigo-900">
              <div className="font-bold flex items-center gap-1.5 text-indigo-800">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                AI Tool Ingestion
              </div>
              <p className="leading-relaxed text-indigo-700">
                Your AI assistants can access this project via MCP using <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-semibold">get_project_context</code> with <code className="font-mono">{project.name}</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Attributed Activities ({activities.length})
            </h2>
            <span className="text-xs text-slate-500">
              Auto-linked by MemoryOS matching engine
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No activities attributed to this project yet. Work in your local folder or mention this project in notes to see activities flow here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map((act) => {
                const conf = Math.round((act.confidence || 1.0) * 100);
                const typeStyle = ACTIVITY_ICONS[act.activityType] || ACTIVITY_ICONS.document;

                return (
                  <div key={act.id} className="py-4 space-y-1 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border ${typeStyle.bg} ${typeStyle.text}`}>
                          <span>{typeStyle.icon}</span>
                          <span className="capitalize">{act.activityType}</span>
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(act.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {conf}% match
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-900 pt-0.5">
                      {act.whatHappened}
                    </p>

                    {act.whatChanged && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
                        {act.whatChanged}
                      </p>
                    )}

                    <div className="flex gap-2 pt-1">
                      {act.createsDecision && (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Decision recorded
                        </span>
                      )}
                      {act.createsTask && (
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          Task created
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Project Documents ({documents.length})
            </h2>
            <button
              onClick={() => setShowAddDoc(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200"
            >
              + Upload / Add Document
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No documents added yet. Attach PRDs, roadmaps, or architectural decisions to anchor MemoryOS intelligence.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                      {doc.doc_type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{doc.name}</h3>
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 font-mono max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {doc.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Document Modal */}
      {showAddDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Project Document</h3>
              <button
                onClick={() => setShowAddDoc(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Document Name</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Architecture RFC or PRD"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="prd">PRD / Product Spec</option>
                  <option value="architecture">Architecture RFC</option>
                  <option value="roadmap">Roadmap</option>
                  <option value="document">General Document / Notes</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Content / Text</label>
                <textarea
                  rows={6}
                  required
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste document text or markdown..."
                  className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDoc(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDoc}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {savingDoc ? 'Saving...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-xl w-full shadow-xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Project</h3>
              <button
                onClick={() => setShowEdit(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Goal</label>
                <input
                  type="text"
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ProjectDetail['status'])}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <LocalFolderField
                value={editLocalFolder}
                onChange={setEditLocalFolder}
                id="edit-local-folder"
                disabled={savingEdit}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Repository URL</label>
                  <input
                    type="text"
                    value={editRepoUrl}
                    onChange={(e) => setEditRepoUrl(e.target.value)}
                    placeholder="https://github.com/org/repo"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Website URL</label>
                  <input
                    type="text"
                    value={editWebsiteUrl}
                    onChange={(e) => setEditWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Key People (comma-separated)
                </label>
                <input
                  type="text"
                  value={editPeople}
                  onChange={(e) => setEditPeople(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Priorities (one per line)
                </label>
                <textarea
                  rows={2}
                  value={editPriorities}
                  onChange={(e) => setEditPriorities(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Important Decisions (one per line)
                </label>
                <textarea
                  rows={2}
                  value={editDecisions}
                  onChange={(e) => setEditDecisions(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
