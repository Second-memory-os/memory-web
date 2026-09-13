import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/LegalPage';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service" updated={SITE.termsUpdated}>
      <h2>Introduction</h2>
      <p>
        This Agreement is a legal contract between You (&quot;You&quot; or
        &quot;Your&quot;) and {SITE.company} (&quot;MemoryOS&quot;), governing Your use
        of MemoryOS&apos;s software, websites, and related services. By accessing or
        using MemoryOS, You agree to be bound by these Terms.
      </p>

      <h3>Acceptance</h3>
      <p>
        You affirm that You are of legal age to form a binding contract. If You do not
        agree, You must not use MemoryOS. Acceptance is indicated by using the
        Service, creating an Account, or clicking to accept during sign-up.
      </p>

      <h3>Description of Service</h3>
      <p>
        MemoryOS provides a personal memory layer for macOS, including local capture,
        open-loop detection, and MCP connectivity so AI clients can query Your
        On-Device Memory. The Service is intended for Your personal, business, or
        internal organizational use. You are responsible for Your Mac, internet access,
        and required permissions (Screen Recording, Accessibility, Microphone as
        applicable).
      </p>

      <h3>Beta Service</h3>
      <p>
        Some features may be offered as Beta. Beta features are experimental and may
        change or discontinue. MemoryOS is not liable for harm related to modification
        or discontinuation of Beta features.
      </p>

      <h3>Free Trial</h3>
      <p>
        If We offer a free trial, services may be provided without charge until the
        trial ends. Trial services are provided &quot;as is.&quot; Export or back up
        local data before a trial ends if You wish to retain it outside the Application.
      </p>

      <h2>User Sign-up Obligations</h2>
      <p>
        You agree to provide true, accurate, and complete Account information and to
        keep it updated. We may suspend or terminate Accounts with incorrect or
        misleading information.
      </p>

      <h2>Restrictions on Use</h2>
      <p>You shall not:</p>
      <ul>
        <li>Misuse the Service, including unauthorized sharing of Account credentials</li>
        <li>Reverse engineer, decompile, or attempt to extract source code except as allowed by law</li>
        <li>Use the Service to violate applicable laws or third-party rights</li>
        <li>
          Record or capture conversations involving others without legally required
          consent
        </li>
        <li>Attempt to access another user&apos;s On-Device Memory or Account</li>
      </ul>

      <h2>Third-Party Applications and AI Providers</h2>
      <p>
        MemoryOS may interact with third-party applications and AI providers (Claude,
        ChatGPT, Cursor, OpenRouter, OpenAI, and others). Separate terms apply to those
        services. You are responsible for reviewing and agreeing to them. MemoryOS is
        not liable for third-party applications, models, or their content.
      </p>
      <p>
        When You connect an MCP client or API key, You authorize transmission of
        retrieved memory slices or capture payloads to those providers under Your own
        agreements with them.
      </p>

      <h2>Fees and Payments</h2>
      <p>
        Subscription plans, payment methods, renewals, and refunds (if any) are
        described on Our pricing pages and in Our Return Policy. We may modify pricing
        effective on Your next billing cycle, with notice where required.
      </p>

      <h2>Personal Information and Privacy</h2>
      <p>
        We protect Personal Data as described in Our{' '}
        <a href="/privacy-policy">Privacy Policy</a>. You are responsible for keeping
        Account credentials confidential and for notifying Us promptly of unauthorized
        use.
      </p>
      <p>
        On-Device Memory remains on Your Mac. You are responsible for securing Your
        Device and local backups.
      </p>

      <h2>Communications</h2>
      <p>
        You may receive essential service announcements and administrative messages.
        You may opt out of non-essential marketing emails where offered. Service-related
        notices remain part of the Service.
      </p>

      <h2>Inactive Accounts</h2>
      <p>
        We may terminate Accounts that remain inactive for an extended period after
        prior notice, where feasible. Local On-Device Memory on Your Mac is not deleted
        by Account inactivity alone; You control local files on Your Device.
      </p>

      <h2>User-Generated Content</h2>
      <p>
        You are responsible for content You create, capture, or publish through the
        Service, including compliance with law and intellectual property rights. We may
        remove Account-side content that violates these Terms.
      </p>

      <h2>Disclaimer of Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; TO THE
        MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED,
        INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
        NON-INFRINGEMENT. WE DO NOT WARRANT THAT CAPTURE, OPEN-LOOP DETECTION, OR AI
        SUMMARIES WILL BE COMPLETE OR ERROR-FREE.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, MEMORYOS AND ITS AFFILIATES WILL NOT BE
        LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
        DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR BUSINESS, ARISING FROM YOUR USE OF THE
        SERVICE.
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless MemoryOS and its affiliates, officers,
        agents, and employees from claims arising out of Your use of the Service, Your
        violation of these Terms, or Your violation of any third-party rights —
        including claims related to recording without required consent.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms are governed by the laws applicable to {SITE.company}, without
        regard to conflict-of-law principles. Courts in that jurisdiction will have
        exclusive venue for disputes, except where prohibited by law.
      </p>

      <h2>Suspension and Termination</h2>
      <p>
        We may suspend or terminate access for breaches of these Terms, lawful requests
        from authorities, or unexpected technical or security issues. You may stop
        using the Service and delete local data at any time.
      </p>

      <h2>Modification of Terms</h2>
      <p>
        We may modify these Terms at any time by posting an updated version. Continued
        use after the effective date constitutes acceptance of the modified Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms:{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
      </p>
    </LegalPage>
  );
}
