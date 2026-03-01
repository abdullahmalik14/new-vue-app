/**
 * envValidator.js - Environment Variable Validation Utility
 * 
 * Validates that all required environment variables are present and valid
 * Uses a JSON configuration to define required keys per environment
 * Fails the build if critical environment variables are missing
 */

import { log } from '../common/logHandler.js';

/**
 * Environment variable requirements configuration
 * Structure: { environment: { required: [], optional: [], validation: {} } }
 */
const ENV_REQUIREMENTS = {
  // Development environment requirements
  development: {
    required: [
      'VITE_ENABLE_LOGGER',
      'VITE_ENABLE_PERFORMANCE_TRACKING',
      'VITE_AUTH_DEV_SHIM',
      'VITE_ENABLE_FOOTER_NAVIGATION'
    ],
    optional: [
      'VITE_COGNITO_USER_POOL_ID',
      'VITE_COGNITO_CLIENT_ID',
      'VITE_COGNITO_REGION',
      'VITE_BASE_URL'
    ],
    validation: {
      'VITE_ENABLE_LOGGER': (value) => value === 'true' || value === 'false',
      'VITE_ENABLE_PERFORMANCE_TRACKING': (value) => value === 'true' || value === 'false',
      'VITE_AUTH_DEV_SHIM': (value) => ['true', 'false', 'dev', 'cognito'].includes(value),
      'VITE_ENABLE_FOOTER_NAVIGATION': (value) => value === 'true' || value === 'false'
    }
  },

  // Production environment requirements
  production: {
    required: [
      'VITE_ENABLE_LOGGER',
      'VITE_ENABLE_PERFORMANCE_TRACKING',
      'VITE_AUTH_DEV_SHIM',
      'VITE_ENABLE_FOOTER_NAVIGATION',
      'VITE_COGNITO_USER_POOL_ID',
      'VITE_COGNITO_CLIENT_ID',
      'VITE_COGNITO_REGION'
    ],
    optional: [
      'VITE_BASE_URL'
    ],
    validation: {
      'VITE_ENABLE_LOGGER': (value) => value === 'true' || value === 'false',
      'VITE_ENABLE_PERFORMANCE_TRACKING': (value) => value === 'true' || value === 'false',
      'VITE_AUTH_DEV_SHIM': (value) => ['true', 'false', 'dev', 'cognito'].includes(value),
      'VITE_ENABLE_FOOTER_NAVIGATION': (value) => value === 'true' || value === 'false',
      'VITE_COGNITO_USER_POOL_ID': (value) => value && value.length > 0 && value !== 'YOUR_USER_POOL_ID_HERE',
      'VITE_COGNITO_CLIENT_ID': (value) => value && value.length > 0 && value !== 'YOUR_CLIENT_ID_HERE',
      'VITE_COGNITO_REGION': (value) => value && /^[a-z]{2}-[a-z]+-\d{1}$/.test(value)
    }
  },

  // Test environment requirements
  test: {
    required: [
      'VITE_ENABLE_LOGGER',
      'VITE_ENABLE_PERFORMANCE_TRACKING',
      'VITE_AUTH_DEV_SHIM',
      'VITE_ENABLE_FOOTER_NAVIGATION'
    ],
    optional: [
      'VITE_COGNITO_USER_POOL_ID',
      'VITE_COGNITO_CLIENT_ID',
      'VITE_COGNITO_REGION',
      'VITE_BASE_URL'
    ],
    validation: {
      'VITE_ENABLE_LOGGER': (value) => value === 'true' || value === 'false',
      'VITE_ENABLE_PERFORMANCE_TRACKING': (value) => value === 'true' || value === 'false',
      'VITE_AUTH_DEV_SHIM': (value) => ['true', 'false', 'dev', 'cognito'].includes(value),
      'VITE_ENABLE_FOOTER_NAVIGATION': (value) => value === 'true' || value === 'false'
    }
  }
};

