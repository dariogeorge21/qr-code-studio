'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQRStore } from '../../store/useQRStore';
import {
  FONT_FAMILIES,
  FONT_WEIGHTS,
  TEXT_TRANSFORMS,
  TEXT_DECORATIONS,
  BLEND_MODES,
  TEXT_PRESETS,
  type TextAlign,
  type TextTransform,
  type TextDecoration,
  type BlendMode,
  type TextPreset,
  type TextPresetCategory,
} from '../../types/qr';
import {
  Sparkles,
  Shuffle,
  RotateCcw,
  Check,
  Bookmark,
  Trash2,
  Copy,
  CheckCircle2,
  Search,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Pipette,
  Sun,
  Layers,
  X,
  Palette,
  Eye,
  RefreshCw,
  Zap,
  Repeat,
  Compass,
  Sliders,
  Plus,
  CaseSensitive,
  Underline,
  Strikethrough,
  Baseline,
} from 'lucide-react';

/* ────────────────── Types & Interfaces ────────────────── */

type TextSubTab = 'presets' | 'title' | 'caption' | 'watermark' | 'saved';

interface SavedTextConfig {
  id: string;
  name: string;
  title: string;
  titleFontFamily: string;
  titleFontSize: number;
  titleFontWeight: string;
  titleColor: string;
  titleAlign: TextAlign;
  titleSpacing: number;
  titleLetterSpacing: number;
  titleTextTransform: TextTransform;
  titleTextDecoration: TextDecoration;
  titleTextShadow: boolean;
  titleTextShadowColor: string;
  titleTextShadowBlur: number;
  caption: string;
  captionFontFamily: string;
  captionFontSize: number;
  captionFontWeight: string;
  captionColor: string;
  captionAlign: TextAlign;
  captionSpacing: number;
  captionLetterSpacing: number;
  captionTextTransform: TextTransform;
  captionTextDecoration: TextDecoration;
  captionTextShadow: boolean;
  captionTextShadowColor: string;
  captionTextShadowBlur: number;
  bgText: string;
  bgTextFontFamily: string;
  bgTextFontSize: number;
  bgTextFontWeight: string;
  bgTextColor: string;
  bgTextOpacity: number;
  bgTextX: number;
  bgTextY: number;
  bgTextRotation: number;
  bgTextRepeat: boolean;
  bgTextLetterSpacing: number;
  bgTextTextTransform: TextTransform;
  bgTextBlendMode: BlendMode;
  timestamp: number;
}

/* ────────────────── Curated Phrasing Libraries ────────────────── */

interface PhraseCategory {
  name: string;
  icon: string;
  titles: string[];
  captions: string[];
}

const PHRASE_LIBRARIES: PhraseCategory[] = [
  {
    name: 'General',
    icon: '⚡',
    titles: ['SCAN ME', 'SCAN FOR INFO', 'POINT YOUR CAMERA', 'DISCOVER MORE', 'QUICK ACCESS'],
    captions: [
      'Point your phone camera to scan',
      'Instant access • No app required',
      'Tap notification banner to open',
      'Scan to explore details',
      'Works with any mobile camera',
    ],
  },
  {
    name: 'Payment & UPI',
    icon: '💳',
    titles: ['SCAN & PAY', 'PAY WITH UPI', 'INSTANT PAYMENT', 'TIP THE TEAM', 'SECURE CHECKOUT'],
    captions: [
      'Accepting GPay, PhonePe, Paytm & UPI',
      'Fast, direct & secure payment',
      'Scan with any UPI application',
      'Instant bank verification',
      'Thank you for your business!',
    ],
  },
  {
    name: 'Wi-Fi & Connect',
    icon: '📶',
    titles: ['GUEST WI-FI', 'CONNECT TO WI-FI', 'FREE HIGH-SPEED WI-FI', 'AUTO-JOIN NETWORK'],
    captions: [
      'Scan to connect automatically',
      'Enjoy complimentary fast internet',
      'No password typing needed',
      'Guest network access',
    ],
  },
  {
    name: 'Social & Web',
    icon: '🌐',
    titles: ['FOLLOW US', 'VISIT OUR WEBSITE', 'CONNECT WITH US', 'JOIN COMMUNITY', 'EXCLUSIVE LINK'],
    captions: [
      'Stay updated with latest news',
      'Follow for daily updates & offers',
      'Join our online community',
      'Browse full catalog online',
    ],
  },
  {
    name: 'Dining & Menu',
    icon: '🍽️',
    titles: ['VIEW DIGITAL MENU', 'TODAY’S SPECIALS', 'ORDER ONLINE', 'RESERVE A TABLE'],
    captions: [
      'Browse our complete fresh menu',
      'Touchless contactless ordering',
      'Daily chef specials & drinks',
      'Rate your dining experience',
    ],
  },
  {
    name: 'Events & Passes',
    icon: '🎟️',
    titles: ['EVENT PASS', 'VIP ENTRY', 'CHECK IN HERE', 'EVENT SCHEDULE', 'DIGITAL TICKET'],
    captions: [
      'Present code at entrance gate',
      'Valid for registered attendee',
      'View agenda & speaker lineup',
      'Save ticket to your device',
    ],
  },
  {
    name: 'Offers & Discounts',
    icon: '🏷️',
    titles: ['SPECIAL DISCOUNT', 'GET 10% OFF', 'CLAIM YOUR REWARD', 'LIMITED TIME OFFER'],
    captions: [
      'Scan to unlock instant coupon',
      'Redeemable on checkout today',
      'Exclusive member perk',
      'Valid while supplies last',
    ],
  },
];

