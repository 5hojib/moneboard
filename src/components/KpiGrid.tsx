import { AggregatedStats } from '../types';
import { formatCurrency, formatCompactNumber, formatPercent } from '../utils/formatters';

interface KpiGridProps {
  stats: AggregatedStats;
  selectedDaysCount: number;
}

export default function KpiGrid({ stats, selectedDaysCount }: KpiGridProps) {
  const dailyAverageEarnings = selectedDaysCount > 0 ? stats.totalMoney / selectedDaysCount : 0;
  const dailyAverageImpressions = selectedDaysCount > 0 ? stats.totalImpressions / selectedDaysCount : 0;

  return (
    <div id="kpi-compact-strip" className="bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-neutral-800 transition-colors">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-neutral-900">
        {/* Total Revenue */}
        <div id="kpi-revenue" className="px-3 py-2 sm:py-2.5 flex flex-col justify-center">
          <div className="flex items-baseline justify-between text-[11px] text-slate-500 dark:text-neutral-400">
            <span className="font-medium text-slate-600 dark:text-neutral-300">Period Revenue</span>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
              ~{formatCurrency(dailyAverageEarnings)}/d
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-snug mt-0.5">
            {formatCurrency(stats.totalMoney)}
          </div>
        </div>

        {/* Ad Impressions */}
        <div id="kpi-impressions" className="px-3 py-2 sm:py-2.5 flex flex-col justify-center">
          <div className="flex items-baseline justify-between text-[11px] text-slate-500 dark:text-neutral-400">
            <span className="font-medium text-slate-600 dark:text-neutral-300">Impressions</span>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
              ~{formatCompactNumber(dailyAverageImpressions)}/d
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-snug mt-0.5">
            {formatCompactNumber(stats.totalImpressions)}
          </div>
        </div>

        {/* Average CPM */}
        <div id="kpi-cpm" className="px-3 py-2 sm:py-2.5 flex flex-col justify-center">
          <div className="flex items-baseline justify-between text-[11px] text-slate-500 dark:text-neutral-400">
            <span className="font-medium text-slate-600 dark:text-neutral-300">Avg CPM</span>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
              {stats.avgCpm > 0 ? '/1k imps' : '—'}
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-snug mt-0.5">
            {formatCurrency(stats.avgCpm)}
          </div>
        </div>

        {/* Clicks & CTR */}
        <div id="kpi-clicks-ctr" className="px-3 py-2 sm:py-2.5 flex flex-col justify-center">
          <div className="flex items-baseline justify-between text-[11px] text-slate-500 dark:text-neutral-400">
            <span className="font-medium text-slate-600 dark:text-neutral-300">Clicks & CTR</span>
            <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
              {formatPercent(stats.avgCtr)} CTR
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-snug mt-0.5">
            {formatCompactNumber(stats.totalClicks)}
          </div>
        </div>
      </div>
    </div>
  );
}
