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
        <div id="kpi-revenue" className="px-3.5 py-2.5 sm:py-3">
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 mb-0.5">Period Revenue</div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-tight">
            {formatCurrency(stats.totalMoney)}
          </div>
          <div className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
            ~{formatCurrency(dailyAverageEarnings)}/day
          </div>
        </div>

        {/* Ad Impressions */}
        <div id="kpi-impressions" className="px-3.5 py-2.5 sm:py-3">
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 mb-0.5">Impressions</div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-tight">
            {formatCompactNumber(stats.totalImpressions)}
          </div>
          <div className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
            ~{formatCompactNumber(dailyAverageImpressions)}/day
          </div>
        </div>

        {/* Average CPM */}
        <div id="kpi-cpm" className="px-3.5 py-2.5 sm:py-3">
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 mb-0.5">Average CPM</div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-tight">
            {formatCurrency(stats.avgCpm)}
          </div>
          <div className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
            {stats.avgCpm > 0 ? 'Per 1,000 imps' : '—'}
          </div>
        </div>

        {/* Clicks & CTR */}
        <div id="kpi-clicks-ctr" className="px-3.5 py-2.5 sm:py-3">
          <div className="text-[11px] text-slate-500 dark:text-neutral-400 mb-0.5">Clicks & CTR</div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-tight">
            {formatCompactNumber(stats.totalClicks)}
          </div>
          <div className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
            {formatPercent(stats.avgCtr)} CTR
          </div>
        </div>
      </div>
    </div>
  );
}


