import { describe, expect, it } from 'vitest';
import { validateRouteAssetPreloadFlags, collectAssetMapFlags } from '../../src/utils/assets/validateRouteAssetPreloadFlags.js';

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

  it('collectAssetMapFlags merges flags from all environments', () => {
    const flags = collectAssetMapFlags(assetMap);

    expect(flags.has('dashboard.logo')).toBe(true);
    expect(flags.has('auth.background')).toBe(true);
    expect(flags.has('script.cognito')).toBe(true);
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
});
