import AssetHandler from './assetsHandlerNew.js';
import { getAssetUrl } from './assetLibrary.js';
import { log } from '../common/logHandler.js';

/**
 * Factory to create an AssetHandler instance with URLs resolved from assetMap.json
 * 
 * @param {Array<Object>} assetsConfig - Array of asset configurations
 * @param {Object} options - AssetHandler options
 * @returns {Promise<AssetHandler>} - Configured AssetHandler instance
 */
export async function createAssetHandler(assetsConfig, options = {}) {
  log('assetHandlerFactory.js', 'createAssetHandler', 'start', 'Creating AssetHandler', {
    assetCount: assetsConfig.length,
    component: options.name
  });

  const resolvedConfig = await Promise.all(assetsConfig.map(async (asset) => {
    // Clone to avoid mutating original
    const config = { ...asset };

    // If flag is provided, resolve URL from assetMap
    if (config.flag && !config.url) {
      try {
        const url = await getAssetUrl(config.flag);
        if (url) {
          config.url = url;
          log('assetHandlerFactory.js', 'createAssetHandler', 'resolved', 'Resolved asset URL from flag', {
            name: config.name,
            flag: config.flag,
            url
          });
        } else {
          log('assetHandlerFactory.js', 'createAssetHandler', 'warn', 'Asset flag not found, handler may fail if no fallback', {
            name: config.name,
            flag: config.flag
          });
        }
      } catch (error) {
        log('assetHandlerFactory.js', 'createAssetHandler', 'error', 'Failed to resolve asset flag', {
          name: config.name,
          flag: config.flag,
          error: error.message
        });
      }
    }

    return config;
  }));

  // Filter out assets that still don't have a URL (unless they are purely dependency-based or placeholders)
  // AssetHandler's validateConfig will catch missing URLs, but we can warn here.
  resolvedConfig.forEach(asset => {
    if (!asset.url) {
      log('assetHandlerFactory.js', 'createAssetHandler', 'warn', 'Asset missing URL after resolution', { name: asset.name });
    }
  });

  return new AssetHandler(resolvedConfig, options);
}

