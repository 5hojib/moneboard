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
      <div id="earnings-highlight-card" className="bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-neutral-800 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-neutral-900">
          {/* 1. CURRENT BALANCE */}
          <div
            id="card-current-balance"
            className="px-3.5 py-2.5 sm:py-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-0.5 text-[11px] text-slate-500 dark:text-neutral-400">
              <span>Balance</span>
            </div>

            <div>
              <div className="text-lg sm:text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums leading-tight">
                {formatCurrency(currentBalance)}
              </div>
              <div className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-neutral-500 font-mono truncate">
                Lifetime {formatCurrency(effectiveLifetimeEarnings)}
                {totalWithdrawals > 0 && ` · -${formatCurrency(totalWithdrawals)}`}
              </div>
            </div>
          </div>

          {/* 2. TODAY'S EARNINGS */}
          <div
            id="card-today-earnings"
            className="px-3.5 py-2.5 sm:py-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-0.5 text-[11px] text-slate-500 dark:text-neutral-400">
              <span>Today</span>
              <span className="font-mono text-[10px] sm:text-[10.5px] text-slate-400 dark:text-neutral-500">{todayDate || 'Today'}</span>
            </div>

            <div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-tight">
                {formatCurrency(todayMoney)}
              </div>
              <div className="flex items-center justify-between mt-0.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
                <span>{formatCompactNumber(todayImpressions)} imps</span>
                <span>{todayImpressions > 0 ? `${formatCurrency(todayCpm)} CPM` : '—'}</span>
              </div>
            </div>
          </div>

          {/* 3. YESTERDAY'S EARNINGS */}
          <div
            id="card-yesterday-earnings"
            className="px-3.5 py-2.5 sm:py-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-0.5 text-[11px] text-slate-500 dark:text-neutral-400">
              <span>Yesterday</span>
              <span className="font-mono text-[10px] sm:text-[10.5px] text-slate-400 dark:text-neutral-500">{yesterdayDate || 'Yesterday'}</span>
            </div>

            <div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-tight">
                {formatCurrency(yesterdayMoney)}
              </div>
              <div className="flex items-center justify-between mt-0.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
                <span>{formatCompactNumber(yesterdayImpressions)} imps</span>
                <span>{formatCurrency(yesterdayCpm)} CPM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

