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
      <BackButton href={`/create/${type}`} label="Back" />
      <MobilePreviewToggle />
      <StepIndicator current={1} total={5} label="Colors" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Right: Live Preview (shown first on mobile) */}
        <div id="preview-container" className="flex-1 min-w-0 order-first lg:order-last">
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

        {/* Left: Color Options */}
        <div className="lg:w-[45%] shrink-0 order-last lg:order-first">
          <div
            id="customisation-options"
            className="gradient-border-top p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
                style={{ background: 'linear-gradient(135deg, rgba(255,112,0,0.12), rgba(255,195,0,0.12))' }}>
                🎨
              </div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">Customise Colors</h2>
            </div>
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
