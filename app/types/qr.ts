export type DotType =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'classy'
  | 'classy-rounded'
  | 'extra-rounded';

export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot';
export type BorderType = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
export type ExportFormat = 'png' | 'svg' | 'jpeg' | 'webp';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type TextAlign = 'left' | 'center' | 'right';

export interface GradientConfig {
  type: 'linear' | 'radial';
  rotation: number;
  colorStops: { offset: number; color: string }[];
}

export interface Palette {
  name: string;
  fg: string;
  bg: string;
}

export const PALETTES: Palette[] = [
  { name: 'Classic', fg: '#000000', bg: '#FFFFFF' },
  { name: 'Ocean', fg: '#0C4A6E', bg: '#E0F2FE' },
  { name: 'Sunset', fg: '#9A3412', bg: '#FFF7ED' },
  { name: 'Forest', fg: '#14532D', bg: '#F0FDF4' },
  { name: 'Berry', fg: '#701A75', bg: '#FDF4FF' },
  { name: 'Midnight', fg: '#1E1B4B', bg: '#EEF2FF' },
  { name: 'Rose', fg: '#9F1239', bg: '#FFF1F2' },
  { name: 'Amber', fg: '#78350F', bg: '#FFFBEB' },
  { name: 'Teal', fg: '#134E4A', bg: '#F0FDFA' },
  { name: 'Slate', fg: '#1E293B', bg: '#F8FAFC' },
  { name: 'Neon', fg: '#00FF41', bg: '#0A0A0A' },
  { name: 'Cyber', fg: '#FF00FF', bg: '#0D0221' },
  { name: 'Retro', fg: '#FF6B35', bg: '#FFF8F0' },
  { name: 'Mono', fg: '#333333', bg: '#F5F5F5' },
  { name: 'Coral', fg: '#BE185D', bg: '#FDF2F8' },
  { name: 'Ice', fg: '#155E75', bg: '#ECFEFF' },
];

export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type TextDecoration = 'none' | 'underline' | 'line-through' | 'overline';
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'soft-light' | 'difference';

export const TEXT_TRANSFORMS: { value: TextTransform; label: string; icon: string }[] = [
  { value: 'none', label: 'None', icon: 'Aa' },
  { value: 'uppercase', label: 'Upper', icon: 'AA' },
  { value: 'lowercase', label: 'Lower', icon: 'aa' },
  { value: 'capitalize', label: 'Title', icon: 'Ab' },
];

export const TEXT_DECORATIONS: { value: TextDecoration; label: string; icon: string }[] = [
  { value: 'none', label: 'None', icon: 'T' },
  { value: 'underline', label: 'Under', icon: 'T̲' },
  { value: 'line-through', label: 'Strike', icon: 'T̶' },
  { value: 'overline', label: 'Over', icon: 'T̅' },
];

export const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Dodge' },
  { value: 'color-burn', label: 'Burn' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
];

export const FONT_FAMILIES = [
  'Inter',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
  'Palatino Linotype',
  'Lucida Console',
  'Tahoma',
];

export interface TextPreset {
  name: string;
  emoji: string;
  description: string;
  titleFontFamily: string;
  titleFontSize: number;
  titleFontWeight: string;
  titleColor: string;
  titleTextTransform: TextTransform;
  titleLetterSpacing: number;
  titleTextDecoration: TextDecoration;
  captionFontFamily: string;
  captionFontSize: number;
  captionFontWeight: string;
  captionColor: string;
  captionTextTransform: TextTransform;
  captionLetterSpacing: number;
}

