import { formatCurrency, formatCompactNumber } from '../utils/formatters';

interface EarningsHighlightProps {
  currentBalance: number;
  effectiveLifetimeEarnings: number;
  totalWithdrawals: number;
  todayMoney: number;
  todayImpressions: number;
  todayCpm: number;
  todayDate: string;
  yesterdayMoney: number;
  yesterdayImpressions: number;
  yesterdayCpm: number;
  yesterdayDate: string;
}

export default function EarningsHighlight({
  currentBalance,
  effectiveLifetimeEarnings,
  totalWithdrawals,
  todayMoney,
  todayImpressions,
  todayCpm,
  todayDate,
  yesterdayMoney,
  yesterdayImpressions,
  yesterdayCpm,
  yesterdayDate
}: EarningsHighlightProps) {
  return (
    <div id="earnings-highlight-section">
      <div
        id="earnings-highlight-card"
        className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black transition-colors"
      >
        {/* Balance hero */}
        <div id="earnings-highlight-hero" className="px-5 pt-6 pb-5 sm:px-7 sm:pt-8">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-neutral-500">
            Current Balance
          </div>

          <div className="mt-2 text-4xl sm:text-6xl font-extrabold tracking-tight tabular-nums leading-none text-slate-900 dark:text-white">
            {formatCurrency(currentBalance)}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-500 dark:text-neutral-400 tabular-nums">
            <span>Lifetime {formatCurrency(effectiveLifetimeEarnings)}</span>
            {totalWithdrawals > 0 && (
              <>
                <span className="text-slate-300 dark:text-neutral-700">·</span>
                <span>Withdrawn {formatCurrency(totalWithdrawals)}</span>
              </>
            )}
          </div>
        </div>

        {/* Today & Yesterday */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-neutral-900 border-t border-slate-100 dark:border-neutral-900">
          <div className="px-5 py-3.5 sm:px-7">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-neutral-500">Today</span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">{todayDate || 'Today'}</span>
            </div>
            <div className="mt-1 text-lg sm:text-xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white leading-none">
              {formatCurrency(todayMoney)}
            </div>
            <div className="mt-1 text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
              {formatCompactNumber(todayImpressions)} imps · {todayImpressions > 0 ? `${formatCurrency(todayCpm)} CPM` : '—'}
            </div>
          </div>

          <div className="px-5 py-3.5 sm:px-7">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-neutral-500">Yesterday</span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">{yesterdayDate || 'Yesterday'}</span>
            </div>
            <div className="mt-1 text-lg sm:text-xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white leading-none">
              {formatCurrency(yesterdayMoney)}
            </div>
            <div className="mt-1 text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
              {formatCompactNumber(yesterdayImpressions)} imps · {formatCurrency(yesterdayCpm)} CPM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}