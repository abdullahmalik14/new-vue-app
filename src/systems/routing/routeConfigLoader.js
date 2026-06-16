/**
 * RouteConfigLoader - Load and cache route configuration
 *
 * Handles loading routeConfig.json with caching and validation.
 * Uses global JSON config loader utility.
 * Uses performance tracker to track all operations.
 */

import routeConfigData from "../../router/routeConfig.json";
import sharedAssetPreloads from "../../config/sharedAssetPreloads.json";
import assetMapData from "../../config/assetMap.json";
import {
  loadJsonConfigFromImport,
  clearConfigCache,
} from "../../utils/common/jsonConfigLoader.js";
import { log } from "../../infrastructure/logging/logHandler.js";
import { trackStep } from "../../infrastructure/logging/performanceTrackerAccess.js";
import { logError } from "../../infrastructure/errors/errorHandler.js";
import { validateRouteConfig } from "../build/jsonConfigValidator.js";
import { resolveRouteAssetPreloads } from "../assets/resolveRouteAssetPreloads.js";
import { validateRouteComponentPathsWithResolver } from "./routeComponentPathValidator.js";
import { findComponentLoader } from "./routeComponentLoader.js";
import { validateRouteAssetPreloadFlags } from "../assets/validateRouteAssetPreloadFlags.js";

// Performance tracking via trackStep() from performanceTrackerAccess.js

/**
 * Load route configuration from JSON file with validation
 * Performs deep validation of route structure
 * Uses global JSON config loader utility
 *
 * @returns {Array} - Array of validated route objects
 */
export function loadRouteConfigurationFromFile() {
  log(
    "routeConfigLoader.js",
    "loadRouteConfigurationFromFile",
    "start",
    "Loading route configuration",
    {},
  );
  trackStep({
    step: "loadRouteConfig_start",
    file: "routeConfigLoader.js",
    method: "loadRouteConfigurationFromFile",
    flag: "io",
    purpose: "Load route configuration from JSON file",
  });

  try {
    // Load route config using global JSON config loader
    // Static Vite import — config is fixed for the page session (L17: no TTL expiry)
    const result = loadJsonConfigFromImport(routeConfigData, {
      configName: "route_config",
      cacheTTL: 0,
      skipValidation: false,
      validator: validateRouteConfig,
    });

    if (!result.success) {
      log(
        "routeConfigLoader.js",
        "loadRouteConfigurationFromFile",
        "error",
        "Failed to load route configuration",
        {
          error: result.error,
        },
      );
      throw new Error(result.error || "Failed to load route configuration");
    }

    const loadedRouteConfig = resolveRouteAssetPreloads(
      result.data,
      sharedAssetPreloads,
    );

    // Validate it's an array
    if (!Array.isArray(loadedRouteConfig)) {
      log(
        "routeConfigLoader.js",
        "loadRouteConfigurationFromFile",
        "error",
        "Route configuration is not an array",
        {
          type: typeof loadedRouteConfig,
        },
      );
      throw new Error("Route configuration is not an array");
    }

    if (import.meta.env.DEV) {
      const componentValidation = validateRouteComponentPathsWithResolver(
        loadedRouteConfig,
        findComponentLoader,
      );

      if (!componentValidation.valid) {
        const details = componentValidation.errors
          .map((error) => error.message)
          .join("\n  - ");
        throw new Error(
          `Route componentPath validation failed:\n  - ${details}`,
        );
      }
    }

    const flagValidation = validateRouteAssetPreloadFlags(
      loadedRouteConfig,
      assetMapData,
      sharedAssetPreloads,
    );

    if (!flagValidation.valid) {
      throw new Error(
        `Asset preload validation failed:\n  - ${flagValidation.errors.join("\n  - ")}`,
      );
    }

    log(
      "routeConfigLoader.js",
      "loadRouteConfigurationFromFile",
      "success",
      "Route configuration loaded",
      {
        routeCount: loadedRouteConfig.length,
      },
    );
    trackStep({
      step: "loadRouteConfig_complete",
      file: "routeConfigLoader.js",
      method: "loadRouteConfigurationFromFile",
      flag: "success",
      purpose: `Loaded ${loadedRouteConfig.length} routes`,
    });

    log(
      "routeConfigLoader.js",
      "loadRouteConfigurationFromFile",
      "return",
      "Returning loaded route configuration",
      { routeCount: loadedRouteConfig.length },
    );
    return loadedRouteConfig;
  } catch (error) {
    logError(
      "routeConfigLoader.js",
      "loadRouteConfigurationFromFile",
      "Failed to load route configuration",
      error,
    );
    trackStep({
      step: "loadRouteConfig_error",
      file: "routeConfigLoader.js",
      method: "loadRouteConfigurationFromFile",
      flag: "error",
      purpose: "Route config load failed",
    });

    log(
      "routeConfigLoader.js",
      "loadRouteConfigurationFromFile",
      "return",
      "Returning empty array due to error",
      { error: error.message },
    );
    return [];
  }
}

