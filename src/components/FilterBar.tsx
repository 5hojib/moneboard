import { DatePreset } from '../types';

interface FilterBarProps {
  datePreset: DatePreset;
  onDatePresetChange: (preset: DatePreset) => void;
  dateFrom: string;
  dateTo: string;
  onCustomDateChange: (from: string, to: string) => void;
}

export default function FilterBar({
  datePreset,
  onDatePresetChange,
  dateFrom,
  dateTo,
  onCustomDateChange,
}: FilterBarProps) {
  const presets: { id: DatePreset; label: string }[] = [
    { id: '7d', label: '7d' },
    { id: '30d', label: '30d' },
    { id: 'all', label: 'All' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div id="filter-bar-container" className="flex flex-wrap items-center justify-between gap-3 py-1 text-xs text-slate-600 dark:text-neutral-400">
      {/* Date Presets - segmented control */}
      <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full bg-white dark:bg-black border border-slate-200 dark:border-neutral-800">
        {presets.map((p) => (
          <button
            key={p.id}
            id={`preset-${p.id}`}
            onClick={() => onDatePresetChange(p.id)}
            className={`px-2.5 sm:px-3 py-1 text-xs rounded-full transition-colors cursor-pointer select-none ${
              datePreset === p.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-semibold'
                : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Date Display */}
      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-neutral-400">
        {datePreset === 'custom' ? (
          <div className="flex items-center gap-1">
            <input
              id="custom-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => onCustomDateChange(e.target.value, dateTo)}
              className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 text-xs rounded-lg px-2 py-0.5 focus:outline-none"
            />
            <span>–</span>
            <input
              id="custom-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => onCustomDateChange(dateFrom, e.target.value)}
              className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 text-xs rounded-lg px-2 py-0.5 focus:outline-none"
            />
          </div>
        ) : (
          <span>{dateFrom} – {dateTo}</span>
        )}
      </div>
    </div>
  );
}