export const TEXT_PRESETS: TextPreset[] = [
  {
    name: 'Corporate',
    emoji: '🏢',
    description: 'Clean professional look',
    titleFontFamily: 'Inter',
    titleFontSize: 22,
    titleFontWeight: '700',
    titleColor: '#1a1a1a',
    titleTextTransform: 'uppercase',
    titleLetterSpacing: 3,
    titleTextDecoration: 'none',
    captionFontFamily: 'Inter',
    captionFontSize: 12,
    captionFontWeight: '400',
    captionColor: '#888888',
    captionTextTransform: 'none',
    captionLetterSpacing: 0.5,
  },
  {
    name: 'Playful',
    emoji: '🎨',
    description: 'Fun & vibrant style',
    titleFontFamily: 'Comic Sans MS',
    titleFontSize: 26,
    titleFontWeight: '700',
    titleColor: '#E040FB',
    titleTextTransform: 'none',
    titleLetterSpacing: 1,
    titleTextDecoration: 'none',
    captionFontFamily: 'Trebuchet MS',
    captionFontSize: 14,
    captionFontWeight: '500',
    captionColor: '#FF6D00',
    captionTextTransform: 'capitalize',
    captionLetterSpacing: 0,
  },
  {
    name: 'Elegant',
    emoji: '✨',
    description: 'Sophisticated serif',
    titleFontFamily: 'Georgia',
    titleFontSize: 24,
    titleFontWeight: '400',
    titleColor: '#2C1810',
    titleTextTransform: 'capitalize',
    titleLetterSpacing: 2,
    titleTextDecoration: 'none',
    captionFontFamily: 'Palatino Linotype',
    captionFontSize: 13,
    captionFontWeight: '400',
    captionColor: '#6B4226',
    captionTextTransform: 'none',
    captionLetterSpacing: 0.5,
  },
  {
    name: 'Neon',
    emoji: '💫',
    description: 'Bold glowing vibe',
    titleFontFamily: 'Impact',
    titleFontSize: 28,
    titleFontWeight: '700',
    titleColor: '#00FF88',
    titleTextTransform: 'uppercase',
    titleLetterSpacing: 5,
    titleTextDecoration: 'none',
    captionFontFamily: 'Lucida Console',
    captionFontSize: 11,
    captionFontWeight: '400',
    captionColor: '#00CCFF',
    captionTextTransform: 'uppercase',
    captionLetterSpacing: 3,
  },
  {
    name: 'Retro',
    emoji: '📟',
    description: 'Vintage typewriter feel',
    titleFontFamily: 'Courier New',
    titleFontSize: 20,
    titleFontWeight: '700',
    titleColor: '#5D4037',
    titleTextTransform: 'uppercase',
    titleLetterSpacing: 4,
    titleTextDecoration: 'underline',
    captionFontFamily: 'Courier New',
    captionFontSize: 12,
    captionFontWeight: '400',
    captionColor: '#795548',
    captionTextTransform: 'none',
    captionLetterSpacing: 2,
  },
  {
    name: 'Minimal',
    emoji: '◻',
    description: 'Whisper quiet design',
    titleFontFamily: 'Inter',
    titleFontSize: 16,
    titleFontWeight: '300',
    titleColor: '#9E9E9E',
    titleTextTransform: 'lowercase',
    titleLetterSpacing: 6,
    titleTextDecoration: 'none',
    captionFontFamily: 'Inter',
    captionFontSize: 10,
    captionFontWeight: '300',
    captionColor: '#BDBDBD',
    captionTextTransform: 'lowercase',
    captionLetterSpacing: 4,
  },
  {
    name: 'Bold',
    emoji: '🔥',
    description: 'Heavy impact statement',
    titleFontFamily: 'Impact',
    titleFontSize: 32,
    titleFontWeight: '800',
    titleColor: '#D32F2F',
    titleTextTransform: 'uppercase',
    titleLetterSpacing: 0,
    titleTextDecoration: 'none',
    captionFontFamily: 'Arial',
    captionFontSize: 14,
    captionFontWeight: '700',
    captionColor: '#333333',
    captionTextTransform: 'uppercase',
    captionLetterSpacing: 1,
  },
  {
    name: 'Monospace',
    emoji: '💻',
    description: 'Dev / hacker aesthetic',
    titleFontFamily: 'Lucida Console',
    titleFontSize: 18,
    titleFontWeight: '400',
    titleColor: '#4CAF50',
    titleTextTransform: 'none',
    titleLetterSpacing: 2,
    titleTextDecoration: 'none',
    captionFontFamily: 'Courier New',
    captionFontSize: 11,
    captionFontWeight: '400',
    captionColor: '#81C784',
    captionTextTransform: 'lowercase',
    captionLetterSpacing: 1,
  },
];

export const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
];

