import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AppFrame from '@/components/AppFrame';
import DailyClient from './DailyClient';

export default async function DailyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <AppFrame current="daily" userEmail={session.user?.email}>
      <DailyClient />
    </AppFrame>
  );
}
