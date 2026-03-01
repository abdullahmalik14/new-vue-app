// vueApp-main-new/build/tailwind/sectionScanner.js

import path from 'path';
import { loadJsonConfigSync } from '../../src/utils/common/jsonConfigLoaderNode.js';

/**
 * @file sectionScanner.js
 * @description Scan sections to generate Tailwind content paths
 * @purpose Build-time utility to determine which components belong to which section
 */

/**
 * @function log
 * @description Simple build-time logging
 * @param {string} file - File name
 * @param {string} method - Method name
 * @param {string} flag - Log flag
 * @param {string} description - Description
 * @param {object} data - Data to log
 */
function log(file, method, flag, description, data) {
  if (process.env.VITE_ENABLE_LOGGER === 'true') {
    const timestamp = new Date().toISOString();
    const dataStr = data ? JSON.stringify(data) : '{}';
    // eslint-disable-next-line no-console
    console.log(`[${timestamp}] [${file}] [${method}] [${flag}] ${description} ${dataStr}`);
  }
}

/**
 * @function scanRouteConfigForSections
 * @description Extract all sections from routeConfig.json
 * @param {string} routeConfigPath - Path to routeConfig.json
 * @returns {Map<string, object>} Map of section name to section metadata
 */
export function scanRouteConfigForSections(routeConfigPath) {
  log('sectionScanner.js', 'scanRouteConfigForSections', 'start', 'Scanning routeConfig for sections', { routeConfigPath });

  try {
    const routeConfigData = loadJsonConfigSync(routeConfigPath, {
      configName: 'route_config_sections',
      basePath: path.dirname(routeConfigPath),
      skipValidation: false
    });

    const routes = Array.isArray(routeConfigData) ? routeConfigData : null;

    // Validate routes is an array
    if (!routes) {
      const error = new Error('Route config must be an array');
      log('sectionScanner.js', 'scanRouteConfigForSections', 'error', 'Invalid route config format', { type: typeof routes });
      throw error;
    }

    const sections = new Map();
    const warnings = [];

    for (const route of routes) {
      // Validate route has required properties
      if (!route.slug) {
        warnings.push(`Route missing slug: ${JSON.stringify(route)}`);
        continue;
      }

      if (!route.section) continue;

      // Handle string section
      if (typeof route.section === 'string') {
        // Validate section name is not empty
        if (!route.section.trim()) {
          warnings.push(`Route ${route.slug} has empty section name`);
          continue;
        }

        if (!sections.has(route.section)) {
          sections.set(route.section, {
            name: route.section,
            routes: [],
            components: [],
            cssBundle: true
          });
        }
        sections.get(route.section).routes.push(route.slug);

        if (route.componentPath) {
          // Validate component path format
          if (!route.componentPath.includes('@/') && !route.componentPath.includes('/')) {
            warnings.push(`Route ${route.slug} has invalid component path: ${route.componentPath}`);
          }
          sections.get(route.section).components.push(route.componentPath);
        }
      }

      // Handle object section (role-based)
      if (typeof route.section === 'object' && route.section !== null && !Array.isArray(route.section)) {
        // Validate object has at least one role
        if (Object.keys(route.section).length === 0) {
          warnings.push(`Route ${route.slug} has empty section object`);
          continue;
        }

        for (const [role, sectionName] of Object.entries(route.section)) {
          // Validate section name is a string and not empty
          if (typeof sectionName !== 'string' || !sectionName.trim()) {
            warnings.push(`Route ${route.slug} has invalid section name for role ${role}: ${sectionName}`);
            continue;
          }

          if (!sections.has(sectionName)) {
            sections.set(sectionName, {
              name: sectionName,
              routes: [],
              components: [],
              cssBundle: true
            });
          }
          sections.get(sectionName).routes.push(`${route.slug}(${role})`);

          // Check for custom component path for role
          if (route.customComponentPath && route.customComponentPath[role]) {
            const customPath = route.customComponentPath[role].componentPath;
            // Validate component path format
            if (!customPath.includes('@/') && !customPath.includes('/')) {
              warnings.push(`Route ${route.slug} role ${role} has invalid custom component path: ${customPath}`);
            }
            sections.get(sectionName).components.push(customPath);
          } else if (route.componentPath) {
            sections.get(sectionName).components.push(route.componentPath);
          }
        }
      }

      // Check cssBundle flag
      if (route.cssBundle === false && route.componentPath) {
        // Mark this component to be excluded
        log('sectionScanner.js', 'scanRouteConfigForSections', 'exclude', 'Route has cssBundle=false', {
          route: route.slug,
          component: route.componentPath
        });
      }
    }

    // Log warnings if any
    if (warnings.length > 0) {
      log('sectionScanner.js', 'scanRouteConfigForSections', 'warning', 'Validation warnings found', {
        warningCount: warnings.length,
        warnings: warnings.slice(0, 5) // Log first 5 warnings
      });
      // eslint-disable-next-line no-console
      console.warn('[sectionScanner.js] Validation warnings:', warnings);
    }

    // Validate we found at least one section
    if (sections.size === 0) {
      log('sectionScanner.js', 'scanRouteConfigForSections', 'warning', 'No sections found in route config', {
        routeCount: routes.length
      });
    }

    log('sectionScanner.js', 'scanRouteConfigForSections', 'success', 'Sections scanned from routeConfig', {
      sectionCount: sections.size,
      sectionNames: Array.from(sections.keys()),
      warningCount: warnings.length
    });

    return sections;
  } catch (error) {
    log('sectionScanner.js', 'scanRouteConfigForSections', 'error', 'Error scanning routeConfig', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * @function resolveComponentPath
 * @description Resolve component path from alias to actual path
 * @param {string} componentPath - Component path with alias (e.g., @/components/...)
 * @param {string} baseDir - Base directory (default: 'src')
 * @returns {string} Resolved file path
 */
export function resolveComponentPath(componentPath, baseDir = 'src') {
  log('sectionScanner.js', 'resolveComponentPath', 'resolve', 'Resolving component path', { componentPath, baseDir });

  try {
    // Replace @/ alias with actual path
    let resolved = componentPath.replace(/^@\//, `${baseDir}/`);

    // Ensure .vue extension
    if (!resolved.endsWith('.vue')) {
      resolved += '.vue';
    }

    log('sectionScanner.js', 'resolveComponentPath', 'success', 'Component path resolved', {
      original: componentPath,
      resolved
    });

    return resolved;
  } catch (error) {
    log('sectionScanner.js', 'resolveComponentPath', 'error', 'Error resolving path', {
      componentPath,
      error: error.message
    });
    return componentPath;
  }
}

/**
 * @function generateContentPathsForSection
 * @description Generate Tailwind content paths for a specific section
 * @param {string} sectionName - Section name
 * @param {object} sectionMetadata - Section metadata
 * @param {string} baseDir - Base directory
 * @returns {Array<string>} Array of content paths
 */
export function generateContentPathsForSection(sectionName, sectionMetadata, baseDir = 'src') {
  log('sectionScanner.js', 'generateContentPathsForSection', 'start', 'Generating content paths', {
    sectionName,
    componentCount: sectionMetadata.components.length
  });

  try {
    const contentPaths = [];
    const baseFolders = new Set();

    // Add global layout components (navbar, footer, etc.) to EVERY section
    // These are shared across all pages and need their styles in every section
    contentPaths.push(`${baseDir}/components/layout/**/*.vue`);
    contentPaths.push(`${baseDir}/App.vue`);

    // Add component paths
    for (const componentPath of sectionMetadata.components) {
      const resolved = resolveComponentPath(componentPath, baseDir);
      contentPaths.push(resolved);

      // Also include directory for wildcards
      const dir = path.dirname(resolved);
      const wildcard = `${dir}/**/*.vue`;
      if (!contentPaths.includes(wildcard)) {
        contentPaths.push(wildcard);
      }

      // Detect base folder (e.g., dashboard) from templates/components path
      const normalized = resolved.replace(/\\/g, '/');
      const folderMatch = normalized.match(new RegExp(`${baseDir}/(templates|components)/([^/]+)/`));
      if (folderMatch && folderMatch[2]) {
        baseFolders.add(folderMatch[2]);
      }
    }

    // Add derived base folder fallbacks (both components/ and templates/)
    for (const folder of baseFolders) {
      const componentsPath = `${baseDir}/components/${folder}/**/*.vue`;
      const templatesPath = `${baseDir}/templates/${folder}/**/*.vue`;

      if (!contentPaths.includes(componentsPath)) {
        contentPaths.push(componentsPath);
      }
      if (!contentPaths.includes(templatesPath)) {
        contentPaths.push(templatesPath);
      }
    }

    // Add section-specific wildcard (if directory follows section naming)
    const sectionComponentsPath = `${baseDir}/components/${sectionName}/**/*.vue`;
    if (!contentPaths.includes(sectionComponentsPath)) {
      contentPaths.push(sectionComponentsPath);
    }

    // Remove duplicates
    const uniquePaths = [...new Set(contentPaths)];

    log('sectionScanner.js', 'generateContentPathsForSection', 'success', 'Content paths generated', {
      sectionName,
      pathCount: uniquePaths.length
    });

    return uniquePaths;
  } catch (error) {
    log('sectionScanner.js', 'generateContentPathsForSection', 'error', 'Error generating content paths', {
      sectionName,
      error: error.message
    });
    return [];
  }
}

/**
 * @function generateAllSectionContentPaths
 * @description Generate content paths for all sections
 * @param {string} routeConfigPath - Path to routeConfig.json
 * @param {string} baseDir - Base directory
 * @returns {Map<string, Array<string>>} Map of section to content paths
 */
export function generateAllSectionContentPaths(routeConfigPath, baseDir = 'src') {
  log('sectionScanner.js', 'generateAllSectionContentPaths', 'start', 'Generating all section content paths', {});

  try {
    const sections = scanRouteConfigForSections(routeConfigPath);
    const sectionContentPaths = new Map();

    for (const [sectionName, metadata] of sections.entries()) {
      const paths = generateContentPathsForSection(sectionName, metadata, baseDir);
      sectionContentPaths.set(sectionName, paths);
    }

    log('sectionScanner.js', 'generateAllSectionContentPaths', 'success', 'All section content paths generated', {
      sectionCount: sectionContentPaths.size
    });

    return sectionContentPaths;
  } catch (error) {
    log('sectionScanner.js', 'generateAllSectionContentPaths', 'error', 'Error generating all content paths', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * @function getSectionForComponent
 * @description Determine which section a component belongs to
 * @param {string} componentPath - Component file path
 * @param {string} routeConfigPath - Path to routeConfig.json
 * @returns {string|null} Section name or null
 */
export function getSectionForComponent(componentPath, routeConfigPath) {
  log('sectionScanner.js', 'getSectionForComponent', 'start', 'Finding section for component', { componentPath });

  try {
    const sections = scanRouteConfigForSections(routeConfigPath);

    for (const [sectionName, metadata] of sections.entries()) {
      // Check if component is in this section
      for (const comp of metadata.components) {
        const resolved = resolveComponentPath(comp);
        if (resolved === componentPath || componentPath.includes(resolved) || resolved.includes(componentPath)) {
          log('sectionScanner.js', 'getSectionForComponent', 'found', 'Section found for component', {
            componentPath,
            section: sectionName
          });
          return sectionName;
        }
      }

      // Check if component is in section directory
      if (componentPath.includes(`/components/${sectionName}/`)) {
        log('sectionScanner.js', 'getSectionForComponent', 'found-by-directory', 'Section found by directory', {
          componentPath,
          section: sectionName
        });
        return sectionName;
      }
    }

    log('sectionScanner.js', 'getSectionForComponent', 'not-found', 'No section found for component', { componentPath });
    return null;
  } catch (error) {
    log('sectionScanner.js', 'getSectionForComponent', 'error', 'Error finding section', {
      componentPath,
      error: error.message
    });
    return null;
  }
}

