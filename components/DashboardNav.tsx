'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { signOutAction } from '@/lib/actions/auth';

interface DashboardNavProps {
  current?: 'dashboard' | 'projects' | 'daily' | 'settings';
  userEmail?: string | null;
}

export default function DashboardNav({ current = 'dashboard', userEmail }: DashboardNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Home', href: '/dashboard' },
    { id: 'projects', label: 'Projects', href: '/projects' },
    { id: 'daily', label: 'Daily', href: '/daily' },
    { id: 'settings', label: 'Settings', href: '/settings' },
  ] as const;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--mkt-line)] bg-[var(--mkt-paper)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--mkt-ink)]">
            MemoryOS
          </Link>
          <nav className="hidden items-center gap-5 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`text-sm ${
                  current === item.id
                    ? 'text-[var(--mkt-ink)]'
                    : 'text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {userEmail ? (
            <span className="hidden text-xs text-[var(--mkt-muted)] md:inline">{userEmail}</span>
          ) : null}
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
