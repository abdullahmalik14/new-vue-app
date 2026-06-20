import { describe, expect, it } from 'vitest';
import {
  ALLOWED_ASSET_PRELOAD_PRIORITIES,
  ALLOWED_ASSET_PRELOAD_TYPES,
  collectAssetMapFlags,
  validateAssetPreloadEntryShape,
  validateRouteAssetPreloadFlags,
  validateRouteAssetPreloadRefs,
  validateSharedCatalogAssetPreloadFlags,
} from '../../src/systems/assets/validateRouteAssetPreloadFlags.js';

describe('validateRouteAssetPreloadFlags (M-04)', () => {
  const assetMap = {
    production: {
      'dashboard.logo': 'https://cdn.example.com/logo.webp',
      'script.cognito': '/vendor/amazon-cognito-identity-6.3.15.min.js',
    },
    development: {
      'auth.background': 'https://i.ibb.co/jPw7ChWb/auth-bg.webp',
    },
  };

  it('exports the allowed preload types constant', () => {
    expect([...ALLOWED_ASSET_PRELOAD_TYPES]).toEqual([
      'image',
      'font',
      'video',
      'audio',
      'script',
      'json',
    ]);
  });

  it('exports the allowed preload priorities constant', () => {
    expect([...ALLOWED_ASSET_PRELOAD_PRIORITIES]).toEqual([
      'critical',
      'high',
      'medium',
      'low',
      'normal',
    ]);
  });

  it('collectAssetMapFlags returns an empty set for an empty map', () => {
    expect([...collectAssetMapFlags({})]).toEqual([]);
  });

  it('collectAssetMapFlags includes staging flags', () => {
    const flags = collectAssetMapFlags({
      production: {},
      staging: { 'dashboard.logo': 'https://cdn.example.com/logo.webp' },
    });

    expect(flags.has('dashboard.logo')).toBe(true);
  });

  it('passes when every assetPreload flag exists in assetMap', () => {
    const routes = [
      {
        slug: '/dashboard',
        assetPreload: [{ flag: 'dashboard.logo', type: 'image' }],
      },
      {
        slug: '/log-in',
        assetPreload: [
          { src: 'https://example.com/bg.webp', type: 'image' },
          { flag: 'script.cognito', type: 'script' },
        ],
      },
    ];

    const result = validateRouteAssetPreloadFlags(routes, assetMap);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('reports missing flags with route slug context', () => {
    const routes = [
      {
        slug: '/dashboard/overview',
        assetPreload: [{ flag: 'dashboard.typo.flag', type: 'image' }],
      },
    ];

    const result = validateRouteAssetPreloadFlags(routes, assetMap);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      'Route "/dashboard/overview": assetPreload flag "dashboard.typo.flag" not found in assetMap.json',
    ]);
  });

  it('rejects invalid assetPreload entry shape and priority (C-09)', () => {
    const routes = [
      {
        slug: '/dashboard/overview',
        assetPreload: [
          {
            flag: 'dashboard.logo',
            type: 'sprite',
            priority: 'urgent',
          },
        ],
      },
    ];

    const result = validateRouteAssetPreloadFlags(routes, assetMap);

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('invalid or missing type'))).toBe(true);
    expect(result.errors.some((error) => error.includes('invalid priority'))).toBe(true);
  });

  it('validates assetPreloadRef keys against shared catalog (C-09)', () => {
    const routes = [
      {
        slug: '/shop',
        assetPreloadRef: 'missingCatalogKey',
      },
    ];

    const result = validateRouteAssetPreloadFlags(routes, null, {
      dashboardMenuIcons: [{ flag: 'dashboard.logo', type: 'image' }],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['Route "/shop": unknown assetPreloadRef "missingCatalogKey"']);
  });

  it('accepts a valid assetPreload entry shape with extra keys', () => {
    expect(
      validateAssetPreloadEntryShape(
        { flag: 'dashboard.logo', type: 'image', priority: 'high', extra: true },
        '/dashboard',
        0,
      ),
    ).toEqual([]);
  });

  it('rejects non-object assetPreload entries', () => {
    expect(validateAssetPreloadEntryShape(null, '/dashboard', 0)).toEqual([
      'Route "/dashboard": assetPreload[0] must be an object',
    ]);
  });

  it('accepts a valid assetPreloadRef string', () => {
    expect(
      validateRouteAssetPreloadRefs(
        { slug: '/shop', assetPreloadRef: 'menuIcons' },
        { menuIcons: [{ flag: 'dashboard.logo', type: 'image' }] },
      ),
    ).toEqual([]);
  });

  it('accepts an empty assetPreloadRef array', () => {
    expect(validateRouteAssetPreloadRefs({ slug: '/shop', assetPreloadRef: [] }, {})).toEqual([]);
  });

  it('accepts multiple valid assetPreloadRef entries', () => {
    expect(
      validateRouteAssetPreloadRefs(
        { slug: '/shop', assetPreloadRef: ['menuIcons', 'headerIcons'] },
        {
          menuIcons: [{ flag: 'dashboard.logo', type: 'image' }],
          headerIcons: [{ flag: 'dashboard.avatar', type: 'image' }],
        },
      ),
    ).toEqual([]);
  });
});

describe('validateSharedCatalogAssetPreloadFlags (M-04 / C-09)', () => {
  const assetMap = {
    production: {
      'dashboard.logo': 'https://cdn.example.com/logo.webp',
      'dashboard.avatar': 'https://cdn.example.com/avatar.webp',
    },
  };

  it('reports missing flags in shared preload catalog arrays', () => {
    const errors = validateSharedCatalogAssetPreloadFlags(
      {
        dashboardMenuIcons: [
          { flag: 'dashboard.logo', type: 'image' },
          { flag: 'dashboard.typo', type: 'image' },
        ],
      },
      assetMap,
    );

    expect(errors).toEqual([
      'Shared catalog "dashboardMenuIcons": flag "dashboard.typo" not found in assetMap.json',
    ]);
  });

  it('accepts a valid shared preload catalog', () => {
    expect(
      validateSharedCatalogAssetPreloadFlags(
        {
          dashboardMenuIcons: [
            { flag: 'dashboard.logo', type: 'image' },
            { flag: 'dashboard.avatar', type: 'image' },
          ],
        },
        assetMap,
      ),
    ).toEqual([]);
  });

  it('accepts an empty shared preload catalog', () => {
    expect(validateSharedCatalogAssetPreloadFlags({}, assetMap)).toEqual([]);
  });
});
