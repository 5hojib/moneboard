import { useState, useCallback } from 'react';
import { MONETAG_API_KEY as DEFAULT_API_KEY, MONETAG_TOTAL_WITHDRAWALS as DEFAULT_WITHDRAWALS } from '../config';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Settings {
  apiKey: string;
  totalWithdrawals: number;
  themeMode: ThemeMode;
}

export const SETTINGS_STORAGE_KEY = 'monetag_settings_v1';

function getStoredSettings(): Partial<Settings> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Settings>;
  } catch {
    return {};
  }
}

export function loadSettings(): Settings {
  const stored = getStoredSettings();
  const withdrawals = Number(stored.totalWithdrawals);
  const themeMode: ThemeMode =
    stored.themeMode === 'light' || stored.themeMode === 'dark' || stored.themeMode === 'system'
      ? stored.themeMode
      : 'system';

  return {
    apiKey: typeof stored.apiKey === 'string' && stored.apiKey.trim() ? stored.apiKey.trim() : DEFAULT_API_KEY,
    totalWithdrawals: Number.isFinite(withdrawals) && withdrawals >= 0 ? withdrawals : DEFAULT_WITHDRAWALS,
    themeMode,
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const setApiKey = useCallback((apiKey: string) => update({ apiKey: apiKey.trim() }), [update]);
  const setTotalWithdrawals = useCallback((totalWithdrawals: number) => update({ totalWithdrawals }), [update]);
  const setThemeMode = useCallback((themeMode: ThemeMode) => update({ themeMode }), [update]);

  return { settings, setApiKey, setTotalWithdrawals, setThemeMode };
}