import { defineStore } from 'pinia';
import { log } from '../infrastructure/logging/logHandler.js';
import { syncPreloadStoreBuildHash } from '../systems/build/appBuildHash.js';
import {
  attachStorageQuotaMonitor,
  buildPersistKey,
  createPersistedStateSerializer,
  migrateLegacyPersistedState,
  persistStorageAdapter,
  resolvePersistStorage,
  resolvePersistTtlMs,
} from '../utils/common/persistUtils.js';

export function normalizeStringSet(values) {
  if (values instanceof Set) {
    return values;
  }

  if (Array.isArray(values)) {
    return new Set(values.filter((entry) => typeof entry === 'string' && entry.trim() !== ''));
  }

  return new Set();
}

function isValidSectionKey(sectionName) {
  return typeof sectionName === 'string' && sectionName.trim() !== '';
}

/** Replace Set reference so pinia-plugin-persistedstate $subscribe fires on add. */
function addToStringSet(currentSet, value) {
  const set = normalizeStringSet(currentSet);
  if (set.has(value)) {
    return set;
  }
  return new Set([...set, value]);
}

/** Replace Set reference so pinia-plugin-persistedstate $subscribe fires on remove. */
function removeFromStringSet(currentSet, value) {
  const set = normalizeStringSet(currentSet);
  if (!set.has(value)) {
    return set;
  }
  const next = new Set(set);
  next.delete(value);
  return next;
}

function ensurePreloadSets(store) {
  store.preloadedSections = normalizeStringSet(store.preloadedSections);
  store.preloadedAssets = normalizeStringSet(store.preloadedAssets);
  store.sectionsInProgress = normalizeStringSet(store.sectionsInProgress);
}

function mapPreloadPersistedState(state) {
  const source = state && typeof state === 'object' ? state : {};
  return {
    ...source,
    preloadedSections: normalizeStringSet(source.preloadedSections),
    preloadedAssets: normalizeStringSet(source.preloadedAssets),
  };
}

function migratePreloadPersistedState(state, fromVersion) {
  if (!state || typeof state !== 'object') {
    return {};
  }

  if (fromVersion === 0) {
    return {
      preloadedSections: state.preloadedSections ?? [],
      preloadedAssets: state.preloadedAssets ?? [],
      buildHash: state.buildHash ?? null,
      manifestLoadFailed: state.manifestLoadFailed ?? false,
    };
  }

  return state;
}

const PRELOAD_PERSIST_VERSION = 1;
const PRELOAD_PERSIST_KEY = buildPersistKey('app-preload-state');
const preloadPersistSerializer = createPersistedStateSerializer({
  version: PRELOAD_PERSIST_VERSION,
  ttlMs: resolvePersistTtlMs(),
  fallback: {},
  migrate: migratePreloadPersistedState,
  mapBeforeSerialize: (state) => {
    const mapped = mapPreloadPersistedState(state);
    return {
      ...mapped,
      preloadedSections: [...mapped.preloadedSections],
      preloadedAssets: [...mapped.preloadedAssets],
    };
  },
  mapAfterDeserialize: mapPreloadPersistedState,
});

function finalizePreloadRestore(store) {
  store.preloadedSections = normalizeStringSet(store.preloadedSections);
  store.preloadedAssets = normalizeStringSet(store.preloadedAssets);

  const sync = syncPreloadStoreBuildHash(store);
  if (sync.invalidated) {
    log('usePreloadStore.js', 'afterHydrate', 'build-hash', 'Stale preload state cleared after persist rehydrate', {
      previousHash: sync.previousHash,
      currentHash: sync.currentBuildHash,
    });
  }
}

