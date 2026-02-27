'use client';

import { useRef } from 'react';
import { useQRStore } from '../../store/useQRStore';

export default function LogoTab() {
  const logoImage = useQRStore((s) => s.logoImage);
  const logoSize = useQRStore((s) => s.logoSize);
  const logoMargin = useQRStore((s) => s.logoMargin);
  const logoPadding = useQRStore((s) => s.logoPadding);
  const logoRadius = useQRStore((s) => s.logoRadius);
  const set = useQRStore((s) => s.set);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      set({ logoImage: result, errorCorrectionLevel: 'H' });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    set({ logoImage: null });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        Center Logo
      </h4>

      {/* Upload */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="logo-upload"
        />
        {!logoImage ? (
          <label
            htmlFor="logo-upload"
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
          >
            <span className="text-3xl">🖼️</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Click to upload logo
            </span>
            <span className="text-[10px] text-gray-400">PNG, JPG, SVG — max 5MB</span>
          </label>
        ) : (
          <div className="space-y-3">
            <div className="relative flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <img
                src={logoImage}
                alt="Logo preview"
                className="max-h-20 max-w-full object-contain"
                style={{ borderRadius: `${logoRadius}px` }}
              />
              <button
                onClick={removeLogo}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Remove logo"
              >
                ✕
              </button>
            </div>
            <label
              htmlFor="logo-upload"
              className="block text-center text-xs text-blue-500 hover:text-blue-700 font-semibold cursor-pointer"
            >
              Change image
            </label>
          </div>
        )}
      </div>

      {logoImage && (
        <div className="space-y-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          {/* Size */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Logo Size:{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {Math.round(logoSize * 100)}%
              </span>
            </label>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.01"
              value={logoSize}
              onChange={(e) => set({ logoSize: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Margin */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Margin:{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">{logoMargin}px</span>
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={logoMargin}
              onChange={(e) => set({ logoMargin: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Padding */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Padding:{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">{logoPadding}px</span>
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={logoPadding}
              onChange={(e) => set({ logoPadding: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Border Radius */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block font-medium">
              Corner Radius:{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">{logoRadius}px</span>
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={logoRadius}
              onChange={(e) => set({ logoRadius: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-lg">
            💡 Error correction auto-set to <strong>H (30%)</strong> for best logo visibility.
          </p>
        </div>
      )}
    </div>
  );
}
