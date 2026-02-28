'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQRStore } from '../../store/useQRStore';
import { PALETTES } from '../../types/qr';
import { ArrowLeftRight, Sparkles, RefreshCw, Eye, Shuffle, Check, Dices } from 'lucide-react';

/* ────────────────── helpers ────────────────── */

/** HSL → HEX (h 0-360, s 0-100, l 0-100) */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** HEX → sRGB luminance */
function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG contrast ratio between two hex colors */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

type HarmonyMode = 'complementary' | 'analogous' | 'triadic' | 'monochrome' | 'split';

interface ColorPair {
  fg: string;
  bg: string;
}

/** Generate a harmonious fg/bg pair from a random seed hue */
function generateHarmony(mode: HarmonyMode): ColorPair {
  const baseHue = Math.floor(Math.random() * 360);
  const wrap = (h: number) => ((h % 360) + 360) % 360;
  switch (mode) {
    case 'complementary': {
      const fg = hslToHex(baseHue, 75, 25);
      const bg = hslToHex(wrap(baseHue + 180), 30, 92);
      return { fg, bg };
    }
    case 'analogous': {
      const offset = 30 + Math.floor(Math.random() * 15);
      const fg = hslToHex(baseHue, 70, 25);
      const bg = hslToHex(wrap(baseHue + offset), 35, 93);
      return { fg, bg };
    }
    case 'triadic': {
      const fg = hslToHex(baseHue, 65, 28);
      const bg = hslToHex(wrap(baseHue + 120), 25, 92);
      return { fg, bg };
    }
    case 'monochrome': {
      const fg = hslToHex(baseHue, 60, 18);
      const bg = hslToHex(baseHue, 25, 94);
      return { fg, bg };
    }
    case 'split': {
      const fg = hslToHex(baseHue, 70, 25);
      const bg = hslToHex(wrap(baseHue + 150), 30, 92);
      return { fg, bg };
    }
  }
}

/** Generate a batch of inspirational color pairs using mixed modes */
function generateInspirationBatch(count: number): ColorPair[] {
  const modes: HarmonyMode[] = ['complementary', 'analogous', 'triadic', 'monochrome', 'split'];
  return Array.from({ length: count }, () => {
    const mode = modes[Math.floor(Math.random() * modes.length)];
    return generateHarmony(mode);
  });
}

const HARMONY_MODES: { key: HarmonyMode; label: string; icon: string; tip: string }[] = [
  { key: 'complementary', label: 'Complement', icon: '◐', tip: 'Opposite hues — bold & vibrant' },
  { key: 'analogous', label: 'Analogous', icon: '◑', tip: 'Neighboring hues — smooth & natural' },
  { key: 'triadic', label: 'Triadic', icon: '◎', tip: 'Evenly spaced — balanced & rich' },
  { key: 'monochrome', label: 'Mono', icon: '●', tip: 'Same hue — elegant & cohesive' },
  { key: 'split', label: 'Split', icon: '◔', tip: 'Split-complementary — nuanced contrast' },
];

/* ────────────────── component ────────────────── */

