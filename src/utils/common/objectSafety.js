/**
 * ObjectSafety - Safe object manipulation utilities
 *
 * Provides defensive programming utilities for working with objects:
 * - Deep merging with child preference
 * - Safe nested property access
 * - Value presence validation
 */

/**
 * Deep merge two objects, preferring child values over parent values
 * Recursively merges nested objects, with child properties overriding parent properties
 *
 * @param {object} parentObject - Base object with default values
 * @param {object} childObject - Object with override values
 * @returns {object} - New merged object
 */
export function deepMergePreferChild(parentObject, childObject) {
  if (!parentObject && !childObject) {
    return {};
  }

  if (!parentObject) {
    return { ...childObject };
  }

  if (!childObject) {
    return { ...parentObject };
  }

  const mergedResult = { ...parentObject };

  for (const key in childObject) {
    if (!Object.prototype.hasOwnProperty.call(childObject, key)) {
      continue;
    }

    const childValue = childObject[key];
    const parentValue = mergedResult[key];

    const isChildPlainObject =
      childValue !== null && typeof childValue === 'object' && !Array.isArray(childValue);
    const isParentPlainObject =
      parentValue !== null && typeof parentValue === 'object' && !Array.isArray(parentValue);

    if (isChildPlainObject && isParentPlainObject) {
      mergedResult[key] = deepMergePreferChild(parentValue, childValue);
    } else {
      mergedResult[key] = childValue;
    }
  }

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
  if (!targetObject || typeof targetObject !== 'object') {
    return fallbackValue;
  }

  if (!propertyPath) {
    return fallbackValue;
  }

  const pathArray = Array.isArray(propertyPath) ? propertyPath : propertyPath.split('.');

  let currentValue = targetObject;

  for (let i = 0; i < pathArray.length; i++) {
    const key = pathArray[i];

    if (currentValue === null || currentValue === undefined) {
      return fallbackValue;
    }

    if (!Object.prototype.hasOwnProperty.call(currentValue, key)) {
      return fallbackValue;
    }

    currentValue = currentValue[key];
  }

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
  if (!targetObject || typeof targetObject !== 'object') {
    throw new Error(`${contextDescription} is not a valid object`);
  }

  if (!Array.isArray(requiredKeys)) {
    throw new Error('Required keys must be an array');
  }

  const missingKeys = [];

  for (const key of requiredKeys) {
    if (!Object.prototype.hasOwnProperty.call(targetObject, key) || targetObject[key] === undefined) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    throw new Error(
      `${contextDescription} is missing required properties: ${missingKeys.join(', ')}`,
    );
  }

  return true;
}

/**
 * Check if a value is a plain object (not array, null, or other types)
 *
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is a plain object
 */
function isPlainObjectValue(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

export function isPlainObject(value) {
  return isPlainObjectValue(value);
}

/**
 * Create a deep clone of an object
 *
 * @param {any} value - Value to clone
 * @returns {any} - Deep cloned value
 */
export function deepClone(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item));
  }

  if (isPlainObjectValue(value)) {
    const clonedObject = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        clonedObject[key] = deepClone(value[key]);
      }
    }
    return clonedObject;
  }

  return value;
}

/**
 * Check if a value is present (not null, undefined, or empty string)
 */
export function isValuePresent(value) {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Assert that a value is present, throwing an error if it isn't
 */
export function assertValuePresent(value, contextDescription = 'Value') {
  if (!isValuePresent(value)) {
    throw new Error(`${contextDescription} must be present`);
  }
  return true;
}

/**
 * Deep clone an object
 */
export function deepCloneObject(value) {
  return deepClone(value);
}
