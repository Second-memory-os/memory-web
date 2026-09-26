import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AppFrame from '@/components/AppFrame';
import ProjectsClient from './ProjectsClient';

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <AppFrame current="projects" userEmail={session.user?.email}>
      <ProjectsClient />
    </AppFrame>
  );
}
