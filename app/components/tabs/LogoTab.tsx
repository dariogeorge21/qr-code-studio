'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQRStore } from '../../store/useQRStore';
import {
  LOGO_SHAPES,
  LOGO_PRESETS,
  type LogoShape,
  type LogoPreset,
  type LogoCategory,
} from '../../types/qr';
import {
  BRAND_ICONS,
  ICON_CATEGORIES,
  getBrandIconDataUrl,
  type BrandIconDef,
  type IconCategory,
} from '../../data/brandLogos';
import {
  Sparkles,
  Dices,
  RotateCcw,
  Check,
  Bookmark,
  Trash2,
  Copy,
  CheckCircle2,
  Search,
  Image as ImageIcon,
  UploadCloud,
  Link as LinkIcon,
  ShieldCheck,
  Palette,
  Sliders,
  Sun,
  Maximize2,
  Pipette,
  Layers,
  AlertTriangle,
  RefreshCw,
  X,
  Plus,
  Compass,
  Square,
  Circle,
  Shield,
  Hexagon,
  Download,
} from 'lucide-react';

/* ────────────────── Types & Interfaces ────────────────── */

type LogoSubTab = 'gallery' | 'upload' | 'presets' | 'badge' | 'transform' | 'saved';

interface SavedLogoConfig {
  id: string;
  name: string;
  logoImage: string | null;
  logoSize: number;
  logoMargin: number;
  logoPadding: number;
  logoRadius: number;
  logoOpacity: number;
  logoRotation: number;
  logoBgColor: string;
  logoBgEnabled: boolean;
  logoBorderWidth: number;
  logoBorderColor: string;
  logoBorderEnabled: boolean;
  logoShape: LogoShape;
  logoGrayscale: boolean;
  logoShadowEnabled: boolean;
  logoShadowBlur: number;
  logoShadowColor: string;
  timestamp: number;
}

type TintMode = 'brand' | 'qr_color' | 'custom';

/* ────────────────── Quick Colors & Palettes ────────────────── */

const QUICK_LOGO_COLORS = [
  '#FFFFFF',
  '#000000',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
];

const QUICK_BG_COLORS = [
  '#FFFFFF',
  '#F8FAFC',
  '#0F172A',
  '#FEF3C7',
  '#ECFDF5',
  '#EFF6FF',
  '#FDF2F8',
  '#EDE9FE',
  '#000000',
];

const PRESET_CATEGORIES: LogoCategory[] = [
  'All',
  'Trending',
  'Minimal',
  'Vibrant',
  'Luxury',
  'Cyber',
  'Retro',
];

/* ────────────────── Miniature Preview SVG Visualizers ────────────────── */

/** Renders a miniature shape icon */
function LogoShapeMiniSVG({ shape }: { shape: LogoShape }) {
  switch (shape) {
    case 'circle':
      return <Circle className="w-4 h-4" />;
    case 'shield':
      return <Shield className="w-4 h-4" />;
    case 'hexagon':
      return <Hexagon className="w-4 h-4" />;
    case 'diamond':
      return (
        <div className="w-3.5 h-3.5 border-2 border-current rotate-45 rounded-[1px] mx-auto" />
      );
    case 'rounded':
      return (
        <div className="w-4 h-4 border-2 border-current rounded-md mx-auto" />
      );
    default:
      return <Square className="w-4 h-4" />;
  }
}

/** Renders a miniature visual of a logo badge preset */
function LogoPresetMiniSVG({ preset }: { preset: LogoPreset }) {
  const clip =
    preset.logoShape === 'circle'
      ? 'rounded-full'
      : preset.logoShape === 'rounded'
        ? 'rounded-lg'
        : preset.logoShape === 'hexagon'
          ? 'rounded-none [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]'
          : preset.logoShape === 'shield'
            ? 'rounded-none [clip-path:polygon(50%_0%,100%_0%,100%_65%,50%_100%,0%_65%,0%_0%)]'
            : preset.logoShape === 'diamond'
              ? 'rounded-none [clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)]'
              : 'rounded-xs';

  return (
    <div
      className={`w-8 h-8 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${clip}`}
      style={{
        backgroundColor: preset.logoBgEnabled ? preset.logoBgColor : 'transparent',
        borderWidth: preset.logoBorderEnabled ? `${Math.max(1.5, Math.min(preset.logoBorderWidth, 3))}px` : '1px',
        borderStyle: 'solid',
        borderColor: preset.logoBorderEnabled ? preset.logoBorderColor : 'var(--color-border)',
        boxShadow: preset.logoShadowEnabled
          ? `0 2px ${Math.min(preset.logoShadowBlur, 8)}px ${preset.logoShadowColor}`
          : undefined,
      }}
    >
      <span className="text-xs">{preset.emoji}</span>
    </div>
  );
}

