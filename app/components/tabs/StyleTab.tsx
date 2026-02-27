'use client';

import { useQRStore } from '../../store/useQRStore';
import { DOT_STYLES, CORNER_SQUARE_STYLES, CORNER_DOT_STYLES } from '../../types/qr';

export default function StyleTab() {
  const dotType = useQRStore((s) => s.dotType);
  const cornerSquareType = useQRStore((s) => s.cornerSquareType);
  const cornerDotType = useQRStore((s) => s.cornerDotType);
  const useCustomEyeColors = useQRStore((s) => s.useCustomEyeColors);
  const cornerSquareColor = useQRStore((s) => s.cornerSquareColor);
  const cornerDotColor = useQRStore((s) => s.cornerDotColor);
  const qrSize = useQRStore((s) => s.qrSize);
  const errorCorrectionLevel = useQRStore((s) => s.errorCorrectionLevel);
  const set = useQRStore((s) => s.set);

  const btnClass = (active: boolean) =>
    `px-2.5 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all duration-200 flex flex-col items-center gap-1 ${
      active
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
        : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400'
    }`;

  return (
    <div className="space-y-5">
      {/* Dot Style */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Dot Style
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {DOT_STYLES.map((s) => (
            <button key={s.key} onClick={() => set({ dotType: s.key })} className={btnClass(dotType === s.key)}>
              <span className="text-base">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Corner Square Style */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Eye Frame Style
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {CORNER_SQUARE_STYLES.map((s) => (
            <button
              key={s.key}
              onClick={() => set({ cornerSquareType: s.key })}
              className={btnClass(cornerSquareType === s.key)}
            >
              <span className="text-base">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Corner Dot Style */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Eye Dot Style
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {CORNER_DOT_STYLES.map((s) => (
            <button
              key={s.key}
              onClick={() => set({ cornerDotType: s.key })}
              className={btnClass(cornerDotType === s.key)}
            >
              <span className="text-base">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Eye Colors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Custom Eye Colors
          </h4>
          <button
            onClick={() => set({ useCustomEyeColors: !useCustomEyeColors })}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
              useCustomEyeColors ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                useCustomEyeColors ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>
        {useCustomEyeColors && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">Eye Frame Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cornerSquareColor}
                  onChange={(e) => set({ cornerSquareColor: e.target.value })}
                  className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={cornerSquareColor}
                  onChange={(e) => set({ cornerSquareColor: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium">Eye Dot Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cornerDotColor}
                  onChange={(e) => set({ cornerDotColor: e.target.value })}
                  className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={cornerDotColor}
                  onChange={(e) => set({ cornerDotColor: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Size */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Preview Size:{' '}
          <span className="text-blue-600 dark:text-blue-400 normal-case">{qrSize}px</span>
        </h4>
        <input
          type="range"
          min="150"
          max="400"
          step="10"
          value={qrSize}
          onChange={(e) => set({ qrSize: Number(e.target.value) })}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>150px</span>
          <span>400px</span>
        </div>
      </div>

      {/* Error Correction */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Error Correction
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {(['L', 'M', 'Q', 'H'] as const).map((level) => (
            <button
              key={level}
              onClick={() => set({ errorCorrectionLevel: level })}
              className={btnClass(errorCorrectionLevel === level)}
            >
              <span className="text-sm font-bold">{level}</span>
              <span className="text-[9px]">
                {level === 'L' ? '7%' : level === 'M' ? '15%' : level === 'Q' ? '25%' : '30%'}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          Higher = more resilient but denser. Use H with logos.
        </p>
      </div>
    </div>
  );
}
