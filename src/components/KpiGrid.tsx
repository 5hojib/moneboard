import { AggregatedStats } from '../types';
import { formatCurrency, formatCompactNumber, formatPercent } from '../utils/formatters';

interface KpiGridProps {
  stats: AggregatedStats;
  selectedDaysCount: number;
}

export default function KpiGrid({ stats, selectedDaysCount }: KpiGridProps) {
  const dailyAverageImpressions = selectedDaysCount > 0 ? stats.totalImpressions / selectedDaysCount : 0;

  return (
    <div
      id="kpi-compact-strip"
      className="bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-neutral-800 transition-colors"
    >
      <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-neutral-900">
        {/* Ad Impressions */}
        <div id="kpi-impressions" className="px-3 py-3.5 sm:px-4 sm:py-4 flex flex-col justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-neutral-500">
            Impressions
          </span>
          <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-none">
            {formatCompactNumber(stats.totalImpressions)}
          </div>
          <span className="mt-1 text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
            ~{formatCompactNumber(dailyAverageImpressions)}/d
          </span>
        </div>

        {/* Average CPM */}
        <div id="kpi-cpm" className="px-3 py-3.5 sm:px-4 sm:py-4 flex flex-col justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-neutral-500">
            Avg CPM
          </span>
          <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-none">
            {formatCurrency(stats.avgCpm)}
          </div>
          <span className="mt-1 text-[10px] font-mono text-slate-400 dark:text-neutral-500">
            per 1k imps
          </span>
        </div>

        {/* Clicks & CTR */}
        <div id="kpi-clicks-ctr" className="px-3 py-3.5 sm:px-4 sm:py-4 flex flex-col justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-neutral-500">
            Clicks & CTR
          </span>
          <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-none">
            {formatCompactNumber(stats.totalClicks)}
          </div>
          <span className="mt-1 text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
            {formatPercent(stats.avgCtr)} CTR
          </span>
        </div>
      </div>
    </div>
  );
}