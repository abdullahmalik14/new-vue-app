/**
 * ObjectSafety - Safe object manipulation utilities
 *
 * Provides defensive programming utilities for working with objects:
 * - Deep merging with child preference
 * - Safe nested property access
 * - Value presence validation
 */

import { log } from './logHandler.js';

/**
 * Deep merge two objects, preferring child values over parent values
 * Recursively merges nested objects, with child properties overriding parent properties
 * 
 * @param {object} parentObject - Base object with default values
 * @param {object} childObject - Object with override values
 * @returns {object} - New merged object
 */
export function deepMergePreferChild(parentObject, childObject) {
  log('objectSafety.js', 'deepMergePreferChild', 'start', 'Starting deep merge operation', {
    hasParent: !!parentObject,
    hasChild: !!childObject
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'deepMerge',
      file: 'objectSafety.js',
      method: 'deepMergePreferChild',
      flag: 'merge',
      purpose: 'Deep merge two objects'
    });
  }

  // Handle null/undefined inputs
  if (!parentObject && !childObject) {
    log('objectSafety.js', 'deepMergePreferChild', 'info', 'Both parent and child are null/undefined, returning empty object', {});
    log('objectSafety.js', 'deepMergePreferChild', 'return', 'Returning empty object', { mergedKeys: 0 });
    return {};
  }

  if (!parentObject) {
    log('objectSafety.js', 'deepMergePreferChild', 'info', 'Parent object is null/undefined, returning child object', {});
    log('objectSafety.js', 'deepMergePreferChild', 'return', 'Returning child object copy', { mergedKeys: Object.keys(childObject || {}).length });
    return { ...childObject };
  }

  if (!childObject) {
    log('objectSafety.js', 'deepMergePreferChild', 'info', 'Child object is null/undefined, returning parent object', {});
    log('objectSafety.js', 'deepMergePreferChild', 'return', 'Returning parent object copy', { mergedKeys: Object.keys(parentObject).length });
    return { ...parentObject };
  }

  // Create result object starting with parent
  const mergedResult = { ...parentObject };

  // Iterate through child properties
  for (const key in childObject) {
    // Skip inherited properties
    if (!Object.prototype.hasOwnProperty.call(childObject, key)) {
      continue;
    }

    const childValue = childObject[key];
    const parentValue = mergedResult[key];

    // Check if both values are objects (and not arrays or null)
    const isChildPlainObject = childValue !== null &&
                               typeof childValue === 'object' &&
                               !Array.isArray(childValue);
    const isParentPlainObject = parentValue !== null &&
                                typeof parentValue === 'object' &&
                                !Array.isArray(parentValue);

    // Recursively merge if both are plain objects
    if (isChildPlainObject && isParentPlainObject) {
      mergedResult[key] = deepMergePreferChild(parentValue, childValue);
    } else {
      // Child value overrides parent value
      mergedResult[key] = childValue;
    }
  }

  log('objectSafety.js', 'deepMergePreferChild', 'success', 'Deep merge completed', { mergedKeys: Object.keys(mergedResult).length });
  log('objectSafety.js', 'deepMergePreferChild', 'return', 'Returning merged object', { mergedKeys: Object.keys(mergedResult).length });
  return mergedResult;
}

/**
 * Safely get a nested property from an object using dot notation or array path
 * Returns fallback value if path doesn't exist
 * 
 * @param {object} targetObject - Object to query
 * @param {string|Array} propertyPath - Path to property (e.g., 'user.profile.name' or ['user', 'profile', 'name'])
 * @param {any} fallbackValue - Value to return if property doesn't exist (default: undefined)
 * @returns {any} - Property value or fallback value
 */
