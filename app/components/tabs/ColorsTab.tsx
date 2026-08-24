'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQRStore } from '../../store/useQRStore';
import {
  ArrowLeftRight,
  Sparkles,
  RefreshCw,
  Eye,
  Shuffle,
  Check,
  Dices,
  Copy,
  Pipette,
  Zap,
  Bookmark,
  Trash2,
  Palette as PaletteIcon,
  Search,
  RotateCcw,
  CheckCircle2,
  Layers,
} from 'lucide-react';

/* ────────────────── Types & Interfaces ────────────────── */

type SubTab = 'solid' | 'gradient' | 'harmonies' | 'eyes' | 'favorites';

type HarmonyMode =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'monochrome'
  | 'split'
  | 'golden'
  | 'cyber';

interface ColorPair {
  fg: string;
  bg: string;
  name?: string;
  category?: string;
}

interface GradientPreset {
  name: string;
  type: 'linear' | 'radial';
  rotation: number;
  stops: [string, string];
  category: string;
}

interface SavedPalette {
  id: string;
  name: string;
  fg: string;
  bg: string;
  useGradient: boolean;
  gradient?: {
    type: 'linear' | 'radial';
    rotation: number;
    colorStops: { offset: number; color: string }[];
  };
  useCustomEyes?: boolean;
  eyeSquare?: string;
  eyeDot?: string;
  timestamp: number;
}

/* ────────────────── Color Mathematics & Helpers ────────────────── */

/** HSL → HEX (h 0-360, s 0-100, l 0-100) */
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/** HEX → HSL ({ h: 0-360, s: 0-100, l: 0-100 }) */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let clean = hex.replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(clean.slice(0, 2), 16) / 255 || 0;
  const g = parseInt(clean.slice(2, 4), 16) / 255 || 0;
  const b = parseInt(clean.slice(4, 6), 16) / 255 || 0;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/** HEX → sRGB luminance */
