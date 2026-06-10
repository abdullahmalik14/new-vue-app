/**
 * Centralized NotFound component loader.
 * Keeps the component path in one place to avoid scattering literals.
 */

// Export the path for diagnostics (not used directly by router import)
export const NOT_FOUND_COMPONENT_PATH = '@/dev/templates/misc/NotFoundPage.vue';

export function loadNotFoundComponent() {
  // Use a literal import for bundler friendliness while centralizing location
  return import('@/dev/templates/misc/NotFoundPage.vue');
}


