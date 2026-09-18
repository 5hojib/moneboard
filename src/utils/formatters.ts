export function formatCurrency(val: number | string | undefined): string {
  const num = typeof val === 'string' ? parseFloat(val) : Number(val || 0);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: num >= 1000 ? 2 : 4
  }).format(num);
}

// Currency with exactly two decimals, used on the home balance hero.
export function formatCurrencyFixed(val: number | string | undefined): string {
  const num = typeof val === 'string' ? parseFloat(val) : Number(val || 0);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

export function formatCompactNumber(val: number | string | undefined): string {
  const num = typeof val === 'string' ? parseFloat(val) : Number(val || 0);
  if (isNaN(num)) return '0';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toLocaleString('en-US');
}

export function formatNumber(val: number | string | undefined): string {
  const num = typeof val === 'string' ? parseFloat(val) : Number(val || 0);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

export function formatPercent(val: number | string | undefined): string {
  const num = typeof val === 'string' ? parseFloat(val) : Number(val || 0);
  if (isNaN(num)) return '0.00%';
  return `${num.toFixed(2)}%`;
}

export function calculateCpm(money: number | string | undefined, impressions: number | string | undefined): number {
  const m = typeof money === 'string' ? parseFloat(money) : Number(money || 0);
  const imp = typeof impressions === 'string' ? parseFloat(impressions) : Number(impressions || 0);
  if (imp <= 0) return 0;
  return (m / imp) * 1000;
}

export function calculateCtr(clicks: number | string | undefined, impressions: number | string | undefined): number {
  const c = typeof clicks === 'string' ? parseFloat(clicks) : Number(clicks || 0);
  const imp = typeof impressions === 'string' ? parseFloat(impressions) : Number(impressions || 0);
  if (imp <= 0) return 0;
  return (c / imp) * 100;
}

export function getISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Returns the ISO date `daysOffset` days away from an ISO date string.
// All math happens in UTC, so results never shift across timezone boundaries.
// ISO dates compare lexicographically, so these are safe to sort/range.
export function addDaysISO(iso: string, daysOffset: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + daysOffset);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// Lists every ISO date in the inclusive range [fromISO, toISO], ascending.
export function listDates(fromISO: string, toISO: string): string[] {
  const dates: string[] = [];
  for (let d = fromISO; d <= toISO; d = addDaysISO(d, 1)) {
    dates.push(d);
  }
  return dates;
}

// Returns the subset of [fromISO, toISO] that is NOT present among `knownISO`.
export function getMissingDates(fromISO: string, toISO: string, knownISO: string[]): string[] {
  const known = new Set(knownISO);
  return listDates(fromISO, toISO).filter(d => !known.has(d));
}

// Groups a list of ISO dates into contiguous ranges of consecutive days,
// so the API can be called once per range instead of once per day.
export function groupConsecutiveRanges(dates: string[]): { from: string; to: string }[] {
  const sorted = [...dates].sort();
  const ranges: { from: string; to: string }[] = [];
  let start: string | null = null;
  let prev: string | null = null;

  for (const d of sorted) {
    if (start === null) {
      start = d;
      prev = d;
      continue;
    }
    if (prev !== null && addDaysISO(prev, 1) === d) {
      prev = d;
      continue;
    }
    if (start !== null && prev !== null) {
      ranges.push({ from: start, to: prev });
    }
    start = d;
    prev = d;
  }
  if (start !== null && prev !== null) {
    ranges.push({ from: start, to: prev });
  }
  return ranges;
}

export function getDateRangeForPreset(preset: string): { from: string; to: string } {
  const today = new Date();
  const to = getISODateString(today);

  switch (preset) {
    case '7d': {
      const fromDate = new Date();
      fromDate.setDate(today.getDate() - 6);
      return { from: getISODateString(fromDate), to };
    }
    case '30d': {
      const fromDate = new Date();
      fromDate.setDate(today.getDate() - 30);
      return { from: getISODateString(fromDate), to };
    }
    case 'all':
    default: {
      return { from: '2024-01-01', to };
    }
  }
}
