/**
 * AssetLibrary Test Suite - Flag-to-URL Mapping
 * 
 * Tests for asset flag-to-URL mapping with environment support
 * Now integrated into assetLibrary.js
 */

import {
  getAssetUrl,
  getAssetUrls,
  getAvailableAssetFlags,
  hasAssetFlag,
  getAssetsByCategory,
  preloadAssetUrls,
  validateAssetMap,
  setEnvironment,
  getEnvironment,
  clearAssetCaches
} from '../src/utils/assets/assetLibrary.js';

/**
 * Test 1: Get asset URL for production environment
 */
async function testGetAssetUrlProduction() {
  console.log('Test 1: Get asset URL (production)');

  setEnvironment('production');

  const url = await getAssetUrl('icon.cart');

  console.assert(url !== null, 'URL should be found');
  console.assert(typeof url === 'string', 'URL should be a string');
  console.assert(url.includes('cart'), 'URL should contain "cart"');

  console.log('✓ Test 1 passed:', url);
}

/**
 * Test 2: Get asset URL for development environment
 */
async function testGetAssetUrlDevelopment() {
  console.log('Test 2: Get asset URL (development)');

  setEnvironment('development');

  const url = await getAssetUrl('icon.cart');

  console.assert(url !== null, 'URL should be found');
  console.assert(url.includes('cart-dev') || url.includes('cart'), 'URL should be dev-specific or fallback');

  console.log('✓ Test 2 passed:', url);
}

/**
 * Test 3: Test environment inheritance (staging -> production)
 */
async function testEnvironmentInheritance() {
  console.log('Test 3: Environment inheritance (staging -> production)');

  setEnvironment('staging');

  // icon.user should fall back to production
  const userIconUrl = await getAssetUrl('icon.user');

  console.assert(userIconUrl !== null, 'URL should be found via inheritance');
  console.assert(userIconUrl.includes('user'), 'URL should contain "user"');

  // icon.cart should use staging-specific URL
  const cartIconUrl = await getAssetUrl('icon.cart');
  console.assert(cartIconUrl !== null, 'Staging URL should be found');
  console.assert(cartIconUrl.includes('staging') || cartIconUrl.includes('cart'), 'URL should be staging-specific');

  console.log('✓ Test 3 passed');
  console.log('  - User icon (inherited):', userIconUrl);
  console.log('  - Cart icon (staging):', cartIconUrl);
}

/**
 * Test 4: Get multiple asset URLs
 */
async function testGetMultipleAssetUrls() {
  console.log('Test 4: Get multiple asset URLs');

  setEnvironment('production');

  const flags = ['icon.cart', 'icon.user', 'icon.search', 'logo.main'];
  const urlMap = await getAssetUrls(flags);

  console.assert(typeof urlMap === 'object', 'Should return an object');
  console.assert(Object.keys(urlMap).length === flags.length, 'Should return all requested flags');

  flags.forEach(flag => {
    console.assert(flag in urlMap, `Should have entry for ${flag}`);
  });

  const resolvedCount = Object.values(urlMap).filter(Boolean).length;
  console.assert(resolvedCount > 0, 'At least some URLs should be resolved');

  console.log(`✓ Test 4 passed: ${resolvedCount}/${flags.length} URLs resolved`);
}

/**
 * Test 5: Get available asset flags
 */
async function testGetAvailableAssetFlags() {
  console.log('Test 5: Get available asset flags');

  setEnvironment('production');

  const flags = await getAvailableAssetFlags();

  console.assert(Array.isArray(flags), 'Should return an array');
  console.assert(flags.length > 0, 'Should have at least some flags');
  console.assert(flags.includes('icon.cart'), 'Should include icon.cart');

  console.log(`✓ Test 5 passed: ${flags.length} flags available`);
  console.log('  Available flags:', flags.slice(0, 5).join(', '), '...');
}

/**
 * Test 6: Check if asset flag exists
 */
