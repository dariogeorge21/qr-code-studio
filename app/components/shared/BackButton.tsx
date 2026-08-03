'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({ href, label }: BackButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-[var(--color-secondary)] dark:hover:text-[var(--color-tertiary)] bg-transparent hover:bg-[var(--color-secondary)]/8 dark:hover:bg-[var(--color-tertiary)]/10 px-3 py-1.5 rounded-lg -ml-3 transition-all duration-200 mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] cursor-pointer disabled:opacity-50"
      aria-label={label || 'Go back'}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
      )}
      {label && <span>{label}</span>}
    </button>
  );
}
