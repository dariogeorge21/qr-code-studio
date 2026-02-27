'use client';

import InputPanel from './components/InputPanel';
import DesignPanel from './components/DesignPanel';
import QRPreviewCanvas from './components/QRPreviewCanvas';
import ExportToolbar from './components/ExportToolbar';
import { useQRStore } from './store/useQRStore';

export default function Home() {
  const reset = useQRStore((s) => s.reset);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            QR Code Studio
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Multi-level customizable QR code generator
          </p>
          <button
            onClick={reset}
            className="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
          >
            Reset All
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column: Inputs & Design */}
          <div className="lg:w-[450px] xl:w-[500px] shrink-0 space-y-6 order-2 lg:order-1">
            <InputPanel />
            <DesignPanel />
          </div>

          {/* Right Column: Preview & Export */}
          <div className="flex-1 min-w-0 order-1 lg:order-2">
            <div className="lg:sticky lg:top-6 space-y-6">
              <QRPreviewCanvas />
              <ExportToolbar />
              <div className="text-center text-xs text-gray-400 dark:text-gray-500 px-4 hidden lg:block">
                <p>QR codes generated instantly in your browser</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
