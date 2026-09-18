import { Home, BarChart3, Table2, Settings } from 'lucide-react';

export type TabId = 'home' | 'graph' | 'daily' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'graph', label: 'Graph', icon: BarChart3 },
  { id: 'daily', label: 'Daily', icon: Table2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-black border-t border-slate-200 dark:border-neutral-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center gap-1 py-2 text-[10px] leading-none transition-colors cursor-pointer select-none"
            >
              <span
                className={`flex items-center justify-center h-6 w-12 rounded-full transition-colors ${
                  active ? 'bg-slate-900 dark:bg-neutral-100 text-white dark:text-black' : 'text-slate-400 dark:text-neutral-500'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
              </span>
              <span
                className={`transition-colors ${
                  active
                    ? 'text-slate-900 dark:text-white font-medium'
                    : 'text-slate-500 dark:text-neutral-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}