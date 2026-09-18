import { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Header from './components/Header';
import PullToRefresh from './components/PullToRefresh';
import EarningsHighlight from './components/EarningsHighlight';
import KpiGrid from './components/KpiGrid';
import ChartsSection from './components/ChartsSection';
import FilterBar from './components/FilterBar';
import DailyStatsTable from './components/DailyStatsTable';

import {
  StatItem,
  AggregatedStats,
  DatePreset
} from './types';
import {
  getDateRangeForPreset,
  getISODateString,
  calculateCpm,
  calculateCtr,
  calculateFillRate
} from './utils/formatters';
import { getHealth, getStatistics, HealthData } from './api/client';
import { buildCacheKey, readCache, writeCache } from './utils/apiCache';

const STATS_CACHE_TTL = 15 * 60;
const LIFETIME_CACHE_TTL = 60 * 60;
const SNAPSHOT_KEY = 'boot_snapshot';
const SNAPSHOT_TTL = 24 * 60 * 60;

// Network-first fetch with a localStorage cache fallback.
// Serves fresh data when online and transparently falls back to cached
// data when the network is unreachable (offline / slow start support).
async function cachedStatistics<T>(
  query: Parameters<typeof getStatistics>[0],
  ttlSeconds = STATS_CACHE_TTL
): Promise<{ ok: boolean; data?: T; error?: string; fromCache?: boolean }> {
  const key = buildCacheKey('stats', JSON.stringify(query));
  const hit = readCache<T>(key);
  const res = await getStatistics(query);

  if (res.ok && res.data !== undefined) {
    writeCache(key, res.data as T, ttlSeconds);
    return { ok: true, data: res.data as T, fromCache: false };
  }

  if (hit) {
    return { ok: true, data: hit.data, error: res.error, fromCache: true };
  }

  return { ok: false, error: res.error, fromCache: false };
}

export default function App() {
  // App state - Default to 7 days stats
  const [datePreset, setDatePreset] = useState<DatePreset>('7d');
  const initialDates = useMemo(() => getDateRangeForPreset('7d'), []);
  const [dateFrom, setDateFrom] = useState(initialDates.from);
  const [dateTo, setDateTo] = useState(initialDates.to);

  // Statistics data
  const [dailyStats, setDailyStats] = useState<StatItem[]>([]);

  // Account overview / balance tracking: Lifetime Earnings minus Total Withdrawals (env only)
  const [apiLifetimeEarnings, setApiLifetimeEarnings] = useState<number>(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState<number>(0);

  // Dedicated recent stats cache (Today & Yesterday) so they persist even when switching ranges
  const [recentStats, setRecentStats] = useState<StatItem[]>([]);

  // Health and metadata
  const [hasKey, setHasKey] = useState(true);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Loading & error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showingCached, setShowingCached] = useState(false);

  // Apply health/env config to state
  const setHealthState = useCallback((data: HealthData) => {
    setHasKey(Boolean(data.hasKey));
    setMaskedKey(data.maskedKey);
    if (typeof data.totalWithdrawals === 'number') {
      setTotalWithdrawals(data.totalWithdrawals);
    }
  }, []);

  // Load lifetime balance & recent stats
  const loadInitialCollections = useCallback(async () => {
    try {
      // Check health & env config
      const healthRes = await getHealth();
      if (healthRes.ok && healthRes.data) {
        setHealthState(healthRes.data);
      }

      // Fetch full lifetime statistics for total lifetime earnings
      const today = getISODateString(new Date());
      const lifetimeRes = await cachedStatistics<{ result: StatItem[] }>(
        {
          date_from: '2024-01-01',
          date_to: today,
          page: 1,
          page_size: 500,
          group_by: ['date_time']
        },
        LIFETIME_CACHE_TTL
      );

      if (lifetimeRes.ok && Array.isArray(lifetimeRes.data?.result)) {
        const sum = lifetimeRes.data.result.reduce((acc: number, row: any) => {
          return acc + (parseFloat(row.money) || 0);
        }, 0);
        setApiLifetimeEarnings(sum);
        setRecentStats(lifetimeRes.data.result.slice(-14));
      }
    } catch (err: any) {
      console.warn('Initial collections loaded with non-fatal warning:', err);
    }
  }, [setHealthState]);

  // Fetch statistics according to current date filters
  const fetchStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Refresh health & env config
      getHealth().then(res => {
        if (res.ok && res.data) {
          setHealthState(res.data);
        }
      });

      // Fetch daily time-series statistics
      const dailyRes = await cachedStatistics<{ result: StatItem[] }>(
        {
          date_from: dateFrom,
          date_to: dateTo,
          page: 1,
          page_size: 500,
          group_by: ['date_time']
        },
        STATS_CACHE_TTL
      );

      if (!dailyRes.ok) {
        throw new Error(dailyRes.error || 'Failed to fetch statistics from Monetag');
      }

      setShowingCached(Boolean(dailyRes.fromCache));

      const rows: StatItem[] = Array.isArray(dailyRes.data?.result) ? dailyRes.data.result : [];
      setDailyStats(rows);

      if (!dailyRes.fromCache) {
        writeCache(
          SNAPSHOT_KEY,
          { dailyStats: rows, lastUpdated: new Date().toISOString() },
          SNAPSHOT_TTL
        );
      }

      // If dailyStats contains recent records, keep recentStats updated
      if (rows.length > 0) {
        setRecentStats(prev => {
          const merged = [...prev];
          rows.forEach(r => {
            const idx = merged.findIndex(m => m.date_time === r.date_time);
            if (idx >= 0) {
              merged[idx] = r;
            } else {
              merged.push(r);
            }
          });
          return merged;
        });
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Failed to communicate with Monetag API');
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, setHealthState]);

  // Load everything on mount and when API key changes
  useEffect(() => {
    loadInitialCollections();
  }, [loadInitialCollections]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Hydrate with the last known snapshot so the app renders instantly
  // (and works offline) before the network round-trip completes.
  useEffect(() => {
    const snap = readCache<{ dailyStats: StatItem[]; lastUpdated: string }>(SNAPSHOT_KEY);
    if (snap?.data) {
      if (Array.isArray(snap.data.dailyStats)) {
        setDailyStats(snap.data.dailyStats);
        setShowingCached(true);
      }
      if (snap.data.lastUpdated) {
        setLastUpdated(new Date(snap.data.lastUpdated));
      }
    }
  }, []);

  // Handle Date Preset Changes
  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      const range = getDateRangeForPreset(preset);
      setDateFrom(range.from);
      setDateTo(range.to);
    }
  };

  const handleCustomDateChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  // Calculate Aggregated Totals
  const aggregatedTotals: AggregatedStats = useMemo(() => {
    let totalImpressions = 0;
    let totalRequests = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalMoney = 0;

    dailyStats.forEach(item => {
      const money = typeof item.money === 'string' ? parseFloat(item.money) : Number(item.money || 0);
      const impressions = typeof item.impressions === 'string' ? parseFloat(item.impressions) : Number(item.impressions || 0);
      const requests = typeof item.requests === 'string' ? parseFloat(item.requests) : Number(item.requests || 0);
      const clicks = typeof item.clicks === 'string' ? parseFloat(item.clicks) : Number(item.clicks || 0);
      const conversions = typeof item.conversions === 'string' ? parseFloat(item.conversions) : Number(item.conversions || 0);

      totalMoney += money;
      totalImpressions += impressions;
      totalRequests += requests;
      totalClicks += clicks;
      totalConversions += conversions;
    });

    return {
      totalImpressions,
      totalRequests,
      totalClicks,
      totalConversions,
      totalMoney,
      avgCpm: calculateCpm(totalMoney, totalImpressions),
      avgCtr: calculateCtr(totalClicks, totalImpressions),
      fillRate: calculateFillRate(totalImpressions, totalRequests),
      activeDays: dailyStats.length
    };
  }, [dailyStats]);

  // Compute Today & Yesterday metrics (from dailyStats or recentStats fallback)
  const todayStr = useMemo(() => getISODateString(new Date()), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getISODateString(d);
  }, []);

  const todayStat = useMemo(() => {
    return (
      dailyStats.find(s => s.date_time === todayStr) ||
      recentStats.find(s => s.date_time === todayStr)
    );
  }, [dailyStats, recentStats, todayStr]);

  const yesterdayStat = useMemo(() => {
    return (
      dailyStats.find(s => s.date_time === yesterdayStr) ||
      recentStats.find(s => s.date_time === yesterdayStr)
    );
  }, [dailyStats, recentStats, yesterdayStr]);

  const todayMoney = todayStat ? (parseFloat(String(todayStat.money)) || 0) : 0;
  const todayImpressions = todayStat ? (parseInt(String(todayStat.impressions), 10) || 0) : 0;
  const todayCpm = calculateCpm(todayMoney, todayImpressions);

  const yesterdayMoney = yesterdayStat ? (parseFloat(String(yesterdayStat.money)) || 0) : 0;
  const yesterdayImpressions = yesterdayStat ? (parseInt(String(yesterdayStat.impressions), 10) || 0) : 0;
  const yesterdayCpm = calculateCpm(yesterdayMoney, yesterdayImpressions);

  // Effective Lifetime Earnings (custom override or API sum)
  // Effective Lifetime Earnings (computed from API lifetime statistics or period totals)
  const effectiveLifetimeEarnings = useMemo(() => {
    if (apiLifetimeEarnings > 0) return apiLifetimeEarnings;
    return aggregatedTotals.totalMoney;
  }, [apiLifetimeEarnings, aggregatedTotals.totalMoney]);

  // Current Balance = Total Lifetime Earnings - Total Withdrawals (configured via server env)
  const currentBalance = useMemo(() => {
    return effectiveLifetimeEarnings - totalWithdrawals;
  }, [effectiveLifetimeEarnings, totalWithdrawals]);

  return (
    <PullToRefresh onRefresh={fetchStatistics}>
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-neutral-100 flex flex-col font-sans antialiased transition-colors selection:bg-emerald-100 selection:text-emerald-900 dark:selection:bg-neutral-800 dark:selection:text-neutral-100">
        {/* Top Application Bar */}
        <Header
          lastUpdated={lastUpdated}
          hasKey={hasKey}
          maskedKey={maskedKey}
        />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-3.5 sm:space-y-4">
        {/* Date Filter Bar */}
        <FilterBar
          datePreset={datePreset}
          onDatePresetChange={handleDatePresetChange}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onCustomDateChange={handleCustomDateChange}
        />

        {/* Error Notification Banner */}
        {error && (
          <div className="p-3 rounded bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-xs">
            <div>
              <span className="font-semibold">Error: </span>
              <span className="font-mono text-[11px]">{error}</span>
            </div>
            <button
              onClick={fetchStatistics}
              className="px-2 py-1 bg-white dark:bg-rose-900/40 border border-rose-300 dark:border-rose-800/80 rounded text-rose-900 dark:text-rose-100 font-medium text-xs hover:bg-rose-50 dark:hover:bg-rose-900 cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Offline Cached Data Indicator */}
        {showingCached && !error && (
          <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-3 text-amber-800 dark:text-amber-200 text-[11px] font-mono">
            <span>
              Offline — showing cached data.
              {lastUpdated && ` Last synced ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`}
            </span>
          </div>
        )}

        {/* Highlights */}
        <EarningsHighlight
          currentBalance={currentBalance}
          effectiveLifetimeEarnings={effectiveLifetimeEarnings}
          totalWithdrawals={totalWithdrawals}
          todayMoney={todayMoney}
          todayImpressions={todayImpressions}
          todayCpm={todayCpm}
          todayDate={todayStr}
          yesterdayMoney={yesterdayMoney}
          yesterdayImpressions={yesterdayImpressions}
          yesterdayCpm={yesterdayCpm}
          yesterdayDate={yesterdayStr}
        />

        {/* Initial Loading / Content with smooth transitions */}
        <AnimatePresence mode="wait" initial={false}>
          {isLoading && dailyStats.length === 0 && !error ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-neutral-800 p-12 text-center text-xs text-slate-400 dark:text-neutral-500 font-mono"
            >
              Loading analytics...
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="space-y-4"
            >
              {/* Period KPI Cards */}
              <KpiGrid
                stats={aggregatedTotals}
                selectedDaysCount={aggregatedTotals.activeDays}
              />

              {/* Overview Section */}
              <div className="space-y-4">
                {/* Charts Section */}
                <ChartsSection stats={dailyStats} />

                {/* Daily Breakdown Table */}
                <DailyStatsTable
                  stats={dailyStats}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-neutral-900 pt-4 mt-8" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-400 dark:text-neutral-500">
            <span>Monetag SSP v5</span>
            <span className="font-mono text-[11px]">EST</span>
          </div>
        </footer>
      </div>
    </PullToRefresh>
  );
}
