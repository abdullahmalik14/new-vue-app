import { describe, it, expect } from 'vitest';
import { extractLocaleSelection } from '@/systems/i18n/localeManager.js';

describe('extractLocaleSelection', () => {
  it('reads code from UnifiedSelect option object', () => {
    expect(extractLocaleSelection({ label: 'Armenian', value: 'am' })).toBe('am');
  });

  it('passes through string codes', () => {
    expect(extractLocaleSelection('vi')).toBe('vi');
  });
});
