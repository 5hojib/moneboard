import { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { StatItem } from '../types';
import { formatCurrency, formatCompactNumber, calculateCpm, calculateCtr } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';

interface ChartsSectionProps {
  stats: StatItem[];
}

export default function ChartsSection({ stats }: ChartsSectionProps) {
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'cpm' | 'impressions' | 'clicks'>('revenue');
  const [activePoint, setActivePoint] = useState<{
    date: string;
    displayDate: string;
    value: number;
  } | null>(null);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const gridColor = isDark ? '#171717' : '#f1f5f9';
  const axisColor = isDark ? '#525252' : '#94a3b8';
  const strokeColor = isDark ? '#38bdf8' : '#0f172a';
  const fillColor = isDark ? 'rgba(56, 189, 248, 0.08)' : '#f1f5f9';
  const yAxisLineColor = isDark ? '#38bdf8' : '#0284c7';
  const xAxisLineColor = isDark ? '#404040' : '#cbd5e1';

  // Process and sort daily data chronologically
  const chartData = useMemo(() => {
    return [...stats]
      .filter(item => item.date_time)
      .sort((a, b) => (a.date_time! > b.date_time! ? 1 : -1))
      .map(item => {
        const money = typeof item.money === 'string' ? parseFloat(item.money) : Number(item.money || 0);
        const impressions = typeof item.impressions === 'string' ? parseFloat(item.impressions) : Number(item.impressions || 0);
        const clicks = typeof item.clicks === 'string' ? parseFloat(item.clicks) : Number(item.clicks || 0);
        const requests = typeof item.requests === 'string' ? parseFloat(item.requests) : Number(item.requests || 0);
        const cpm = calculateCpm(money, impressions);
        const ctr = calculateCtr(clicks, impressions);

        return {
          date: item.date_time,
          displayDate: item.date_time ? item.date_time.slice(5) : '', // "MM-DD"
          money: Number(money.toFixed(4)),
          cpm: Number(cpm.toFixed(4)),
          impressions: Math.round(impressions),
          clicks: Math.round(clicks),
          requests: Math.round(requests),
          ctr: Number(ctr.toFixed(2)),
        };
      });
  }, [stats]);

  const handleMetricChange = (metricId: 'revenue' | 'cpm' | 'impressions' | 'clicks') => {
    setActiveMetric(metricId);
    setActivePoint(null);
  };

  const handleChartInteraction = (e: any) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      const item = e.activePayload[0].payload;
      const val =
        activeMetric === 'revenue'
          ? item.money
          : activeMetric === 'cpm'
          ? item.cpm
          : activeMetric === 'impressions'
          ? item.impressions
          : item.clicks;
      setActivePoint({
        date: item.date,
        displayDate: item.displayDate,
        value: val,
      });
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    useEffect(() => {
      if (active && payload && payload.length > 0 && payload[0]?.payload) {
        const item = payload[0].payload;
        const val =
          activeMetric === 'revenue'
            ? item.money
            : activeMetric === 'cpm'
            ? item.cpm
            : activeMetric === 'impressions'
            ? item.impressions
            : item.clicks;

        setActivePoint(prev => {
          if (prev?.date === item.date && prev?.value === val) return prev;
          return {
            date: item.date,
            displayDate: item.displayDate,
            value: val,
          };
        });
      }
    }, [active, payload]);

    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 dark:bg-black text-white px-3 py-2 rounded text-xs space-y-1 font-mono border border-slate-800 dark:border-neutral-800 shadow-xl">
          <div className="text-slate-400 dark:text-neutral-500 text-[11px] pb-1 border-b border-slate-800 dark:border-neutral-800">
            {data.date}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400 dark:text-neutral-400 font-sans">Revenue</span>
            <span className="text-white font-bold">{formatCurrency(data.money)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400 dark:text-neutral-400 font-sans">CPM</span>
            <span>{formatCurrency(data.cpm)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400 dark:text-neutral-400 font-sans">Impressions</span>
            <span>{formatCompactNumber(data.impressions)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400 dark:text-neutral-400 font-sans">Clicks</span>
            <span>{formatCompactNumber(data.clicks)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-neutral-800 p-6 text-center text-xs text-slate-500 dark:text-neutral-400">
        No statistics available for the selected period.
      </div>
    );
  }

  const metrics: { id: 'revenue' | 'cpm' | 'impressions' | 'clicks'; label: string }[] = [
    { id: 'revenue', label: 'Revenue' },
    { id: 'cpm', label: 'CPM' },
    { id: 'impressions', label: 'Impressions' },
    { id: 'clicks', label: 'Clicks' },
  ];

  return (
    <div
      id="charts-section"
      className="w-full bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-neutral-800 p-4 transition-colors select-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none [&_*]:outline-none [&_*]:focus:outline-none [&_*]:focus:ring-0 [&_svg]:outline-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-neutral-100 uppercase tracking-wider select-none">Trend</h3>

        {/* Metric Selector */}
        <div className="flex items-center gap-1 select-none">
          {metrics.map(m => (
            <button
              key={m.id}
              id={`chart-metric-${m.id}`}
              onClick={() => handleMetricChange(m.id)}
              className={`px-2 py-1 text-xs rounded transition-colors cursor-pointer select-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none ${
                activeMetric === m.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-semibold'
                  : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[240px] w-full select-none outline-none">
        <ResponsiveContainer width="100%" height="100%">
          {activeMetric === 'revenue' ? (
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              onClick={handleChartInteraction}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="displayDate" stroke={axisColor} fontSize={10} tickLine={false} fontFamily="monospace" />
              <YAxis
                stroke={axisColor}
                fontSize={10}
                tickLine={false}
                fontFamily="monospace"
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              {activePoint && (
                <>
                  <ReferenceLine
                    y={activePoint.value}
                    stroke={yAxisLineColor}
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                  />
                  <ReferenceLine
                    x={activePoint.displayDate}
                    stroke={xAxisLineColor}
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                </>
              )}
              <Area
                type="monotone"
                dataKey="money"
                stroke={strokeColor}
                strokeWidth={1.5}
                fill={fillColor}
                name="Revenue"
                activeDot={{ r: 4, stroke: isDark ? '#000' : '#fff', strokeWidth: 1.5, fill: strokeColor }}
              />
            </AreaChart>
          ) : activeMetric === 'cpm' ? (
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              onClick={handleChartInteraction}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="displayDate" stroke={axisColor} fontSize={10} tickLine={false} fontFamily="monospace" />
              <YAxis
                stroke={axisColor}
                fontSize={10}
                tickLine={false}
                fontFamily="monospace"
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              {activePoint && (
                <>
                  <ReferenceLine
                    y={activePoint.value}
                    stroke={yAxisLineColor}
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                  />
                  <ReferenceLine
                    x={activePoint.displayDate}
                    stroke={xAxisLineColor}
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                </>
              )}
              <Line
                type="monotone"
                dataKey="cpm"
                stroke={strokeColor}
                strokeWidth={1.5}
                dot={false}
                name="CPM"
                activeDot={{ r: 4, stroke: isDark ? '#000' : '#fff', strokeWidth: 1.5, fill: strokeColor }}
              />
            </LineChart>
          ) : activeMetric === 'impressions' ? (
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              onClick={handleChartInteraction}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="displayDate" stroke={axisColor} fontSize={10} tickLine={false} fontFamily="monospace" />
              <YAxis
                stroke={axisColor}
                fontSize={10}
                tickLine={false}
                fontFamily="monospace"
                tickFormatter={(val) => formatCompactNumber(val)}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              {activePoint && (
                <>
                  <ReferenceLine
                    y={activePoint.value}
                    stroke={yAxisLineColor}
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                  />
                  <ReferenceLine
                    x={activePoint.displayDate}
                    stroke={xAxisLineColor}
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                </>
              )}
              <Area
                type="monotone"
                dataKey="impressions"
                stroke={strokeColor}
                strokeWidth={1.5}
                fill={fillColor}
                name="Impressions"
                activeDot={{ r: 4, stroke: isDark ? '#000' : '#fff', strokeWidth: 1.5, fill: strokeColor }}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              onClick={handleChartInteraction}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="displayDate" stroke={axisColor} fontSize={10} tickLine={false} fontFamily="monospace" />
              <YAxis
                stroke={axisColor}
                fontSize={10}
                tickLine={false}
                fontFamily="monospace"
                tickFormatter={(val) => formatCompactNumber(val)}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              {activePoint && (
                <>
                  <ReferenceLine
                    y={activePoint.value}
                    stroke={yAxisLineColor}
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                  />
                  <ReferenceLine
                    x={activePoint.displayDate}
                    stroke={xAxisLineColor}
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                </>
              )}
              <Line
                type="monotone"
                dataKey="clicks"
                stroke={strokeColor}
                strokeWidth={1.5}
                dot={false}
                name="Clicks"
                activeDot={{ r: 4, stroke: isDark ? '#000' : '#fff', strokeWidth: 1.5, fill: strokeColor }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}


