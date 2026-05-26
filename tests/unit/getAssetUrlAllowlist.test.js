import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('getAssetUrl allowlist (S-06 login fix)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
    vi.stubGlobal('window', {
      location: { origin: 'http://localhost:5173', hostname: 'localhost' },
    });
  });

  it('resolves auth.background from legacy i.ibb.co host until S-01', async () => {
    vi.stubEnv('DEV', 'true');
    const { clearAssetMapConfigCache, getAssetUrl } = await import(
      '../../src/utils/assets/assetLibrary.js'
    );

    clearAssetMapConfigCache();
    const url = await getAssetUrl('auth.background', 'development');

    expect(url).toBe('https://i.ibb.co/jPw7ChWb/auth-bg.webp');
  });

  it('still blocks javascript: URLs from getAssetUrl', async () => {
    vi.stubEnv('DEV', 'true');
    const { clearAssetMapConfigCache, loadAssetMapConfig, getAssetUrl } = await import(
      '../../src/utils/assets/assetLibrary.js'
    );

    clearAssetMapConfigCache();
    const map = await loadAssetMapConfig();
    map.development['icon.test'] = 'javascript:alert(1)';

    const url = await getAssetUrl('icon.test', 'development');
    expect(url).toBeNull();
  });
});
