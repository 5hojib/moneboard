import { formatCurrencyFixed, formatCompactNumber } from '../utils/formatters';
import { Odometer } from './Odometer';

interface EarningsHighlightProps {
  currentBalance: number;
  effectiveLifetimeEarnings: number;
  totalWithdrawals: number;
  heldBalance: number;
  approvedBalance: number;
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
  heldBalance,
  approvedBalance,
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

        <p className="mt-4 text-6xl sm:text-8xl font-bold tracking-tight leading-none text-slate-900 dark:text-white">
          <Odometer value={currentBalance} format={formatCurrencyFixed} />
        </p>

        {/* Hold & Approved — Monetag holds the last 4 days of earnings */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] font-mono text-slate-500 dark:text-neutral-400 tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <span className="uppercase tracking-[0.16em] text-[10px] font-sans text-slate-400 dark:text-neutral-500">Hold</span>
            <span className="font-semibold text-slate-700 dark:text-neutral-200">
              <Odometer value={heldBalance} format={formatCurrencyFixed} />
            </span>
          </span>
          <span className="text-slate-200 dark:text-neutral-800 select-none">|</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="uppercase tracking-[0.16em] text-[10px] font-sans text-slate-400 dark:text-neutral-500">Approved</span>
            <span className="font-semibold text-slate-700 dark:text-neutral-200">
              <Odometer value={approvedBalance} format={formatCurrencyFixed} />
            </span>
          </span>
        </div>

        <p className="mt-3 text-[11px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
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
          <p className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight leading-none text-slate-900 dark:text-white">
            <Odometer value={todayMoney} format={formatCurrencyFixed} />
          </p>
          <p className="mt-1.5 text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
            {todayDate || 'Today'} · {formatCompactNumber(todayImpressions)} imps
          </p>
        </div>

        <div id="earnings-yesterday" className="text-center border-l border-slate-100 dark:border-neutral-900">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-neutral-500">Yesterday</p>
          <p className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight leading-none text-slate-900 dark:text-white">
            <Odometer value={yesterdayMoney} format={formatCurrencyFixed} />
          </p>
          <p className="mt-1.5 text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
            {yesterdayDate || 'Yesterday'} · {formatCompactNumber(yesterdayImpressions)} imps
          </p>
        </div>
      </div>
    </section>
  );
}