'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQRStore } from '../../store/useQRStore';
import {
  STYLE_PRESETS,
  type DotType,
  type CornerSquareType,
  type CornerDotType,
  type ErrorCorrectionLevel,
  type StylePreset,
} from '../../types/qr';
import {
  Sparkles,
  Shuffle,
  Dices,
  RotateCcw,
  Check,
  Zap,
  Bookmark,
  Trash2,
  Copy,
  CheckCircle2,
  Search,
  Eye,
  Layers,
  ShieldCheck,
  Maximize2,
  Pipette,
  Gauge,
  Printer,
} from 'lucide-react';

/* ────────────────── Types & Interfaces ────────────────── */

type StyleSubTab = 'presets' | 'pattern' | 'eyes' | 'density' | 'saved';

interface SavedStyle {
  id: string;
  name: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  errorCorrectionLevel: ErrorCorrectionLevel;
  useCustomEyeColors: boolean;
  cornerSquareColor: string;
  cornerDotColor: string;
  qrSize: number;
  timestamp: number;
}

interface EyeComboPreset {
  name: string;
  square: CornerSquareType;
  dot: CornerDotType;
  tag: string;
}

/* ────────────────── Presets & Meta Data ────────────────── */

const PRESET_CATEGORIES = [
  'All',
  'Trending',
  'Tech',
  'Minimal',
  'Luxury',
  'Corporate',
  'Playful',
  'Retro',
] as const;

type PresetCategory = (typeof PRESET_CATEGORIES)[number];

const EYE_COMBO_PRESETS: EyeComboPreset[] = [
  { name: 'Classic Box', square: 'square', dot: 'square', tag: 'Standard' },
  { name: 'Target Eye', square: 'dot', dot: 'dot', tag: 'Circular' },
  { name: 'Soft Pearl', square: 'extra-rounded', dot: 'dot', tag: 'Modern' },
  { name: 'Solid Rounded', square: 'extra-rounded', dot: 'square', tag: 'Hybrid' },
  { name: 'Sharp Diamond', square: 'square', dot: 'dot', tag: 'Tech' },
  { name: 'Framed Dot', square: 'dot', dot: 'square', tag: 'Retro' },
];

const ERROR_LEVEL_INFO: Record<
  ErrorCorrectionLevel,
  { label: string; recovery: string; percent: number; desc: string; tip: string; bestFor: string }
> = {
  L: {
    label: 'Level L',
    recovery: '~7% Recovery',
    percent: 7,
    desc: 'Lowest density, cleanest grid',
    tip: 'Ideal for small screens, long URLs, and rapid scanning where byte size matters.',
    bestFor: 'Compact URLs & Fast Scan',
  },
  M: {
    label: 'Level M',
    recovery: '~15% Recovery',
    percent: 15,
    desc: 'Standard balanced reliability',
    tip: 'The universal default for general use, digital flyers, websites, and business cards.',
    bestFor: 'Universal Default',
  },
  Q: {
    label: 'Level Q',
    recovery: '~25% Recovery',
    percent: 25,
    desc: 'High damage resistance',
    tip: 'Recommended when placing moderate logos in the center or for outdoor signage.',
    bestFor: 'Logos & Posters',
  },
  H: {
    label: 'Level H',
    recovery: '~30% Recovery',
    percent: 30,
    desc: 'Maximum error restoration',
    tip: 'Guarantees scan reliability even if up to 30% of the QR code is obscured or damaged.',
    bestFor: 'Large Logos & Heavy Print',
  },
};

const QR_SIZE_PRESETS = [
  { label: 'S', value: 180, desc: 'Web Widget' },
  { label: 'M', value: 280, desc: 'Card / Screen' },
  { label: 'L', value: 400, desc: 'Print / Flyer' },
  { label: 'XL', value: 512, desc: 'HiDPI Poster' },
];

const EYE_SWATCHES = [
  '#000000',
  '#4F46E5',
  '#06B6D4',
  '#059669',
  '#E11D48',
  '#D97706',
  '#7C3AED',
  '#2563EB',
  '#DC2626',
  '#FFFFFF',
];

