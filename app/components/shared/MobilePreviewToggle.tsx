'use client';

import { useEffect, useState } from 'react';

export default function MobilePreviewToggle() {
  const [isViewingPreview, setIsViewingPreview] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const customisationEl = document.getElementById('customisation-options');
      if (!customisationEl) return;
      const customisationRect = customisationEl.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (customisationRect.top < windowHeight * 0.4) {
        setIsViewingPreview(false);
      } else {
        setIsViewingPreview(true);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = () => {
    const targetId = isViewingPreview ? 'customisation-options' : 'preview-container';
    const element = document.getElementById(targetId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={toggleSection}
      className="lg:hidden fixed top-24 right-4 z-[60] flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm text-white shadow-lg shadow-orange-600/30 dark:shadow-yellow-400/20 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20"
      style={{ background: 'linear-gradient(135deg, #FF7000, #FFC300)' }}
      aria-label={isViewingPreview ? 'Go to Customise' : 'Go to Preview'}
    >
      {/* Animated dot indicator */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>

      {isViewingPreview ? (
        <>
          Customise
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </>
      ) : (
        <>
          Preview
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </>
      )}
    </button>
  );
}
