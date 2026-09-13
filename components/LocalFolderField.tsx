'use client';

import { useState } from 'react';

type Props = {
  value: string;
  onChange: (path: string) => void;
  id?: string;
  disabled?: boolean;
};

export default function LocalFolderField({ value, onChange, id, disabled }: Props) {
  const [picking, setPicking] = useState(false);
  const [validating, setValidating] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hintTone, setHintTone] = useState<'ok' | 'warn' | 'err'>('ok');

  const browse = async () => {
    setPicking(true);
    setHint(null);
    try {
      const res = await fetch('/api/system/pick-folder', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.status === 400 && data.code === 'CANCELLED') {
        setHint('Folder selection cancelled');
        setHintTone('warn');
        return;
      }
      if (!res.ok) {
        setHint(
          data.error ||
            'Could not open folder picker. Paste the absolute path instead (e.g. /Users/you/Projects/my-app).'
        );
        setHintTone('err');
        return;
      }
      if (data.path) {
        onChange(data.path);
        setHint('Folder selected');
        setHintTone('ok');
      }
    } catch {
      setHint('Could not reach MemoryOS. Is the local server running?');
      setHintTone('err');
    } finally {
      setPicking(false);
    }
  };

  const validate = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setHint(null);
      return;
    }
    setValidating(true);
    setHint(null);
    try {
      const res = await fetch('/api/system/validate-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.valid) {
        if (data.path && data.path !== trimmed) {
          onChange(data.path);
        }
        setHint('Folder exists on this Mac');
        setHintTone('ok');
      } else {
        setHint(data.error || 'Path not found');
        setHintTone('err');
      }
    } catch {
      setHint('Could not validate path');
      setHintTone('err');
    } finally {
      setValidating(false);
    }
  };

  const hintClass =
    hintTone === 'ok'
      ? 'text-emerald-700'
      : hintTone === 'warn'
        ? 'text-amber-700'
        : 'text-rose-700';

  return (
    <div className="space-y-1">
      <label
        htmlFor={id || 'local-folder'}
        className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        Local Project Folder
      </label>
      <div className="flex gap-2">
        <input
          id={id || 'local-folder'}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            setHint(null);
          }}
          onBlur={() => {
            if (value.trim()) void validate();
          }}
          placeholder="/Users/yourname/Projects/memory-ai"
          className="flex-1 min-w-0 px-3.5 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void browse()}
          disabled={disabled || picking}
          className="shrink-0 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {picking ? 'Opening…' : 'Browse…'}
        </button>
      </div>
      <p className="text-[11px] text-slate-500">
        When Cursor or VS Code shows this folder in the window title, captures are linked to this
        project. Use Browse on this Mac, or paste an absolute path.
      </p>
      {hint && (
        <p className={`text-[11px] font-medium ${hintClass}`}>
          {validating ? 'Checking…' : hint}
        </p>
      )}
    </div>
  );
}
