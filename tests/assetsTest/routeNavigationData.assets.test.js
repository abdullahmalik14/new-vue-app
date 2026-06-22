import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';

const preloadSectionAssets = vi.hoisted(() => vi.fn());
const loadSectionCss = vi.hoisted(() => vi.fn());
const unloadSectionCss = vi.hoisted(() => vi.fn());
const loadTranslationsForSection = vi.hoisted(() => vi.fn());
const areTranslationsLoadedForSection = vi.hoisted(() => vi.fn());
const resolveRoleSectionVariant = vi.hoisted(() => vi.fn());

vi.mock('../../src/systems/assets/assetPreloader.js', () => ({
  preloadSectionAssets,
}));

vi.mock('../../src/systems/sections/sectionCssLoader.js', () => ({
  loadSectionCss,
  unloadSectionCss,
}));

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection,
  areTranslationsLoadedForSection,
}));

vi.mock('../../src/systems/sections/sectionResolver.js', () => ({
  resolveRoleSectionVariant,
}));

describe('routeNavigationData.assets (§87)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    preloadSectionAssets.mockReset();
    loadSectionCss.mockReset();
    unloadSectionCss.mockReset();
    loadTranslationsForSection.mockReset();
    areTranslationsLoadedForSection.mockReset();
    resolveRoleSectionVariant.mockReset();
    loadSectionCss.mockResolvedValue(undefined);
    loadTranslationsForSection.mockResolvedValue(undefined);
    preloadSectionAssets.mockResolvedValue(undefined);
  });

  it('calls preloadSectionAssets on navigate when configured', async () => {
    areTranslationsLoadedForSection.mockReturnValue(false);

    const { loadCurrentSectionResources } = await import(
      '../../src/systems/sections/sectionNavigationResources.js'
    );

    const resolved = loadCurrentSectionResources({
      to: { meta: { routeConfig: { slug: '/auth' }, section: 'auth' } },
      from: { meta: {} },
      userRole: 'guest',
      activeLocale: 'en',
    });

    expect(resolved).toBe('auth');
    expect(preloadSectionAssets).toHaveBeenCalledWith('auth');
  });

  it('no call when route has no section assets', async () => {
    const { loadCurrentSectionResources } = await import(
      '../../src/systems/sections/sectionNavigationResources.js'
    );

    const resolved = loadCurrentSectionResources({
      to: { meta: { routeConfig: { slug: '/plain' } } },
      from: { meta: {} },
      userRole: 'guest',
      activeLocale: 'en',
    });

    expect(resolved).toBeNull();
    expect(preloadSectionAssets).not.toHaveBeenCalled();
  });

  it('uses target route section not source', async () => {
    resolveRoleSectionVariant.mockReturnValue('dashboard-creator');
    areTranslationsLoadedForSection.mockReturnValue(true);

    const { loadCurrentSectionResources } = await import(
      '../../src/systems/sections/sectionNavigationResources.js'
    );

    const resolved = loadCurrentSectionResources({
      to: {
        meta: {
          routeConfig: { slug: '/dashboard' },
          section: { creator: 'dashboard-creator', guest: 'dashboard' },
        },
      },
      from: { meta: { section: 'auth' } },
      userRole: 'creator',
      activeLocale: 'en',
    });

    expect(resolved).toBe('dashboard-creator');
    expect(preloadSectionAssets).toHaveBeenCalledWith('dashboard-creator');
  });
});
