'use client';

import Link from 'next/link';
import { signOutAction } from '@/lib/actions/auth';

interface DashboardNavProps {
  current?: 'dashboard' | 'projects' | 'daily' | 'settings';
  userEmail?: string | null;
}

export default function DashboardNav({ current = 'dashboard', userEmail }: DashboardNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Home', href: '/dashboard' },
    { id: 'projects', label: 'Projects', href: '/projects' },
    { id: 'daily', label: 'Daily Summary', href: '/daily' },
    { id: 'settings', label: 'Settings', href: '/settings' },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                M
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                MemoryOS
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = current === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-100 text-indigo-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="hidden md:inline-block text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                {userEmail}
              </span>
            )}
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-xs font-medium text-slate-500 hover:text-rose-600 px-2 py-1 rounded transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
