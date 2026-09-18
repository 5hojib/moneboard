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
        className="rounded-3xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-900/20 overflow-hidden transition-colors"
      >
        {/* Balance hero */}
        <div className="px-5 pt-6 pb-5 sm:px-7 sm:pt-8">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300" />
            Current Balance
          </div>

          <div className="mt-2 text-4xl sm:text-6xl font-extrabold tracking-tight tabular-nums leading-none">
            {formatCurrency(currentBalance)}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-white/75 tabular-nums">
            <span>Lifetime {formatCurrency(effectiveLifetimeEarnings)}</span>
            {totalWithdrawals > 0 && (
              <>
                <span className="text-white/30">·</span>
                <span>Withdrawn {formatCurrency(totalWithdrawals)}</span>
              </>
            )}
          </div>
        </div>

        {/* Today & Yesterday */}
        <div className="grid grid-cols-2 gap-3 px-4 sm:px-6 pb-5">
          <div className="rounded-2xl bg-white/15 backdrop-blur-md px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Today</span>
              <span className="text-[10px] font-mono text-white/60">{todayDate || 'Today'}</span>
            </div>
            <div className="mt-1.5 text-lg sm:text-xl font-bold tabular-nums tracking-tight">
              {formatCurrency(todayMoney)}
            </div>
            <div className="mt-0.5 text-[10px] font-mono text-white/65 tabular-nums">
              {formatCompactNumber(todayImpressions)} imps · {todayImpressions > 0 ? `${formatCurrency(todayCpm)} CPM` : '—'}
            </div>
          </div>

          <div className="rounded-2xl bg-white/15 backdrop-blur-md px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Yesterday</span>
              <span className="text-[10px] font-mono text-white/60">{yesterdayDate || 'Yesterday'}</span>
            </div>
            <div className="mt-1.5 text-lg sm:text-xl font-bold tabular-nums tracking-tight">
              {formatCurrency(yesterdayMoney)}
            </div>
            <div className="mt-0.5 text-[10px] font-mono text-white/65 tabular-nums">
              {formatCompactNumber(yesterdayImpressions)} imps · {formatCurrency(yesterdayCpm)} CPM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}