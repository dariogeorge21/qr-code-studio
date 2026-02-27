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
    'w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/60 p-5">
      <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs">📝</span>
        Input
      </h2>

      {/* Mode Switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
        {(['general', 'upi'] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleModeSwitch(m)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              mode === m
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {m === 'general' ? '🔗 General QR' : '💳 UPI Payment'}
          </button>
        ))}
      </div>

      {mode === 'upi' ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
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
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
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
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
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
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
            Content
          </label>
          <input
            type="text"
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
            className={inputClass}
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
