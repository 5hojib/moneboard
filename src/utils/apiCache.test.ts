import { describe, it, expect, beforeEach } from 'vitest';
import { getDayIndex, mergeDayIndex, clearDayIndex } from './apiCache';

describe('day index cache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('merges and dedups by date', () => {
    mergeDayIndex('key1', [{ date_time: '2026-01-01', money: '1' } as any]);
    const merged = mergeDayIndex('key1', [
      { date_time: '2026-01-01', money: '2' } as any,
      { date_time: '2026-01-02', money: '3' } as any,
    ]);
    expect(merged).toHaveLength(2);
    expect(merged.find(r => r.date_time === '2026-01-01')?.money).toBe('2');
  });

  it('isolates by api key', () => {
    mergeDayIndex('keyA', [{ date_time: '2026-01-01', money: '1' } as any]);
    expect(getDayIndex('keyB')).toHaveLength(0);
  });

  it('clears cache', () => {
    mergeDayIndex('key1', [{ date_time: '2026-01-01', money: '1' } as any]);
    clearDayIndex('key1');
    expect(getDayIndex('key1')).toHaveLength(0);
  });
});
