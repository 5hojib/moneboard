import { AggregatedStats } from '../types';
import { formatCurrency, formatCompactNumber, formatPercent } from '../utils/formatters';

interface KpiGridProps {
  stats: AggregatedStats;
}

export default function KpiGrid({ stats }: KpiGridProps) {
  return (
    <div id="kpi-compact-strip" className="transition-colors">
      <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-neutral-900">
        {/* Average CPM */}
        <div id="kpi-cpm" className="pr-4 py-1 flex flex-col justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-neutral-500">
            Avg CPM
          </span>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-none">
            {formatCurrency(stats.avgCpm)}
          </div>
          <span className="mt-1 text-[10px] font-mono text-slate-400 dark:text-neutral-500">
            per 1k imps
          </span>
        </div>

        {/* Clicks & CTR */}
        <div id="kpi-clicks-ctr" className="pl-4 py-1 flex flex-col justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-neutral-500">
            Clicks & CTR
          </span>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums leading-none">
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