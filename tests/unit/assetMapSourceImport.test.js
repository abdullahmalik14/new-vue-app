import { describe, expect, it } from 'vitest';
import bundledAssetMap from '../../src/config/assetMap.json';
import { getBundledAssetMap } from '../../src/systems/assets/assetMapSource.js';

describe('assetMap.json src/config import (B-08)', () => {
  it('assetMapSource bundles src/config/assetMap.json at build time', () => {
    const fromSource = getBundledAssetMap();

    expect(fromSource.production).toBeDefined();
    expect(fromSource.production?.['script.cognito']).toBe(
      bundledAssetMap.production?.['script.cognito'],
    );
  });
});
