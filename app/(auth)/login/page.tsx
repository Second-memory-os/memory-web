'use client';

import { useActionState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction, type AuthActionState } from '@/lib/actions/auth';
import { AuthShell } from '@/components/marketing/AuthShell';

const initialState: AuthActionState = {};

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Your memory stays on your Mac."
      callbackUrl={callbackUrl}
      footer={
        <>
          No account?{' '}
          <Link href="/signup" className="font-medium text-[var(--mkt-accent)] underline underline-offset-2">
            Get access
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div>
          <label htmlFor="email" className="mkt-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mkt-input"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="mkt-label mb-0">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[var(--mkt-accent)] underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            className="mkt-input"
            placeholder="••••••••"
          />
        </div>

        {state.error ? <p className="mkt-error">{state.error}</p> : null}

        <button type="submit" disabled={pending} className="mkt-btn-primary">
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--mkt-paper)] text-[var(--mkt-muted)]">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