/**
 * Validate environment variables for the current environment
 * 
 * @param {string} environment - Environment name (development, production, test)
 * @param {object} envVars - Environment variables object (import.meta.env)
 * @param {boolean} throwOnError - Whether to throw error or just log (default: true)
 * @returns {object} - Validation result { valid: boolean, errors: [], warnings: [] }
 */
export function validateEnvironmentVariables(environment = 'development', envVars = null, throwOnError = true) {
  log('envValidator.js', 'validateEnvironmentVariables', 'start', 'Validating environment variables', { 
    environment,
    hasEnvVars: !!envVars
  });

  // Use import.meta.env if no envVars provided
  const env = envVars || import.meta.env;

  // Get requirements for this environment
  const requirements = ENV_REQUIREMENTS[environment] || ENV_REQUIREMENTS.development;
  
  const errors = [];
  const warnings = [];
  const validatedVars = {};

  // Check required variables
  log('envValidator.js', 'validateEnvironmentVariables', 'check-required', 'Checking required environment variables', {
    environment,
    requiredCount: requirements.required.length
  });

  for (const varName of requirements.required) {
    const value = env[varName];

    if (value === undefined || value === null || value === '') {
      const error = `Missing required environment variable: ${varName}`;
      errors.push(error);
      log('envValidator.js', 'validateEnvironmentVariables', 'error', error, { varName, environment });
    } else {
      // Validate the value if validation function exists
      if (requirements.validation && requirements.validation[varName]) {
        const isValid = requirements.validation[varName](value);
        
        if (!isValid) {
          const error = `Invalid value for environment variable: ${varName} = "${value}"`;
          errors.push(error);
          log('envValidator.js', 'validateEnvironmentVariables', 'error', error, { varName, value, environment });
        } else {
          validatedVars[varName] = value;
          log('envValidator.js', 'validateEnvironmentVariables', 'valid', `Valid: ${varName}`, { varName, environment });
        }
      } else {
        validatedVars[varName] = value;
        log('envValidator.js', 'validateEnvironmentVariables', 'valid', `Present: ${varName}`, { varName, environment });
      }
    }
  }

  // Check optional variables (warnings only)
  log('envValidator.js', 'validateEnvironmentVariables', 'check-optional', 'Checking optional environment variables', {
    environment,
    optionalCount: requirements.optional.length
  });

  for (const varName of requirements.optional) {
    const value = env[varName];

    if (value === undefined || value === null || value === '') {
      const warning = `Optional environment variable not set: ${varName}`;
      warnings.push(warning);
      log('envValidator.js', 'validateEnvironmentVariables', 'warn', warning, { varName, environment });
    } else {
      // Validate the value if validation function exists
      if (requirements.validation && requirements.validation[varName]) {
        const isValid = requirements.validation[varName](value);
        
        if (!isValid) {
          const warning = `Optional environment variable has invalid value: ${varName} = "${value}"`;
          warnings.push(warning);
          log('envValidator.js', 'validateEnvironmentVariables', 'warn', warning, { varName, value, environment });
        } else {
          validatedVars[varName] = value;
        }
      } else {
        validatedVars[varName] = value;
      }
    }
  }

  // Build validation result
  const validationResult = {
    valid: errors.length === 0,
    errors,
    warnings,
    validatedVars,
    environment
  };

  // Log summary
  log('envValidator.js', 'validateEnvironmentVariables', 'summary', 'Validation complete', {
    environment,
    valid: validationResult.valid,
    errorCount: errors.length,
    warningCount: warnings.length,
    validatedCount: Object.keys(validatedVars).length
  });

  // Throw error if validation failed and throwOnError is true
  if (!validationResult.valid && throwOnError) {
    const errorMessage = `Environment validation failed for "${environment}":\n${errors.join('\n')}`;
    log('envValidator.js', 'validateEnvironmentVariables', 'error', 'Throwing validation error', { 
      environment, 
      errorCount: errors.length 
    });
    throw new Error(errorMessage);
  }

  log('envValidator.js', 'validateEnvironmentVariables', 'return', 'Returning validation result', {
    environment,
    valid: validationResult.valid
  });

  return validationResult;
}

/**
 * Get list of required environment variables for an environment
 * 
 * @param {string} environment - Environment name (development, production, test)
 * @returns {Array<string>} - Array of required variable names
 */