export default function ColorsTab() {
  const fgColor = useQRStore((s) => s.fgColor);
  const bgColor = useQRStore((s) => s.bgColor);
  const activePalette = useQRStore((s) => s.activePalette);
  const useFgGradient = useQRStore((s) => s.useFgGradient);
  const fgGradient = useQRStore((s) => s.fgGradient);
  const set = useQRStore((s) => s.set);

  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('complementary');
  const [inspirationSeed, setInspirationSeed] = useState(0);
  const [showPaletteNames, setShowPaletteNames] = useState(false);

  // ── Contrast ratio ──
  const ratio = useMemo(() => contrastRatio(fgColor, bgColor), [fgColor, bgColor]);
  const contrastLabel =
    ratio >= 7 ? 'Excellent' : ratio >= 4.5 ? 'Good' : ratio >= 3 ? 'Fair' : 'Low';
  const contrastColor =
    ratio >= 7
      ? 'text-emerald-600 dark:text-emerald-400'
      : ratio >= 4.5
        ? 'text-sky-600 dark:text-sky-400'
        : ratio >= 3
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-red-500';
  const contrastBarColor =
    ratio >= 7
      ? 'bg-emerald-500'
      : ratio >= 4.5
        ? 'bg-sky-500'
        : ratio >= 3
          ? 'bg-amber-500'
          : 'bg-red-500';

  // ── Inspiration chips — regenerate when seed changes ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const inspirations = useMemo(() => generateInspirationBatch(6), [inspirationSeed]);

  const applyHarmony = useCallback(() => {
    const pair = generateHarmony(harmonyMode);
    set({ fgColor: pair.fg, bgColor: pair.bg, activePalette: 'Custom' });
  }, [harmonyMode, set]);

  const swapColors = () => {
    set({ fgColor: bgColor, bgColor: fgColor, activePalette: 'Custom' });
  };

  const randomColorPair = useCallback(() => {
    const modeKeys: HarmonyMode[] = ['complementary', 'analogous', 'triadic', 'monochrome', 'split'];
    const mode = modeKeys[Math.floor(Math.random() * modeKeys.length)];
    const pair = generateHarmony(mode);
    set({ fgColor: pair.fg, bgColor: pair.bg, activePalette: 'Custom' });
  }, [set]);

  const randomizeGradient = useCallback(() => {
    const modeKeys: HarmonyMode[] = ['complementary', 'analogous', 'triadic', 'monochrome', 'split'];
    const mode = modeKeys[Math.floor(Math.random() * modeKeys.length)];
    const pair = generateHarmony(mode);
    set({
      fgGradient: {
        ...fgGradient,
        colorStops: [
          { ...fgGradient.colorStops[0], color: pair.fg },
          { ...fgGradient.colorStops[1], color: pair.bg },
        ],
      },
    });
  }, [fgGradient, set]);

  const randomPalette = useCallback(() => {
    const p = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    set({ fgColor: p.fg, bgColor: p.bg, activePalette: p.name });
  }, [set]);

  const inputClass =
    'w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] font-mono focus:ring-2 focus:ring-[var(--color-secondary)] outline-none transition-all';

  return (
    <div className="space-y-7">
      {/* ── Core Colors ── */}
      <section>
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
          Core Colors
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold opacity-70">Foreground</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => set({ fgColor: e.target.value, activePalette: 'Custom' })}
                className="w-12 h-10 rounded-lg cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => set({ fgColor: e.target.value, activePalette: 'Custom' })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold opacity-70">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => set({ bgColor: e.target.value, activePalette: 'Custom' })}
                className="w-12 h-10 rounded-lg cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => set({ bgColor: e.target.value, activePalette: 'Custom' })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={swapColors}
            title="Swap foreground & background"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold border border-[var(--color-border)] text-[var(--color-text)] rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Swap
          </button>
          <button
            onClick={randomColorPair}
            title="Random harmonious color pair"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold border border-[var(--color-border)] text-[var(--color-text)] rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all"
          >
            <Dices className="w-3.5 h-3.5" />
            Random
          </button>
          <button
            onClick={() =>
              set({
                fgColor: '#000000',
                bgColor: '#FFFFFF',
                activePalette: 'Classic',
                useFgGradient: false,
              })
            }
            className="flex-1 py-2.5 text-xs font-bold border border-[var(--color-border)] text-[var(--color-text)] rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all"
          >
            Reset
          </button>
        </div>
      </section>

      {/* ── Contrast Indicator ── */}
      <section className="p-4 rounded-2xl border border-[var(--color-border)] bg-gray-50 dark:bg-white/5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 opacity-50" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Scan Contrast
            </span>
          </div>
          <span className={`text-xs font-extrabold ${contrastColor}`}>
            {ratio.toFixed(1)}:1 — {contrastLabel}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${contrastBarColor}`}
            style={{ width: `${Math.min((ratio / 21) * 100, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-gray-400">
            {ratio < 3
              ? '⚠ May be hard to scan — increase contrast'
              : ratio < 4.5
                ? 'Acceptable for most scanners'
                : '✓ Great scannability'}
          </p>
          {/* Mini preview swatch */}
          <div className="flex items-center gap-1">
            <div
              className="w-5 h-5 rounded border border-[var(--color-border)]"
              style={{ backgroundColor: bgColor }}
            >
              <div className="w-2.5 h-2.5 m-[3px] rounded-sm" style={{ backgroundColor: fgColor }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Color Harmony Generator ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3 inline-block mr-1 -mt-0.5" />
            Color Harmony
          </h4>
          <button
            onClick={applyHarmony}
            className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-yellow-400 hover:opacity-70 transition-opacity"
          >
            <Shuffle className="w-3 h-3" />
            Generate
          </button>
        </div>

        {/* Harmony mode pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {HARMONY_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setHarmonyMode(m.key);
                const pair = generateHarmony(m.key);
                set({ fgColor: pair.fg, bgColor: pair.bg, activePalette: 'Custom' });
              }}
              title={m.tip}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                harmonyMode === m.key
                  ? 'bg-orange-600 dark:bg-yellow-400 text-white dark:text-black shadow-sm'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              <span>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 italic">
          {HARMONY_MODES.find((m) => m.key === harmonyMode)?.tip}
        </p>
      </section>

      {/* ── Quick Inspiration ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Inspiration
          </h4>
          <button
            onClick={() => setInspirationSeed((s) => s + 1)}
            className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-yellow-400 hover:opacity-70 transition-opacity"
          >
            <RefreshCw className="w-3 h-3" />
            Reshuffle
          </button>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {inspirations.map((pair, i) => {
            const isActive = fgColor === pair.fg && bgColor === pair.bg;
            return (
              <button
                key={`${inspirationSeed}-${i}`}
                onClick={() =>
                  set({ fgColor: pair.fg, bgColor: pair.bg, activePalette: 'Custom' })
                }
                className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 ${
                  isActive
                    ? 'border-orange-600 dark:border-yellow-400 ring-4 ring-orange-500/20 dark:ring-yellow-400/20 scale-105'
                    : 'border-[var(--color-border)] hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                title={`${pair.fg} / ${pair.bg}`}
              >
                <div className="absolute inset-0" style={{ backgroundColor: pair.bg }} />
                <div className="absolute inset-2 rounded-lg shadow-sm" style={{ backgroundColor: pair.fg }} />
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Gradient Section ── */}
      <section className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider">Dot Gradient</h4>
          <button
            onClick={() => set({ useFgGradient: !useFgGradient })}
            className={`w-10 h-5 rounded-full transition-colors ${
              useFgGradient ? 'bg-orange-600 dark:bg-yellow-400' : 'bg-gray-300 dark:bg-gray-700'
            } relative`}
          >
            <div
              className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                useFgGradient ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {useFgGradient && (
          <div className="space-y-5 pt-3 border-t border-[var(--color-border)]">
            {/* Type toggle */}
            <div className="flex p-1 bg-white dark:bg-black/20 rounded-xl border border-[var(--color-border)]">
              {(['linear', 'radial'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => set({ fgGradient: { ...fgGradient, type } })}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    fgGradient.type === type
                      ? 'bg-orange-600 dark:bg-yellow-400 text-white dark:text-black shadow-sm'
                      : 'opacity-50'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase opacity-60">
                <span>Rotation</span>
                <span>{fgGradient.rotation}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={fgGradient.rotation}
                onChange={(e) =>
                  set({ fgGradient: { ...fgGradient, rotation: Number(e.target.value) } })
                }
                className="w-full accent-orange-600 dark:accent-yellow-400 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            {/* Color stops */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase opacity-60">Color Stops</span>
                <button
                  onClick={randomizeGradient}
                  className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-yellow-400 hover:opacity-70 transition-opacity"
                >
                  <Dices className="w-3 h-3" />
                  Random
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase opacity-60">Start</span>
                  <input
                    type="color"
                    value={fgGradient.colorStops[0].color}
                    onChange={(e) => {
                      const stops = [...fgGradient.colorStops];
                      stops[0] = { ...stops[0], color: e.target.value };
                      set({ fgGradient: { ...fgGradient, colorStops: stops } });
                    }}
                    className="w-full h-8 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase opacity-60">End</span>
                  <input
                    type="color"
                    value={fgGradient.colorStops[1].color}
                    onChange={(e) => {
                      const stops = [...fgGradient.colorStops];
                      stops[1] = { ...stops[1], color: e.target.value };
                      set({ fgGradient: { ...fgGradient, colorStops: stops } });
                    }}
                    className="w-full h-8 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Gradient live preview */}
            <div
              className="h-6 rounded-xl border border-[var(--color-border)] shadow-inner"
              style={{
                background:
                  fgGradient.type === 'linear'
                    ? `linear-gradient(${fgGradient.rotation}deg, ${fgGradient.colorStops[0].color}, ${fgGradient.colorStops[1].color})`
                    : `radial-gradient(circle, ${fgGradient.colorStops[0].color}, ${fgGradient.colorStops[1].color})`,
              }}
            />
          </div>
        )}
      </section>

      {/* ── Designer Palettes ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Designer Palettes
          </h4>
          <div className="flex items-center gap-3">
            <button
              onClick={randomPalette}
              className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-yellow-400 hover:opacity-70 transition-opacity"
            >
              <Dices className="w-3 h-3" />
              Random
            </button>
            <button
              onClick={() => setShowPaletteNames((v) => !v)}
              className="text-[10px] font-bold text-orange-600 dark:text-yellow-400 hover:opacity-70 transition-opacity"
            >
              {showPaletteNames ? 'Grid view' : 'List view'}
            </button>
          </div>
        </div>
        <div className={`grid gap-2.5 ${showPaletteNames ? 'grid-cols-4' : 'grid-cols-6'}`}>
          {PALETTES.map((p) => {
            const isActive = activePalette === p.name;
            return (
              <button
                key={p.name}
                onClick={() => set({ fgColor: p.fg, bgColor: p.bg, activePalette: p.name })}
                className={`group relative overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                  showPaletteNames
                    ? 'rounded-xl flex items-center gap-2 px-2 py-2'
                    : 'aspect-square rounded-xl'
                } ${
                  isActive
                    ? 'border-orange-600 dark:border-yellow-400 ring-4 ring-orange-500/20 dark:ring-yellow-400/20'
                    : 'border-[var(--color-border)]'
                }`}
              >
                {showPaletteNames ? (
                  <>
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg overflow-hidden relative">
                      <div className="absolute inset-0" style={{ backgroundColor: p.bg }} />
                      <div className="absolute inset-1 rounded" style={{ backgroundColor: p.fg }} />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--color-text)] truncate">
                      {p.name}
                    </span>
                    {isActive && (
                      <Check className="w-3 h-3 ml-auto text-orange-600 dark:text-yellow-400 flex-shrink-0" />
                    )}
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0" style={{ backgroundColor: p.bg }} />
                    <div
                      className="absolute inset-2 rounded-lg shadow-sm"
                      style={{ backgroundColor: p.fg }}
                    />
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
