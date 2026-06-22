import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sha256HexFromText as nodeSha256 } from '../../build/vite/manifestIntegrityNode.js';
import { getProjectRoot } from '../helpers/assetFixtures.js';

const projectRoot = getProjectRoot();

describe('assetMapSource — shouldAllowRuntimeAssetMapFetch (§1)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('returns true in development when runtime fetch enabled', async () => {
    vi.stubEnv('PROD', '');
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ASSET_MAP_RUNTIME_OVERRIDE', 'true');
    const { shouldAllowRuntimeAssetMapFetch } = await import(
      '../../src/systems/assets/assetMapSource.js',
    );
    expect(shouldAllowRuntimeAssetMapFetch()).toBe(true);
  });

  it('returns false in production when bundled map required', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');
    const { shouldAllowRuntimeAssetMapFetch } = await import(
      '../../src/systems/assets/assetMapSource.js',
    );
    expect(shouldAllowRuntimeAssetMapFetch()).toBe(false);
  });

  it('respects VITE_ALLOW_RUNTIME_ASSET_MAP env override', async () => {
    vi.stubEnv('PROD', '');
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ASSET_MAP_RUNTIME_OVERRIDE', 'true');
    const { shouldAllowRuntimeAssetMapFetch } = await import(
      '../../src/systems/assets/assetMapSource.js',
    );
    expect(shouldAllowRuntimeAssetMapFetch()).toBe(true);
  });

  it('returns false when explicit disable flag set', async () => {
    vi.stubEnv('PROD', '');
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ASSET_MAP_RUNTIME_OVERRIDE', '');
    const { shouldAllowRuntimeAssetMapFetch } = await import(
      '../../src/systems/assets/assetMapSource.js',
    );
    expect(shouldAllowRuntimeAssetMapFetch()).toBe(false);
  });
});

describe('assetMapSource — getBundledAssetMap / getBundledAssetMapSha256 (§1b)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('getBundledAssetMap returns object with production key', async () => {
    const { getBundledAssetMap } = await import('../../src/systems/assets/assetMapSource.js');
    expect(getBundledAssetMap().production).toBeTypeOf('object');
    expect(Object.keys(getBundledAssetMap().production).length).toBeGreaterThan(0);
  });

  it('getBundledAssetMap returns deep-equal clones on repeated calls', async () => {
    const { getBundledAssetMap } = await import('../../src/systems/assets/assetMapSource.js');
    const first = getBundledAssetMap();
    const second = getBundledAssetMap();
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });

  it('getBundledAssetMapSha256 returns hex string', async () => {
    const { getBundledAssetMapSha256 } = await import('../../src/systems/assets/assetMapSource.js');
    expect(getBundledAssetMapSha256()).toMatch(/^[a-f0-9]{64}$/);
  });

  it('getBundledAssetMapSha256 matches hash of bundled JSON text', async () => {
    const raw = readFileSync(join(projectRoot, 'src/config/assetMap.json'), 'utf8');
    const { getBundledAssetMapSha256 } = await import('../../src/systems/assets/assetMapSource.js');
    expect(getBundledAssetMapSha256()).toBe(nodeSha256(raw));
  });

  it('getBundledAssetMapSha256 stable across calls', async () => {
    const { getBundledAssetMapSha256 } = await import('../../src/systems/assets/assetMapSource.js');
    expect(getBundledAssetMapSha256()).toBe(getBundledAssetMapSha256());
  });
});

describe('assetMapSource — sha256HexFromText / verify / parse (§1c)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('sha256HexFromText hashes empty string deterministically', async () => {
    const { sha256HexFromText } = await import('../../src/systems/assets/assetMapSource.js');
    const hash = await sha256HexFromText('');
    expect(hash).toBe(nodeSha256(''));
    expect(await sha256HexFromText('')).toBe(hash);
  });

  it('sha256HexFromText hashes sample JSON deterministically', async () => {
    const sample = '{"production":{"icon.cart":"/a.svg"}}';
    const { sha256HexFromText } = await import('../../src/systems/assets/assetMapSource.js');
    expect(await sha256HexFromText(sample)).toBe(nodeSha256(sample));
  });

  it('sha256HexFromText different input produces different hash', async () => {
    const { sha256HexFromText } = await import('../../src/systems/assets/assetMapSource.js');
    const a = await sha256HexFromText('{"a":1}');
    const b = await sha256HexFromText('{"b":2}');
    expect(a).not.toBe(b);
  });

  it('parseAssetMapJsonText parses valid JSON object', async () => {
    const { parseAssetMapJsonText } = await import('../../src/systems/assets/assetMapSource.js');
    const parsed = parseAssetMapJsonText('{"production":{"icon.cart":"/a.svg"}}');
    expect(parsed?.production?.['icon.cart']).toBe('/a.svg');
  });

  it('parseAssetMapJsonText throws on invalid JSON', async () => {
    const { parseAssetMapJsonText } = await import('../../src/systems/assets/assetMapSource.js');
    expect(parseAssetMapJsonText('{invalid')).toBeNull();
  });

  it('parseAssetMapJsonText throws when root is array', async () => {
    const { parseAssetMapJsonText } = await import('../../src/systems/assets/assetMapSource.js');
    expect(parseAssetMapJsonText('[]')).toBeNull();
  });

  it('parseAssetMapJsonText returns object when production key missing', async () => {
    const { parseAssetMapJsonText } = await import('../../src/systems/assets/assetMapSource.js');
    const parsed = parseAssetMapJsonText('{"staging":{}}');
    expect(parsed).toEqual({ staging: {} });
  });

  it('verifyFetchedAssetMapText passes when hash matches bundled', async () => {
    const raw = readFileSync(join(projectRoot, 'src/config/assetMap.json'), 'utf8');
    vi.stubGlobal('__ASSET_MAP_SHA256__', nodeSha256(raw));
    const { verifyFetchedAssetMapText } = await import('../../src/systems/assets/assetMapSource.js');
    await expect(verifyFetchedAssetMapText(raw)).resolves.toBe(true);
  });

  it('verifyFetchedAssetMapText fails when hash mismatch', async () => {
    vi.stubGlobal('__ASSET_MAP_SHA256__', 'a'.repeat(64));
    const { verifyFetchedAssetMapText } = await import('../../src/systems/assets/assetMapSource.js');
    const raw = readFileSync(join(projectRoot, 'src/config/assetMap.json'), 'utf8');
    await expect(verifyFetchedAssetMapText(raw)).resolves.toBe(false);
  });

  it('verifyFetchedAssetMapText fails on tampered content', async () => {
    const raw = readFileSync(join(projectRoot, 'src/config/assetMap.json'), 'utf8');
    vi.stubGlobal('__ASSET_MAP_SHA256__', nodeSha256(raw));
    const { verifyFetchedAssetMapText } = await import('../../src/systems/assets/assetMapSource.js');
    await expect(verifyFetchedAssetMapText('{"tampered":true}')).resolves.toBe(false);
  });
});
