import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { SITE } from '@/lib/site';
import { GoogleSignInButton } from '@/components/marketing/GoogleSignInButton';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  showGoogle = true,
  callbackUrl = '/dashboard',
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showGoogle?: boolean;
  callbackUrl?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--mkt-paper)] text-[var(--mkt-ink)]">
      <SiteHeader solid />
      <main className="relative flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 50% 0%, var(--mkt-accent-soft) 0%, transparent 55%)',
          }}
        />
        <div className="relative w-full max-w-md">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--mkt-ink)]"
            >
              {SITE.name}
            </Link>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm text-[var(--mkt-muted)]">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-[var(--mkt-line)] bg-white p-7 shadow-[0_20px_60px_-40px_rgba(10,10,10,0.35)] sm:p-8">
            {showGoogle ? (
              <>
                <GoogleSignInButton callbackUrl={callbackUrl} />
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[var(--mkt-line)]" />
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--mkt-muted)]">
                    or
                  </span>
                  <div className="h-px flex-1 bg-[var(--mkt-line)]" />
                </div>
              </>
            ) : null}
            {children}
          </div>

          {footer ? <div className="mt-6 text-center text-sm text-[var(--mkt-muted)]">{footer}</div> : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
