/**
 * Unit tests for scanMetricSelector — uses happy-dom (via vitest).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scanMetricSelector } from '../../src/analytics-test-runner/scanners/domScanners.js';

function appendEl(attrs = {}, text = '42') {
  const el = document.createElement('span');
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  el.textContent = text;
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

// ── basic hit ─────────────────────────────────────────────────────────────────

describe('scanMetricSelector — basic', () => {
  it('finds element by metric key alone', () => {
    appendEl({ 'data-analytics-metric': 'earnings.total', 'data-value': '99.50' });

    const result = scanMetricSelector({ metric: 'earnings.total' });
    expect(result.ok).toBe(true);
    expect(result.foundValue).toBe(99.5);
  });

  it('finds element by metric + period + surface', () => {
    appendEl({
      'data-analytics-metric': 'subscribers.new',
      'data-analytics-period': 'day',
      'data-analytics-surface': 'main',
      'data-value': '7',
    });

    const result = scanMetricSelector({ metric: 'subscribers.new', period: 'day', surface: 'main' });
    expect(result.ok).toBe(true);
    expect(result.foundValue).toBe(7);
  });

  it('returns ok:false when element is not found', () => {
    const result = scanMetricSelector({ metric: 'nonexistent.metric' });
    expect(result.ok).toBe(false);
    expect(result.foundValue).toBeNull();
    expect(result.error).toMatch(/Element not found/);
  });
});

// ── surface filtering ─────────────────────────────────────────────────────────

describe('scanMetricSelector — surface filter', () => {
  it('does not match wrong surface', () => {
    appendEl({
      'data-analytics-metric': 'earnings.total',
      'data-analytics-period': 'day',
      'data-analytics-surface': 'main',
      'data-value': '100',
    });

    // Ask for popup-earnings surface — should miss
    const result = scanMetricSelector({
      metric: 'earnings.total',
      period: 'day',
      surface: 'popup-earnings',
    });
    expect(result.ok).toBe(false);
  });

  it('matches popup-earnings surface specifically', () => {
    appendEl({
      'data-analytics-metric': 'earnings.total',
      'data-analytics-period': 'week',
      'data-analytics-surface': 'popup-earnings',
      'data-value': '250',
    });

    const result = scanMetricSelector({
      metric: 'earnings.total',
      period: 'week',
      surface: 'popup-earnings',
    });
    expect(result.ok).toBe(true);
    expect(result.foundValue).toBe(250);
  });
});

// ── percentage fallback ───────────────────────────────────────────────────────

describe('scanMetricSelector — percentage fallback', () => {
  it('reads percentage from textContent when no data-value', () => {
    appendEl(
      {
        'data-analytics-metric': 'earnings.percentage',
        'data-analytics-period': 'day',
        'data-analytics-surface': 'main',
      },
      '12%',
    );

    const result = scanMetricSelector({ metric: 'earnings.percentage', period: 'day', surface: 'main' });
    expect(result.ok).toBe(true);
    expect(result.foundValue).toBe(12);
  });

  it('reads negative percentage correctly', () => {
    appendEl(
      {
        'data-analytics-metric': 'fans.new-followers-percentage',
        'data-value': '-5',
      },
      '-5%',
    );

    const result = scanMetricSelector({ metric: 'fans.new-followers-percentage' });
    expect(result.ok).toBe(true);
    expect(result.foundValue).toBe(-5);
  });
});

// ── error cases ───────────────────────────────────────────────────────────────

describe('scanMetricSelector — error cases', () => {
  it('returns error when no metric provided', () => {
    const result = scanMetricSelector({});
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/metric is required/);
  });

  it('handles data-value that is NaN', () => {
    appendEl({ 'data-analytics-metric': 'test.metric', 'data-value': 'not-a-number' }, 'not-a-number');
    const result = scanMetricSelector({ metric: 'test.metric' });
    expect(result.ok).toBe(false);
  });
});
