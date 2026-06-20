import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  extractAssetsFromComponent,
  extractLiteralBoundAttribute,
  extractBoundAttributeExpression,
} from '../../src/systems/assets/assetScanner.js';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('assetScanner.extract (§24–26)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
  });

  describe('extractAssetsFromComponent (§24)', () => {
    it('extractAssetsFromComponent: extracts img src flags', () => {
      const assets = extractAssetsFromComponent({
        preloadAssets: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      });

      expect(assets).toEqual([{ flag: 'dashboard.logo', type: 'image', priority: 'high' }]);
    });

    it('extractAssetsFromComponent: extracts background-image flags', () => {
      const assets = extractAssetsFromComponent({
        preloadAssets: [{ flag: 'auth.background', type: 'image', priority: 'critical' }],
      });

      expect(assets[0].flag).toBe('auth.background');
    });

    it('extractAssetsFromComponent: extracts script src flags', () => {
      const assets = extractAssetsFromComponent({
        PRELOAD_ASSETS: [{ flag: 'script.cognito', type: 'script', priority: 'high' }],
      });

      expect(assets).toEqual([{ flag: 'script.cognito', type: 'script', priority: 'high' }]);
    });

    it('extractAssetsFromComponent: ignores external hardcoded URLs', () => {
      const assets = extractAssetsFromComponent({ setup: () => ({}) });

      expect(assets).toEqual([]);
    });

    it('extractAssetsFromComponent: empty component → []', () => {
      expect(extractAssetsFromComponent({})).toEqual([]);
      expect(extractAssetsFromComponent(null)).toEqual([]);
    });

    it('extractAssetsFromComponent: multiple assets deduped', () => {
      const assets = extractAssetsFromComponent({
        preloadAssets: [
          { flag: 'icon.cart', type: 'image' },
          { flag: 'icon.user', type: 'image' },
        ],
        PRELOAD_ASSETS: [{ flag: 'font.primary', type: 'font' }],
      });

      expect(assets).toHaveLength(3);
      expect(assets.map((entry) => entry.flag)).toEqual(['icon.cart', 'icon.user', 'font.primary']);
    });
  });

  describe('extractLiteralBoundAttribute (§25)', () => {
    it('extractLiteralBoundAttribute: reads literal src', () => {
      expect(extractLiteralBoundAttribute('<img src="/assets/logo.png" />', 'src')).toBe('/assets/logo.png');
    });

    it('extractLiteralBoundAttribute: reads literal :src binding', () => {
      expect(extractLiteralBoundAttribute('<img :src="\'/assets/dynamic.png\'" />', 'src')).toBe(
        '/assets/dynamic.png',
      );
    });

    it('extractLiteralBoundAttribute: missing attribute → null', () => {
      expect(extractLiteralBoundAttribute('<img alt="logo" />', 'src')).toBeNull();
    });

    it('extractLiteralBoundAttribute: malformed tag → null', () => {
      expect(extractLiteralBoundAttribute('not-a-tag', 'src')).toBeNull();
    });

    it('extractLiteralBoundAttribute: whitespace trimmed', () => {
      expect(extractLiteralBoundAttribute('<img :src="/assets/spaced.png" />', 'src')).toBe(
        '/assets/spaced.png',
      );
    });
  });

  describe('extractBoundAttributeExpression (§26)', () => {
    it('extractBoundAttributeExpression: extracts expression from :src', () => {
      expect(extractBoundAttributeExpression('<img :src="imageUrl" />', 'src')).toBe('imageUrl');
    });

    it('extractBoundAttributeExpression: static string in binding', () => {
      expect(extractBoundAttributeExpression('<img :src="\'/assets/static.png\'" />', 'src')).toBeNull();
    });

    it('extractBoundAttributeExpression: missing binding → null', () => {
      expect(extractBoundAttributeExpression('<img src="/assets/static.png" />', 'src')).toBeNull();
    });
  });
});
