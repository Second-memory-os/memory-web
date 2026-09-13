import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { userConnections } from '@/lib/db/schema';
import { ensureManagedMemoryConnection } from '@/lib/memory-provisioning';
import { isSelfHostedProvider } from '@/lib/ai-models';
import { ensureAiModelColumns } from '@/lib/db/ensure-ai-models';
import DashboardNav from '@/components/DashboardNav';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  await ensureManagedMemoryConnection(session.user.id);
  await ensureAiModelColumns();

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
}
