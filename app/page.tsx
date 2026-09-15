import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { SITE } from '@/lib/site';

function HeroIllustration() {
  return (
    <div
      className="mkt-drift relative mx-auto w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-[var(--mkt-line)] bg-[var(--mkt-wash)] shadow-[0_24px_80px_-40px_rgba(20,24,22,0.35)]"
      aria-hidden
    >
      <svg viewBox="0 0 640 420" className="h-auto w-full" fill="none">
        <rect width="640" height="420" fill="#F4F7F6" />
        {/* Soft wash */}
        <circle cx="520" cy="80" r="120" fill="#E8F5F0" opacity="0.9" />
        <circle cx="80" cy="340" r="100" fill="#E8F5F0" opacity="0.55" />

        {/* Menu bar */}
        <rect x="48" y="40" width="544" height="36" rx="10" fill="#141816" />
        <circle cx="72" cy="58" r="5" fill="#0F6E56" />
        <text x="92" y="63" fill="#fff" fontSize="12" fontFamily="system-ui,sans-serif">
          MemoryOS
        </text>
        <text x="480" y="63" fill="#A8B5AF" fontSize="11" fontFamily="system-ui,sans-serif">
          Capturing · Private
        </text>

        {/* Timeline card */}
        <rect x="64" y="100" width="280" height="200" rx="16" fill="#fff" stroke="#E4EBE8" />
        <text x="88" y="136" fill="#141816" fontSize="15" fontWeight="600" fontFamily="system-ui,sans-serif">
          Today&apos;s timeline
        </text>
        <rect x="88" y="156" width="180" height="10" rx="5" fill="#E8F5F0" />
        <rect x="88" y="180" width="220" height="8" rx="4" fill="#E4EBE8" />
        <rect x="88" y="200" width="160" height="8" rx="4" fill="#E4EBE8" />
        <rect x="88" y="232" width="72" height="28" rx="14" fill="#0F6E56" />
        <text x="100" y="250" fill="#fff" fontSize="11" fontFamily="system-ui,sans-serif">
          On this Mac
        </text>
        <rect x="172" y="232" width="100" height="28" rx="14" fill="#F4F7F6" stroke="#E4EBE8" />
        <text x="186" y="250" fill="#5C6561" fontSize="11" fontFamily="system-ui,sans-serif">
          Not the cloud
        </text>

        {/* Open loops card */}
        <rect x="368" y="100" width="208" height="132" rx="16" fill="#141816" />
        <text x="392" y="136" fill="#fff" fontSize="14" fontWeight="600" fontFamily="system-ui,sans-serif">
          Open loops
        </text>
        <rect x="392" y="156" width="160" height="8" rx="4" fill="#2A3330" />
        <rect x="392" y="176" width="120" height="8" rx="4" fill="#2A3330" />
        <text x="392" y="210" fill="#7DCFB6" fontSize="12" fontFamily="system-ui,sans-serif">
          3 waiting · auto-tracked
        </text>

        {/* MCP bridge */}
        <rect x="368" y="252" width="208" height="100" rx="16" fill="#fff" stroke="#E4EBE8" />
        <text x="392" y="288" fill="#141816" fontSize="13" fontWeight="600" fontFamily="system-ui,sans-serif">
          Cross-agent bridge
        </text>
        <text x="392" y="312" fill="#5C6561" fontSize="11" fontFamily="system-ui,sans-serif">
          Claude → ChatGPT → Cursor
        </text>
        <text x="392" y="332" fill="#0F6E56" fontSize="11" fontFamily="system-ui,sans-serif">
          One memory · every AI
        </text>
      </svg>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--mkt-paper)] text-[var(--mkt-ink)]">
      <SiteHeader />

      {/* Hero — brand first, one composition */}
      <section className="relative overflow-hidden border-b border-[var(--mkt-line)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, #e8f5f0 0%, transparent 55%), radial-gradient(ellipse 40% 40% at 100% 20%, #f4f7f6 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <p className="mkt-rise text-sm font-medium uppercase tracking-[0.16em] text-[var(--mkt-accent)]">
              {SITE.name}
            </p>
            <h1 className="mkt-rise mkt-rise-delay-1 mt-4 font-[family-name:var(--font-display)] text-[2.65rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.35rem]">
              Your memory that
              <br />
              closes open loops
            </h1>
            <p className="mkt-rise mkt-rise-delay-2 mt-6 max-w-md text-lg leading-relaxed text-[var(--mkt-muted)]">
              Capture personal context on your Mac. Surface what still needs you.
              Give Claude, ChatGPT, and Cursor the same private memory — without a
              cloud memory database.
            </p>
            <div className="mkt-rise mkt-rise-delay-3 mt-9 flex flex-wrap items-center gap-3">
              <a
                href="/downloads/MemoryOS.dmg"
                download
                className="inline-flex items-center gap-2.5 rounded-full bg-[var(--mkt-ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--mkt-accent)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/memoryos-icon.png"
                  alt=""
                  width={22}
                  height={22}
                  className="rounded-[5px]"
                />
                Download for Mac
              </a>
              <Link
                href="/signup"
                className="rounded-full border border-[var(--mkt-line)] bg-white px-6 py-3 text-sm font-medium text-[var(--mkt-ink)] transition hover:border-[var(--mkt-accent)] hover:text-[var(--mkt-accent)]"
              >
                Create account
              </Link>
            </div>
          </div>
          <HeroIllustration />
        </div>
      </section>

      {/* How it helps */}
      <section id="how-it-helps" className="scroll-mt-20 border-b border-[var(--mkt-line)] bg-[var(--mkt-wash)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
            How it helps
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
            Stay on top of work without rebuilding context in every chat
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--mkt-muted)] leading-relaxed">
            MemoryOS watches the work already happening on your Mac, remembers what
            matters, and brings that context into the AI tools you already use.
          </p>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Captures your personal context',
                body: 'Active-window capture and optional voice notes turn what you are doing into searchable memory — privately, on this machine.',
              },
              {
                step: '02',
                title: 'Finds your open loops',
                body: 'Scans comm apps and browser tabs for unanswered asks, follow-ups, and commitments so nothing important slips.',
              },
              {
                step: '03',
                title: 'Bridges every AI you use',
                body: 'Via MCP, Claude, ChatGPT, Cursor, and Perplexity can read the same local memory — including continuing from another agent’s tab.',
              },
            ].map((item) => (
              <div key={item.step}>
                <p className="font-[family-name:var(--font-display)] text-sm text-[var(--mkt-accent)]">
                  {item.step}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--mkt-muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we provide */}
      <section id="what-we-provide" className="scroll-mt-20 border-b border-[var(--mkt-line)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
            What we provide
          </p>
          <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
            A memory layer that works with the tools you already open
          </h2>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: 'macOS menu bar agent',
                body: 'Lightweight capture of the frontmost work session. Soft-pauses when you are idle so you are not burning AI tokens for a frozen screen.',
              },
              {
                title: 'Open-loop inbox',
                body: 'Action items from Gmail, LinkedIn, WhatsApp, Slack, and more — ranked by relevance, not noise.',
              },
              {
                title: 'MCP for Claude, Cursor & ChatGPT',
                body: 'One local MCP server. Timeline memory for life and work; agent context so one AI can continue another’s thread by tab name.',
              },
              {
                title: 'Your keys, your models',
                body: 'Vision and chat run with the AI key you configure (OpenRouter / OpenAI). We do not sell your memory or train on it.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-[var(--mkt-line)] bg-white p-7 transition hover:border-[var(--mkt-accent)]/40"
              >
                <h3 className="text-lg font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--mkt-muted)]">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who / why */}
      <section id="who" className="scroll-mt-20 border-b border-[var(--mkt-line)] bg-[var(--mkt-wash)]">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
              Who it is for
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
              Builders who live in many AI tabs
            </h2>
            <ul className="mt-8 space-y-4 text-[var(--mkt-muted)]">
              {[
                'Founders and operators juggling Slack, email, and planning docs',
                'Engineers who want Cursor and Claude to share project context',
                'Anyone tired of re-explaining “who I am” to every new chat',
              ].map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--mkt-accent)]" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
              Why people use it
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
              Because context-switching should not erase your week
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-[var(--mkt-muted)]">
              Without a personal memory layer, every AI starts from zero. MemoryOS
              keeps a continuous record of what you worked on, who you owe, and what
              you decided — then lets your tools query it when you ask.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--mkt-muted)]">
              You get fewer dropped follow-ups, faster handoffs between Claude and
              ChatGPT, and a Mac that actually remembers.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy — core motto */}
      <section id="privacy" className="scroll-mt-20 border-b border-[var(--mkt-line)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
            Own your memory
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
            On your system, all your memory is stored on your Mac — not in a cloud database
          </h2>
          <p className="mt-5 max-w-2xl text-[var(--mkt-muted)] leading-relaxed">
            We take privacy seriously. Your capture timeline and agent sessions live
            in the public schema of your MemoryOS Postgres database. Account login and API keys are handled
            separately so we can sign you in.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Stored in your Postgres',
                body: 'Timeline memories and agent chat snapshots stay in the public schema of your MemoryOS database.',
              },
              {
                title: 'No cloud memory database',
                body: 'We do not host a remote copy of your On-Device Memory for analytics or training.',
              },
              {
                title: 'Transient AI processing',
                body: 'When capture needs vision or transcription, content is sent to the provider behind your key only to produce the result — not to train models on our behalf.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-[var(--mkt-accent-soft)] px-6 py-7"
              >
                <h3 className="font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--mkt-muted)]">{item.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-[var(--mkt-muted)]">
            Read the full{' '}
            <Link href="/privacy-policy" className="font-medium text-[var(--mkt-accent)] underline underline-offset-2">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/limited-use-disclosure" className="font-medium text-[var(--mkt-accent)] underline underline-offset-2">
              Limited Use Disclosure
            </Link>
            .
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--mkt-ink)] text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-center">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
              No setup maze. Download and begin.
            </h2>
            <p className="mt-3 max-w-lg text-white/65">
              Sign in once, grant Screen Recording, connect your AI key, and MemoryOS
              starts building the memory your agents can actually use.
            </p>
          </div>
          <a
            href="/downloads/MemoryOS.dmg"
            download
            className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[var(--mkt-ink)] transition hover:bg-[var(--mkt-accent-soft)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/memoryos-icon.png"
              alt=""
              width={22}
              height={22}
              className="rounded-[5px]"
            />
            Download for Mac
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
