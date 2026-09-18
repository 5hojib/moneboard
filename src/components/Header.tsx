interface HeaderProps {
  lastUpdated: Date | null;
  hasKey: boolean;
  maskedKey: string | null;
}

export default function Header({
  lastUpdated,
  hasKey,
  maskedKey,
}: HeaderProps) {
  return (
    <header id="dashboard-header" className="bg-white dark:bg-black border-b border-slate-200 dark:border-neutral-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-slate-900 dark:text-neutral-100 text-sm tracking-tight leading-none">Moneboard</span>
            {hasKey && (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-500 shrink-0" title="Connected" />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
            {lastUpdated && (
              <span className="hidden sm:inline-flex items-center text-slate-400 dark:text-neutral-500 font-mono text-[11px] leading-none">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}

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