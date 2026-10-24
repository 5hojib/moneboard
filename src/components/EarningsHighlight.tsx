import { formatCurrencyFixed, formatCompactNumber } from '../utils/formatters';
import { Odometer } from './Odometer';

interface RecentDay {
  date: string;
  money: number;
  impressions: number;
  cpm: number;
}

interface EarningsHighlightProps {
  currentBalance: number;
  heldBalance: number;
  approvedBalance: number;
  todayMoney: number;
  todayImpressions: number;
  todayCpm: number;
  lastThreeDays: RecentDay[];
  replay?: number;
  fullHistoryLoaded?: boolean;
}

export default function EarningsHighlight({
  currentBalance,
  heldBalance,
  approvedBalance,
  todayMoney,
  todayImpressions,
  todayCpm,
  lastThreeDays,
  replay = 0,
  fullHistoryLoaded = false,
}: EarningsHighlightProps) {
  return (
    <section id="earnings-highlight-section" className="pt-8 pb-2 sm:pt-14 flex flex-col items-center text-center">
      {/* Full-screen typographic hero — centered */}
      <div id="earnings-highlight-hero" className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-neutral-500">
          Current Balance
        </p>

        <p className="mt-4 text-6xl sm:text-8xl font-bold tracking-tight leading-none text-slate-900 dark:text-white">
          <Odometer value={currentBalance} format={formatCurrencyFixed} replay={replay} durationSecs={1.8} />
        </p>

        {/* Hold & Approved — Monetag holds the last 4 days of earnings */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] font-mono text-slate-500 dark:text-neutral-400 tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <span className="uppercase tracking-[0.16em] text-[10px] font-sans text-slate-400 dark:text-neutral-500">Hold</span>
            <span className="font-semibold text-slate-700 dark:text-neutral-200">
              <Odometer value={heldBalance} format={formatCurrencyFixed} replay={replay} />
            </span>
          </span>
          <span className="text-slate-200 dark:text-neutral-800 select-none">|</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="uppercase tracking-[0.16em] text-[10px] font-sans text-slate-400 dark:text-neutral-500">Approved</span>
            <span className="font-semibold text-slate-700 dark:text-neutral-200">
              <Odometer value={approvedBalance} format={formatCurrencyFixed} replay={replay} />
            </span>
          </span>
        </div>

      </div>

      {!fullHistoryLoaded && (
        <p className="mt-3 text-[10px] font-mono text-slate-400 dark:text-neutral-500">
          Lifetime = cached days only — use “Load all data” in Settings for full history.
        </p>
      )}

      {/* Today & last 3 days — left aligned */}
      <div
        id="earnings-recent-row"
        className="mt-2 sm:mt-3 border-t border-slate-100 dark:border-neutral-900 pt-4 sm:pt-5 text-center"
      >
        <div id="earnings-today">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-neutral-500">Today</p>
          <p className="mt-2 text-4xl sm:text-6xl font-bold tracking-tight leading-none text-slate-900 dark:text-white">
            <Odometer value={todayMoney} format={formatCurrencyFixed} replay={replay} />
          </p>
          <p className="mt-1.5 text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
            {formatCurrencyFixed(todayCpm)} • {formatCompactNumber(todayImpressions)}
          </p>
        </div>

        {lastThreeDays.length > 0 && (
          <div id="earnings-last-three" className="mt-4 space-y-2">
            {lastThreeDays.map((d) => (
              <div key={d.date} className="flex flex-col items-center gap-0.5">
                <span className="text-base sm:text-lg font-semibold tracking-tight leading-none text-slate-900 dark:text-white">
                  <Odometer value={d.money} format={formatCurrencyFixed} replay={replay} />
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
                  {formatCurrencyFixed(d.cpm)} • {formatCompactNumber(d.impressions)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}