import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sha256HexFromText } from '../../build/vite/manifestIntegrityNode.js';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('assetMapSource (S-06)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('disallows runtime fetch in production builds', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');
    const { shouldAllowRuntimeAssetMapFetch } = await import(
      '../../src/systems/assets/assetMapSource.js'
    );
    expect(shouldAllowRuntimeAssetMapFetch()).toBe(false);
  });

  it('allows runtime fetch only when dev override env is true', async () => {
    vi.stubEnv('PROD', '');
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ASSET_MAP_RUNTIME_OVERRIDE', 'true');
    const { shouldAllowRuntimeAssetMapFetch } = await import(
      '../../src/systems/assets/assetMapSource.js'
    );
    expect(shouldAllowRuntimeAssetMapFetch()).toBe(true);
  });

  it('verifyFetchedAssetMapText accepts canonical bundled file hash', async () => {
    const raw = readFileSync(join(projectRoot, 'src/config/assetMap.json'), 'utf8');
    const expectedHash = sha256HexFromText(raw);
    vi.stubGlobal('__ASSET_MAP_SHA256__', expectedHash);

    const { verifyFetchedAssetMapText } = await import(
      '../../src/systems/assets/assetMapSource.js'
    );
    await expect(verifyFetchedAssetMapText(raw)).resolves.toBe(true);
    await expect(verifyFetchedAssetMapText('{"tampered":true}')).resolves.toBe(false);
  });
});
