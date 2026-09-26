import { AuthShell } from '@/components/marketing/AuthShell';
import Button from '@/components/ui/Button';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const message =
    error === 'Configuration'
      ? 'Auth is misconfigured. Check Google credentials and AUTH_SECRET.'
      : error === 'OAuthAccountNotLinked'
        ? 'This email is already registered. Sign in with your password, or use Google if that is how you signed up.'
        : error
          ? `Error: ${error}`
          : 'Something went wrong during sign-in.';

  return (
    <AuthShell title="Sign-in error" subtitle={message} showGoogle={false}>
      <Button href="/login" fullWidth>
        Back to sign in
      </Button>
    </AuthShell>
  );
}
