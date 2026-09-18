// Monetag API key. No key is baked into the build — the user provides their
// own key the first time the app opens (stored on-device). An optional build
// time override is still supported via VITE_MONETAG_API_KEY (CI release builds).
export const MONETAG_API_KEY =
  (import.meta.env.VITE_MONETAG_API_KEY as string | undefined)?.trim() || '';

// Total cumulative withdrawals (USD) used for the balance calculation.
export const MONETAG_TOTAL_WITHDRAWALS = (() => {
  const v = parseFloat((import.meta.env.VITE_MONETAG_TOTAL_WITHDRAWALS as string | undefined) ?? '');
  return Number.isFinite(v) && v >= 0 ? v : 0;
})();

export const MONETAG_BASE_URL = 'https://api.monetag.com/v5';

// Runtime-overridable settings persisted by the in-app Settings page.
// Falls back to the value baked into the build when the user never changed it.
export const SETTINGS_STORAGE_KEY = 'monetag_settings_v1';

function readStored<T>(prop: string): T | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return undefined;
    return (JSON.parse(raw) as Record<string, unknown>)[prop] as T | undefined;
  } catch {
    return undefined;
  }
}

export function getApiKey(): string {
  const stored = readStored<string>('apiKey');
  return typeof stored === 'string' && stored.trim() ? stored : MONETAG_API_KEY;
}