export const DOT_STYLES: { key: DotType; label: string; icon: string }[] = [
  { key: 'square', label: 'Square', icon: '◼' },
  { key: 'dots', label: 'Dots', icon: '●' },
  { key: 'rounded', label: 'Rounded', icon: '◉' },
  { key: 'classy', label: 'Classy', icon: '◆' },
  { key: 'classy-rounded', label: 'Classy+', icon: '◈' },
  { key: 'extra-rounded', label: 'Extra', icon: '⬤' },
];

export const CORNER_SQUARE_STYLES: { key: CornerSquareType; label: string; icon: string }[] = [
  { key: 'square', label: 'Square', icon: '◻' },
  { key: 'dot', label: 'Dot', icon: '◯' },
  { key: 'extra-rounded', label: 'Rounded', icon: '⬜' },
];

export const CORNER_DOT_STYLES: { key: CornerDotType; label: string; icon: string }[] = [
  { key: 'square', label: 'Square', icon: '◼' },
  { key: 'dot', label: 'Dot', icon: '●' },
];

/* ────────── Style Presets ────────── */

export interface StylePreset {
  name: string;
  emoji: string;
  description: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  errorCorrectionLevel: ErrorCorrectionLevel;
  useCustomEyeColors: boolean;
  cornerSquareColor: string;
  cornerDotColor: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    name: 'Classic',
    emoji: '🏛',
    description: 'Clean & traditional',
    dotType: 'square',
    cornerSquareType: 'square',
    cornerDotType: 'square',
    errorCorrectionLevel: 'M',
    useCustomEyeColors: false,
    cornerSquareColor: '#000000',
    cornerDotColor: '#000000',
  },
  {
    name: 'Bubbly',
    emoji: '🫧',
    description: 'Soft & playful dots',
    dotType: 'dots',
    cornerSquareType: 'dot',
    cornerDotType: 'dot',
    errorCorrectionLevel: 'Q',
    useCustomEyeColors: true,
    cornerSquareColor: '#6366F1',
    cornerDotColor: '#A78BFA',
  },
  {
    name: 'Elegant',
    emoji: '✨',
    description: 'Rounded sophistication',
    dotType: 'extra-rounded',
    cornerSquareType: 'extra-rounded',
    cornerDotType: 'dot',
    errorCorrectionLevel: 'M',
    useCustomEyeColors: true,
    cornerSquareColor: '#78350F',
    cornerDotColor: '#D97706',
  },
  {
    name: 'Sharp',
    emoji: '⚡',
    description: 'Bold classy edges',
    dotType: 'classy',
    cornerSquareType: 'square',
    cornerDotType: 'square',
    errorCorrectionLevel: 'H',
    useCustomEyeColors: false,
    cornerSquareColor: '#000000',
    cornerDotColor: '#000000',
  },
  {
    name: 'Modern',
    emoji: '🔮',
    description: 'Classy-rounded blend',
    dotType: 'classy-rounded',
    cornerSquareType: 'extra-rounded',
    cornerDotType: 'dot',
    errorCorrectionLevel: 'Q',
    useCustomEyeColors: true,
    cornerSquareColor: '#0891B2',
    cornerDotColor: '#06B6D4',
  },
  {
    name: 'Minimal',
    emoji: '◻',
    description: 'Less is more',
    dotType: 'rounded',
    cornerSquareType: 'dot',
    cornerDotType: 'dot',
    errorCorrectionLevel: 'L',
    useCustomEyeColors: false,
    cornerSquareColor: '#000000',
    cornerDotColor: '#000000',
  },
  {
    name: 'Neon',
    emoji: '💎',
    description: 'Vibrant eye accents',
    dotType: 'dots',
    cornerSquareType: 'extra-rounded',
    cornerDotType: 'dot',
    errorCorrectionLevel: 'H',
    useCustomEyeColors: true,
    cornerSquareColor: '#EC4899',
    cornerDotColor: '#F472B6',
  },
  {
    name: 'Retro',
    emoji: '📟',
    description: 'Pixel-perfect square',
    dotType: 'square',
    cornerSquareType: 'square',
    cornerDotType: 'square',
    errorCorrectionLevel: 'H',
    useCustomEyeColors: true,
    cornerSquareColor: '#15803D',
    cornerDotColor: '#22C55E',
  },
];