export function getRequiredEnvVars(environment = 'development') {
  log('envValidator.js', 'getRequiredEnvVars', 'get', 'Getting required environment variables', { environment });

  const requirements = ENV_REQUIREMENTS[environment] || ENV_REQUIREMENTS.development;
  
  log('envValidator.js', 'getRequiredEnvVars', 'return', 'Returning required variables', {
    environment,
    count: requirements.required.length
  });

  return requirements.required;
}

/**
 * Get list of optional environment variables for an environment
 * 
 * @param {string} environment - Environment name (development, production, test)
 * @returns {Array<string>} - Array of optional variable names
 */
export function getOptionalEnvVars(environment = 'development') {
  log('envValidator.js', 'getOptionalEnvVars', 'get', 'Getting optional environment variables', { environment });

  const requirements = ENV_REQUIREMENTS[environment] || ENV_REQUIREMENTS.development;
  
  log('envValidator.js', 'getOptionalEnvVars', 'return', 'Returning optional variables', {
    environment,
    count: requirements.optional.length
  });

  return requirements.optional;
}

/**
 * Get all environment requirements configuration
 * 
 * @returns {object} - Full ENV_REQUIREMENTS configuration
 */
export function getAllEnvRequirements() {
  log('envValidator.js', 'getAllEnvRequirements', 'get', 'Getting all environment requirements', {});
  
  log('envValidator.js', 'getAllEnvRequirements', 'return', 'Returning all requirements', {
    environments: Object.keys(ENV_REQUIREMENTS)
  });

  return ENV_REQUIREMENTS;
}

/**
 * Print environment variables summary (for debugging)
 * 
 * @param {string} environment - Environment name
 * @param {object} envVars - Environment variables object (import.meta.env)
 * @returns {void}
 */
export function printEnvSummary(environment = 'development', envVars = null) {
  const env = envVars || import.meta.env;
  const requirements = ENV_REQUIREMENTS[environment] || ENV_REQUIREMENTS.development;

  console.log('\n=================================');
  console.log(`Environment Variables Summary: ${environment.toUpperCase()}`);
  console.log('=================================\n');

  console.log('Required Variables:');
  requirements.required.forEach((varName) => {
    const value = env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value ? (varName.includes('SECRET') || varName.includes('KEY') ? '***' : value) : 'NOT SET';
    console.log(`  ${status} ${varName}: ${displayValue}`);
  });

  console.log('\nOptional Variables:');
  requirements.optional.forEach((varName) => {
    const value = env[varName];
    const status = value ? '✅' : '⚠️';
    const displayValue = value ? (varName.includes('SECRET') || varName.includes('KEY') ? '***' : value) : 'NOT SET';
    console.log(`  ${status} ${varName}: ${displayValue}`);
  });

  console.log('\n=================================\n');
}

/**
 * Validate environment on application startup
 * Call this early in your main.js or app initialization
 * 
 * @returns {object} - Validation result
 */
export function validateOnStartup() {
  const environment = import.meta.env.MODE || 'development';
  
  log('envValidator.js', 'validateOnStartup', 'start', 'Validating environment on startup', { environment });

  try {
    const result = validateEnvironmentVariables(environment, import.meta.env, false);
    
    if (!result.valid) {
      console.error('⚠️ Environment validation errors detected:');
      result.errors.forEach(error => console.error(`  ❌ ${error}`));
    }

    if (result.warnings.length > 0) {
      console.warn('⚠️ Environment validation warnings:');
      result.warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`));
    }

    if (result.valid && result.warnings.length === 0) {
      console.log('✅ Environment validation passed');
    }

    log('envValidator.js', 'validateOnStartup', 'return', 'Returning startup validation result', {
      environment,
      valid: result.valid
    });

    return result;
  } catch (error) {
    log('envValidator.js', 'validateOnStartup', 'error', 'Validation error during startup', {
      environment,
      error: error.message
    });
    throw error;
  }
}

// Export the requirements configuration for external use
export { ENV_REQUIREMENTS };

