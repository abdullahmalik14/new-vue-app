import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import {
  I18N_DATETIME_FORMATS,
  I18N_NUMBER_FORMATS,
} from '../../src/systems/i18n/localeFormatConfig.js';

const FORMATTING_PATH = '../../src/systems/i18n/localeFormatting.js';
const I18N_INSTANCE_PATH = '../../src/systems/i18n/i18nInstance.js';
const LOCALE_MANAGER_PATH = '../../src/systems/i18n/localeManager.js';

vi.mock('../../src/systems/i18n/localeManager.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getActiveLocale: vi.fn(() => 'en'),
  };
});

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('localeFormatConfig (B-07)', () => {
  it('defines number and datetime formats for en and vi', async () => {
    expect(I18N_NUMBER_FORMATS.en?.currency?.currency).toBe('USD');
    expect(I18N_NUMBER_FORMATS.vi?.decimal).toBeDefined();
    expect(I18N_DATETIME_FORMATS.en?.short).toBeDefined();
    expect(I18N_DATETIME_FORMATS.vi?.long).toBeDefined();
  });
});

describe('localeFormatting (B-07)', () => {
  it('formats numbers differently for en vs vi via vue-i18n n()', async () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      fallbackLocale: 'en',
      numberFormats: I18N_NUMBER_FORMATS,
      messages: { en: {}, vi: {} },
    });

    const { registerI18nInstance } = await import(I18N_INSTANCE_PATH);
    registerI18nInstance(i18n);

    const { formatLocaleNumber } = await import(FORMATTING_PATH);

    const enFormatted = formatLocaleNumber(1234567.89, { localeCode: 'en' });
    const viFormatted = formatLocaleNumber(1234567.89, { localeCode: 'vi' });

    expect(enFormatted).not.toBe(viFormatted);
    expect(enFormatted).toMatch(/1/);
    expect(viFormatted).toMatch(/1/);
  });

  it('formats currency via formatLocaleCurrency', async () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      fallbackLocale: 'en',
      numberFormats: I18N_NUMBER_FORMATS,
      messages: { en: {} },
    });

    const { registerI18nInstance } = await import(I18N_INSTANCE_PATH);
    registerI18nInstance(i18n);

    const { formatLocaleCurrency } = await import(FORMATTING_PATH);
    const formatted = formatLocaleCurrency(42.5, { localeCode: 'en', currency: 'USD' });

    expect(formatted).toMatch(/\$|USD/);
    expect(formatted).toMatch(/42/);
  });

  it('formats dates via vue-i18n d()', async () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      fallbackLocale: 'en',
      datetimeFormats: I18N_DATETIME_FORMATS,
      messages: { en: {}, vi: {} },
    });

    const { registerI18nInstance } = await import(I18N_INSTANCE_PATH);
    registerI18nInstance(i18n);

    const { formatLocaleDate } = await import(FORMATTING_PATH);
    const sample = new Date('2026-05-29T12:00:00Z');
    const enDate = formatLocaleDate(sample, { localeCode: 'en', format: 'short' });
    const viDate = formatLocaleDate(sample, { localeCode: 'vi', format: 'short' });

    expect(enDate).toMatch(/2026/);
    expect(viDate).toMatch(/2026/);
    expect(enDate.length).toBeGreaterThan(4);
  });

  it('falls back to Intl when i18n instance is unavailable', async () => {
    const { registerI18nInstance } = await import(I18N_INSTANCE_PATH);
    registerI18nInstance(null);

    const { formatLocaleNumber } = await import(FORMATTING_PATH);
    const formatted = formatLocaleNumber(1000, { localeCode: 'de' });

    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });
});
