import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resolveAssetSlotFlagsFromScript,
  scanScriptForAssetFlagReferences,
  scanComponentForAssetReferences,
  scanSectionComponents,
} from '../../src/systems/assets/assetScanner.js';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';

const getAssetPreloadEntriesForSection = vi.hoisted(() => vi.fn());

vi.mock('../../src/systems/assets/routeSectionAssetPreloadEntries.js', () => ({
  getAssetPreloadEntriesForSection,
}));

describe('assetScanner.scan (§27–30)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    getAssetPreloadEntriesForSection.mockReset();
  });

  describe('resolveAssetSlotFlagsFromScript (§27)', () => {
    it('resolveAssetSlotFlagsFromScript: maps setup return keys to flags', () => {
      const template = '<img :src="assets.logo" />';
      const script = "const assets = { logo: 'dashboard.logo' };";

      expect(resolveAssetSlotFlagsFromScript(template, script)).toEqual([
        {
          flag: 'dashboard.logo',
          type: 'image',
          auto: true,
          source: 'script-slot-map',
          slot: 'logo',
        },
      ]);
    });

    it('resolveAssetSlotFlagsFromScript: maps reactive refs', () => {
      const template = '<img :src="assets.icon" />';
      const script = "const assets = { icon: 'dashboard.menu.analytics' };";

      expect(resolveAssetSlotFlagsFromScript(template, script)[0]).toMatchObject({
        flag: 'dashboard.menu.analytics',
        slot: 'icon',
      });
    });

    it('resolveAssetSlotFlagsFromScript: empty script → {}', () => {
      expect(resolveAssetSlotFlagsFromScript('', '')).toEqual([]);
      expect(resolveAssetSlotFlagsFromScript('<img :src="assets.logo" />', '')).toEqual([]);
    });
  });

  describe('scanScriptForAssetFlagReferences (§28)', () => {
    it('scanScriptForAssetFlagReferences: finds getAssetUrl calls', () => {
      const assets = scanScriptForAssetFlagReferences("getAssetUrl('icon.cart')");

      expect(assets).toEqual([
        expect.objectContaining({ flag: 'icon.cart', source: 'script-getAssetUrl' }),
      ]);
    });

    it('scanScriptForAssetFlagReferences: finds string flags in arrays', () => {
      const assets = scanScriptForAssetFlagReferences(
        "getAssetUrls(['icon.cart', 'font.primary']);",
      );

      expect(assets.map((asset) => asset.flag)).toEqual(
        expect.arrayContaining(['icon.cart', 'font.primary']),
      );
    });

    it('scanScriptForAssetFlagReferences: ignores comments', () => {
      const assets = scanScriptForAssetFlagReferences('// no asset references in this file');

      expect(assets).toEqual([]);
    });

    it('scanScriptForAssetFlagReferences: ignores non-flag strings', () => {
      const assets = scanScriptForAssetFlagReferences("getAssetUrl('hello world');");

      expect(assets).toEqual([]);
    });

    it('scanScriptForAssetFlagReferences: duplicate flags deduped', () => {
      const assets = scanScriptForAssetFlagReferences(
        "getAssetUrl('icon.cart'); getAssetUrl('icon.cart');",
      );

      expect(assets.filter((asset) => asset.flag === 'icon.cart')).toHaveLength(1);
    });
  });

  describe('scanComponentForAssetReferences (§29)', () => {
    it('scanComponentForAssetReferences: combines template + script scans', () => {
      const template = '<img src="/assets/logo.png" />';
      const script = "getAssetUrl('icon.cart')";
      const assets = scanComponentForAssetReferences(template, script);

      expect(assets.some((asset) => asset.src === '/assets/logo.png')).toBe(true);
      expect(assets.some((asset) => asset.flag === 'icon.cart')).toBe(true);
    });

    it('scanComponentForAssetReferences: template-only component', () => {
      const assets = scanComponentForAssetReferences('<img src="/assets/only-template.png" />');

      expect(assets).toEqual([{ src: '/assets/only-template.png', type: 'image', auto: true }]);
    });

    it('scanComponentForAssetReferences: script-only flags', () => {
      const assets = scanComponentForAssetReferences(
        '<!-- script-only -->',
        "getAssetUrl('script.cognito')",
      );

      expect(assets.some((asset) => asset.flag === 'script.cognito')).toBe(true);
    });

    it('scanComponentForAssetReferences: returns normalized asset definitions', () => {
      const assets = scanComponentForAssetReferences('<img src="/assets/normalized.webp" />');

      expect(assets[0]).toMatchObject({ src: '/assets/normalized.webp', type: 'image', auto: true });
    });
  });

  describe('scanSectionComponents (§30)', () => {
    it('scanSectionComponents: scans all components in section folder', async () => {
      getAssetPreloadEntriesForSection.mockReturnValue({
        assets: [{ flag: 'dashboard.logo', type: 'image' }],
        routeCount: 2,
      });

      const assets = await scanSectionComponents('dashboard');

      expect(getAssetPreloadEntriesForSection).toHaveBeenCalledWith('dashboard');
      expect(assets).toEqual([{ flag: 'dashboard.logo', type: 'image' }]);
    });

    it('scanSectionComponents: skips ignored components', async () => {
      getAssetPreloadEntriesForSection.mockReturnValue({ assets: [], routeCount: 0 });

      await expect(scanSectionComponents('ignored-section')).resolves.toEqual([]);
    });

    it('scanSectionComponents: returns aggregated report', async () => {
      getAssetPreloadEntriesForSection.mockReturnValue({
        assets: [
          { flag: 'auth.background', type: 'image' },
          { flag: 'auth.logo', type: 'image' },
        ],
        routeCount: 3,
      });

      const assets = await scanSectionComponents('auth');

      expect(assets).toHaveLength(2);
    });

    it('scanSectionComponents: empty section → []', async () => {
      getAssetPreloadEntriesForSection.mockReturnValue({ assets: [], routeCount: 0 });

      await expect(scanSectionComponents('empty')).resolves.toEqual([]);
    });
  });
});
