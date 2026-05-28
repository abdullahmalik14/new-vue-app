import { describe, it, expect, beforeEach, vi } from 'vitest';

const LOCALE_MANAGER_PATH = '../../src/utils/translation/localeManager.js';

beforeEach(() => {
  window.performanceTracker = { step: vi.fn() };
});

describe('getLocaleSwitcherOptions (L-08)', () => {
  it('returns one option per SUPPORTED_LOCALES code with labels', async () => {
    const { getLocaleSwitcherOptions, SUPPORTED_LOCALES } = await import(LOCALE_MANAGER_PATH);
    const options = getLocaleSwitcherOptions();

    expect(options).toHaveLength(SUPPORTED_LOCALES.length);
    expect(options.map((o) => o.code)).toEqual(SUPPORTED_LOCALES);
    expect(options.find((o) => o.code === 'vi')?.label).toBe('Vietnamese');
    expect(options.find((o) => o.code === 'zh-tw')?.traditionalName).toContain('繁');
  });
});
