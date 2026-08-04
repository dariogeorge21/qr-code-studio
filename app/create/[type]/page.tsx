'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../components/shared/BackButton';
import ActionBar from '../../components/shared/ActionBar';
import QRPreviewCanvas from '../../components/QRPreviewCanvas';
import { useQRStore } from '../../store/useQRStore';
import InputFormByType from '@/app/components/InputFormByType';
import MobilePreviewToggle from '../../components/shared/MobilePreviewToggle';

const VALID_TYPES = ['payment', 'website', 'social', 'contact', 'wifi', 'text', 'email', 'phone', 'sms'];

const TYPE_META: Record<string, { title: string; subtitle: string; emoji: string }> = {
  payment: { title: 'Payment (UPI)', subtitle: 'Enter your UPI ID or VPA to generate a payment QR', emoji: '💳' },
  website: { title: 'Website / URL', subtitle: 'Paste any link — your site, blog, product page, or profile', emoji: '🌐' },
  social:  { title: 'Social Media', subtitle: 'Share your social media profile with a single scan', emoji: '📱' },
  contact: { title: 'Contact Info', subtitle: 'Let anyone save your details directly to their phone', emoji: '👤' },
  wifi:    { title: 'WiFi Network', subtitle: 'Share your WiFi credentials without typing passwords', emoji: '📶' },
  text:    { title: 'Custom Text', subtitle: 'Encode any plain text or short message', emoji: '✏️' },
  email:   { title: 'Email', subtitle: 'Pre-fill an email compose window on scan', emoji: '✉️' },
  phone:   { title: 'Phone Number', subtitle: 'Allow one-tap calling from a QR scan', emoji: '📞' },
  sms:     { title: 'SMS Message', subtitle: 'Send a pre-written SMS with a single scan', emoji: '💬' },
};

export default function InputPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const router = useRouter();
  const meta = TYPE_META[type] ?? { title: 'Create QR Code', subtitle: 'Enter the details for your QR code', emoji: '🔲' };

  useEffect(() => {
    if (!VALID_TYPES.includes(type)) {
      router.replace('/create');
    }
  }, [type, router]);

  if (!VALID_TYPES.includes(type)) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-8">
      <BackButton href="/create" label="Back" />

      <MobilePreviewToggle />

      {/* Page header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl sm:text-3xl" aria-hidden="true">{meta.emoji}</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)]">
            {meta.title}
          </h1>
        </div>
        <p className="ml-1 text-sm text-gray-500 dark:text-gray-400 max-w-lg">
          {meta.subtitle}
        </p>
        {/* Step context */}
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] dark:bg-[var(--color-tertiary)]" />
          Step 1 of 6 — Enter Content
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Input Form */}
        <div className="lg:w-[45%] shrink-0">
          <div
            id="customisation-options"
            className="gradient-border-top p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm"
          >
            <InputFormByType type={type} />
          </div>
        </div>

        {/* Right: Live Preview */}
        <div id="preview-container" className="flex-1 min-w-0">
          <div className="lg:sticky lg:top-24">
            {/* Live preview badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Live Preview
              </span>
            </div>
            <QRPreviewCanvas />
          </div>
        </div>
      </div>

      <ActionBar
        downloadHref={`/create/${type}/export`}
        continueHref={`/create/${type}/colors`}
        continueLabel="Customise QR Code"
      />
    </div>
  );
}
