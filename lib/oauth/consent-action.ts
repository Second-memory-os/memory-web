'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { OAuthError } from '@/lib/oauth/clients';
import {
  buildAuthorizeRedirect,
  issueAuthorizationCode,
  validateAuthorizeRequest,
  assertResourceForUser,
  type AuthorizeParams,
} from '@/lib/oauth/store';

export type ConsentState = { error?: string };

export async function approveMcpConsentAction(
  _prev: ConsentState,
  formData: FormData
): Promise<ConsentState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be signed in' };
  }

  const params: AuthorizeParams = {
    response_type: String(formData.get('response_type') || 'code'),
    client_id: String(formData.get('client_id') || ''),
    redirect_uri: String(formData.get('redirect_uri') || ''),
    state: formData.get('state') ? String(formData.get('state')) : undefined,
    code_challenge: String(formData.get('code_challenge') || ''),
    code_challenge_method: String(formData.get('code_challenge_method') || 'S256'),
    scope: String(formData.get('scope') || 'mcp:tools'),
    resource: formData.get('resource') ? String(formData.get('resource')) : undefined,
  };

  const decision = String(formData.get('decision') || 'deny');

  try {
    const { resource, scope } = await validateAuthorizeRequest(params);
    await assertResourceForUser(session.user.id, resource);

    if (decision !== 'approve') {
      redirect(
        buildAuthorizeRedirect(params.redirect_uri, {
          error: 'access_denied',
          error_description: 'User denied MemoryOS MCP access',
          state: params.state,
        })
      );
    }

    const code = await issueAuthorizationCode({
      clientId: params.client_id,
      userId: session.user.id,
      redirectUri: params.redirect_uri,
      codeChallenge: params.code_challenge,
      codeChallengeMethod: params.code_challenge_method || 'S256',
      resource,
      scope,
    });

    redirect(
      buildAuthorizeRedirect(params.redirect_uri, {
        code,
        state: params.state,
      })
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof OAuthError) {
      return { error: error.errorDescription || error.error };
    }
    console.error('[oauth/consent]', error);
    return { error: 'Authorization failed' };
  }
}
