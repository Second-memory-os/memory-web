import Link from 'next/link';
import { FOOTER_LINKS, NAV_LINKS, SITE } from '@/lib/site';

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  return (
    <header
      className={`sticky top-0 z-50 border-b ${
        solid
          ? 'border-[var(--mkt-line)] bg-[var(--mkt-paper)]'
          : 'border-[var(--mkt-line)]/80 bg-[var(--mkt-paper)]/90 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--mkt-ink)]"
        >
          {SITE.name}
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)] sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[var(--mkt-ink)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--mkt-accent)]"
          >
            Get access
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--mkt-line)] bg-[var(--mkt-paper)]">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--mkt-ink)]">
              {SITE.name}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--mkt-muted)]">
              {SITE.tagline}. Your memory stays on your Mac — never in our cloud database.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--mkt-muted)] transition hover:text-[var(--mkt-ink)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-12 text-xs text-[var(--mkt-muted)]">
          © {new Date().getFullYear()} {SITE.company}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
