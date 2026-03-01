/**
 * SectionResolver - Extract and resolve sections from routes
 *
 * Handles section identification for bundle loading and preloading.
 * All operations tracked with performance tracker.
 */

import { log } from '../common/logHandler.js';
import { logError } from '../common/errorHandler.js';
import { safelyGetNestedProperty } from '../common/objectSafety.js';
import { resolveRouteFromPath } from '../route/routeResolver.js';

/**
 * Get sections to preload for a route
 * Returns sections that should be eagerly loaded before navigation completes
 * 
 * @param {object} route - Route object
 * @param {string} userRole - Current user role
 * @returns {Array<string>} - Array of section names to preload
 */
export function getPreloadSectionsForRoute(route, userRole) {
  log('sectionResolver.js', 'getPreloadSectionsForRoute', 'start', 'Getting preload sections for route', {
    slug: route?.slug,
    userRole
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'resolvePreloadSections',
      file: 'sectionResolver.js',
      method: 'getPreloadSectionsForRoute',
      flag: 'resolve',
      purpose: `Get preload sections for ${route?.slug}`
    });
  }

  try {
    const sections = [];

    // Get explicitly declared preload sections
    if (Array.isArray(route.preLoadSections)) {
      sections.push(...route.preLoadSections);
    }

    // Remove duplicates
    const uniqueSections = [...new Set(sections)];

    log('sectionResolver.js', 'getPreloadSectionsForRoute', 'info', 'Preload sections resolved', {
      slug: route.slug,
      sectionCount: uniqueSections.length,
      sections: uniqueSections
    });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'preloadSectionsResolved',
        file: 'sectionResolver.js',
        method: 'getPreloadSectionsForRoute',
        flag: 'resolved',
        purpose: `Found ${uniqueSections.length} sections to preload`
      });
    }

    log('sectionResolver.js', 'getPreloadSectionsForRoute', 'return', 'Returning preload sections', { count: uniqueSections.length });
    return uniqueSections;
  } catch (error) {
    logError('sectionResolver.js', 'getPreloadSectionsForRoute', 'Error resolving preload sections', error);
    log('sectionResolver.js', 'getPreloadSectionsForRoute', 'return', 'Returning empty array due to error', {});
    return [];
  }
}

/**
 * Resolve a section identifier that might be a section name or route slug
 * 
 * @param {string} identifier - Section name or route slug (with/without leading slash)
 * @param {string} userRole - Current user role
 * @returns {string|null} - Resolved section name suitable for loaders
 */
export function resolveSectionIdentifier(identifier, userRole = 'guest') {
  log('sectionResolver.js', 'resolveSectionIdentifier', 'start', 'Resolving section identifier', {
    identifier,
    userRole
  });

  if (typeof identifier !== 'string' || identifier.trim().length === 0) {
    log('sectionResolver.js', 'resolveSectionIdentifier', 'warn', 'Invalid section identifier provided', {
      identifier
    });
    return null;
  }

  const trimmed = identifier.trim();

  // Treat identifier as possible slug variants
  const maybeSlugs = [];
  if (trimmed.startsWith('/')) {
    maybeSlugs.push(trimmed);
  } else {
    maybeSlugs.push(`/${trimmed}`);
  }

  for (const potentialSlug of maybeSlugs) {
    const matchedRoute = resolveRouteFromPath(potentialSlug);
    if (matchedRoute) {
      const resolvedSection = resolveRoleSectionVariant(matchedRoute.section, userRole);
      if (resolvedSection) {
        log('sectionResolver.js', 'resolveSectionIdentifier', 'info', 'Identifier resolved via route slug', {
          identifier,
          slug: potentialSlug,
          section: resolvedSection
        });
        return resolvedSection;
      }
    }
  }

  log('sectionResolver.js', 'resolveSectionIdentifier', 'info', 'Identifier treated as direct section name', {
    identifier
  });
  return trimmed;
}

/**
 * Get all sections used by a route
 * Includes the route's own section plus any preload sections
 * 
 * @param {object} route - Route object
 * @param {string} userRole - Current user role
 * @returns {Array<string>} - Array of all section names
 */
