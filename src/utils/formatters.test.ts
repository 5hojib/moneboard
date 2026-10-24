import { describe, it, expect } from 'vitest';
import { getApiTodayISO, addDaysISO, groupConsecutiveRanges, getMissingDates, listDates } from './formatters';

describe('addDaysISO', () => {
  it('adds days across month boundaries', () => {
    expect(addDaysISO('2026-01-31', 1)).toBe('2026-02-01');
  });
  it('subtracts days', () => {
    expect(addDaysISO('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('listDates / getMissingDates', () => {
  it('lists inclusive range', () => {
    expect(listDates('2026-01-01', '2026-01-03')).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
  });
  it('returns missing dates', () => {
    expect(getMissingDates('2026-01-01', '2026-01-03', ['2026-01-02'])).toEqual(['2026-01-01', '2026-01-03']);
  });
});

describe('groupConsecutiveRanges', () => {
  it('groups contiguous dates', () => {
    expect(groupConsecutiveRanges(['2026-01-01', '2026-01-02', '2026-01-04'])).toEqual([
      { from: '2026-01-01', to: '2026-01-02' },
      { from: '2026-01-04', to: '2026-01-04' },
    ]);
  });
});

describe('getApiTodayISO', () => {
  it('returns an ISO date', () => {
    expect(getApiTodayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
