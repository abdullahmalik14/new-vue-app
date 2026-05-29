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

describe('getLocaleDisplayName (P-05)', () => {
  it('returns curated labels for all supported locales', async () => {
    const { getLocaleDisplayName, SUPPORTED_LOCALES } = await import(LOCALE_MANAGER_PATH);

    for (const code of SUPPORTED_LOCALES) {
      const name = getLocaleDisplayName(code);
      expect(name).not.toBe(code);
      expect(name.length).toBeGreaterThan(1);
    }
  });

  it('uses Intl.DisplayNames fallback for locales outside the curated map', async () => {
    const { getLocaleDisplayName } = await import(LOCALE_MANAGER_PATH);

    const hawaiian = getLocaleDisplayName('haw');
    expect(hawaiian).toBe('Hawaiian');
  });

  it('accepts displayLocale for Intl fallback path', async () => {
    const { getLocaleDisplayName } = await import(LOCALE_MANAGER_PATH);

    const frenchInGerman = getLocaleDisplayName('haw', 'de');
    expect(frenchInGerman.toLowerCase()).toContain('hawai');
  });
});

describe('LanguageSwitcher selectId (B-04)', () => {
  it('uses useId instead of Math.random for stable accessibility ids', async () => {
    const { readFileSync } = await import('node:fs');
    const { join, dirname } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
    const source = readFileSync(
      join(projectRoot, 'src/components/ui/nav/language/LanguageSwitcher.vue'),
      'utf8'
    );

    expect(source).toMatch(/import\s*\{[^}]*\buseId\b[^}]*\}\s*from\s*['"]vue['"]/);
    expect(source).toMatch(/const selectId = 'language-switcher-' \+ useId\(\)/);
    expect(source).not.toMatch(/Math\.random\(\)/);
  });
});

describe('LanguageSwitcher a11y labels (B-05)', () => {
  it('uses translated ui keys instead of hardcoded English labels', async () => {
    const { readFileSync } = await import('node:fs');
    const { join, dirname } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
    const source = readFileSync(
      join(projectRoot, 'src/components/ui/nav/language/LanguageSwitcher.vue'),
      'utf8'
    );

    expect(source).toMatch(/:aria-label="\$t\('ui\.languageSelector'\)"/);
    expect(source).toMatch(/\{\{\s*\$t\('ui\.language'\)\s*\}\}/);
    expect(source).not.toMatch(/aria-label="Language selector"/);
    expect(source).not.toMatch(/class="sr-only">Language</);
  });
});
