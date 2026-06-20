import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  autoResolveLinkPreloads,
  autoResolveScriptLoads,
  setupAssetTestEnv,
} from '../helpers/assetFixtures.js';

describe('preloadScript (§19)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
  });

  it('preloadScript: appends tag', async () => {
    autoResolveLinkPreloads();
    const { preloadScript } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/vendor/amazon-cognito-identity-6.3.15.min.js';
    await preloadScript(url);
    expect(document.querySelector(`link[href="${url}"]`)).toBeTruthy();
  });

  it('preloadScript: async defer', async () => {
    autoResolveScriptLoads();
    const { preloadScript } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/scripts/defer.js';
    await preloadScript(url, { defer: true, async: true, name: 'defer-script' });
    const script = document.querySelector(`script[src="${url}"]`);
    expect(script?.async).toBe(true);
    expect(script?.defer).toBe(false);
  });

  it('preloadScript: module type', async () => {
    autoResolveLinkPreloads();
    const { preloadScript } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/chunk.mjs';
    await preloadScript(url, { module: true });
    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.rel).toBe('modulepreload');
  });

  it('preloadScript: duplicate skipped', async () => {
    autoResolveLinkPreloads();
    const { preloadScript } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/vendor/amazon-cognito-identity-6.3.15.min.js';
    await preloadScript(url);
    await preloadScript(url);
    expect(document.querySelectorAll(`link[href="${url}"]`).length).toBe(1);
  });

  it('preloadScript: onload/onerror', async () => {
    autoResolveLinkPreloads();
    const { preloadScript } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadScript('/vendor/amazon-cognito-identity-6.3.15.min.js')).resolves.toBeUndefined();
  });
});

describe('injectExecutableScript (§20)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
  });

  it('injectExecutableScript: inline content', async () => {
    autoResolveScriptLoads();
    const { injectExecutableScript } = await import('../../src/systems/assets/assetPreloader.js');
    await injectExecutableScript('/vendor/amazon-cognito-identity-6.3.15.min.js', { name: 'cognito' });
    expect(document.querySelector('script[src="/vendor/amazon-cognito-identity-6.3.15.min.js"]')).toBeTruthy();
  });

  it('injectExecutableScript: module type', async () => {
    autoResolveScriptLoads();
    const { injectExecutableScript } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/chunk.mjs';
    await injectExecutableScript(url, { name: 'chunk' });
    expect(document.querySelector(`script[src="${url}"]`)).toBeTruthy();
  });

  it('injectExecutableScript: empty rejects', async () => {
    const { injectExecutableScript } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(injectExecutableScript('')).resolves.toBeUndefined();
    expect(document.querySelectorAll('script').length).toBe(0);
  });
});