export function getAllRouteSectionsForRoute(route, userRole) {
  log('sectionResolver.js', 'getAllRouteSectionsForRoute', 'start', 'Getting all sections for route', {
    slug: route?.slug,
    userRole
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'resolveAllRouteSections',
      file: 'sectionResolver.js',
      method: 'getAllRouteSectionsForRoute',
      flag: 'resolve',
      purpose: `Get all sections for ${route?.slug}`
    });
  }

  try {
    const sections = [];

    // Add route's own section
    const routeSection = resolveRoleSectionVariant(route.section, userRole);
    if (routeSection) {
      sections.push(routeSection);
    }

    // Add preload sections
    const preloadSections = getPreloadSectionsForRoute(route, userRole);
    sections.push(...preloadSections);

    // Remove duplicates
    const uniqueSections = [...new Set(sections)];

    log('sectionResolver.js', 'getAllRouteSectionsForRoute', 'info', 'All route sections resolved', {
      slug: route.slug,
      sectionCount: uniqueSections.length,
      sections: uniqueSections
    });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'allRouteSectionsResolved',
        file: 'sectionResolver.js',
        method: 'getAllRouteSectionsForRoute',
        flag: 'resolved',
        purpose: `Found ${uniqueSections.length} total sections`
      });
    }

    log('sectionResolver.js', 'getAllRouteSectionsForRoute', 'return', 'Returning all sections', { count: uniqueSections.length });
    return uniqueSections;
  } catch (error) {
    logError('sectionResolver.js', 'getAllRouteSectionsForRoute', 'Error resolving all route sections', error);
    log('sectionResolver.js', 'getAllRouteSectionsForRoute', 'return', 'Returning empty array due to error', {});
    return [];
  }
}

/**
 * Normalize section configuration
 * Handles both string and object section definitions
 * 
 * @param {string|object} sectionConfig - Section configuration (string or object)
 * @returns {object} - Normalized section configuration
 */
export function normalizeSectionConfiguration(sectionConfig) {
  log('sectionResolver.js', 'normalizeSectionConfiguration', 'start', 'Normalizing section configuration', {
    configType: typeof sectionConfig
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'normalizeSectionConfig',
      file: 'sectionResolver.js',
      method: 'normalizeSectionConfiguration',
      flag: 'normalize',
      purpose: 'Normalize section configuration'
    });
  }

  // Handle string (simple section name)
  if (typeof sectionConfig === 'string') {
    const normalized = {
      type: 'simple',
      value: sectionConfig,
      roleBased: false
    };

    log('sectionResolver.js', 'normalizeSectionConfiguration', 'debug', 'Section config normalized as simple', normalized);
    log('sectionResolver.js', 'normalizeSectionConfiguration', 'return', 'Returning simple config', normalized);
    return normalized;
  }

  // Handle object (role-based sections)
  if (typeof sectionConfig === 'object' && sectionConfig !== null) {
    const normalized = {
      type: 'role-based',
      value: sectionConfig,
      roleBased: true,
      roles: Object.keys(sectionConfig)
    };

    log('sectionResolver.js', 'normalizeSectionConfiguration', 'debug', 'Section config normalized as role-based', normalized);
    log('sectionResolver.js', 'normalizeSectionConfiguration', 'return', 'Returning role-based config', normalized);
    return normalized;
  }

  // Invalid configuration
  log('sectionResolver.js', 'normalizeSectionConfiguration', 'warn', 'Invalid section configuration', {
    configType: typeof sectionConfig
  });

  const invalid = {
    type: 'invalid',
    value: null,
    roleBased: false
  };

  log('sectionResolver.js', 'normalizeSectionConfiguration', 'return', 'Returning invalid config', invalid);
  return invalid;
}

/**
 * Resolve role-specific section variant
 * Returns the appropriate section name based on user role
 * 
 * @param {string|object} sectionConfig - Section configuration
 * @param {string} userRole - Current user role
 * @param {string} fallback - Fallback section if role not found
 * @returns {string|null} - Resolved section name
 */
