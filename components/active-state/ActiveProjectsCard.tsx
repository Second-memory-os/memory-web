import Link from 'next/link';

export type ActiveProject = {
  id: string;
  name: string;
  heat: 'hot' | 'active' | 'open' | 'quiet';
  lastActiveAt?: string | null;
  openLoops: number;
};

const HEAT: Record<ActiveProject['heat'], string> = {
  hot: 'Last day',
  active: 'This week',
  open: 'Open loops',
  quiet: 'Quiet',
};

export default function ActiveProjectsCard({ projects }: { projects: ActiveProject[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active projects</p>
      {projects.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No project has been active this week.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={`/projects/${project.id}`} className="flex items-center justify-between py-2 text-sm hover:text-indigo-700">
                <span className="font-medium text-slate-900">{project.name}</span>
                <span className="text-xs text-slate-500">{HEAT[project.heat]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