/* ── Helpers ── */
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 65 + Math.floor(Math.random() * 30);
  const l = 30 + Math.floor(Math.random() * 30);
  const lNorm = l / 100;
  const a = (s * Math.min(lNorm, 1 - lNorm)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/* ────────────────── SVG Geometric Miniatures ────────────────── */

/** Renders a precise 3x3 vector representation of a body dot pattern */
function PatternPreviewSVG({
  type,
  color = 'currentColor',
  size = 32,
}: {
  type: DotType;
  color?: string;
  size?: number;
}) {
  const cell = 7;
  const gap = 3;
  const offset = 2;

  const positions = [
    [0, 0], [0, 1], [0, 2],
    [1, 0],         [1, 2],
    [2, 0], [2, 1], [2, 2],
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.04" />
      {positions.map(([row, col], idx) => {
        const x = offset + col * (cell + gap);
        const y = offset + row * (cell + gap);

        switch (type) {
          case 'square':
            return <rect key={idx} x={x} y={y} width={cell} height={cell} fill={color} rx="0.5" />;
          case 'dots':
            return (
              <circle
                key={idx}
                cx={x + cell / 2}
                cy={y + cell / 2}
                r={cell / 2}
                fill={color}
              />
            );
          case 'rounded':
            return <rect key={idx} x={x} y={y} width={cell} height={cell} rx="2.5" fill={color} />;
          case 'classy':
            return (
              <path
                key={idx}
                d={`M ${x + cell / 2} ${y} Q ${x + cell} ${y + cell / 2} ${x + cell / 2} ${y + cell} Q ${x} ${y + cell / 2} ${x + cell / 2} ${y} Z`}
                fill={color}
              />
            );
          case 'classy-rounded':
            return (
              <path
                key={idx}
                d={`M ${x + 2} ${y} L ${x + cell - 2} ${y} Q ${x + cell} ${y} ${x + cell} ${y + 2} L ${x + cell} ${y + cell - 2} Q ${x + cell} ${y + cell} ${x + cell - 2} ${y + cell} L ${x + 2} ${y + cell} Q ${x} ${y + cell} ${x} ${y + cell - 2} L ${x} ${y + 2} Q ${x} ${y} ${x + 2} ${y} Z`}
                fill={color}
              />
            );
          case 'extra-rounded':
            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width={cell}
                height={cell}
                rx={cell / 2}
                fill={color}
              />
            );
          default:
            return <rect key={idx} x={x} y={y} width={cell} height={cell} fill={color} />;
        }
      })}
    </svg>
  );
}

/** Renders a precise vector representation of an eye finder corner pattern */
function EyePreviewSVG({
  squareType,
  dotType,
  frameColor = 'currentColor',
  dotColor = 'currentColor',
  size = 32,
}: {
  squareType: CornerSquareType;
  dotType: CornerDotType;
  frameColor?: string;
  dotColor?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.04" />
      {/* Outer Square / Frame */}
      {squareType === 'square' && (
        <rect
          x="4"
          y="4"
          width="24"
          height="24"
          rx="1"
          stroke={frameColor}
          strokeWidth="3.5"
          fill="none"
        />
      )}
      {squareType === 'extra-rounded' && (
        <rect
          x="4"
          y="4"
          width="24"
          height="24"
          rx="7"
          stroke={frameColor}
          strokeWidth="3.5"
          fill="none"
        />
      )}
      {squareType === 'dot' && (
        <circle cx="16" cy="16" r="11" stroke={frameColor} strokeWidth="3.5" fill="none" />
      )}

      {/* Inner Pupil / Dot */}
      {dotType === 'square' && (
        <rect x="11.5" y="11.5" width="9" height="9" rx="1" fill={dotColor} />
      )}
      {dotType === 'dot' && <circle cx="16" cy="16" r="5" fill={dotColor} />}
    </svg>
  );
}

/* ────────────────── Main Component ────────────────── */

