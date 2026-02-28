'use client';

import { useRef, useCallback } from 'react';
import { useQRStore } from '../../store/useQRStore';
import { LOGO_SHAPES, LOGO_PRESETS } from '../../types/qr';
import type { LogoShape } from '../../types/qr';

export default function LogoTab() {
  const {
    logoImage, logoSize, logoMargin, logoPadding, logoRadius,
    logoOpacity, logoRotation, logoBgColor, logoBgEnabled,
    logoBorderWidth, logoBorderColor, logoBorderEnabled,
    logoShape, logoGrayscale, logoShadowEnabled, logoShadowBlur,
    logoShadowColor, set,
  } = useQRStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => set({ logoImage: ev.target?.result as string, errorCorrectionLevel: 'H' });
    reader.readAsDataURL(file);
  };

  const randomizeLogo = useCallback(() => {
    const shapes: LogoShape[] = ['square', 'circle', 'rounded', 'diamond', 'hexagon', 'shield'];
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const rBool = (chance = 0.5) => Math.random() < chance;
    const rHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const rRange = (min: number, max: number, step = 1) => {
      const steps = Math.floor((max - min) / step);
      return +(min + Math.floor(Math.random() * (steps + 1)) * step).toFixed(2);
    };
    set({
      logoSize: rRange(0.15, 0.4, 0.01),
      logoMargin: rRange(2, 15, 1),
      logoPadding: rRange(0, 12, 1),
      logoRadius: rRange(0, 40, 1),
      logoOpacity: rRange(0.65, 1, 0.05),
      logoRotation: rBool(0.25) ? rRange(0, 350, 5) : 0,
      logoBgEnabled: rBool(0.55),
      logoBgColor: rBool(0.6) ? '#FFFFFF' : rHex(),
      logoBorderEnabled: rBool(0.45),
      logoBorderWidth: rRange(1, 5, 1),
      logoBorderColor: rHex(),
      logoShape: pick(shapes),
      logoGrayscale: rBool(0.12),
      logoShadowEnabled: rBool(0.4),
      logoShadowBlur: rRange(4, 20, 2),
      logoShadowColor: rHex() + '50',
      errorCorrectionLevel: 'H',
    });
  }, [set]);

  const resetLogoStyle = useCallback(() => {
    set({
      logoSize: 0.25, logoMargin: 5, logoPadding: 5, logoRadius: 4,
      logoOpacity: 1, logoRotation: 0,
      logoBgEnabled: false, logoBgColor: '#FFFFFF',
      logoBorderEnabled: false, logoBorderWidth: 2, logoBorderColor: '#000000',
      logoShape: 'square' as LogoShape,
      logoGrayscale: false,
      logoShadowEnabled: false, logoShadowBlur: 8, logoShadowColor: '#00000040',
    });
  }, [set]);

  const slider = (label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void, display: string) => (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
        <span>{label}</span>
        <span className="text-[var(--color-secondary)]">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-[var(--color-secondary)] bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none"
      />
    </div>
  );

  const toggle = (label: string, checked: boolean, onChange: (v: boolean) => void, icon: string) => (
    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-secondary)]/40 transition-all">
      <div className="flex items-center gap-2.5">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{label}</span>
      </div>
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-[var(--color-secondary)] transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
      </div>
    </label>
  );

  const colorInput = (label: string, value: string, onChange: (v: string) => void) => (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input type="color" value={value.slice(0, 7)} onChange={(e) => onChange(e.target.value)} className="sr-only peer" id={`lc-${label.replace(/\s/g, '')}`} />
        <label htmlFor={`lc-${label.replace(/\s/g, '')}`} className="block w-8 h-8 rounded-lg border-2 border-[var(--color-border)] cursor-pointer hover:scale-110 transition-transform shadow-sm" style={{ backgroundColor: value }} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 block">{label}</span>
        <input
          type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="block w-full text-xs font-mono bg-transparent border-b border-[var(--color-border)] focus:border-[var(--color-secondary)] outline-none py-0.5 transition-colors"
        />
      </div>
    </div>
  );

  const previewClip: React.CSSProperties = {
    borderRadius:
      logoShape === 'circle' ? '50%'
      : logoShape === 'rounded' ? `${Math.max(logoRadius, 20)}px`
      : logoShape === 'square' ? `${logoRadius}px`
      : undefined,
    clipPath:
      logoShape === 'hexagon' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
      : logoShape === 'shield' ? 'polygon(50% 0%, 100% 0%, 100% 65%, 50% 100%, 0% 65%, 0% 0%)'
      : logoShape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
      : undefined,
    opacity: logoOpacity,
    transform: `rotate(${logoRotation}deg)`,
    filter: logoGrayscale ? 'grayscale(100%)' : undefined,
    backgroundColor: logoBgEnabled ? logoBgColor : undefined,
    padding: logoBgEnabled ? `${logoPadding}px` : undefined,
    border: logoBorderEnabled ? `${logoBorderWidth}px solid ${logoBorderColor}` : undefined,
    boxShadow: logoShadowEnabled ? `0 4px ${logoShadowBlur}px ${logoShadowColor}` : undefined,
    transition: 'all 0.3s ease',
  };

  return (
    <div className="space-y-8">
      <header>
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Center Logo</h4>
        <p className="text-xs opacity-60">Brand your QR code with a custom icon</p>
      </header>

      <div className="group relative">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="logo-upload" />

        {!logoImage ? (
          <label
            htmlFor="logo-upload"
            className="flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed border-[var(--color-border)] rounded-3xl cursor-pointer hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/5 transition-all group"
          >
            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🖼️</div>
            <div className="text-center">
              <span className="block text-sm font-bold">Upload Brand Logo</span>
              <span className="text-[10px] uppercase tracking-tighter opacity-40">SVG, PNG or JPG (Max 5MB)</span>
            </div>
          </label>
        ) : (
          <div className="space-y-6">
            {/* ── Logo Preview ── */}
            <div className="relative flex items-center justify-center p-4 bg-gray-50 dark:bg-white/5 rounded-3xl border border-[var(--color-border)] min-h-[180px]">
              <div className="relative" style={{ width: 120, height: 120 }}>
                <img src={logoImage} alt="Logo" className="w-full h-full object-contain" style={previewClip} />
              </div>
              <div className="absolute -top-2 -right-2 flex gap-1.5">
                <label htmlFor="logo-upload" className="w-7 h-7 rounded-full bg-blue-500 text-white shadow-lg hover:scale-110 transition-all flex items-center justify-center cursor-pointer text-[11px]" title="Replace image">↻</label>
                <button onClick={() => set({ logoImage: null })} className="w-7 h-7 rounded-full bg-red-500 text-white shadow-lg hover:scale-110 transition-all flex items-center justify-center text-[11px]" title="Remove">✕</button>
              </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="flex gap-2">
              <button
                onClick={randomizeLogo}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25"
              >
                🎲 Randomize
              </button>
              <button
                onClick={resetLogoStyle}
                className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-[var(--color-border)]"
              >
                ↺ Reset
              </button>
            </div>

            {/* ── Shape Selector ── */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Logo Shape</h5>
              <div className="grid grid-cols-3 gap-2">
                {LOGO_SHAPES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => set({ logoShape: s.key })}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all hover:scale-[1.03] ${
                      logoShape === s.key
                        ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 shadow-md'
                        : 'border-[var(--color-border)] hover:border-[var(--color-secondary)]/40'
                    }`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Style Presets ── */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Style Presets</h5>
              <div className="grid grid-cols-2 gap-2">
                {LOGO_PRESETS.map((p) => {
                  const { name, emoji, description, ...vals } = p;
                  return (
                    <button
                      key={name}
                      onClick={() => set({ ...vals, errorCorrectionLevel: 'H' })}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/5 transition-all text-left group"
                    >
                      <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">{emoji}</span>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-bold truncate">{name}</span>
                        <span className="block text-[9px] opacity-50 truncate">{description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Size & Position ── */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
              <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-1.5">📐 Size &amp; Position</h5>
              {slider('Logo Scale', logoSize, 0.1, 0.5, 0.01, (v) => set({ logoSize: v }), `${Math.round(logoSize * 100)}%`)}
              {slider('Clearance Margin', logoMargin, 0, 20, 1, (v) => set({ logoMargin: v }), `${logoMargin}px`)}
              {slider('Inner Padding', logoPadding, 0, 20, 1, (v) => set({ logoPadding: v }), `${logoPadding}px`)}
              {slider('Corner Rounding', logoRadius, 0, 50, 1, (v) => set({ logoRadius: v }), `${logoRadius}px`)}
            </div>

            {/* ── Appearance ── */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
              <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-1.5">🎨 Appearance</h5>
              {slider('Opacity', logoOpacity, 0.1, 1, 0.05, (v) => set({ logoOpacity: v }), `${Math.round(logoOpacity * 100)}%`)}
              {slider('Rotation', logoRotation, 0, 360, 5, (v) => set({ logoRotation: v }), `${logoRotation}°`)}
            </div>

            {/* ── Effects Toggles ── */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">⚡ Effects</h5>
              {toggle('Grayscale', logoGrayscale, (v) => set({ logoGrayscale: v }), '🌑')}
              {toggle('Background Fill', logoBgEnabled, (v) => set({ logoBgEnabled: v }), '🎨')}
              {toggle('Border Ring', logoBorderEnabled, (v) => set({ logoBorderEnabled: v }), '⭕')}
              {toggle('Drop Shadow', logoShadowEnabled, (v) => set({ logoShadowEnabled: v }), '💧')}
            </div>

            {/* ── Background (conditional) ── */}
            {logoBgEnabled && (
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
                <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">🎨 Background</h5>
                {colorInput('Fill Color', logoBgColor, (v) => set({ logoBgColor: v }))}
              </div>
            )}

            {/* ── Border (conditional) ── */}
            {logoBorderEnabled && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
                <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">⭕ Border</h5>
                {slider('Width', logoBorderWidth, 1, 8, 1, (v) => set({ logoBorderWidth: v }), `${logoBorderWidth}px`)}
                {colorInput('Color', logoBorderColor, (v) => set({ logoBorderColor: v }))}
              </div>
            )}

            {/* ── Shadow (conditional) ── */}
            {logoShadowEnabled && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
                <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">💧 Shadow</h5>
                {slider('Blur', logoShadowBlur, 0, 30, 1, (v) => set({ logoShadowBlur: v }), `${logoShadowBlur}px`)}
                {colorInput('Color', logoShadowColor, (v) => set({ logoShadowColor: v }))}
              </div>
            )}

            {/* ── Error Correction Note ── */}
            <div className="flex items-center gap-3 p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20">
              <span className="text-lg">🛡️</span>
              <p className="text-[10px] font-bold leading-tight">Error correction set to HIGH to ensure scanning with logo.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}