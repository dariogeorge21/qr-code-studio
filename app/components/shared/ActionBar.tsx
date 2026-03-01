'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2 } from 'lucide-react';

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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-background)]/90 backdrop-blur-md border-t border-[var(--color-border)] p-4 md:static md:border-0 md:bg-transparent md:backdrop-blur-none md:p-0 md:mt-8">
      <div className="flex gap-3 max-w-7xl mx-auto">
        <button
          onClick={() => { setLoadingDownload(true); router.push(downloadHref); }}
          disabled={loadingDownload}
          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-orange-600 dark:bg-yellow-400 dark:text-black hover:opacity-90 transition-all active:scale-[0.98] shadow-lg cursor-pointer disabled:opacity-70"
        >
          {loadingDownload ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {loadingDownload ? 'Loading…' : 'Download Now'}
        </button>
        {continueHref && (
          <button
            onClick={() => { setLoadingContinue(true); router.push(continueHref); }}
            disabled={loadingContinue}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold border-2 border-orange-600 text-orange-600 dark:border-yellow-400 dark:text-yellow-400 hover:bg-orange-600/10 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70"
          >
            {loadingContinue && <Loader2 className="w-4 h-4 animate-spin" />}
            {loadingContinue ? 'Loading…' : continueLabel}
          </button>
        )}
      </div>
    </div>
  );
}
