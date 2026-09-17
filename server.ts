import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;
const MONETAG_BASE_URL = 'https://api.monetag.com/v5';
const DEFAULT_KEY = process.env.MONETAG_API_KEY || '0c2e80e977b00db4cbe43041d2e8b84eb7970fed2214fdba';

app.use(express.json());

function getApiKey(req?: express.Request): string {
  // Configured purely via server environment variable MONETAG_API_KEY
  return process.env.MONETAG_API_KEY || DEFAULT_KEY;
}

function getTotalWithdrawals(): number {
  // Configured purely via server environment variable MONETAG_TOTAL_WITHDRAWALS
  const val = process.env.MONETAG_TOTAL_WITHDRAWALS || process.env.WITHDRAWAL_AMOUNT || '0';
  const parsed = parseFloat(val);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

// Helper to safely call Monetag API with timeout and robust non-JSON/HTML handling
async function safeFetchMonetag(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 15000
): Promise<{ ok: boolean; status: number; data?: any; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${MONETAG_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timer);

    const rawText = await response.text();
    const trimmed = rawText.trim();
    const isHtml = trimmed.startsWith('<') || trimmed.toLowerCase().includes('<!doctype') || trimmed.toLowerCase().includes('<html');

    if (isHtml) {
      const titleMatch = rawText.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : `HTTP ${response.status}`;
      return {
        ok: false,
        status: response.status || 502,
        error: `Monetag API temporarily unavailable (${title})`
      };
    }

    if (!trimmed) {
      return {
        ok: response.ok,
        status: response.status,
        data: null
      };
    }

    try {
      const json = JSON.parse(trimmed);
      if (!response.ok) {
        const msg = json?.error || json?.message || `Monetag API error (${response.status})`;
        return {
          ok: false,
          status: response.status,
          error: typeof msg === 'string' ? msg : JSON.stringify(msg),
          data: json
        };
      }
      return {
        ok: true,
        status: response.status,
        data: json
      };
    } catch {
      return {
        ok: false,
        status: response.status || 502,
        error: `Invalid response format from Monetag (HTTP ${response.status})`
      };
    }
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return {
        ok: false,
        status: 504,
        error: 'Monetag API request timed out (15s). Please retry.'
      };
    }
    return {
      ok: false,
      status: 500,
      error: err.message || 'Network error connecting to Monetag API'
    };
  }
}

// Health check and config status
app.get('/api/health', (req, res) => {
  const apiKey = getApiKey(req);
  const totalWithdrawals = getTotalWithdrawals();
  res.json({
    status: 'ok',
    hasKey: Boolean(apiKey),
    maskedKey: apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : null,
    totalWithdrawals,
    timestamp: new Date().toISOString()
  });
});

// Proxy GET /pub/balance
app.get('/api/balance', async (req, res) => {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'API key not configured' });
  }

  const result = await safeFetchMonetag('/pub/balance', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!result.ok) {
    return res.status(result.status).json({ error: result.error });
  }
  res.json(result.data);
});

// Proxy GET /pub/sites
app.get('/api/sites', async (req, res) => {
  const apiKey = getApiKey(req);
  const result = await safeFetchMonetag('/pub/sites', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!result.ok) {
    return res.status(result.status).json({ error: result.error });
  }
  res.json(result.data);
});

// Proxy GET /pub/zones
app.get('/api/zones', async (req, res) => {
  const apiKey = getApiKey(req);
  const result = await safeFetchMonetag('/pub/zones', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!result.ok) {
    return res.status(result.status).json({ error: result.error });
  }
  res.json(result.data);
});

// Proxy GET /collections/countries
app.get('/api/countries', async (req, res) => {
  const apiKey = getApiKey(req);
  const result = await safeFetchMonetag('/collections/countries', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!result.ok) {
    return res.status(result.status).json({ error: result.error });
  }
  res.json(result.data);
});

// Proxy POST /pub/statistics
app.post('/api/statistics', async (req, res) => {
  try {
    const apiKey = getApiKey(req);
    const {
      date_from,
      date_to,
      group_by,
      formats,
      site_ids,
      zone_ids,
      countries,
      page = 1,
      page_size = 100
    } = req.body;

    if (!date_from || !date_to) {
      return res.status(400).json({ error: 'date_from and date_to parameters are required (YYYY-MM-DD)' });
    }

    const payload: Record<string, any> = {
      date_from,
      date_to,
      page: Number(page),
      page_size: Math.min(Number(page_size), 500)
    };

    if (Array.isArray(group_by) && group_by.length > 0) {
      payload.group_by = group_by;
    }
    if (Array.isArray(formats) && formats.length > 0) {
      payload.formats = formats;
    }
    if (Array.isArray(site_ids) && site_ids.length > 0) {
      payload.site_ids = site_ids.map(Number);
    }
    if (Array.isArray(zone_ids) && zone_ids.length > 0) {
      payload.zone_ids = zone_ids.map(Number);
    }
    if (Array.isArray(countries) && countries.length > 0) {
      payload.countries = countries;
    }

    const result = await safeFetchMonetag('/pub/statistics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error: any) {
    console.error('Error in statistics handler:', error);
    res.status(500).json({ error: error.message || 'Internal server error fetching statistics' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Monetag Dashboard Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