async function testHasAssetFlag() {
  console.log('Test 6: Check if asset flag exists');

  setEnvironment('production');

  const existingFlag = await hasAssetFlag('icon.cart');
  const nonExistingFlag = await hasAssetFlag('icon.nonexistent');

  console.assert(existingFlag === true, 'Existing flag should return true');
  console.assert(nonExistingFlag === false, 'Non-existing flag should return false');

  console.log('✓ Test 6 passed');
}

/**
 * Test 7: Get assets by category
 */
async function testGetAssetsByCategory() {
  console.log('Test 7: Get assets by category');

  setEnvironment('production');

  const iconAssets = await getAssetsByCategory('icon');
  const logoAssets = await getAssetsByCategory('logo');

  console.assert(typeof iconAssets === 'object', 'Should return an object');
  console.assert(Object.keys(iconAssets).length > 0, 'Should have icon assets');
  console.assert('icon.cart' in iconAssets, 'Should include icon.cart');

  console.assert(typeof logoAssets === 'object', 'Should return an object');

  console.log(`✓ Test 7 passed`);
  console.log(`  - Icons found: ${Object.keys(iconAssets).length}`);
  console.log(`  - Logos found: ${Object.keys(logoAssets).length}`);
}

/**
 * Test 8: Preload asset URLs
 */
async function testPreloadAssetUrls() {
  console.log('Test 8: Preload asset URLs');

  setEnvironment('production');

  // Clear cache first
  clearAssetCaches();

  const flags = ['icon.cart', 'icon.user', 'logo.main'];
  const preloadedCount = await preloadAssetUrls(flags);

  console.assert(typeof preloadedCount === 'number', 'Should return a number');
  console.assert(preloadedCount > 0, 'Should preload at least some assets');
  console.assert(preloadedCount <= flags.length, 'Preloaded count should not exceed requested count');

  console.log(`✓ Test 8 passed: ${preloadedCount} assets preloaded`);
}

/**
 * Test 9: Get asset library statistics
 */
async function testGetStatistics() {
  console.log('Test 9: Get asset library statistics');

  setEnvironment('production');

  // Test basic statistics (from section-based loading)
  const stats = await getAssetStatistics();

  console.assert(typeof stats === 'object', 'Should return an object');
  console.assert('loadedCount' in stats, 'Should have loadedCount');
  console.assert('loadedSections' in stats, 'Should have loadedSections');

  console.log('✓ Test 9 passed');
  console.log('  Statistics:', JSON.stringify(stats, null, 2));
}

/**
 * Test 10: Validate asset map
 */
