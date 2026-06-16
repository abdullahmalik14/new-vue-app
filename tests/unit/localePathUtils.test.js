import { describe, it, expect } from 'vitest';
import {
  getLeadingLocaleFromPath,
  stripLeadingLocaleFromPath,
  SUPPORTED_LOCALES,
} from '../../src/systems/i18n/localeManager.js';

describe('A21 — shared locale path utilities', () => {
  it('getLeadingLocaleFromPath returns the first supported segment', () => {
    expect(getLeadingLocaleFromPath('/vi/dashboard')).toBe('vi');
    expect(getLeadingLocaleFromPath('/zh-tw/settings')).toBe('zh-tw');
    expect(getLeadingLocaleFromPath('/dashboard')).toBeNull();
    expect(getLeadingLocaleFromPath('/')).toBeNull();
  });

  it('stripLeadingLocaleFromPath removes one locale prefix', () => {
    expect(stripLeadingLocaleFromPath('/vi/dashboard')).toBe('/dashboard');
    expect(stripLeadingLocaleFromPath('/vi')).toBe('/');
    expect(stripLeadingLocaleFromPath('/dashboard')).toBe('/dashboard');
    expect(stripLeadingLocaleFromPath('/')).toBe('/');
  });

  it('uses the provided supportedLocales list', () => {
    const customLocales = ['xx'];

    expect(getLeadingLocaleFromPath('/xx/page', customLocales)).toBe('xx');
    expect(getLeadingLocaleFromPath('/vi/page', customLocales)).toBeNull();
    expect(stripLeadingLocaleFromPath('/xx/page', customLocales)).toBe('/page');
    expect(stripLeadingLocaleFromPath('/vi/page', customLocales)).toBe('/vi/page');
  });

  it('SUPPORTED_LOCALES includes hyphenated locale codes used in paths', () => {
    expect(SUPPORTED_LOCALES).toContain('zh-tw');
    expect(SUPPORTED_LOCALES).toContain('fa-af');
  });
});
