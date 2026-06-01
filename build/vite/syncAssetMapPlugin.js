/**
 * Sync assetMap.json from src (source of truth) to public for runtime dev override fetches.
 * @see docs/tasks/ASSET_LIBRARY_AUDIT.md S-05
 */

import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const ASSET_MAP_SRC_DIR_REL = 'src/config';
export const ASSET_MAP_PUBLIC_DIR_REL = 'public/config';
export const ASSET_MAP_SRC_REL = 'src/config/assetMap.json';
export const ASSET_MAP_PUBLIC_REL = 'public/config/assetMap.json';

/**
 * @param {string} [projectRoot]
 * @returns {{ copied: Array<{ src: string, dest: string }> }}
 */
export function syncAssetMapToPublic(projectRoot = process.cwd()) {
  const srcDir = join(projectRoot, ASSET_MAP_SRC_DIR_REL);
  const destDir = join(projectRoot, ASSET_MAP_PUBLIC_DIR_REL);

  mkdirSync(destDir, { recursive: true });

  const copied = readdirSync(srcDir)
    .filter((name) => name.startsWith('assetMap') && name.endsWith('.json'))
    .map((name) => {
      const src = join(srcDir, name);
      const dest = join(destDir, name);
      copyFileSync(src, dest);
      return { src, dest };
    });

  return { copied };
}

/**
 * Vite plugin: keep public/config/assetMap.json aligned with src/config/assetMap.json.
 * @returns {import('vite').Plugin}
 */
export function createSyncAssetMapPlugin() {
  let projectRoot = process.cwd();

  return {
    name: 'vite-plugin-sync-asset-map',

    configResolved(config) {
      projectRoot = config.root || process.cwd();
    },

    buildStart() {
      const { copied } = syncAssetMapToPublic(projectRoot);
      console.log('[SyncAssetMap] Copied asset map files for runtime fetch', {
        count: copied.length,
        files: copied.map((entry) => entry.dest),
      });
    },
  };
}
