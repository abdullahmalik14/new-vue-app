import { describe, it, expect } from 'vitest';
import {
  ANALYTICS_METRICS,
  ANALYTICS_METRIC_MAP,
  getMetricsByDomSurface,
  getMetricsByChartId,
} from '../../src/analytics-test-runner/config/analyticsMetricRegistry.js';

describe('ANALYTICS_METRICS registry completeness', () => {
  it('every entry has a non-empty metricKey', () => {
    ANALYTICS_METRICS.forEach((entry) => {
      expect(typeof entry.metricKey).toBe('string');
      expect(entry.metricKey.length).toBeGreaterThan(0);
    });
  });

  it('every entry has a stateResolver string', () => {
    ANALYTICS_METRICS.forEach((entry) => {
      expect(typeof entry.stateResolver).toBe('string');
      expect(entry.stateResolver.length).toBeGreaterThan(0);
    });
  });

  it('every entry has at least one binding', () => {
    ANALYTICS_METRICS.forEach((entry) => {
      expect(Array.isArray(entry.bindings)).toBe(true);
      expect(entry.bindings.length).toBeGreaterThan(0);
    });
  });

  it('all binding kinds are dom or chart', () => {
    ANALYTICS_METRICS.forEach((entry) => {
      entry.bindings.forEach((b) => {
        expect(['dom', 'chart']).toContain(b.kind);
      });
    });
  });

  it('chart bindings have chartId, period, and shape', () => {
    ANALYTICS_METRICS.forEach((entry) => {
      entry.bindings
        .filter((b) => b.kind === 'chart')
        .forEach((b) => {
          expect(typeof b.chartId).toBe('string');
          expect(b.chartId.length).toBeGreaterThan(0);
          expect(typeof b.period).toBe('string');
          expect(['scalar', 'last', 'slots']).toContain(b.shape);
        });
    });
  });

  it('no duplicate metricKeys', () => {
    const keys = ANALYTICS_METRICS.map((e) => e.metricKey);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });
});

describe('ANALYTICS_METRIC_MAP', () => {
  it('has the same size as ANALYTICS_METRICS', () => {
    expect(ANALYTICS_METRIC_MAP.size).toBe(ANALYTICS_METRICS.length);
  });

  it('lookup by key works for known metrics', () => {
    expect(ANALYTICS_METRIC_MAP.get('earnings.total')).toBeDefined();
    expect(ANALYTICS_METRIC_MAP.get('subscribers.new')).toBeDefined();
    expect(ANALYTICS_METRIC_MAP.get('fans.new-followers')).toBeDefined();
  });
});

describe('getMetricsByDomSurface', () => {
  it('returns metrics for main surface', () => {
    const metrics = getMetricsByDomSurface('main');
    const keys = metrics.map((m) => m.metricKey);
    expect(keys).toContain('earnings.total');
    expect(keys).toContain('subscribers.new');
    expect(keys).toContain('fans.new-followers');
  });

  it('returns metrics for popup-earnings surface', () => {
    const metrics = getMetricsByDomSurface('popup-earnings');
    const keys = metrics.map((m) => m.metricKey);
    expect(keys).toContain('earnings.total');
  });
});

describe('getMetricsByChartId', () => {
  it('returns correct metrics for sales-daily-donut', () => {
    const metrics = getMetricsByChartId('sales-daily-donut');
    const keys = metrics.map((m) => m.metricKey);
    expect(keys).toContain('earnings.subscription');
  });

  it('returns empty for unknown chartId', () => {
    expect(getMetricsByChartId('nonexistent-chart')).toHaveLength(0);
  });
});
