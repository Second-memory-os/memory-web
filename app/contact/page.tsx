import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--mkt-paper)] text-[var(--mkt-ink)]">
      <SiteHeader solid />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
          Contact
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl">
          Contact us
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--mkt-muted)]">
          Questions about MemoryOS, privacy, billing, or security — we are here to
          help.
        </p>

        <div className="mt-12 space-y-6 rounded-2xl border border-[var(--mkt-line)] bg-[var(--mkt-wash)] p-8">
          <div>
            <p className="text-sm font-medium text-[var(--mkt-ink)]">Email</p>
            <a
              href={`mailto:${SITE.supportEmail}`}
              className="mt-1 inline-block text-[var(--mkt-accent)] underline underline-offset-2"
            >
              {SITE.supportEmail}
            </a>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--mkt-ink)]">Privacy & legal</p>
            <p className="mt-1 text-sm text-[var(--mkt-muted)]">
              See our{' '}
              <Link href="/privacy-policy" className="text-[var(--mkt-accent)] underline underline-offset-2">
                Privacy Policy
              </Link>
              ,{' '}
              <Link href="/terms-of-service" className="text-[var(--mkt-accent)] underline underline-offset-2">
                Terms of Service
              </Link>
              , and{' '}
              <Link href="/limited-use-disclosure" className="text-[var(--mkt-accent)] underline underline-offset-2">
                Limited Use Disclosure
              </Link>
              .
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--mkt-ink)]">Security reports</p>
            <p className="mt-1 text-sm text-[var(--mkt-muted)]">
              Please email vulnerabilities to {SITE.supportEmail} with reproduction
              steps. Do not disclose publicly until we have had time to investigate.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
