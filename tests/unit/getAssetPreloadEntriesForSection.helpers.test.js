import { beforeEach, describe, expect, it, vi } from 'vitest';

const getRouteConfiguration = vi.fn();
const resolveEffectiveAssetPreloadForRoute = vi.fn((route) => route?.assetPreload ?? []);

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration,
}));

vi.mock('../../src/systems/routing/routeResolver.js', () => ({
  resolveEffectiveAssetPreloadForRoute,
}));

vi.mock('../../src/infrastructure/logging/logHandler.js', () => ({
  log: vi.fn(),
}));

describe('getAssetPreloadEntriesForSection helpers (§34-36)', () => {
  async function loadModule() {
    return import('../../src/systems/assets/routeSectionAssetPreloadEntries.js');
  }

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getRouteConfiguration.mockReturnValue([]);
    resolveEffectiveAssetPreloadForRoute.mockImplementation((route) => route?.assetPreload ?? []);
  });

  describe('dedupeAssetPreloadEntries (§34)', () => {
    it('returns an empty array for empty input', async () => {
      const { dedupeAssetPreloadEntries } = await loadModule();

      expect(dedupeAssetPreloadEntries([])).toEqual([]);
    });

    it('returns the same single entry instance unchanged', async () => {
      const { dedupeAssetPreloadEntries } = await loadModule();
      const entry = { flag: 'dashboard.logo', type: 'image', priority: 'normal' };

      const result = dedupeAssetPreloadEntries([entry]);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(entry);
    });

    it('keeps critical over normal for duplicate flags', async () => {
      const { dedupeAssetPreloadEntries } = await loadModule();

      expect(
        dedupeAssetPreloadEntries([
          { flag: 'dashboard.logo', type: 'image', priority: 'normal' },
          { flag: 'dashboard.logo', type: 'image', priority: 'critical' },
        ]),
      ).toEqual([{ flag: 'dashboard.logo', type: 'image', priority: 'critical' }]);
    });

    it('keeps critical over high for duplicate flags', async () => {
      const { dedupeAssetPreloadEntries } = await loadModule();

      expect(
        dedupeAssetPreloadEntries([
          { flag: 'dashboard.logo', type: 'image', priority: 'high' },
          { flag: 'dashboard.logo', type: 'image', priority: 'critical' },
        ]),
      ).toEqual([{ flag: 'dashboard.logo', type: 'image', priority: 'critical' }]);
    });

    it('keeps high over normal for duplicate flags', async () => {
      const { dedupeAssetPreloadEntries } = await loadModule();

      expect(
        dedupeAssetPreloadEntries([
          { flag: 'dashboard.logo', type: 'image', priority: 'normal' },
          { flag: 'dashboard.logo', type: 'image', priority: 'high' },
        ]),
      ).toEqual([{ flag: 'dashboard.logo', type: 'image', priority: 'high' }]);
    });

    it('keeps the highest-priority duplicate src entry', async () => {
      const { dedupeAssetPreloadEntries } = await loadModule();

      expect(
        dedupeAssetPreloadEntries([
          { src: '/images/banner.webp', type: 'image', priority: 'normal' },
          { src: '/images/banner.webp', type: 'image', priority: 'critical' },
        ]),
      ).toEqual([{ src: '/images/banner.webp', type: 'image', priority: 'critical' }]);
    });

    it('keeps the first entry when priorities are equal', async () => {
      const { dedupeAssetPreloadEntries } = await loadModule();
      const first = { flag: 'dashboard.logo', type: 'image', priority: 'high' };
      const second = { flag: 'dashboard.logo', type: 'font', priority: 'high' };

      const result = dedupeAssetPreloadEntries([first, second]);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(first);
    });

    it('drops entries without a flag or src', async () => {
      const { dedupeAssetPreloadEntries } = await loadModule();

      expect(
        dedupeAssetPreloadEntries([
          { type: 'image', priority: 'high' },
          { flag: 'dashboard.logo', type: 'image', priority: 'high' },
        ]),
      ).toEqual([{ flag: 'dashboard.logo', type: 'image', priority: 'high' }]);
    });

    it('preserves the type field on the winning entry', async () => {
      const { dedupeAssetPreloadEntries } = await loadModule();

      expect(
        dedupeAssetPreloadEntries([
          { flag: 'dashboard.logo', type: 'font', priority: 'normal' },
          { flag: 'dashboard.logo', type: 'image', priority: 'critical' },
        ]),
      ).toEqual([{ flag: 'dashboard.logo', type: 'image', priority: 'critical' }]);
    });
  });

  describe('doesRouteBelongToSection (§35)', () => {
    it('matches string sections exactly', async () => {
      const { doesRouteBelongToSection } = await loadModule();

      expect(doesRouteBelongToSection({ section: 'auth' }, 'auth')).toBe(true);
    });

    it('rejects string sections that do not match', async () => {
      const { doesRouteBelongToSection } = await loadModule();

      expect(doesRouteBelongToSection({ section: 'shop' }, 'auth')).toBe(false);
    });

    it('matches section objects by any value', async () => {
      const { doesRouteBelongToSection } = await loadModule();

      expect(
        doesRouteBelongToSection(
          { section: { creator: 'dashboard-creator', fan: 'dashboard-fan' } },
          'dashboard-creator',
        ),
      ).toBe(true);
    });

    it('rejects section objects when no value matches', async () => {
      const { doesRouteBelongToSection } = await loadModule();

      expect(
        doesRouteBelongToSection(
          { section: { creator: 'dashboard-creator', fan: 'dashboard-fan' } },
          'dashboard-global',
        ),
      ).toBe(false);
    });

    it('returns false when the route has no section', async () => {
      const { doesRouteBelongToSection } = await loadModule();

      expect(doesRouteBelongToSection({}, 'auth')).toBe(false);
    });

    it('returns false when sectionName is null', async () => {
      const { doesRouteBelongToSection } = await loadModule();

      expect(doesRouteBelongToSection({ section: 'auth' }, null)).toBe(false);
    });

    it('does not trim whitespace from section ids', async () => {
      const { doesRouteBelongToSection } = await loadModule();

      expect(doesRouteBelongToSection({ section: ' auth ' }, 'auth')).toBe(false);
    });
  });

  describe('isRouteEnabledForAssetPreload (§36)', () => {
    it('returns true for an enabled route', async () => {
      const { isRouteEnabledForAssetPreload } = await loadModule();

      expect(isRouteEnabledForAssetPreload({ enabled: true })).toBe(true);
    });

    it('returns false when enabled is false', async () => {
      const { isRouteEnabledForAssetPreload } = await loadModule();

      expect(isRouteEnabledForAssetPreload({ enabled: false })).toBe(false);
    });

    it('treats a missing enabled flag as enabled', async () => {
      const { isRouteEnabledForAssetPreload } = await loadModule();

      expect(isRouteEnabledForAssetPreload({ slug: '/auth' })).toBe(true);
    });

    it('returns false for a null route', async () => {
      const { isRouteEnabledForAssetPreload } = await loadModule();

      expect(isRouteEnabledForAssetPreload(null)).toBe(false);
    });
  });
});
