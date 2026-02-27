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
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Colors
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block font-medium">QR Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => set({ fgColor: e.target.value, activePalette: 'Custom' })}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent p-0.5"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => set({ fgColor: e.target.value, activePalette: 'Custom' })}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-mono focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block font-medium">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => set({ bgColor: e.target.value, activePalette: 'Custom' })}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent p-0.5"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => set({ bgColor: e.target.value, activePalette: 'Custom' })}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-mono focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={randomColor}
            className="px-4 py-2 text-xs font-bold bg-linear-to-r from-pink-500 to-violet-500 text-white rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-sm"
          >
            🎲 Random
          </button>
          <button
            onClick={() => set({ fgColor: '#000000', bgColor: '#FFFFFF', activePalette: 'Classic', useFgGradient: false })}
            className="px-4 py-2 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
          >
            ↩ Reset
          </button>
        </div>
      </div>

      {/* Gradient */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Dot Gradient
          </h4>
          <button
            onClick={() => set({ useFgGradient: !useFgGradient })}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
              useFgGradient ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                useFgGradient ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {useFgGradient && (
          <div className="space-y-4 p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <div className="flex gap-2">
              {(['linear', 'radial'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => set({ fgGradient: { ...fgGradient, type } })}
                  className={`flex-1 px-3 py-2 text-sm rounded-xl border-2 font-semibold transition-all ${
                    fgGradient.type === type
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {type === 'linear' ? '↗ Linear' : '◉ Radial'}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block font-medium flex justify-between">
                <span>Rotation</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">{fgGradient.rotation}°</span>
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={fgGradient.rotation}
                onChange={(e) => set({ fgGradient: { ...fgGradient, rotation: Number(e.target.value) } })}
                className="w-full accent-blue-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block font-medium">Start Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgGradient.colorStops[0].color}
                    onChange={(e) => {
                      const stops = [...fgGradient.colorStops];
                      stops[0] = { ...stops[0], color: e.target.value };
                      set({ fgGradient: { ...fgGradient, colorStops: stops }, activePalette: 'Custom' });
                    }}
                    className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent p-0.5"
                  />
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{fgGradient.colorStops[0].color}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block font-medium">End Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgGradient.colorStops[1].color}
                    onChange={(e) => {
                      const stops = [...fgGradient.colorStops];
                      stops[1] = { ...stops[1], color: e.target.value };
                      set({ fgGradient: { ...fgGradient, colorStops: stops }, activePalette: 'Custom' });
                    }}
                    className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer bg-transparent p-0.5"
                  />
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{fgGradient.colorStops[1].color}</span>
                </div>
              </div>
            </div>
            {/* Gradient preview */}
            <div
              className="h-8 rounded-xl border border-gray-200 dark:border-gray-600 shadow-inner"
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
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Palettes
          </h4>
          <button
            onClick={() => {
              const p = PALETTES[Math.floor(Math.random() * PALETTES.length)];
              set({ fgColor: p.fg, bgColor: p.bg, activePalette: p.name });
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors"
          >
            🔀 Random
          </button>
        </div>
        <div className="grid grid-cols-8 gap-2">
          {PALETTES.map((p) => (
            <button
              key={p.name}
              onClick={() => set({ fgColor: p.fg, bgColor: p.bg, activePalette: p.name })}
              title={p.name}
              className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-110 ${
                activePalette === p.name
                  ? 'border-blue-500 ring-4 ring-blue-500/20 scale-110 shadow-sm'
                  : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="absolute inset-0" style={{ backgroundColor: p.bg }} />
              <div className="absolute inset-1.5 rounded-md shadow-sm" style={{ backgroundColor: p.fg }} />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 text-white text-[8px] font-bold transition-opacity leading-tight text-center px-1">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
