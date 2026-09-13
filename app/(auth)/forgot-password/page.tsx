'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction, type AuthActionState } from '@/lib/actions/auth';
import { AuthShell } from '@/components/marketing/AuthShell';

const initialState: AuthActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we will send a reset link."
      showGoogle={false}
      footer={
        <>
          Remembered it?{' '}
          <Link href="/login" className="font-medium text-[var(--mkt-accent)] underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
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

        {state.error ? <p className="mkt-error">{state.error}</p> : null}
        {state.success ? <p className="mkt-success">{state.success}</p> : null}

        <button type="submit" disabled={pending} className="mkt-btn-primary">
          {pending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthShell>
  );
}
