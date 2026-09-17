import { Monitor, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
  hasKey: boolean;
  maskedKey: string | null;
}

export default function Header({
  onRefresh,
  isLoading,
  lastUpdated,
  hasKey,
  maskedKey,
}: HeaderProps) {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <header id="dashboard-header" className="bg-white dark:bg-black border-b border-slate-200 dark:border-neutral-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-slate-900 dark:text-neutral-100 text-sm tracking-tight leading-none">Monetag</span>
            <span className="text-slate-300 dark:text-neutral-700 text-xs leading-none select-none">/</span>
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-normal leading-none">Publisher</span>
            {hasKey && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Connected" />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
            {lastUpdated && (
              <span className="hidden sm:inline-flex items-center text-slate-400 dark:text-neutral-500 font-mono text-[11px] leading-none">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}

            {/* Theme Selector */}
            <div id="theme-selector-group" className="h-7 flex items-center bg-slate-100 dark:bg-neutral-900 p-0.5 rounded border border-slate-200 dark:border-neutral-800 text-[11px]">
              <button
                type="button"
                id="theme-btn-system"
                onClick={() => setThemeMode('system')}
                title="Auto (matches system appearance)"
                className={`h-6 px-1.5 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer select-none leading-none ${
                  themeMode === 'system'
                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-medium shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-3 h-3 shrink-0" />
                <span className="hidden md:inline">Auto</span>
              </button>
              <button
                type="button"
                id="theme-btn-light"
                onClick={() => setThemeMode('light')}
                title="Light mode"
                className={`h-6 px-1.5 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer select-none leading-none ${
                  themeMode === 'light'
                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-medium shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3 shrink-0" />
                <span className="hidden md:inline">Light</span>
              </button>
              <button
                type="button"
                id="theme-btn-dark"
                onClick={() => setThemeMode('dark')}
                title="Dark mode"
                className={`h-6 px-1.5 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer select-none leading-none ${
                  themeMode === 'dark'
                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-medium shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3 shrink-0" />
                <span className="hidden md:inline">Dark</span>
              </button>
            </div>

            <button
              id="refresh-stats-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-7 px-2.5 inline-flex items-center justify-center text-xs leading-none text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 rounded border border-transparent transition-colors disabled:opacity-50 cursor-pointer font-medium select-none"
            >
              {isLoading ? 'Syncing...' : 'Sync'}
            </button>

            {maskedKey && (
              <span
                id="api-key-status-badge"
                title="Configured via environment variable"
                className="h-7 px-2.5 inline-flex items-center justify-center font-mono text-[11px] leading-none text-slate-500 dark:text-neutral-400 select-none"
              >
                {maskedKey}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


