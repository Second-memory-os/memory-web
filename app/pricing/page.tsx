import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--mkt-paper)] text-[var(--mkt-ink)]">
      <SiteHeader solid />
      <main className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
            Pricing
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight sm:text-5xl">
            Simple pricing
          </h1>
          <p className="mt-4 text-[var(--mkt-muted)]">
            Start free on your Mac. Your memory stays local either way.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              name: 'Free',
              price: '$0',
              blurb: 'Personal capture and MCP on one Mac.',
              features: ['Local SQLite memory', 'Open loops', 'Claude / Cursor MCP', 'Your own AI key'],
              cta: 'Get started',
              href: '/signup',
              highlight: false,
            },
            {
              name: 'Pro',
              price: '$12',
              blurb: 'For builders who live in many AI tabs.',
              features: [
                'Everything in Free',
                'Cross-agent bridge',
                'Priority support',
                'Higher capture budgets',
              ],
              cta: 'Get Pro access',
              href: '/signup',
              highlight: true,
            },
            {
              name: 'Team',
              price: 'Custom',
              blurb: 'Shared playbooks without shared memory clouds.',
              features: ['Per-seat billing', 'Admin controls', 'SSO (roadmap)', 'Dedicated support'],
              cta: 'Contact us',
              href: '/contact',
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-8 ${
                plan.highlight
                  ? 'border-[var(--mkt-accent)] bg-[var(--mkt-accent-soft)]'
                  : 'border-[var(--mkt-line)] bg-white'
              }`}
            >
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold">
                {plan.price}
                {plan.price.startsWith('$') && plan.price !== '$0' ? (
                  <span className="text-base font-normal text-[var(--mkt-muted)]">/mo</span>
                ) : null}
              </p>
              <p className="mt-3 text-sm text-[var(--mkt-muted)]">{plan.blurb}</p>
              <ul className="mt-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-[var(--mkt-muted)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--mkt-accent)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold transition ${
                  plan.highlight
                    ? 'bg-[var(--mkt-ink)] text-white hover:bg-[var(--mkt-accent)]'
                    : 'border border-[var(--mkt-line)] bg-white hover:border-[var(--mkt-accent)]'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
