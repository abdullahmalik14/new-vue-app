import { defineStore } from 'pinia';
import { log } from '../utils/common/logHandler.js';
import { syncPreloadStoreBuildHash } from '../utils/build/appBuildHash.js';
import {
  attachStorageQuotaMonitor,
  buildPersistKey,
  createPersistedStateSerializer,
  migrateLegacyPersistedState,
  resolvePersistStorage,
  resolvePersistTtlMs,
} from '../utils/common/persistUtils.js';

function normalizeStringSet(values) {
  if (values instanceof Set) {
    return values;
  }

  if (Array.isArray(values)) {
    return new Set(values);
  }

  return new Set();
}

const PRELOAD_PERSIST_VERSION = 1;
const PRELOAD_PERSIST_KEY = buildPersistKey('app-preload-state');
const preloadPersistSerializer = createPersistedStateSerializer({
  version: PRELOAD_PERSIST_VERSION,
  ttlMs: resolvePersistTtlMs(),
  fallback: {},
  migrate: (state) => (state && typeof state === 'object' ? state : {}),
  mapBeforeSerialize: (state) => ({
    ...(state && typeof state === 'object' ? state : {}),
    preloadedSections: [...normalizeStringSet(state?.preloadedSections)],
    preloadedAssets: [...normalizeStringSet(state?.preloadedAssets)],
  }),
});

function finalizePreloadRestore(store) {
  store.preloadedSections = normalizeStringSet(store.preloadedSections);
  store.preloadedAssets = normalizeStringSet(store.preloadedAssets);

  const sync = syncPreloadStoreBuildHash(store);
  if (sync.invalidated) {
    log('usePreloadStore.js', 'afterRestore', 'build-hash', 'Stale preload state cleared after persist rehydrate', {
      previousHash: sync.previousHash,
      currentHash: sync.currentBuildHash,
    });
  }
}

export const usePreloadStore = defineStore('preload', {
  state: () => ({
    preloadedSections: new Set(), // Resolved section bundles (O(1) membership)
    preloadedAssets: new Set(), // Resolved asset URLs (O(1) membership)
    buildHash: null, // Persisted build hash for invalidation
    manifestLoadFailed: false, // Set when production section manifest cannot be loaded
    sectionsInProgress: new Set() // In-flight section preloads (not persisted)
  }),

  getters: {
    preloadedAssetCount(state) {
      return state.preloadedAssets.size;
    },
    hasSection: (state) => (sectionName) => state.preloadedSections.has(sectionName),
    hasAsset: (state) => (assetUrl) => state.preloadedAssets.has(assetUrl),
  },

  actions: {
    /**
     * Mark a section as preloaded
     * @param {string} sectionName 
     */
    addSection(sectionName) {
      if (typeof sectionName !== 'string' || sectionName.trim() === '') {
        return;
      }
      if (!this.preloadedSections.has(sectionName)) {
        this.preloadedSections.add(sectionName);
        log('usePreloadStore.js', 'addSection', 'add', 'Section marked as preloaded', { sectionName });
      }
    },

    /**
     * Remove a section from the preloaded list (e.g. locale-change refresh).
     * @param {string} sectionName
     */
    removeSection(sectionName) {
      if (this.preloadedSections.delete(sectionName)) {
        log('usePreloadStore.js', 'removeSection', 'remove', 'Section removed from preload cache', { sectionName });
      }
    },

    /**
     * Mark an asset as preloaded
     * @param {string} assetUrl 
     */
    addAsset(assetUrl) {
      if (typeof assetUrl !== 'string' || assetUrl.trim() === '') {
        return;
      }
      if (!this.preloadedAssets.has(assetUrl)) {
        this.preloadedAssets.add(assetUrl);
        // Log less frequently for assets to avoid noise, or keep it if needed
        // log('usePreloadStore.js', 'addAsset', 'add', 'Asset marked as preloaded', { assetUrl });
      }
    },

    /**
     * Remove a single asset URL from the preload cache (e.g. test / DOM dedup scenarios).
     * @param {string} assetUrl
     */
    removeAsset(assetUrl) {
      this.preloadedAssets.delete(assetUrl);
    },

    /**
     * Clear only resolved asset URLs; section bundle state is unchanged.
     */
    clearAssets() {
      this.preloadedAssets = new Set();
    },

    /**
     * Mark a section preload as in progress
     * @param {string} sectionName
     */
    markSectionInProgress(sectionName) {
      if (!this.sectionsInProgress.has(sectionName)) {
        this.sectionsInProgress.add(sectionName);
        log('usePreloadStore.js', 'markSectionInProgress', 'start', 'Section preload in progress', { sectionName });
      }
    },

    /**
     * Clear in-progress marker for a section preload
     * @param {string} sectionName
     */
    unmarkSectionInProgress(sectionName) {
      if (this.sectionsInProgress.delete(sectionName)) {
        log('usePreloadStore.js', 'unmarkSectionInProgress', 'complete', 'Section preload no longer in progress', { sectionName });
      }
    },

    /**
     * Check whether a section preload is currently in progress
     * @param {string} sectionName
     * @returns {boolean}
     */
    isSectionInProgress(sectionName) {
      return this.sectionsInProgress.has(sectionName);
    },

    /**
     * Track whether the production section manifest failed to load.
     * @param {boolean} failed
     */
    setManifestLoadFailed(failed) {
      this.manifestLoadFailed = failed;
      log('usePreloadStore.js', 'setManifestLoadFailed', failed ? 'failed' : 'recovered', 'Manifest load status updated', {
        manifestLoadFailed: failed
      });
    },

    /**
     * Clear all preload state
     * @param {{ resetBuildHash?: boolean }} [options]
     */
    clearState({ resetBuildHash = false } = {}) {
      this.preloadedSections = new Set();
      this.preloadedAssets = new Set();
      if (resetBuildHash) {
        this.buildHash = null;
      }
      this.manifestLoadFailed = false;
      this.sectionsInProgress = new Set();
      log('usePreloadStore.js', 'clearState', 'clear', 'Preload state cleared', {});
    }
  },

  persist: {
    key: PRELOAD_PERSIST_KEY,
    storage: () => resolvePersistStorage(),
    pick: ['preloadedSections', 'preloadedAssets', 'buildHash'],
    serializer: preloadPersistSerializer,
    beforeRestore({ store }) {
      migrateLegacyPersistedState({
        storage: resolvePersistStorage(),
        newKey: PRELOAD_PERSIST_KEY,
        legacyKeys: ['app-preload-state'],
      });
      store.sectionsInProgress = new Set();
    },
    afterRestore({ store }) {
      finalizePreloadRestore(store);
      attachStorageQuotaMonitor(store, { key: PRELOAD_PERSIST_KEY, label: 'preload' });
    },
  }
});
