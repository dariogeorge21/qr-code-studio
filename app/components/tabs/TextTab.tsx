'use client';

import React, { memo, useCallback } from 'react';
import { useQRStore } from '../../store/useQRStore';
import { 
  FONT_FAMILIES, 
  FONT_WEIGHTS, 
  TEXT_TRANSFORMS, 
  TEXT_DECORATIONS, 
  BLEND_MODES, 
  TEXT_PRESETS 
} from '../../types/qr';
import type { TextAlign, TextTransform, TextDecoration, BlendMode } from '../../types/qr';

/* ──────── HELPERS (Outside to prevent re-creation) ──────── */
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const randColor = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');

/* ──────── MEMOIZED SUB-COMPONENTS (Solves focus & lag) ──────── */

const SectionHeader = memo(({ label, onRandom }: { label: string; onRandom?: () => void }) => (
  <div className="flex items-center justify-between mb-5">
    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</h4>
    {onRandom && (
      <button 
        onClick={onRandom} 
        className="text-xs px-3 py-1.5 rounded-xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20 transition-all font-semibold flex items-center gap-1.5"
      >
        🎲 Random
      </button>
    )}
  </div>
));

const ControlGroup = memo(({ children, active, title }: { children: React.ReactNode; active?: boolean; title?: string }) => (
  <div className={`p-5 rounded-3xl border transition-all duration-300 ${
    active ? 'bg-[var(--color-secondary)]/5 border-[var(--color-secondary)]/30' : 'bg-gray-50 dark:bg-white/5 border-[var(--color-border)]'
  }`}>
    {title && <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5">{title}</h4>}
    <div className="space-y-6">{children}</div>
  </div>
));

const AlignToggle = memo(({ current, onChange }: { current: TextAlign; onChange: (v: TextAlign) => void }) => (
  <div className="flex bg-white dark:bg-black/40 p-1 rounded-xl border border-[var(--color-border)]">
    {(['left', 'center', 'right'] as const).map((a) => (
      <button
        key={a}
        onClick={() => onChange(a)}
        className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${
          current === a ? 'bg-[var(--color-secondary)] text-white shadow-lg' : 'opacity-50 hover:opacity-100'
        }`}
      >
        {a === 'left' ? '⬅' : a === 'center' ? '⏺' : '➡'}
      </button>
    ))}
  </div>
));

const ToggleRow = memo(<T extends string>({ items, current, onChange }: { 
  items: { value: T; label: string; icon: string }[]; 
  current: T; 
  onChange: (v: T) => void 
}) => (
  <div className="flex bg-white dark:bg-black/40 p-1 rounded-xl border border-[var(--color-border)] overflow-hidden">
    {items.map((item) => (
      <button
        key={item.value}
        onClick={() => onChange(item.value)}
        className={`flex-1 py-2 px-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
          current === item.value ? 'bg-[var(--color-secondary)] text-white shadow-lg' : 'opacity-50 hover:opacity-100'
        }`}
        title={item.label}
      >
        {item.icon}
      </button>
    ))}
  </div>
));

const SliderControl = memo(({ label, value, min, max, step, onChange, unit }: { 
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string 
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-[10px] font-bold uppercase opacity-50">{label}</label>
      <span className="text-[10px] font-mono opacity-40">{value}{unit || ''}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step || 1} value={value} 
      onChange={(e) => onChange(Number(e.target.value))} 
      className="w-full h-1.5 accent-[var(--color-secondary)] bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" 
    />
  </div>
));

/* ──────── MAIN COMPONENT ──────── */

export default function TextTab() {
  const store = useQRStore();
  const set = useQRStore(s => s.set);

  /* ──────── Randomizers (Memoized to prevent unnecessary recalculations) ──────── */
  const randomizeBgText = useCallback(() => {
    const words = ['SCAN ME', 'QR CODE', 'HELLO', 'VERIFIED', '★★★', 'AUTHENTIC', '///', '• • •', 'ORIGINAL', '⚡'];
    set({
      bgText: pick(words),
      bgTextFontFamily: pick(FONT_FAMILIES),
      bgTextFontSize: rand(24, 72),
      bgTextFontWeight: pick(FONT_WEIGHTS).value,
      bgTextColor: randColor(),
      bgTextOpacity: rand(0.02, 0.15),
      bgTextRotation: rand(-45, 45),
      bgTextRepeat: Math.random() > 0.5,
      bgTextX: rand(20, 80),
      bgTextY: rand(20, 80),
      bgTextLetterSpacing: rand(0, 12),
      bgTextTextTransform: pick(TEXT_TRANSFORMS).value,
      bgTextBlendMode: pick(BLEND_MODES).value,
    });
  }, [set]);

  const randomizeTitle = useCallback(() => {
    set({
      title: store.title || 'Scan Me',
      titleFontFamily: pick(FONT_FAMILIES),
      titleFontSize: rand(14, 36),
      titleFontWeight: pick(FONT_WEIGHTS).value,
      titleColor: randColor(),
      titleAlign: pick<TextAlign>(['left', 'center', 'right']),
      titleLetterSpacing: rand(0, 8),
      titleTextTransform: pick(TEXT_TRANSFORMS).value,
      titleTextDecoration: pick(TEXT_DECORATIONS).value,
      titleSpacing: rand(4, 24),
      titleTextShadow: Math.random() > 0.5,
      titleTextShadowColor: randColor() + '60',
      titleTextShadowBlur: rand(2, 10),
    });
  }, [set, store.title]);

  const randomizeCaption = useCallback(() => {
    set({
      caption: store.caption || 'Point camera',
      captionFontFamily: pick(FONT_FAMILIES),
      captionFontSize: rand(10, 22),
      captionFontWeight: pick(FONT_WEIGHTS).value,
      captionColor: randColor(),
      captionAlign: pick<TextAlign>(['left', 'center', 'right']),
      captionLetterSpacing: rand(0, 6),
      captionTextTransform: pick(TEXT_TRANSFORMS).value,
      captionTextDecoration: pick(TEXT_DECORATIONS).value,
      captionSpacing: rand(4, 24),
      captionTextShadow: Math.random() > 0.5,
      captionTextShadowColor: randColor() + '60',
      captionTextShadowBlur: rand(2, 10),
    });
  }, [set, store.caption]);

  const applyPreset = useCallback((preset: typeof TEXT_PRESETS[number]) => {
    set({
      ...preset,
      title: store.title || 'Scan Me',
      caption: store.caption || 'Point your camera here',
    });
  }, [set, store.title, store.caption]);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      
      {/* Global Randomize */}
      <button
        onClick={() => { randomizeBgText(); randomizeTitle(); randomizeCaption(); }}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-secondary)] to-purple-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        🎲 Randomize All Text
      </button>

      {/* Style Presets */}
      <ControlGroup>
        <SectionHeader label="Style Presets" />
        <div className="grid grid-cols-4 gap-2">
          {TEXT_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-secondary)]/40 hover:bg-[var(--color-secondary)]/5 transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{p.emoji}</span>
              <span className="text-[10px] font-bold opacity-60 group-hover:opacity-100">{p.name}</span>
            </button>
          ))}
        </div>
      </ControlGroup>

      {/* Background Watermark */}
      <ControlGroup active={!!store.bgText}>
        <SectionHeader label="Background Watermark" onRandom={randomizeBgText} />
        <input
          type="text" value={store.bgText} 
          onChange={(e) => set({ bgText: e.target.value })}
          placeholder="Hidden background message..."
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-black/40 border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm transition-all"
        />
        {store.bgText && (
          <div className="space-y-5 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50">Font</label>
                <select value={store.bgTextFontFamily} onChange={(e) => set({ bgTextFontFamily: e.target.value })} className="w-full bg-white dark:bg-black/40 border border-[var(--color-border)] rounded-xl py-2 px-3 text-sm outline-none">
                  {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50">Weight</label>
                <select value={store.bgTextFontWeight} onChange={(e) => set({ bgTextFontWeight: e.target.value })} className="w-full bg-white dark:bg-black/40 border border-[var(--color-border)] rounded-xl py-2 px-3 text-sm outline-none">
                  {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
              <SliderControl label="Font Size" value={store.bgTextFontSize} min={12} max={120} onChange={(v) => set({ bgTextFontSize: v })} unit="px" />
              <input type="color" value={store.bgTextColor} onChange={(e) => set({ bgTextColor: e.target.value })} className="w-12 h-10 rounded-xl cursor-pointer border border-[var(--color-border)] bg-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SliderControl label="Opacity" value={store.bgTextOpacity} min={0.01} max={0.5} step={0.01} onChange={(v) => set({ bgTextOpacity: v })} />
              <SliderControl label="Rotation" value={store.bgTextRotation} min={-180} max={180} onChange={(v) => set({ bgTextRotation: v })} unit="°" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SliderControl label="Position X" value={store.bgTextX} min={0} max={100} onChange={(v) => set({ bgTextX: v })} unit="%" />
              <SliderControl label="Position Y" value={store.bgTextY} min={0} max={100} onChange={(v) => set({ bgTextY: v })} unit="%" />
            </div>

            <SliderControl label="Letter Spacing" value={store.bgTextLetterSpacing} min={0} max={20} step={0.5} onChange={(v) => set({ bgTextLetterSpacing: v })} unit="px" />

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-50">Text Transform</label>
              <ToggleRow items={TEXT_TRANSFORMS} current={store.bgTextTextTransform} onChange={(v) => set({ bgTextTextTransform: v as TextTransform })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-50">Blend Mode</label>
              <select value={store.bgTextBlendMode} onChange={(e) => set({ bgTextBlendMode: e.target.value as BlendMode })} className="w-full bg-white dark:bg-black/40 border border-[var(--color-border)] rounded-xl py-2 px-3 text-sm outline-none">
                {BLEND_MODES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>

            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs font-semibold opacity-70 group-hover:opacity-100">Tile / Repeat Pattern</span>
              <div className={`w-11 h-6 rounded-full transition-all relative ${store.bgTextRepeat ? 'bg-[var(--color-secondary)]' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => set({ bgTextRepeat: !store.bgTextRepeat })}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${store.bgTextRepeat ? 'translate-x-5' : ''}`} />
              </div>
            </label>
          </div>
        )}
      </ControlGroup>

      {/* Header Title */}
      <ControlGroup active={!!store.title}>
        <SectionHeader label="Header Title" onRandom={randomizeTitle} />
        <input
          type="text" value={store.title} onChange={(e) => set({ title: e.target.value })}
          placeholder="Top headline..."
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-black/40 border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm"
        />
        {store.title && (
          <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50">Font</label>
                <select value={store.titleFontFamily} onChange={(e) => set({ titleFontFamily: e.target.value })} className="w-full bg-white dark:bg-black/40 border border-[var(--color-border)] rounded-xl py-2 px-3 text-sm outline-none">
                  {FONT_FAMILIES.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50">Weight</label>
                <select value={store.titleFontWeight} onChange={(e) => set({ titleFontWeight: e.target.value })} className="w-full bg-white dark:bg-black/40 border border-[var(--color-border)] rounded-xl py-2 px-3 text-sm outline-none">
                  {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
              <SliderControl label="Font Size" value={store.titleFontSize} min={8} max={48} onChange={(v) => set({ titleFontSize: v })} unit="px" />
              <input type="color" value={store.titleColor} onChange={(e) => set({ titleColor: e.target.value })} className="w-12 h-10 rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-50">Alignment</label>
              <AlignToggle current={store.titleAlign} onChange={(v) => set({ titleAlign: v })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SliderControl label="Letter Spacing" value={store.titleLetterSpacing} min={0} max={16} step={0.5} onChange={(v) => set({ titleLetterSpacing: v })} unit="px" />
              <SliderControl label="Gap from QR" value={store.titleSpacing} min={0} max={40} onChange={(v) => set({ titleSpacing: v })} unit="px" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-50">Transform</label>
              <ToggleRow items={TEXT_TRANSFORMS} current={store.titleTextTransform} onChange={(v) => set({ titleTextTransform: v as TextTransform })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-50">Decoration</label>
              <ToggleRow items={TEXT_DECORATIONS} current={store.titleTextDecoration} onChange={(v) => set({ titleTextDecoration: v as TextDecoration })} />
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-[var(--color-border)]">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-[10px] font-bold uppercase opacity-50">Text Shadow</span>
                <div className={`w-11 h-6 rounded-full transition-all relative ${store.titleTextShadow ? 'bg-[var(--color-secondary)]' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => set({ titleTextShadow: !store.titleTextShadow })}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${store.titleTextShadow ? 'translate-x-5' : ''}`} />
                </div>
              </label>
              {store.titleTextShadow && (
                <div className="grid grid-cols-[1fr_auto] gap-3 items-end animate-in fade-in">
                  <SliderControl label="Blur" value={store.titleTextShadowBlur} min={0} max={20} onChange={(v) => set({ titleTextShadowBlur: v })} unit="px" />
                  <input type="color" value={store.titleTextShadowColor.slice(0, 7)} onChange={(e) => set({ titleTextShadowColor: e.target.value + '80' })} className="w-12 h-10 rounded-xl" />
                </div>
              )}
            </div>
          </div>
        )}
      </ControlGroup>

      {/* Footer Caption */}
      <ControlGroup active={!!store.caption}>
        <SectionHeader label="Footer Caption" onRandom={randomizeCaption} />
        <input
          type="text" value={store.caption} onChange={(e) => set({ caption: e.target.value })}
          placeholder="Bottom instruction..."
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-black/40 border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm"
        />
        {store.caption && (
          <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50">Font</label>
                <select value={store.captionFontFamily} onChange={(e) => set({ captionFontFamily: e.target.value })} className="w-full bg-white dark:bg-black/40 border border-[var(--color-border)] rounded-xl py-2 px-3 text-sm outline-none">
                  {FONT_FAMILIES.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50">Weight</label>
                <select value={store.captionFontWeight} onChange={(e) => set({ captionFontWeight: e.target.value })} className="w-full bg-white dark:bg-black/40 border border-[var(--color-border)] rounded-xl py-2 px-3 text-sm outline-none">
                  {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
              <SliderControl label="Font Size" value={store.captionFontSize} min={8} max={36} onChange={(v) => set({ captionFontSize: v })} unit="px" />
              <input type="color" value={store.captionColor} onChange={(e) => set({ captionColor: e.target.value })} className="w-12 h-10 rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-50">Alignment</label>
              <AlignToggle current={store.captionAlign} onChange={(v) => set({ captionAlign: v })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SliderControl label="Letter Spacing" value={store.captionLetterSpacing} min={0} max={16} step={0.5} onChange={(v) => set({ captionLetterSpacing: v })} unit="px" />
              <SliderControl label="Gap from QR" value={store.captionSpacing} min={0} max={40} onChange={(v) => set({ captionSpacing: v })} unit="px" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-50">Transform</label>
              <ToggleRow items={TEXT_TRANSFORMS} current={store.captionTextTransform} onChange={(v) => set({ captionTextTransform: v as TextTransform })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-50">Decoration</label>
              <ToggleRow items={TEXT_DECORATIONS} current={store.captionTextDecoration} onChange={(v) => set({ captionTextDecoration: v as TextDecoration })} />
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-[var(--color-border)]">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-[10px] font-bold uppercase opacity-50">Text Shadow</span>
                <div className={`w-11 h-6 rounded-full transition-all relative ${store.captionTextShadow ? 'bg-[var(--color-secondary)]' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => set({ captionTextShadow: !store.captionTextShadow })}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${store.captionTextShadow ? 'translate-x-5' : ''}`} />
                </div>
              </label>
              {store.captionTextShadow && (
                <div className="grid grid-cols-[1fr_auto] gap-3 items-end animate-in fade-in">
                  <SliderControl label="Blur" value={store.captionTextShadowBlur} min={0} max={20} onChange={(v) => set({ captionTextShadowBlur: v })} unit="px" />
                  <input type="color" value={store.captionTextShadowColor.slice(0, 7)} onChange={(e) => set({ captionTextShadowColor: e.target.value + '80' })} className="w-12 h-10 rounded-xl" />
                </div>
              )}
            </div>
          </div>
        )}
      </ControlGroup>
    </div>
  );
}