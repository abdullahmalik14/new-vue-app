import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAssetUrl = vi.hoisted(() => vi.fn());

vi.mock('../../src/systems/assets/assetLibrary.js', () => ({
  getAssetUrl,
}));

vi.mock('../../src/infrastructure/logging/logHandler.js', () => ({
  log: vi.fn(),
}));

import AssetHandler from '../../src/systems/assets/assetHandler.js';
import { createAssetHandler } from '../../src/systems/assets/assetHandlerFactory.js';

describe('createAssetHandler', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    vi.clearAllMocks();
    getAssetUrl.mockResolvedValue('/assets/resolved.js');
  });

  it('resolves flag-based URLs before constructing the handler', async () => {
    const handler = await createAssetHandler([
      { name: 'flagged-script', flag: 'app.script', type: 'script' },
    ]);

    expect(getAssetUrl).toHaveBeenCalledWith('app.script', { environment: undefined, section: undefined });
    expect(handler).toBeInstanceOf(AssetHandler);
    expect(handler.getAssetByName('flagged-script')).toMatchObject({
      name: 'flagged-script',
      url: '/assets/resolved.js',
      type: 'script',
    });
  });

  it('keeps explicit URLs untouched', async () => {
    const handler = await createAssetHandler([
      { name: 'direct-script', url: '/assets/direct.js', type: 'script' },
    ]);

    expect(getAssetUrl).not.toHaveBeenCalled();
    expect(handler.getAssetByName('direct-script')).toMatchObject({
      name: 'direct-script',
      url: '/assets/direct.js',
      type: 'script',
    });
  });

  it('passes environment and section options into URL resolution', async () => {
    await createAssetHandler(
      [{ name: 'section-script', flag: 'dashboard.logo', type: 'script' }],
      { environment: 'staging', section: 'dashboard-global' },
    );

    expect(getAssetUrl).toHaveBeenCalledWith('dashboard.logo', {
      environment: 'staging',
      section: 'dashboard-global',
    });
  });

  it('rejects when a flagged asset still has no URL', async () => {
    getAssetUrl.mockResolvedValueOnce(null);

    await expect(
      createAssetHandler([
        { name: 'missing-script', flag: 'missing.flag', type: 'script' },
      ]),
    ).rejects.toThrow('Config validation failed');
  });
});