export default function StyleTab() {
  const {
    dotType,
    cornerSquareType,
    cornerDotType,
    useCustomEyeColors,
    cornerSquareColor,
    cornerDotColor,
    qrSize,
    errorCorrectionLevel,
    fgColor,
    set,
  } = useQRStore();

  // Local navigation & search
  const [activeSubTab, setActiveSubTab] = useState<StyleSubTab>('presets');
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [presetCategory, setPresetCategory] = useState<PresetCategory>('All');
  const [presetSearch, setPresetSearch] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);

  // Favorites & Recents in LocalStorage
  const [savedStyles, setSavedStyles] = useState<SavedStyle[]>([]);

  // Check for native EyeDropper support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

  // Load saved styles from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qr_style_favorites');
      if (stored) setSavedStyles(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  // Toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  /* ── Filtered presets ── */
  const filteredPresets = useMemo(() => {
    return STYLE_PRESETS.filter((p) => {
      const matchCat = presetCategory === 'All' || p.category === presetCategory;
      const matchSearch =
        !presetSearch.trim() ||
        p.name.toLowerCase().includes(presetSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(presetSearch.toLowerCase()) ||
        (p.tag && p.tag.toLowerCase().includes(presetSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [presetCategory, presetSearch]);

  /* ── Scannability & Reliability Score ── */
  const scannabilityData = useMemo(() => {
    let score = 90;
    if (errorCorrectionLevel === 'H') score += 9;
    else if (errorCorrectionLevel === 'Q') score += 6;
    else if (errorCorrectionLevel === 'M') score += 3;
    else score -= 2;

    if (qrSize >= 400) score += 1;
    if (qrSize <= 160) score -= 4;

    const cmSize = (qrSize / 118).toFixed(1);
    const inchSize = (qrSize / 300).toFixed(1);

    return {
      score: Math.min(100, Math.max(75, score)),
      cmSize,
      inchSize,
      info: ERROR_LEVEL_INFO[errorCorrectionLevel],
    };
  }, [errorCorrectionLevel, qrSize]);

  /* ── Eyedropper API handler ── */
  const pickScreenColor = async (target: 'frame' | 'dot') => {
    if (!hasEyeDropper) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        const color = result.sRGBHex.toUpperCase();
        if (target === 'frame') {
          set({ cornerSquareColor: color, useCustomEyeColors: true });
        } else {
          set({ cornerDotColor: color, useCustomEyeColors: true });
        }
        showToast(`Picked ${color}`);
      }
    } catch {
      // User dismissed
    }
  };

  /* ── Randomizers ── */
  const randomizeDots = useCallback(() => {
    const list: DotType[] = [
      'square',
      'dots',
      'rounded',
      'classy',
      'classy-rounded',
      'extra-rounded',
    ];
    const chosen = pick(list);
    set({ dotType: chosen });
    setActivePreset(null);
    showToast(`Pattern: ${chosen}`);
  }, [set]);

  const randomizeEyes = useCallback(() => {
    const combo = pick(EYE_COMBO_PRESETS);
    set({
      cornerSquareType: combo.square,
      cornerDotType: combo.dot,
    });
    setActivePreset(null);
    showToast(`Eyes: ${combo.name}`);
  }, [set]);

  const randomizeEyeColors = useCallback(() => {
    const sq = randomHex();
    const dt = randomHex();
    set({
      useCustomEyeColors: true,
      cornerSquareColor: sq,
      cornerDotColor: dt,
    });
    showToast('Randomized eye colors');
  }, [set]);

  const randomizeAllHarmonious = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    const randomP = pick(STYLE_PRESETS);
    setActivePreset(randomP.name);
    set({
      dotType: randomP.dotType,
      cornerSquareType: randomP.cornerSquareType,
      cornerDotType: randomP.cornerDotType,
      errorCorrectionLevel: randomP.errorCorrectionLevel,
      useCustomEyeColors: randomP.useCustomEyeColors,
      cornerSquareColor: randomP.cornerSquareColor,
      cornerDotColor: randomP.cornerDotColor,
    });
    showToast(`Applied preset: ${randomP.name}`);
  }, [set]);

  const applyPreset = useCallback(
    (preset: StylePreset) => {
      setActivePreset(preset.name);
      set({
        dotType: preset.dotType,
        cornerSquareType: preset.cornerSquareType,
        cornerDotType: preset.cornerDotType,
        errorCorrectionLevel: preset.errorCorrectionLevel,
        useCustomEyeColors: preset.useCustomEyeColors,
        cornerSquareColor: preset.cornerSquareColor,
        cornerDotColor: preset.cornerDotColor,
      });
      showToast(`Style: ${preset.name}`);
    },
    [set]
  );

  const resetStyles = useCallback(() => {
    setActivePreset(null);
    set({
      dotType: 'square',
      cornerSquareType: 'square',
      cornerDotType: 'square',
      useCustomEyeColors: false,
      cornerSquareColor: '#000000',
      cornerDotColor: '#000000',
      errorCorrectionLevel: 'M',
      qrSize: 280,
    });
    showToast('Reset to Classic Clean');
  }, [set]);

  /* ── Save / Delete Favorites ── */
  const saveCurrentStyle = () => {
    const newStyle: SavedStyle = {
      id: `${Date.now()}`,
      name: `Custom Style ${savedStyles.length + 1}`,
      dotType,
      cornerSquareType,
      cornerDotType,
      errorCorrectionLevel,
      useCustomEyeColors,
      cornerSquareColor,
      cornerDotColor,
      qrSize,
      timestamp: Date.now(),
    };
    const updated = [newStyle, ...savedStyles];
    setSavedStyles(updated);
    try {
      localStorage.setItem('qr_style_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Saved to custom favorites!');
  };

  const deleteSavedStyle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedStyles.filter((s) => s.id !== id);
    setSavedStyles(updated);
    try {
      localStorage.setItem('qr_style_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Style removed');
  };

  const applySavedStyle = (s: SavedStyle) => {
    set({
      dotType: s.dotType,
      cornerSquareType: s.cornerSquareType,
      cornerDotType: s.cornerDotType,
      errorCorrectionLevel: s.errorCorrectionLevel,
      useCustomEyeColors: s.useCustomEyeColors,
      cornerSquareColor: s.cornerSquareColor,
      cornerDotColor: s.cornerDotColor,
      qrSize: s.qrSize,
    });
    setActivePreset(null);
    showToast(`Loaded: ${s.name}`);
  };

  const copyStyleSpecs = () => {
    const specs = JSON.stringify(
      {
        dotType,
        cornerSquareType,
        cornerDotType,
        errorCorrectionLevel,
        useCustomEyeColors,
        cornerSquareColor: useCustomEyeColors ? cornerSquareColor : undefined,
        cornerDotColor: useCustomEyeColors ? cornerDotColor : undefined,
        qrSize,
      },
      null,
      2
    );
    navigator.clipboard.writeText(specs);
    showToast('Style specs copied to clipboard!');
  };

  /* ── Sync eye colors with pattern ── */
  const syncEyeColorsWithPattern = () => {
    set({
      useCustomEyeColors: true,
      cornerSquareColor: fgColor,
      cornerDotColor: fgColor,
    });
    showToast('Synced eye colors to primary pattern');
  };

  const inputClass =
    'w-full px-3 py-2 text-xs border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] font-mono font-bold focus:ring-2 focus:ring-[var(--color-secondary)] outline-none transition-all';

  return (
    <div className={`space-y-6 ${isShaking ? 'animate-shake' : ''}`}>
      {/* ── Sub-Tab Segmented Controller ── */}
      <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('presets')}
          className={`flex-1 min-w-[76px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'presets'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500 dark:text-yellow-400" />
          Presets
        </button>

        <button
          onClick={() => setActiveSubTab('pattern')}
          className={`flex-1 min-w-[76px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'pattern'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Pattern
        </button>

        <button
          onClick={() => setActiveSubTab('eyes')}
          className={`flex-1 min-w-[76px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'eyes'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Eyes
        </button>

        <button
          onClick={() => setActiveSubTab('density')}
          className={`flex-1 min-w-[76px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'density'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Quality & Size
        </button>

        <button
          onClick={() => setActiveSubTab('saved')}
          className={`flex-1 min-w-[76px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'saved'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Saved
        </button>
      </div>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="flex items-center justify-center gap-1.5 py-1 px-3 mx-auto w-fit bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-full shadow-lg animate-fade-in-up">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ────────────────── SUB-TAB 1: PRESETS ────────────────── */}
      {activeSubTab === 'presets' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Master Actions Bar */}
          <div className="flex gap-2">
            <button
              onClick={randomizeAllHarmonious}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Harmonious Mix
            </button>
            <button
              onClick={copyStyleSpecs}
              title="Copy style specifications as JSON"
              className="px-3.5 py-3 rounded-2xl border border-[var(--color-border)] bg-gray-50 dark:bg-white/5 text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={resetStyles}
              title="Reset to default clean style"
              className="px-3.5 py-3 rounded-2xl border border-[var(--color-border)] bg-gray-50 dark:bg-white/5 text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Search & Category Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search style presets (e.g. cyber, minimal, velvet)..."
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-xs border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPresetCategory(cat)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    presetCategory === cat
                      ? 'bg-[var(--color-secondary)] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-[var(--color-text)] hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredPresets.map((p) => {
              const isActive = activePreset === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className={`group relative flex flex-col p-3 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                    isActive
                      ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/8 shadow-sm ring-2 ring-[var(--color-secondary)]/20'
                      : 'border-[var(--color-border)] bg-white dark:bg-black/20 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{p.emoji}</span>
                    {p.tag && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {p.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <PatternPreviewSVG
                      type={p.dotType}
                      color={p.useCustomEyeColors ? p.cornerSquareColor : 'currentColor'}
                      size={24}
                    />
                    <EyePreviewSVG
                      squareType={p.cornerSquareType}
                      dotType={p.cornerDotType}
                      frameColor={p.useCustomEyeColors ? p.cornerSquareColor : 'currentColor'}
                      dotColor={p.useCustomEyeColors ? p.cornerDotColor : 'currentColor'}
                      size={24}
                    />
                  </div>

                  <span className="text-xs font-bold text-[var(--color-text)]">{p.name}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {p.description}
                  </span>

                  {isActive && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-[var(--color-secondary)] rounded-full flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 2: PATTERN (BODY DOTS) ────────────────── */}
      {activeSubTab === 'pattern' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text)]">QR Matrix Pattern</h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Choose the shape structure for the interior QR body dots
              </p>
            </div>
            <button
              onClick={randomizeDots}
              title="Shuffle pattern shape"
              className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-secondary)] hover:opacity-80 active:scale-95 transition-all cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5" />
              Shuffle
            </button>
          </div>

          {/* Dot Patterns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              {
                key: 'square' as DotType,
                label: 'Square Grid',
                badge: 'Standard',
                desc: 'Universal classic pixels',
              },
              {
                key: 'dots' as DotType,
                label: 'Circle Dots',
                badge: 'Modern',
                desc: 'Clean rounded circles',
              },
              {
                key: 'rounded' as DotType,
                label: 'Smooth Rounded',
                badge: 'Soft',
                desc: 'Subtle corner curvature',
              },
              {
                key: 'classy' as DotType,
                label: 'Classy Diamond',
                badge: 'Sharp',
                desc: 'Concave geometric cut',
              },
              {
                key: 'classy-rounded' as DotType,
                label: 'Classy Star',
                badge: 'Hybrid',
                desc: 'Dynamic sculpted edges',
              },
              {
                key: 'extra-rounded' as DotType,
                label: 'Extra Rounded',
                badge: 'Organic',
                desc: 'Playful soft capsules',
              },
            ].map((s) => {
              const active = dotType === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => {
                    set({ dotType: s.key });
                    setActivePreset(null);
                  }}
                  className={`group relative flex flex-col p-3.5 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-left cursor-pointer ${
                    active
                      ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/8 shadow-sm ring-2 ring-[var(--color-secondary)]/20'
                      : 'border-[var(--color-border)] bg-white dark:bg-black/20 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <PatternPreviewSVG
                      type={s.key}
                      color={active ? 'var(--color-secondary)' : 'currentColor'}
                      size={32}
                    />
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {s.badge}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[var(--color-text)]">{s.label}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {s.desc}
                  </span>

                  {active && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-[var(--color-secondary)] rounded-full flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Shape Archetypes */}
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] space-y-3">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Quick Archetypes
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  set({ dotType: 'dots', cornerSquareType: 'dot', cornerDotType: 'dot' });
                  setActivePreset(null);
                  showToast('Applied: Pure Circular');
                }}
                className="py-2 px-2 text-[10px] font-bold rounded-xl border border-[var(--color-border)] bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                ● Pure Circular
              </button>
              <button
                onClick={() => {
                  set({ dotType: 'square', cornerSquareType: 'square', cornerDotType: 'square' });
                  setActivePreset(null);
                  showToast('Applied: Ultra Sharp');
                }}
                className="py-2 px-2 text-[10px] font-bold rounded-xl border border-[var(--color-border)] bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                ◼ Ultra Sharp
              </button>
              <button
                onClick={() => {
                  set({
                    dotType: 'extra-rounded',
                    cornerSquareType: 'extra-rounded',
                    cornerDotType: 'dot',
                  });
                  setActivePreset(null);
                  showToast('Applied: Modern Pill');
                }}
                className="py-2 px-2 text-[10px] font-bold rounded-xl border border-[var(--color-border)] bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✦ Modern Pill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 3: EYE GEOMETRY & COLORS ────────────────── */}
      {activeSubTab === 'eyes' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Quick Eye Combos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[var(--color-text)]">Curated Eye Pairings</h4>
              <button
                onClick={randomizeEyes}
                title="Pick a random eye combo"
                className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-secondary)] hover:opacity-80 active:scale-95 transition-all cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5" />
                Shuffle
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EYE_COMBO_PRESETS.map((combo) => {
                const isActive =
                  cornerSquareType === combo.square && cornerDotType === combo.dot;
                return (
                  <button
                    key={combo.name}
                    onClick={() => {
                      set({
                        cornerSquareType: combo.square,
                        cornerDotType: combo.dot,
                      });
                      setActivePreset(null);
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 text-left transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/8 shadow-xs'
                        : 'border-[var(--color-border)] bg-white dark:bg-black/20 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <EyePreviewSVG
                      squareType={combo.square}
                      dotType={combo.dot}
                      frameColor={
                        useCustomEyeColors
                          ? cornerSquareColor
                          : isActive
                            ? 'var(--color-secondary)'
                            : 'currentColor'
                      }
                      dotColor={
                        useCustomEyeColors
                          ? cornerDotColor
                          : isActive
                            ? 'var(--color-secondary)'
                            : 'currentColor'
                      }
                      size={26}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-[var(--color-text)] truncate">
                        {combo.name}
                      </span>
                      <span className="block text-[9px] text-gray-400 uppercase tracking-wider">
                        {combo.tag}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Independent Eye Customizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Eye Frame Shape */}
            <div className="p-3.5 bg-gray-50/70 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] space-y-3">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                1. Eye Frame (Outer)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'square' as CornerSquareType, label: 'Square' },
                  { key: 'extra-rounded' as CornerSquareType, label: 'Rounded' },
                  { key: 'dot' as CornerSquareType, label: 'Circle' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      set({ cornerSquareType: s.key });
                      setActivePreset(null);
                    }}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border-2 transition-all active:scale-95 cursor-pointer ${
                      cornerSquareType === s.key
                        ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 font-bold text-[var(--color-secondary)]'
                        : 'border-[var(--color-border)] opacity-60 hover:opacity-100 bg-white dark:bg-black/20'
                    }`}
                  >
                    <EyePreviewSVG
                      squareType={s.key}
                      dotType="square"
                      frameColor="currentColor"
                      dotColor="transparent"
                      size={24}
                    />
                    <span className="text-[10px]">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Eye Dot Shape */}
            <div className="p-3.5 bg-gray-50/70 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] space-y-3">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                2. Eye Pupil (Center)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'square' as CornerDotType, label: 'Square' },
                  { key: 'dot' as CornerDotType, label: 'Circle Dot' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      set({ cornerDotType: s.key });
                      setActivePreset(null);
                    }}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border-2 transition-all active:scale-95 cursor-pointer ${
                      cornerDotType === s.key
                        ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 font-bold text-[var(--color-secondary)]'
                        : 'border-[var(--color-border)] opacity-60 hover:opacity-100 bg-white dark:bg-black/20'
                    }`}
                  >
                    <EyePreviewSVG
                      squareType="square"
                      dotType={s.key}
                      frameColor="transparent"
                      dotColor="currentColor"
                      size={24}
                    />
                    <span className="text-[10px]">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Eye Colors Section */}
          <div className="p-4 bg-gray-50/80 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[var(--color-text)]">Custom Eye Colors</h4>
                <p className="text-[10px] text-gray-400">
                  Give corner eyes unique contrasting accent colors
                </p>
              </div>
              <div className="flex items-center gap-2">
                {useCustomEyeColors && (
                  <button
                    onClick={randomizeEyeColors}
                    title="Random eye colors"
                    className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-secondary)] hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <Shuffle className="w-3 h-3" />
                    Random
                  </button>
                )}
                <button
                  onClick={() => set({ useCustomEyeColors: !useCustomEyeColors })}
                  className={`w-11 h-6 rounded-full transition-all ${
                    useCustomEyeColors
                      ? 'bg-[var(--color-secondary)]'
                      : 'bg-gray-300 dark:bg-gray-700'
                  } relative cursor-pointer`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-xs ${
                      useCustomEyeColors ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {useCustomEyeColors && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Frame Color */}
                  <div className="p-3 bg-white dark:bg-black/30 rounded-xl border border-[var(--color-border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                        Outer Frame Color
                      </span>
                      {hasEyeDropper && (
                        <button
                          onClick={() => pickScreenColor('frame')}
                          title="Sample from screen"
                          className="p-1 text-gray-400 hover:text-orange-500 rounded-md cursor-pointer"
                        >
                          <Pipette className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-10 h-8 shrink-0 rounded-lg overflow-hidden border border-[var(--color-border)] cursor-pointer">
                        <input
                          type="color"
                          value={cornerSquareColor}
                          onChange={(e) => set({ cornerSquareColor: e.target.value })}
                          className="absolute -inset-4 w-20 h-20 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={cornerSquareColor}
                        onChange={(e) => set({ cornerSquareColor: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Dot Color */}
                  <div className="p-3 bg-white dark:bg-black/30 rounded-xl border border-[var(--color-border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                        Center Dot Color
                      </span>
                      {hasEyeDropper && (
                        <button
                          onClick={() => pickScreenColor('dot')}
                          title="Sample from screen"
                          className="p-1 text-gray-400 hover:text-orange-500 rounded-md cursor-pointer"
                        >
                          <Pipette className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-10 h-8 shrink-0 rounded-lg overflow-hidden border border-[var(--color-border)] cursor-pointer">
                        <input
                          type="color"
                          value={cornerDotColor}
                          onChange={(e) => set({ cornerDotColor: e.target.value })}
                          className="absolute -inset-4 w-20 h-20 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={cornerDotColor}
                        onChange={(e) => set({ cornerDotColor: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Swatches & Sync button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 uppercase font-bold mr-1">
                      Swatches:
                    </span>
                    {EYE_SWATCHES.slice(0, 7).map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          set({
                            cornerSquareColor: color,
                            cornerDotColor: color,
                          })
                        }
                        className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={`Apply ${color} to eyes`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={syncEyeColorsWithPattern}
                    className="text-[10px] font-bold text-[var(--color-secondary)] hover:underline cursor-pointer"
                  >
                    Sync with Pattern Color
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 4: QUALITY & SIZING ────────────────── */}
      {activeSubTab === 'density' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Diagnostic Scannability Card */}
          <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-gray-50/70 dark:bg-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-[var(--color-text)]">
                  Scan Reliability Diagnostic
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                {scannabilityData.score}% Scannability
              </span>
            </div>

            {/* Score progress bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${scannabilityData.score}%` }}
              />
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {scannabilityData.info.tip}
            </p>
          </div>

          {/* Error Correction Level Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[var(--color-text)]">
                Error Correction Level
              </h4>
              <span className="text-[10px] font-bold text-[var(--color-secondary)] uppercase">
                {scannabilityData.info.recovery}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['L', 'M', 'Q', 'H'] as const).map((lvl) => {
                const info = ERROR_LEVEL_INFO[lvl];
                const active = errorCorrectionLevel === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => {
                      set({ errorCorrectionLevel: lvl });
                      setActivePreset(null);
                    }}
                    className={`flex flex-col p-3 rounded-2xl border-2 text-left transition-all active:scale-95 cursor-pointer ${
                      active
                        ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 shadow-xs ring-2 ring-[var(--color-secondary)]/20'
                        : 'border-[var(--color-border)] bg-white dark:bg-black/20 hover:border-gray-300 dark:hover:border-gray-600 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black text-[var(--color-text)]">{lvl}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                        {info.percent}%
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
                      {info.bestFor}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* QR Size Slider & Dimension Estimator */}
          <div className="p-4 bg-gray-50/70 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                <h4 className="text-xs font-bold text-[var(--color-text)]">QR Dimensions</h4>
              </div>
              <span className="text-xs font-mono font-bold text-[var(--color-secondary)] px-2 py-0.5 bg-[var(--color-secondary)]/10 rounded-md">
                {qrSize} px
              </span>
            </div>

            {/* Quick Size Presets */}
            <div className="grid grid-cols-4 gap-2">
              {QR_SIZE_PRESETS.map((sp) => (
                <button
                  key={sp.label}
                  onClick={() => set({ qrSize: sp.value })}
                  className={`py-2 rounded-xl text-center transition-all cursor-pointer ${
                    qrSize === sp.value
                      ? 'bg-[var(--color-secondary)] text-white font-bold shadow-xs'
                      : 'bg-white dark:bg-black/20 text-gray-600 dark:text-gray-300 border border-[var(--color-border)] hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="block text-xs font-bold">{sp.label}</span>
                  <span className="block text-[9px] opacity-70">{sp.value}px</span>
                </button>
              ))}
            </div>

            {/* Range Slider */}
            <div className="space-y-1.5 pt-1">
              <input
                type="range"
                min="120"
                max="600"
                step="10"
                value={qrSize}
                onChange={(e) => set({ qrSize: Number(e.target.value) })}
                className="w-full accent-[var(--color-secondary)] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>120px (Compact)</span>
                <span>600px (Print HD)</span>
              </div>
            </div>

            {/* Physical Print Size Estimate */}
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-black/30 rounded-xl border border-[var(--color-border)]">
              <Printer className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                <span>Estimated Print Size (at 300 DPI): </span>
                <span className="font-bold text-[var(--color-text)]">
                  ~{scannabilityData.cmSize} cm × {scannabilityData.cmSize} cm ({scannabilityData.inchSize}&quot; × {scannabilityData.inchSize}&quot;)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 5: SAVED STYLES ────────────────── */}
      {activeSubTab === 'saved' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text)]">Saved Style Presets</h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Save and recall your favorite custom styling combinations
              </p>
            </div>
            <button
              onClick={saveCurrentStyle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--color-secondary)] hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Current
            </button>
          </div>

          {savedStyles.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-[var(--color-border)] space-y-2">
              <span className="text-3xl block">✦</span>
              <p className="text-xs font-bold text-[var(--color-text)]">No Saved Styles Yet</p>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                Customize your dot pattern, eye geometries, and colors, then click &quot;Save
                Current&quot; to keep your favorite setup here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedStyles.map((style) => (
                <div
                  key={style.id}
                  onClick={() => applySavedStyle(style)}
                  className="group relative flex items-center justify-between p-3.5 rounded-2xl border border-[var(--color-border)] bg-white dark:bg-black/20 hover:border-[var(--color-secondary)] hover:shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-gray-100 dark:bg-white/5">
                      <PatternPreviewSVG
                        type={style.dotType}
                        color={
                          style.useCustomEyeColors ? style.cornerSquareColor : 'currentColor'
                        }
                        size={22}
                      />
                      <EyePreviewSVG
                        squareType={style.cornerSquareType}
                        dotType={style.cornerDotType}
                        frameColor={
                          style.useCustomEyeColors ? style.cornerSquareColor : 'currentColor'
                        }
                        dotColor={
                          style.useCustomEyeColors ? style.cornerDotColor : 'currentColor'
                        }
                        size={22}
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[var(--color-text)]">
                        {style.name}
                      </span>
                      <span className="block text-[10px] text-gray-400 capitalize">
                        {style.dotType} • {style.cornerSquareType} eye • ECL {style.errorCorrectionLevel}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => deleteSavedStyle(style.id, e)}
                    title="Delete saved style"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}