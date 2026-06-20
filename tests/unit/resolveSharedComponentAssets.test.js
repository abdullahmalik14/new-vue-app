import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sharedAssetPreloads = vi.hoisted(() => ({
  dashboardMenuIcons: [
    { flag: 'dashboard.logo', type: 'image', priority: 'high' },
    { flag: 'dashboard.avatar', type: 'image', priority: 'high' },
    { flag: 'dashboard.notification', type: 'image', priority: 'normal' },
    { flag: 'dashboard.language', type: 'image', priority: 'normal' },
    { flag: 'dashboard.hamburger', type: 'image', priority: 'normal' },
  ],
  dashboardSidebarChrome: {
    logo: 'dashboard.logo',
    avatar: 'dashboard.avatar',
    notification: 'dashboard.notification',
    logout: 'dashboard.logo',
    language: 'dashboard.language',
    help: 'dashboard.logo',
    closeDesktop: 'dashboard.language',
    closeMobile: 'dashboard.hamburger',
    more: 'dashboard.hamburger',
  },
  dashboardHeaderChrome: {
    logo: 'dashboard.logo',
    avatar: 'dashboard.avatar',
    notification: 'dashboard.notification',
    language: 'dashboard.language',
    hamburger: 'dashboard.hamburger',
  },
}));

const getAssetUrls = vi.hoisted(() => vi.fn());

vi.mock('../../src/config/sharedAssetPreloads.json', () => ({
  default: sharedAssetPreloads,
}));

vi.mock('../../src/systems/assets/assetLibrary.js', () => ({
  getAssetUrls,
}));

describe('resolveSharedComponentAssets (Phase D §45)', () => {
  async function loadModule() {
    return import('../../src/systems/assets/resolveSharedComponentAssets.js');
  }

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete sharedAssetPreloads.tempCatalog;
    delete sharedAssetPreloads.tempMapping;
    delete sharedAssetPreloads.tempArrayMapping;
    delete sharedAssetPreloads.tempTierCatalog;
    delete sharedAssetPreloads.tempTierMapping;
  });

  it('exports the preload tier order constant', async () => {
    const { PRELOAD_TIER_ORDER } = await loadModule();

    expect(PRELOAD_TIER_ORDER).toEqual(['critical', 'high', 'normal']);
  });

  it('builds a flag map from a shared preload catalog', async () => {
    const { getSharedCatalogEntriesByFlag } = await loadModule();
    const entries = getSharedCatalogEntriesByFlag('dashboardMenuIcons');

    expect(entries.get('dashboard.logo')).toEqual({
      flag: 'dashboard.logo',
      type: 'image',
      priority: 'high',
    });
    expect(entries.has('dashboard.hamburger')).toBe(true);
  });

  it('returns an empty map for a missing catalog ref', async () => {
    const { getSharedCatalogEntriesByFlag } = await loadModule();

    expect(getSharedCatalogEntriesByFlag('missingCatalog')).toEqual(new Map());
  });

  it('skips catalog entries without a flag', async () => {
    sharedAssetPreloads.tempCatalog = [
      { type: 'image', priority: 'high' },
      { flag: 'temp.ok', type: 'image', priority: 'normal' },
    ];
    const { getSharedCatalogEntriesByFlag } = await loadModule();

    const entries = getSharedCatalogEntriesByFlag('tempCatalog');

    expect(entries.size).toBe(1);
    expect(entries.has('temp.ok')).toBe(true);
  });

  it('returns a shallow copy for shared component asset mappings', async () => {
    const { getSharedComponentAssetMapping } = await loadModule();
    const mapping = getSharedComponentAssetMapping('dashboardHeaderChrome');

    mapping.logo = 'changed';

    expect(getSharedComponentAssetMapping('dashboardHeaderChrome').logo).toBe('dashboard.logo');
  });

  it('throws for an unknown shared component asset mapping', async () => {
    const { getSharedComponentAssetMapping } = await loadModule();

    expect(() => getSharedComponentAssetMapping('missingMapping')).toThrow(
      'Unknown shared component asset mapping: missingMapping',
    );
  });

  it('throws when a shared component mapping ref is an array', async () => {
    sharedAssetPreloads.tempArrayMapping = [];
    const { getSharedComponentAssetMapping } = await loadModule();

    expect(() => getSharedComponentAssetMapping('tempArrayMapping')).toThrow(
      'Unknown shared component asset mapping: tempArrayMapping',
    );
  });

  it('groups critical slots into the critical tier', async () => {
    sharedAssetPreloads.tempTierCatalog = [{ flag: 'temp.critical', type: 'image', priority: 'critical' }];
    sharedAssetPreloads.tempTierMapping = { top: 'temp.critical' };
    const { groupComponentSlotsByPreloadTier } = await loadModule();

    expect(groupComponentSlotsByPreloadTier('tempTierMapping', 'tempTierCatalog')).toEqual({
      critical: [{ slot: 'top', flag: 'temp.critical' }],
      high: [],
      normal: [],
    });
  });

  it('defaults unmapped priorities to normal', async () => {
    sharedAssetPreloads.tempTierCatalog = [{ flag: 'temp.normal', type: 'image' }];
    sharedAssetPreloads.tempTierMapping = { main: 'temp.normal' };
    const { groupComponentSlotsByPreloadTier } = await loadModule();

    expect(groupComponentSlotsByPreloadTier('tempTierMapping', 'tempTierCatalog')).toEqual({
      critical: [],
      high: [],
      normal: [{ slot: 'main', flag: 'temp.normal' }],
    });
  });

  it('resolves all shared component slots to URLs', async () => {
    getAssetUrls.mockResolvedValue({
      'dashboard.logo': '/logo.svg',
      'dashboard.avatar': '/avatar.svg',
      'dashboard.notification': '/notification.svg',
      'dashboard.language': '/language.svg',
      'dashboard.hamburger': '/hamburger.svg',
    });
    const { resolveSharedComponentAssets } = await loadModule();

    await expect(resolveSharedComponentAssets('dashboardHeaderChrome')).resolves.toEqual({
      logo: '/logo.svg',
      avatar: '/avatar.svg',
      notification: '/notification.svg',
      language: '/language.svg',
      hamburger: '/hamburger.svg',
    });
  });

  it('returns null for missing slot URLs', async () => {
    getAssetUrls.mockResolvedValue({
      'dashboard.logo': '/logo.svg',
      'dashboard.avatar': '/avatar.svg',
    });
    const { resolveSharedComponentAssets } = await loadModule();

    await expect(resolveSharedComponentAssets('dashboardHeaderChrome')).resolves.toEqual({
      logo: '/logo.svg',
      avatar: '/avatar.svg',
      notification: null,
      language: null,
      hamburger: null,
    });
  });
});
