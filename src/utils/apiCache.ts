import type { StatItem } from '../types';

const PREFIX = 'monetag_cache_v1';

export interface CacheEntry<T> {
  t: number;
  ttl: number;
  data: T;
}

export function buildCacheKey(url: string, body?: string): string {
  const input = `${url}|${body ?? ''}`;
  let h1 = 32749;
  let h2 = 7741;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761) | 0;
    h2 = Math.imul(h2 + c, 591798841) | 0;
  }
  return `${(h1 >>> 0).toString(36)}${(h2 >>> 0).toString(36)}`;
}

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T, ttlSeconds: number): void {
  const s = storage();
  if (!s) return;
  try {
    const entry: CacheEntry<T> = { t: Date.now(), ttl: ttlSeconds, data };
    s.setItem(`${PREFIX}:${key}`, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable – fail silently.
  }
}

export function readCache<T>(key: string): { data: T; ageSeconds: number } | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(`${PREFIX}:${key}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    const ageSeconds = (Date.now() - entry.t) / 1000;
    if (ageSeconds > entry.ttl) return null;
    return { data: entry.data, ageSeconds };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Day-indexed statistics cache                                        */
/*                                                                     */
/* The app stores every fetched daily row in a single day index keyed  */
/* by API key. Charts/filter ranges are served straight from this      */
/* index (no API round trip), and refreshes only fetch the *missing*   */
/* days (smart/offline-friendly incremental sync).                     */
/* ------------------------------------------------------------------ */

export interface DayCacheEntry {
  t: number;
  apiKey: string;
  rows: StatItem[];
}

const DAY_CACHE_TTL = 365 * 24 * 60 * 60; // 1 year — treated as long-lived history

function dayCacheKey(apiKey: string): string {
  return buildCacheKey('days', `v2|${apiKey}`);
}

// Builds a fully-populated day index for the given API key. Returns an
// empty array if there is no cache (or the cache belongs to a different key).
export function getDayIndex(apiKey: string): StatItem[] {
  const s = storage();
  if (!s || !apiKey) return [];
  try {
    const raw = s.getItem(`${PREFIX}:${dayCacheKey(apiKey)}`);
    if (!raw) return [];
    const entry = JSON.parse(raw) as DayCacheEntry;
    if (!Array.isArray(entry.rows)) return [];
    if (entry.apiKey !== apiKey) return [];
    if ((Date.now() - entry.t) / 1000 > DAY_CACHE_TTL) return [];
    return entry.rows;
  } catch {
    return [];
  }
}

// Merges freshly fetched rows into the day index (later dates win for the
// same day so an updated "today" row replaces a stale one). Returns the
// merged, chronologically sorted rows.
export function mergeDayIndex(apiKey: string, incoming: StatItem[]): StatItem[] {
  const current = getDayIndex(apiKey);
  const byDate = new Map<string, StatItem>();
  for (const row of current) {
    if (row.date_time) byDate.set(row.date_time, row);
  }
  for (const row of incoming) {
    if (row.date_time) byDate.set(row.date_time, row);
  }
  const merged = [...byDate.values()].sort((a, b) =>
    (a.date_time as string) < (b.date_time as string) ? -1 : 1
  );

  const s = storage();
  if (s && apiKey) {
    try {
      const entry: DayCacheEntry = { t: Date.now(), apiKey, rows: merged };
      s.setItem(`${PREFIX}:${dayCacheKey(apiKey)}`, JSON.stringify(entry));
    } catch {
      // Storage full or unavailable – fail silently.
    }
  }
  return merged;
}

// The latest date known in the day index (or null when empty).
export function getNewestDay(apiKey: string): string | null {
  const rows = getDayIndex(apiKey);
  if (rows.length === 0) return null;
  return rows[rows.length - 1].date_time ?? null;
}

// Earliest date known in the day index (or null when empty).
export function getOldestDay(apiKey: string): string | null {
  const rows = getDayIndex(apiKey);
  if (rows.length === 0) return null;
  return rows[0].date_time ?? null;
}

// Role for the "today / hold window" so we can tell a fully realized day
// (data already available) from a not-yet-available one.
export function dayIsComplete(apiKey: string, iso: string): boolean {
  const rows = getDayIndex(apiKey);
  return rows.some(r => r.date_time === iso);
}