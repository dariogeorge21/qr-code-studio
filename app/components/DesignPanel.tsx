'use client';

import { useQRStore } from '../store/useQRStore';
import ColorsTab from './tabs/ColorsTab';
import StyleTab from './tabs/StyleTab';
import FrameTab from './tabs/FrameTab';
import TextTab from './tabs/TextTab';
import LogoTab from './tabs/LogoTab';

const TABS = [
  { id: 'colors', label: 'Colors', icon: '🎨' },
  { id: 'style', label: 'Style', icon: '✦' },
  { id: 'frame', label: 'Frame', icon: '🖼' },
  { id: 'text', label: 'Text', icon: 'Aa' },
  { id: 'logo', label: 'Logo', icon: '⬡' },
];

export default function DesignPanel() {
  const activeTab = useQRStore((s) => s.activeTab);
  const set = useQRStore((s) => s.set);

  const renderTab = () => {
    switch (activeTab) {
      case 'colors':
        return <ColorsTab />;
      case 'style':
        return <StyleTab />;
      case 'frame':
        return <FrameTab />;
      case 'text':
        return <TextTab />;
      case 'logo':
        return <LogoTab />;
      default:
        return <ColorsTab />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <div className="p-4 pb-0">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-xs">
            🎨
          </span>
          Customize Design
        </h2>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-none -mx-1 px-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => set({ activeTab: tab.id })}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-semibold transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'bg-gray-50 dark:bg-gray-700/50 text-blue-600 dark:text-blue-400 border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 pt-4 border-t border-gray-100 dark:border-gray-700/60 max-h-125 overflow-y-auto scrollbar-thin">
        {renderTab()}
      </div>
    </div>
  );
}
