/**
 * Route-level resource loading after navigation guards settle (M9).
 * Re-exports from sections — routing consumers keep this import path.
 */

export {
  resolveCurrentSectionForNavigation,
  loadCurrentSectionResources,
} from '../sections/sectionNavigationResources.js';
