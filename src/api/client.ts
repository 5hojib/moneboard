import {
  getApiKey,
  MONETAG_BASE_URL,
  USE_DIRECT_MONETAG,
} from '../config';
import type { StatItem } from '../types';

export interface StatisticsQuery {
  date_from: string;
  date_to: string;
  page?: number;
  page_size?: number;
  group_by?: string[];
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}

const DIRECT_TIMEOUT_MS = 15000;
const SAFE_HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' };

function parseBody<T>(text: string, status: number): ApiResponse<T> {
  const trimmed = text.trim();

  if (trimmed.startsWith('<') || /<!doctype|<html/i.test(trimmed)) {
    const title = text.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || `HTTP ${status}`;
    return { ok: false, error: `Server returned non-JSON page (${title}).` };
  }

  if (!trimmed) {
    return { ok: status < 400, error: status < 400 ? undefined : `Empty response from server (HTTP ${status})` };
  }

  try {
    const json = JSON.parse(trimmed);
    if (status < 200 || status >= 300) {
      const msg = json?.errors?.[0] || json?.error || json?.message || `Request failed with status ${status}`;
      return { ok: false, error: typeof msg === 'string' ? msg : JSON.stringify(msg), data: json };
    }
    return { ok: true, data: json };
  } catch {
    return { ok: false, error: `Invalid JSON response received (HTTP ${status})` };
  }
}

async function rawFetch(url: string, init: RequestInit, withTimeout: boolean): Promise<ApiResponse> {
  const controller = new AbortController();
  const timer = withTimeout ? setTimeout(() => controller.abort(), DIRECT_TIMEOUT_MS) : null;

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const text = await res.text();
    return parseBody(text, res.status);
  } catch (err: any) {
    return {
      ok: false,
      error:
        err?.name === 'AbortError'
          ? 'Monetag API request timed out (15s). Please retry.'
          : err?.message || 'Network request failed',
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function getStatistics(
  body: StatisticsQuery
): Promise<ApiResponse<{ result: StatItem[]; meta?: any }>> {
  const { page = 1, page_size = 500, ...rest } = body;
  const payload = { page: Number(page), page_size: Math.min(Number(page_size), 500), ...rest };

  if (USE_DIRECT_MONETAG) {
    return rawFetch(
      `${MONETAG_BASE_URL}/pub/statistics`,
      {
        method: 'POST',
        headers: {
          ...SAFE_HEADERS,
          'Authorization': `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify(payload),
      },
      true
    );
  }

  return rawFetch(
    '/api/statistics',
    {
      method: 'POST',
      headers: SAFE_HEADERS,
      body: JSON.stringify(payload),
    },
    false
  );
}