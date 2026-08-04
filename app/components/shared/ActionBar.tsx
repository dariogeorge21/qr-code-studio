'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2, ChevronRight } from 'lucide-react';

interface ActionBarProps {
  downloadHref: string;
  continueHref?: string;
  continueLabel?: string;
}

export default function ActionBar({ downloadHref, continueHref, continueLabel = 'Continue Customising' }: ActionBarProps) {
  const router = useRouter();
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingContinue, setLoadingContinue] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-background)]/95 backdrop-blur-md border-t border-[var(--color-border)] p-3 sm:p-4 md:static md:border-0 md:bg-transparent md:backdrop-blur-none md:p-0 md:mt-8">
      <div className="flex gap-3 max-w-7xl mx-auto">
        {/* Primary CTA — Download */}
        <button
          onClick={() => { setLoadingDownload(true); router.push(downloadHref); }}
          disabled={loadingDownload}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-orange-500/30 dark:hover:shadow-yellow-400/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-orange-500/30 shimmer-btn"
          style={{
            background: 'linear-gradient(135deg, #FF7000 0%, #FF9A3C 50%, #FF7000 100%)',
          }}
          aria-label="Download QR Code now"
        >
          {loadingDownload ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {loadingDownload ? 'Loading…' : 'Download Now'}
        </button>

        {/* Secondary CTA — Continue customising */}
        {continueHref && (
          <button
            onClick={() => { setLoadingContinue(true); router.push(continueHref); }}
            disabled={loadingContinue}
            className="group flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold border-2 border-[var(--color-secondary)] text-[var(--color-secondary)] dark:border-[var(--color-tertiary)] dark:text-[var(--color-tertiary)] hover:bg-[var(--color-secondary)]/10 dark:hover:bg-[var(--color-tertiary)]/10 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-orange-500/20"
            aria-label={continueLabel}
          >
            {loadingContinue ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            {loadingContinue ? 'Loading…' : continueLabel}
            {!loadingContinue && (
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
