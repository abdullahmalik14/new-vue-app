import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('getDisplayedLocale', () => {
  const originalPathname = window.location.pathname;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    window.history.replaceState({}, '', originalPathname || '/');
  });

  it('prefers window.location.pathname over stale vue-router path', async () => {
    window.history.replaceState({}, '', '/vi/dashboard');

    const { getDisplayedLocale } = await import('@/systems/i18n/localeManager.js');

    expect(getDisplayedLocale('/am/dashboard')).toBe('vi');
  });
});