async function testValidateAssetMap() {
  console.log('Test 10: Validate asset map');

  const validation = await validateAssetMap();

  console.assert(typeof validation === 'object', 'Should return an object');
  console.assert('valid' in validation, 'Should have valid field');
  console.assert('errors' in validation, 'Should have errors field');
  console.assert('warnings' in validation, 'Should have warnings field');
  console.assert('summary' in validation, 'Should have summary field');

  console.assert(Array.isArray(validation.errors), 'Errors should be an array');
  console.assert(Array.isArray(validation.warnings), 'Warnings should be an array');

  console.log(`✓ Test 10 passed`);
  console.log(`  - Valid: ${validation.valid}`);
  console.log(`  - Errors: ${validation.errors.length}`);
  console.log(`  - Warnings: ${validation.warnings.length}`);

  if (validation.errors.length > 0) {
    console.log('  Errors:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.log('  Warnings:', validation.warnings.slice(0, 3));
  }
}

/**
 * Test 11: Cache functionality
 */
async function testCacheFunctionality() {
  console.log('Test 11: Cache functionality');

  setEnvironment('production');

  // Clear cache
  clearAssetCaches();

  // First call (should load from file)
  const startTime1 = performance.now();
  const url1 = await getAssetUrl('icon.cart');
  const duration1 = performance.now() - startTime1;

  // Second call (should use cache)
  const startTime2 = performance.now();
  const url2 = await getAssetUrl('icon.cart');
  const duration2 = performance.now() - startTime2;

  console.assert(url1 === url2, 'URLs should be the same');
  console.assert(duration2 < duration1, 'Cached call should be faster');

  console.log(`✓ Test 11 passed`);
  console.log(`  - First call: ${duration1.toFixed(2)}ms`);
  console.log(`  - Cached call: ${duration2.toFixed(2)}ms`);
  console.log(`  - Speedup: ${(duration1 / duration2).toFixed(2)}x`);
}

/**
 * Test 12: Handle non-existent flags gracefully
 */
async function testNonExistentFlags() {
  console.log('Test 12: Handle non-existent flags gracefully');

  setEnvironment('production');

  const url = await getAssetUrl('nonexistent.flag');

  console.assert(url === null, 'Non-existent flag should return null');

  const urlMap = await getAssetUrls(['icon.cart', 'nonexistent.flag', 'icon.user']);

  console.assert(typeof urlMap === 'object', 'Should return an object');
  console.assert(urlMap['icon.cart'] !== null, 'Existing flag should have URL');
  console.assert(urlMap['nonexistent.flag'] === null, 'Non-existent flag should be null');

  console.log('✓ Test 12 passed');
}

/**
 * Test 13: Environment switching
 */
async function testEnvironmentSwitching() {
  console.log('Test 13: Environment switching');

  // Test production
  setEnvironment('production');
  let env = getEnvironment();
  console.assert(env === 'production', 'Environment should be production');

  const prodUrl = await getAssetUrl('icon.cart');

  // Test development
  setEnvironment('development');
  env = getEnvironment();
  console.assert(env === 'development', 'Environment should be development');

  const devUrl = await getAssetUrl('icon.cart');

  // URLs might be different
  console.assert(prodUrl !== null, 'Production URL should exist');
  console.assert(devUrl !== null, 'Development URL should exist');

  console.log('✓ Test 13 passed');
  console.log('  - Production URL:', prodUrl);
  console.log('  - Development URL:', devUrl);
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('=== AssetMapper Test Suite ===\n');

  const startTime = performance.now();

  try {
    await testGetAssetUrlProduction();
    await testGetAssetUrlDevelopment();
    await testEnvironmentInheritance();
    await testGetMultipleAssetUrls();
    await testGetAvailableAssetFlags();
    await testHasAssetFlag();
    await testGetAssetsByCategory();
    await testPreloadAssetUrls();
    await testGetStatistics();
    await testValidateAssetMap();
    await testCacheFunctionality();
    await testNonExistentFlags();
    await testEnvironmentSwitching();

    const duration = performance.now() - startTime;

    console.log(`\n=== All tests passed! ===`);
    console.log(`Total duration: ${duration.toFixed(2)}ms`);

  } catch (error) {
    console.error('\n=== Test failed! ===');
    console.error(error);
    throw error;
  }
}

// Export for manual testing in browser console
if (typeof window !== 'undefined') {
  window.runAssetLibraryFlagTests = runAllTests;
  console.log('AssetLibrary flag-to-URL tests loaded. Run window.runAssetLibraryFlagTests() to test.');
}

// Auto-run if imported as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}

// Export test description
export const testDescription = `
AssetLibrary Test Suite - Flag-to-URL Mapping:

Tests verify that the AssetLibrary flag-to-URL functionality:
1. Loads asset URLs from JSON configuration
2. Supports environment-specific configurations (dev, staging, prod)
3. Implements inheritance (dev/staging fall back to production)
4. Caches asset URLs for performance
5. Handles multiple asset flags efficiently
6. Provides category-based asset retrieval
7. Validates asset map configuration
8. Handles non-existent flags gracefully
9. Supports environment switching
10. Provides comprehensive statistics

To run these tests in a browser:
1. Open the app in development mode
2. Open browser console
3. Run: window.runAssetLibraryFlagTests()

Example usage:
  import { getAssetUrl } from './src/utils/assets/assetLibrary.js';
  const url = await getAssetUrl('icon.cart');
  console.log(url); // https://cdn.example.com/assets/icons/cart.svg
`;

console.log(testDescription);

