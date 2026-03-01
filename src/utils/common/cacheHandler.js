/**
 * CacheHandler - In-memory cache with TTL (Time To Live) support
 *
 * Provides a simple key-value cache with optional expiration.
 * Used throughout the application to avoid redundant operations.
 */

import { log } from './logHandler.js';

// Cache storage - Map for O(1) lookups
const cacheStorage = new Map();

/**
 * Set a value in cache with optional expiration time
 * 
 * @param {string} key - Unique identifier for the cached value
 * @param {any} value - Value to store in cache
 * @param {number} timeToLiveMilliseconds - Optional expiration time in milliseconds (0 = no expiration)
 * @returns {void}
 */
export function setValueWithExpiration(key, value, timeToLiveMilliseconds = 0) {
  log('cacheHandler.js', 'setValueWithExpiration', 'start', 'Setting value in cache', { key, hasTTL: timeToLiveMilliseconds > 0 });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'cacheSet',
      file: 'cacheHandler.js',
      method: 'setValueWithExpiration',
      flag: 'cache-write',
      purpose: `Cache set for key: ${key}`
    });
  }

  // Validate key is provided
  if (!key || typeof key !== 'string') {
    log('cacheHandler.js', 'setValueWithExpiration', 'warn', 'Invalid cache key provided, skipping set operation', { key, keyType: typeof key });
    log('cacheHandler.js', 'setValueWithExpiration', 'return', 'Returning early due to invalid key', {});
    return;
  }

  // Calculate expiration timestamp if TTL is provided
  const expirationTimestamp = timeToLiveMilliseconds > 0 
    ? Date.now() + timeToLiveMilliseconds 
    : null;

  // Store value with metadata
  cacheStorage.set(key, {
    value,
    expirationTimestamp
  });

  log('cacheHandler.js', 'setValueWithExpiration', 'success', 'Value cached successfully', { 
    key, 
    expiresAt: expirationTimestamp ? new Date(expirationTimestamp).toISOString() : 'never' 
  });
  
  log('cacheHandler.js', 'setValueWithExpiration', 'return', 'Cache set complete', { key });
}

/**
 * Retrieve a value from cache
 * 
 * @param {string} key - Unique identifier for the cached value
 * @returns {any|null} - Cached value or null if not found or expired
 */
export function getValueFromCache(key) {
  log('cacheHandler.js', 'getValueFromCache', 'start', 'Getting value from cache', { key });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'cacheGet',
      file: 'cacheHandler.js',
      method: 'getValueFromCache',
      flag: 'cache-read',
      purpose: `Cache get for key: ${key}`
    });
  }

  // Validate key is provided
  if (!key || typeof key !== 'string') {
    log('cacheHandler.js', 'getValueFromCache', 'warn', 'Invalid cache key provided', { key, keyType: typeof key });
    log('cacheHandler.js', 'getValueFromCache', 'return', 'Returning null due to invalid key', { key });
    return null;
  }

  // Check if key exists in cache
  if (!cacheStorage.has(key)) {
    log('cacheHandler.js', 'getValueFromCache', 'cache-miss', 'Key not found in cache', { key });
    log('cacheHandler.js', 'getValueFromCache', 'return', 'Returning null - key not found', { key });
    return null;
  }

  // Get cached entry
  const cachedEntry = cacheStorage.get(key);

  // Check if entry has expired
  if (cachedEntry.expirationTimestamp && Date.now() > cachedEntry.expirationTimestamp) {
    // Remove expired entry
    cacheStorage.delete(key);
    log('cacheHandler.js', 'getValueFromCache', 'expired', 'Cached value expired, removed', { key });
    log('cacheHandler.js', 'getValueFromCache', 'return', 'Returning null - value expired', { key });
    return null;
  }

  // Return cached value
  log('cacheHandler.js', 'getValueFromCache', 'cache-hit', 'Cache hit, returning value', { key });
  log('cacheHandler.js', 'getValueFromCache', 'return', 'Returning cached value', { key });
  return cachedEntry.value;
}

/**
 * Check if a key exists in cache and is not expired
 * 
 * @param {string} key - Unique identifier to check
 * @returns {boolean} - True if key exists and is not expired
 */
export function hasValidCacheEntry(key) {
  log('cacheHandler.js', 'hasValidCacheEntry', 'start', 'Checking if cache has valid entry', { key });

  // Validate key
  if (!key || typeof key !== 'string') {
    log('cacheHandler.js', 'hasValidCacheEntry', 'return', 'Returning false - invalid key', { key });
    return false;
  }

  // Check existence
  if (!cacheStorage.has(key)) {
    log('cacheHandler.js', 'hasValidCacheEntry', 'return', 'Returning false - key not found', { key });
    return false;
  }

  // Check expiration
  const cachedEntry = cacheStorage.get(key);
  if (cachedEntry.expirationTimestamp && Date.now() > cachedEntry.expirationTimestamp) {
    // Expired - remove it
    cacheStorage.delete(key);
    log('cacheHandler.js', 'hasValidCacheEntry', 'expired', 'Entry expired and removed', { key });
    log('cacheHandler.js', 'hasValidCacheEntry', 'return', 'Returning false - entry expired', { key });
    return false;
  }

  log('cacheHandler.js', 'hasValidCacheEntry', 'return', 'Returning true - valid entry exists', { key });
  return true;
}

/**
 * Remove a value from cache
 * 
 * @param {string} key - Unique identifier to remove
 * @returns {boolean} - True if key was removed, false if not found
 */
export function removeFromCache(key) {
  log('cacheHandler.js', 'removeFromCache', 'start', 'Removing value from cache', { key });

  if (!key || typeof key !== 'string') {
    log('cacheHandler.js', 'removeFromCache', 'return', 'Returning false - invalid key', { key });
    return false;
  }

  const existed = cacheStorage.has(key);
  if (existed) {
    cacheStorage.delete(key);
    log('cacheHandler.js', 'removeFromCache', 'success', 'Cache entry removed', { key });
  } else {
    log('cacheHandler.js', 'removeFromCache', 'not-found', 'Cache entry not found', { key });
  }

  log('cacheHandler.js', 'removeFromCache', 'return', 'Returning removal status', { key, existed });
  return existed;
}

/**
 * Clear all cached values
 * 
 * @returns {number} - Number of entries cleared
 */
export function clearAllCache() {
  log('cacheHandler.js', 'clearAllCache', 'start', 'Clearing all cache entries', {});

  const count = cacheStorage.size;
  cacheStorage.clear();

  log('cacheHandler.js', 'clearAllCache', 'success', 'All cache entries cleared', { clearedCount: count });
  log('cacheHandler.js', 'clearAllCache', 'return', 'Returning cleared count', { count });
  
  return count;
}

/**
 * Get cache statistics
 * 
 * @returns {object} - Cache statistics { totalEntries, expiredEntries }
 */
export function getCacheStatistics() {
  log('cacheHandler.js', 'getCacheStatistics', 'start', 'Getting cache statistics', {});

  const now = Date.now();
  let expiredCount = 0;

  // Count expired entries
  for (const [key, entry] of cacheStorage.entries()) {
    if (entry.expirationTimestamp && now > entry.expirationTimestamp) {
      expiredCount++;
    }
  }

  const stats = {
    totalEntries: cacheStorage.size,
    expiredEntries: expiredCount,
    validEntries: cacheStorage.size - expiredCount
  };

  log('cacheHandler.js', 'getCacheStatistics', 'return', 'Returning cache statistics', stats);
  return stats;
}
