'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import LocalCoreOfflineBanner from '@/components/LocalCoreOfflineBanner';

type Memory = {
  id: string;
  content: string;
  summary?: string | null;
  createdAt: string;
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

export default function DashboardClient({ connectionReady }: { connectionReady: boolean }) {
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
  }, [loadTimeline]);

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
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
          {title}
        </h3>
        <div className="space-y-3">
          {memories.map((memory) => (
            <article
              key={memory.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="text-slate-900 whitespace-pre-wrap">{memory.content}</p>
              {memory.summary ? (
                <p className="mt-2 text-sm text-slate-500">{memory.summary}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate-400">
                {new Date(memory.createdAt).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Inbox</h1>
        <p className="text-slate-600 mt-2">
          Timeline of memories from the macOS menu bar agent and optional manual notes.
        </p>
      </div>

      <LocalCoreOfflineBanner />

      <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        Primary capture runs in the <strong>MemoryOS menu bar app</strong>.{' '}
        <a
          href="/downloads/MemoryOS.dmg"
          download
          className="font-semibold underline underline-offset-2 hover:text-sky-800"
        >
          Download for Mac
        </a>
        , open it, sign in, and grant Screen Recording. Use the form below only for quick manual notes.
      </div>

      {!connectionReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-amber-900 font-medium">Setup required</p>
          <p className="text-amber-800 mt-1 text-sm">
            Add your OpenRouter or OpenAI API key in Settings so memories can be processed. Capture
            data is stored in the public Postgres schema.
          </p>
          <Link
            href="/settings"
            className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded-lg text-sm"
          >
            Open Settings
          </Link>
        </div>
      ) : (
        <details className="rounded-xl border border-slate-200 bg-white p-5 group">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 list-none flex items-center justify-between">
            <span>Manual capture (optional)</span>
            <span className="text-slate-400 group-open:hidden">Show</span>
            <span className="text-slate-400 hidden group-open:inline">Hide</span>
          </summary>
          <div className="mt-4 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full min-h-28 resize-y border-0 outline-none text-base text-slate-900 placeholder:text-slate-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void handleCapture();
              }
            }}
          />

          {selectedFile ? (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-slate-500 hover:text-slate-900"
              >
                Remove
              </button>
            </div>
          ) : null}

          {message ? (
            <p
              className={`text-sm rounded-lg px-3 py-2 ${
                message.type === 'ok'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </p>
          ) : null}

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <label className="cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200">
              Attach file
              <input
                type="file"
                className="hidden"
                accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <button
              type="button"
              onClick={() => void handleCapture()}
              disabled={saving || (!content.trim() && !selectedFile)}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save (⌘↵)'}
            </button>
          </div>
          </div>
        </details>
      )}

      <div>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Timeline</h2>
            <p className="text-slate-600 mt-1">Your recent memories</p>
          </div>
          <button
            type="button"
            onClick={() => void loadTimeline()}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-slate-500">Loading…</p>
        ) : !connectionReady ? (
          <p className="py-12 text-center text-slate-500">
            Configure Settings to start capturing memories.
          </p>
        ) : total === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500">
            <p className="text-lg">No memories yet</p>
            <p className="mt-2 text-sm">Capture something above to see it here.</p>
          </div>
        ) : (
          <div>
            {renderGroup('Today', grouped.today)}
            {renderGroup('Yesterday', grouped.yesterday)}
            {renderGroup('Last week', grouped.lastWeek)}
            {renderGroup('Last month', grouped.lastMonth)}
          </div>
        )}
      </div>
    </div>
  );
}
