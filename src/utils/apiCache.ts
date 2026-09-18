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