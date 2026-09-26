import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AppFrame from '@/components/AppFrame';
import ProjectDetailClient from './ProjectDetailClient';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id } = await params;

  return (
    <AppFrame current="projects" userEmail={session.user?.email}>
      <ProjectDetailClient projectId={id} />
    </AppFrame>
  );
}
