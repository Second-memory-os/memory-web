'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LocalFolderField from '@/components/LocalFolderField';

export default function NewProjectClient() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [localFolder, setLocalFolder] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [people, setPeople] = useState('');
  const [priorities, setPriorities] = useState('');
  const [decisions, setDecisions] = useState('');

  // Initial document
  const [includeDoc, setIncludeDoc] = useState(false);
  const [docName, setDocName] = useState('PRD / Architecture Notes');
  const [docContent, setDocContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const documents = [];
      if (includeDoc && docContent.trim()) {
        documents.push({
          name: docName.trim() || 'Project Overview',
          docType: 'prd',
          content: docContent.trim(),
        });
      }

      const profilePayload: any = {};
      if (people.trim()) {
        profilePayload.people = people.split(',').map((p) => p.trim()).filter(Boolean);
      }
      if (priorities.trim()) {
        profilePayload.currentPriorities = priorities
          .split('\n')
          .map((p) => p.trim())
          .filter(Boolean);
      }
      if (decisions.trim()) {
        profilePayload.importantDecisions = decisions
          .split('\n')
          .map((d) => d.trim())
          .filter(Boolean);
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          goal: goal.trim() || undefined,
          localFolder: localFolder.trim() || undefined,
          repoUrl: repoUrl.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          documents: documents.length ? documents : undefined,
          profile: Object.keys(profilePayload).length ? profilePayload : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      // Success, route to new project page
      router.push(`/projects/${data.project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/projects" className="hover:text-slate-800 transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">New Project</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Create New Project
        </h1>
        <p className="text-slate-600 mt-1 text-sm">
          Give MemoryOS the context it needs to recognize your work, attribute activities, and track decisions across your AI tools.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold">1</span>
            Project Identity
          </h2>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-800">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MemoryOS or LeadSnipper"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-800">
              What is it? (Description)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Local-first personal/work memory layer for AI"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-800">
              Primary Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Become the user's private memory system across AI tools"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Activity Attribution Hooks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold">2</span>
              Attribution Signals
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              MemoryOS watches these paths and links to automatically connect your work to this project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <LocalFolderField value={localFolder} onChange={setLocalFolder} />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Website / Production URL
              </label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://memoryos.ai"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Profile Context (Optional) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold">3</span>
              Team & Profile (Optional)
            </h2>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-800">
              Key People / Collaborators
            </label>
            <input
              type="text"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              placeholder="e.g. Rehan, Alex, Sarah (comma-separated)"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-500">
              Chats or emails mentioning these names will boost attribution to this project.
            </span>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-800">
              Current Priorities (one per line)
            </label>
            <textarea
              rows={2}
              value={priorities}
              onChange={(e) => setPriorities(e.target.value)}
              placeholder="Local SQLite memory&#10;MCP server integration&#10;Project intelligence"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-800">
              Important Decisions to Remember (one per line)
            </label>
            <textarea
              rows={2}
              value={decisions}
              onChange={(e) => setDecisions(e.target.value)}
              placeholder="Memory should be local-first&#10;User owns all embeddings and data"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Project Document (Optional) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold">4</span>
              <h2 className="text-base font-bold text-slate-900">Add Documentation / PRD</h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDoc}
                onChange={(e) => setIncludeDoc(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              Include initial doc
            </label>
          </div>

          {includeDoc && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Document Title</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Content / Markdown</label>
                <textarea
                  rows={5}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste your PRD, requirements, or architecture notes here..."
                  className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/projects"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Project...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