export function resolveRoleSectionVariant(sectionConfig, userRole, fallback = 'default') {
  log('sectionResolver.js', 'resolveRoleSectionVariant', 'start', 'Resolving role-specific section variant', {
    userRole,
    configType: typeof sectionConfig
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'resolveRoleSection',
      file: 'sectionResolver.js',
      method: 'resolveRoleSectionVariant',
      flag: 'resolve',
      purpose: `Resolve section for role: ${userRole}`
    });
  }

  // Handle simple string section
  if (typeof sectionConfig === 'string') {
    log('sectionResolver.js', 'resolveRoleSectionVariant', 'info', 'Simple section resolved', {
      section: sectionConfig
    });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'roleSectionResolved',
        file: 'sectionResolver.js',
        method: 'resolveRoleSectionVariant',
        flag: 'simple',
        purpose: `Simple section: ${sectionConfig}`
      });
    }

    log('sectionResolver.js', 'resolveRoleSectionVariant', 'return', 'Returning simple section', { section: sectionConfig });
    return sectionConfig;
  }

  // Handle role-based section object
  if (typeof sectionConfig === 'object' && sectionConfig !== null) {
    // Try to get role-specific section
    const roleSectionName = safelyGetNestedProperty(sectionConfig, userRole);

    if (roleSectionName) {
      log('sectionResolver.js', 'resolveRoleSectionVariant', 'info', 'Role-specific section resolved', {
        userRole,
        section: roleSectionName
      });

      if (window.performanceTracker) {
        window.performanceTracker.step({
          step: 'roleSectionResolved',
          file: 'sectionResolver.js',
          method: 'resolveRoleSectionVariant',
          flag: 'role-specific',
          purpose: `Role section for ${userRole}: ${roleSectionName}`
        });
      }

      log('sectionResolver.js', 'resolveRoleSectionVariant', 'return', 'Returning role-specific section', { section: roleSectionName });
      return roleSectionName;
    }

    // Try fallback
    const fallbackSectionName = safelyGetNestedProperty(sectionConfig, fallback);

    if (fallbackSectionName) {
      log('sectionResolver.js', 'resolveRoleSectionVariant', 'warn', 'Using fallback section', {
        userRole,
        fallback,
        section: fallbackSectionName
      });

      log('sectionResolver.js', 'resolveRoleSectionVariant', 'return', 'Returning fallback section', { section: fallbackSectionName });
      return fallbackSectionName;
    }

    // Use first available section as last resort
    const firstSectionName = Object.values(sectionConfig)[0];

    if (firstSectionName) {
      log('sectionResolver.js', 'resolveRoleSectionVariant', 'warn', 'Using first available section as fallback', {
        userRole,
        section: firstSectionName
      });

      log('sectionResolver.js', 'resolveRoleSectionVariant', 'return', 'Returning first available section', { section: firstSectionName });
      return firstSectionName;
    }
  }

  // No section could be resolved
  log('sectionResolver.js', 'resolveRoleSectionVariant', 'warn', 'Could not resolve section', {
    userRole,
    configType: typeof sectionConfig
  });

  log('sectionResolver.js', 'resolveRoleSectionVariant', 'return', 'Returning null - no section resolved', {});
  return null;
}

/**
 * Check if a section is role-based
 * 
 * @param {string|object} sectionConfig - Section configuration
 * @returns {boolean} - True if section has role-based variants
 */
export function isSectionRoleBased(sectionConfig) {
  const normalized = normalizeSectionConfiguration(sectionConfig);
  log('sectionResolver.js', 'isSectionRoleBased', 'return', 'Returning role-based check', { isRoleBased: normalized.roleBased });
  return normalized.roleBased;
}

/**
 * Get all section variants from role-based config
 * 
 * @param {object} sectionConfig - Role-based section configuration
 * @returns {Array<string>} - Array of unique section names
 */
export function getAllSectionVariants(sectionConfig) {
  log('sectionResolver.js', 'getAllSectionVariants', 'start', 'Getting all section variants', {});

  if (typeof sectionConfig === 'string') {
    log('sectionResolver.js', 'getAllSectionVariants', 'return', 'Returning single variant', { variant: sectionConfig });
    return [sectionConfig];
  }

  if (typeof sectionConfig === 'object' && sectionConfig !== null) {
    const variants = Object.values(sectionConfig);
    const uniqueVariants = [...new Set(variants)];

    log('sectionResolver.js', 'getAllSectionVariants', 'info', 'Section variants extracted', {
      variantCount: uniqueVariants.length,
      variants: uniqueVariants
    });

    log('sectionResolver.js', 'getAllSectionVariants', 'return', 'Returning variants', { count: uniqueVariants.length });
    return uniqueVariants;
  }

  log('sectionResolver.js', 'getAllSectionVariants', 'return', 'Returning empty array', {});
  return [];
}
