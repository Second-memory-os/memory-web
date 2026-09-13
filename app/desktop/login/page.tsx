import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { lt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { desktopLoginSessions } from '@/lib/db/schema';
import { buildDesktopCallbackUrl, mintApiAccessToken } from '@/lib/api-auth';
import DesktopLoginClient from './DesktopLoginClient';

type SearchParams = Promise<{ session?: string }>;

export default async function DesktopLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { session: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-bold">Invalid desktop login link</h1>
          <p className="text-white/60">
            Open MemoryOS Desktop and click Sign in to start again.
          </p>
        </div>
      </div>
    );
  }

  const session = await auth();

  if (!session?.user?.id) {
    const callbackUrl = `/desktop/login?session=${encodeURIComponent(sessionId)}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const token = await mintApiAccessToken({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db
    .insert(desktopLoginSessions)
    .values({
      id: sessionId,
      userId: session.user.id,
      token,
      expiresAt,
      consumed: false,
    })
    .onConflictDoUpdate({
      target: desktopLoginSessions.id,
      set: {
        token,
        userId: session.user.id,
        expiresAt,
        consumed: false,
      },
    });

  await db
    .delete(desktopLoginSessions)
    .where(lt(desktopLoginSessions.expiresAt, new Date()));

  const deepLink = buildDesktopCallbackUrl(token);

  return (
    <DesktopLoginClient email={session.user.email ?? ''} deepLink={deepLink} />
  );
}
