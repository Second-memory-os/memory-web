'use client';

import { useActionState } from 'react';
import Button from '@/components/ui/Button';
import {
  approveMcpConsentAction,
  type ConsentState,
} from '@/lib/oauth/consent-action';

const initial: ConsentState = {};

type Props = {
  responseType: string;
  clientId: string;
  redirectUri: string;
  state?: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  scope: string;
  resource: string;
};

export default function ConsentForm(props: Props) {
  const [state, formAction, pending] = useActionState(approveMcpConsentAction, initial);

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <input type="hidden" name="response_type" value={props.responseType} />
      <input type="hidden" name="client_id" value={props.clientId} />
      <input type="hidden" name="redirect_uri" value={props.redirectUri} />
      {props.state ? <input type="hidden" name="state" value={props.state} /> : null}
      <input type="hidden" name="code_challenge" value={props.codeChallenge} />
      <input type="hidden" name="code_challenge_method" value={props.codeChallengeMethod} />
      <input type="hidden" name="scope" value={props.scope} />
      <input type="hidden" name="resource" value={props.resource} />

      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" name="decision" value="approve" disabled={pending} fullWidth>
        {pending ? 'Connecting' : 'Allow access'}
      </Button>
      <Button type="submit" name="decision" value="deny" disabled={pending} variant="danger" fullWidth>
        Deny
      </Button>
    </form>
  );
}
