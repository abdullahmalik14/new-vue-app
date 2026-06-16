import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { resolveRouteAssetPreloads } from '../../src/systems/assets/routeAssetPreloadResolver.js';
import { validateRouteAssetPreloadFlags } from '../../src/systems/assets/validateRouteAssetPreloadFlags.js';
import { validateSharedComponentAssetMappings } from '../../src/systems/assets/validateSharedComponentAssetMappings.js';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(projectRoot, relativePath), 'utf8'));
}

describe('asset map build validation (S-06)', () => {
  it('production map is non-empty', () => {
    const assetMap = readJson('src/config/assetMap.json');
    expect(Object.keys(assetMap.production || {}).length).toBeGreaterThan(0);
  });

  it('route assetPreload flags resolve in assetMap (M-04)', () => {
    const routes = resolveRouteAssetPreloads(
      readJson('src/router/routeConfig.json'),
      readJson('src/config/sharedAssetPreloads.json'),
    );
    const assetMap = readJson('src/config/assetMap.json');
    const result = validateRouteAssetPreloadFlags(routes, assetMap);

    expect(result.valid, result.errors.join('\n')).toBe(true);
  });

  it('production script.cognito is same-origin vendor path', () => {
    const assetMap = readJson('src/config/assetMap.json');
    expect(assetMap.production['script.cognito']).toBe(
      '/vendor/amazon-cognito-identity-6.3.15.min.js',
    );
  });

  it('dashboard component slot mappings stay aligned with dashboardMenuIcons (C-06)', () => {
    const sharedCatalog = readJson('src/config/sharedAssetPreloads.json');
    const errors = validateSharedComponentAssetMappings(sharedCatalog);

    expect(errors, errors.join('\n')).toEqual([]);
  });
});