export function safelyGetNestedProperty(targetObject, propertyPath, fallbackValue = undefined) {
  log('objectSafety.js', 'safelyGetNestedProperty', 'start', 'Getting nested property', { 
    hasTarget: !!targetObject,
    path: propertyPath
  });

  // Validate inputs
  if (!targetObject || typeof targetObject !== 'object') {
    log('objectSafety.js', 'safelyGetNestedProperty', 'warn', 'Target object is invalid', { targetObject: typeof targetObject });
    log('objectSafety.js', 'safelyGetNestedProperty', 'return', 'Returning fallback due to invalid target', { fallbackValue });
    return fallbackValue;
  }

  if (!propertyPath) {
    log('objectSafety.js', 'safelyGetNestedProperty', 'warn', 'Property path is empty', {});
    log('objectSafety.js', 'safelyGetNestedProperty', 'return', 'Returning fallback due to empty path', { fallbackValue });
    return fallbackValue;
  }

  // Convert string path to array
  const pathArray = Array.isArray(propertyPath)
    ? propertyPath
    : propertyPath.split('.');

  // Traverse the object
  let currentValue = targetObject;

  for (let i = 0; i < pathArray.length; i++) {
    const key = pathArray[i];

    if (currentValue === null || currentValue === undefined) {
      log('objectSafety.js', 'safelyGetNestedProperty', 'not-found', 'Path traversal hit null/undefined', { 
        path: propertyPath,
        stoppedAt: i,
        key
      });
      log('objectSafety.js', 'safelyGetNestedProperty', 'return', 'Returning fallback due to null/undefined in path', { fallbackValue });
      return fallbackValue;
    }

    if (!Object.prototype.hasOwnProperty.call(currentValue, key)) {
      log('objectSafety.js', 'safelyGetNestedProperty', 'not-found', 'Property not found in object', { 
        path: propertyPath,
        key,
        availableKeys: Object.keys(currentValue)
      });
      log('objectSafety.js', 'safelyGetNestedProperty', 'return', 'Returning fallback due to missing property', { fallbackValue });
      return fallbackValue;
    }

    currentValue = currentValue[key];
  }

  log('objectSafety.js', 'safelyGetNestedProperty', 'success', 'Property found', { path: propertyPath, foundValue: typeof currentValue });
  log('objectSafety.js', 'safelyGetNestedProperty', 'return', 'Returning found value', { path: propertyPath });
  return currentValue;
}

/**
 * Check if all required properties exist on an object
 * Throws error if any required property is missing
 * 
 * @param {object} targetObject - Object to validate
 * @param {Array<string>} requiredKeys - Array of required property names
 * @param {string} contextDescription - Description for error message
 * @throws {Error} - If any required property is missing
 * @returns {boolean} - True if all properties exist
 */
export function assertRequiredProperties(targetObject, requiredKeys, contextDescription = 'object') {
  log('objectSafety.js', 'assertRequiredProperties', 'start', 'Asserting required properties', {
    context: contextDescription,
    requiredKeys
  });

  if (!targetObject || typeof targetObject !== 'object') {
    const errorMsg = `${contextDescription} is not a valid object`;
    log('objectSafety.js', 'assertRequiredProperties', 'error', errorMsg, {});
    throw new Error(errorMsg);
  }

  if (!Array.isArray(requiredKeys)) {
    const errorMsg = 'Required keys must be an array';
    log('objectSafety.js', 'assertRequiredProperties', 'error', errorMsg, {});
    throw new Error(errorMsg);
  }

  const missingKeys = [];

  for (const key of requiredKeys) {
    if (!Object.prototype.hasOwnProperty.call(targetObject, key) || targetObject[key] === undefined) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    const errorMsg = `${contextDescription} is missing required properties: ${missingKeys.join(', ')}`;
    log('objectSafety.js', 'assertRequiredProperties', 'error', errorMsg, { 
      missingKeys,
      availableKeys: Object.keys(targetObject)
    });
    throw new Error(errorMsg);
  }

  log('objectSafety.js', 'assertRequiredProperties', 'success', 'All required properties present', { 
    context: contextDescription,
    checkedKeys: requiredKeys.length
  });
  
  log('objectSafety.js', 'assertRequiredProperties', 'return', 'Returning validation success', { valid: true });
  return true;
}

/**
 * Check if a value is a plain object (not array, null, or other types)
 * 
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is a plain object
 */
export function isPlainObject(value) {
  const result = value !== null && 
                 typeof value === 'object' && 
                 !Array.isArray(value) &&
                 Object.prototype.toString.call(value) === '[object Object]';
  
  log('objectSafety.js', 'isPlainObject', 'return', 'Returning plain object check', { isPlain: result });
  return result;
}

/**
 * Create a deep clone of an object
 * 
 * @param {any} value - Value to clone
 * @returns {any} - Deep cloned value
 */
export function deepClone(value) {
  log('objectSafety.js', 'deepClone', 'start', 'Creating deep clone', { valueType: typeof value });

  if (value === null || value === undefined) {
    log('objectSafety.js', 'deepClone', 'return', 'Returning null/undefined as-is', {});
    return value;
  }

  if (typeof value !== 'object') {
    log('objectSafety.js', 'deepClone', 'return', 'Returning primitive value as-is', {});
    return value;
  }

  if (Array.isArray(value)) {
    const clonedArray = value.map(item => deepClone(item));
    log('objectSafety.js', 'deepClone', 'return', 'Returning cloned array', { length: clonedArray.length });
    return clonedArray;
  }

  if (isPlainObject(value)) {
    const clonedObject = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        clonedObject[key] = deepClone(value[key]);
      }
    }
    log('objectSafety.js', 'deepClone', 'return', 'Returning cloned object', { keys: Object.keys(clonedObject).length });
    return clonedObject;
  }

  // For other object types (Date, RegExp, etc.), return as-is
  log('objectSafety.js', 'deepClone', 'return', 'Returning special object type as-is', {});
  return value;
}
