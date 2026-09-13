'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signupAction, type AuthActionState } from '@/lib/actions/auth';
import { AuthShell } from '@/components/marketing/AuthShell';

const initialState: AuthActionState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <AuthShell
      title="Get access"
      subtitle="Create your MemoryOS account. Memory stays on your Mac."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[var(--mkt-accent)] underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="mkt-label">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="mkt-input"
            placeholder="Your name"
          />
        </div>

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
          <label htmlFor="password" className="mkt-label">
            Password
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

        {state.error ? <p className="mkt-error">{state.error}</p> : null}

        <button type="submit" disabled={pending} className="mkt-btn-primary">
          {pending ? 'Creating…' : 'Create account'}
        </button>

        <p className="text-center text-xs leading-relaxed text-[var(--mkt-muted)]">
          By continuing you agree to our{' '}
          <Link href="/terms-of-service" className="text-[var(--mkt-accent)] underline underline-offset-2">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="text-[var(--mkt-accent)] underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
