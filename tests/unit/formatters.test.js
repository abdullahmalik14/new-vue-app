import { describe, it, expect } from 'vitest';
import { formatDecimal, formatCurrency, formatPrice, formatUsdPrice, formatDate } from '../../src/utils/common/formatters.js';

describe('Global Formatting Utilities', () => {
  describe('formatDecimal', () => {
    it('truncates values to 2 decimal places without rounding', () => {
      expect(formatDecimal(5.19999)).toBe('5.19');
      expect(formatDecimal(10.5678)).toBe('10.56');
      expect(formatDecimal(45)).toBe('45.00');
      expect(formatDecimal(45.5)).toBe('45.50');
      expect(formatDecimal('45.999')).toBe('45.99');
    });

    it('handles negative values correctly', () => {
      expect(formatDecimal(-5.199)).toBe('-5.19');
      expect(formatDecimal(-10.5678)).toBe('-10.56');
    });

    it('cleans formatted values and extracts numeric parts', () => {
      expect(formatDecimal('USD$ 9.99')).toBe('9.99');
      expect(formatDecimal('USD$ 2,698.00')).toBe('2698.00');
      expect(formatDecimal('$45.00')).toBe('45.00');
    });

    it('handles null, undefined, empty, or invalid input gracefully', () => {
      expect(formatDecimal(null)).toBe('0.00');
      expect(formatDecimal(undefined)).toBe('0.00');
      expect(formatDecimal('')).toBe('0.00');
      expect(formatDecimal('abc')).toBe('0.00');
    });
  });

  describe('formatCurrency', () => {
    it('formats values as currency with standard symbols', () => {
      expect(formatCurrency(45.999, 'USD')).toBe('$45.99');
      expect(formatCurrency(45.999, 'EUR')).toBe('€45.99');
      expect(formatCurrency(45.999, 'GBP')).toBe('£45.99');
      expect(formatCurrency(45.999, 'JPY')).toBe('45.99'); // Fallback to empty if not mapped
    });
  });

  describe('formatPrice', () => {
    it('formats values to standard project format YYY $X.XX', () => {
      expect(formatPrice(45, 'USD')).toBe('USD $45.00');
      expect(formatPrice(45.5, 'USD')).toBe('USD $45.50');
      expect(formatPrice('45.999', 'USD')).toBe('USD $45.99');
    });
  });

  describe('formatUsdPrice', () => {
    it('formats values to standard USD format', () => {
      expect(formatUsdPrice(45)).toBe('USD $45.00');
      expect(formatUsdPrice('45.999')).toBe('USD $45.99');
    });
  });

  describe('formatDate', () => {
    it('formats standard string dates timezone-independently', () => {
      expect(formatDate('2022/01/22')).toBe('22nd JAN 2022');
      expect(formatDate('2022-01-22')).toBe('22nd JAN 2022');
      expect(formatDate('2022-01-01')).toBe('1st JAN 2022');
      expect(formatDate('2022-05-11')).toBe('11th MAY 2022');
      expect(formatDate('2022-12-03')).toBe('3rd DEC 2022');
    });

    it('formats Date objects correctly', () => {
      const date = new Date(2022, 0, 22);
      expect(formatDate(date)).toBe('22nd JAN 2022');
    });

    it('handles existing formatted dates or invalid dates gracefully', () => {
      expect(formatDate('22 Jan 2022')).toBe('22nd JAN 2022');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('not-a-date')).toBe('not-a-date');
    });
  });
});
