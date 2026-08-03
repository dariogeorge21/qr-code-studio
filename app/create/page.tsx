'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  Wallet,
  Globe,
  Share2,
  Contact,
  Wifi,
  Type,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';
import BackButton from '../components/shared/BackButton';
import { useQRStore } from '../store/useQRStore';

const QR_TYPES = [
  {
    label: 'Payment (UPI)',
    description: 'Accept UPI payments instantly',
    icon: Wallet,
    type: 'payment',
    popular: true,
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Website / URL',
    description: 'Link to any page or site',
    icon: Globe,
    type: 'website',
    popular: true,
    iconBg: 'bg-blue-500/10 dark:bg-blue-400/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    label: 'Social Media',
    description: 'Share your social profiles',
    icon: Share2,
    type: 'social',
    popular: false,
    iconBg: 'bg-purple-500/10 dark:bg-purple-400/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    label: 'Contact Info',
    description: 'Save as phone contacts',
    icon: Contact,
    type: 'contact',
    popular: false,
    iconBg: 'bg-cyan-500/10 dark:bg-cyan-400/10',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    label: 'WiFi',
    description: 'Connect guests to WiFi fast',
    icon: Wifi,
    type: 'wifi',
    popular: true,
    iconBg: 'bg-orange-500/10 dark:bg-orange-400/10',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    label: 'Custom Text',
    description: 'Encode any plain text',
    icon: Type,
    type: 'text',
    popular: false,
    iconBg: 'bg-gray-500/10 dark:bg-gray-400/10',
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
  {
    label: 'Email',
    description: 'Pre-fill email compose',
    icon: Mail,
    type: 'email',
    popular: false,
    iconBg: 'bg-red-500/10 dark:bg-red-400/10',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  {
    label: 'Phone',
    description: 'Dial a number instantly',
    icon: Phone,
    type: 'phone',
    popular: false,
    iconBg: 'bg-teal-500/10 dark:bg-teal-400/10',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    label: 'SMS',
    description: 'Send a pre-written message',
    icon: MessageSquare,
    type: 'sms',
    popular: false,
    iconBg: 'bg-yellow-500/10 dark:bg-yellow-400/10',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
] as const;

export default function CreatePage() {
  const router = useRouter();
  const set = useQRStore((s) => s.set);
  const reset = useQRStore((s) => s.reset);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const handleSelect = (type: string) => {
    if (loadingType) return; // prevent double-click
    setLoadingType(type);
    reset();
    if (type === 'payment') {
      set({ mode: 'upi', qrType: type });
    } else {
      set({ mode: 'general', qrType: type });
    }

    // Log a 'generated' event with the chosen QR type (fire-and-forget, keepalive so navigation can't cancel it)
    fetch('/api/qr-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'generated', qr_type: type }),
      keepalive: true,
    })
      .then((res) => {
        if (!res.ok) res.json().then((d) => console.error('[qr-events] generated error:', d));
      })
      .catch((err) => console.error('[qr-events] network error (generated):', err));

    router.push(`/create/${type}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <BackButton href="/" label="Back" />

      {/* Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full text-xs font-semibold border"
          style={{
            background: 'linear-gradient(135deg, rgba(255,112,0,0.08), rgba(255,195,0,0.08))',
            borderColor: 'rgba(255,112,0,0.25)',
            color: '#FF7000',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7000] animate-pulse" />
          Free · No sign-up · Instant
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] mb-3 leading-tight">
          What do you want to create?
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
          Choose a QR code type below — it takes less than a minute to generate and customise.
        </p>
      </div>

      {/* QR Type Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 stagger-children">
        {QR_TYPES.map((item) => {
          const isLoading = loadingType === item.type;
          const isOther   = loadingType !== null && !isLoading;

          return (
            <button
              key={item.type}
              onClick={() => handleSelect(item.type)}
              disabled={loadingType !== null}
              className={`group relative flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl border bg-[var(--color-background)] shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] dark:focus:ring-[var(--color-tertiary)] text-left animate-fade-in-up overflow-hidden
                ${
                  isLoading
                    ? 'border-[var(--color-secondary)] dark:border-[var(--color-tertiary)] shadow-lg scale-[0.97]'
                    : isOther
                    ? 'border-[var(--color-border)] opacity-40 cursor-not-allowed'
                    : 'border-[var(--color-border)] hover:shadow-xl hover:-translate-y-1 hover:border-[var(--color-secondary)] dark:hover:border-[var(--color-tertiary)] active:scale-95'
                }`}
              aria-label={`Create ${item.label} QR Code`}
              aria-busy={isLoading}
            >
              {/* Popular badge — hide while loading to avoid clutter */}
              {item.popular && !loadingType && (
                <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #FF7000, #FFC300)', color: '#fff' }}
                >
                  Popular
                </span>
              )}

              {/* Hover glow (only when nothing is loading) */}
              {!loadingType && (
                <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,112,0,0.06) 0%, transparent 70%)' }}
                />
              )}

              {/* Loading overlay backdrop on the active card */}
              {isLoading && (
                <span className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(255,112,0,0.07), rgba(255,195,0,0.07))' }}
                />
              )}

              {/* Icon / Spinner */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isLoading
                  ? 'bg-gradient-to-br from-[var(--color-secondary)]/20 to-[var(--color-tertiary)]/20 scale-110'
                  : `${item.iconBg} ${!isOther ? 'group-hover:scale-110' : ''}`
              }`}>
                {isLoading ? (
                  <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-secondary)] dark:text-[var(--color-tertiary)] animate-spin" />
                ) : (
                  <item.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${item.iconColor}`} />
                )}
              </div>

              {/* Labels */}
              <div className="flex flex-col items-center gap-1 text-center">
                <span className={`text-sm sm:text-base font-bold leading-snug transition-colors duration-200 ${
                  isLoading ? 'text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]' : 'text-[var(--color-text)]'
                }`}>
                  {isLoading ? 'Opening…' : item.label}
                </span>
                <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-snug hidden sm:block">
                  {isLoading ? 'Setting things up' : item.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
