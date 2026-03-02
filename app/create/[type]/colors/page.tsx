'use client';

import { use, useEffect } from 'react';
import BackButton from '../../../components/shared/BackButton';
import StepIndicator from '../../../components/shared/StepIndicator';
import ActionBar from '../../../components/shared/ActionBar';
import QRPreviewCanvas from '../../../components/QRPreviewCanvas';
import ColorsTab from '../../../components/tabs/ColorsTab';
import MobilePreviewToggle from '../../../components/shared/MobilePreviewToggle';

export default function ColorsPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.getElementById('customisation-options')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-8">
      <div className="flex items-center justify-between mb-8">
        <BackButton href={`/create/${type}`} label="Back" />
      </div>
      <MobilePreviewToggle />
      <StepIndicator current={1} total={5} label="Colors" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Right: Live Preview (shown first on mobile) */}
        <div id="preview-container" className="flex-1 min-w-0 order-first lg:order-lasṭt">
          <div className="lg:sticky lg:top-24">
            <QRPreviewCanvas />
          </div>
        </div>

        {/* Left: Color Options */}
        <div className="lg:w-[45%] shrink-0 order-last lg:order-first">
          <div id="customisation-options" className="p-6 rounded-2xl border border-(--color-border) bg-(--color-background) shadow-sm">
            <h2 className="text-lg font-bold text-(--color-text) mb-5">Customise Colors</h2>
            <ColorsTab />
          </div>
        </div>
      </div>

      <ActionBar
        downloadHref={`/create/${type}/export`}
        continueHref={`/create/${type}/style`}
      />
    </div>
  );
}
