import { defineStore } from 'pinia';
import { log } from '../utils/common/logHandler.js';

export const usePreloadStore = defineStore('preload', {
  state: () => ({
    preloadedSections: [], // Array of strings
    preloadedAssets: [],    // Array of strings (URLs)
    buildHash: null,       // Cleared on new deploy to invalidate stale preload state
    manifestLoadFailed: false, // Set when production section manifest cannot be loaded
    sectionsInProgress: [] // Reactive in-flight section preloads (not persisted)
  }),

  actions: {
    /**
     * Mark a section as preloaded
     * @param {string} sectionName 
     */
    addSection(sectionName) {
      if (!this.preloadedSections.includes(sectionName)) {
        this.preloadedSections.push(sectionName);
        log('usePreloadStore.js', 'addSection', 'add', 'Section marked as preloaded', { sectionName });
      }
    },

    /**
     * Check if a section is preloaded
     * @param {string} sectionName 
     * @returns {boolean}
     */
    hasSection(sectionName) {
      return this.preloadedSections.includes(sectionName);
    },

    /**
     * Remove a section from the preloaded list (e.g. locale-change refresh).
     * @param {string} sectionName
     */
    removeSection(sectionName) {
      const index = this.preloadedSections.indexOf(sectionName);

      if (index !== -1) {
        this.preloadedSections.splice(index, 1);
        log('usePreloadStore.js', 'removeSection', 'remove', 'Section removed from preload cache', { sectionName });
      }
    },

    /**
     * Mark an asset as preloaded
     * @param {string} assetUrl 
     */
    addAsset(assetUrl) {
      if (!this.preloadedAssets.includes(assetUrl)) {
        this.preloadedAssets.push(assetUrl);
        // Log less frequently for assets to avoid noise, or keep it if needed
        // log('usePreloadStore.js', 'addAsset', 'add', 'Asset marked as preloaded', { assetUrl });
      }
    },

    /**
     * Check if an asset is preloaded
     * @param {string} assetUrl 
     * @returns {boolean}
     */
    hasAsset(assetUrl) {
      return this.preloadedAssets.includes(assetUrl);
    },

    /**
     * Mark a section preload as in progress
     * @param {string} sectionName
     */
    markSectionInProgress(sectionName) {
      if (!this.sectionsInProgress.includes(sectionName)) {
        this.sectionsInProgress.push(sectionName);
        log('usePreloadStore.js', 'markSectionInProgress', 'start', 'Section preload in progress', { sectionName });
      }
    },

    /**
     * Clear in-progress marker for a section preload
     * @param {string} sectionName
     */
    unmarkSectionInProgress(sectionName) {
      const index = this.sectionsInProgress.indexOf(sectionName);
      if (index !== -1) {
        this.sectionsInProgress.splice(index, 1);
        log('usePreloadStore.js', 'unmarkSectionInProgress', 'complete', 'Section preload no longer in progress', { sectionName });
      }
    },

    /**
     * Check whether a section preload is currently in progress
     * @param {string} sectionName
     * @returns {boolean}
     */
    isSectionInProgress(sectionName) {
      return this.sectionsInProgress.includes(sectionName);
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
     */
    clearState() {
      this.preloadedSections = [];
      this.preloadedAssets = [];
      this.buildHash = null;
      this.manifestLoadFailed = false;
      this.sectionsInProgress = [];
      log('usePreloadStore.js', 'clearState', 'clear', 'Preload state cleared', {});
    }
  },

  persist: {
    key: 'app-preload-state',
    storage: localStorage,
    paths: ['preloadedSections', 'preloadedAssets', 'buildHash']
  }
});