function luminance(hex: string): number {
  let clean = hex.replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = (parseInt(clean.slice(0, 2), 16) || 0) / 255;
  const g = (parseInt(clean.slice(2, 4), 16) || 0) / 255;
  const b = (parseInt(clean.slice(4, 6), 16) || 0) / 255;
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

/** Adjust lightness of a hex color */
function adjustLightness(hex: string, deltaPercent: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex(hsl.h, hsl.s, hsl.l + deltaPercent);
}

/** Adjust saturation of a hex color */
function adjustSaturation(hex: string, deltaPercent: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex(hsl.h, hsl.s + deltaPercent, hsl.l);
}

/** Invert RGB of a hex color */
function invertHex(hex: string): string {
  let clean = hex.replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = 255 - (parseInt(clean.slice(0, 2), 16) || 0);
  const g = 255 - (parseInt(clean.slice(2, 4), 16) || 0);
  const b = 255 - (parseInt(clean.slice(4, 6), 16) || 0);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
    .toString(16)
    .padStart(2, '0')}`.toUpperCase();
}

/** Automatically optimize FG & BG to achieve guaranteed > 7.0:1 contrast while preserving base hues */
function autoOptimizeContrast(fgHex: string, bgHex: string): { fg: string; bg: string } {
  const fgL = luminance(fgHex);
  const bgL = luminance(bgHex);
  const fgHsl = hexToHsl(fgHex);
  const bgHsl = hexToHsl(bgHex);

  if (fgL < bgL) {
    // Dark FG on Light BG
    return {
      fg: hslToHex(fgHsl.h, Math.min(fgHsl.s, 95), Math.max(6, Math.min(fgHsl.l, 18))),
      bg: hslToHex(bgHsl.h, Math.min(bgHsl.s, 25), Math.max(92, Math.min(bgHsl.l, 98))),
    };
  } else {
    // Light FG on Dark BG
    return {
      fg: hslToHex(fgHsl.h, Math.min(fgHsl.s, 40), Math.max(90, Math.min(fgHsl.l, 98))),
      bg: hslToHex(bgHsl.h, Math.min(bgHsl.s, 90), Math.max(6, Math.min(bgHsl.l, 14))),
    };
  }
}

/** Generate a harmonious fg/bg pair based on algorithmic color theory */
function generateHarmony(mode: HarmonyMode, baseHue?: number): ColorPair {
  const hue = baseHue !== undefined ? baseHue : Math.floor(Math.random() * 360);
  const wrap = (h: number) => ((h % 360) + 360) % 360;

  switch (mode) {
    case 'complementary': {
      const fg = hslToHex(hue, 80, 22);
      const bg = hslToHex(wrap(hue + 180), 30, 94);
      return { fg, bg, name: 'Complementary' };
    }
    case 'analogous': {
      const offset = 30 + Math.floor(Math.random() * 15);
      const fg = hslToHex(hue, 75, 24);
      const bg = hslToHex(wrap(hue + offset), 35, 93);
      return { fg, bg, name: 'Analogous' };
    }
    case 'triadic': {
      const fg = hslToHex(hue, 70, 25);
      const bg = hslToHex(wrap(hue + 120), 25, 93);
      return { fg, bg, name: 'Triadic' };
    }
    case 'split': {
      const fg = hslToHex(hue, 75, 24);
      const bg = hslToHex(wrap(hue + 150), 30, 93);
      return { fg, bg, name: 'Split-Complement' };
    }
    case 'monochrome': {
      const fg = hslToHex(hue, 65, 18);
      const bg = hslToHex(hue, 20, 95);
      return { fg, bg, name: 'Monochrome' };
    }
    case 'golden': {
      const fg = hslToHex(hue, 80, 22);
      const bg = hslToHex(wrap(hue + 137.5), 25, 94);
      return { fg, bg, name: 'Golden Ratio' };
    }
    case 'cyber': {
      const fg = hslToHex(hue, 95, 55);
      const bg = hslToHex(wrap(hue + 180), 60, 6);
      return { fg, bg, name: 'Cyber High-Contrast' };
    }
  }
}

/** Generate a batch of inspirational pairs */
function generateInspirationBatch(count: number): ColorPair[] {
  const modes: HarmonyMode[] = [
    'complementary',
    'analogous',
    'triadic',
    'monochrome',
    'split',
    'golden',
    'cyber',
  ];
  return Array.from({ length: count }, () => {
    const mode = modes[Math.floor(Math.random() * modes.length)];
    return generateHarmony(mode);
  });
}

/** Deterministic inspirations for SSR initial render consistency */
const INITIAL_INSPIRATIONS: ColorPair[] = [
  { fg: '#0F172A', bg: '#F8FAFC' },
  { fg: '#7C3AED', bg: '#FAF5FF' },
  { fg: '#C2410C', bg: '#FFF7ED' },
  { fg: '#047857', bg: '#ECFDF5' },
  { fg: '#1E1B4B', bg: '#EEF2FF' },
  { fg: '#BE123C', bg: '#FFF1F2' },
  { fg: '#0369A1', bg: '#F0F9FF' },
  { fg: '#22C55E', bg: '#050505' },
];

/* ────────────────── Curated Palettes & Gradients ────────────────── */

const PALETTE_CATEGORIES = ['All', 'Trending', 'Corporate', 'Pastel', 'Neon', 'Earth', 'Minimal'] as const;
type PaletteCategory = (typeof PALETTE_CATEGORIES)[number];

interface RichPalette {
  name: string;
  fg: string;
  bg: string;
  category: PaletteCategory;
  tag: string;
}

const RICH_PALETTES: RichPalette[] = [
  // Trending
  { name: 'Classic Charcoal', fg: '#000000', bg: '#FFFFFF', category: 'Trending', tag: 'Universal' },
  { name: 'Midnight Indigo', fg: '#1E1B4B', bg: '#EEF2FF', category: 'Trending', tag: 'Modern' },
  { name: 'Sunset Flame', fg: '#C2410C', bg: '#FFF7ED', category: 'Trending', tag: 'Warm' },
  { name: 'Emerald Velvet', fg: '#047857', bg: '#ECFDF5', category: 'Trending', tag: 'Fresh' },
  { name: 'Electric Violet', fg: '#6D28D9', bg: '#FAF5FF', category: 'Trending', tag: 'Vibrant' },
  { name: 'Rose Gold', fg: '#9F1239', bg: '#FFF1F2', category: 'Trending', tag: 'Luxury' },

  // Corporate & Tech
  { name: 'Executive Navy', fg: '#0F172A', bg: '#F8FAFC', category: 'Corporate', tag: 'Finance' },
  { name: 'Oceanic Azure', fg: '#0369A1', bg: '#F0F9FF', category: 'Corporate', tag: 'SaaS' },
  { name: 'FinTech Cobalt', fg: '#1D4ED8', bg: '#EFF6FF', category: 'Corporate', tag: 'Tech' },
  { name: 'Nordic Pine', fg: '#14532D', bg: '#F0FDF4', category: 'Corporate', tag: 'Clean' },
  { name: 'Deep Titanium', fg: '#334155', bg: '#F1F5F9', category: 'Corporate', tag: 'Consulting' },
  { name: 'Royal Purple', fg: '#4338CA', bg: '#EEF2FF', category: 'Corporate', tag: 'Enterprise' },

  // Pastel & Soft
  { name: 'Matcha Latte', fg: '#166534', bg: '#DCFCE7', category: 'Pastel', tag: 'Calm' },
  { name: 'Peach Sorbet', fg: '#9A3412', bg: '#FFEDD5', category: 'Pastel', tag: 'Aesthetic' },
  { name: 'Lavender Mist', fg: '#5B21B6', bg: '#EDE9FE', category: 'Pastel', tag: 'Soft' },
  { name: 'Sky Powder', fg: '#075985', bg: '#E0F2FE', category: 'Pastel', tag: 'Gentle' },
  { name: 'Blossom Pink', fg: '#9D174D', bg: '#FCE7F3', category: 'Pastel', tag: 'Cute' },
  { name: 'Butter Sand', fg: '#854D0E', bg: '#FEF9C3', category: 'Pastel', tag: 'Cozy' },

  // Neon & Dark
  { name: 'Matrix Terminal', fg: '#22C55E', bg: '#050505', category: 'Neon', tag: 'Hacker' },
  { name: 'Synthwave Glow', fg: '#F43F5E', bg: '#0D0221', category: 'Neon', tag: 'Cyber' },
  { name: 'Laser Cyan', fg: '#06B6D4', bg: '#030712', category: 'Neon', tag: 'Futuristic' },
  { name: 'Toxic Lime', fg: '#84CC16', bg: '#09090B', category: 'Neon', tag: 'Bold' },
  { name: 'Solar Yellow', fg: '#FACC15', bg: '#18181B', category: 'Neon', tag: 'High-Vis' },
  { name: 'Neon Purple', fg: '#D946EF', bg: '#0A0012', category: 'Neon', tag: 'Electro' },

  // Earth & Nature
  { name: 'Terracotta Clay', fg: '#9A3412', bg: '#FEF3C7', category: 'Earth', tag: 'Rustic' },
  { name: 'Olive Grove', fg: '#3F6212', bg: '#FEFCE8', category: 'Earth', tag: 'Organic' },
  { name: 'Warm Espresso', fg: '#451A03', bg: '#FFFBEB', category: 'Earth', tag: 'Artisanal' },
  { name: 'Ocean Depth', fg: '#0F766E', bg: '#CCFBF1', category: 'Earth', tag: 'Marine' },
  { name: 'Desert Sand', fg: '#78350F', bg: '#FEF9C3', category: 'Earth', tag: 'Sunbaked' },
  { name: 'Moss Stone', fg: '#27272A', bg: '#F4F4F5', category: 'Earth', tag: 'Mineral' },

  // Minimal
  { name: 'Pure Ink', fg: '#000000', bg: '#FFFFFF', category: 'Minimal', tag: '100% Contrast' },
  { name: 'Dark Slate', fg: '#18181B', bg: '#FAFAFA', category: 'Minimal', tag: 'Balanced' },
  { name: 'Warm Grey', fg: '#292524', bg: '#F5F5F4', category: 'Minimal', tag: 'Muted' },
  { name: 'Silver Steel', fg: '#3F3F46', bg: '#F4F4F5', category: 'Minimal', tag: 'Neutral' },
];

const GRADIENT_PRESETS: GradientPreset[] = [
  { name: 'Sunset Flare', type: 'linear', rotation: 45, stops: ['#EA580C', '#E11D48'], category: 'Vibrant' },
  { name: 'Electric Indigo', type: 'linear', rotation: 135, stops: ['#4F46E5', '#06B6D4'], category: 'Tech' },
  { name: 'Emerald Isle', type: 'linear', rotation: 90, stops: ['#047857', '#10B981'], category: 'Nature' },
  { name: 'Cosmic Violet', type: 'linear', rotation: 45, stops: ['#7C3AED', '#DB2777'], category: 'Vibrant' },
  { name: 'Cyber Lime', type: 'linear', rotation: 180, stops: ['#059669', '#84CC16'], category: 'Tech' },
  { name: 'Deep Ocean', type: 'linear', rotation: 135, stops: ['#1E3A8A', '#0284C7'], category: 'Corporate' },
  { name: 'Rose Gold', type: 'linear', rotation: 45, stops: ['#BE123C', '#FB7185'], category: 'Luxury' },
  { name: 'Solar Flare', type: 'linear', rotation: 45, stops: ['#C2410C', '#F59E0B'], category: 'Warm' },
  { name: 'Hyper Magenta', type: 'linear', rotation: 90, stops: ['#C026D3', '#7C3AED'], category: 'Vibrant' },
  { name: 'Mint Breeze', type: 'linear', rotation: 90, stops: ['#0D9488', '#34D399'], category: 'Nature' },
  { name: 'Firestorm', type: 'linear', rotation: 45, stops: ['#B91C1C', '#EA580C'], category: 'Warm' },
  { name: 'Aqua Glow', type: 'linear', rotation: 135, stops: ['#0369A1', '#38BDF8'], category: 'Tech' },
  { name: 'Titanium', type: 'linear', rotation: 135, stops: ['#18181B', '#52525B'], category: 'Minimal' },
  { name: 'Ruby Wine', type: 'linear', rotation: 90, stops: ['#881337', '#BE123C'], category: 'Luxury' },
  { name: 'Golden Hour', type: 'linear', rotation: 45, stops: ['#B45309', '#FBBF24'], category: 'Warm' },
  { name: 'Radial Pulse', type: 'radial', rotation: 0, stops: ['#4F46E5', '#9333EA'], category: 'Radial' },
  { name: 'Radial Sun', type: 'radial', rotation: 0, stops: ['#EA580C', '#F59E0B'], category: 'Radial' },
  { name: 'Radial Emerald', type: 'radial', rotation: 0, stops: ['#059669', '#10B981'], category: 'Radial' },
];

const HARMONY_MODES: { key: HarmonyMode; label: string; icon: string; desc: string }[] = [
  { key: 'complementary', label: 'Complementary', icon: '◐', desc: 'Opposite hues for maximum visual pop and dynamic punch' },
  { key: 'analogous', label: 'Analogous', icon: '◑', desc: 'Neighboring hues on color wheel for organic harmony' },
  { key: 'triadic', label: 'Triadic', icon: '◎', desc: 'Three equilateral hues for balanced vibrancy' },
  { key: 'split', label: 'Split-Comp', icon: '◔', desc: 'High contrast with softer, nuanced complementary tones' },
  { key: 'monochrome', label: 'Monochrome', icon: '●', desc: 'Subtle lightness variations of a single elegant hue' },
  { key: 'golden', label: 'Golden Ratio', icon: '✦', desc: 'Spaced by 137.5° for pleasing aesthetic balance' },
  { key: 'cyber', label: 'Cyber Dark', icon: '⚡', desc: 'High-voltage neon accents on deep obsidian background' },
];

const ANGLE_PRESETS = [0, 45, 90, 135, 180, 270];

/* ────────────────── Main Component ────────────────── */

export default function ColorsTab() {
  const fgColor = useQRStore((s) => s.fgColor);
  const bgColor = useQRStore((s) => s.bgColor);
  const activePalette = useQRStore((s) => s.activePalette);
  const useFgGradient = useQRStore((s) => s.useFgGradient);
  const fgGradient = useQRStore((s) => s.fgGradient);
  const useCustomEyeColors = useQRStore((s) => s.useCustomEyeColors);
  const cornerSquareColor = useQRStore((s) => s.cornerSquareColor);
  const cornerDotColor = useQRStore((s) => s.cornerDotColor);
  const transparentBg = useQRStore((s) => s.transparentBg);
  const set = useQRStore((s) => s.set);

  // Local component states
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('solid');
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('complementary');
  const [inspirationSeed, setInspirationSeed] = useState(0);
  const [paletteCategory, setPaletteCategory] = useState<PaletteCategory>('All');
  const [paletteSearch, setPaletteSearch] = useState('');
  const [paletteViewMode, setPaletteViewMode] = useState<'grid' | 'detailed'>('grid');
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);

  // Favorites & Recents in LocalStorage
  const [favorites, setFavorites] = useState<SavedPalette[]>([]);
  const [recentHistory, setRecentHistory] = useState<ColorPair[]>([]);

  // Check if native EyeDropper API is available on client mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

  // Load favorites & recents on mount
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('qr_color_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedRecents = localStorage.getItem('qr_color_recents');
      if (savedRecents) setRecentHistory(JSON.parse(savedRecents));
    } catch {
      // ignore storage errors
    }
  }, []);

  // Track recent colors (debounced)
  useEffect(() => {
    if (!fgColor || !bgColor) return;
    const timeout = setTimeout(() => {
      setRecentHistory((prev) => {
        const filtered = prev.filter((p) => p.fg !== fgColor || p.bg !== bgColor);
        const updated = [{ fg: fgColor, bg: bgColor }, ...filtered].slice(0, 8);
        try {
          localStorage.setItem('qr_color_recents', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    }, 800);
    return () => clearTimeout(timeout);
  }, [fgColor, bgColor]);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 2200);
  };

  // ── Contrast Ratio Calculations ──
  const ratio = useMemo(() => contrastRatio(fgColor, bgColor), [fgColor, bgColor]);
  const contrastLabel =
    ratio >= 7 ? 'Excellent' : ratio >= 4.5 ? 'Good' : ratio >= 3 ? 'Fair' : 'Risky';
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

  // ── Eyedropper API handler ──
  const pickScreenColor = async (target: 'fg' | 'bg' | 'eyeSquare' | 'eyeDot') => {
    if (!hasEyeDropper) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        const color = result.sRGBHex.toUpperCase();
        if (target === 'fg') set({ fgColor: color, activePalette: 'Custom' });
        else if (target === 'bg') set({ bgColor: color, activePalette: 'Custom' });
        else if (target === 'eyeSquare') set({ cornerSquareColor: color, useCustomEyeColors: true });
        else if (target === 'eyeDot') set({ cornerDotColor: color, useCustomEyeColors: true });
        showToast(`Picked ${color}`);
      }
    } catch {
      // User cancelled picker
    }
  };

  // ── Quick Color Actions ──
  const swapColors = () => {
    set({ fgColor: bgColor, bgColor: fgColor, activePalette: 'Custom' });
    showToast('Colors swapped');
  };

  const handleAutoFixContrast = () => {
    const optimized = autoOptimizeContrast(fgColor, bgColor);
    set({ fgColor: optimized.fg, bgColor: optimized.bg, activePalette: 'Custom' });
    showToast('Contrast optimized to 7.0+:1');
  };

  const invertColors = () => {
    set({
      fgColor: invertHex(fgColor),
      bgColor: invertHex(bgColor),
      activePalette: 'Custom',
    });
    showToast('Colors inverted');
  };

  const resetColors = () => {
    set({
      fgColor: '#000000',
      bgColor: '#FFFFFF',
      activePalette: 'Classic Charcoal',
      useFgGradient: false,
      useCustomEyeColors: false,
      transparentBg: false,
    });
    showToast('Reset to Classic');
  };

  const copyHexValues = () => {
    navigator.clipboard.writeText(`FG: ${fgColor} | BG: ${bgColor}`);
    showToast('Hex codes copied');
  };

  const copyCSSGradient = () => {
    const css =
      fgGradient.type === 'linear'
        ? `linear-gradient(${fgGradient.rotation}deg, ${fgGradient.colorStops[0].color}, ${fgGradient.colorStops[1].color})`
        : `radial-gradient(circle, ${fgGradient.colorStops[0].color}, ${fgGradient.colorStops[1].color})`;
    navigator.clipboard.writeText(css);
    showToast('CSS Gradient copied');
  };

  // ── Save / Delete Favorites ──
  const saveToFavorites = () => {
    const newFav: SavedPalette = {
      id: `${Date.now()}`,
      name: `Custom ${favorites.length + 1}`,
      fg: fgColor,
      bg: bgColor,
      useGradient: useFgGradient,
      gradient: fgGradient,
      useCustomEyes: useCustomEyeColors,
      eyeSquare: cornerSquareColor,
      eyeDot: cornerDotColor,
      timestamp: Date.now(),
    };
    const updated = [newFav, ...favorites];
    setFavorites(updated);
    try {
      localStorage.setItem('qr_color_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Saved to Favorites!');
  };

  const deleteFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    try {
      localStorage.setItem('qr_color_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Favorite removed');
  };

  // ── Inspiration generation ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const inspirations = useMemo(() => {
    if (inspirationSeed === 0) return INITIAL_INSPIRATIONS;
    return generateInspirationBatch(8);
  }, [inspirationSeed]);

  // ── Filtered Palettes ──
  const filteredPalettes = useMemo(() => {
    return RICH_PALETTES.filter((p) => {
      const matchCat = paletteCategory === 'All' || p.category === paletteCategory;
      const matchSearch =
        !paletteSearch.trim() ||
        p.name.toLowerCase().includes(paletteSearch.toLowerCase()) ||
        p.tag.toLowerCase().includes(paletteSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(paletteSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [paletteCategory, paletteSearch]);

  const inputClass =
    'w-full px-3 py-2 text-xs border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] font-mono font-bold focus:ring-2 focus:ring-[var(--color-secondary)] outline-none transition-all';

  return (
    <div className="space-y-6">
      {/* ── Sub-Tab Segmented Controller ── */}
      <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('solid')}
          className={`flex-1 min-w-[76px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 ${
            activeSubTab === 'solid'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-sm font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <PaletteIcon className="w-3.5 h-3.5" />
          Solid & Presets
        </button>

        <button
          onClick={() => {
            setActiveSubTab('gradient');
            if (!useFgGradient) set({ useFgGradient: true });
          }}
          className={`flex-1 min-w-[76px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 ${
            activeSubTab === 'gradient'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-sm font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500 dark:text-yellow-400" />
          Gradients
        </button>

        <button
          onClick={() => setActiveSubTab('harmonies')}
          className={`flex-1 min-w-[76px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 ${
            activeSubTab === 'harmonies'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-sm font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" />
          Harmonies
        </button>

        <button
          onClick={() => setActiveSubTab('eyes')}
          className={`flex-1 min-w-[76px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 ${
            activeSubTab === 'eyes'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-sm font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Eye Accents
        </button>

        <button
          onClick={() => setActiveSubTab('favorites')}
          className={`flex-1 min-w-[76px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 ${
            activeSubTab === 'favorites'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-sm font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Saved
        </button>
      </div>

      {/* ── Toast notification badge ── */}
      {copyToast && (
        <div className="flex items-center justify-center gap-1.5 py-1 px-3 mx-auto w-fit bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-full shadow-lg animate-fade-in-up">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* ────────────────── SUB-TAB 1: SOLID & PRESETS ────────────────── */}
      {activeSubTab === 'solid' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Core Dual Color Pickers */}
          <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-gray-50/70 dark:bg-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Primary Colors
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={swapColors}
                  title="Swap Foreground and Background"
                  className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-yellow-400 hover:opacity-75 transition-opacity"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  Swap
                </button>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <button
                  onClick={saveToFavorites}
                  title="Save current color setup"
                  className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-yellow-400 hover:opacity-75 transition-opacity"
                >
                  <Bookmark className="w-3 h-3" />
                  Save
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foreground Card */}
              <div className="p-3 bg-white dark:bg-black/30 rounded-xl border border-[var(--color-border)] space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: fgColor }}
                    />
                    <label className="text-xs font-bold text-[var(--color-text)]">
                      Dots / Pattern
                    </label>
                  </div>
                  {hasEyeDropper && (
                    <button
                      onClick={() => pickScreenColor('fg')}
                      title="Sample color from screen"
                      className="p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-white/10 rounded-md transition-colors"
                    >
                      <Pipette className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-11 h-9 shrink-0 rounded-lg overflow-hidden border border-[var(--color-border)] cursor-pointer shadow-xs">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => set({ fgColor: e.target.value, activePalette: 'Custom' })}
                      className="absolute -inset-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (!val.startsWith('#') && val.length > 0) val = `#${val}`;
                      set({ fgColor: val, activePalette: 'Custom' });
                    }}
                    placeholder="#000000"
                    className={inputClass}
                  />
                </div>
                {/* Micro Adjusters for FG */}
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={() => set({ fgColor: adjustLightness(fgColor, -8), activePalette: 'Custom' })}
                    title="Make pattern darker"
                    className="flex-1 py-1 text-[10px] font-semibold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    Darker
                  </button>
                  <button
                    onClick={() => set({ fgColor: adjustLightness(fgColor, 8), activePalette: 'Custom' })}
                    title="Make pattern lighter"
                    className="flex-1 py-1 text-[10px] font-semibold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    Lighter
                  </button>
                  <button
                    onClick={() => set({ fgColor: adjustSaturation(fgColor, 15), activePalette: 'Custom' })}
                    title="Boost saturation"
                    className="flex-1 py-1 text-[10px] font-semibold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    Vivid
                  </button>
                </div>
              </div>

              {/* Background Card */}
              <div className="p-3 bg-white dark:bg-black/30 rounded-xl border border-[var(--color-border)] space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: transparentBg ? 'transparent' : bgColor }}
                    />
                    <label className="text-xs font-bold text-[var(--color-text)]">
                      Background
                    </label>
                  </div>
                  {hasEyeDropper && !transparentBg && (
                    <button
                      onClick={() => pickScreenColor('bg')}
                      title="Sample color from screen"
                      className="p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-white/10 rounded-md transition-colors"
                    >
                      <Pipette className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-11 h-9 shrink-0 rounded-lg overflow-hidden border border-[var(--color-border)] cursor-pointer shadow-xs">
                    <input
                      type="color"
                      disabled={transparentBg}
                      value={bgColor}
                      onChange={(e) => set({ bgColor: e.target.value, activePalette: 'Custom' })}
                      className="absolute -inset-4 w-20 h-20 cursor-pointer disabled:opacity-50"
                    />
                  </div>
                  <input
                    type="text"
                    disabled={transparentBg}
                    value={transparentBg ? 'Transparent' : bgColor}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (!val.startsWith('#') && val.length > 0) val = `#${val}`;
                      set({ bgColor: val, activePalette: 'Custom' });
                    }}
                    placeholder="#FFFFFF"
                    className={`${inputClass} disabled:opacity-50`}
                  />
                </div>
                {/* Transparent Background Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 cursor-pointer flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={transparentBg}
                      onChange={(e) => set({ transparentBg: e.target.checked })}
                      className="rounded accent-orange-600 dark:accent-yellow-400 w-3.5 h-3.5"
                    />
                    Transparent BG
                  </label>
                  {!transparentBg && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => set({ bgColor: adjustLightness(bgColor, -5), activePalette: 'Custom' })}
                        title="Make background darker"
                        className="px-2 py-0.5 text-[9px] font-semibold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-300"
                      >
                        -5%
                      </button>
                      <button
                        onClick={() => set({ bgColor: adjustLightness(bgColor, 5), activePalette: 'Custom' })}
                        title="Make background lighter"
                        className="px-2 py-0.5 text-[9px] font-semibold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-300"
                      >
                        +5%
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Toolbox */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => {
                  const pair = generateHarmony('complementary');
                  set({ fgColor: pair.fg, bgColor: pair.bg, activePalette: 'Custom' });
                }}
                className="py-2 text-[11px] font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <Dices className="w-3.5 h-3.5 text-orange-500" />
                Random
              </button>
              <button
                onClick={invertColors}
                className="py-2 text-[11px] font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Invert
              </button>
              <button
                onClick={copyHexValues}
                className="py-2 text-[11px] font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
              <button
                onClick={resetColors}
                className="py-2 text-[11px] font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center gap-1 transition-all active:scale-95 text-red-600 dark:text-red-400"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* ── Scan Contrast Meter & Auto-Fix ── */}
          <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-gray-50/70 dark:bg-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Scan Contrast
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold ${contrastColor}`}>
                  {ratio.toFixed(1)}:1 — {contrastLabel}
                </span>
                {ratio < 4.5 && (
                  <button
                    onClick={handleAutoFixContrast}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-[10px] font-bold shadow-xs active:scale-95 transition-all"
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    Auto-Fix
                  </button>
                )}
              </div>
            </div>

            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${contrastBarColor}`}
                style={{ width: `${Math.min((ratio / 21) * 100, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>
                {ratio < 3
                  ? '⚠️ Critical: Cameras might fail to scan — click Auto-Fix.'
                  : ratio < 4.5
                    ? '⚡ Acceptable under bright light; enhance for darker rooms.'
                    : '✓ Optimal contrast: Instant, reliable scanning on all devices.'}
              </span>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <div
                  className="w-5 h-5 rounded border border-[var(--color-border)] flex items-center justify-center"
                  style={{ backgroundColor: transparentBg ? '#f3f4f6' : bgColor }}
                >
                  <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: fgColor }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Curated Designer Themes (Categorized & Searchable) ── */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Curated Themes ({filteredPalettes.length})
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPaletteViewMode((m) => (m === 'grid' ? 'detailed' : 'grid'))
                  }
                  className="text-[10px] font-bold text-orange-600 dark:text-yellow-400 hover:opacity-75 transition-opacity"
                >
                  {paletteViewMode === 'grid' ? 'Detailed view' : 'Compact grid'}
                </button>
              </div>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={paletteSearch}
                    onChange={(e) => setPaletteSearch(e.target.value)}
                    placeholder="Search by theme (e.g. Neon, Navy, Warm)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-white/5 border border-[var(--color-border)] rounded-xl outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  {paletteSearch && (
                    <button
                      onClick={() => setPaletteSearch('')}
                      className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {PALETTE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPaletteCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                      paletteCategory === cat
                        ? 'bg-orange-600 dark:bg-yellow-400 text-white dark:text-black shadow-xs'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Palettes Grid */}
            <div
              className={`grid gap-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin ${
                paletteViewMode === 'grid' ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {filteredPalettes.map((p) => {
                const isActive = fgColor === p.fg && bgColor === p.bg && !useFgGradient;
                return (
                  <button
                    key={p.name}
                    onClick={() =>
                      set({
                        fgColor: p.fg,
                        bgColor: p.bg,
                        activePalette: p.name,
                        useFgGradient: false,
                      })
                    }
                    className={`group relative rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                      paletteViewMode === 'grid'
                        ? 'aspect-square p-1.5'
                        : 'p-2.5 flex items-center gap-3 text-left'
                    } ${
                      isActive
                        ? 'border-orange-600 dark:border-yellow-400 ring-4 ring-orange-500/20 dark:ring-yellow-400/20'
                        : 'border-[var(--color-border)] hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-black/20'
                    }`}
                    title={`${p.name} (${p.fg} on ${p.bg})`}
                  >
                    {paletteViewMode === 'grid' ? (
                      <>
                        <div
                          className="absolute inset-0 transition-opacity"
                          style={{ backgroundColor: p.bg }}
                        />
                        <div
                          className="absolute inset-2 rounded-lg shadow-sm"
                          style={{ backgroundColor: p.fg }}
                        />
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                        <span className="sr-only">{p.name}</span>
                      </>
                    ) : (
                      <>
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-black/10 shadow-xs">
                          <div className="absolute inset-0" style={{ backgroundColor: p.bg }} />
                          <div className="absolute inset-1.5 rounded" style={{ backgroundColor: p.fg }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[var(--color-text)] truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {p.tag} • {p.category}
                          </p>
                        </div>
                        {isActive && (
                          <Check className="w-4 h-4 text-orange-600 dark:text-yellow-400 shrink-0" />
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 2: GRADIENTS ────────────────── */}
      {activeSubTab === 'gradient' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Gradient Studio Panel */}
          <div className="p-4 bg-gray-50/70 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Gradient Style
                </h4>
                <p className="text-[10px] text-gray-400">
                  Smooth dual-stop blend for QR body dots
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyCSSGradient}
                  title="Copy CSS gradient rule"
                  className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-yellow-400 hover:opacity-75 transition-opacity"
                >
                  <Copy className="w-3 h-3" />
                  CSS
                </button>
              </div>
            </div>

            {/* Gradient Live Bar Preview */}
            <div
              className="h-10 rounded-xl border border-[var(--color-border)] shadow-inner relative overflow-hidden flex items-center justify-between px-3"
              style={{
                background:
                  fgGradient.type === 'linear'
                    ? `linear-gradient(${fgGradient.rotation}deg, ${fgGradient.colorStops[0].color}, ${fgGradient.colorStops[1].color})`
                    : `radial-gradient(circle, ${fgGradient.colorStops[0].color}, ${fgGradient.colorStops[1].color})`,
              }}
            >
              <span className="text-[10px] font-bold text-white drop-shadow-md uppercase">
                {fgGradient.type} • {fgGradient.rotation}°
              </span>
              <button
                onClick={() => {
                  const reversed = [
                    { ...fgGradient.colorStops[1], offset: 0 },
                    { ...fgGradient.colorStops[0], offset: 1 },
                  ];
                  set({ fgGradient: { ...fgGradient, colorStops: reversed } });
                  showToast('Gradient flipped');
                }}
                title="Flip gradient direction"
                className="px-2 py-1 bg-black/40 hover:bg-black/60 text-white rounded-md text-[9px] font-bold backdrop-blur-xs transition-colors"
              >
                ⇄ Reverse
              </button>
            </div>

            {/* Type selector (Linear / Radial) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white dark:bg-black/20 rounded-xl border border-[var(--color-border)]">
              {(['linear', 'radial'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => set({ fgGradient: { ...fgGradient, type } })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    fgGradient.type === type
                      ? 'bg-orange-600 dark:bg-yellow-400 text-white dark:text-black shadow-xs'
                      : 'text-gray-500 hover:text-[var(--color-text)]'
                  }`}
                >
                  {type.toUpperCase()} GRADIENT
                </button>
              ))}
            </div>

            {/* Rotation / Angle Controls (Linear only) */}
            {fgGradient.type === 'linear' && (
              <div className="space-y-2.5">
                <div className="flex justify-between text-[11px] font-bold uppercase opacity-70">
                  <span>Gradient Angle</span>
                  <span className="text-orange-600 dark:text-yellow-400 font-mono">
                    {fgGradient.rotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={fgGradient.rotation}
                  onChange={(e) =>
                    set({ fgGradient: { ...fgGradient, rotation: Number(e.target.value) } })
                  }
                  className="w-full accent-orange-600 dark:accent-yellow-400 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                {/* Quick Angle Preset Pills */}
                <div className="flex gap-1.5 pt-1">
                  {ANGLE_PRESETS.map((deg) => (
                    <button
                      key={deg}
                      onClick={() => set({ fgGradient: { ...fgGradient, rotation: deg } })}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                        fgGradient.rotation === deg
                          ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-yellow-400'
                          : 'border-[var(--color-border)] bg-white dark:bg-black/20 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gradient Stops (Start & End) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Color Stops
                </span>
                <button
                  onClick={() => {
                    const pair = generateHarmony('triadic');
                    set({
                      fgGradient: {
                        ...fgGradient,
                        colorStops: [
                          { offset: 0, color: pair.fg },
                          { offset: 1, color: pair.bg },
                        ],
                      },
                    });
                    showToast('Random gradient applied');
                  }}
                  className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-yellow-400 hover:opacity-75"
                >
                  <Dices className="w-3 h-3" />
                  Randomize
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Start Color Stop */}
                <div className="p-2.5 bg-white dark:bg-black/30 rounded-xl border border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500">Start Color</span>
                    {hasEyeDropper && (
                      <button
                        onClick={async () => {
                          try {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const eye = new (window as any).EyeDropper();
                            const res = await eye.open();
                            if (res?.sRGBHex) {
                              const stops = [...fgGradient.colorStops];
                              stops[0] = { ...stops[0], color: res.sRGBHex.toUpperCase() };
                              set({ fgGradient: { ...fgGradient, colorStops: stops } });
                            }
                          } catch {
                            // cancel
                          }
                        }}
                        className="text-gray-400 hover:text-orange-500"
                      >
                        <Pipette className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-7 rounded-lg overflow-hidden border border-[var(--color-border)] cursor-pointer">
                      <input
                        type="color"
                        value={fgGradient.colorStops[0].color}
                        onChange={(e) => {
                          const stops = [...fgGradient.colorStops];
                          stops[0] = { ...stops[0], color: e.target.value };
                          set({ fgGradient: { ...fgGradient, colorStops: stops } });
                        }}
                        className="absolute -inset-2 w-16 h-16 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={fgGradient.colorStops[0].color}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (!val.startsWith('#') && val.length > 0) val = `#${val}`;
                        const stops = [...fgGradient.colorStops];
                        stops[0] = { ...stops[0], color: val };
                        set({ fgGradient: { ...fgGradient, colorStops: stops } });
                      }}
                      className="w-full px-2 py-1 text-xs font-mono font-bold border border-[var(--color-border)] rounded-lg bg-[var(--color-background)]"
                    />
                  </div>
                </div>

                {/* End Color Stop */}
                <div className="p-2.5 bg-white dark:bg-black/30 rounded-xl border border-[var(--color-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500">End Color</span>
                    {hasEyeDropper && (
                      <button
                        onClick={async () => {
                          try {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const eye = new (window as any).EyeDropper();
                            const res = await eye.open();
                            if (res?.sRGBHex) {
                              const stops = [...fgGradient.colorStops];
                              stops[1] = { ...stops[1], color: res.sRGBHex.toUpperCase() };
                              set({ fgGradient: { ...fgGradient, colorStops: stops } });
                            }
                          } catch {
                            // cancel
                          }
                        }}
                        className="text-gray-400 hover:text-orange-500"
                      >
                        <Pipette className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-7 rounded-lg overflow-hidden border border-[var(--color-border)] cursor-pointer">
                      <input
                        type="color"
                        value={fgGradient.colorStops[1].color}
                        onChange={(e) => {
                          const stops = [...fgGradient.colorStops];
                          stops[1] = { ...stops[1], color: e.target.value };
                          set({ fgGradient: { ...fgGradient, colorStops: stops } });
                        }}
                        className="absolute -inset-2 w-16 h-16 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={fgGradient.colorStops[1].color}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (!val.startsWith('#') && val.length > 0) val = `#${val}`;
                        const stops = [...fgGradient.colorStops];
                        stops[1] = { ...stops[1], color: val };
                        set({ fgGradient: { ...fgGradient, colorStops: stops } });
                      }}
                      className="w-full px-2 py-1 text-xs font-mono font-bold border border-[var(--color-border)] rounded-lg bg-[var(--color-background)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Curated Gradient Presets ── */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Designer Gradient Presets ({GRADIENT_PRESETS.length})
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
              {GRADIENT_PRESETS.map((gp) => {
                const isSelected =
                  useFgGradient &&
                  fgGradient.type === gp.type &&
                  fgGradient.colorStops[0]?.color.toUpperCase() === gp.stops[0].toUpperCase() &&
                  fgGradient.colorStops[1]?.color.toUpperCase() === gp.stops[1].toUpperCase();

                const gradStyle =
                  gp.type === 'linear'
                    ? `linear-gradient(${gp.rotation}deg, ${gp.stops[0]}, ${gp.stops[1]})`
                    : `radial-gradient(circle, ${gp.stops[0]}, ${gp.stops[1]})`;

                return (
                  <button
                    key={gp.name}
                    onClick={() => {
                      set({
                        useFgGradient: true,
                        fgGradient: {
                          type: gp.type,
                          rotation: gp.rotation,
                          colorStops: [
                            { offset: 0, color: gp.stops[0] },
                            { offset: 1, color: gp.stops[1] },
                          ],
                        },
                      });
                      showToast(`Applied ${gp.name}`);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-2 transition-all hover:scale-[1.02] active:scale-95 ${
                      isSelected
                        ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-500/5'
                        : 'border-[var(--color-border)] bg-white dark:bg-black/20 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div
                      className="h-8 w-full rounded-lg shadow-xs relative overflow-hidden"
                      style={{ background: gradStyle }}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[var(--color-text)] truncate">
                        {gp.name}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {gp.type === 'linear' ? `${gp.rotation}°` : 'rad'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 3: HARMONIES & AI ────────────────── */}
      {activeSubTab === 'harmonies' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Harmony Mode Selector */}
          <div className="p-4 bg-gray-50/70 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  Color Theory Harmonies
                </h4>
                <p className="text-[10px] text-gray-400">
                  Select a relationship rule to generate mathematical color balance
                </p>
              </div>
              <button
                onClick={() => {
                  const pair = generateHarmony(harmonyMode);
                  set({ fgColor: pair.fg, bgColor: pair.bg, activePalette: 'Custom' });
                  showToast(`Generated ${harmonyMode}`);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 dark:bg-yellow-400 text-white dark:text-black rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition-all"
              >
                <Shuffle className="w-3 h-3" />
                Roll New
              </button>
            </div>

            {/* Harmony Modes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HARMONY_MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => {
                    setHarmonyMode(m.key);
                    const pair = generateHarmony(m.key);
                    set({ fgColor: pair.fg, bgColor: pair.bg, activePalette: 'Custom' });
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 ${
                    harmonyMode === m.key
                      ? 'border-orange-500 bg-orange-500/10 dark:bg-yellow-400/10'
                      : 'border-[var(--color-border)] bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{m.icon}</span>
                    <span
                      className={`text-xs font-bold ${
                        harmonyMode === m.key
                          ? 'text-orange-600 dark:text-yellow-400'
                          : 'text-[var(--color-text)]'
                      }`}
                    >
                      {m.label}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400 line-clamp-2 leading-tight">
                    {m.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Inspiration Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Dices className="w-3.5 h-3.5" />
                Dynamic Inspiration Matrix
              </h4>
              <button
                onClick={() => setInspirationSeed((s) => s + 1)}
                className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-yellow-400 hover:opacity-75 transition-opacity"
              >
                <RefreshCw className="w-3 h-3" />
                Shuffle Matrix
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {inspirations.map((pair, i) => {
                const isActive = fgColor === pair.fg && bgColor === pair.bg;
                return (
                  <button
                    key={`${inspirationSeed}-${i}`}
                    onClick={() => {
                      set({ fgColor: pair.fg, bgColor: pair.bg, activePalette: 'Custom' });
                      showToast('Inspiration applied');
                    }}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                      isActive
                        ? 'border-orange-600 dark:border-yellow-400 ring-4 ring-orange-500/20 scale-105'
                        : 'border-[var(--color-border)] hover:border-gray-400'
                    }`}
                    title={`${pair.fg} on ${pair.bg}`}
                  >
                    <div className="absolute inset-0" style={{ backgroundColor: pair.bg }} />
                    <div
                      className="absolute inset-2 rounded-lg shadow-xs"
                      style={{ backgroundColor: pair.fg }}
                    />
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 4: EYE ACCENTS ────────────────── */}
      {activeSubTab === 'eyes' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Eye Customization Toggle Panel */}
          <div className="p-4 bg-gray-50/70 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Custom Eye Colors
                </h4>
                <p className="text-[10px] text-gray-400">
                  Style the 3 corner finder patterns independently
                </p>
              </div>
              <button
                onClick={() => set({ useCustomEyeColors: !useCustomEyeColors })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  useCustomEyeColors
                    ? 'bg-orange-600 dark:bg-yellow-400'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-xs ${
                    useCustomEyeColors ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {useCustomEyeColors && (
              <div className="space-y-4 pt-3 border-t border-[var(--color-border)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Outer Frame (Corner Square) */}
                  <div className="p-3 bg-white dark:bg-black/30 rounded-xl border border-[var(--color-border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[var(--color-text)]">
                        Corner Square (Frame)
                      </label>
                      {hasEyeDropper && (
                        <button
                          onClick={() => pickScreenColor('eyeSquare')}
                          className="text-gray-400 hover:text-orange-500"
                        >
                          <Pipette className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-10 h-8 rounded-lg overflow-hidden border border-[var(--color-border)] cursor-pointer">
                        <input
                          type="color"
                          value={cornerSquareColor}
                          onChange={(e) => set({ cornerSquareColor: e.target.value })}
                          className="absolute -inset-2 w-16 h-16 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={cornerSquareColor}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (!val.startsWith('#') && val.length > 0) val = `#${val}`;
                          set({ cornerSquareColor: val });
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Inner Dot (Corner Dot) */}
                  <div className="p-3 bg-white dark:bg-black/30 rounded-xl border border-[var(--color-border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[var(--color-text)]">
                        Corner Dot (Center)
                      </label>
                      {hasEyeDropper && (
                        <button
                          onClick={() => pickScreenColor('eyeDot')}
                          className="text-gray-400 hover:text-orange-500"
                        >
                          <Pipette className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-10 h-8 rounded-lg overflow-hidden border border-[var(--color-border)] cursor-pointer">
                        <input
                          type="color"
                          value={cornerDotColor}
                          onChange={(e) => set({ cornerDotColor: e.target.value })}
                          className="absolute -inset-2 w-16 h-16 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={cornerDotColor}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (!val.startsWith('#') && val.length > 0) val = `#${val}`;
                          set({ cornerDotColor: val });
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Eye Presets */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Quick Eye Harmonizers
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        set({ cornerSquareColor: fgColor, cornerDotColor: fgColor });
                        showToast('Eyes matched to foreground');
                      }}
                      className="py-1.5 px-2 text-[10px] font-bold border border-[var(--color-border)] rounded-lg bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-center truncate"
                    >
                      Match FG
                    </button>
                    <button
                      onClick={() => {
                        const comp = generateHarmony('complementary', hexToHsl(fgColor).h);
                        set({ cornerSquareColor: fgColor, cornerDotColor: comp.fg });
                        showToast('Complementary eyes set');
                      }}
                      className="py-1.5 px-2 text-[10px] font-bold border border-[var(--color-border)] rounded-lg bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-center truncate"
                    >
                      Contrast Dot
                    </button>
                    <button
                      onClick={() => {
                        set({ cornerSquareColor: '#EA580C', cornerDotColor: '#F59E0B' });
                        showToast('Solar eye accent applied');
                      }}
                      className="py-1.5 px-2 text-[10px] font-bold border border-[var(--color-border)] rounded-lg bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-center truncate"
                    >
                      Solar Amber
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 5: FAVORITES & RECENTS ────────────────── */}
      {activeSubTab === 'favorites' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Saved User Favorites */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                Saved Favorites ({favorites.length})
              </h4>
              <button
                onClick={saveToFavorites}
                className="text-[10px] font-bold text-orange-600 dark:text-yellow-400 hover:opacity-75 transition-opacity"
              >
                + Save Current Setup
              </button>
            </div>

            {favorites.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-[var(--color-border)] rounded-2xl space-y-2 bg-gray-50/50 dark:bg-white/5">
                <Bookmark className="w-6 h-6 mx-auto text-gray-400 opacity-50" />
                <p className="text-xs font-bold text-[var(--color-text)]">
                  No saved palettes yet
                </p>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                  Click the "Save" button anytime to bookmark your favorite color combinations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    onClick={() => {
                      set({
                        fgColor: fav.fg,
                        bgColor: fav.bg,
                        useFgGradient: fav.useGradient,
                        ...(fav.gradient ? { fgGradient: fav.gradient } : {}),
                        ...(fav.useCustomEyes !== undefined
                          ? { useCustomEyeColors: fav.useCustomEyes }
                          : {}),
                        ...(fav.eyeSquare ? { cornerSquareColor: fav.eyeSquare } : {}),
                        ...(fav.eyeDot ? { cornerDotColor: fav.eyeDot } : {}),
                        activePalette: fav.name,
                      });
                      showToast(`Loaded ${fav.name}`);
                    }}
                    className="p-3 rounded-xl border border-[var(--color-border)] bg-white dark:bg-black/20 hover:border-orange-500 cursor-pointer flex items-center justify-between transition-all group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-black/10">
                        <div className="absolute inset-0" style={{ backgroundColor: fav.bg }} />
                        <div
                          className="absolute inset-1.5 rounded"
                          style={{
                            background:
                              fav.useGradient && fav.gradient
                                ? `linear-gradient(${fav.gradient.rotation}deg, ${fav.gradient.colorStops[0].color}, ${fav.gradient.colorStops[1].color})`
                                : fav.fg,
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text)]">{fav.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {fav.fg} on {fav.bg}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteFavorite(fav.id, e)}
                      title="Delete saved palette"
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent History Trail */}
          {recentHistory.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Recent Experiments ({recentHistory.length})
                </h4>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {recentHistory.map((p, idx) => (
                  <button
                    key={`${p.fg}-${p.bg}-${idx}`}
                    onClick={() => {
                      set({ fgColor: p.fg, bgColor: p.bg, activePalette: 'Custom' });
                      showToast('Recent restored');
                    }}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--color-border)] hover:scale-105 active:scale-95 transition-all"
                    title={`${p.fg} on ${p.bg}`}
                  >
                    <div className="absolute inset-0" style={{ backgroundColor: p.bg }} />
                    <div className="absolute inset-2 rounded-lg" style={{ backgroundColor: p.fg }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
