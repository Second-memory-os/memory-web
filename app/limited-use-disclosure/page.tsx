import type { Metadata } from 'next';
import { LegalPage } from '@/components/marketing/LegalPage';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Limited Use Disclosure',
};

export default function LimitedUseDisclosurePage() {
  return (
    <LegalPage title="Limited Use Disclosure" updated={SITE.privacyUpdated}>
      <p className="callout">
        This disclosure explains how MemoryOS uses permissions and data in a limited,
        purpose-bound way — aligned with privacy-first, on-device memory.
      </p>

      <h2>Purpose of MemoryOS</h2>
      <p>
        MemoryOS helps You build a personal memory layer on Your Mac: capturing work
        context, finding open loops, and exposing that memory to AI tools You authorize
        via MCP. We design the product so Your memory content stays on Your Device.
      </p>

      <h2>Limited use of permissions</h2>
      <ul>
        <li>
          <strong>Screen Recording</strong> — used only to capture the active window
          (and selected open windows for open-loop / agent scans) to build On-Device
          Memory. Not used for advertising profiling.
        </li>
        <li>
          <strong>Accessibility</strong> — used to read window titles and assist
          capture/scroll where needed. Not used to keylog.
        </li>
        <li>
          <strong>Microphone</strong> — used only when You start a voice note or enable
          an audio feature. Not always-on recording by default.
        </li>
      </ul>

      <h2>Limited use of data</h2>
      <ul>
        <li>
          On-Device Memory is stored locally on Your Mac (SQLite). We do not operate a
          cloud database of Your memory content for product training or resale.
        </li>
        <li>
          Account data (email, encrypted API keys You save) is used solely to
          authenticate You and to call AI providers You configure.
        </li>
        <li>
          Transient AI inference may send screenshots or text snippets to providers
          behind Your key only to produce summaries, OCR, embeddings, or open-loop
          extraction — not for MemoryOS model training.
        </li>
        <li>
          Error reports You submit voluntarily may include diagnostic context You
          approve; they are not used to reconstruct Your full memory store.
        </li>
      </ul>

      <h2>Google / third-party API compliance</h2>
      <p>
        If You connect Google or other third-party accounts through features We may add,
        MemoryOS&apos;s use of information received from those APIs will adhere to the
        applicable Limited Use requirements of those platforms (including restrictions
        on transferring data, serving ads, and allowing humans to read data except with
        Your consent, for security, or for legal compliance).
      </p>

      <h2>Your controls</h2>
      <ul>
        <li>Pause capture anytime from the menu bar</li>
        <li>Exclude apps and block domains in Settings</li>
        <li>Revoke macOS permissions in System Settings</li>
        <li>Disconnect MCP clients and rotate API keys</li>
        <li>Delete local memory files or uninstall the Application</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Questions:{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
      </p>
    </LegalPage>
  );
}
