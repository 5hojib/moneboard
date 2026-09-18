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
    <section id="earnings-highlight-section" className="pt-4 pb-1 sm:pt-6">
      {/* Full-screen typographic hero — no card, no surface, just type on the page bg */}
      <div id="earnings-highlight-hero">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-neutral-500">
          Current Balance
        </p>

        <p className="mt-2 text-6xl sm:text-7xl font-bold tracking-tight tabular-nums leading-none text-slate-900 dark:text-white">
          {formatCurrency(currentBalance)}
        </p>

        <p className="mt-3 text-[11px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
          Lifetime {formatCurrency(effectiveLifetimeEarnings)}
          {totalWithdrawals > 0 && (
            <> · Withdrawn {formatCurrency(totalWithdrawals)}</>
          )}
        </p>
      </div>

      {/* Today & Yesterday — typographic row with hairline dividers */}
      <div
        id="earnings-recent-row"
        className="mt-6 sm:mt-8 grid grid-cols-2 gap-6 border-t border-slate-100 dark:border-neutral-900 pt-5 sm:pt-6"
      >
        <div id="earnings-today">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-neutral-500">Today</span>
            <span className="text-[10px] font-mono text-slate-300 dark:text-neutral-600">{todayDate || 'Today'}</span>
          </div>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight tabular-nums leading-none text-slate-900 dark:text-white">
            {formatCurrency(todayMoney)}
          </p>
          <p className="mt-1 text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
            {formatCompactNumber(todayImpressions)} imps · {todayImpressions > 0 ? `${formatCurrency(todayCpm)} CPM` : '—'}
          </p>
        </div>

        <div id="earnings-yesterday" className="border-l border-slate-100 dark:border-neutral-900 pl-6">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-neutral-500">Yesterday</span>
            <span className="text-[10px] font-mono text-slate-300 dark:text-neutral-600">{yesterdayDate || 'Yesterday'}</span>
          </div>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight tabular-nums leading-none text-slate-900 dark:text-white">
            {formatCurrency(yesterdayMoney)}
          </p>
          <p className="mt-1 text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
            {formatCompactNumber(yesterdayImpressions)} imps · {formatCurrency(yesterdayCpm)} CPM
          </p>
        </div>
      </div>
    </section>
  );
}