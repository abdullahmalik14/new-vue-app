import { beforeEach, describe, expect, it } from 'vitest';
import { autoResolveLinkPreloads, setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('preloadMedia (§18)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
  });

  it('preloadMedia: video type', async () => {
    autoResolveLinkPreloads();
    const { preloadMedia } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/media/clip.mp4';
    await preloadMedia(url, 'video');
    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.as).toBe('video');
  });

  it('preloadMedia: audio type', async () => {
    autoResolveLinkPreloads();
    const { preloadMedia } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/media/clip.mp3';
    await preloadMedia(url, 'audio');
    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.as).toBe('audio');
  });

  it('preloadMedia: invalid type rejects', async () => {
    autoResolveLinkPreloads();
    const { preloadMedia } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/media/bad.bin';
    await expect(preloadMedia(url, 'unknown')).resolves.toBeUndefined();
    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.as).toBe('unknown');
  });
});
