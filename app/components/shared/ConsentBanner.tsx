'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

const STORAGE_KEY = 'qr_consent_status';
const TIMESTAMP_KEY = 'qr_consent_timestamp';

export default function ConsentBanner() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      localStorage.setItem(TIMESTAMP_KEY, new Date().toISOString());
    } catch (e) {
      console.error('Failed to save consent to localStorage', e);
    }
    dismiss();
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'declined');
      localStorage.setItem(TIMESTAMP_KEY, new Date().toISOString());
    } catch (e) {
      console.error('Failed to save consent to localStorage', e);
    }
    dismiss();
  };

  const dismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Privacy and Terms Consent"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-[calc(100vw-2rem)] sm:max-w-md w-full transition-all duration-300 ease-out ${
        isClosing
          ? 'opacity-0 translate-y-6 scale-95 pointer-events-none'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)]/95 dark:bg-[#121212]/95 backdrop-blur-xl p-5 shadow-2xl shadow-black/10 dark:shadow-black/50">
        {/* Accent top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

        {/* Close icon button */}
        <button
          type="button"
          onClick={handleDecline}
          aria-label="Dismiss consent notification"
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-gray-400 hover:text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-amber-400 flex items-center justify-center border border-orange-200/50 dark:border-orange-800/40">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[var(--color-text)] tracking-tight">
              Terms & Privacy Policy
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              We use cookies and local storage to deliver our services. Your QR codes are generated directly in your browser and we never store your personal QR content. By continuing, you agree to our{' '}
              <Link
                href="/terms"
                className="font-semibold text-orange-600 dark:text-amber-400 hover:underline underline-offset-2"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="font-semibold text-orange-600 dark:text-amber-400 hover:underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleDecline}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-black shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
