/**
 * CacheHandler - In-memory cache with TTL (Time To Live) support
 *
 * Provides a simple key-value cache with optional expiration.
 * Used throughout the application to avoid redundant operations.
 */

import { log } from './logHandler.js';

// Cache storage - Map for O(1) lookups
const cacheStorage = new Map();

/** @type {number} Lazy expiry sweep interval in the browser (P-06) */
const CACHE_SWEEP_INTERVAL_MS = 10 * 60 * 1000;

/**
 * @param {{ expirationTimestamp: number|null }} entry
 * @param {number} [now]
 * @returns {boolean}
 */
function isCacheEntryExpired(entry, now = Date.now()) {
  return Boolean(entry.expirationTimestamp && now > entry.expirationTimestamp);
}

/**
 * Remove all TTL-expired entries (P-06). Safe to call from tests or periodic sweep.
 * @returns {number} Entries removed
 */
export function sweepExpiredCacheEntries() {
  const now = Date.now();
  let removedCount = 0;

  for (const [key, entry] of cacheStorage.entries()) {
    if (isCacheEntryExpired(entry, now)) {
      cacheStorage.delete(key);
      removedCount += 1;
    }
  }

  if (removedCount > 0) {
    logCache('sweepExpiredCacheEntries', 'success', 'Expired cache entries removed', {
      removedCount,
      remaining: cacheStorage.size
    });
  }

  return removedCount;
}

if (typeof window !== 'undefined' && !globalThis.__cacheHandlerSweepIntervalId) {
  globalThis.__cacheHandlerSweepIntervalId = setInterval(() => {
    sweepExpiredCacheEntries();
  }, CACHE_SWEEP_INTERVAL_MS);
}

/**
 * Cache operation logs are verbose; emit only in dev or when logger is explicitly on (P-03).
 * @returns {boolean}
 */
function shouldLogCacheOperations() {
  return import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGER === 'true';
}

/**
 * @param {string} method
 * @param {string} flag
 * @param {string} description
 * @param {object} [data]
 */
function logCache(method, flag, description, data = {}) {
  if (!shouldLogCacheOperations()) {
    return;
  }

  log('cacheHandler.js', method, flag, description, data);
}

/**
 * Set a value in cache with optional expiration time
 * 
 * @param {string} key - Unique identifier for the cached value
 * @param {any} value - Value to store in cache
 * @param {number} timeToLiveMilliseconds - Optional expiration time in milliseconds (0 = no expiration)
 * @returns {void}
 */
export function setValueWithExpiration(key, value, timeToLiveMilliseconds = 0) {
  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'cacheSet',
      file: 'cacheHandler.js',
      method: 'setValueWithExpiration',
      flag: 'cache-write',
      purpose: `Cache set for key: ${key}`
    });
  }

  if (!key || typeof key !== 'string') {
    logCache('setValueWithExpiration', 'warn', 'Invalid cache key — set skipped', {
      key,
      keyType: typeof key
    });
    return;
  }

  const expirationTimestamp = timeToLiveMilliseconds > 0 
    ? Date.now() + timeToLiveMilliseconds 
    : null;

  cacheStorage.set(key, {
    value,
    expirationTimestamp
  });

  logCache('setValueWithExpiration', 'success', 'Value cached', { 
    key, 
    hasTTL: timeToLiveMilliseconds > 0,
    expiresAt: expirationTimestamp ? new Date(expirationTimestamp).toISOString() : 'never' 
  });
}

/**
 * Retrieve a value from cache
 * 
 * @param {string} key - Unique identifier for the cached value
 * @returns {any|null} - Cached value or null if not found or expired
 */
export function getValueFromCache(key) {
  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'cacheGet',
      file: 'cacheHandler.js',
      method: 'getValueFromCache',
      flag: 'cache-read',
      purpose: `Cache get for key: ${key}`
    });
  }

  if (!key || typeof key !== 'string') {
    logCache('getValueFromCache', 'warn', 'Invalid cache key', { key, keyType: typeof key });
    return null;
  }

  if (!cacheStorage.has(key)) {
    logCache('getValueFromCache', 'cache-miss', 'Key not found', { key });
    return null;
  }

  const cachedEntry = cacheStorage.get(key);

  if (isCacheEntryExpired(cachedEntry)) {
    cacheStorage.delete(key);
    logCache('getValueFromCache', 'expired', 'Cached value expired — removed', { key });
    return null;
  }

  logCache('getValueFromCache', 'cache-hit', 'Returning cached value', { key });
  return cachedEntry.value;
}

/**
 * Check if a key exists in cache and is not expired
 * 
 * @param {string} key - Unique identifier to check
 * @returns {boolean} - True if key exists and is not expired
 */
export function hasValidCacheEntry(key) {
  if (!key || typeof key !== 'string') {
    return false;
  }

  if (!cacheStorage.has(key)) {
    logCache('hasValidCacheEntry', 'cache-miss', 'No valid entry', { key });
    return false;
  }

  const cachedEntry = cacheStorage.get(key);
  if (isCacheEntryExpired(cachedEntry)) {
    cacheStorage.delete(key);
    logCache('hasValidCacheEntry', 'expired', 'Entry expired — removed', { key });
    return false;
  }

  logCache('hasValidCacheEntry', 'cache-hit', 'Valid entry exists', { key });
  return true;
}

/**
 * Remove a value from cache
 * 
 * @param {string} key - Unique identifier to remove
 * @returns {boolean} - True if key was removed, false if not found
 */
export function removeFromCache(key) {
  if (!key || typeof key !== 'string') {
    logCache('removeFromCache', 'warn', 'Invalid cache key', { key });
    return false;
  }

  const existed = cacheStorage.has(key);
  if (existed) {
    cacheStorage.delete(key);
    logCache('removeFromCache', 'success', 'Cache entry removed', { key });
  } else {
    logCache('removeFromCache', 'not-found', 'Cache entry not found', { key });
  }

  return existed;
}

/**
 * Remove all cache entries whose keys start with a prefix
 *
 * @param {string} prefix - Key prefix to match
 * @returns {number} - Number of entries removed
 */
export function removeCacheKeysByPrefix(prefix) {
  if (!prefix || typeof prefix !== 'string') {
    logCache('removeCacheKeysByPrefix', 'warn', 'Invalid prefix', { prefix });
    return 0;
  }

  let removedCount = 0;

  for (const key of cacheStorage.keys()) {
    if (key.startsWith(prefix)) {
      cacheStorage.delete(key);
      removedCount += 1;
    }
  }

  logCache('removeCacheKeysByPrefix', 'success', 'Entries removed by prefix', {
    prefix,
    removedCount
  });

  return removedCount;
}

/**
 * Clear all cached values
 * 
 * @returns {number} - Number of entries cleared
 */
export function clearAllCache() {
  const count = cacheStorage.size;
  cacheStorage.clear();

  logCache('clearAllCache', 'success', 'All cache entries cleared', { clearedCount: count });
  
  return count;
}

/**
 * Get cache statistics
 * 
 * @returns {object} - Cache statistics { totalEntries, expiredEntries }
 */
export function getCacheStatistics() {
  const now = Date.now();
  let expiredCount = 0;

  for (const [, entry] of cacheStorage.entries()) {
    if (isCacheEntryExpired(entry, now)) {
      expiredCount += 1;
    }
  }

  const stats = {
    totalEntries: cacheStorage.size,
    expiredEntries: expiredCount,
    validEntries: cacheStorage.size - expiredCount
  };

  logCache('getCacheStatistics', 'info', 'Cache statistics', stats);
  return stats;
}
