import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setActivePinia, createPinia } from 'pinia';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

beforeEach(() => {
  setActivePinia(createPinia());
  window.performanceTracker = { step: vi.fn() };
});

describe('locale module graph (B-09)', () => {
  it('useLocaleStore imports constants from localeConstants, not localeManager', () => {
    const src = readFileSync(join(projectRoot, 'src/stores/useLocaleStore.js'), 'utf8');

    expect(src).toMatch(/from ['"].*localeConstants\.js['"]/);
    expect(src).not.toMatch(/from ['"].*localeManager\.js['"]/);
  });

  it('localeConstants has no runtime imports from localeManager or useLocaleStore', () => {
    const src = readFileSync(join(projectRoot, 'src/utils/translation/localeConstants.js'), 'utf8');
    const importLines = src
      .split('\n')
      .filter((line) => /^\s*import\s/.test(line))
      .join('\n');

    expect(importLines).toBe('');
  });

  it('localeManager re-exports constants from localeConstants', () => {
    const src = readFileSync(join(projectRoot, 'src/utils/translation/localeManager.js'), 'utf8');

    expect(src).toMatch(/from ['"].*localeConstants\.js['"]/);
    expect(src).not.toMatch(/^export const SUPPORTED_LOCALES/m);
  });

  it('translationLoader reads SUPPORTED_LOCALES from localeConstants', () => {
    const src = readFileSync(join(projectRoot, 'src/utils/translation/translationLoader.js'), 'utf8');

    expect(src).toMatch(/SUPPORTED_LOCALES.*localeConstants\.js/);
  });

  it('store getter matches localeConstants list', async () => {
    const { SUPPORTED_LOCALES } = await import(
      '../../src/utils/translation/localeConstants.js'
    );
    const { useLocaleStore } = await import('../../src/stores/useLocaleStore.js');

    const store = useLocaleStore();
    expect(store.supportedLocales).toEqual([...SUPPORTED_LOCALES]);
  });
});
