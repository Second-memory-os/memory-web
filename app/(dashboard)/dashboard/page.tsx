import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { userConnections } from '@/lib/db/schema';
import { ensureManagedMemoryConnection } from '@/lib/memory-provisioning';
import { isSelfHostedProvider } from '@/lib/ai-models';
import { ensureUserConnectionsSchema } from '@/lib/db/ensure-user-connections';
import DashboardNav from '@/components/DashboardNav';
import DashboardClient from './DashboardClient';

function DashboardError({ detail }: { detail: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg rounded-xl border border-red-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-red-700">Dashboard couldn&apos;t load</h1>
        <p className="mt-2 text-sm text-slate-600">
          Usually <code className="rounded bg-slate-100 px-1">DATABASE_URL</code> on Vercel is
          missing or still set to <code className="rounded bg-slate-100 px-1">localhost</code>.
          Point it at cloud Postgres, redeploy, then open{' '}
          <a className="underline" href="/api/health/db">
            /api/health/db
          </a>
          .
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
          {detail}
        </pre>
        <div className="mt-4 flex gap-3">
          <a
            href="/dashboard"
            className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </a>
          <a
            href="/api/health/db"
            className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800"
          >
            Check DB health
          </a>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      redirect('/login');
    }

    await ensureManagedMemoryConnection(session.user.id);
    try {
      await ensureUserConnectionsSchema();
    } catch (schemaError) {
      // Schema ensure can fail on locked DBs; still try to render if columns already exist.
      console.warn('[dashboard] schema ensure failed', schemaError);
    }

    const [connection] = await db
      .select()
      .from(userConnections)
      .where(eq(userConnections.userId, session.user.id))
      .limit(1);

    const connectionReady = Boolean(
      connection?.openaiKeyEncrypted ||
        (isSelfHostedProvider(connection?.aiProvider) && connection?.aiBaseUrl)
    );

    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav current="dashboard" userEmail={session.user?.email} />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardClient connectionReady={connectionReady} />
        </main>
      </div>
    );
  } catch (error) {
    // next/navigation redirect throws; rethrow so Next can handle it
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      String((error as { digest?: string }).digest || '').startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }
    const detail = error instanceof Error ? error.message : 'Unknown server error';
    console.error('[dashboard] render failed', error);
    return <DashboardError detail={detail} />;
  }
}
