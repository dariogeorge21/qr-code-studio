'use client';

import { useQRStore } from '../../store/useQRStore';
import { FONT_FAMILIES, FONT_WEIGHTS } from '../../types/qr';
import type { TextAlign } from '../../types/qr';

export default function TextTab() {
  const bgText = useQRStore((s) => s.bgText);
  const bgTextFontFamily = useQRStore((s) => s.bgTextFontFamily);
  const bgTextFontSize = useQRStore((s) => s.bgTextFontSize);
  const bgTextColor = useQRStore((s) => s.bgTextColor);
  const bgTextOpacity = useQRStore((s) => s.bgTextOpacity);
  const bgTextX = useQRStore((s) => s.bgTextX);
  const bgTextY = useQRStore((s) => s.bgTextY);
  const bgTextRotation = useQRStore((s) => s.bgTextRotation);
  const bgTextRepeat = useQRStore((s) => s.bgTextRepeat);
  const title = useQRStore((s) => s.title);
  const titleFontFamily = useQRStore((s) => s.titleFontFamily);
  const titleFontSize = useQRStore((s) => s.titleFontSize);
  const titleFontWeight = useQRStore((s) => s.titleFontWeight);
  const titleColor = useQRStore((s) => s.titleColor);
  const titleAlign = useQRStore((s) => s.titleAlign);
  const titleSpacing = useQRStore((s) => s.titleSpacing);
  const caption = useQRStore((s) => s.caption);
  const captionFontFamily = useQRStore((s) => s.captionFontFamily);
  const captionFontSize = useQRStore((s) => s.captionFontSize);
  const captionFontWeight = useQRStore((s) => s.captionFontWeight);
  const captionColor = useQRStore((s) => s.captionColor);
  const captionAlign = useQRStore((s) => s.captionAlign);
  const captionSpacing = useQRStore((s) => s.captionSpacing);
  const set = useQRStore((s) => s.set);

  const inputClass =
    'w-full px-2.5 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none';
  const selectClass =
    'w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none';

  const alignButtons = (current: TextAlign, prefix: 'title' | 'caption') => (
    <div className="flex gap-1">
      {(['left', 'center', 'right'] as const).map((a) => (
        <button
          key={a}
          onClick={() => set({ [`${prefix}Align`]: a } as Record<string, TextAlign>)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            current === a
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {a === 'left' ? '◀' : a === 'center' ? '◆' : '▶'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ── Background Text ── */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Background Text
        </h4>
        <div className="space-y-3">
          <input
            type="text"
            value={bgText}
            onChange={(e) => set({ bgText: e.target.value })}
            placeholder="Watermark / background text..."
            maxLength={60}
            className={inputClass}
          />

          {bgText && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Font</label>
                  <select
                    value={bgTextFontFamily}
                    onChange={(e) => set({ bgTextFontFamily: e.target.value })}
                    className={selectClass}
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Size: <span className="font-semibold">{bgTextFontSize}px</span>
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={bgTextFontSize}
                    onChange={(e) => set({ bgTextFontSize: Number(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={bgTextColor}
                      onChange={(e) => set({ bgTextColor: e.target.value })}
                      className="w-7 h-7 rounded border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-gray-500">{bgTextColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Opacity: <span className="font-semibold">{Math.round(bgTextOpacity * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={bgTextOpacity}
                    onChange={(e) => set({ bgTextOpacity: Number(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    X Position: <span className="font-semibold">{bgTextX}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bgTextX}
                    onChange={(e) => set({ bgTextX: Number(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Y Position: <span className="font-semibold">{bgTextY}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bgTextY}
                    onChange={(e) => set({ bgTextY: Number(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Rotation: <span className="font-semibold">{bgTextRotation}°</span>
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={bgTextRotation}
                  onChange={(e) => set({ bgTextRotation: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500 font-medium">Repeat (Watermark)</label>
                <button
                  onClick={() => set({ bgTextRepeat: !bgTextRepeat })}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                    bgTextRepeat ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      bgTextRepeat ? 'translate-x-4' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Title ── */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Title (Above QR)
        </h4>
        <input
          type="text"
          value={title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Enter a title..."
          maxLength={80}
          className={inputClass}
        />
        {title && (
          <div className="mt-3 space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Font</label>
                <select
                  value={titleFontFamily}
                  onChange={(e) => set({ titleFontFamily: e.target.value })}
                  className={selectClass}
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Weight</label>
                <select
                  value={titleFontWeight}
                  onChange={(e) => set({ titleFontWeight: e.target.value })}
                  className={selectClass}
                >
                  {FONT_WEIGHTS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Size: <span className="font-semibold">{titleFontSize}px</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="48"
                  value={titleFontSize}
                  onChange={(e) => set({ titleFontSize: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Spacing: <span className="font-semibold">{titleSpacing}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={titleSpacing}
                  onChange={(e) => set({ titleSpacing: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={titleColor}
                  onChange={(e) => set({ titleColor: e.target.value })}
                  className="w-7 h-7 rounded border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono text-gray-500">{titleColor}</span>
              </div>
              {alignButtons(titleAlign, 'title')}
            </div>
          </div>
        )}
      </div>

      {/* ── Caption ── */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Caption (Below QR)
        </h4>
        <input
          type="text"
          value={caption}
          onChange={(e) => set({ caption: e.target.value })}
          placeholder="Enter a caption..."
          maxLength={120}
          className={inputClass}
        />
        {caption && (
          <div className="mt-3 space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Font</label>
                <select
                  value={captionFontFamily}
                  onChange={(e) => set({ captionFontFamily: e.target.value })}
                  className={selectClass}
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Weight</label>
                <select
                  value={captionFontWeight}
                  onChange={(e) => set({ captionFontWeight: e.target.value })}
                  className={selectClass}
                >
                  {FONT_WEIGHTS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Size: <span className="font-semibold">{captionFontSize}px</span>
                </label>
                <input
                  type="range"
                  min="8"
                  max="36"
                  value={captionFontSize}
                  onChange={(e) => set({ captionFontSize: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Spacing: <span className="font-semibold">{captionSpacing}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={captionSpacing}
                  onChange={(e) => set({ captionSpacing: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={captionColor}
                  onChange={(e) => set({ captionColor: e.target.value })}
                  className="w-7 h-7 rounded border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono text-gray-500">{captionColor}</span>
              </div>
              {alignButtons(captionAlign, 'caption')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