/**
 * Get cached route configuration or load from file
 * Implements caching strategy for performance
 * Cache is handled by global JSON config loader
 *
 * @returns {Array} - Array of route objects
 */
export function getCachedRouteConfiguration() {
  log(
    "routeConfigLoader.js",
    "getCachedRouteConfiguration",
    "start",
    "Getting cached route configuration",
    {},
  );
  trackStep({
    step: "getCachedConfig_start",
    file: "routeConfigLoader.js",
    method: "getCachedRouteConfiguration",
    flag: "cache",
    purpose: "Get cached route configuration",
  });

  try {
    // Load from file (caching is handled by jsonConfigLoader)
    const loadedConfig = loadRouteConfigurationFromFile();

    log(
      "routeConfigLoader.js",
      "getCachedRouteConfiguration",
      "success",
      "Route configuration retrieved",
      {
        routeCount: loadedConfig.length,
      },
    );
    trackStep({
      step: "getCachedConfig_complete",
      file: "routeConfigLoader.js",
      method: "getCachedRouteConfiguration",
      flag: "success",
      purpose: "Route config retrieved",
    });

    log(
      "routeConfigLoader.js",
      "getCachedRouteConfiguration",
      "return",
      "Returning route configuration",
      { routeCount: loadedConfig.length },
    );
    return loadedConfig;
  } catch (error) {
    logError(
      "routeConfigLoader.js",
      "getCachedRouteConfiguration",
      "Failed to get route configuration",
      error,
    );

    log(
      "routeConfigLoader.js",
      "getCachedRouteConfiguration",
      "return",
      "Returning empty array due to error",
      { error: error.message },
    );
    return [];
  }
}

/**
 * Reset route configuration cache
 * Forces reload on next access
 * Uses global JSON config loader cache clearing
 *
 * @returns {void}
 */
export function resetRouteConfigurationCache() {
  log(
    "routeConfigLoader.js",
    "resetRouteConfigurationCache",
    "start",
    "Resetting route configuration cache",
    {},
  );
  trackStep({
    step: "resetCache",
    file: "routeConfigLoader.js",
    method: "resetRouteConfigurationCache",
    flag: "cache-clear",
    purpose: "Clear route configuration cache",
  });

  clearConfigCache("route_config");

  log(
    "routeConfigLoader.js",
    "resetRouteConfigurationCache",
    "success",
    "Route configuration cache cleared",
    {},
  );
  trackStep({
    step: "resetCache_complete",
    file: "routeConfigLoader.js",
    method: "resetRouteConfigurationCache",
    flag: "success",
    purpose: "Cache cleared",
  });

  log(
    "routeConfigLoader.js",
    "resetRouteConfigurationCache",
    "return",
    "Cache reset complete",
    {},
  );
}

/**
 * Get route configuration (convenience method)
 * Always returns cached version for performance
 *
 * @returns {Array} - Array of route objects
 */
export function getRouteConfiguration() {
  log(
    "routeConfigLoader.js",
    "getRouteConfiguration",
    "call",
    "Getting route configuration",
    {},
  );
  const routes = getCachedRouteConfiguration();
  log(
    "routeConfigLoader.js",
    "getRouteConfiguration",
    "return",
    "Returning route configuration via cache",
    { routeCount: routes.length },
  );
  return routes;
}
