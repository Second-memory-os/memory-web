import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/LegalPage';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Return Policy',
};

export default function ReturnPolicyPage() {
  return (
    <LegalPage title="Return Policy" updated={SITE.termsUpdated}>
      <p>
        This Return Policy explains how refunds and cancellations work for paid
        MemoryOS subscriptions, if and when paid plans are offered.
      </p>

      <h2>Digital service</h2>
      <p>
        MemoryOS is a digital software service. Because access is provisioned
        immediately and On-Device Memory is created on Your Mac, purchases are
        generally non-returnable as physical goods. Local data on Your Device remains
        Yours to delete.
      </p>

      <h2>Cancellations</h2>
      <p>
        You may cancel a recurring subscription at any time from Your Account billing
        settings (or by contacting support). Cancellation stops future renewals; You
        retain access through the end of the current paid period unless otherwise
        stated at checkout.
      </p>

      <h2>Refunds</h2>
      <p>Unless required by applicable law or explicitly stated for a promotion:</p>
      <ul>
        <li>Fees already paid for the current billing period are non-refundable</li>
        <li>
          Free trials, if offered, do not incur charges until the trial converts under
          the terms shown at sign-up
        </li>
      </ul>
      <p>
        If You believe You were charged in error, contact{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> within 14 days
        of the charge with Your Account email and receipt details. We will review
        requests in good faith.
      </p>

      <h2>Chargebacks</h2>
      <p>
        Please contact Us before filing a chargeback so We can help resolve billing
        issues. Unresolved chargebacks may result in Account suspension.
      </p>

      <h2>Contact</h2>
      <p>
        Billing questions:{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
      </p>
    </LegalPage>
  );
}
