/**
 * JSON Config Validator
 * 
 * Validates JSON configuration files for integrity and required fields.
 * Ensures configs are well-formed before they're used by the application.
 */

import { log } from '../../infrastructure/logging/logHandler.js';
import { logError } from '../../infrastructure/errors/errorHandler.js';
import sharedAssetPreloads from '../../router/sharedAssetPreloads.json';
import assetMapData from '../../config/assetMap.json';
import {
  validateAssetPreloadEntryShape,
  validateRouteAssetPreloadRefs,
  validateRouteAssetPreloadFlags,
  validateSharedCatalogAssetPreloadFlags,
} from '../assets/validateRouteAssetPreloadFlags.js';
import { resolveRouteAssetPreloads } from '../routing/resolveRouteAssetPreloads.js';
import { isValidRouteEnvAccess } from '../routing/routeEnvAccess.js';
import { findDuplicateRoutePathClaims } from '../routing/routeAliases.js';

const PRELOAD_RESOLVE_ROLE = 'guest';
const PRELOAD_SECTION_FALLBACK_ROLE = 'default';

/**
 * Collect concrete section names declared on routes (including role variants).
 *
 * @param {Array<object>} routes
 * @returns {Set<string>}
 */
export function collectKnownSectionNames(routes) {
  const known = new Set();

  for (const route of routes) {
    if (!route?.section) {
      continue;
    }

    if (typeof route.section === 'string') {
      const name = route.section.trim();
      if (name) {
        known.add(name);
      }
      continue;
    }

    if (typeof route.section === 'object' && route.section !== null) {
      for (const value of Object.values(route.section)) {
        if (typeof value === 'string' && value.trim()) {
          known.add(value.trim());
        }
      }
    }
  }

  return known;
}

/**
 * Index routes by slug path (with and without leading slash).
 *
 * @param {Array<object>} routes
 * @returns {Map<string, object>}
 */
