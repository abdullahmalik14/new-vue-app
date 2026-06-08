/**
 * App build hash helpers for preload cache invalidation (M-05 / Preloading Task 6).
 */

/**
 * @returns {string | null}
 */
export function getAppBuildHash() {
  return import.meta.env.VITE_BUILD_HASH || null;
}

/**
 * Clear persisted preload state when the deploy/build hash changes.
 *
 * @param {{ clearState: () => void, buildHash: string | null }} store
 * @returns {{ invalidated: boolean, previousHash: string | null, currentBuildHash: string | null }}
 */
export function syncPreloadStoreBuildHash(store) {
  const currentBuildHash = getAppBuildHash();

  if (!currentBuildHash) {
    return { invalidated: false, previousHash: store.buildHash, currentBuildHash: null };
  }

  if (store.buildHash !== currentBuildHash) {
    const previousHash = store.buildHash;
    store.clearState();
    store.buildHash = currentBuildHash;
    if (typeof store.$persist === 'function') {
      store.$persist();
    }
    return { invalidated: true, previousHash, currentBuildHash };
  }

  return { invalidated: false, previousHash: store.buildHash, currentBuildHash };
}
