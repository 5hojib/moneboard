import { formatCurrencyFixed, formatCompactNumber } from '../utils/formatters';

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
  todayDate,
  yesterdayMoney,
  yesterdayImpressions,
  yesterdayDate
}: EarningsHighlightProps) {
  return (
    <section id="earnings-highlight-section" className="pt-8 pb-2 sm:pt-14">
      {/* Full-screen typographic hero — centered type on the page bg */}
      <div id="earnings-highlight-hero" className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-neutral-500">
          Current Balance
        </p>

        <p className="mt-3 text-6xl sm:text-8xl font-bold tracking-tight tabular-nums leading-none text-slate-900 dark:text-white">
          {formatCurrencyFixed(currentBalance)}
        </p>

        <p className="mt-4 text-[11px] font-mono text-slate-500 dark:text-neutral-400 tabular-nums">
          Lifetime {formatCurrencyFixed(effectiveLifetimeEarnings)}
          {totalWithdrawals > 0 && (
            <> · Withdrawn {formatCurrencyFixed(totalWithdrawals)}</>
          )}
        </p>
      </div>

      {/* Today & Yesterday — centered typographic row with hairline dividers */}
      <div
        id="earnings-recent-row"
        className="mt-8 sm:mt-12 grid grid-cols-2 gap-8 border-t border-slate-100 dark:border-neutral-900 pt-6 sm:pt-8"
      >
        <div id="earnings-today" className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-neutral-500">Today</p>
          <p className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight tabular-nums leading-none text-slate-900 dark:text-white">
            {formatCurrencyFixed(todayMoney)}
          </p>
          <p className="mt-1.5 text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
            {todayDate || 'Today'} · {formatCompactNumber(todayImpressions)} imps
          </p>
        </div>

        <div id="earnings-yesterday" className="text-center border-l border-slate-100 dark:border-neutral-900">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-neutral-500">Yesterday</p>
          <p className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight tabular-nums leading-none text-slate-900 dark:text-white">
            {formatCurrencyFixed(yesterdayMoney)}
          </p>
          <p className="mt-1.5 text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
            {yesterdayDate || 'Yesterday'} · {formatCompactNumber(yesterdayImpressions)} imps
          </p>
        </div>
      </div>
    </section>
  );
}