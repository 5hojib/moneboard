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
            className="px-3 py-2 sm:py-2.5 flex flex-col justify-center"
          >
            <div className="flex items-baseline justify-between text-[11px] text-slate-500 dark:text-neutral-400">
              <span className="font-medium text-slate-600 dark:text-neutral-300">Balance</span>
              <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono truncate">
                Life {formatCurrency(effectiveLifetimeEarnings)}
                {totalWithdrawals > 0 && ` (-${formatCurrency(totalWithdrawals)})`}
              </span>
            </div>

            <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums leading-snug mt-0.5">
              {formatCurrency(currentBalance)}
            </div>
          </div>

          {/* 2. TODAY'S EARNINGS */}
          <div
            id="card-today-earnings"
            className="px-3 py-2 sm:py-2.5 flex flex-col justify-center"
          >
            <div className="flex items-baseline justify-between text-[11px] text-slate-500 dark:text-neutral-400">
              <span className="font-medium text-slate-600 dark:text-neutral-300">Today</span>
              <span className="font-mono text-[10px] text-slate-400 dark:text-neutral-500">{todayDate || 'Today'}</span>
            </div>

            <div className="flex items-baseline justify-between mt-0.5 gap-2">
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-snug">
                {formatCurrency(todayMoney)}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono tabular-nums text-right shrink-0">
                {formatCompactNumber(todayImpressions)} imps · {todayImpressions > 0 ? `${formatCurrency(todayCpm)} CPM` : '—'}
              </div>
            </div>
          </div>

          {/* 3. YESTERDAY'S EARNINGS */}
          <div
            id="card-yesterday-earnings"
            className="px-3 py-2 sm:py-2.5 flex flex-col justify-center"
          >
            <div className="flex items-baseline justify-between text-[11px] text-slate-500 dark:text-neutral-400">
              <span className="font-medium text-slate-600 dark:text-neutral-300">Yesterday</span>
              <span className="font-mono text-[10px] text-slate-400 dark:text-neutral-500">{yesterdayDate || 'Yesterday'}</span>
            </div>

            <div className="flex items-baseline justify-between mt-0.5 gap-2">
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-snug">
                {formatCurrency(yesterdayMoney)}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono tabular-nums text-right shrink-0">
                {formatCompactNumber(yesterdayImpressions)} imps · {formatCurrency(yesterdayCpm)} CPM
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
