'use client';

import { useEffect, useState } from 'react';
import { checkLocalCoreHealth } from '@/lib/local-core-health';

type Status = {
  healthy: boolean;
  via: 'localhost' | 'tunnel' | 'none';
  pathHint?: string;
  error?: string;
};

export default function LocalCoreOfflineBanner() {
  const [status, setStatus] = useState<Status | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval>;

    const check = async () => {
      // Same-machine: Local Core on loopback (web + server on this Mac)
      const local = await checkLocalCoreHealth('http://127.0.0.1:3002');
      if (local.isRunning) {
        if (mounted) {
          setStatus({
            healthy: true,
            via: 'localhost',
            pathHint: local.path,
          });
          setIsChecking(false);
        }
        return;
      }

      // Remote / tunnel path (cloud web talking to this Mac)
      try {
        const res = await fetch('/api/desktop/tunnel', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setStatus({
              healthy: Boolean(data.healthy),
              via: data.healthy ? 'tunnel' : 'none',
              pathHint: data.pathHint,
              error: data.healthy ? undefined : data.error || local.error,
            });
            setIsChecking(false);
          }
          return;
        }
      } catch {
        // fall through
      }

      if (mounted) {
        setStatus({
          healthy: false,
          via: 'none',
          error: local.error || 'Local Core offline',
        });
        setIsChecking(false);
      }
    };

    check();
    intervalId = setInterval(check, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (isChecking || status?.healthy) {
    return null;
  }

  return (
    <div className="rounded-xl border-2 border-slate-300 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            MemoryOS Local Core isn&apos;t running
          </h3>
          <div className="text-slate-700 space-y-2 text-sm">
            <p>
              Your memories stay on your Mac. Production web needs the menu bar app
              running with Local Core + Cloudflare tunnel so the timeline can load.
            </p>
            <div className="mt-4 space-y-1">
              <p className="font-medium text-slate-900">To reconnect:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Open the MemoryOS menu bar app (from Applications)</li>
                <li>Sign in with the same account used on this site</li>
                <li>Wait until status shows Local Core / tunnel online, then refresh</li>
              </ol>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span>Local Core: Offline</span>
              </div>
              {status?.error && <span className="text-slate-400">• {status.error}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
