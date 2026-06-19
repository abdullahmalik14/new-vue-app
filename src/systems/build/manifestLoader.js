/**
 * @file manifestLoader.js
 * @description Build-system re-export of runtime section manifest helpers.
 * Runtime section loading imports from `systems/sections/sectionManifestHelpers.js`.
 */

export {
  loadSectionManifest,
  getSectionBundlePaths,
  clearManifestCache,
} from '../sections/sectionManifestHelpers.js';