function commitPersistedPreloadState(store) {
  if (typeof store.$persist === 'function') {
    store.$persist();
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
      return normalizeStringSet(state.preloadedAssets).size;
    },
    hasSection: (state) => (sectionName) =>
      normalizeStringSet(state.preloadedSections).has(sectionName),
    hasAsset: (state) => (assetUrl) => normalizeStringSet(state.preloadedAssets).has(assetUrl),
    isSectionInProgress: (state) => (sectionName) =>
      isValidSectionKey(sectionName) &&
      normalizeStringSet(state.sectionsInProgress).has(sectionName),
  },

  actions: {
    /**
     * Mark a section as preloaded
     * @param {string} sectionName 
     */
    addSection(sectionName) {
      if (!isValidSectionKey(sectionName)) {
        return;
      }
      ensurePreloadSets(this);
      const nextSections = addToStringSet(this.preloadedSections, sectionName);
      if (nextSections !== this.preloadedSections) {
        this.preloadedSections = nextSections;
        log('usePreloadStore.js', 'addSection', 'add', 'Section marked as preloaded', { sectionName });
        commitPersistedPreloadState(this);
      }
    },

    /**
     * Remove a section from the preloaded list (e.g. locale-change refresh).
     * @param {string} sectionName
     */
    removeSection(sectionName) {
      if (!isValidSectionKey(sectionName)) {
        return;
      }
      ensurePreloadSets(this);
      const nextSections = removeFromStringSet(this.preloadedSections, sectionName);
      if (nextSections !== this.preloadedSections) {
        this.preloadedSections = nextSections;
        log('usePreloadStore.js', 'removeSection', 'remove', 'Section removed from preload cache', { sectionName });
        commitPersistedPreloadState(this);
      }
    },

    /**
     * Mark an asset as preloaded
     * @param {string} assetUrl 
     */
    addPreloadedAsset(assetUrl) {
      if (!isValidSectionKey(assetUrl)) {
        return;
      }
      ensurePreloadSets(this);
      const nextAssets = addToStringSet(this.preloadedAssets, assetUrl);
      if (nextAssets !== this.preloadedAssets) {
        this.preloadedAssets = nextAssets;
        commitPersistedPreloadState(this);
      }
    },

    /** @deprecated Use {@link addPreloadedAsset} */
    addAsset(assetUrl) {
      return this.addPreloadedAsset(assetUrl);
    },

    /**
     * Remove a single asset URL from the preload cache (e.g. test / DOM dedup scenarios).
     * @param {string} assetUrl
     */
    removeAsset(assetUrl) {
      if (!isValidSectionKey(assetUrl)) {
        return;
      }
      ensurePreloadSets(this);
      const nextAssets = removeFromStringSet(this.preloadedAssets, assetUrl);
      if (nextAssets !== this.preloadedAssets) {
        this.preloadedAssets = nextAssets;
        commitPersistedPreloadState(this);
      }
    },

    /**
     * Clear only resolved asset URLs; section bundle state is unchanged.
     */
    clearAssets() {
      this.preloadedAssets = new Set();
      commitPersistedPreloadState(this);
    },

    /**
     * Mark a section preload as in progress
     * @param {string} sectionName
     */
    markSectionInProgress(sectionName) {
      if (!isValidSectionKey(sectionName)) {
        return;
      }
      ensurePreloadSets(this);
      const nextSectionSet = addToStringSet(this.sectionsInProgress, sectionName);
      if (nextSectionSet !== this.sectionsInProgress) {
        this.sectionsInProgress = nextSectionSet;
        log('usePreloadStore.js', 'markSectionInProgress', 'start', 'Section preload in progress', { sectionName });
      }
    },

    /**
     * Clear in-progress marker for a section preload
     * @param {string} sectionName
     */
    unmarkSectionInProgress(sectionName) {
      if (!isValidSectionKey(sectionName)) {
        return;
      }
      ensurePreloadSets(this);
      const nextSectionSet = removeFromStringSet(this.sectionsInProgress, sectionName);
      if (nextSectionSet !== this.sectionsInProgress) {
        this.sectionsInProgress = nextSectionSet;
        log('usePreloadStore.js', 'unmarkSectionInProgress', 'complete', 'Section preload no longer in progress', { sectionName });
      }
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
    clearPreloadState({ resetBuildHash = false } = {}) {
      this.preloadedSections = new Set();
      this.preloadedAssets = new Set();
      if (resetBuildHash) {
        this.buildHash = null;
      }
      this.manifestLoadFailed = false;
      this.sectionsInProgress = new Set();
      log('usePreloadStore.js', 'clearPreloadState', 'clear', 'Preload state cleared', {});
      commitPersistedPreloadState(this);
    },

    /** @deprecated Use {@link clearPreloadState} */
    clearState(options) {
      return this.clearPreloadState(options);
    }
  },

  persist: {
    key: PRELOAD_PERSIST_KEY,
    storage: persistStorageAdapter,
    pick: ['preloadedSections', 'preloadedAssets', 'buildHash'],
    serializer: preloadPersistSerializer,
    beforeHydrate({ store }) {
      migrateLegacyPersistedState({
        storage: resolvePersistStorage(),
        newKey: PRELOAD_PERSIST_KEY,
        legacyKeys: ['app-preload-state'],
        baseKey: 'app-preload-state',
      });
      store.sectionsInProgress = new Set();
    },
    afterHydrate({ store }) {
      finalizePreloadRestore(store);
      attachStorageQuotaMonitor(store, { key: PRELOAD_PERSIST_KEY, label: 'preload' });
    },
  }
});
