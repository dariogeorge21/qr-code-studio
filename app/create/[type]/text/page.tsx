'use client';

import { use } from 'react';
import BackButton from '../../../components/shared/BackButton';
import StepIndicator from '../../../components/shared/StepIndicator';
import ActionBar from '../../../components/shared/ActionBar';
import QRPreviewCanvas from '../../../components/QRPreviewCanvas';
import TextTab from '../../../components/tabs/TextTab';

export default function TextPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-8">
      <BackButton href={`/create/${type}/frame`} label="Back" />
      <StepIndicator current={4} total={5} label="Text" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Text Options */}
        <div className="lg:w-[45%] shrink-0">
          <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm">
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-5">Customise Text</h2>
            <TextTab />
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1 min-w-0">
          <div className="lg:sticky lg:top-24">
            <QRPreviewCanvas />
          </div>
        </div>
      </div>

      <ActionBar
        downloadHref={`/create/${type}/export`}
        continueHref={`/create/${type}/logo`}
      />
    </div>
  );
}