export function buildRouteSlugIndex(routes) {
  const index = new Map();

  for (const route of routes) {
    if (typeof route.slug !== 'string' || !route.slug) {
      continue;
    }

    index.set(route.slug, route);

    const bareSlug = route.slug.replace(/^\//, '');
    if (bareSlug) {
      index.set(bareSlug, route);
    }
  }

  return index;
}

function resolveRoleSectionVariantStatic(sectionConfig, userRole = PRELOAD_RESOLVE_ROLE) {
  if (typeof sectionConfig === 'string') {
    const trimmed = sectionConfig.trim();
    return trimmed || null;
  }

  if (typeof sectionConfig === 'object' && sectionConfig !== null) {
    const resolved =
      sectionConfig[userRole] ??
      sectionConfig[PRELOAD_SECTION_FALLBACK_ROLE] ??
      sectionConfig.guest;

    return typeof resolved === 'string' && resolved.trim() ? resolved.trim() : null;
  }

  return null;
}

/**
 * Resolve a preLoadSections identifier to a known section name (slug alias or direct name).
 *
 * @param {string} identifier
 * @param {Array<object>} routes
 * @param {Set<string>} [knownSections]
 * @returns {string|null}
 */
export function resolvePreloadSectionIdentifier(identifier, routes, knownSections = null) {
  if (typeof identifier !== 'string') {
    return null;
  }

  const trimmed = identifier.trim();
  if (!trimmed) {
    return null;
  }

  const sections = knownSections ?? collectKnownSectionNames(routes);
  const slugIndex = buildRouteSlugIndex(routes);
  const slugCandidates = trimmed.startsWith('/')
    ? [trimmed, trimmed.replace(/^\//, '')]
    : [trimmed, `/${trimmed}`];

  for (const slugKey of slugCandidates) {
    const matchedRoute = slugIndex.get(slugKey);

    if (matchedRoute?.section) {
      const resolved = resolveRoleSectionVariantStatic(matchedRoute.section);
      if (resolved && sections.has(resolved)) {
        return resolved;
      }
    }
  }

  return sections.has(trimmed) ? trimmed : null;
}

/**
 * Flatten preLoadSections config entries for validation.
 *
 * @param {Array<string>|object|null|undefined} preLoadSections
 * @returns {Array<unknown>}
 */
export function collectPreloadSectionIdentifiers(preLoadSections) {
  if (!preLoadSections) {
    return [];
  }

  if (Array.isArray(preLoadSections)) {
    return preLoadSections;
  }

  if (typeof preLoadSections === 'object') {
    const identifiers = [];

    for (const sections of Object.values(preLoadSections)) {
      if (Array.isArray(sections)) {
        identifiers.push(...sections);
      }
    }

    return identifiers;
  }

  return [];
}

function validatePreLoadSectionEntries(routes, errors) {
  const knownSections = collectKnownSectionNames(routes);

  routes.forEach((route, index) => {
    if (!route.preLoadSections) {
      return;
    }

    const identifiers = collectPreloadSectionIdentifiers(route.preLoadSections);
    const routeSlug = route.slug ?? `index ${index}`;

    for (const rawIdentifier of identifiers) {
      if (typeof rawIdentifier !== 'string') {
        errors.push({
          type: 'INVALID_FIELD_TYPE',
          routeIndex: index,
          field: 'preLoadSections',
          message: `Route at index ${index} (${routeSlug}) has non-string preLoadSections entry`,
          expected: 'string',
          received: typeof rawIdentifier
        });
        continue;
      }

      if (rawIdentifier.trim().length === 0) {
        errors.push({
          type: 'INVALID_PRELOAD_SECTION',
          routeIndex: index,
          field: 'preLoadSections',
          message: `Route at index ${index} (${routeSlug}) has empty preLoadSections entry`,
          identifier: rawIdentifier
        });
        continue;
      }

      const resolved = resolvePreloadSectionIdentifier(rawIdentifier, routes, knownSections);
      if (!resolved) {
        errors.push({
          type: 'UNKNOWN_PRELOAD_SECTION',
          routeIndex: index,
          field: 'preLoadSections',
          message: `Route at index ${index} (${routeSlug}) has unknown preLoadSections entry "${rawIdentifier}"`,
          identifier: rawIdentifier
        });
      }
    }
  });
}

/**
 * Validate route configuration schema
 * Ensures all required fields are present and correctly typed
 * 
 * @param {Array<object>} routes - Array of route objects
 * @returns {object} - Validation result { valid: boolean, errors: Array, warnings: Array }
 */
export function validateRouteConfig(routes) {
  log('jsonConfigValidator.js', 'validateRouteConfig', 'start', 'Validating route configuration', {
    routeCount: routes?.length
  });

  if (typeof window !== 'undefined' && window.performanceTracker) {
    window.performanceTracker.step({
      step: 'validateRouteConfig_start',
      file: 'jsonConfigValidator.js',
      method: 'validateRouteConfig',
      flag: 'validation',
      purpose: 'Validate route configuration schema'
    });
  }

  const errors = [];
  const warnings = [];

  // Check if routes is an array
  if (!Array.isArray(routes)) {
    errors.push({
      type: 'INVALID_TYPE',
      message: 'Route config must be an array',
      value: typeof routes
    });
    
    log('jsonConfigValidator.js', 'validateRouteConfig', 'error', 'Route config is not an array', {});
    log('jsonConfigValidator.js', 'validateRouteConfig', 'return', 'Returning validation failure', { valid: false, errorCount: 1 });
    return { valid: false, errors, warnings };
  }

  // Validate each route
  routes.forEach((route, index) => {
    // Required field: slug
    if (!route.slug || typeof route.slug !== 'string') {
      errors.push({
        type: 'MISSING_REQUIRED_FIELD',
        routeIndex: index,
        field: 'slug',
        message: `Route at index ${index} missing required field 'slug' or slug is not a string`,
        route: route
      });
    }

    // Required field: componentPath (unless it's a redirect)
    if (!route.redirect && (!route.componentPath || typeof route.componentPath !== 'string')) {
      // Check if it has customComponentPath
      if (!route.customComponentPath) {
        errors.push({
          type: 'MISSING_REQUIRED_FIELD',
          routeIndex: index,
          field: 'componentPath',
          message: `Route at index ${index} (${route.slug}) missing 'componentPath' or 'customComponentPath'`,
          route: route
        });
      }
    }

    // Required field: section (unless it's a redirect or catch-all)
    if (!route.redirect && !route.slug?.includes('pathMatch') && !route.section) {
      errors.push({
        type: 'MISSING_REQUIRED_FIELD',
        routeIndex: index,
        field: 'section',
        message: `Route at index ${index} (${route.slug}) missing required field 'section'`,
        route: route
      });
    }

    // Validate redirect routes
    if (route.redirect) {
      if (typeof route.redirect !== 'string') {
        errors.push({
          type: 'INVALID_FIELD_TYPE',
          routeIndex: index,
          field: 'redirect',
          message: `Route at index ${index} (${route.slug}) has invalid redirect type`,
          expected: 'string',
          received: typeof route.redirect
        });
      }
    }

    // Validate supportedRoles if present
    if (route.supportedRoles && !Array.isArray(route.supportedRoles)) {
      errors.push({
        type: 'INVALID_FIELD_TYPE',
        routeIndex: index,
        field: 'supportedRoles',
        message: `Route at index ${index} (${route.slug}) has invalid supportedRoles type`,
        expected: 'array',
        received: typeof route.supportedRoles
      });
    } else if (!route.redirect || route.componentPath || route.customComponentPath) {
      // B4: require explicit supportedRoles on navigable routes (redirect-only catch-alls exempt)
      if (!route.supportedRoles) {
        errors.push({
          type: 'MISSING_FIELD',
          routeIndex: index,
          field: 'supportedRoles',
          message: `Route at index ${index} (${route.slug}) must define supportedRoles (use ["all"] for unrestricted access)`,
          route: route
        });
      } else if (route.supportedRoles.length === 0) {
        errors.push({
          type: 'INVALID_FIELD_VALUE',
          routeIndex: index,
          field: 'supportedRoles',
          message: `Route at index ${index} (${route.slug}) has empty supportedRoles — use ["all"] for unrestricted access`,
          expected: '["all"] or role list e.g. ["creator"]',
          received: route.supportedRoles
        });
      } else if (route.supportedRoles.includes('any')) {
        errors.push({
          type: 'INVALID_FIELD_VALUE',
          routeIndex: index,
          field: 'supportedRoles',
          message: `Route at index ${index} (${route.slug}) uses deprecated "any" — use "all" instead`,
          expected: '"all"',
          received: 'any'
        });
      }
    }

    // Validate preLoadSections if present (flat string[] or role-keyed object)
    if (route.preLoadSections) {
      if (Array.isArray(route.preLoadSections)) {
        // valid flat array
      } else if (typeof route.preLoadSections === 'object' && route.preLoadSections !== null) {
        for (const [role, sections] of Object.entries(route.preLoadSections)) {
          if (!Array.isArray(sections)) {
            errors.push({
              type: 'INVALID_FIELD_TYPE',
              routeIndex: index,
              field: 'preLoadSections',
              message: `Route at index ${index} (${route.slug}) has invalid preLoadSections.${role} type`,
              expected: 'array',
              received: typeof sections
            });
          }
        }
      } else {
        errors.push({
          type: 'INVALID_FIELD_TYPE',
          routeIndex: index,
          field: 'preLoadSections',
          message: `Route at index ${index} (${route.slug}) has invalid preLoadSections type`,
          expected: 'array or role-keyed object',
          received: typeof route.preLoadSections
        });
      }
    }

    if (route.envAccess !== undefined) {
      if (typeof route.envAccess !== 'string' || !isValidRouteEnvAccess(route.envAccess)) {
        errors.push({
          type: 'INVALID_FIELD_VALUE',
          routeIndex: index,
          field: 'envAccess',
          message: `Route at index ${index} (${route.slug}) has invalid envAccess value`,
          expected: '"all" or "development"',
          received: route.envAccess
        });
      }
    }

    // Validate boolean fields
    ['requiresAuth', 'enabled', 'inheritConfigFromParent'].forEach(field => {
      if (route[field] !== undefined && typeof route[field] !== 'boolean') {
        errors.push({
          type: 'INVALID_FIELD_TYPE',
          routeIndex: index,
          field,
          message: `Route at index ${index} (${route.slug}) has invalid ${field} type`,
          expected: 'boolean',
          received: typeof route[field]
        });
      }
    });

    // Validate dependencies structure if present
    if (route.dependencies) {
      if (typeof route.dependencies !== 'object') {
        errors.push({
          type: 'INVALID_FIELD_TYPE',
          routeIndex: index,
          field: 'dependencies',
          message: `Route at index ${index} (${route.slug}) has invalid dependencies type`,
          expected: 'object',
          received: typeof route.dependencies
        });
      }
    }

    // Optional field: preloadExclude (boolean)
    if (route.preloadExclude !== undefined && typeof route.preloadExclude !== 'boolean') {
      errors.push({
        type: 'INVALID_FIELD_TYPE',
        routeIndex: index,
        field: 'preloadExclude',
        message: `Route at index ${index} (${route.slug}) has invalid preloadExclude type`,
        expected: 'boolean',
        received: typeof route.preloadExclude
      });
    }

    // C-09: inline assetPreload shape + assetPreloadRef keys (expanded flag checks run in routeConfigLoader)
    if (route.assetPreloadRef) {
      for (const message of validateRouteAssetPreloadRefs(route, sharedAssetPreloads)) {
        errors.push({
          type: 'INVALID_ASSET_PRELOAD_REF',
          routeIndex: index,
          field: 'assetPreloadRef',
          message,
          route,
        });
      }
    }

    if (Array.isArray(route.assetPreload)) {
      route.assetPreload.forEach((entry, entryIndex) => {
        for (const message of validateAssetPreloadEntryShape(entry, route.slug, entryIndex)) {
          errors.push({
            type: 'INVALID_ASSET_PRELOAD_ENTRY',
            routeIndex: index,
            field: 'assetPreload',
            message,
            route,
          });
        }
      });
    } else if (route.assetPreload !== undefined) {
      errors.push({
        type: 'INVALID_FIELD_TYPE',
        routeIndex: index,
        field: 'assetPreload',
        message: `Route at index ${index} (${route.slug}) has invalid assetPreload type`,
        expected: 'array',
        received: typeof route.assetPreload,
      });
    }

    if (route.aliases !== undefined) {
      if (!Array.isArray(route.aliases) || route.aliases.some((entry) => typeof entry !== 'string')) {
        errors.push({
          type: 'INVALID_FIELD_TYPE',
          routeIndex: index,
          field: 'aliases',
          message: `Route at index ${index} (${route.slug}) has invalid aliases type`,
          expected: 'string[]',
          received: typeof route.aliases
        });
      }
    }

    if (route.redirectFrom !== undefined) {
      const redirectFromValid =
        typeof route.redirectFrom === 'string' ||
        (Array.isArray(route.redirectFrom) &&
          route.redirectFrom.every((entry) => typeof entry === 'string'));

      if (!redirectFromValid) {
        errors.push({
          type: 'INVALID_FIELD_TYPE',
          routeIndex: index,
          field: 'redirectFrom',
          message: `Route at index ${index} (${route.slug}) has invalid redirectFrom type`,
          expected: 'string | string[]',
          received: typeof route.redirectFrom
        });
      }
    }

    if (route.adminOnly !== undefined && typeof route.adminOnly !== 'boolean') {
      errors.push({
        type: 'INVALID_FIELD_TYPE',
        routeIndex: index,
        field: 'adminOnly',
        message: `Route at index ${index} (${route.slug}) has invalid adminOnly type`,
        expected: 'boolean',
        received: typeof route.adminOnly
      });
    }
  });

  validatePreLoadSectionEntries(routes, errors);

  // Check for duplicate slugs
  const slugs = routes.map(r => r.slug).filter(Boolean);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
  
  if (duplicates.length > 0) {
    errors.push({
      type: 'DUPLICATE_SLUGS',
      message: 'Found duplicate route slugs',
      duplicates: [...new Set(duplicates)]
    });
  }

  for (const duplicate of findDuplicateRoutePathClaims(routes)) {
    errors.push({
      type: 'DUPLICATE_ROUTE_PATH',
      message: `Route path "${duplicate.path}" is claimed by ${duplicate.first.slug} (${duplicate.first.kind}) and ${duplicate.second.slug} (${duplicate.second.kind})`,
      path: duplicate.path,
      first: duplicate.first,
      second: duplicate.second,
    });
  }

  const expandedRoutes = resolveRouteAssetPreloads(routes, sharedAssetPreloads);
  const preloadFlagValidation = validateRouteAssetPreloadFlags(
    expandedRoutes,
    assetMapData,
    sharedAssetPreloads,
  );

  for (const message of preloadFlagValidation.errors) {
    errors.push({
      type: 'INVALID_ASSET_PRELOAD_FLAG',
      message,
    });
  }

  for (const message of validateSharedCatalogAssetPreloadFlags(sharedAssetPreloads, assetMapData)) {
    errors.push({
      type: 'INVALID_SHARED_CATALOG_FLAG',
      message,
    });
  }

  const valid = errors.length === 0;

  if (typeof window !== 'undefined' && window.performanceTracker) {
    window.performanceTracker.step({
      step: 'validateRouteConfig_complete',
      file: 'jsonConfigValidator.js',
      method: 'validateRouteConfig',
      flag: 'validation',
      purpose: `Validation ${valid ? 'passed' : 'failed'}: ${errors.length} errors, ${warnings.length} warnings`
    });
  }

  log('jsonConfigValidator.js', 'validateRouteConfig', valid ? 'info' : 'error', 'Route config validation complete', {
    valid,
    errorCount: errors.length,
    warningCount: warnings.length
  });

  // Log errors and warnings
  if (errors.length > 0) {
    log('jsonConfigValidator.js', 'validateRouteConfig', 'error', 'Validation errors found', { errors });
  }
  
  if (warnings.length > 0) {
    log('jsonConfigValidator.js', 'validateRouteConfig', 'warn', 'Validation warnings found', { warnings });
  }

  log('jsonConfigValidator.js', 'validateRouteConfig', 'return', 'Returning validation result', {
    valid,
    errorCount: errors.length,
    warningCount: warnings.length
  });

  return { valid, errors, warnings };
}

/**
 * Validate build configuration
 * Ensures build config has required fields
 * 
 * @param {object} buildConfig - Build configuration object
 * @returns {object} - Validation result { valid: boolean, errors: Array, warnings: Array }
 */
export function validateBuildConfig(buildConfig) {
  log('jsonConfigValidator.js', 'validateBuildConfig', 'start', 'Validating build configuration', {});

  const errors = [];
  const warnings = [];

  if (!buildConfig || typeof buildConfig !== 'object') {
    errors.push({
      type: 'INVALID_CONFIG',
      message: 'Build config must be an object',
      received: typeof buildConfig
    });
    
    log('jsonConfigValidator.js', 'validateBuildConfig', 'return', 'Build config invalid', { valid: false });
    return { valid: false, errors, warnings };
  }

  // Check required fields
  const requiredFields = ['preLoadSections'];
  
  requiredFields.forEach(field => {
    if (!buildConfig[field]) {
      warnings.push({
        type: 'MISSING_FIELD',
        field,
        message: `Build config missing recommended field: ${field}`
      });
    }
  });

  // Validate preLoadSections is an array
  if (buildConfig.preLoadSections && !Array.isArray(buildConfig.preLoadSections)) {
    errors.push({
      type: 'INVALID_FIELD_TYPE',
      field: 'preLoadSections',
      message: 'preLoadSections must be an array',
      expected: 'array',
      received: typeof buildConfig.preLoadSections
    });
  }

  const valid = errors.length === 0;

  log('jsonConfigValidator.js', 'validateBuildConfig', 'return', 'Returning build config validation', {
    valid,
    errorCount: errors.length,
    warningCount: warnings.length
  });

  return { valid, errors, warnings };
}

/**
 * Validate JSON structure (generic)
 * Checks if JSON is well-formed and parseable
 * 
 * @param {string} jsonString - JSON string to validate
 * @param {string} configName - Name of config for logging
 * @returns {object} - Validation result { valid: boolean, parsed: any, error: string|null }
 */
export function validateJsonStructure(jsonString, configName = 'config') {
  log('jsonConfigValidator.js', 'validateJsonStructure', 'start', `Validating JSON structure for ${configName}`, {});

  try {
    const parsed = JSON.parse(jsonString);
    
    log('jsonConfigValidator.js', 'validateJsonStructure', 'info', `${configName} JSON is valid`, {});
    log('jsonConfigValidator.js', 'validateJsonStructure', 'return', 'Returning valid JSON', { valid: true });
    
    return {
      valid: true,
      parsed,
      error: null
    };
  } catch (error) {
    logError('jsonConfigValidator.js', 'validateJsonStructure', `Invalid JSON in ${configName}`, error);
    
    log('jsonConfigValidator.js', 'validateJsonStructure', 'return', 'Returning invalid JSON', {
      valid: false,
      error: error.message
    });
    
    return {
      valid: false,
      parsed: null,
      error: error.message
    };
  }
}

/**
 * Validate all config files
 * Master validation function that checks all critical configs
 * 
 * @param {object} configs - Object with config data { routes, build }
 * @returns {object} - Validation result { valid: boolean, results: object }
 */
export function validateAllConfigs(configs) {
  log('jsonConfigValidator.js', 'validateAllConfigs', 'start', 'Validating all configuration files', {});

  if (typeof window !== 'undefined' && window.performanceTracker) {
    window.performanceTracker.step({
      step: 'validateAllConfigs_start',
      file: 'jsonConfigValidator.js',
      method: 'validateAllConfigs',
      flag: 'validation',
      purpose: 'Validate all config files'
    });
  }

  const results = {};
  let overallValid = true;

  // Validate route config
  if (configs.routes) {
    results.routes = validateRouteConfig(configs.routes);
    if (!results.routes.valid) {
      overallValid = false;
    }
  } else {
    results.routes = {
      valid: false,
      errors: [{ type: 'MISSING_CONFIG', message: 'Route config not provided' }],
      warnings: []
    };
    overallValid = false;
  }

  // Validate build config
  if (configs.build) {
    results.build = validateBuildConfig(configs.build);
    if (!results.build.valid) {
      overallValid = false;
    }
  } else {
    results.build = {
      valid: false,
      errors: [{ type: 'MISSING_CONFIG', message: 'Build config not provided' }],
      warnings: []
    };
    overallValid = false;
  }

  if (typeof window !== 'undefined' && window.performanceTracker) {
    window.performanceTracker.step({
      step: 'validateAllConfigs_complete',
      file: 'jsonConfigValidator.js',
      method: 'validateAllConfigs',
      flag: 'validation',
      purpose: `Overall validation: ${overallValid ? 'PASSED' : 'FAILED'}`
    });
  }

  log('jsonConfigValidator.js', 'validateAllConfigs', overallValid ? 'info' : 'error', 'All config validation complete', {
    overallValid,
    routesValid: results.routes?.valid,
    buildValid: results.build?.valid
  });

  log('jsonConfigValidator.js', 'validateAllConfigs', 'return', 'Returning all config validation results', { overallValid });

  return {
    valid: overallValid,
    results
  };
}

