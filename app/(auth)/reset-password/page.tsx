'use client';

import { useActionState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { resetPasswordAction, type AuthActionState } from '@/lib/actions/auth';
import { AuthShell } from '@/components/marketing/AuthShell';

const initialState: AuthActionState = {};

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <AuthShell
      title="Reset password"
      subtitle="Choose a new password for your account."
      showGoogle={false}
      footer={
        <>
          <Link href="/login" className="font-medium text-[var(--mkt-accent)] underline underline-offset-2">
            Back to sign in
          </Link>
        </>
      }
    >
      {!token ? (
        <p className="mkt-error">This reset link is missing or invalid.</p>
      ) : (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />

          <div>
            <label htmlFor="password" className="mkt-label">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="mkt-input"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="mkt-label">
              Confirm password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="mkt-input"
              placeholder="Repeat password"
            />
          </div>

          {state.error ? <p className="mkt-error">{state.error}</p> : null}
          {state.success ? (
            <p className="mkt-success">
              {state.success}{' '}
              <Link href="/login" className="underline underline-offset-2">
                Sign in
              </Link>
            </p>
          ) : null}

          <button type="submit" disabled={pending || Boolean(state.success)} className="mkt-btn-primary">
            {pending ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--mkt-paper)] text-[var(--mkt-muted)]">
          Loading…
        </div>
      }
    >
      <ResetForm />
    </Suspense>
  );
}
