import { Capacitor } from '@capacitor/core';

// True when running inside the native Capacitor (Android) shell.
export const IS_NATIVE = Capacitor.isNativePlatform();

// Monetag API key baked into the build. Defaults to the key already used by
// the bundled web proxy, so the Android app works with zero configuration.
export const MONETAG_API_KEY =
  (import.meta.env.VITE_MONETAG_API_KEY as string | undefined)?.trim() ||
  '0c2e80e977b00db4cbe43041d2e8b84eb7970fed2214fdba';

// Total cumulative withdrawals (USD) used for the balance calculation.
export const MONETAG_TOTAL_WITHDRAWALS = (() => {
  const v = parseFloat((import.meta.env.VITE_MONETAG_TOTAL_WITHDRAWALS as string | undefined) ?? '');
  return Number.isFinite(v) && v >= 0 ? v : 0;
})();

export const MONETAG_BASE_URL = 'https://api.monetag.com/v5';

// Native builds talk to the Monetag API directly — its CORS policy reflects any
// origin (including the Android WebView's https://localhost) and serves the
// exact same JSON shape the dashboard consumes. This removes the need for a
// hosted backend / separate API base URL. The web build keeps using the
// same-origin /api proxy untouched.
export const USE_DIRECT_MONETAG = IS_NATIVE;