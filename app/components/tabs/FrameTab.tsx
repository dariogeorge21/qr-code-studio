'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQRStore } from '../../store/useQRStore';
import {
  FRAME_PRESETS,
  type BorderType,
  type FramePreset,
  type FrameCategory,
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
  Layers,
  ShieldCheck,
  Maximize2,
  Pipette,
  Sliders,
  Sun,
  Paintbrush,
  Compass,
  Lock,
  Unlock,
  Palette,
  Square,
  Info,
} from 'lucide-react';

/* ────────────────── Types & Interfaces ────────────────── */

type FrameSubTab = 'presets' | 'border' | 'shadow' | 'spacing' | 'saved';

interface SavedFrame {
  id: string;
  name: string;
  frameEnabled: boolean;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  borderType: BorderType;
  borderOpacity: number;
  individualCorners: boolean;
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  borderBottomRightRadius: number;
  borderBottomLeftRadius: number;
  frameBgEnabled: boolean;
  frameBgColor: string;
  padding: number;
  shadowEnabled: boolean;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
  shadowInset: boolean;
  timestamp: number;
}

type LightDirection = 'tl' | 't' | 'tr' | 'r' | 'br' | 'b' | 'bl' | 'l' | 'center';

interface CornerShapePreset {
  name: string;
  label: string;
  icon: string;
  tl: number;
  tr: number;
  br: number;
  bl: number;
  desc: string;
}

interface ShadowPresetItem {
  label: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
  tag: string;
}

/* ────────────────── Constants & Presets ────────────────── */

const FRAME_CATEGORIES = [
  'All',
  'Trending',
  'Minimal',
  'Neon',
  'Luxury',
  'Retro',
  'Brutalist',
  'Organic',
] as const;

const BORDER_TYPES: { key: BorderType; label: string; desc: string }[] = [
  { key: 'solid', label: 'Solid', desc: 'Clean continuous line' },
  { key: 'dashed', label: 'Dashed', desc: 'Segmented coupon style' },
  { key: 'dotted', label: 'Dotted', desc: 'Fine perforation dots' },
  { key: 'double', label: 'Double', desc: 'Two parallel strokes' },
  { key: 'groove', label: 'Groove', desc: 'Carved 3D surface' },
  { key: 'ridge', label: 'Ridge', desc: 'Elevated 3D border' },
  { key: 'inset', label: 'Inset', desc: 'Sunken frame bevel' },
  { key: 'outset', label: 'Outset', desc: 'Embossed frame bevel' },
];

const CORNER_SHAPE_PRESETS: CornerShapePreset[] = [
  { name: 'pill', label: 'Pill / Capsule', icon: '💊', tl: 48, tr: 48, br: 48, bl: 48, desc: 'Maximum rounded curve' },
  { name: 'leaf', label: 'Leaf / Petal', icon: '🌿', tl: 40, tr: 4, br: 40, bl: 4, desc: 'Diagonal organic curves' },
  { name: 'ticket', label: 'Ticket Cut', icon: '🎟️', tl: 24, tr: 0, br: 24, bl: 0, desc: 'Signature coupon corners' },
  { name: 'drop', label: 'Water Drop', icon: '💧', tl: 44, tr: 44, br: 4, bl: 44, desc: '3 rounded + 1 sharp pin' },
  { name: 'badge', label: 'Modern Badge', icon: '🛡️', tl: 36, tr: 8, br: 36, bl: 8, desc: 'Asymmetrical tech badge' },
  { name: 'squircle', label: 'Soft Squircle', icon: '▢', tl: 22, tr: 22, br: 22, bl: 22, desc: 'iOS smooth rectangle' },
  { name: 'sharp', label: 'Square Sharp', icon: '■', tl: 0, tr: 0, br: 0, bl: 0, desc: '0px crisp geometry' },
  { name: 'wave', label: 'Diagonal Wave', icon: '〰️', tl: 4, tr: 36, bl: 36, br: 4, desc: 'Opposite subtle arcs' },
];

const SHADOW_PRESETS: ShadowPresetItem[] = [
  { label: 'Soft Float', x: 0, y: 8, blur: 24, spread: -4, color: '#00000020', inset: false, tag: 'Natural' },
  { label: 'Deep Elevation', x: 0, y: 16, blur: 40, spread: -6, color: '#00000028', inset: false, tag: '3D Card' },
  { label: 'Neo-Brutalist', x: 6, y: 6, blur: 0, spread: 0, color: '#00000050', inset: false, tag: 'Hard' },
  { label: 'Neon Halo', x: 0, y: 0, blur: 28, spread: 4, color: '#00FF8855', inset: false, tag: 'Glow' },
  { label: 'Violet Aura', x: 0, y: 6, blur: 30, spread: 2, color: '#7C3AED45', inset: false, tag: 'Vibrant' },
  { label: 'Sunken Well', x: 0, y: 3, blur: 10, spread: 0, color: '#00000030', inset: true, tag: 'Inset' },
  { label: 'Ambient Floor', x: 0, y: 2, blur: 12, spread: 0, color: '#00000012', inset: false, tag: 'Subtle' },
  { label: 'Cyber Sunset', x: 0, y: 0, blur: 28, spread: 6, color: '#F43F5E45', inset: false, tag: 'Synth' },
];

