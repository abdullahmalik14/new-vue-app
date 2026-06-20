/**
 * Shared AssetHandler config for auth templates.
 * Used with createAssetHandler() from assetHandlerFactory.js.
 */

/**
 * Standard auth flow assets: Cognito SDK, auth CSS, background image.
 * @returns {Array<object>}
 */
export function getAuthAssetConfig() {
  return [
    {
      name: 'cognito-sdk',
      flag: 'script.cognito',
      type: 'script',
      critical: true,
      priority: 'critical',
      retry: 2,
    },
    {
      name: 'auth-styles',
      url: '/css/auth.css',
      type: 'css',
      critical: true,
      priority: 'high',
    },
    {
      name: 'auth-bg',
      flag: 'auth.background',
      type: 'image',
      priority: 'normal',
    },
  ];
}

/**
 * Sign-up onboarding assets: Cognito SDK, onboarding CSS, KYC background.
 * @returns {Array<object>}
 */
export function getAuthOnboardingAssetConfig() {
  return [
    {
      name: 'cognito-sdk',
      flag: 'script.cognito',
      type: 'script',
      critical: true,
      priority: 'critical',
      retry: 2,
    },
    {
      name: 'onboarding-styles',
      url: '/css/onboarding.css',
      type: 'css',
      critical: true,
      priority: 'high',
    },
    {
      name: 'kyc-bg',
      url: '/images/kyc-status-bg.jpg',
      type: 'image',
      priority: 'normal',
    },
  ];
}

/**
 * @param {Array<{ name: string }>} assetsConfig
 * @returns {string[]}
 */
export function getAuthAssetNames(assetsConfig) {
  return assetsConfig.map((asset) => asset.name);
}
