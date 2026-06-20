import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AssetHandler from '../../src/systems/assets/assetHandler.js';

const baseConfig = [
  { name: 'alpha-script', url: '/alpha.js', type: 'script', flags: ['alpha'] },
  { name: 'beta-style', url: '/beta.css', type: 'css', flags: ['beta'] },
];

function makeHandler(config = baseConfig, options = {}) {
  return new AssetHandler(config, options);
}

describe('AssetHandler config', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.CSS = { escape: (value) => String(value) };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('marks a valid handler as ready during construction', () => {
    const handler = makeHandler();

    expect(handler.isReady()).toBe(true);
    expect(handler.config).toHaveLength(2);
    expect(handler.assetMap.size).toBe(2);
  });

  it('normalizes critical assets to critical priority', () => {
    const handler = makeHandler([
      { name: 'critical-script', url: '/critical.js', type: 'script', critical: true },
    ]);

    expect(handler.getAssetByName('critical-script')).toMatchObject({
      priority: 'critical',
      critical: true,
    });
  });

  it('drops defer when async is enabled', () => {
    const handler = makeHandler([
      { name: 'async-script', url: '/async.js', type: 'script', async: true, defer: true },
    ]);

    expect(handler.getAssetByName('async-script')).toMatchObject({
      async: true,
      defer: false,
    });
  });

  it('throws for an invalid global version during construction', () => {
    expect(() => makeHandler(baseConfig, { globalVersion: 'v1' })).toThrow('Invalid global version');
  });

  it('loadConfigFromJSON accepts arrays and rebuilds the asset map', () => {
    const handler = makeHandler([baseConfig[0]]);

    handler.loadConfigFromJSON([
      { name: 'next-script', url: '/next.js', type: 'script' },
    ]);

    expect(handler.config).toHaveLength(1);
    expect(handler.getAssetByName('alpha-script')).toBeNull();
    expect(handler.getAssetByName('next-script')).toMatchObject({ url: '/next.js' });
  });

  it('loadConfigFromJSON clears stale map entries on reload', () => {
    const handler = makeHandler([baseConfig[0]]);

    handler.loadConfigFromJSON([
      { name: 'replacement', url: '/replacement.js', type: 'script' },
    ]);

    expect(handler.assetMap.has('alpha-script')).toBe(false);
    expect(handler.assetMap.has('replacement')).toBe(true);
  });

  it('loadConfigFromJSON treats non-array input as empty config', () => {
    const handler = makeHandler([baseConfig[0]]);

    handler.loadConfigFromJSON('not-an-array');

    expect(handler.config).toEqual([]);
    expect(handler.assetMap.size).toBe(0);
  });

  it('validateConfig accepts a valid configuration', () => {
    const handler = makeHandler();

    expect(() => handler.validateConfig()).not.toThrow();
  });

  it('validateConfig rejects an asset without a name', () => {
    expect(() => makeHandler([{ url: '/missing-name.js', type: 'script' }])).toThrow('missing name');
  });

  it('validateConfig rejects an asset without a url', () => {
    expect(() => makeHandler([{ name: 'missing-url', type: 'script' }])).toThrow('missing url');
  });

  it('validateConfig rejects an asset without a type', () => {
    expect(() => makeHandler([{ name: 'missing-type', url: '/missing-type.js' }])).toThrow('missing type');
  });

  it('validateConfig rejects duplicate asset names', () => {
    expect(() => makeHandler([
      { name: 'dup', url: '/dup-a.js', type: 'script' },
      { name: 'dup', url: '/dup-b.js', type: 'script' },
    ])).toThrow('Duplicate asset name: dup');
  });

  it('validateConfig rejects invalid asset names', () => {
    expect(() => makeHandler([
      { name: 'bad name', url: '/bad.js', type: 'script' },
    ])).toThrow('Invalid asset name: bad name');
  });

  it('validateConfig rejects invalid versions', () => {
    expect(() => makeHandler([
      { name: 'bad-version', url: '/bad-version.js', type: 'script', version: '1' },
    ])).toThrow('Invalid version for asset bad-version: 1');
  });

  it('setGlobalVersion accepts valid semver values', () => {
    const handler = makeHandler();

    handler.setGlobalVersion('1.2.3');

    expect(handler.globalVersion).toBe('1.2.3');
  });

  it('setGlobalVersion rejects invalid values', () => {
    const handler = makeHandler();

    expect(() => handler.setGlobalVersion('invalid')).toThrow('Invalid global version: invalid');
  });

  it('getAssetByName returns a matching asset and null for missing names', () => {
    const handler = makeHandler();

    expect(handler.getAssetByName('alpha-script')).toMatchObject({ url: '/alpha.js' });
    expect(handler.getAssetByName('missing-asset')).toBeNull();
  });
});
