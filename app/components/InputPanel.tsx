'use client';

import { useState } from 'react';
import { useQRStore } from '../store/useQRStore';

export default function InputPanel() {
  const mode = useQRStore((s) => s.mode);
  const inputValue = useQRStore((s) => s.inputValue);
  const upiId = useQRStore((s) => s.upiId);
  const payeeName = useQRStore((s) => s.payeeName);
  const amount = useQRStore((s) => s.amount);
  const transactionNote = useQRStore((s) => s.transactionNote);
  const set = useQRStore((s) => s.set);
  const [error, setError] = useState('');

  const handleModeSwitch = (newMode: 'general' | 'upi') => {
    set({ mode: newMode, inputValue: '' });
    setError('');
  };

  const updateUPI = (updates: Partial<{ upiId: string; payeeName: string; amount: string; transactionNote: string }>) => {
    // Apply field updates first
    useQRStore.setState(updates);
    // Compute UPI URL from the newly updated state
    const s = useQRStore.getState();
    const uid = s.upiId.trim();
    if (!uid) {
      useQRStore.setState({ inputValue: '' });
      return;
    }
    const params = new URLSearchParams();
    params.set('pa', uid);
    if (s.payeeName.trim()) params.set('pn', s.payeeName.trim());
    if (s.amount.trim()) {
      const num = Number(s.amount.trim().replace(/[^\d.]/g, ''));
      if (num > 0 && isFinite(num)) {
        params.set('am', num.toFixed(2));
        params.set('cu', 'INR');
      }
    }
    if (s.transactionNote.trim()) params.set('tn', s.transactionNote.trim());
    useQRStore.setState({ inputValue: `upi://pay?${params.toString()}` });
    setError('');
  };

  const inputClass =
    'w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6">
      <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-5 flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-sm">📝</span>
        Content
      </h2>

      {/* Mode Switcher */}
      <div className="flex gap-1.5 p-1.5 bg-gray-100/80 dark:bg-gray-700/80 rounded-2xl mb-6">
        {(['general', 'upi'] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleModeSwitch(m)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              mode === m
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-500/50'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-600/50'
            }`}
          >
            {m === 'general' ? '🔗 General' : '💳 UPI Payment'}
          </button>
        ))}
      </div>

      {mode === 'upi' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              UPI ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => updateUPI({ upiId: e.target.value })}
              placeholder="yourname@paytm"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              Payee Name
            </label>
            <input
              type="text"
              value={payeeName}
              onChange={(e) => updateUPI({ payeeName: e.target.value })}
              placeholder="Your Name"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Amount (₹)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) {
                    updateUPI({ amount: e.target.value });
                  }
                }}
                placeholder="100.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Note
              </label>
              <input
                type="text"
                value={transactionNote}
                onChange={(e) => updateUPI({ transactionNote: e.target.value })}
                placeholder="Payment for..."
                className={inputClass}
              />
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              {error}
            </p>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
            Content
          </label>
          <textarea
            value={inputValue}
            onChange={(e) => {
              set({ inputValue: e.target.value });
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !inputValue.trim()) {
                setError('Please enter some content');
              }
            }}
            placeholder="Enter text, URL, phone number, email..."
            className={`${inputClass} min-h-[120px] resize-y`}
          />
          {error && (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
