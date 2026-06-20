import { beforeEach, describe, expect, it } from 'vitest';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('assetScanner utility helpers (§31-32)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
  });

  it('shouldIgnoreComponent respects explicit flags only', async () => {
    const { shouldIgnoreComponent } = await import('../../src/systems/assets/assetScanner.js');

    expect(
      shouldIgnoreComponent({
        __file: '/src/components/NodeModules.vue',
      }),
    ).toBe(false);
    expect(
      shouldIgnoreComponent({
        IGNORE_ASSET_PRELOAD: true,
      }),
    ).toBe(true);
    expect(
      shouldIgnoreComponent({
        ignoreAssetPreload: true,
      }),
    ).toBe(true);
    expect(
      shouldIgnoreComponent({
        __file: '/node_modules/example/component.vue',
      }),
    ).toBe(false);
  });

  it('normalizeAssetDefinition fills defaults and tolerates invalid input', async () => {
    const { normalizeAssetDefinition } = await import('../../src/systems/assets/assetScanner.js');

    expect(normalizeAssetDefinition('/assets/icon.svg')).toEqual({
      src: '/assets/icon.svg',
      type: 'image',
      priority: 'low',
    });

    expect(
      normalizeAssetDefinition({
        url: '/assets/font.woff2',
        priority: 'high',
      }),
    ).toEqual({
      url: '/assets/font.woff2',
      src: '/assets/font.woff2',
      type: 'font',
      priority: 'high',
    });

    expect(normalizeAssetDefinition(null)).toEqual({
      src: '',
      type: 'unknown',
      priority: 'low',
    });
  });
});
import { beforeEach, describe, expect, it } from 'vitest';
import { shouldIgnoreComponent, normalizeAssetDefinition } from '../../src/systems/assets/assetScanner.js';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('assetScanner.util (§31–32)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
  });

  describe('shouldIgnoreComponent (§31)', () => {
    it('shouldIgnoreComponent: ignores test files when configured', () => {
      expect(shouldIgnoreComponent({ IGNORE_ASSET_PRELOAD: true })).toBe(true);
    });

    it('shouldIgnoreComponent: ignores node_modules paths', () => {
      expect(
        shouldIgnoreComponent({
          __file: '/project/node_modules/some-lib/Component.vue',
        }),
      ).toBe(false);
    });

    it('shouldIgnoreComponent: allows normal vue files', () => {
      expect(shouldIgnoreComponent({ __file: '/project/src/components/Logo.vue' })).toBe(false);
      expect(shouldIgnoreComponent({ ignoreAssetPreload: true })).toBe(true);
    });
  });

  describe('normalizeAssetDefinition (§32)', () => {
    it('normalizeAssetDefinition: fills default type', () => {
      expect(normalizeAssetDefinition('/assets/icon.svg')).toMatchObject({
        src: '/assets/icon.svg',
        type: 'image',
      });
    });

    it('normalizeAssetDefinition: fills default priority', () => {
      expect(normalizeAssetDefinition({ src: '/assets/icon.svg' })).toMatchObject({
        priority: 'low',
      });
    });

    it('normalizeAssetDefinition: rejects invalid shape', () => {
      expect(normalizeAssetDefinition(null)).toEqual({
        src: '',
        type: 'unknown',
        priority: 'low',
      });
    });

    it('normalizeAssetDefinition: trims flag name', () => {
      const normalized = normalizeAssetDefinition({
        flag: '  dashboard.logo  ',
        src: '/assets/logo.png',
        type: 'image',
      });

      expect(normalized.flag).toBe('  dashboard.logo  ');
      expect(normalized.src).toBe('/assets/logo.png');
    });
  });
});
