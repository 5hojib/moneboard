import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTouchSwipe } from './hooks/useTouchSwipe';
import { AnimatePresence, motion } from 'motion/react';
import Header from './components/Header';
import PullToRefresh from './components/PullToRefresh';
import BottomNav, { TabId } from './components/BottomNav';
import EarningsHighlight from './components/EarningsHighlight';
import ChartsSection from './components/ChartsSection';
import FilterBar from './components/FilterBar';
import DailyStatsTable from './components/DailyStatsTable';
import SettingsPage from './components/SettingsPage';
import OnboardingScreen from './components/OnboardingScreen';
import { useSettingsContext } from './context/SettingsContext';

import {
  StatItem,
  AggregatedStats,
  DatePreset
} from './types';
import {
  getDateRangeForPreset,
  getISODateString,
  calculateCpm,
  calculateCtr
} from './utils/formatters';
import { getStatistics } from './api/client';
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
  const { settings } = useSettingsContext();

  // Bottom navigation
  const [tab, setTab] = useState<TabId>('home');

  // Left/right swipe moves between tabs (home → daily → graph → settings)
  const TAB_ORDER: TabId[] = ['home', 'daily', 'graph', 'settings'];
  const handleSwipe = useCallback((dir: 'left' | 'right') => {
    setTab(tab => {
      const idx = TAB_ORDER.indexOf(tab);
      const next = dir === 'left' ? idx + 1 : idx - 1;
      return next >= 0 && next < TAB_ORDER.length ? TAB_ORDER[next] : tab;
    });
  }, []);
  useTouchSwipe(handleSwipe);

  // App state - Default to 7 days stats
  const [datePreset, setDatePreset] = useState<DatePreset>('7d');
  const initialDates = useMemo(() => getDateRangeForPreset('7d'), []);
  const [dateFrom, setDateFrom] = useState(initialDates.from);
  const [dateTo, setDateTo] = useState(initialDates.to);

  // Statistics data
  const [dailyStats, setDailyStats] = useState<StatItem[]>([]);

  // Account overview / balance tracking: Lifetime Earnings minus Total Withdrawals
  const [apiLifetimeEarnings, setApiLifetimeEarnings] = useState<number>(0);

  // Dedicated recent stats cache (Today & Yesterday) so they persist even when switching ranges
  const [recentStats, setRecentStats] = useState<StatItem[]>([]);

  // Metadata
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Loading & error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showingCached, setShowingCached] = useState(false);

  // Settings-driven account info
  const hasKey = settings.apiKey.trim().length > 0;
  const maskedKey = hasKey
    ? `${settings.apiKey.slice(0, 4)}...${settings.apiKey.slice(-4)}`
    : null;
  const totalWithdrawals = settings.totalWithdrawals;

  // Load lifetime balance & recent stats
  const loadInitialCollections = useCallback(async () => {
    try {
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
  }, []);

  // Fetch statistics according to current date filters
  const fetchStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
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
  }, [dateFrom, dateTo]);

  // Load everything on mount (skipped until an API key is configured)
  useEffect(() => {
    if (!hasKey) return;
    loadInitialCollections();
  }, [hasKey, loadInitialCollections]);

  useEffect(() => {
    if (!hasKey) return;
    fetchStatistics();
  }, [hasKey, fetchStatistics]);

  // Re-fetch with fresh credentials whenever the API key changes in Settings
  const prevKeyRef = useRef(settings.apiKey);
  useEffect(() => {
    if (prevKeyRef.current !== settings.apiKey) {
      prevKeyRef.current = settings.apiKey;
      loadInitialCollections();
      fetchStatistics();
    }
  }, [settings.apiKey, fetchStatistics, loadInitialCollections]);

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
    let totalClicks = 0;
    let totalMoney = 0;

    dailyStats.forEach(item => {
      const money = typeof item.money === 'string' ? parseFloat(item.money) : Number(item.money || 0);
      const impressions = typeof item.impressions === 'string' ? parseFloat(item.impressions) : Number(item.impressions || 0);
      const clicks = typeof item.clicks === 'string' ? parseFloat(item.clicks) : Number(item.clicks || 0);

      totalMoney += money;
      totalImpressions += impressions;
      totalClicks += clicks;
    });

    return {
      totalImpressions,
      totalClicks,
      totalMoney,
      avgCpm: calculateCpm(totalMoney, totalImpressions),
      avgCtr: calculateCtr(totalClicks, totalImpressions),
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

  // Effective Lifetime Earnings (computed from API lifetime statistics or period totals)
  const effectiveLifetimeEarnings = useMemo(() => {
    if (apiLifetimeEarnings > 0) return apiLifetimeEarnings;
    return aggregatedTotals.totalMoney;
  }, [apiLifetimeEarnings, aggregatedTotals.totalMoney]);

  // Current Balance = Total Lifetime Earnings - Total Withdrawals (configurable in Settings)
  const currentBalance = useMemo(() => {
    return effectiveLifetimeEarnings - totalWithdrawals;
  }, [effectiveLifetimeEarnings, totalWithdrawals]);

  // Monetag holds the last 4 days of earnings. Sum the last 4 distinct daily
  // rows (from recentStats, already sorted chronologically by the API) to get
  // the held balance; the rest of the balance is approved / withdrawable.
  const heldBalance = useMemo(() => {
    const sorted = [...recentStats]
      .filter(s => s.date_time)
      .sort((a, b) => (a.date_time! > b.date_time! ? 1 : -1))
      .slice(-4);
    return sorted.reduce((acc, s) => acc + (parseFloat(s.money as any) || 0), 0);
  }, [recentStats]);

  const approvedBalance = useMemo(() => {
    return Math.max(0, currentBalance - heldBalance);
  }, [currentBalance, heldBalance]);

  const filterBar = (
    <FilterBar
      datePreset={datePreset}
      onDatePresetChange={handleDatePresetChange}
      dateFrom={dateFrom}
      dateTo={dateTo}
      onCustomDateChange={handleCustomDateChange}
    />
  );

  const loadingPanel = (
    <div className="bg-white dark:bg-black rounded-2xl p-8 text-center text-xs text-slate-400 dark:text-neutral-500 font-mono">
      Loading analytics...
    </div>
  );

  const isEmpty = dailyStats.length === 0 && !isLoading;
  const emptyPanel = (
    <div className="bg-white dark:bg-black rounded-2xl p-6 text-center text-xs text-slate-400 dark:text-neutral-500 font-mono">
      No data in the selected range.
    </div>
  );

  // Fresh installs have no API key yet — ask for it (and withdrawals) before
  // showing the dashboard, instead of relying on a bundled key.
  if (!hasKey) {
    return <OnboardingScreen />;
  }

  return (
    <PullToRefresh onRefresh={fetchStatistics}>
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-neutral-100 flex flex-col font-sans antialiased transition-colors selection:bg-slate-200 selection:text-slate-900 dark:selection:bg-neutral-800 dark:selection:text-neutral-100">
        {/* Top Application Bar */}
        <Header
          lastUpdated={lastUpdated}
          hasKey={hasKey}
          maskedKey={maskedKey}
        />

        {/* Main Container */}
        <main
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3"
          style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Error Notification Banner */}
          {error && tab !== 'settings' && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 flex items-center justify-between gap-3 text-slate-800 dark:text-neutral-200 text-xs">
              <div>
                <span className="font-semibold">Error: </span>
                <span className="font-mono text-[11px]">{error}</span>
              </div>
              <button
                onClick={fetchStatistics}
                className="px-2 py-1 bg-white dark:bg-black border border-slate-300 dark:border-neutral-600 rounded text-slate-900 dark:text-neutral-100 font-medium text-xs hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Offline Cached Data Indicator */}
          {showingCached && !error && tab !== 'settings' && (
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-900 flex items-center justify-between gap-3 text-slate-500 dark:text-neutral-400 text-[11px] font-mono">
              <span>
                Offline — showing cached data.
                {lastUpdated && ` Last synced ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`}
              </span>
            </div>
          )}

          {/* Tab content with smooth transitions */}
          <AnimatePresence mode="wait" initial={false}>
            {tab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-3"
              >
                <EarningsHighlight
                  currentBalance={currentBalance}
                  effectiveLifetimeEarnings={effectiveLifetimeEarnings}
                  totalWithdrawals={totalWithdrawals}
                  heldBalance={heldBalance}
                  approvedBalance={approvedBalance}
                  todayMoney={todayMoney}
                  todayImpressions={todayImpressions}
                  todayCpm={todayCpm}
                  todayDate={todayStr}
                  yesterdayMoney={yesterdayMoney}
                  yesterdayImpressions={yesterdayImpressions}
                  yesterdayCpm={yesterdayCpm}
                  yesterdayDate={yesterdayStr}
                />
              </motion.div>
            )}

            {tab === 'graph' && (
              <motion.div
                key="graph"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-3"
              >
                {filterBar}
                {isLoading && dailyStats.length === 0 && !error ? loadingPanel : isEmpty ? emptyPanel : <ChartsSection stats={dailyStats} />}
              </motion.div>
            )}

            {tab === 'daily' && (
              <motion.div
                key="daily"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-3"
              >
                {filterBar}
                <DailyStatsTable stats={dailyStats} />
              </motion.div>
            )}

            {tab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <SettingsPage />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={tab} onTabChange={setTab} />
      </div>
    </PullToRefresh>
  );
}