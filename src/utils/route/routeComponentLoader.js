/**
 * Shared import.meta.glob map and component loader lookup for route components.
 */

const componentModules = import.meta.glob([
  '@/templates/**/*.vue',
  '@/components/**/*.vue'
], { eager: false });

/**
 * @param {string} componentPath
 * @returns {Function|null}
 */
export function findComponentLoader(componentPath) {
  if (componentModules[componentPath]) {
    return componentModules[componentPath];
  }

  const srcPath = componentPath.replace('@/', '/src/');
  if (componentModules[srcPath]) {
    return componentModules[srcPath];
  }

  const relativeSrcPath = componentPath.replace('@/', './src/');
  if (componentModules[relativeSrcPath]) {
    return componentModules[relativeSrcPath];
  }

  const relativePath = componentPath.replace('@/', '../');
  if (componentModules[relativePath]) {
    return componentModules[relativePath];
  }

  return null;
}

/**
 * @param {string} componentPath
 * @returns {Promise<object>}
 */
export async function loadComponentModule(componentPath) {
  const componentLoader = findComponentLoader(componentPath);

  if (!componentLoader) {
    throw new Error(`Component not found in pre-loaded modules: ${componentPath}`);
  }

  const componentModule = await componentLoader();
  return componentModule.default || componentModule;
}