const PADDING_PRESETS = [
  { label: 'Compact', value: 12, desc: 'Tight space' },
  { label: 'Standard', value: 20, desc: 'Balanced (Default)' },
  { label: 'Roomy', value: 32, desc: 'Ample breath' },
  { label: 'Poster', value: 48, desc: 'Display print' },
];

const BORDER_WIDTH_PRESETS = [1, 2, 3, 4, 6, 8, 12];

const QUICK_FRAME_COLORS = [
  '#000000',
  '#1E293B',
  '#64748B',
  '#4F46E5',
  '#06B6D4',
  '#059669',
  '#E11D48',
  '#D97706',
  '#7C3AED',
  '#FFFFFF',
];

const QUICK_FRAME_BG_COLORS = [
  '#FFFFFF',
  '#F8FAFC',
  '#FEF3C7',
  '#E0F2FE',
  '#FCE7F3',
  '#DCFCE7',
  '#EDE9FE',
  '#0F172A',
  '#000000',
];

/* ────────────────── Helpers ────────────────── */

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 70 + Math.floor(Math.random() * 25);
  const l = 35 + Math.floor(Math.random() * 25);
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

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ────────────────── SVG Micro-Visualizers ────────────────── */

/** Renders a miniature border style sample */
function BorderIconSVG({ type }: { type: BorderType }) {
  const strokeW = 3;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      {type === 'solid' && (
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" />
      )}
      {type === 'dashed' && (
        <line
          x1="2"
          y1="12"
          x2="22"
          y2="12"
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
      )}
      {type === 'dotted' && (
        <line
          x1="2"
          y1="12"
          x2="22"
          y2="12"
          stroke="currentColor"
          strokeWidth={strokeW}
          strokeDasharray="1.5 3.5"
          strokeLinecap="round"
        />
      )}
      {type === 'double' && (
        <>
          <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" strokeWidth="1.5" />
          <line x1="2" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.5" />
        </>
      )}
      {type === 'groove' && (
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 2" />
      )}
      {type === 'ridge' && (
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
      )}
      {type === 'inset' && (
        <path d="M3 5 L21 5 L17 19 L7 19 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
      )}
      {type === 'outset' && (
        <path d="M7 5 L17 5 L21 19 L3 19 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
      )}
    </svg>
  );
}

/** Renders a miniature vector visual of a frame preset */
function FramePreviewMiniSVG({ preset }: { preset: FramePreset }) {
  const radius = preset.individualCorners
    ? `${preset.borderTopLeftRadius || 0}px ${preset.borderTopRightRadius || 0}px ${preset.borderBottomRightRadius || 0}px ${preset.borderBottomLeftRadius || 0}px`
    : `${Math.min(preset.borderRadius, 14)}px`;

  return (
    <div
      className="w-8 h-8 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
      style={{
        borderRadius: radius,
        borderWidth: `${Math.max(1.5, Math.min(preset.borderWidth, 3))}px`,
        borderStyle: preset.borderType,
        borderColor: preset.borderColor,
        backgroundColor: preset.frameBgEnabled ? preset.frameBgColor || '#f8fafc' : 'transparent',
        boxShadow: preset.shadowEnabled
          ? `${preset.shadowInset ? 'inset ' : ''}${Math.min(preset.shadowX, 2)}px ${Math.min(preset.shadowY, 4)}px ${Math.min(preset.shadowBlur, 8)}px ${preset.shadowColor}`
          : undefined,
      }}
    >
      <div className="w-3 h-3 rounded-[2px] bg-current opacity-30" />
    </div>
  );
}

/* ────────────────── Main Component ────────────────── */

