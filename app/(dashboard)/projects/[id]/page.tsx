import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
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
    <div className="min-h-screen bg-slate-50">
      <DashboardNav current="projects" userEmail={session.user?.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectDetailClient projectId={id} />
      </main>
    </div>
  );
}
