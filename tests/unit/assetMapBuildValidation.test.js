import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(projectRoot, relativePath), 'utf8'));
}

function collectAssetPreloadFlags(routes, flags = new Set()) {
  for (const route of routes) {
    if (Array.isArray(route.assetPreload)) {
      for (const entry of route.assetPreload) {
        if (entry?.flag) {
          flags.add(entry.flag);
        }
      }
    }

    if (Array.isArray(route.children)) {
      collectAssetPreloadFlags(route.children, flags);
    }
  }

  return flags;
}

describe('asset map build validation (S-06)', () => {
  it('production map is non-empty', () => {
    const assetMap = readJson('src/config/assetMap.json');
    expect(Object.keys(assetMap.production || {}).length).toBeGreaterThan(0);
  });

  it('route assetPreload flags resolve in development or production map', () => {
    const routes = readJson('src/router/routeConfig.json');
    const assetMap = readJson('src/config/assetMap.json');
    const flags = collectAssetPreloadFlags(routes);

    for (const flag of flags) {
      const hasUrl =
        assetMap.production?.[flag] ||
        assetMap.development?.[flag] ||
        assetMap.staging?.[flag];
      expect(hasUrl, `missing asset map entry for flag "${flag}"`).toBeTruthy();
    }
  });

  it('production script.cognito is same-origin vendor path', () => {
    const assetMap = readJson('src/config/assetMap.json');
    expect(assetMap.production['script.cognito']).toBe(
      '/vendor/amazon-cognito-identity-6.3.15.min.js',
    );
  });
});
