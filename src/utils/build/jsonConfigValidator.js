/**
 * JSON Config Validator
 * 
 * Validates JSON configuration files for integrity and required fields.
 * Ensures configs are well-formed before they're used by the application.
 */

import { log } from '../common/logHandler.js';
import { logError } from '../common/errorHandler.js';

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

  if (window.performanceTracker) {
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
      warnings.push({
        type: 'MISSING_RECOMMENDED_FIELD',
        routeIndex: index,
        field: 'section',
        message: `Route at index ${index} (${route.slug}) missing 'section' field`,
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
    }

    // Validate preLoadSections if present
    if (route.preLoadSections && !Array.isArray(route.preLoadSections)) {
      errors.push({
        type: 'INVALID_FIELD_TYPE',
        routeIndex: index,
        field: 'preLoadSections',
        message: `Route at index ${index} (${route.slug}) has invalid preLoadSections type`,
        expected: 'array',
        received: typeof route.preLoadSections
      });
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
  });

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

  const valid = errors.length === 0;

  if (window.performanceTracker) {
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

  if (window.performanceTracker) {
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

  if (window.performanceTracker) {
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

