import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/LegalPage';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated={SITE.privacyUpdated}>
      <p className="callout">
        <strong>In short:</strong> We store Your On-Device Memory on Your Mac. Some
        content You capture may be sent transiently to trusted AI inference and
        transcription providers (using the keys You configure) solely to generate
        summaries, embeddings, open loops, and related features. That content is not
        retained by MemoryOS in a cloud memory database, is never sold by Us, and is
        not used by Us to train models. Using the Service means this Privacy Policy
        applies to You.
      </p>

      <h2>Interpretations and Definitions</h2>
      <h3>Interpretation</h3>
      <p>
        Words with an initial capital letter have meanings defined under the
        following conditions. The same meaning applies in singular or plural.
      </p>

      <h3>Definitions</h3>
      <ol>
        <li>
          <strong>Account</strong> means a unique account created for You to access
          our Service or parts of our Service.
        </li>
        <li>
          <strong>Application</strong> refers to MemoryOS, the software program
          provided by the Company (including the macOS menu bar agent and related
          clients).
        </li>
        <li>
          <strong>Company</strong> (referred to as either &quot;the Company&quot;,
          &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot;) refers to {SITE.company}.
        </li>
        <li>
          <strong>Device</strong> means any device that can access the Service, such
          as a Mac computer.
        </li>
        <li>
          <strong>On-Device Memory</strong> means the content the Application
          captures and builds into a personal memory store directly on Your Device —
          including screen and application context, open-loop findings, agent-session
          snapshots, and microphone/voice notes where permitted. On-Device Memory is
          stored locally (for example in a SQLite database under Your Mac&apos;s
          Application Support folder) and is not stored in a MemoryOS cloud memory
          database.
        </li>
        <li>
          <strong>Personal Data</strong> is information that relates to an identified
          or identifiable individual used for Your Account — such as email — and does
          not include Your On-Device Memory for organizational purposes within this
          Policy. That exclusion does not change how On-Device Memory may be
          classified under GDPR, CCPA, India&apos;s DPDP Act, or other laws; Your
          rights under those laws remain unaffected.
        </li>
        <li>
          <strong>Service</strong> refers to the Application and related websites,
          APIs, and MCP endpoints We operate.
        </li>
        <li>
          <strong>Service Provider</strong> means any natural or legal person who
          processes data on behalf of the Company, including third-party AI and
          large-language-model providers You connect (for example via Your own API
          key) where a feature requires it.
        </li>
        <li>
          <strong>Usage Data</strong> refers to data collected automatically from use
          of the Service infrastructure (for example session duration or diagnostic
          events), excluding On-Device Memory content.
        </li>
        <li>
          <strong>You</strong> means the individual or legal entity accessing or using
          the Service.
        </li>
      </ol>

      <h2>Collecting and using your Personal Data</h2>
      <h3>Personal Data</h3>
      <p>
        While using Our Service, We may ask You to provide personally identifiable
        information limited to:
      </p>
      <ul>
        <li>Email address</li>
        <li>Username or display name (if provided)</li>
        <li>
          Billing information, processed by Our payment providers — We do not store
          full card numbers Ourselves
        </li>
        <li>
          Encrypted AI API keys You choose to store so the Application and local
          server can call providers You authorize
        </li>
      </ul>

      <h3>Usage Data</h3>
      <p>
        Usage Data may be collected automatically through analytics or diagnostics. It
        may include feature usage, onboarding steps, IP address, and error reports You
        choose to send. Usage Data does not include the content of Your On-Device
        Memory.
      </p>

      <h3>Information Collected while Using the Application</h3>
      <p>
        With Your prior permission, the Application may collect on Your Device:
      </p>
      <ul>
        <li>
          Content from Your screen, browser activity, and interactions within
          supported applications (via Screen Recording and related permissions)
        </li>
        <li>Microphone / voice notes, when You enable them</li>
      </ul>
      <p>
        Where the Service is used to capture meetings, calls, or conversations
        involving other individuals, You are solely responsible for obtaining any
        consent required under applicable law before enabling audio capture.
      </p>
      <p>
        To generate summaries, open loops, embeddings, and related features, relevant
        content may be sent transiently to AI providers using credentials You
        configure. See &quot;AI and Language Model Processing&quot; below.
      </p>
      <p>
        You can enable or disable access to Screen Recording, Accessibility, and
        Microphone at any time through macOS System Settings.
      </p>

      <h2>AI and Language Model Processing</h2>
      <h3>Providers that process content as it is captured and indexed</h3>
      <p>
        Depending on the models and keys You configure, relevant content may be sent
        transiently to providers such as:
      </p>
      <ul>
        <li>OpenAI or OpenRouter (or compatible endpoints) — vision, chat, embeddings</li>
        <li>Whisper-compatible transcription endpoints — voice notes</li>
      </ul>
      <p>
        This content is processed solely to deliver the requested feature. MemoryOS
        does not use Your On-Device Memory to train its own models, and We do not sell
        Your data to third parties for their independent use. Retention by each
        provider is governed by Your agreement with that provider and any data
        processing terms applicable to the key You use.
      </p>

      <h3>The LLM You connect to query Your memory (MCP)</h3>
      <p>
        When You query Your memory through Claude Desktop, Cursor, ChatGPT, or another
        MCP client You authorize, a relevant retrieved slice of Your On-Device Memory
        is sent to the language model You connected. Because You select and authorize
        that connection Yourself, what that provider does with data once received is
        governed by Your agreement with that provider — not by Us. We recommend
        reviewing that provider&apos;s privacy policy.
      </p>

      <h2>Use of Your Personal Data</h2>
      <p>The Company may use Personal Data (account email, billing records) to:</p>
      <ul>
        <li>Provide and maintain Our Service</li>
        <li>Manage Your Account and registration</li>
        <li>Contact You about security notices or service updates</li>
        <li>Manage Your requests and support tickets</li>
        <li>For business transfers, where legally permitted</li>
        <li>Improve the Service using Usage Data (not On-Device Memory content)</li>
      </ul>
      <p>We do not sell Your personal information.</p>

      <h2>Retention</h2>
      <p>
        Your On-Device Memory is not held in a MemoryOS cloud memory database, so We
        have nothing of that content to retain on Our servers once local processing is
        complete — it remains on Your Device until You delete it or uninstall the
        Application.
      </p>
      <p>
        We retain Account Personal Data only as long as You remain an active user, or
        as needed to comply with legal obligations, resolve disputes, and enforce Our
        agreements. If You terminate Your Account, Account data is deleted or deleted
        promptly upon written request, subject to legal retention requirements.
      </p>

      <h2>Transfer of Your Personal Data</h2>
      <p>
        Account Personal Data may be processed at Our operating locations and through
        Service Providers, which may be outside Your jurisdiction. We take reasonable
        steps to treat Your data securely and in accordance with this Policy.
      </p>

      <h2>Delete Your Personal Data</h2>
      <p>
        You can delete On-Device Memory directly within the Application or by
        uninstalling MemoryOS and removing local data files on Your Mac.
      </p>
      <p>
        Contact Us at{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> to request
        access to, correction of, or deletion of Account Personal Data, or to
        terminate Your Account.
      </p>

      <h2>Disclosure of Your Personal Data</h2>
      <h3>Business Transactions</h3>
      <p>
        If the Company is involved in a merger, acquisition, or asset sale, Account
        Personal Data may be transferred, but Your On-Device Memory remains on Your
        Device and is not part of a Company-hosted memory database transfer.
      </p>
      <h3>Law enforcement</h3>
      <p>
        We may disclose Account Personal Data if required by law or valid requests by
        public authorities.
      </p>

      <h2>Security</h2>
      <p>
        We implement industry-standard measures for Account data, including encryption
        in transit (TLS) where applicable and encryption of stored API keys. No method
        of transmission or storage is 100% secure, and We cannot guarantee absolute
        security.
      </p>

      <h2>Service Providers</h2>
      <p>
        We may work with trusted Service Providers to operate MemoryOS, such as cloud
        hosts for Account authentication, payment processors, and email delivery.
        Providers that process On-Device Memory content for inference do so using keys
        You supply and solely to deliver features You enable.
      </p>

      <h2>India — DPDP Act</h2>
      <p>
        If You are located in India, the Digital Personal Data Protection Act, 2023
        gives You rights of access, correction, erasure, and grievance redressal. You
        may contact{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>

      <h2>GDPR — EEA/UK</h2>
      <p>
        If You are in the EEA or UK, We process Account information where We have a
        legal basis (contract, legitimate interests, consent for permission-gated
        capture, or legal obligation). Where On-Device Memory constitutes personal data
        under GDPR, You can exercise access, rectification, erasure, and objection
        rights directly on Your Device by editing or deleting content, or by
        uninstalling the Application.
      </p>

      <h2>California Privacy Rights (CCPA)</h2>
      <p>
        California residents may request to know what Account Personal Data We collect,
        request deletion, and opt out of &quot;sale&quot; or &quot;sharing.&quot; We do
        not sell or share Your Personal Data as those terms are defined under the CCPA.
        Contact {SITE.supportEmail} to exercise these rights.
      </p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        Our Service is not intended for anyone under the age of 18. We do not knowingly
        collect Account Personal Data from anyone under 18.
      </p>

      <h2>Reporting a Security Issue</h2>
      <p>
        Report potential vulnerabilities to{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>. Please do not
        publicly disclose the issue until We have had a reasonable opportunity to
        investigate.
      </p>

      <h2>Changes to this Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the new
        Policy on this page and update the &quot;Last updated&quot; date. Material
        changes may also be communicated by email or in-product notice.
      </p>

      <h2>Contact Us</h2>
      <ul>
        <li>
          Email:{' '}
          <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
        </li>
        <li>
          Privacy Policy page on Our website:{' '}
          <a href="/privacy-policy">/privacy-policy</a>
        </li>
      </ul>
    </LegalPage>
  );
}
