import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { oauthIssuer } from '@/lib/oauth/config';
import { OAuthError } from '@/lib/oauth/clients';
import { parseAuthorizeParams, validateAuthorizeRequest } from '@/lib/oauth/store';
import ConsentForm from './ConsentForm';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OauthConsentPage({ searchParams }: Props) {
  const session = await auth();
  const raw = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') qs.set(key, value);
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
  }

  if (!session?.user?.id) {
    const login = new URL('/login', oauthIssuer());
    login.searchParams.set('callbackUrl', `/oauth/consent?${qs.toString()}`);
    redirect(login.toString());
  }

  const params = parseAuthorizeParams(qs);
  let resource = '';
  let clientName = params.client_id;
  let error: string | undefined;

  try {
    const validated = await validateAuthorizeRequest(params);
    resource = validated.resource;
    clientName = validated.client.clientName || params.client_id;
  } catch (e) {
    error = e instanceof OAuthError ? e.errorDescription || e.error : 'Invalid request';
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          MemoryOS
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Connect Claude to MemoryOS</h1>
        <p className="mt-2 text-sm text-slate-600">
          Signed in as <span className="font-medium text-slate-900">{session.user.email}</span>
        </p>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm text-slate-700">
              <strong>{clientName}</strong> wants to access your MemoryOS tools (timeline, search,
              context) for this account only.
            </p>
            <p className="mt-2 break-all rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700">
              {resource}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Memories stay on your Mac. This URL is your Cloudflare tunnel — it can change when
              MemoryOS restarts; that is OK.
            </p>
            <ConsentForm
              responseType={params.response_type}
              clientId={params.client_id}
              redirectUri={params.redirect_uri}
              state={params.state}
              codeChallenge={params.code_challenge}
              codeChallengeMethod={params.code_challenge_method || 'S256'}
              scope={params.scope || 'mcp:tools'}
              resource={resource}
            />
          </>
        )}
      </div>
    </div>
  );
}
