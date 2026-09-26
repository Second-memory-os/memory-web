import DashboardNav from '@/components/DashboardNav';

export default function AppFrame({
  current,
  userEmail,
  children,
}: {
  current: 'dashboard' | 'projects' | 'daily' | 'settings';
  userEmail?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--mkt-wash)] text-[var(--mkt-ink)]">
      <DashboardNav current={current} userEmail={userEmail} />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
