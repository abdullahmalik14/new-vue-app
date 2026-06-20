import { describe, expect, it } from 'vitest';
import { validateSharedComponentAssetMappings } from '../../src/systems/assets/validateSharedComponentAssetMappings.js';

describe('validateSharedComponentAssetMappings (C-06)', () => {
  it('accepts valid shared component asset mappings', () => {
    const sharedCatalog = {
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
    };

    expect(validateSharedComponentAssetMappings(sharedCatalog)).toEqual([]);
  });

  it('rejects a missing shared component mapping ref', () => {
    const sharedCatalog = {
      dashboardMenuIcons: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      dashboardSidebarChrome: {
        logo: 'dashboard.logo',
      },
    };

    expect(validateSharedComponentAssetMappings(sharedCatalog)).toEqual([
      'Missing shared component asset mapping: dashboardHeaderChrome',
    ]);
  });

  it('rejects mapping slots that reference an unknown flag', () => {
    const sharedCatalog = {
      dashboardMenuIcons: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      dashboardSidebarChrome: {
        logo: 'dashboard.missing',
      },
      dashboardHeaderChrome: {
        logo: 'dashboard.logo',
      },
    };

    expect(validateSharedComponentAssetMappings(sharedCatalog)).toEqual([
      'dashboardSidebarChrome.logo references "dashboard.missing" which is not listed in dashboardMenuIcons',
    ]);
  });

  it('rejects non-object shared component mappings', () => {
    const sharedCatalog = {
      dashboardMenuIcons: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      dashboardSidebarChrome: [],
      dashboardHeaderChrome: null,
    };

    expect(validateSharedComponentAssetMappings(sharedCatalog)).toEqual([
      'Missing shared component asset mapping: dashboardSidebarChrome',
      'Missing shared component asset mapping: dashboardHeaderChrome',
    ]);
  });

  it('reports missing mappings for an empty catalog', () => {
    expect(validateSharedComponentAssetMappings({})).toEqual([
      'Missing shared component asset mapping: dashboardSidebarChrome',
      'Missing shared component asset mapping: dashboardHeaderChrome',
    ]);
  });
});
