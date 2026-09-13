import Link from 'next/link';
import { SITE } from '@/lib/site';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--mkt-paper)] text-[var(--mkt-ink)]">
      <SiteHeader solid />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
          Legal
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-[var(--mkt-muted)]">Last updated: {updated}</p>
        <div className="legal-prose mt-12">{children}</div>
        <p className="mt-16 border-t border-[var(--mkt-line)] pt-8 text-sm text-[var(--mkt-muted)]">
          Questions?{' '}
          <a
            href={`mailto:${SITE.supportEmail}`}
            className="text-[var(--mkt-accent)] underline underline-offset-2"
          >
            {SITE.supportEmail}
          </a>
          {' · '}
          <Link href="/" className="underline underline-offset-2 hover:text-[var(--mkt-ink)]">
            Back home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
