'use client';

import { useEffect, useState } from 'react';
import {
  CAPABILITY_LABELS,
  MCP_CAPABILITIES,
  type McpCapability,
  type McpClientKey,
} from '@/lib/mcp-capabilities';

type Grant = {
  clientKey: McpClientKey;
  capabilities: McpCapability[];
};

const CLIENTS: McpClientKey[] = ['claude', 'cursor', 'chatgpt'];

export default function McpGrantEditor() {
  const [grants, setGrants] = useState<Grant[] | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/mcp/grants')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load MCP access');
        if (!cancelled) setGrants(data.grants || []);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load MCP access');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle(clientKey: McpClientKey, capability: McpCapability, on: boolean) {
    if (!grants) return;
    const current = grants.find((grant) => grant.clientKey === clientKey);
    if (!current) return;
    const next = on
      ? [...current.capabilities, capability]
      : current.capabilities.filter((item) => item !== capability);
    setSaving(clientKey);
    setError('');
    const response = await fetch('/api/mcp/grants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientKey, capabilities: next }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(null);
    if (!response.ok) {
      setError(data.error || 'Could not save MCP access');
      return;
    }
    setGrants((rows) =>
      (rows || []).map((row) =>
        row.clientKey === clientKey ? { ...row, capabilities: data.capabilities || next } : row
      )
    );
  }

  if (error && !grants) {
    return <p className="text-sm text-amber-800">MCP access settings need the Mac app online. {error}</p>;
  }
  if (!grants) return <p className="text-sm text-slate-500">Loading who can see what…</p>;

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {CLIENTS.map((clientKey) => {
        const grant = grants.find((row) => row.clientKey === clientKey);
        const selected = new Set(grant?.capabilities || []);
        return (
          <div key={clientKey} className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold capitalize text-slate-900">
              {clientKey}
              {saving === clientKey ? <span className="ml-2 font-normal text-slate-500">Saving</span> : null}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {MCP_CAPABILITIES.map((capability) => (
                <label key={capability} className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selected.has(capability)}
                    onChange={(event) => toggle(clientKey, capability, event.target.checked)}
                  />
                  <span>
                    <span className="font-medium">{capability}</span>
                    <span className="block text-xs text-slate-500">{CAPABILITY_LABELS[capability]}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
