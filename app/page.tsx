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
          Today
        </text>
        <text x="88" y="164" fill="#141816" fontSize="12" fontFamily="system-ui,sans-serif">
          1. Send the founder messages
        </text>
        <text x="88" y="186" fill="#5C6561" fontSize="12" fontFamily="system-ui,sans-serif">
          2. Reply to the client
        </text>
        <text x="88" y="208" fill="#5C6561" fontSize="12" fontFamily="system-ui,sans-serif">
          3. Publish the product update
        </text>
        <text x="88" y="240" fill="#0F6E56" fontSize="11" fontFamily="system-ui,sans-serif">
          Not today · SEO article
        </text>

        {/* Open loops card */}
        <rect x="368" y="100" width="208" height="132" rx="16" fill="#141816" />
        <text x="392" y="136" fill="#fff" fontSize="14" fontWeight="600" fontFamily="system-ui,sans-serif">
          Your goal
        </text>
        <text x="392" y="162" fill="#A8B5AF" fontSize="11" fontFamily="system-ui,sans-serif">
          10 paying customers
        </text>
        <text x="392" y="186" fill="#7DCFB6" fontSize="11" fontFamily="system-ui,sans-serif">
          Next: 20 founder messages
        </text>
        <text x="392" y="210" fill="#A8B5AF" fontSize="11" fontFamily="system-ui,sans-serif">
          Drift if the week goes elsewhere
        </text>

        {/* MCP bridge */}
        <rect x="368" y="252" width="208" height="100" rx="16" fill="#fff" stroke="#E4EBE8" />
        <text x="392" y="288" fill="#141816" fontSize="13" fontWeight="600" fontFamily="system-ui,sans-serif">
          Every AI you open
        </text>
        <text x="392" y="312" fill="#5C6561" fontSize="11" fontFamily="system-ui,sans-serif">
          Claude · ChatGPT · Cursor
        </text>
        <text x="392" y="332" fill="#0F6E56" fontSize="11" fontFamily="system-ui,sans-serif">
          Context for this goal
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
              Know the one thing
              <br />
              to do right now
            </h1>
            <p className="mkt-rise mkt-rise-delay-2 mt-6 max-w-md text-lg leading-relaxed text-[var(--mkt-muted)]">
              You already have too many projects running. MemoryOS watches the work,
              holds the asks that would otherwise vanish, and tells you what moves
              today — and what to leave alone.
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

      <section id="use" className="scroll-mt-20 border-b border-[var(--mkt-line)] bg-[var(--mkt-wash)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
            What it is for
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
            Six jobs. Not another app to maintain.
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--mkt-muted)] leading-relaxed">
            MemoryOS is the operating layer for a person who is building more than one thing
            at once. You work. It keeps the thread, the ask, and the goal.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {[
              {
                n: '01',
                title: 'What should I do today?',
                body: 'Home does not hand you a pile of open work. It names the one thing to do now, then two more, and parks the rest under Not today.',
              },
              {
                n: '02',
                title: 'Remember the work without notes',
                body: 'The Mac agent keeps the session. When you close it, MemoryOS writes what mattered: the problem, the finding, the decision, and what is still open.',
              },
              {
                n: '03',
                title: 'Stop losing the asks',
                body: '“Reply to this.” “Send that.” “Check tomorrow.” Those become actions that move from detected to waiting to done, with who you are waiting on and when to follow up.',
              },
              {
                n: '04',
                title: 'Move the goal, not the task list',
                body: 'A goal is “10 paying customers,” not “write the landing page.” MemoryOS ties the week’s work to that goal and tells you when the hours went somewhere else.',
              },
              {
                n: '05',
                title: 'Post from what you actually did',
                body: 'When a session has a lesson, a failure, or a decision worth telling, it becomes an idea. Home shows three. Dismiss the ones you will not use.',
              },
              {
                n: '06',
                title: 'Every AI already knows the goal',
                body: 'Claude, ChatGPT, and Cursor can ask for the context of this objective: milestone, next action, blockers, recent work, and the decisions already made.',
              },
            ].map((item) => (
              <article
                key={item.n}
                className="rounded-2xl border border-[var(--mkt-line)] bg-white p-7"
              >
                <p className="font-[family-name:var(--font-display)] text-sm text-[var(--mkt-accent)]">{item.n}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--mkt-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="what-we-provide" className="scroll-mt-20 border-b border-[var(--mkt-line)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--mkt-accent)]">
            How it runs
          </p>
          <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
            A menu-bar Mac app, then the AIs you already use
          </h2>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: 'Menu bar',
                body: 'Today’s three actions, what to leave for later, and the current goal. Capture keeps running while you work.',
              },
              {
                title: 'Home',
                body: 'Set the goal and the milestone. See drift if the week went to the wrong project. Dismiss content ideas you will not post.',
              },
              {
                title: 'Actions',
                body: 'Asks from mail, LinkedIn, Slack, and WhatsApp land as actions, not a second todo app. Waiting items stay off Today until the follow-up date.',
              },
              {
                title: 'MCP',
                body: 'get_daily_focus, get_goals, and get_context with an objective. The other tools still read the timeline, decisions, and commitments.',
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
              People with several things in flight
            </h2>
            <ul className="mt-8 space-y-4 text-[var(--mkt-muted)]">
              {[
                'Founders deciding which project actually moves the goal this week',
                'Operators who lose “reply to this” between meetings',
                'Builders who refuse to re-explain the same goal in every AI tab',
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
              Because “what is open” is not a decision
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-[var(--mkt-muted)]">
              A todo list grows. A goal says what the week is for. MemoryOS keeps both:
              the asks that appear during the day, and whether the work you did
              actually moved the goal.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--mkt-muted)]">
              When you switch from Cursor to Claude, you do not start from zero.
              You hand it the milestone, the blocker, and the last decision.
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
              Download the Mac app. Open Home. Name the goal.
            </h2>
            <p className="mt-3 max-w-lg text-white/65">
              Capture stays on this machine. Today’s list, the actions, and the
              context your AIs read all come from that local memory.
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