const WATERMARK_PRESETS = [
  { text: 'SCAN ME', tag: 'Action' },
  { text: 'VERIFIED', tag: 'Trust' },
  { text: 'AUTHENTIC', tag: 'Security' },
  { text: 'OFFICIAL', tag: 'Badge' },
  { text: 'CONFIDENTIAL', tag: 'Privacy' },
  { text: 'VIP ACCESS', tag: 'Tier' },
  { text: 'ORIGINAL', tag: 'Quality' },
  { text: '★ ★ ★', tag: 'Icon' },
  { text: 'LIMITED', tag: 'Rare' },
  { text: 'SAMPLE', tag: 'Demo' },
];

const QUICK_ROTATIONS = [-45, -30, 0, 30, 45, 90];

const PRESET_CATEGORIES: TextPresetCategory[] = [
  'All',
  'Trending',
  'Corporate',
  'Luxury',
  'Neon',
  'Retro',
  'Minimal',
  'Creative',
];

/* ────────────────── Helpers ────────────────── */

const pick = <T,>(arr: readonly T[] | T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const randColor = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');

/* ────────────────── Main TextTab Component ────────────────── */

export default function TextTab() {
  const store = useQRStore();
  const {
    title,
    titleFontFamily,
    titleFontSize,
    titleFontWeight,
    titleColor,
    titleAlign,
    titleSpacing,
    titleLetterSpacing,
    titleTextTransform,
    titleTextDecoration,
    titleTextShadow,
    titleTextShadowColor,
    titleTextShadowBlur,
    caption,
    captionFontFamily,
    captionFontSize,
    captionFontWeight,
    captionColor,
    captionAlign,
    captionSpacing,
    captionLetterSpacing,
    captionTextTransform,
    captionTextDecoration,
    captionTextShadow,
    captionTextShadowColor,
    captionTextShadowBlur,
    bgText,
    bgTextFontFamily,
    bgTextFontSize,
    bgTextFontWeight,
    bgTextColor,
    bgTextOpacity,
    bgTextX,
    bgTextY,
    bgTextRotation,
    bgTextRepeat,
    bgTextLetterSpacing,
    bgTextTextTransform,
    bgTextBlendMode,
    fgColor,
    bgColor,
    set,
  } = store;

  // Sub-tab navigation & filtering
  const [activeSubTab, setActiveSubTab] = useState<TextSubTab>('presets');
  const [activePresetName, setActivePresetName] = useState<string | null>(null);
  const [presetCategory, setPresetCategory] = useState<TextPresetCategory>('All');
  const [presetSearch, setPresetSearch] = useState('');
  const [selectedPhraseCat, setSelectedPhraseCat] = useState<string>('General');
  const [isShaking, setIsShaking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);

  // Favorites & Saved in LocalStorage
  const [savedConfigs, setSavedConfigs] = useState<SavedTextConfig[]>([]);

  // Check for EyeDropper API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

  // Load saved text favorites
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qr_text_favorites');
      if (stored) setSavedConfigs(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  // Toast feedback trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  /* ── Filtered Style Presets ── */
  const filteredPresets = useMemo(() => {
    return TEXT_PRESETS.filter((p) => {
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

  /* ── Eyedropper Color Picker ── */
  const pickScreenColor = async (target: 'title' | 'caption' | 'watermark' | 'titleShadow' | 'captionShadow') => {
    if (!hasEyeDropper) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        const color = result.sRGBHex.toUpperCase();
        if (target === 'title') set({ titleColor: color });
        else if (target === 'caption') set({ captionColor: color });
        else if (target === 'watermark') set({ bgTextColor: color });
        else if (target === 'titleShadow') set({ titleTextShadowColor: color + '60', titleTextShadow: true });
        else if (target === 'captionShadow') set({ captionTextShadowColor: color + '60', captionTextShadow: true });
        showToast(`Picked ${color}`);
      }
    } catch {
      // User cancelled picker
    }
  };

  /* ── Sync Text Colors with QR Code ── */
  const syncWithQRTheme = () => {
    set({
      titleColor: fgColor,
      captionColor: fgColor,
      bgTextColor: fgColor,
    });
    showToast('Synced text colors with QR code!');
  };

  /* ── Smart Randomizer (Coordinated Typography Mix) ── */
  const randomizeAll = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    const randomPreset = pick(TEXT_PRESETS);
    const words = ['SCAN ME', 'VERIFIED', 'AUTHENTIC', 'VIP PASS', '★ ★ ★', 'ORIGINAL', '///', 'LIMITED'];

    set({
      title: title.trim() ? title : 'SCAN ME',
      titleFontFamily: randomPreset.titleFontFamily,
      titleFontSize: rand(18, 30),
      titleFontWeight: randomPreset.titleFontWeight,
      titleColor: randomPreset.titleColor || randColor(),
      titleAlign: 'center',
      titleLetterSpacing: rand(0.5, 4),
      titleTextTransform: randomPreset.titleTextTransform,
      titleTextDecoration: randomPreset.titleTextDecoration,
      titleSpacing: rand(8, 20),
      titleTextShadow: Math.random() > 0.6,
      titleTextShadowColor: randColor() + '40',
      titleTextShadowBlur: rand(4, 12),

      caption: caption.trim() ? caption : 'Point your phone camera here',
      captionFontFamily: randomPreset.captionFontFamily,
      captionFontSize: rand(11, 15),
      captionFontWeight: randomPreset.captionFontWeight,
      captionColor: randomPreset.captionColor || randColor(),
      captionAlign: 'center',
      captionLetterSpacing: rand(0, 2),
      captionTextTransform: randomPreset.captionTextTransform,
      captionTextDecoration: 'none',
      captionSpacing: rand(8, 16),
      captionTextShadow: false,

      bgText: bgText.trim() ? bgText : pick(words),
      bgTextFontFamily: randomPreset.titleFontFamily,
      bgTextFontSize: rand(36, 72),
      bgTextFontWeight: '700',
      bgTextColor: randColor(),
      bgTextOpacity: rand(0.04, 0.12),
      bgTextRotation: pick([-45, -30, 0, 30, 45]),
      bgTextRepeat: Math.random() > 0.5,
      bgTextX: 50,
      bgTextY: 50,
      bgTextLetterSpacing: rand(0, 8),
      bgTextTextTransform: 'uppercase',
      bgTextBlendMode: 'normal',
    });

    setActivePresetName(null);
    showToast('Generated harmonious typography mix!');
  }, [title, caption, bgText, set]);

  /* ── Apply Style Preset ── */
  const applyPreset = useCallback(
    (preset: TextPreset) => {
      set({
        title: title || 'SCAN ME',
        titleFontFamily: preset.titleFontFamily,
        titleFontSize: preset.titleFontSize,
        titleFontWeight: preset.titleFontWeight,
        titleColor: preset.titleColor,
        titleTextTransform: preset.titleTextTransform,
        titleLetterSpacing: preset.titleLetterSpacing,
        titleTextDecoration: preset.titleTextDecoration,
        titleAlign: preset.titleAlign ?? 'center',
        titleSpacing: preset.titleSpacing ?? 14,
        titleTextShadow: preset.titleTextShadow ?? false,
        titleTextShadowColor: preset.titleTextShadowColor ?? '#00000040',
        titleTextShadowBlur: preset.titleTextShadowBlur ?? 6,

        caption: caption || 'Point your camera here',
        captionFontFamily: preset.captionFontFamily,
        captionFontSize: preset.captionFontSize,
        captionFontWeight: preset.captionFontWeight,
        captionColor: preset.captionColor,
        captionTextTransform: preset.captionTextTransform,
        captionLetterSpacing: preset.captionLetterSpacing,
        captionTextDecoration: preset.captionTextDecoration ?? 'none',
        captionAlign: preset.captionAlign ?? 'center',
        captionSpacing: preset.captionSpacing ?? 12,
        captionTextShadow: preset.captionTextShadow ?? false,
        captionTextShadowColor: preset.captionTextShadowColor ?? '#00000040',
        captionTextShadowBlur: preset.captionTextShadowBlur ?? 4,
      });

      if (preset.bgText && !bgText) {
        set({
          bgText: preset.bgText,
          bgTextOpacity: preset.bgTextOpacity ?? 0.06,
        });
      }

      setActivePresetName(preset.name);
      showToast(`Applied preset: ${preset.name}`);
    },
    [title, caption, bgText, set]
  );

  /* ── Reset Text Styles ── */
  const resetAllText = useCallback(() => {
    setActivePresetName(null);
    set({
      title: '',
      titleFontFamily: 'Inter',
      titleFontSize: 20,
      titleFontWeight: '600',
      titleColor: '#1a1a1a',
      titleAlign: 'center',
      titleSpacing: 12,
      titleLetterSpacing: 0,
      titleTextTransform: 'none',
      titleTextDecoration: 'none',
      titleTextShadow: false,
      titleTextShadowColor: '#00000040',
      titleTextShadowBlur: 4,

      caption: '',
      captionFontFamily: 'Inter',
      captionFontSize: 14,
      captionFontWeight: '400',
      captionColor: '#666666',
      captionAlign: 'center',
      captionSpacing: 12,
      captionLetterSpacing: 0,
      captionTextTransform: 'none',
      captionTextDecoration: 'none',
      captionTextShadow: false,
      captionTextShadowColor: '#00000040',
      captionTextShadowBlur: 4,

      bgText: '',
      bgTextFontFamily: 'Inter',
      bgTextFontSize: 48,
      bgTextFontWeight: '400',
      bgTextColor: '#000000',
      bgTextOpacity: 0.06,
      bgTextX: 50,
      bgTextY: 50,
      bgTextRotation: -30,
      bgTextRepeat: false,
      bgTextLetterSpacing: 0,
      bgTextTextTransform: 'none',
      bgTextBlendMode: 'normal',
    });
    showToast('Reset all text & overlays');
  }, [set]);

  /* ── Save Current Typography Configuration ── */
  const saveCurrentConfig = () => {
    const newConfig: SavedTextConfig = {
      id: `${Date.now()}`,
      name: title.trim() ? `Text: ${title.slice(0, 16)}` : `Custom Text ${savedConfigs.length + 1}`,
      title,
      titleFontFamily,
      titleFontSize,
      titleFontWeight,
      titleColor,
      titleAlign,
      titleSpacing,
      titleLetterSpacing,
      titleTextTransform,
      titleTextDecoration,
      titleTextShadow,
      titleTextShadowColor,
      titleTextShadowBlur,
      caption,
      captionFontFamily,
      captionFontSize,
      captionFontWeight,
      captionColor,
      captionAlign,
      captionSpacing,
      captionLetterSpacing,
      captionTextTransform,
      captionTextDecoration,
      captionTextShadow,
      captionTextShadowColor,
      captionTextShadowBlur,
      bgText,
      bgTextFontFamily,
      bgTextFontSize,
      bgTextFontWeight,
      bgTextColor,
      bgTextOpacity,
      bgTextX,
      bgTextY,
      bgTextRotation,
      bgTextRepeat,
      bgTextLetterSpacing,
      bgTextTextTransform,
      bgTextBlendMode,
      timestamp: Date.now(),
    };
    const updated = [newConfig, ...savedConfigs];
    setSavedConfigs(updated);
    try {
      localStorage.setItem('qr_text_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Saved typography setup to favorites!');
  };

  const deleteSavedConfig = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedConfigs.filter((c) => c.id !== id);
    setSavedConfigs(updated);
    try {
      localStorage.setItem('qr_text_favorites', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Saved typography removed');
  };

  const applySavedConfig = (s: SavedTextConfig) => {
    set({
      title: s.title,
      titleFontFamily: s.titleFontFamily,
      titleFontSize: s.titleFontSize,
      titleFontWeight: s.titleFontWeight,
      titleColor: s.titleColor,
      titleAlign: s.titleAlign,
      titleSpacing: s.titleSpacing,
      titleLetterSpacing: s.titleLetterSpacing,
      titleTextTransform: s.titleTextTransform,
      titleTextDecoration: s.titleTextDecoration,
      titleTextShadow: s.titleTextShadow,
      titleTextShadowColor: s.titleTextShadowColor,
      titleTextShadowBlur: s.titleTextShadowBlur,
      caption: s.caption,
      captionFontFamily: s.captionFontFamily,
      captionFontSize: s.captionFontSize,
      captionFontWeight: s.captionFontWeight,
      captionColor: s.captionColor,
      captionAlign: s.captionAlign,
      captionSpacing: s.captionSpacing,
      captionLetterSpacing: s.captionLetterSpacing,
      captionTextTransform: s.captionTextTransform,
      captionTextDecoration: s.captionTextDecoration,
      captionTextShadow: s.captionTextShadow,
      captionTextShadowColor: s.captionTextShadowColor,
      captionTextShadowBlur: s.captionTextShadowBlur,
      bgText: s.bgText,
      bgTextFontFamily: s.bgTextFontFamily,
      bgTextFontSize: s.bgTextFontSize,
      bgTextFontWeight: s.bgTextFontWeight,
      bgTextColor: s.bgTextColor,
      bgTextOpacity: s.bgTextOpacity,
      bgTextX: s.bgTextX,
      bgTextY: s.bgTextY,
      bgTextRotation: s.bgTextRotation,
      bgTextRepeat: s.bgTextRepeat,
      bgTextLetterSpacing: s.bgTextLetterSpacing,
      bgTextTextTransform: s.bgTextTextTransform,
      bgTextBlendMode: s.bgTextBlendMode,
    });
    setActivePresetName(null);
    showToast(`Loaded: ${s.name}`);
  };

  /* ── Copy CSS rules ── */
  const copyTypographyCSS = () => {
    const css = [
      title.trim()
        ? `/* QR Title */\n.qr-title {\n  font-family: "${titleFontFamily}";\n  font-size: ${titleFontSize}px;\n  font-weight: ${titleFontWeight};\n  color: ${titleColor};\n  text-align: ${titleAlign};\n  letter-spacing: ${titleLetterSpacing}px;\n  margin-bottom: ${titleSpacing}px;\n${
            titleTextTransform !== 'none' ? `  text-transform: ${titleTextTransform};\n` : ''
          }${titleTextDecoration !== 'none' ? `  text-decoration: ${titleTextDecoration};\n` : ''}${
            titleTextShadow ? `  text-shadow: 0 2px ${titleTextShadowBlur}px ${titleTextShadowColor};\n` : ''
          }}`
        : null,
      caption.trim()
        ? `/* QR Caption */\n.qr-caption {\n  font-family: "${captionFontFamily}";\n  font-size: ${captionFontSize}px;\n  font-weight: ${captionFontWeight};\n  color: ${captionColor};\n  text-align: ${captionAlign};\n  letter-spacing: ${captionLetterSpacing}px;\n  margin-top: ${captionSpacing}px;\n${
            captionTextTransform !== 'none' ? `  text-transform: ${captionTextTransform};\n` : ''
          }${captionTextDecoration !== 'none' ? `  text-decoration: ${captionTextDecoration};\n` : ''}${
            captionTextShadow ? `  text-shadow: 0 2px ${captionTextShadowBlur}px ${captionTextShadowColor};\n` : ''
          }}`
        : null,
    ]
      .filter(Boolean)
      .join('\n\n');

    if (!css) {
      showToast('Enter title or caption first');
      return;
    }

    navigator.clipboard.writeText(css);
    showToast('Typography CSS copied!');
  };

  /* ── Copy JSON Config ── */
  const copyTypographyJSON = () => {
    const json = JSON.stringify(
      {
        title: {
          text: title,
          fontFamily: titleFontFamily,
          fontSize: titleFontSize,
          fontWeight: titleFontWeight,
          color: titleColor,
          align: titleAlign,
          spacing: titleSpacing,
          letterSpacing: titleLetterSpacing,
          textTransform: titleTextTransform,
          textDecoration: titleTextDecoration,
          textShadow: titleTextShadow ? { color: titleTextShadowColor, blur: titleTextShadowBlur } : null,
        },
        caption: {
          text: caption,
          fontFamily: captionFontFamily,
          fontSize: captionFontSize,
          fontWeight: captionFontWeight,
          color: captionColor,
          align: captionAlign,
          spacing: captionSpacing,
          letterSpacing: captionLetterSpacing,
          textTransform: captionTextTransform,
          textDecoration: captionTextDecoration,
          textShadow: captionTextShadow ? { color: captionTextShadowColor, blur: captionTextShadowBlur } : null,
        },
        watermark: {
          text: bgText,
          fontFamily: bgTextFontFamily,
          fontSize: bgTextFontSize,
          fontWeight: bgTextFontWeight,
          color: bgTextColor,
          opacity: bgTextOpacity,
          rotation: bgTextRotation,
          repeat: bgTextRepeat,
          blendMode: bgTextBlendMode,
        },
      },
      null,
      2
    );

    navigator.clipboard.writeText(json);
    showToast('Typography JSON config copied!');
  };

  /* ── Quick Alignment Buttons ── */
  const alignButtons = (current: TextAlign, onChange: (v: TextAlign) => void) => (
    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-[var(--color-border)]">
      {(
        [
          { id: 'left' as TextAlign, label: 'Left', icon: <AlignLeft className="w-3.5 h-3.5" /> },
          { id: 'center' as TextAlign, label: 'Center', icon: <AlignCenter className="w-3.5 h-3.5" /> },
          { id: 'right' as TextAlign, label: 'Right', icon: <AlignRight className="w-3.5 h-3.5" /> },
        ] as const
      ).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            current === item.id
              ? 'bg-white dark:bg-black text-[var(--color-secondary)] shadow-xs'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
          title={item.label}
        >
          {item.icon}
          <span className="text-[10px] hidden sm:inline">{item.label}</span>
        </button>
      ))}
    </div>
  );

  /* ── Quick Case Transform Buttons ── */
  const transformButtons = (current: TextTransform, onChange: (v: TextTransform) => void) => (
    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-[var(--color-border)] gap-1">
      {TEXT_TRANSFORMS.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`flex-1 py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
            current === item.value
              ? 'bg-white dark:bg-black text-[var(--color-secondary)] shadow-xs'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );

  /* ── Quick Decoration Buttons ── */
  const decorationButtons = (current: TextDecoration, onChange: (v: TextDecoration) => void) => (
    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-[var(--color-border)] gap-1">
      {TEXT_DECORATIONS.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`flex-1 py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
            current === item.value
              ? 'bg-white dark:bg-black text-[var(--color-secondary)] shadow-xs'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );

  /* ── Reusable Slider Section ── */
  const slider = (
    label: string,
    value: number,
    min: number,
    max: number,
    onChange: (v: number) => void,
    unit = 'px',
    step = 1
  ) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
        <span>{label}</span>
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

  /* ── Color Input Field ── */
  const colorField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    target: 'title' | 'caption' | 'watermark' | 'titleShadow' | 'captionShadow'
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">{label}</span>
        {hasEyeDropper && (
          <button
            type="button"
            onClick={() => pickScreenColor(target)}
            title="Pick color from screen"
            className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-secondary)] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Pipette className="w-3 h-3" />
            Eyedropper
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
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
          onChange={(e) => {
            let v = e.target.value;
            if (!v.startsWith('#') && v.length > 0) v = `#${v}`;
            onChange(v);
          }}
          className="flex-1 px-3 py-1.5 text-xs font-mono font-bold border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
        />
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${isShaking ? 'animate-shake' : ''}`}>
      {/* ── Sub-Tab Segmented Controller ── */}
      <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl border border-[var(--color-border)] gap-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('presets')}
          className={`flex-1 min-w-[70px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'presets'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-500 dark:text-yellow-400" />
          Presets
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('title')}
          className={`flex-1 min-w-[70px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'title'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          Header
          {title.trim().length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('caption')}
          className={`flex-1 min-w-[70px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'caption'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Baseline className="w-3.5 h-3.5" />
          Caption
          {caption.trim().length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('watermark')}
          className={`flex-1 min-w-[70px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
            activeSubTab === 'watermark'
              ? 'bg-white dark:bg-black text-[var(--color-text)] shadow-xs font-extrabold'
              : 'text-gray-500 dark:text-gray-400 hover:text-[var(--color-text)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          Overlay
          {bgText.trim().length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('saved')}
          className={`flex-1 min-w-[70px] py-2 px-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
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

      {/* ── Top Typography Overview & Quick Actions Bar ── */}
      <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-gray-50/70 dark:bg-white/5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[var(--color-secondary)]" />
            Active Typography
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={syncWithQRTheme}
              title="Match text colors to QR foreground theme"
              className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-secondary)] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Palette className="w-3 h-3" />
              Sync Theme
            </button>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <button
              type="button"
              onClick={saveCurrentConfig}
              title="Save current typography to favorites"
              className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-secondary)] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Bookmark className="w-3 h-3" />
              Save
            </button>
          </div>
        </div>

        {/* Live Typography Micro-Card */}
        <div className="p-3 bg-white dark:bg-black/30 rounded-xl border border-[var(--color-border)] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">Header:</span>
              <span
                className="text-xs font-bold truncate"
                style={{
                  fontFamily: titleFontFamily,
                  color: titleColor,
                  textTransform: titleTextTransform === 'none' ? undefined : titleTextTransform,
                }}
              >
                {title.trim() ? title : <span className="opacity-40 italic">None</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">Caption:</span>
              <span
                className="text-xs truncate"
                style={{
                  fontFamily: captionFontFamily,
                  color: captionColor,
                  textTransform: captionTextTransform === 'none' ? undefined : captionTextTransform,
                }}
              >
                {caption.trim() ? caption : <span className="opacity-40 italic">None</span>}
              </span>
            </div>
            {bgText.trim() && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-gray-400">Overlay:</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  {bgText} ({Math.round(bgTextOpacity * 100)}%)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={randomizeAll}
              title="Randomize typography & overlays"
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-[var(--color-secondary)]/10 hover:text-[var(--color-secondary)] text-gray-600 dark:text-gray-300 transition-all active:scale-90 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetAllText}
              title="Clear all text elements"
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 text-gray-600 dark:text-gray-300 transition-all active:scale-90 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────── SUB-TAB 1: STYLE PRESETS ────────────────── */}
      {activeSubTab === 'presets' && (
        <div className="space-y-5 animate-fade-in-up">
          {/* Preset Category Filter */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setPresetCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  presetCategory === cat
                    ? 'bg-[var(--color-secondary)] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={presetSearch}
              onChange={(e) => setPresetSearch(e.target.value)}
              placeholder="Search typography style or mood..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-[var(--color-border)] rounded-xl bg-[var(--color-background)] text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            />
            {presetSearch && (
              <button
                type="button"
                onClick={() => setPresetSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPresets.map((p) => {
              const isSelected = activePresetName === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 group relative cursor-pointer active:scale-98 ${
                    isSelected
                      ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/5 shadow-sm'
                      : 'border-[var(--color-border)] bg-white dark:bg-white/5 hover:border-[var(--color-secondary)]/40 hover:bg-gray-50 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xl group-hover:scale-110 transition-transform">{p.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-[var(--color-text)]">{p.name}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">
                          {p.description}
                        </div>
                      </div>
                    </div>
                    {p.tag && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                        {p.tag}
                      </span>
                    )}
                  </div>

                  {/* Typography Live Card Preview */}
                  <div className="w-full p-2 rounded-xl bg-gray-50 dark:bg-black/30 border border-[var(--color-border)] text-center space-y-0.5">
                    <div
                      className="text-xs font-bold truncate"
                      style={{
                        fontFamily: p.titleFontFamily,
                        color: p.titleColor,
                        textTransform: p.titleTextTransform === 'none' ? undefined : p.titleTextTransform,
                        letterSpacing: `${p.titleLetterSpacing}px`,
                      }}
                    >
                      Scan Me
                    </div>
                    <div
                      className="text-[10px] truncate opacity-80"
                      style={{
                        fontFamily: p.captionFontFamily,
                        color: p.captionColor,
                        textTransform: p.captionTextTransform === 'none' ? undefined : p.captionTextTransform,
                        letterSpacing: `${p.captionLetterSpacing}px`,
                      }}
                    >
                      Point camera here
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 2: HEADER TITLE ────────────────── */}
      {activeSubTab === 'title' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Title Input Card */}
          <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-gray-50/70 dark:bg-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Header Text
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono opacity-50">{title.length} chars</span>
                {title.length > 0 && (
                  <button
                    type="button"
                    onClick={() => set({ title: '' })}
                    className="text-[10px] text-red-500 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="e.g. SCAN ME, CONNECT TO WI-FI..."
                className="w-full px-3.5 py-2.5 text-sm font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/40 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-secondary)] shadow-xs"
              />
            </div>
          </div>

          {/* Quick Phrasing Ideas by Intent */}
          <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-white dark:bg-white/5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Quick Header Ideas
              </span>
              <div className="flex gap-1 overflow-x-auto scrollbar-none max-w-[200px]">
                {PHRASE_LIBRARIES.map((lib) => (
                  <button
                    key={lib.name}
                    type="button"
                    onClick={() => setSelectedPhraseCat(lib.name)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedPhraseCat === lib.name
                        ? 'bg-[var(--color-secondary)] text-white'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-[var(--color-text)]'
                    }`}
                  >
                    {lib.icon} {lib.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PHRASE_LIBRARIES.find((lib) => lib.name === selectedPhraseCat)?.titles.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    set({ title: t });
                    showToast(`Inserted: ${t}`);
                  }}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-[var(--color-secondary)]/15 hover:text-[var(--color-secondary)] border border-transparent hover:border-[var(--color-secondary)]/30 transition-all cursor-pointer active:scale-95"
                >
                  + {t}
                </button>
              ))}
            </div>
          </div>

          {/* Typography Controls */}
          <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-gray-50/70 dark:bg-white/5 space-y-4">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block">
              Typography & Style
            </span>

            {/* Font & Weight Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                  Font Family
                </label>
                <select
                  value={titleFontFamily}
                  onChange={(e) => set({ titleFontFamily: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/40 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-secondary)] cursor-pointer"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                  Weight
                </label>
                <select
                  value={titleFontWeight}
                  onChange={(e) => set({ titleFontWeight: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/40 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-secondary)] cursor-pointer"
                >
                  {FONT_WEIGHTS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label} ({w.value})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Size & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-4 items-end">
              {slider('Font Size', titleFontSize, 8, 48, (v) => set({ titleFontSize: v }), 'px')}
              {colorField('Title Color', titleColor, (v) => set({ titleColor: v }), 'title')}
            </div>

            {/* Alignment */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                Alignment
              </label>
              {alignButtons(titleAlign, (v) => set({ titleAlign: v }))}
            </div>

            {/* Spacing Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slider('Letter Spacing', titleLetterSpacing, 0, 16, (v) => set({ titleLetterSpacing: v }), 'px', 0.5)}
              {slider('Gap Above QR', titleSpacing, 0, 40, (v) => set({ titleSpacing: v }), 'px')}
            </div>

            {/* Text Case & Decoration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                  Text Case
                </label>
                {transformButtons(titleTextTransform, (v) => set({ titleTextTransform: v }))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                  Decoration
                </label>
                {decorationButtons(titleTextDecoration, (v) => set({ titleTextDecoration: v }))}
              </div>
            </div>

            {/* Text Shadow Card */}
            <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-white dark:bg-black/30 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    Header Glow & Shadow
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={titleTextShadow}
                  onChange={(e) => set({ titleTextShadow: e.target.checked })}
                  className="w-4 h-4 accent-[var(--color-secondary)] cursor-pointer"
                />
              </label>

              {titleTextShadow && (
                <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-4 pt-2 border-t border-[var(--color-border)]">
                  {slider('Shadow Blur', titleTextShadowBlur, 0, 24, (v) => set({ titleTextShadowBlur: v }), 'px')}
                  {colorField(
                    'Shadow Tint',
                    titleTextShadowColor.slice(0, 7),
                    (v) => set({ titleTextShadowColor: v + '60' }),
                    'titleShadow'
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 3: FOOTER CAPTION ────────────────── */}
      {activeSubTab === 'caption' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Caption Input Card */}
          <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-gray-50/70 dark:bg-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Footer Caption
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono opacity-50">{caption.length} chars</span>
                {caption.length > 0 && (
                  <button
                    type="button"
                    onClick={() => set({ caption: '' })}
                    className="text-[10px] text-red-500 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={caption}
                onChange={(e) => set({ caption: e.target.value })}
                placeholder="e.g. Point your camera to scan..."
                className="w-full px-3.5 py-2.5 text-sm font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/40 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-secondary)] shadow-xs"
              />
            </div>
          </div>

          {/* Quick Phrasing Ideas by Intent */}
          <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-white dark:bg-white/5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Quick Caption Ideas
              </span>
              <div className="flex gap-1 overflow-x-auto scrollbar-none max-w-[200px]">
                {PHRASE_LIBRARIES.map((lib) => (
                  <button
                    key={lib.name}
                    type="button"
                    onClick={() => setSelectedPhraseCat(lib.name)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      selectedPhraseCat === lib.name
                        ? 'bg-[var(--color-secondary)] text-white'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-[var(--color-text)]'
                    }`}
                  >
                    {lib.icon} {lib.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {PHRASE_LIBRARIES.find((lib) => lib.name === selectedPhraseCat)?.captions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    set({ caption: c });
                    showToast(`Inserted caption`);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-[var(--color-secondary)]/15 hover:text-[var(--color-secondary)] text-left border border-transparent hover:border-[var(--color-secondary)]/30 transition-all cursor-pointer active:scale-98"
                >
                  + {c}
                </button>
              ))}
            </div>
          </div>

          {/* Typography Controls */}
          <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-gray-50/70 dark:bg-white/5 space-y-4">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block">
              Caption Style
            </span>

            {/* Font & Weight Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                  Font Family
                </label>
                <select
                  value={captionFontFamily}
                  onChange={(e) => set({ captionFontFamily: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/40 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-secondary)] cursor-pointer"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                  Weight
                </label>
                <select
                  value={captionFontWeight}
                  onChange={(e) => set({ captionFontWeight: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/40 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-secondary)] cursor-pointer"
                >
                  {FONT_WEIGHTS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label} ({w.value})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Size & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-4 items-end">
              {slider('Font Size', captionFontSize, 8, 36, (v) => set({ captionFontSize: v }), 'px')}
              {colorField('Caption Color', captionColor, (v) => set({ captionColor: v }), 'caption')}
            </div>

            {/* Alignment */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                Alignment
              </label>
              {alignButtons(captionAlign, (v) => set({ captionAlign: v }))}
            </div>

            {/* Spacing Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slider('Letter Spacing', captionLetterSpacing, 0, 16, (v) => set({ captionLetterSpacing: v }), 'px', 0.5)}
              {slider('Gap Below QR', captionSpacing, 0, 40, (v) => set({ captionSpacing: v }), 'px')}
            </div>

            {/* Text Case & Decoration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                  Text Case
                </label>
                {transformButtons(captionTextTransform, (v) => set({ captionTextTransform: v }))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                  Decoration
                </label>
                {decorationButtons(captionTextDecoration, (v) => set({ captionTextDecoration: v }))}
              </div>
            </div>

            {/* Caption Shadow Card */}
            <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-white dark:bg-black/30 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    Caption Glow & Shadow
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={captionTextShadow}
                  onChange={(e) => set({ captionTextShadow: e.target.checked })}
                  className="w-4 h-4 accent-[var(--color-secondary)] cursor-pointer"
                />
              </label>

              {captionTextShadow && (
                <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-4 pt-2 border-t border-[var(--color-border)]">
                  {slider('Shadow Blur', captionTextShadowBlur, 0, 24, (v) => set({ captionTextShadowBlur: v }), 'px')}
                  {colorField(
                    'Shadow Tint',
                    captionTextShadowColor.slice(0, 7),
                    (v) => set({ captionTextShadowColor: v + '60' }),
                    'captionShadow'
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB 4: BACKGROUND WATERMARK OVERLAY ────────────────── */}
      {activeSubTab === 'watermark' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Watermark Input Card */}
          <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-gray-50/70 dark:bg-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Watermark Message
              </label>
              {bgText && (
                <button
                  type="button"
                  onClick={() => set({ bgText: '' })}
                  className="text-[10px] text-red-500 hover:underline cursor-pointer"
                >
                  Clear Overlay
                </button>
              )}
            </div>

            <input
              type="text"
              value={bgText}
              onChange={(e) => set({ bgText: e.target.value })}
              placeholder="e.g. VERIFIED, AUTHENTIC, CONFIDENTIAL..."
              className="w-full px-3.5 py-2.5 text-sm font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/40 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-secondary)] shadow-xs"
            />
          </div>

          {/* Quick Watermark Badges */}
          <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-white dark:bg-white/5 space-y-2.5 shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Quick Badge Stamps
            </span>
            <div className="flex flex-wrap gap-1.5">
              {WATERMARK_PRESETS.map((item) => (
                <button
                  key={item.text}
                  type="button"
                  onClick={() => {
                    set({ bgText: item.text });
                    showToast(`Stamped: ${item.text}`);
                  }}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-[var(--color-secondary)]/15 hover:text-[var(--color-secondary)] border border-transparent hover:border-[var(--color-secondary)]/30 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  <span>{item.text}</span>
                  <span className="text-[9px] font-normal opacity-50">({item.tag})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Watermark Detailed Controls */}
          {bgText.trim().length > 0 && (
            <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-gray-50/70 dark:bg-white/5 space-y-4">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block">
                Overlay Appearance
              </span>

              {/* Pattern Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-white dark:bg-black/30 rounded-xl border border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Repeating Matrix Pattern
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Tiles watermark across entire background
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={bgTextRepeat}
                  onChange={(e) => set({ bgTextRepeat: e.target.checked })}
                  className="w-4 h-4 accent-[var(--color-secondary)] cursor-pointer"
                />
              </div>

              {/* Quick Rotation Angle Chips */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                  Quick Angle Preset
                </label>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                  {QUICK_ROTATIONS.map((angle) => (
                    <button
                      key={angle}
                      type="button"
                      onClick={() => set({ bgTextRotation: angle })}
                      className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                        bgTextRotation === angle
                          ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
                          : 'border-[var(--color-border)] bg-white dark:bg-black/40 hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: Opacity & Free Rotation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slider('Opacity', Math.round(bgTextOpacity * 100), 1, 50, (v) => set({ bgTextOpacity: v / 100 }), '%')}
                {slider('Angle Rotation', bgTextRotation, -180, 180, (v) => set({ bgTextRotation: v }), '°')}
              </div>

              {/* Positioning (if not repeating) */}
              {!bgTextRepeat && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {slider('Horizontal X', bgTextX, 0, 100, (v) => set({ bgTextX: v }), '%')}
                  {slider('Vertical Y', bgTextY, 0, 100, (v) => set({ bgTextY: v }), '%')}
                </div>
              )}

              {/* Font Family & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                    Font Family
                  </label>
                  <select
                    value={bgTextFontFamily}
                    onChange={(e) => set({ bgTextFontFamily: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/40 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-secondary)] cursor-pointer"
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f} value={f} style={{ fontFamily: f }}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                    Blend Mode
                  </label>
                  <select
                    value={bgTextBlendMode}
                    onChange={(e) => set({ bgTextBlendMode: e.target.value as BlendMode })}
                    className="w-full px-3 py-2 text-xs font-bold border border-[var(--color-border)] rounded-xl bg-white dark:bg-black/40 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-secondary)] cursor-pointer"
                  >
                    {BLEND_MODES.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Size & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-4 items-end">
                {slider('Font Size', bgTextFontSize, 12, 120, (v) => set({ bgTextFontSize: v }), 'px')}
                {colorField('Overlay Color', bgTextColor, (v) => set({ bgTextColor: v }), 'watermark')}
              </div>

              {/* Letter spacing & text transform */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slider('Letter Spacing', bgTextLetterSpacing, 0, 20, (v) => set({ bgTextLetterSpacing: v }), 'px', 0.5)}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                    Transform
                  </label>
                  {transformButtons(bgTextTextTransform, (v) => set({ bgTextTextTransform: v }))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SUB-TAB 5: SAVED / FAVORITES ────────────────── */}
      {activeSubTab === 'saved' && (
        <div className="space-y-5 animate-fade-in-up">
          {/* Quick Actions Header */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-[var(--color-border)]">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {savedConfigs.length} Saved {savedConfigs.length === 1 ? 'Setup' : 'Setups'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyTypographyCSS}
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-all cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                Copy CSS
              </button>
              <button
                type="button"
                onClick={copyTypographyJSON}
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-all cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                Copy JSON
              </button>
            </div>
          </div>

          {savedConfigs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--color-border)] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 mx-auto flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--color-text)]">No Saved Typography Yet</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Customize your header title, footer caption, or watermark overlay and click &quot;Save&quot; to bookmark it.
                </p>
              </div>
              <button
                type="button"
                onClick={saveCurrentConfig}
                className="px-4 py-2 rounded-xl bg-[var(--color-secondary)] text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Save Current Typography
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedConfigs.map((cfg) => (
                <div
                  key={cfg.id}
                  onClick={() => applySavedConfig(cfg)}
                  className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-white dark:bg-white/5 hover:border-[var(--color-secondary)]/50 transition-all flex flex-col justify-between gap-3 group relative cursor-pointer active:scale-98 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--color-text)] line-clamp-1">{cfg.name}</h4>
                      <p className="text-[10px] text-gray-400">
                        {new Date(cfg.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => deleteSavedConfig(cfg.id, e)}
                      title="Remove from favorites"
                      className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Visual preview card */}
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-black/30 border border-[var(--color-border)] text-center space-y-1">
                    {cfg.title ? (
                      <div
                        className="text-xs font-bold truncate"
                        style={{
                          fontFamily: cfg.titleFontFamily,
                          color: cfg.titleColor,
                          textTransform: cfg.titleTextTransform === 'none' ? undefined : cfg.titleTextTransform,
                        }}
                      >
                        {cfg.title}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 italic">No Title</div>
                    )}

                    {cfg.caption ? (
                      <div
                        className="text-[10px] truncate opacity-80"
                        style={{
                          fontFamily: cfg.captionFontFamily,
                          color: cfg.captionColor,
                          textTransform: cfg.captionTextTransform === 'none' ? undefined : cfg.captionTextTransform,
                        }}
                      >
                        {cfg.caption}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 italic">No Caption</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}