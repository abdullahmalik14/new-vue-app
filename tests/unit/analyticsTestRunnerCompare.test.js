import { describe, expect, it } from 'vitest';

import {
  compareNumbers,
  compareExpectedObject,
  compareExpectedToFound,
} from '@/analytics-test-runner/compare/index.js';

describe('analytics test runner compare', () => {
  it('compareNumbers passes within tolerance', () => {
    expect(compareNumbers(29.99, 29.991, 0.01).message).toContain('Internal matches found');
  });

  it('compareNumbers fails outside tolerance', () => {
    const result = compareNumbers(10, 12, 0.01);
    expect(result.pass).toBe(false);
    expect(result.message).toContain('Numeric mismatch');
  });

  it('compareExpectedObject checks numeric chart fields', () => {
    const result = compareExpectedObject({ total: 15, merch: 15 }, { total: 15, merch: 14.99 }, 0.01);
    expect(result.pass).toBe(true);
  });

  it('compareExpectedToFound maps expected rows to pass/fail', () => {
    const expectedRows = [
      { id: 'a', view: 'Main', metric: 'Earnings', period: 'day', source: 'dom', expectedValue: 10, tolerance: 0.01 },
    ];
    const foundRows = [
      { expectedId: 'a', ok: true, foundValue: 10, error: null },
    ];

    const rows = compareExpectedToFound(expectedRows, foundRows);
    expect(rows).toHaveLength(1);
    expect(rows[0].pass).toBe(true);
  });

  it('compareExpectedToFound fails when scan errored', () => {
    const expectedRows = [
      { id: 'b', view: 'API', metric: 'orders', period: 'day', source: 'api', expectedValue: 1 },
    ];
    const foundRows = [
      { expectedId: 'b', ok: false, foundValue: null, error: 'Missing API path recentOrders.subscriptions' },
    ];

    const rows = compareExpectedToFound(expectedRows, foundRows);
    expect(rows[0].pass).toBe(false);
    expect(rows[0].message).toContain('Missing API path');
  });
});