/* ────────────────── Main LogoTab Component ────────────────── */

export default function LogoTab() {
  const {
    logoImage,
    logoSize,
    logoMargin,
    logoPadding,
    logoRadius,
    logoOpacity,
    logoRotation,
    logoBgColor,
    logoBgEnabled,
    logoBorderWidth,
    logoBorderColor,
    logoBorderEnabled,
    logoShape,
    logoGrayscale,
    logoShadowEnabled,
    logoShadowBlur,
    logoShadowColor,
    errorCorrectionLevel,
    fgColor,
    bgColor,
    set,
  } = useQRStore();

  // Navigation & filtering state
  const [activeSubTab, setActiveSubTab] = useState<LogoSubTab>('gallery');
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [activeIconId, setActiveIconId] = useState<string | null>(null);
  const [iconCategory, setIconCategory] = useState<IconCategory>('All');
  const [iconSearch, setIconSearch] = useState('');
  const [presetCategory, setPresetCategory] = useState<LogoCategory>('All');
  const [presetSearch, setPresetSearch] = useState('');
  const [tintMode, setTintMode] = useState<TintMode>('brand');
  const [customTintColor, setCustomTintColor] = useState('#3B82F6');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);
  const [savedLogos, setSavedLogos] = useState<SavedLogoConfig[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);

  // Check for native EyeDropper support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

  // Load saved logos from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qr_logo_favorites');
      if (stored) setSavedLogos(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  // Global clipboard paste listener (Ctrl+V anywhere on LogoTab)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const result = ev.target?.result as string;
              set({ logoImage: result, errorCorrectionLevel: 'H' });
              setActiveIconId(null);
              showToast('Pasted image from clipboard!');
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [set]);

  // Toast feedback trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  /* ── Filtered Brand Icons ── */
  const filteredIcons = useMemo(() => {
    return BRAND_ICONS.filter((icon) => {
      const matchCat = iconCategory === 'All' || icon.category === iconCategory;
      const q = iconSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        icon.name.toLowerCase().includes(q) ||
        icon.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [iconCategory, iconSearch]);

  /* ── Filtered Presets ── */
  const filteredPresets = useMemo(() => {
    return LOGO_PRESETS.filter((p) => {
      const matchCat = presetCategory === 'All' || p.category === presetCategory;
      const q = presetSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tag && p.tag.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [presetCategory, presetSearch]);

  /* ── Scannability Health Metrics ── */
  const scannabilityInfo = useMemo(() => {
    const scalePercent = Math.round(logoSize * 100);
    const isH = errorCorrectionLevel === 'H';
    const isQ = errorCorrectionLevel === 'Q';

    let health: 'excellent' | 'good' | 'caution' = 'excellent';
    let label = 'Excellent Scannability';
    let detail = 'Optimally sized for fast recognition across all smartphone cameras.';

    if (scalePercent > 34) {
      health = 'caution';
      label = 'High Density Area';
      detail = 'Center logo covers >34% of the QR matrix. Level H error correction is strictly required.';
    } else if (scalePercent > 28) {
      health = 'good';
      label = 'Good Readability';
      detail = 'Well balanced badge size. Clear contrast ensures quick scans.';
    }

    return {
      scalePercent,
      isH,
      isQ,
      health,
      label,
      detail,
    };
  }, [logoSize, errorCorrectionLevel]);

  /* ── Apply Brand Icon from Gallery ── */
  const selectBrandIcon = useCallback(
    (icon: BrandIconDef) => {
      setActiveIconId(icon.id);
      let chosenColor = icon.brandColor;
      if (tintMode === 'qr_color') {
        chosenColor = fgColor;
      } else if (tintMode === 'custom') {
        chosenColor = customTintColor;
      }

      const dataUrl = getBrandIconDataUrl(icon, chosenColor);
      set({
        logoImage: dataUrl,
        errorCorrectionLevel: 'H',
      });
      showToast(`Selected ${icon.name} icon`);
    },
    [tintMode, fgColor, customTintColor, set]
  );

  /* ── Update Tint Color on Current Brand Icon ── */
  const updateTintColor = (mode: TintMode, color?: string) => {
    setTintMode(mode);
    const chosenColor = color || (mode === 'qr_color' ? fgColor : customTintColor);
    if (color) setCustomTintColor(color);

    if (activeIconId) {
      const icon = BRAND_ICONS.find((i) => i.id === activeIconId);
      if (icon) {
        const iconColor = mode === 'brand' ? icon.brandColor : chosenColor;
        const dataUrl = getBrandIconDataUrl(icon, iconColor);
        set({ logoImage: dataUrl });
      }
    }
  };

  /* ── File Upload Handler ── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      set({
        logoImage: ev.target?.result as string,
        errorCorrectionLevel: 'H',
      });
      setActiveIconId(null);
      showToast('Custom logo uploaded');
    };
    reader.readAsDataURL(file);
  };

  /* ── Drag & Drop Handlers ── */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      set({
        logoImage: ev.target?.result as string,
        errorCorrectionLevel: 'H',
      });
      setActiveIconId(null);
      showToast('Custom logo dropped & loaded');
    };
    reader.readAsDataURL(file);
  };

  /* ── URL Image Importer ── */
  const handleImportUrl = () => {
    if (!urlInput.trim()) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 256;
      canvas.height = img.height || 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        set({
          logoImage: canvas.toDataURL('image/png'),
          errorCorrectionLevel: 'H',
        });
        setActiveIconId(null);
        setUrlInput('');
        showToast('Image loaded from URL');
      }
    };
    img.onerror = () => {
      // Fallback: direct URL assignment
      set({ logoImage: urlInput.trim(), errorCorrectionLevel: 'H' });
      setActiveIconId(null);
      setUrlInput('');
      showToast('Image URL assigned');
    };
    img.src = urlInput.trim();
  };

  /* ── Eyedropper API handler ── */
  const pickScreenColor = async (target: 'bg' | 'border' | 'shadow' | 'tint') => {
    if (!hasEyeDropper) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        const color = result.sRGBHex.toUpperCase();
        if (target === 'bg') {
          set({ logoBgColor: color, logoBgEnabled: true });
        } else if (target === 'border') {
          set({ logoBorderColor: color, logoBorderEnabled: true });
        } else if (target === 'shadow') {
          set({ logoShadowColor: color + '40', logoShadowEnabled: true });
        } else if (target === 'tint') {
          updateTintColor('custom', color);
        }
        showToast(`Picked ${color}`);
      }
    } catch {
      // User cancelled
    }
  };

  /* ── Randomize Logo Harmonious Mix ── */
  const randomizeLogo = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    const shapes: LogoShape[] = ['square', 'circle', 'rounded', 'diamond', 'hexagon', 'shield'];
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const rBool = (chance = 0.5) => Math.random() < chance;
    const rHex = () =>
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
    const rRange = (min: number, max: number, step = 1) => {
      const steps = Math.floor((max - min) / step);
      return +(min + Math.floor(Math.random() * (steps + 1)) * step).toFixed(2);
    };

    set({
      logoSize: rRange(0.22, 0.32, 0.01),
      logoMargin: rRange(4, 12, 1),
      logoPadding: rRange(2, 10, 1),
      logoRadius: rRange(0, 40, 1),
      logoOpacity: rRange(0.85, 1, 0.05),
      logoRotation: rBool(0.2) ? rRange(-15, 15, 5) : 0,
      logoBgEnabled: rBool(0.65),
      logoBgColor: rBool(0.6) ? '#FFFFFF' : rHex(),
      logoBorderEnabled: rBool(0.5),
      logoBorderWidth: rRange(1, 5, 1),
      logoBorderColor: rHex(),
      logoShape: pick(shapes),
      logoGrayscale: rBool(0.1),
      logoShadowEnabled: rBool(0.5),
      logoShadowBlur: rRange(6, 22, 2),
      logoShadowColor: rHex() + '45',
      errorCorrectionLevel: 'H',
    });
    setActivePreset(null);
    showToast('Generated harmonious badge mix!');
  }, [set]);

  /* ── Apply Style Preset ── */
  const applyPreset = useCallback(
    (preset: LogoPreset) => {
      const { name, emoji, description, category, tag, ...vals } = preset;
      set({
        ...vals,
        errorCorrectionLevel: 'H',
      });
      setActivePreset(name);
      showToast(`Applied preset: ${name}`);
    },
    [set]
  );

  /* ── Reset to Clean Default ── */
  const resetLogoStyle = useCallback(() => {
    setActivePreset(null);
    set({
      logoSize: 0.24,
      logoMargin: 6,
      logoPadding: 5,
      logoRadius: 6,
      logoOpacity: 1,
      logoRotation: 0,
      logoBgEnabled: false,
      logoBgColor: '#FFFFFF',
      logoBorderEnabled: false,
      logoBorderWidth: 2,
      logoBorderColor: '#000000',
      logoShape: 'square' as LogoShape,
      logoGrayscale: false,
      logoShadowEnabled: false,
      logoShadowBlur: 8,
      logoShadowColor: '#00000040',
    });
    showToast('Logo badge reset to clean default');
  }, [set]);

  /* ── Remove Logo ── */
  const removeLogo = () => {
    set({ logoImage: null });
    setActiveIconId(null);
    setActivePreset(null);
    showToast('Logo removed from QR code');
  };

  /* ── Save Current Configuration to Favorites ── */
  const saveCurrentLogo = () => {
    const newConfig: SavedLogoConfig = {
      id: `${Date.now()}`,
      name: `Custom Badge ${savedLogos.length + 1}`,
      logoImage,
      logoSize,
      logoMargin,
      logoPadding,
      logoRadius,
      logoOpacity,
      logoRotation,
      logoBgColor,
      logoBgEnabled,
      logoBorderWidth,
      logoBorderColor,
      logoBorderEnabled,
      logoShape,
      logoGrayscale,
      logoShadowEnabled,
      logoShadowBlur,
      logoShadowColor,
      timestamp: Date.now(),
    };
    const updated = [newConfig, ...savedLogos];
    setSavedLogos(updated);
    try {
      localStorage.setItem('qr_logo_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Saved badge to favorites!');
  };

  const deleteSavedLogo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedLogos.filter((l) => l.id !== id);
    setSavedLogos(updated);
    try {
      localStorage.setItem('qr_logo_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Saved badge removed');
  };

  const applySavedLogo = (s: SavedLogoConfig) => {
    set({
      logoImage: s.logoImage,
      logoSize: s.logoSize,
      logoMargin: s.logoMargin,
      logoPadding: s.logoPadding,
      logoRadius: s.logoRadius,
      logoOpacity: s.logoOpacity,
      logoRotation: s.logoRotation,
      logoBgColor: s.logoBgColor,
      logoBgEnabled: s.logoBgEnabled,
      logoBorderWidth: s.logoBorderWidth,
      logoBorderColor: s.logoBorderColor,
      logoBorderEnabled: s.logoBorderEnabled,
      logoShape: s.logoShape,
      logoGrayscale: s.logoGrayscale,
      logoShadowEnabled: s.logoShadowEnabled,
      logoShadowBlur: s.logoShadowBlur,
      logoShadowColor: s.logoShadowColor,
      errorCorrectionLevel: 'H',
    });
    setActivePreset(null);
    showToast(`Loaded: ${s.name}`);
  };

  /* ── Copy Logo CSS Rules ── */
  const copyLogoCSS = () => {
    const css = [
      `width: ${Math.round(logoSize * 100)}%;`,
      `height: ${Math.round(logoSize * 100)}%;`,
      logoBgEnabled ? `background-color: ${logoBgColor};` : null,
      logoBgEnabled ? `padding: ${logoPadding}px;` : null,
      logoBorderEnabled ? `border: ${logoBorderWidth}px solid ${logoBorderColor};` : null,
      logoRadius > 0 ? `border-radius: ${logoRadius}px;` : null,
      logoShadowEnabled ? `box-shadow: 0 4px ${logoShadowBlur}px ${logoShadowColor};` : null,
      logoOpacity < 1 ? `opacity: ${logoOpacity};` : null,
      logoRotation !== 0 ? `transform: rotate(${logoRotation}deg);` : null,
      logoGrayscale ? `filter: grayscale(100%);` : null,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(css);
    showToast('Logo badge CSS copied to clipboard!');
  };

  /* ── Copy Specs as JSON ── */
  const copyLogoSpecs = () => {
    const specs = JSON.stringify(
      {
        logoSize,
        logoMargin,
        logoPadding,
        logoRadius,
        logoOpacity,
        logoRotation,
        logoBgEnabled,
        logoBgColor,
        logoBorderEnabled,
        logoBorderWidth,
        logoBorderColor,
        logoShape,
        logoGrayscale,
        logoShadowEnabled,
        logoShadowBlur,
        logoShadowColor,
      },
      null,
      2
    );
    navigator.clipboard.writeText(specs);
    showToast('Logo specs copied to clipboard!');
  };

  /* ── Live Badge Preview Styles ── */
  const previewClip: React.CSSProperties = {
    borderRadius:
      logoShape === 'circle'
        ? '50%'
        : logoShape === 'rounded'
          ? `${Math.max(logoRadius, 20)}px`
          : logoShape === 'square'
            ? `${logoRadius}px`
            : undefined,
    clipPath:
      logoShape === 'hexagon'
        ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
        : logoShape === 'shield'
          ? 'polygon(50% 0%, 100% 0%, 100% 65%, 50% 100%, 0% 65%, 0% 0%)'
          : logoShape === 'diamond'
            ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
            : undefined,
    opacity: logoOpacity,
    transform: `rotate(${logoRotation}deg)`,
    filter: logoGrayscale ? 'grayscale(100%)' : undefined,
    backgroundColor: logoBgEnabled ? logoBgColor : undefined,
    padding: logoBgEnabled ? `${logoPadding}px` : undefined,
    border: logoBorderEnabled ? `${logoBorderWidth}px solid ${logoBorderColor}` : undefined,
    boxShadow: logoShadowEnabled ? `0 4px ${logoShadowBlur}px ${logoShadowColor}` : undefined,
    transition: 'all 0.25s ease',
  };

  /* ── Slider helper ── */
  const slider = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (v: number) => void,
    display: string
  ) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
        <span>{label}</span>
        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-[var(--color-text)] rounded-md">
          {display}
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

  /* ── Toggle switch helper ── */
  const toggle = (label: string, checked: boolean, onChange: (v: boolean) => void, icon: string) => (
    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-secondary)]/40 transition-all">
      <div className="flex items-center gap-2.5">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{label}</span>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-300 dark:bg-gray-700 rounded-full peer-checked:bg-[var(--color-secondary)] transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
      </div>
    </label>
  );

  /* ── Color input with picker & Eyedropper ── */
  const colorField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    target: 'bg' | 'border' | 'shadow' | 'tint'
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
          {label}
        </span>
        {hasEyeDropper && (
          <button
            onClick={() => pickScreenColor(target)}
            title="Pick color from screen"
            className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-secondary)] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Pipette className="w-3 h-3" />
            Eyedropper
          </button>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        <div className="relative shrink-0">
          <input
            type="color"
            value={value.slice(0, 7)}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only peer"
            id={`cf-${label.replace(/\s/g, '')}`}
          />
          <label
            htmlFor={`cf-${label.replace(/\s/g, '')}`}
            className="block w-9 h-9 rounded-xl border-2 border-[var(--color-border)] cursor-pointer hover:scale-105 transition-transform shadow-xs"
            style={{ backgroundColor: value }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 text-xs font-mono font-bold border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
        />
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${isShaking ? 'animate-shake' : ''}`}>
      {/* ── Hidden File Input ── */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        id="logo-file-input"
      />

      {/* ── Sub-Tab Segmented Controller ── */}
      <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('gallery')}
          className={`flex-1 min-w-[70px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${activeSubTab === 'gallery'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
            }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          Gallery
        </button>

        <button
          onClick={() => setActiveSubTab('upload')}
          className={`flex-1 min-w-[70px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${activeSubTab === 'upload'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
            }`}
        >
          <UploadCloud className="w-3.5 h-3.5 text-emerald-500" />
          Upload
        </button>

        <button
          onClick={() => setActiveSubTab('presets')}
          className={`flex-1 min-w-[70px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${activeSubTab === 'presets'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
            }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500 dark:text-yellow-400" />
          Presets
        </button>

        <button
          onClick={() => setActiveSubTab('badge')}
          className={`flex-1 min-w-[70px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${activeSubTab === 'badge'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
            }`}
        >
          <Shield className="w-3.5 h-3.5 text-purple-500" />
          Badge
        </button>

        <button
          onClick={() => setActiveSubTab('transform')}
          className={`flex-1 min-w-[70px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${activeSubTab === 'transform'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
            }`}
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-500" />
          Size & FX
        </button>

        <button
          onClick={() => setActiveSubTab('saved')}
          className={`flex-1 min-w-[70px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${activeSubTab === 'saved'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
            }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-rose-500" />
          Saved
        </button>
      </div>

      {/* ── Active Logo Status Card ── */}
      <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white dark:bg-black/40 border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {logoImage ? (
              <img
                src={logoImage}
                alt="Active logo"
                className="w-7 h-7 object-contain"
                style={previewClip}
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[var(--color-text)] truncate">
              {logoImage ? 'Center Badge Active' : 'No Logo Selected'}
            </span>
            <span className="block text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {logoImage
                ? `Scale: ${Math.round(logoSize * 100)}% • ${logoShape.toUpperCase()} • Level H`
                : 'Select from Gallery, Upload, or Pick a Preset'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {logoImage && (
            <>
              <button
                onClick={randomizeLogo}
                title="Shuffle styling"
                className="p-2 rounded-xl bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-[var(--color-border)] hover:text-[var(--color-secondary)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={removeLogo}
                title="Remove logo"
                className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="flex items-center justify-center gap-1.5 py-1 px-3.5 mx-auto w-fit bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-full shadow-lg animate-fade-in-up">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ────────────────── SUB-TAB 1: GALLERY ────────────────── */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-5 animate-fade-in-up">
          {/* Search & Categories */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search brand & utility icons (WhatsApp, PayPal, Wi-Fi)..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
              />
              {iconSearch && (
                <button
                  onClick={() => setIconSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {ICON_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setIconCategory(cat)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${iconCategory === cat
                      ? 'bg-[var(--color-secondary)] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-[var(--color-text)] hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Color Tinting Modes */}
          <div className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-[var(--color-secondary)]" />
                Icon Color Theme
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateTintColor('brand')}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer text-center ${tintMode === 'brand'
                    ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
                    : 'border-[var(--color-border)] text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
              >
                🌈 Official Color
              </button>
              <button
                onClick={() => updateTintColor('qr_color')}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer text-center ${tintMode === 'qr_color'
                    ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
                    : 'border-[var(--color-border)] text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
              >
                ⬛ Match QR
              </button>
              <button
                onClick={() => updateTintColor('custom')}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer text-center ${tintMode === 'custom'
                    ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
                    : 'border-[var(--color-border)] text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
              >
                🎨 Custom Tint
              </button>
            </div>

            {/* Custom Tint Color Swatches (if custom selected) */}
            {tintMode === 'custom' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {QUICK_LOGO_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateTintColor('custom', c)}
                      className={`w-6 h-6 rounded-lg border-2 transition-transform cursor-pointer hover:scale-110 ${customTintColor === c
                          ? 'border-[var(--color-secondary)] scale-110 shadow-xs'
                          : 'border-transparent'
                        }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  {hasEyeDropper && (
                    <button
                      onClick={() => pickScreenColor('tint')}
                      title="Pick tint color"
                      className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Pipette className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Icons Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredIcons.map((icon) => {
              const isActive = activeIconId === icon.id;
              const displayColor =
                tintMode === 'brand'
                  ? icon.brandColor
                  : tintMode === 'qr_color'
                    ? fgColor
                    : customTintColor;

              return (
                <button
                  key={icon.id}
                  onClick={() => selectBrandIcon(icon)}
                  className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${isActive
                      ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 shadow-xs'
                      : 'border-[var(--color-border)] bg-white dark:bg-black/20 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center mb-2 transition-transform duration-200 group-hover:scale-110"
                    dangerouslySetInnerHTML={{
                      __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}" width="28" height="28">${icon.renderSvg(
                        displayColor
                      )}</svg>`,
                    }}
                  />
                  <span className="text-[11px] font-bold text-[var(--color-text)] truncate w-full text-center">
                    {icon.name}
                  </span>

                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 2: UPLOAD & IMPORT ────────────────── */}
      {activeSubTab === 'upload' && (
        <div className="space-y-5 animate-fade-in-up">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all group ${isDragging
                ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 scale-[1.01]'
                : 'border-[var(--color-border)] hover:border-[var(--color-secondary)]/60 hover:bg-[var(--color-secondary)]/5'
              }`}
          >
            <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7 text-[var(--color-secondary)]" />
            </div>
            <div className="text-center">
              <span className="block text-xs font-bold text-[var(--color-text)]">
                Click to browse or Drag &amp; Drop image here
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                Supports SVG, PNG, JPG, WebP (Max 5MB)
              </span>
            </div>
          </div>

          {/* Clipboard & URL Import Box */}
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <LinkIcon className="w-3 h-3 text-[var(--color-secondary)]" />
                Import Image from URL
              </span>
              <span className="text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
                Tip: Press Ctrl+V to paste
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleImportUrl()}
                className="flex-1 px-3 py-2 text-xs border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
              />
              <button
                onClick={handleImportUrl}
                disabled={!urlInput.trim()}
                className="px-3 py-2 bg-[var(--color-secondary)] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 3: PRESETS ────────────────── */}
      {activeSubTab === 'presets' && (
        <div className="space-y-5 animate-fade-in-up">
          {/* Presets Master Actions */}
          <div className="flex gap-2">
            <button
              onClick={randomizeLogo}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-md shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Harmonious Mix
            </button>
            <button
              onClick={copyLogoSpecs}
              title="Copy JSON specifications"
              className="px-3.5 py-2.5 rounded-2xl border border-[var(--color-border)] bg-gray-50 dark:bg-white/5 text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetLogoStyle}
              title="Reset to default clean style"
              className="px-3.5 py-2.5 rounded-2xl border border-[var(--color-border)] bg-gray-50 dark:bg-white/5 text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search style presets (Cyber, Badge, Gold)..."
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-xs border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPresetCategory(cat)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${presetCategory === cat
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
                  className={`group relative flex flex-col p-3 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${isActive
                      ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/8 shadow-sm ring-2 ring-[var(--color-secondary)]/20'
                      : 'border-[var(--color-border)] bg-white dark:bg-black/20 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <LogoPresetMiniSVG preset={p} />
                    {p.tag && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {p.tag}
                      </span>
                    )}
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

      {/* ────────────────── SUB-TAB 4: BADGE FRAMING & SHAPES ────────────────── */}
      {activeSubTab === 'badge' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Shape Selector */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">
              Badge Geometry Shape
            </h5>
            <div className="grid grid-cols-3 gap-2">
              {LOGO_SHAPES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => set({ logoShape: s.key })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all hover:scale-[1.03] cursor-pointer ${logoShape === s.key
                      ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 shadow-xs'
                      : 'border-[var(--color-border)] hover:border-[var(--color-secondary)]/40'
                    }`}
                >
                  <LogoShapeMiniSVG shape={s.key} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Background Fill Section */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🎨</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  Background Fill
                </span>
              </div>
              <input
                type="checkbox"
                checked={logoBgEnabled}
                onChange={(e) => set({ logoBgEnabled: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-secondary)] cursor-pointer"
              />
            </div>

            {logoBgEnabled && (
              <div className="space-y-3 pt-2">
                {colorField('Fill Color', logoBgColor, (v) => set({ logoBgColor: v }), 'bg')}
                <div className="flex gap-1.5 flex-wrap">
                  {QUICK_BG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => set({ logoBgColor: c })}
                      className="w-6 h-6 rounded-lg border border-[var(--color-border)] hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <button
                    onClick={() => set({ logoBgColor: bgColor })}
                    className="px-2 py-0.5 text-[9px] font-bold rounded-lg bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    Match QR BG
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Border Ring Section */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">⭕</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  Border Ring
                </span>
              </div>
              <input
                type="checkbox"
                checked={logoBorderEnabled}
                onChange={(e) => set({ logoBorderEnabled: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-secondary)] cursor-pointer"
              />
            </div>

            {logoBorderEnabled && (
              <div className="space-y-4 pt-2">
                {slider(
                  'Border Stroke Width',
                  logoBorderWidth,
                  1,
                  8,
                  1,
                  (v) => set({ logoBorderWidth: v }),
                  `${logoBorderWidth}px`
                )}
                {colorField('Border Color', logoBorderColor, (v) => set({ logoBorderColor: v }), 'border')}
                <div className="flex gap-1.5 flex-wrap">
                  {QUICK_LOGO_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => set({ logoBorderColor: c })}
                      className="w-6 h-6 rounded-lg border border-[var(--color-border)] hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <button
                    onClick={() => set({ logoBorderColor: fgColor })}
                    className="px-2 py-0.5 text-[9px] font-bold rounded-lg bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    Match QR FG
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drop Shadow Section */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">💧</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  Drop Shadow &amp; Glow
                </span>
              </div>
              <input
                type="checkbox"
                checked={logoShadowEnabled}
                onChange={(e) => set({ logoShadowEnabled: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-secondary)] cursor-pointer"
              />
            </div>

            {logoShadowEnabled && (
              <div className="space-y-4 pt-2">
                {slider(
                  'Shadow Blur / Glow',
                  logoShadowBlur,
                  2,
                  36,
                  1,
                  (v) => set({ logoShadowBlur: v }),
                  `${logoShadowBlur}px`
                )}
                {colorField('Shadow Color', logoShadowColor, (v) => set({ logoShadowColor: v }), 'shadow')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 5: SIZE, TRANSFORM & FX ────────────────── */}
      {activeSubTab === 'transform' && (
        <div className="space-y-5 animate-fade-in-up">
          {/* Scannability Health Card */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${scannabilityInfo.health === 'excellent'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : scannabilityInfo.health === 'good'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
              }`}
          >
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{scannabilityInfo.label}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded-md">
                  {scannabilityInfo.scalePercent}% Scale
                </span>
              </div>
              <p className="text-[10px] opacity-80 mt-1 leading-relaxed">
                {scannabilityInfo.detail}
              </p>
              {!scannabilityInfo.isH && (
                <button
                  onClick={() => {
                    set({ errorCorrectionLevel: 'H' });
                    showToast('Error correction set to HIGH');
                  }}
                  className="mt-2 text-[10px] font-bold underline cursor-pointer hover:opacity-80"
                >
                  Click here to enforce Level H Recovery
                </button>
              )}
            </div>
          </div>

          {/* Size & Clearance Controls */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
            <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
              📐 Dimensions &amp; Clearance
            </h5>
            {slider(
              'Logo Scale',
              logoSize,
              0.1,
              0.45,
              0.01,
              (v) => set({ logoSize: v }),
              `${Math.round(logoSize * 100)}%`
            )}
            {slider(
              'QR Dot Clearance Margin',
              logoMargin,
              0,
              20,
              1,
              (v) => set({ logoMargin: v }),
              `${logoMargin}px`
            )}
            {slider(
              'Inner Badge Padding',
              logoPadding,
              0,
              20,
              1,
              (v) => set({ logoPadding: v }),
              `${logoPadding}px`
            )}
            {slider(
              'Corner Rounding Radius',
              logoRadius,
              0,
              50,
              1,
              (v) => set({ logoRadius: v }),
              `${logoRadius}px`
            )}
          </div>

          {/* Rotation & Opacity */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-[var(--color-border)]">
            <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
              🔄 Rotation &amp; Opacity
            </h5>
            {slider(
              'Opacity',
              logoOpacity,
              0.1,
              1,
              0.05,
              (v) => set({ logoOpacity: v }),
              `${Math.round(logoOpacity * 100)}%`
            )}
            {slider(
              'Angle Rotation',
              logoRotation,
              -180,
              180,
              5,
              (v) => set({ logoRotation: v }),
              `${logoRotation}°`
            )}

            {/* Quick Angle Snap Buttons */}
            <div className="flex gap-1.5 pt-1">
              {[-90, -45, 0, 45, 90, 180].map((deg) => (
                <button
                  key={deg}
                  onClick={() => set({ logoRotation: deg })}
                  className={`flex-1 py-1 text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${logoRotation === deg
                      ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
                      : 'border-[var(--color-border)] text-gray-500 hover:border-gray-400'
                    }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          {/* Visual Effects */}
          <div className="space-y-2">
            <h5 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">
              ⚡ Optical Effects
            </h5>
            {toggle('Monochrome Grayscale Filter', logoGrayscale, (v) => set({ logoGrayscale: v }), '🌑')}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 6: SAVED FAVORITES ────────────────── */}
      {activeSubTab === 'saved' && (
        <div className="space-y-5 animate-fade-in-up">
          {/* Save Action */}
          <div className="flex gap-2">
            <button
              onClick={saveCurrentLogo}
              disabled={!logoImage}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs text-white bg-[var(--color-secondary)] shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Current Logo Badge
            </button>
            <button
              onClick={copyLogoCSS}
              title="Copy Badge CSS"
              className="px-3.5 py-3 rounded-2xl border border-[var(--color-border)] bg-gray-50 dark:bg-white/5 text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Saved List */}
          {savedLogos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-[var(--color-border)] text-center">
              <Bookmark className="w-8 h-8 text-gray-400 mb-2 opacity-50" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                No saved badges yet
              </span>
              <span className="text-[10px] text-gray-400 mt-1 max-w-xs">
                Style a logo and click &quot;Save Current Logo Badge&quot; to quickly recall your favorite designs.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {savedLogos.map((s) => (
                <div
                  key={s.id}
                  onClick={() => applySavedLogo(s)}
                  className="group relative flex flex-col p-3 rounded-2xl border border-[var(--color-border)] bg-white dark:bg-black/20 hover:border-[var(--color-secondary)]/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                      {s.logoImage ? (
                        <img src={s.logoImage} alt="saved" className="w-6 h-6 object-contain" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <button
                      onClick={(e) => deleteSavedLogo(s.id, e)}
                      title="Delete saved"
                      className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-[var(--color-text)] truncate">
                    {s.name}
                  </span>
                  <span className="text-[9px] text-gray-400">
                    {new Date(s.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}