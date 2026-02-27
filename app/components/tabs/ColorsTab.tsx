'use client';

import { useQRStore } from '../../store/useQRStore';
import { PALETTES } from '../../types/qr';

export default function ColorsTab() {
  const fgColor = useQRStore((s) => s.fgColor);
  const bgColor = useQRStore((s) => s.bgColor);
  const activePalette = useQRStore((s) => s.activePalette);
  const useFgGradient = useQRStore((s) => s.useFgGradient);
  const fgGradient = useQRStore((s) => s.fgGradient);
  const set = useQRStore((s) => s.set);

  const randomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const sat = Math.floor(Math.random() * 40) + 60;
    const hsl = (h: number, s: number, l: number) => {
      l /= 100;
      const a = (s * Math.min(l, 1 - l)) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * c)
          .toString(16)
          .padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };
    set({
      fgColor: hsl(hue, sat, Math.floor(Math.random() * 30) + 10),
      bgColor: hsl(hue, sat / 3, Math.floor(Math.random() * 20) + 80),
      activePalette: 'Custom',
    });
  };

  return (
    <div className="space-y-5">
      {/* Color Pickers */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Colors
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block font-medium">QR Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => set({ fgColor: e.target.value, activePalette: 'Custom' })}
                className="w-9 h-9 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => set({ fgColor: e.target.value, activePalette: 'Custom' })}
                className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block font-medium">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => set({ bgColor: e.target.value, activePalette: 'Custom' })}
                className="w-9 h-9 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => set({ bgColor: e.target.value, activePalette: 'Custom' })}
                className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={randomColor}
            className="px-3 py-1.5 text-xs font-semibold bg-linear-to-r from-pink-500 to-violet-500 text-white rounded-lg hover:opacity-90 transition-all active:scale-95"
          >
            🎲 Random
          </button>
          <button
            onClick={() => set({ fgColor: '#000000', bgColor: '#FFFFFF', activePalette: 'Classic', useFgGradient: false })}
            className="px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
          >
            ↩ Reset
          </button>
        </div>
      </div>

      {/* Gradient */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Dot Gradient
          </h4>
          <button
            onClick={() => set({ useFgGradient: !useFgGradient })}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
              useFgGradient ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                useFgGradient ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>
        {useFgGradient && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex gap-2">
              {(['linear', 'radial'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => set({ fgGradient: { ...fgGradient, type } })}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg border-2 font-semibold transition-all ${
                    fgGradient.type === type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500'
                  }`}
                >
                  {type === 'linear' ? '↗ Linear' : '◉ Radial'}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Rotation: <span className="font-semibold text-gray-700 dark:text-gray-300">{fgGradient.rotation}°</span>
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={fgGradient.rotation}
                onChange={(e) => set({ fgGradient: { ...fgGradient, rotation: Number(e.target.value) } })}
                className="w-full accent-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Start Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={fgGradient.colorStops[0].color}
                    onChange={(e) => {
                      const stops = [...fgGradient.colorStops];
                      stops[0] = { ...stops[0], color: e.target.value };
                      set({ fgGradient: { ...fgGradient, colorStops: stops }, activePalette: 'Custom' });
                    }}
                    className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-gray-500">{fgGradient.colorStops[0].color}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">End Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={fgGradient.colorStops[1].color}
                    onChange={(e) => {
                      const stops = [...fgGradient.colorStops];
                      stops[1] = { ...stops[1], color: e.target.value };
                      set({ fgGradient: { ...fgGradient, colorStops: stops }, activePalette: 'Custom' });
                    }}
                    className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-gray-500">{fgGradient.colorStops[1].color}</span>
                </div>
              </div>
            </div>
            {/* Gradient preview */}
            <div
              className="h-6 rounded-lg border border-gray-200 dark:border-gray-600"
              style={{
                background:
                  fgGradient.type === 'linear'
                    ? `linear-gradient(${fgGradient.rotation}deg, ${fgGradient.colorStops[0].color}, ${fgGradient.colorStops[1].color})`
                    : `radial-gradient(circle, ${fgGradient.colorStops[0].color}, ${fgGradient.colorStops[1].color})`,
              }}
            />
          </div>
        )}
      </div>

      {/* Palettes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Palettes
          </h4>
          <button
            onClick={() => {
              const p = PALETTES[Math.floor(Math.random() * PALETTES.length)];
              set({ fgColor: p.fg, bgColor: p.bg, activePalette: p.name });
            }}
            className="text-xs text-blue-500 hover:text-blue-700 font-semibold"
          >
            🔀 Random
          </button>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {PALETTES.map((p) => (
            <button
              key={p.name}
              onClick={() => set({ fgColor: p.fg, bgColor: p.bg, activePalette: p.name })}
              title={p.name}
              className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-110 ${
                activePalette === p.name
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 scale-110'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="absolute inset-0" style={{ backgroundColor: p.bg }} />
              <div className="absolute inset-1 rounded-sm" style={{ backgroundColor: p.fg }} />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 text-white text-[6px] font-bold transition-opacity leading-tight text-center">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
