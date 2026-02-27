'use client';

import { useQRStore } from '../../store/useQRStore';
import type { BorderType } from '../../types/qr';

export default function FrameTab() {
  const frameEnabled = useQRStore((s) => s.frameEnabled);
  const borderWidth = useQRStore((s) => s.borderWidth);
  const borderColor = useQRStore((s) => s.borderColor);
  const borderRadius = useQRStore((s) => s.borderRadius);
  const borderType = useQRStore((s) => s.borderType);
  const padding = useQRStore((s) => s.padding);
  const shadowEnabled = useQRStore((s) => s.shadowEnabled);
  const shadowX = useQRStore((s) => s.shadowX);
  const shadowY = useQRStore((s) => s.shadowY);
  const shadowBlur = useQRStore((s) => s.shadowBlur);
  const shadowColor = useQRStore((s) => s.shadowColor);
  const set = useQRStore((s) => s.set);

  const borderTypes: { key: BorderType; label: string; preview: string }[] = [
    { key: 'solid', label: 'Solid', preview: '━━━' },
    { key: 'dashed', label: 'Dashed', preview: '┅┅┅' },
    { key: 'dotted', label: 'Dotted', preview: '┈┈┈' },
    { key: 'double', label: 'Double', preview: '═══' },
  ];

  return (
    <div className="space-y-5">
      {/* Frame Toggle */}
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Border Frame
        </h4>
        <button
          onClick={() => set({ frameEnabled: !frameEnabled })}
          className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
            frameEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
              frameEnabled ? 'translate-x-4' : ''
            }`}
          />
        </button>
      </div>

      {frameEnabled && (
        <div className="space-y-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          {/* Border Type */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block font-medium">Border Type</label>
            <div className="grid grid-cols-4 gap-2">
              {borderTypes.map((bt) => (
                <button
                  key={bt.key}
                  onClick={() => set({ borderType: bt.key })}
                  className={`px-2 py-2 rounded-lg border-2 text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                    borderType === bt.key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  <span className="text-xs leading-none">{bt.preview}</span>
                  <span className="text-[10px]">{bt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Border Width */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Width: <span className="font-semibold text-gray-700 dark:text-gray-300">{borderWidth}px</span>
            </label>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={borderWidth}
              onChange={(e) => set({ borderWidth: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Border Color */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block font-medium">Border Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderColor.substring(0, 7)}
                onChange={(e) => set({ borderColor: e.target.value })}
                className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => set({ borderColor: e.target.value })}
                className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Corner Radius:{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">{borderRadius}px</span>
            </label>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={borderRadius}
              onChange={(e) => set({ borderRadius: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      )}

      {/* Padding */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
          Inner Padding:{' '}
          <span className="text-blue-600 dark:text-blue-400 normal-case">{padding}px</span>
        </h4>
        <input
          type="range"
          min="0"
          max="60"
          step="2"
          value={padding}
          onChange={(e) => set({ padding: Number(e.target.value) })}
          className="w-full accent-blue-500"
        />
      </div>

      {/* Shadow */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Drop Shadow
          </h4>
          <button
            onClick={() => set({ shadowEnabled: !shadowEnabled })}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
              shadowEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                shadowEnabled ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>

        {shadowEnabled && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  X: <span className="font-semibold">{shadowX}px</span>
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={shadowX}
                  onChange={(e) => set({ shadowX: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Y: <span className="font-semibold">{shadowY}px</span>
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={shadowY}
                  onChange={(e) => set({ shadowY: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Blur: <span className="font-semibold">{shadowBlur}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={shadowBlur}
                onChange={(e) => set({ shadowBlur: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Shadow Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={shadowColor.substring(0, 7)}
                  onChange={(e) => set({ shadowColor: e.target.value })}
                  className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={shadowColor}
                  onChange={(e) => set({ shadowColor: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview box */}
      <div className="flex justify-center">
        <div
          className="w-16 h-16 bg-gray-200 dark:bg-gray-600 transition-all duration-200"
          style={{
            borderWidth: frameEnabled ? `${borderWidth}px` : '0px',
            borderStyle: frameEnabled ? borderType : 'none',
            borderColor: frameEnabled ? borderColor : 'transparent',
            borderRadius: `${borderRadius}px`,
            padding: `${Math.min(padding, 12)}px`,
            boxShadow: shadowEnabled
              ? `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}`
              : 'none',
          }}
        >
          <div className="w-full h-full bg-gray-400 dark:bg-gray-500 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
