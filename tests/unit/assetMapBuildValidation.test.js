import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { resolveRouteAssetPreloads } from '../../src/utils/route/resolveRouteAssetPreloads.js';
import { validateRouteAssetPreloadFlags } from '../../src/utils/assets/validateRouteAssetPreloadFlags.js';

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
      readJson('src/router/sharedAssetPreloads.json'),
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
});
