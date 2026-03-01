import { defineStore } from 'pinia';
import { log } from '../utils/common/logHandler.js';

export const usePreloadStore = defineStore('preload', {
  state: () => ({
    preloadedSections: [], // Array of strings
    preloadedAssets: []    // Array of strings (URLs)
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
     * Clear all preload state
     */
    clearState() {
      this.preloadedSections = [];
      this.preloadedAssets = [];
      log('usePreloadStore.js', 'clearState', 'clear', 'Preload state cleared', {});
    }
  },

  persist: {
    key: 'app-preload-state',
    storage: localStorage,
    paths: ['preloadedSections', 'preloadedAssets']
  }
});
