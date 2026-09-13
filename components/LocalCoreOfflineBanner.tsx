'use client';

import { useEffect, useState } from 'react';
import { checkLocalCoreHealth } from '@/lib/local-core-health';

export default function LocalCoreOfflineBanner() {
  const [healthStatus, setHealthStatus] = useState<{
    isRunning: boolean;
    engine?: string;
    mode?: string;
    path?: string;
    error?: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const check = async () => {
      const status = await checkLocalCoreHealth();
      if (mounted) {
        setHealthStatus(status);
        setIsChecking(false);
      }
    };

    // Initial check
    check();

    // Re-check every 10 seconds
    intervalId = setInterval(check, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Don't show anything while checking or if everything is running
  if (isChecking || healthStatus?.isRunning) {
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
          <h3 className="text-lg font-semibold text-slate-900 mb-2">MemoryOS isn't running</h3>
          <div className="text-slate-700 space-y-2 text-sm">
            <p>
              Your memory is stored on this computer and isn't accessible because the MemoryOS
              local service is offline.
            </p>
            <div className="mt-4 space-y-1">
              <p className="font-medium text-slate-900">To reconnect:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Open the MemoryOS menu bar app</li>
                <li>Wait a few seconds for the Local Core to start</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span>Local Core: Offline</span>
              </div>
              {healthStatus?.error && <span className="text-slate-400">• {healthStatus.error}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
