import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  const EFFECTIVE = 'August 24, 2026';
  const CONTACT_EMAIL = 'mail.dariogeorge@gmail.com';

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 pb-20">
      <div className="mb-10">
        <span className="text-xs font-semibold text-[var(--color-secondary)] uppercase tracking-widest">
          Legal
        </span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[var(--color-text)]">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Effective date: <strong>{EFFECTIVE}</strong>
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/70 dark:bg-emerald-950/30 p-5 mb-10 flex items-start sm:items-center gap-4 shadow-sm">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-black dark:text-emerald-200">
            Privacy-first by design
          </h2>
          <p className="text-sm text-black dark:text-emerald-400 mt-0.5 leading-relaxed">
            We never store your QR code content, URLs, WiFi passwords, payment IDs, or any personal
            data you encode. All QR generation happens in your browser.
          </p>
        </div>
      </div>

      <article className="space-y-8 text-[var(--color-text)]">

        <Section title="1. Who We Are">
          <p>
            QR Code Studio is a free QR code generator built and operated by{' '}
            <a
              href="https://github.com/dariogeorge21"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-secondary)] underline underline-offset-2 hover:opacity-80"
            >
              Dario George
            </a>
            . If you have any privacy-related questions, contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-secondary)] underline underline-offset-2 hover:opacity-80">
              {CONTACT_EMAIL}
            </a>.
          </p>
        </Section>

        <Section title="2. What We Do NOT Collect">
          <p>The following are <strong>never</strong> collected, transmitted, or stored:</p>
          <ul>
            <li>The content of your QR codes (URLs, text, WiFi credentials, UPI IDs, contact info, etc.)</li>
            <li>Your IP address or geolocation</li>
            <li>Device fingerprints, browser fingerprints, or hardware identifiers</li>
            <li>Cookies for tracking or advertising</li>
            <li>Account data (the Service requires no login)</li>
            <li>Any personally identifiable information (PII) beyond what you voluntarily submit via the contact form</li>
          </ul>
        </Section>

        <Section title="3. Anonymous Usage Analytics">
          <p>
            To improve the Service, we record minimal, <strong>fully anonymous</strong> metadata
            about how QR codes are created and downloaded. This data contains:
          </p>
          <ul>
            <li>
              <strong>QR type chosen</strong> — e.g., &quot;website&quot;, &quot;wifi&quot;, &quot;payment&quot;
              (not the actual content)
            </li>
            <li>
              <strong>Export format</strong> — e.g., PNG, SVG, JPEG, WebP
            </li>
            <li>
              <strong>Customisation flags</strong> — boolean flags indicating whether colours, dot style,
              frame, logo, or text were changed from the defaults (no actual values stored)
            </li>
            <li>
              <strong>Timestamp</strong> — when the event occurred
            </li>
          </ul>
          <p>
            This data is aggregated and reviewed only to understand feature usage.
            It cannot be used to identify you.
          </p>
        </Section>

        <Section title="4. Contact Form Data">
          <p>
            If you choose to contact us via the contact form at <a href="/contact" className="text-[var(--color-secondary)] underline underline-offset-2 hover:opacity-80">Contact Page</a>,
            we collect:
          </p>
          <ul>
            <li>Your <strong>name</strong></li>
            <li>Your <strong>email address</strong></li>
            <li>An optional <strong>subject</strong></li>
            <li>Your <strong>message</strong></li>
          </ul>
          <p>
            This information is used solely to respond to your enquiry and is never shared with or
            sold to third parties. You may request deletion of your submission at any time by
            emailing us.
          </p>
        </Section>

        <Section title="5. Cookies">
          <p>
            The Service does <strong>not</strong> use tracking cookies, advertising cookies, or any
            third-party analytics cookies.
          </p>
          <p>
            The only cookie set is a short-lived, <code>HttpOnly</code> session cookie used
            exclusively for the admin panel. It is never set for regular users and expires after
            24 hours.
          </p>
        </Section>

        <Section title="6. Data Storage & Security">
          <p>
            Anonymous usage metadata and contact form submissions are stored with us.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>
            Anonymous usage events are retained indefinitely for aggregate analytics purposes.
            Contact form submissions are retained until you request deletion.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you (only contact form submissions).</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your personal data.</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[var(--color-secondary)] underline underline-offset-2 hover:opacity-80"
            >
              {CONTACT_EMAIL}
            </a>. We will respond within a reasonable timeframe.
          </p>
        </Section>

        <Section title="10. Children">
          <p>
            The Service is not directed at children under 13. We do not knowingly collect any
            information from children. If you believe a child has submitted information via the
            contact form, please contact us so we can delete it.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Changes become effective upon
            posting. We encourage you to review this page periodically.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For any privacy-related concerns:{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[var(--color-secondary)] underline underline-offset-2 hover:opacity-80"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>
      </article>

      <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-wrap gap-4 text-sm">
        <a href="/terms" className="text-[var(--color-secondary)] hover:opacity-80 transition">
          Terms of Service →
        </a>
        <a href="/contact" className="text-gray-500 dark:text-gray-400 hover:text-[var(--color-secondary)] transition">
          Contact Us
        </a>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-[var(--color-text)] mb-3 mt-8">{title}</h2>
      <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed text-[15px]">
        {children}
      </div>
    </section>
  );
}
