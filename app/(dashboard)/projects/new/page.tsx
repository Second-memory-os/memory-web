import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AppFrame from '@/components/AppFrame';
import NewProjectClient from './NewProjectClient';

export default async function NewProjectPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <AppFrame current="projects" userEmail={session.user?.email}>
      <NewProjectClient />
    </AppFrame>
  );
}
