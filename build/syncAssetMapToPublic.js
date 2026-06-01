#!/usr/bin/env node
/**
 * CLI: copy src/config/assetMap.json → public/config/assetMap.json
 * Usage: npm run sync:asset-map
 */

import { syncAssetMapToPublic } from './vite/syncAssetMapPlugin.js';

const { copied } = syncAssetMapToPublic();
for (const { src, dest } of copied) {
  console.log(`[sync:asset-map] ${src} → ${dest}`);
}
