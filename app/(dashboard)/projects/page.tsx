import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import ProjectsClient from './ProjectsClient';

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav current="projects" userEmail={session.user?.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectsClient />
      </main>
    </div>
  );
}
