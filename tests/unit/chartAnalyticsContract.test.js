/**
 * Unit tests for chartAnalyticsContract stamp logic.
 * Uses the in-process functions directly (not via window global).
 */
import { describe, it, expect, beforeEach } from 'vitest';

// Import only the functions that don't depend on window globals.
// We define window.chartAnalyticsContract manually for tests that need it.
import {
  buildChartAnalyticsValues,
  stampChartAnalyticsContract,
  clearChartAnalyticsContract,
  derivePeriodFromChartId,
  deriveChartType,
  lookupMetricKey,
} from '../../public/chartAnalyticsContract.js';

// ── derivePeriodFromChartId ───────────────────────────────────────────────────

describe('derivePeriodFromChartId', () => {
  it('extracts day from daily', () => {
    expect(derivePeriodFromChartId('sales-daily-donut')).toBe('day');
  });
  it('extracts week from weekly', () => {
    expect(derivePeriodFromChartId('sales-weekly-bar')).toBe('week');
  });
  it('extracts month from monthly', () => {
    expect(derivePeriodFromChartId('tokens-monthly-bar')).toBe('month');
  });
  it('extracts year from yearly', () => {
    expect(derivePeriodFromChartId('subs-yearly-bar')).toBe('year');
  });
  it('extracts alltime', () => {
    expect(derivePeriodFromChartId('fans-alltime-bar')).toBe('alltime');
  });
  it('defaults to day for unknown', () => {
    expect(derivePeriodFromChartId('mystery-chart')).toBe('day');
  });
});

// ── deriveChartType ───────────────────────────────────────────────────────────

describe('deriveChartType', () => {
  it('returns donut from PieChart', () => {
    expect(deriveChartType('PieChart', '')).toBe('donut');
  });
  it('returns donut from chartId contains donut', () => {
    expect(deriveChartType('', 'sales-daily-donut')).toBe('donut');
  });
  it('returns bar from bar chartId', () => {
    expect(deriveChartType('', 'subs-weekly-bar')).toBe('bar');
  });
  it('returns map from map chartId', () => {
    expect(deriveChartType('', 'countries-map')).toBe('map');
  });
});

// ── lookupMetricKey ───────────────────────────────────────────────────────────

describe('lookupMetricKey', () => {
  it('maps subscription to earnings.subscription', () => {
    expect(lookupMetricKey('subscription')).toBe('earnings.subscription');
  });
  it('maps sub to earnings.subscription', () => {
    expect(lookupMetricKey('sub')).toBe('earnings.subscription');
  });
  it('maps newFollowers to fans.new-followers', () => {
    expect(lookupMetricKey('newFollowers')).toBe('fans.new-followers');
  });
  it('maps New Subscriber to subscribers.new', () => {
    expect(lookupMetricKey('New Subscriber')).toBe('subscribers.new');
  });
  it('returns null for unknown key', () => {
    expect(lookupMetricKey('unknownField')).toBeNull();
  });
  it('returns null for null input', () => {
    expect(lookupMetricKey(null)).toBeNull();
  });
});

// ── buildChartAnalyticsValues — donut ─────────────────────────────────────────

describe('buildChartAnalyticsValues (donut)', () => {
  it('extracts scalar values from donut rows by name', () => {
    const values = buildChartAnalyticsValues({
      chartType: 'donut',
      breakdownKeys: [],
      datasetRows: [
        { name: 'subscription', value: 150 },
        { name: 'merch', value: 25 },
      ],
      metricMap: {},
    });
    expect(values['earnings.subscription']).toBe(150);
    expect(values['earnings.merch']).toBe(25);
  });

  it('maps "New Subscriber" slice to subscribers.new', () => {
    const values = buildChartAnalyticsValues({
      chartType: 'donut',
      breakdownKeys: [],
      datasetRows: [{ name: 'New Subscriber', value: 7 }],
    });
    expect(values['subscribers.new']).toBe(7);
  });

  it('ignores rows with no name field', () => {
    const values = buildChartAnalyticsValues({
      chartType: 'donut',
      datasetRows: [{ value: 99 }],
    });
    expect(Object.keys(values)).toHaveLength(0);
  });
});

// ── buildChartAnalyticsValues — bar ──────────────────────────────────────────

describe('buildChartAnalyticsValues (bar)', () => {
  it('stamps { last, slots } for each breakdown key', () => {
    const rows = [
      { period: '2024-01', subscription: 100, merch: 10 },
      { period: '2024-02', subscription: 120, merch: 20 },
      { period: '2024-03', subscription: 200, merch: 30 },
    ];
    const values = buildChartAnalyticsValues({
      chartType: 'bar',
      breakdownKeys: ['subscription', 'merch'],
      datasetRows: rows,
    });
    expect(values['earnings.subscription']).toEqual({ last: 200, slots: [100, 120, 200] });
    expect(values['earnings.merch']).toEqual({ last: 30, slots: [10, 20, 30] });
  });

  it('skips breakdown keys that have no metric mapping', () => {
    const values = buildChartAnalyticsValues({
      chartType: 'bar',
      breakdownKeys: ['unknownField'],
      datasetRows: [{ unknownField: 5 }],
    });
    expect(Object.keys(values)).toHaveLength(0);
  });
});

// ── stampChartAnalyticsContract ───────────────────────────────────────────────

describe('stampChartAnalyticsContract', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.setAttribute('data-chart-id', 'sales-daily-donut');
  });

  it('sets all required analytics attributes', () => {
    stampChartAnalyticsContract(container, {
      chartInstanceId: 'sales-daily-donut',
      chartType: 'PieChart',
      seriesBreakdownKeys: [],
      datasetRows: [{ name: 'subscription', value: 99 }],
    });

    expect(container.getAttribute('data-analytics-chart-id')).toBe('sales-daily-donut');
    expect(container.getAttribute('data-analytics-period')).toBe('day');
    expect(container.getAttribute('data-analytics-chart-type')).toBe('donut');
    expect(container.getAttribute('data-analytics-rendered-at')).toBeTruthy();

    const values = JSON.parse(container.getAttribute('data-analytics-values'));
    expect(values['earnings.subscription']).toBe(99);
  });

  it('does not throw when container is null', () => {
    expect(() => stampChartAnalyticsContract(null, {})).not.toThrow();
  });
});

// ── clearChartAnalyticsContract ───────────────────────────────────────────────

describe('clearChartAnalyticsContract', () => {
  it('removes all data-analytics-* attributes', () => {
    const el = document.createElement('div');
    el.setAttribute('data-analytics-chart-id', 'test');
    el.setAttribute('data-analytics-period', 'day');
    el.setAttribute('data-analytics-chart-type', 'bar');
    el.setAttribute('data-analytics-values', '{}');
    el.setAttribute('data-analytics-rendered-at', new Date().toISOString());

    clearChartAnalyticsContract(el);

    expect(el.hasAttribute('data-analytics-chart-id')).toBe(false);
    expect(el.hasAttribute('data-analytics-period')).toBe(false);
    expect(el.hasAttribute('data-analytics-values')).toBe(false);
    expect(el.hasAttribute('data-analytics-rendered-at')).toBe(false);
  });
});
