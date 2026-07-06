import { describe, it, expect, beforeEach } from 'vitest';
import {
  CHART_CONTRACTS,
  validateChartContractElement,
} from '../../src/analytics-test-runner/config/chartContractSchema.js';

function makeContainer(chartId, overrides = {}) {
  const el = document.createElement('div');
  el.setAttribute('data-chart-id', chartId);
  el.setAttribute('data-analytics-chart-id', chartId);
  el.setAttribute('data-analytics-period', overrides.period || 'day');
  el.setAttribute('data-analytics-chart-type', overrides.chartType || 'donut');
  el.setAttribute('data-analytics-values', JSON.stringify(overrides.values || {}));
  el.setAttribute('data-analytics-rendered-at', new Date().toISOString());
  return el;
}

// ── CHART_CONTRACTS completeness ──────────────────────────────────────────────

describe('CHART_CONTRACTS schema completeness', () => {
  it('all contracts have period, chartType, requiredAttributes, requiredMetrics', () => {
    Object.entries(CHART_CONTRACTS).forEach(([chartId, contract]) => {
      expect(typeof contract.period, chartId).toBe('string');
      expect(typeof contract.chartType, chartId).toBe('string');
      expect(Array.isArray(contract.requiredAttributes), chartId).toBe(true);
      expect(typeof contract.requiredMetrics, chartId).toBe('object');
    });
  });

  it('requiredAttributes always includes data-analytics-rendered-at', () => {
    Object.entries(CHART_CONTRACTS).forEach(([chartId, contract]) => {
      expect(contract.requiredAttributes, chartId).toContain('data-analytics-rendered-at');
    });
  });

  it('metric shapes are valid', () => {
    const VALID_SHAPES = ['scalar', 'last', 'slots'];
    Object.entries(CHART_CONTRACTS).forEach(([chartId, contract]) => {
      Object.entries(contract.requiredMetrics).forEach(([metricKey, metricContract]) => {
        expect(VALID_SHAPES, `${chartId}.${metricKey}`).toContain(metricContract.shape);
      });
    });
  });
});

// ── validateChartContractElement — pass cases ─────────────────────────────────

describe('validateChartContractElement pass cases', () => {
  it('passes for sales-daily-donut with required metrics present', () => {
    const container = makeContainer('sales-daily-donut', {
      period: 'day',
      chartType: 'donut',
      values: { 'earnings.subscription': 150 },
    });

    const { pass, errors } = validateChartContractElement('sales-daily-donut', container);
    expect(pass).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('passes for subs-daily-donut with subscribers.new present', () => {
    const container = makeContainer('subs-daily-donut', {
      period: 'day',
      chartType: 'donut',
      values: { 'subscribers.new': 3 },
    });

    const { pass } = validateChartContractElement('subs-daily-donut', container);
    expect(pass).toBe(true);
  });

  it('passes for unknown chartId (no contract = not validated)', () => {
    const container = makeContainer('custom-unknown-chart');
    const { pass } = validateChartContractElement('custom-unknown-chart', container);
    expect(pass).toBe(true);
  });
});

// ── validateChartContractElement — fail cases ─────────────────────────────────

describe('validateChartContractElement fail cases', () => {
  it('fails when container is null', () => {
    const { pass, errors } = validateChartContractElement('sales-daily-donut', null);
    expect(pass).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('Container not found');
  });

  it('fails when required attribute is missing', () => {
    const el = document.createElement('div');
    el.setAttribute('data-analytics-chart-id', 'sales-daily-donut');
    // Missing: data-analytics-values, data-analytics-rendered-at, etc.

    const { pass, errors } = validateChartContractElement('sales-daily-donut', el);
    expect(pass).toBe(false);
    expect(errors.some((e) => e.includes('data-analytics-rendered-at'))).toBe(true);
  });

  it('fails when required metric is absent from data-analytics-values', () => {
    const container = makeContainer('sales-daily-donut', {
      period: 'day',
      chartType: 'donut',
      values: { 'earnings.merch': 10 }, // missing earnings.subscription which is required
    });

    const { pass, errors } = validateChartContractElement('sales-daily-donut', container);
    expect(pass).toBe(false);
    expect(errors.some((e) => e.includes('earnings.subscription'))).toBe(true);
  });

  it('fails when data-analytics-values is invalid JSON', () => {
    const el = makeContainer('subs-daily-donut', { values: {} });
    el.setAttribute('data-analytics-values', 'NOT_JSON');

    const { pass, errors } = validateChartContractElement('subs-daily-donut', el);
    expect(pass).toBe(false);
    expect(errors.some((e) => e.includes('not valid JSON'))).toBe(true);
  });
});
