import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('settingConfig asset resolution (Issue 18 follow-up)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('resolves icon URLs from iconFlag values for selected role', async () => {
    const getAssetUrls = vi.fn(async (flags) => ({
      [flags[0]]: 'https://i.ibb.co/YTFLKydW/svgviewer-png-output-6.webp',
    }));

    vi.doMock('@/systems/assets/assetLibrary.js', () => ({
      getAssetUrls,
    }));

    const { settingConfig, resolveSettingConfigWithAssets } = await import(
      '../../src/config/settingConfig.js'
    );

    const groups = await resolveSettingConfigWithAssets(settingConfig, 'creator');

    expect(getAssetUrls).toHaveBeenCalledTimes(1);
    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0].items[0].icon).toBe('https://i.ibb.co/YTFLKydW/svgviewer-png-output-6.webp');
  });

  it('falls back to creator config when role is unknown', async () => {
    vi.doMock('@/systems/assets/assetLibrary.js', () => ({
      getAssetUrls: async () => ({
        'settings.menu.item': 'https://i.ibb.co/YTFLKydW/svgviewer-png-output-6.webp',
      }),
    }));

    const { settingConfig, resolveSettingConfigWithAssets } = await import(
      '../../src/config/settingConfig.js'
    );

    const groups = await resolveSettingConfigWithAssets(settingConfig, 'unknown-role');

    expect(groups).toHaveLength(settingConfig.creator.length);
    expect(groups[0].categoryName).toBe(settingConfig.creator[0].categoryName);
  });
});