export default function FrameTab() {
  const store = useQRStore();
  const {
    frameEnabled,
    borderWidth,
    borderColor,
    borderRadius,
    borderType,
    borderOpacity,
    individualCorners,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomRightRadius,
    borderBottomLeftRadius,
    frameBgEnabled,
    frameBgColor,
    padding,
    shadowEnabled,
    shadowX,
    shadowY,
    shadowBlur,
    shadowSpread,
    shadowColor,
    shadowInset,
    fgColor,
    bgColor,
    cornerSquareColor,
    set,
  } = store;

  // Sub-tab navigation & search
  const [activeSubTab, setActiveSubTab] = useState<FrameSubTab>('presets');
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [presetCategory, setPresetCategory] = useState<FrameCategory | 'All'>('All');
  const [presetSearch, setPresetSearch] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);

  // Shadow Light Compass state
  const [shadowDistance, setShadowDistance] = useState(8);
  const [activeLightDir, setActiveLightDir] = useState<LightDirection>('br');

  // Favorites & Saved in LocalStorage
  const [savedFrames, setSavedFrames] = useState<SavedFrame[]>([]);

  // Check for native EyeDropper API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

  // Load saved frames on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qr_frame_favorites');
      if (stored) setSavedFrames(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  // Toast feedback trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  /* ── Filtered presets ── */
  const filteredPresets = useMemo(() => {
    return FRAME_PRESETS.filter((p) => {
      const matchCat = presetCategory === 'All' || p.category === presetCategory;
      const matchSearch =
        !presetSearch.trim() ||
        p.name.toLowerCase().includes(presetSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(presetSearch.toLowerCase()) ||
        (p.tag && p.tag.toLowerCase().includes(presetSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [presetCategory, presetSearch]);

  /* ── Eyedropper API handler ── */
  const pickScreenColor = async (target: 'border' | 'bg' | 'shadow') => {
    if (!hasEyeDropper) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        const color = result.sRGBHex.toUpperCase();
        if (target === 'border') {
          set({ borderColor: color, frameEnabled: true });
        } else if (target === 'bg') {
          set({ frameBgColor: color, frameBgEnabled: true });
        } else if (target === 'shadow') {
          set({ shadowColor: color + '40', shadowEnabled: true });
        }
        showToast(`Picked ${color}`);
      }
    } catch {
      // User cancelled
    }
  };

  /* ── Light Angle Compass Calculator ── */
  const applyLightDirection = (dir: LightDirection, dist = shadowDistance) => {
    setActiveLightDir(dir);
    setShadowDistance(dist);
    let x = 0;
    let y = 0;

    switch (dir) {
      case 'tl':
        x = -Math.round(dist * 0.7);
        y = -Math.round(dist * 0.7);
        break;
      case 't':
        x = 0;
        y = -dist;
        break;
      case 'tr':
        x = Math.round(dist * 0.7);
        y = -Math.round(dist * 0.7);
        break;
      case 'r':
        x = dist;
        y = 0;
        break;
      case 'br':
        x = Math.round(dist * 0.7);
        y = Math.round(dist * 0.7);
        break;
      case 'b':
        x = 0;
        y = dist;
        break;
      case 'bl':
        x = -Math.round(dist * 0.7);
        y = Math.round(dist * 0.7);
        break;
      case 'l':
        x = -dist;
        y = 0;
        break;
      case 'center':
        x = 0;
        y = 0;
        break;
    }

    set({ shadowX: x, shadowY: y, shadowEnabled: true });
    setActivePreset(null);
  };

  /* ── Random Frame Generator ── */
  const generateRandomFrame = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    const allBorderTypes: BorderType[] = [
      'solid',
      'dashed',
      'dotted',
      'double',
      'groove',
      'ridge',
      'inset',
      'outset',
    ];
    const useShadow = Math.random() > 0.25;
    const useInset = useShadow && Math.random() > 0.75;
    const useIndividual = Math.random() > 0.55;
    const useFrameBg = Math.random() > 0.5;
    const baseRadius = randInt(0, 36);
    const shadowBase = randHex();

    set({
      frameEnabled: true,
      borderWidth: randInt(1, 8),
      borderColor: randHex(),
      borderType: pick(allBorderTypes),
      borderRadius: useIndividual ? 12 : baseRadius,
      borderOpacity: randInt(65, 100),
      individualCorners: useIndividual,
      borderTopLeftRadius: useIndividual ? randInt(0, 48) : baseRadius,
      borderTopRightRadius: useIndividual ? randInt(0, 48) : baseRadius,
      borderBottomRightRadius: useIndividual ? randInt(0, 48) : baseRadius,
      borderBottomLeftRadius: useIndividual ? randInt(0, 48) : baseRadius,
      frameBgEnabled: useFrameBg,
      frameBgColor: useFrameBg ? randHex() : '#f8fafc',
      padding: randInt(14, 42),
      shadowEnabled: useShadow,
      shadowX: useShadow ? randInt(-10, 10) : 0,
      shadowY: useShadow ? randInt(-10, 10) : 0,
      shadowBlur: useShadow ? randInt(8, 36) : 20,
      shadowSpread: useShadow ? randInt(-4, 8) : 0,
      shadowColor: useShadow ? shadowBase + '40' : '#00000025',
      shadowInset: useInset,
    });
    setActivePreset(null);
    showToast('Generated vibrant frame mix!');
  }, [set]);

  /* ── Apply Preset ── */
  const applyPreset = useCallback(
    (preset: FramePreset) => {
      set({
        frameEnabled: preset.frameEnabled,
        borderWidth: preset.borderWidth,
        borderColor: preset.borderColor,
        borderRadius: preset.borderRadius,
        borderType: preset.borderType,
        borderOpacity: preset.borderOpacity,
        individualCorners: preset.individualCorners,
        borderTopLeftRadius: preset.borderTopLeftRadius ?? preset.borderRadius,
        borderTopRightRadius: preset.borderTopRightRadius ?? preset.borderRadius,
        borderBottomRightRadius: preset.borderBottomRightRadius ?? preset.borderRadius,
        borderBottomLeftRadius: preset.borderBottomLeftRadius ?? preset.borderRadius,
        frameBgEnabled: preset.frameBgEnabled,
        frameBgColor: preset.frameBgColor ?? '#f8fafc',
        padding: preset.padding,
        shadowEnabled: preset.shadowEnabled,
        shadowX: preset.shadowX,
        shadowY: preset.shadowY,
        shadowBlur: preset.shadowBlur,
        shadowSpread: preset.shadowSpread,
        shadowColor: preset.shadowColor,
        shadowInset: preset.shadowInset,
      });
      setActivePreset(preset.name);
      showToast(`Applied: ${preset.name}`);
    },
    [set]
  );

  /* ── Reset Frame ── */
  const resetFrame = useCallback(() => {
    setActivePreset(null);
    set({
      frameEnabled: false,
      borderWidth: 2,
      borderColor: '#00000030',
      borderRadius: 12,
      borderType: 'solid',
      borderOpacity: 100,
      individualCorners: false,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
      frameBgEnabled: false,
      frameBgColor: '#f0f0f0',
      padding: 20,
      shadowEnabled: false,
      shadowX: 0,
      shadowY: 4,
      shadowBlur: 20,
      shadowSpread: 0,
      shadowColor: '#00000025',
      shadowInset: false,
    });
    showToast('Frame reset to clean default');
  }, [set]);

  /* ── Save to Favorites ── */
  const saveCurrentFrame = () => {
    const newFrame: SavedFrame = {
      id: `${Date.now()}`,
      name: `Custom Frame ${savedFrames.length + 1}`,
      frameEnabled,
      borderWidth,
      borderColor,
      borderRadius,
      borderType,
      borderOpacity,
      individualCorners,
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomRightRadius,
      borderBottomLeftRadius,
      frameBgEnabled,
      frameBgColor,
      padding,
      shadowEnabled,
      shadowX,
      shadowY,
      shadowBlur,
      shadowSpread,
      shadowColor,
      shadowInset,
      timestamp: Date.now(),
    };
    const updated = [newFrame, ...savedFrames];
    setSavedFrames(updated);
    try {
      localStorage.setItem('qr_frame_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Frame saved to custom favorites!');
  };

  const deleteSavedFrame = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedFrames.filter((f) => f.id !== id);
    setSavedFrames(updated);
    try {
      localStorage.setItem('qr_frame_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Frame removed');
  };

  const applySavedFrame = (f: SavedFrame) => {
    set({
      frameEnabled: f.frameEnabled,
      borderWidth: f.borderWidth,
      borderColor: f.borderColor,
      borderRadius: f.borderRadius,
      borderType: f.borderType,
      borderOpacity: f.borderOpacity,
      individualCorners: f.individualCorners,
      borderTopLeftRadius: f.borderTopLeftRadius,
      borderTopRightRadius: f.borderTopRightRadius,
      borderBottomRightRadius: f.borderBottomRightRadius,
      borderBottomLeftRadius: f.borderBottomLeftRadius,
      frameBgEnabled: f.frameBgEnabled,
      frameBgColor: f.frameBgColor,
      padding: f.padding,
      shadowEnabled: f.shadowEnabled,
      shadowX: f.shadowX,
      shadowY: f.shadowY,
      shadowBlur: f.shadowBlur,
      shadowSpread: f.shadowSpread,
      shadowColor: f.shadowColor,
      shadowInset: f.shadowInset,
    });
    setActivePreset(null);
    showToast(`Loaded: ${f.name}`);
  };

  /* ── Copy CSS rules ── */
  const copyFrameCSS = () => {
    const radiusStr = individualCorners
      ? `${borderTopLeftRadius}px ${borderTopRightRadius}px ${borderBottomRightRadius}px ${borderBottomLeftRadius}px`
      : `${borderRadius}px`;

    const shadowStr = shadowEnabled
      ? `${shadowInset ? 'inset ' : ''}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`
      : 'none';

    const css = [
      frameEnabled ? `border: ${borderWidth}px ${borderType} ${borderColor};` : 'border: none;',
      frameEnabled && borderOpacity < 100 ? `opacity: ${borderOpacity / 100};` : null,
      `border-radius: ${radiusStr};`,
      `padding: ${padding}px;`,
      frameBgEnabled ? `background-color: ${frameBgColor};` : null,
      shadowEnabled ? `box-shadow: ${shadowStr};` : null,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(css);
    showToast('Frame CSS copied to clipboard!');
  };

  /* ── Copy JSON Config ── */
  const copyFrameSpecs = () => {
    const specs = JSON.stringify(
      {
        frameEnabled,
        borderWidth,
        borderColor,
        borderRadius,
        borderType,
        borderOpacity,
        individualCorners,
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomRightRadius,
        borderBottomLeftRadius,
        frameBgEnabled,
        frameBgColor,
        padding,
        shadowEnabled,
        shadowX,
        shadowY,
        shadowBlur,
        shadowSpread,
        shadowColor,
        shadowInset,
      },
      null,
      2
    );
    navigator.clipboard.writeText(specs);
    showToast('Frame JSON config copied!');
  };

  /* ── Reusable Switch Toggle ── */
  const toggleSwitch = (enabled: boolean, onToggle: () => void, size: 'sm' | 'md' = 'md') => {
    const w = size === 'sm' ? 'w-10 h-5' : 'w-12 h-6';
    const dot = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    const on = size === 'sm' ? 'left-6' : 'left-7';
    return (
      <button
        onClick={onToggle}
        className={`${w} rounded-full transition-all cursor-pointer ${
          enabled ? 'bg-[var(--color-secondary)]' : 'bg-gray-300 dark:bg-gray-700'
        } relative shrink-0`}
      >
        <div
          className={`absolute top-1 ${dot} bg-white rounded-full transition-all ${
            enabled ? on : 'left-1'
          }`}
        />
      </button>
    );
  };

  /* ── Reusable Slider Section ── */
  const sliderSection = (
    label: string,
    value: number,
    min: number,
    max: number,
    onChange: (v: number) => void,
    unit = 'px',
    step = 1
  ) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-[var(--color-text)] rounded-md">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-[var(--color-secondary)] bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );

  return (
    <div className={`space-y-6 ${isShaking ? 'animate-shake' : ''}`}>
      {/* ── Sub-Tab Segmented Controller ── */}
      <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('presets')}
          className={`flex-1 min-w-[72px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'presets'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500 dark:text-yellow-400" />
          Presets
        </button>

        <button
          onClick={() => setActiveSubTab('border')}
          className={`flex-1 min-w-[72px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'border'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Square className="w-3.5 h-3.5" />
          Border
        </button>

        <button
          onClick={() => setActiveSubTab('shadow')}
          className={`flex-1 min-w-[72px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'shadow'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          Shadow
        </button>

        <button
          onClick={() => setActiveSubTab('spacing')}
          className={`flex-1 min-w-[72px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'spacing'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          Padding
        </button>

        <button
          onClick={() => setActiveSubTab('saved')}
          className={`flex-1 min-w-[72px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
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
              onClick={generateRandomFrame}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Generate Random Frame
            </button>
            <button
              onClick={copyFrameCSS}
              title="Copy Frame CSS"
              className="px-3.5 py-3 rounded-2xl border border-[var(--color-border)] bg-gray-50 dark:bg-white/5 text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={resetFrame}
              title="Reset Frame"
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
                placeholder="Search frames (e.g. glass, pill, velvet, brutalist)..."
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-xs border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {FRAME_CATEGORIES.map((cat) => (
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

                  <div className="mb-2">
                    <FramePreviewMiniSVG preset={p} />
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

      {/* ────────────────── SUB-TAB 2: BORDER & GEOMETRY ────────────────── */}
      {activeSubTab === 'border' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Master Switch */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
            <div>
              <h4 className="text-sm font-bold text-[var(--color-text)]">Enable Frame Outline</h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Render a distinct styled outer boundary around the QR container
              </p>
            </div>
            {toggleSwitch(frameEnabled, () => {
              set({ frameEnabled: !frameEnabled });
              setActivePreset(null);
            })}
          </div>

          {frameEnabled && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Border Styles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stroke Style
                  </h4>
                  <span className="text-[10px] font-bold text-[var(--color-secondary)] uppercase">
                    {borderType}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {BORDER_TYPES.map((bt) => (
                    <button
                      key={bt.key}
                      onClick={() => {
                        set({ borderType: bt.key });
                        setActivePreset(null);
                      }}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                        borderType === bt.key
                          ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] shadow-xs scale-[1.02]'
                          : 'border-[var(--color-border)] bg-white dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                      }`}
                    >
                      <BorderIconSVG type={bt.key} />
                      <span className="text-[10px] font-bold tracking-tight">{bt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color & Sync Controls */}
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-4 border border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Border Color
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        set({ borderColor: fgColor });
                        showToast('Synced border with QR dots');
                      }}
                      className="text-[10px] font-bold text-[var(--color-secondary)] hover:opacity-75 transition-opacity cursor-pointer"
                    >
                      Sync with QR
                    </button>
                    {hasEyeDropper && (
                      <>
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <button
                          onClick={() => pickScreenColor('border')}
                          className="p-1 text-gray-400 hover:text-[var(--color-secondary)] rounded-md transition-colors cursor-pointer"
                          title="Pick color from screen"
                        >
                          <Pipette className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative w-12 h-10 shrink-0 rounded-xl overflow-hidden border border-[var(--color-border)] cursor-pointer shadow-xs">
                    <input
                      type="color"
                      value={borderColor.slice(0, 7)}
                      onChange={(e) => {
                        set({ borderColor: e.target.value });
                        setActivePreset(null);
                      }}
                      className="absolute -inset-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={borderColor}
                    onChange={(e) => {
                      set({ borderColor: e.target.value });
                      setActivePreset(null);
                    }}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 text-xs border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] font-mono font-bold focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                  />
                  <button
                    onClick={() => {
                      set({ borderColor: randHex() });
                      setActivePreset(null);
                    }}
                    title="Random color"
                    className="px-3 rounded-xl border border-[var(--color-border)] bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all text-xs cursor-pointer"
                  >
                    🎲
                  </button>
                </div>

                {/* Quick Swatches */}
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {QUICK_FRAME_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        set({ borderColor: c });
                        setActivePreset(null);
                      }}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-lg border-2 transition-all hover:scale-110 cursor-pointer ${
                        borderColor.toUpperCase() === c.toUpperCase()
                          ? 'border-[var(--color-secondary)] scale-110 shadow-xs'
                          : 'border-black/10 dark:border-white/20'
                      }`}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Thickness & Opacity */}
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-4 border border-[var(--color-border)]">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Thickness
                    </label>
                    <div className="flex gap-1">
                      {BORDER_WIDTH_PRESETS.map((w) => (
                        <button
                          key={w}
                          onClick={() => {
                            set({ borderWidth: w });
                            setActivePreset(null);
                          }}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                            borderWidth === w
                              ? 'bg-[var(--color-secondary)] text-white'
                              : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-300'
                          }`}
                        >
                          {w}px
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={borderWidth}
                    onChange={(e) => {
                      set({ borderWidth: Number(e.target.value) });
                      setActivePreset(null);
                    }}
                    className="w-full h-1.5 accent-[var(--color-secondary)] bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {sliderSection(
                  'Opacity',
                  borderOpacity,
                  10,
                  100,
                  (v) => {
                    set({ borderOpacity: v });
                    setActivePreset(null);
                  },
                  '%'
                )}
              </div>

              {/* Corner Radius & Geometry */}
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-4 border border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Corner Geometry
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {individualCorners ? 'Individual Corners' : 'Uniform Radius'}
                    </span>
                    {toggleSwitch(
                      individualCorners,
                      () => {
                        set({ individualCorners: !individualCorners });
                        setActivePreset(null);
                      },
                      'sm'
                    )}
                  </div>
                </div>

                {/* Interactive Live Mini-Box Preview */}
                <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-black/30 rounded-xl border border-[var(--color-border)]">
                  <div
                    className="w-24 h-24 transition-all duration-300 flex items-center justify-center shadow-inner"
                    style={{
                      borderRadius: individualCorners
                        ? `${borderTopLeftRadius}px ${borderTopRightRadius}px ${borderBottomRightRadius}px ${borderBottomLeftRadius}px`
                        : `${borderRadius}px`,
                      borderWidth: `${Math.min(borderWidth, 6)}px`,
                      borderStyle: borderType,
                      borderColor: borderColor,
                      backgroundColor: frameBgEnabled ? frameBgColor : 'transparent',
                    }}
                  >
                    <span className="text-[10px] font-mono font-bold text-gray-400">
                      {individualCorners
                        ? `${borderTopLeftRadius}/${borderTopRightRadius}/${borderBottomRightRadius}/${borderBottomLeftRadius}`
                        : `${borderRadius}px`}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase mt-2">
                    Live Geometry Shape
                  </span>
                </div>

                {/* Corner Presets Bar */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Geometric Styles
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {CORNER_SHAPE_PRESETS.map((csp) => (
                      <button
                        key={csp.name}
                        onClick={() => {
                          set({
                            individualCorners: true,
                            borderTopLeftRadius: csp.tl,
                            borderTopRightRadius: csp.tr,
                            borderBottomRightRadius: csp.br,
                            borderBottomLeftRadius: csp.bl,
                          });
                          setActivePreset(null);
                        }}
                        className="p-1.5 flex flex-col items-center gap-0.5 rounded-lg border border-[var(--color-border)] bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all text-center cursor-pointer"
                      >
                        <span className="text-sm">{csp.icon}</span>
                        <span className="text-[9px] font-bold text-[var(--color-text)] line-clamp-1">
                          {csp.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {individualCorners ? (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {sliderSection('↖ Top Left', borderTopLeftRadius, 0, 60, (v) => {
                      set({ borderTopLeftRadius: v });
                      setActivePreset(null);
                    })}
                    {sliderSection('↗ Top Right', borderTopRightRadius, 0, 60, (v) => {
                      set({ borderTopRightRadius: v });
                      setActivePreset(null);
                    })}
                    {sliderSection('↙ Bottom Left', borderBottomLeftRadius, 0, 60, (v) => {
                      set({ borderBottomLeftRadius: v });
                      setActivePreset(null);
                    })}
                    {sliderSection('↘ Bottom Right', borderBottomRightRadius, 0, 60, (v) => {
                      set({ borderBottomRightRadius: v });
                      setActivePreset(null);
                    })}
                  </div>
                ) : (
                  sliderSection('Uniform Radius', borderRadius, 0, 60, (v) => {
                    set({ borderRadius: v });
                    setActivePreset(null);
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SUB-TAB 3: SHADOW & GLOW ────────────────── */}
      {activeSubTab === 'shadow' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Master Switch */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
            <div>
              <h4 className="text-sm font-bold text-[var(--color-text)]">Enable Drop Shadow & Glow</h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Add elevation depth, soft shadows, or radiant neon halos
              </p>
            </div>
            {toggleSwitch(shadowEnabled, () => {
              set({ shadowEnabled: !shadowEnabled });
              setActivePreset(null);
            })}
          </div>

          {shadowEnabled && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Outer vs Inset Toggle */}
              <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-[var(--color-border)] gap-1">
                <button
                  onClick={() => {
                    set({ shadowInset: false });
                    setActivePreset(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                    !shadowInset
                      ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs'
                      : 'text-gray-500 hover:text-[var(--color-text)]'
                  }`}
                >
                  Outer Drop Shadow
                </button>
                <button
                  onClick={() => {
                    set({ shadowInset: true });
                    setActivePreset(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                    shadowInset
                      ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs'
                      : 'text-gray-500 hover:text-[var(--color-text)]'
                  }`}
                >
                  Inner Inset Shadow
                </button>
              </div>

              {/* Directional Light Compass */}
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-4 border border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-500" />
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Light Angle & Position
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-gray-400">
                    X: {shadowX}px | Y: {shadowY}px
                  </span>
                </div>

                {/* 3x3 Compass Dial */}
                <div className="flex justify-center py-2">
                  <div className="grid grid-cols-3 gap-2 p-2 bg-white dark:bg-black/30 rounded-2xl border border-[var(--color-border)] shadow-xs">
                    {[
                      { dir: 'tl' as LightDirection, label: '↖', title: 'Top-Left Light' },
                      { dir: 't' as LightDirection, label: '⬆', title: 'Top Light' },
                      { dir: 'tr' as LightDirection, label: '↗', title: 'Top-Right Light' },
                      { dir: 'l' as LightDirection, label: '⬅', title: 'Left Light' },
                      { dir: 'center' as LightDirection, label: '✦', title: 'Center Glow' },
                      { dir: 'r' as LightDirection, label: '➡', title: 'Right Light' },
                      { dir: 'bl' as LightDirection, label: '↙', title: 'Bottom-Left Light' },
                      { dir: 'b' as LightDirection, label: '⬇', title: 'Bottom Light' },
                      { dir: 'br' as LightDirection, label: '↘', title: 'Natural 45° Light' },
                    ].map((d) => (
                      <button
                        key={d.dir}
                        onClick={() => applyLightDirection(d.dir)}
                        title={d.title}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm transition-all cursor-pointer ${
                          activeLightDir === d.dir
                            ? 'bg-[var(--color-secondary)] text-white shadow-xs scale-105'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance Slider */}
                {sliderSection('Light Distance', shadowDistance, 0, 30, (v) => {
                  applyLightDirection(activeLightDir, v);
                })}
              </div>

              {/* Shadow Color */}
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-3 border border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Shadow Tint
                  </h4>
                  {hasEyeDropper && (
                    <button
                      onClick={() => pickScreenColor('shadow')}
                      className="p-1 text-gray-400 hover:text-[var(--color-secondary)] rounded-md transition-colors cursor-pointer"
                      title="Sample shadow color from screen"
                    >
                      <Pipette className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative w-12 h-10 shrink-0 rounded-xl overflow-hidden border border-[var(--color-border)] cursor-pointer shadow-xs">
                    <input
                      type="color"
                      value={shadowColor.slice(0, 7)}
                      onChange={(e) => {
                        set({ shadowColor: e.target.value + '40' });
                        setActivePreset(null);
                      }}
                      className="absolute -inset-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={shadowColor}
                    onChange={(e) => {
                      set({ shadowColor: e.target.value });
                      setActivePreset(null);
                    }}
                    placeholder="#00000040"
                    className="flex-1 px-3 py-2 text-xs border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] font-mono font-bold focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                  />
                  <button
                    onClick={() => {
                      set({ shadowColor: randHex() + '40' });
                      setActivePreset(null);
                    }}
                    title="Random shadow color"
                    className="px-3 rounded-xl border border-[var(--color-border)] bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all text-xs cursor-pointer"
                  >
                    🎲
                  </button>
                </div>
              </div>

              {/* Blur & Spread */}
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-4 border border-[var(--color-border)]">
                <div className="grid grid-cols-2 gap-4">
                  {sliderSection('Blur Radius', shadowBlur, 0, 60, (v) => {
                    set({ shadowBlur: v });
                    setActivePreset(null);
                  })}
                  {sliderSection('Spread Radius', shadowSpread, -20, 30, (v) => {
                    set({ shadowSpread: v });
                    setActivePreset(null);
                  })}
                  {sliderSection('Offset X', shadowX, -30, 30, (v) => {
                    set({ shadowX: v });
                    setActivePreset(null);
                  })}
                  {sliderSection('Offset Y', shadowY, -30, 30, (v) => {
                    set({ shadowY: v });
                    setActivePreset(null);
                  })}
                </div>
              </div>

              {/* Quick Shadow Elevation Presets */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quick Elevation Styles
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SHADOW_PRESETS.map((sp) => (
                    <button
                      key={sp.label}
                      onClick={() => {
                        set({
                          shadowX: sp.x,
                          shadowY: sp.y,
                          shadowBlur: sp.blur,
                          shadowSpread: sp.spread,
                          shadowColor: sp.color,
                          shadowInset: sp.inset,
                          shadowEnabled: true,
                        });
                        setActivePreset(null);
                      }}
                      className="p-2 flex flex-col items-center gap-0.5 rounded-xl border border-[var(--color-border)] bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all text-center cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-[var(--color-text)]">
                        {sp.label}
                      </span>
                      <span className="text-[9px] text-gray-400">{sp.tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SUB-TAB 4: PADDING & FILL ────────────────── */}
      {activeSubTab === 'spacing' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Container Padding Section */}
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-4 border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Container Padding (Quiet Zone)
              </h4>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-md">
                {padding}px
              </span>
            </div>

            {/* Quick Padding Presets */}
            <div className="grid grid-cols-4 gap-2">
              {PADDING_PRESETS.map((pp) => (
                <button
                  key={pp.label}
                  onClick={() => {
                    set({ padding: pp.value });
                    setActivePreset(null);
                  }}
                  className={`p-2 flex flex-col items-center gap-0.5 rounded-xl border transition-all cursor-pointer ${
                    padding === pp.value
                      ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] font-bold'
                      : 'border-[var(--color-border)] bg-white dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                  }`}
                >
                  <span className="text-xs">{pp.value}px</span>
                  <span className="text-[9px] opacity-75">{pp.label}</span>
                </button>
              ))}
            </div>

            <input
              type="range"
              min={0}
              max={80}
              value={padding}
              onChange={(e) => {
                set({ padding: Number(e.target.value) });
                setActivePreset(null);
              }}
              className="w-full h-1.5 accent-[var(--color-secondary)] bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />

            {/* Quiet Zone Health Feedback */}
            <div className="p-3 bg-white dark:bg-black/20 rounded-xl border border-[var(--color-border)] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-[var(--color-text)]">
                  {padding >= 16 ? 'Optimal Scannability Zone' : 'Tight Margin Advisory'}
                </span>
                <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                  {padding >= 16
                    ? 'Padding provides a sufficient quiet zone margin for camera sensors to recognize the QR matrix instantly.'
                    : 'Margins below 16px may require higher precision scanning if displayed against busy backgrounds.'}
                </p>
              </div>
            </div>
          </div>

          {/* Custom Frame Background Override */}
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-4 border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Custom Frame Background
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Override QR background fill inside the frame container
                </p>
              </div>
              {toggleSwitch(
                frameBgEnabled,
                () => {
                  set({ frameBgEnabled: !frameBgEnabled });
                  setActivePreset(null);
                },
                'sm'
              )}
            </div>

            {frameBgEnabled && (
              <div className="space-y-3 pt-2 animate-fade-in-up">
                <div className="flex gap-2">
                  <div className="relative w-12 h-10 shrink-0 rounded-xl overflow-hidden border border-[var(--color-border)] cursor-pointer shadow-xs">
                    <input
                      type="color"
                      value={frameBgColor.slice(0, 7)}
                      onChange={(e) => {
                        set({ frameBgColor: e.target.value });
                        setActivePreset(null);
                      }}
                      className="absolute -inset-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={frameBgColor}
                    onChange={(e) => {
                      set({ frameBgColor: e.target.value });
                      setActivePreset(null);
                    }}
                    placeholder="#FFFFFF"
                    className="flex-1 px-3 py-2 text-xs border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] font-mono font-bold focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                  />
                  {hasEyeDropper && (
                    <button
                      onClick={() => pickScreenColor('bg')}
                      className="px-3 rounded-xl border border-[var(--color-border)] bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all text-xs cursor-pointer"
                      title="Sample background color from screen"
                    >
                      <Pipette className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Background Swatches */}
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {QUICK_FRAME_BG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        set({ frameBgColor: c });
                        setActivePreset(null);
                      }}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 cursor-pointer ${
                        frameBgColor.toUpperCase() === c.toUpperCase()
                          ? 'border-[var(--color-secondary)] scale-110 shadow-xs'
                          : 'border-black/10 dark:border-white/20'
                      }`}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 5: SAVED & FAVORITES ────────────────── */}
      {activeSubTab === 'saved' && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text)]">Saved Frame Designs</h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Save and recall your custom frame styles anytime
              </p>
            </div>
            <button
              onClick={saveCurrentFrame}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[var(--color-secondary)] rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Current
            </button>
          </div>

          {/* Saved List */}
          {savedFrames.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-3 text-xl">
                🔖
              </div>
              <h5 className="text-xs font-bold text-[var(--color-text)]">No Saved Frames Yet</h5>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                Customize your frame style, borders, and shadows, then tap &quot;Save Current&quot; to store it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedFrames.map((f) => (
                <div
                  key={f.id}
                  onClick={() => applySavedFrame(f)}
                  className="group relative flex items-center justify-between p-3.5 rounded-2xl border border-[var(--color-border)] bg-white dark:bg-black/20 hover:border-[var(--color-secondary)]/50 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        borderColor: f.borderColor,
                        borderStyle: f.borderType,
                        borderWidth: `${Math.min(f.borderWidth, 3)}px`,
                        borderRadius: f.individualCorners
                          ? `${f.borderTopLeftRadius / 3}px ${f.borderTopRightRadius / 3}px ${f.borderBottomRightRadius / 3}px ${f.borderBottomLeftRadius / 3}px`
                          : `${f.borderRadius / 3}px`,
                        backgroundColor: f.frameBgEnabled ? f.frameBgColor : 'transparent',
                      }}
                    >
                      <div className="w-2.5 h-2.5 rounded-[1px] bg-current opacity-30" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[var(--color-text)] group-hover:text-[var(--color-secondary)] transition-colors">
                        {f.name}
                      </h5>
                      <span className="text-[10px] text-gray-400">
                        {f.borderType} • {f.borderWidth}px • {f.padding}px pad
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => deleteSavedFrame(f.id, e)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                    title="Delete style"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Export Utilities */}
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-3 border border-[var(--color-border)]">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Developer & Design Utilities
            </h4>
            <div className="flex gap-2">
              <button
                onClick={copyFrameCSS}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Frame CSS
              </button>
              <button
                onClick={copyFrameSpecs}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                Copy Frame JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
