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
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden flex flex-col">
      <div className="p-5 pb-0">
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center text-sm">
            🎨
          </span>
          Customize Design
        </h2>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => set({ activeTab: tab.id })}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5 pt-4 border-t border-gray-100 dark:border-gray-700/60 max-h-[500px] overflow-y-auto scrollbar-thin">
        {renderTab()}
      </div>
    </div>
  );
}
