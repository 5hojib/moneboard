// API day boundary is 11:00 AM Bangladesh time (UTC+6), not local midnight.
// Map "now" to the API's current date accordingly.
export function getApiTodayISO(): string {
  const BD_OFFSET_MS = 6 * 60 * 60 * 1000;
  const API_DAY_START_BD_HOURS = 11;
  const now = new Date();
  const bdMs = now.getTime() + BD_OFFSET_MS;
  const apiMs = bdMs - API_DAY_START_BD_HOURS * 60 * 60 * 1000;
  const d = new Date(apiMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
