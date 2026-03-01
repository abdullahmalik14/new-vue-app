/**
 * Environment Variable Validation Script
 * 
 * Validates environment variables before build/deployment
 * Can be run standalone or as part of CI/CD pipeline
 * 
 * Usage:
 *   npm run validate-env              # Validate current environment
 *   npm run validate-env:dev          # Validate development
 *   npm run validate-env:prod         # Validate production
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment from NODE_ENV or default to development
const environment = process.env.NODE_ENV || 'development';

console.log('\n=================================');
console.log(`Environment Validation: ${environment.toUpperCase()}`);
console.log('=================================\n');

// Load .env file for the environment
const envPath = join(__dirname, '..', `.env.${environment}`);
let envVars = {};

try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      envVars[key] = value;
    }
  });
  console.log(`✅ Loaded env file: ${envPath}\n`);
} catch (error) {
  console.warn(`⚠️  Could not load .env.${environment} file: ${error.message}`);
  console.log('Checking process.env for variables...\n');
  // Fall back to process.env
  envVars = process.env;
}

// Environment requirements configuration
const ENV_REQUIREMENTS = {
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
      'VITE_AUTH_DEV_SHIM': (value) => value === 'true' || value === 'false',
      'VITE_ENABLE_FOOTER_NAVIGATION': (value) => value === 'true' || value === 'false'
    }
  },
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
      'VITE_AUTH_DEV_SHIM': (value) => value === 'true' || value === 'false',
      'VITE_ENABLE_FOOTER_NAVIGATION': (value) => value === 'true' || value === 'false',
      'VITE_COGNITO_USER_POOL_ID': (value) => value && value.length > 0 && value !== 'YOUR_USER_POOL_ID_HERE',
      'VITE_COGNITO_CLIENT_ID': (value) => value && value.length > 0 && value !== 'YOUR_CLIENT_ID_HERE',
      'VITE_COGNITO_REGION': (value) => value && /^[a-z]{2}-[a-z]+-\d{1}$/.test(value)
    }
  },
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
      'VITE_AUTH_DEV_SHIM': (value) => value === 'true' || value === 'false',
      'VITE_ENABLE_FOOTER_NAVIGATION': (value) => value === 'true' || value === 'false'
    }
  }
};

// Get requirements for this environment
const requirements = ENV_REQUIREMENTS[environment] || ENV_REQUIREMENTS.development;

const errors = [];
const warnings = [];
const validatedVars = {};

// Validate required variables
console.log('Required Variables:');
for (const varName of requirements.required) {
  const value = envVars[varName];

  if (value === undefined || value === null || value === '') {
    const error = `Missing required environment variable: ${varName}`;
    errors.push(error);
    console.log(`  ❌ ${varName}: NOT SET`);
  } else {
    // Validate the value if validation function exists
    if (requirements.validation && requirements.validation[varName]) {
      const isValid = requirements.validation[varName](value);

      if (!isValid) {
        const error = `Invalid value for environment variable: ${varName} = "${value}"`;
        errors.push(error);
        console.log(`  ❌ ${varName}: ${value} (INVALID)`);
      } else {
        validatedVars[varName] = value;
        const displayValue = varName.includes('SECRET') || varName.includes('KEY') ? '***' : value;
        console.log(`  ✅ ${varName}: ${displayValue}`);
      }
    } else {
      validatedVars[varName] = value;
      const displayValue = varName.includes('SECRET') || varName.includes('KEY') ? '***' : value;
      console.log(`  ✅ ${varName}: ${displayValue}`);
    }
  }
}

// Validate optional variables
console.log('\nOptional Variables:');
for (const varName of requirements.optional) {
  const value = envVars[varName];

  if (value === undefined || value === null || value === '') {
    const warning = `Optional environment variable not set: ${varName}`;
    warnings.push(warning);
    console.log(`  ⚠️  ${varName}: NOT SET`);
  } else {
    // Validate the value if validation function exists
    if (requirements.validation && requirements.validation[varName]) {
      const isValid = requirements.validation[varName](value);

      if (!isValid) {
        const warning = `Optional environment variable has invalid value: ${varName} = "${value}"`;
        warnings.push(warning);
        console.log(`  ⚠️  ${varName}: ${value} (INVALID)`);
      } else {
        validatedVars[varName] = value;
        const displayValue = varName.includes('SECRET') || varName.includes('KEY') ? '***' : value;
        console.log(`  ✅ ${varName}: ${displayValue}`);
      }
    } else {
      validatedVars[varName] = value;
      const displayValue = varName.includes('SECRET') || varName.includes('KEY') ? '***' : value;
      console.log(`  ✅ ${varName}: ${displayValue}`);
    }
  }
}

// Print summary
console.log('\n=================================');
console.log('Validation Summary');
console.log('=================================');
console.log(`Environment: ${environment}`);
console.log(`Required Variables: ${requirements.required.length} total, ${Object.keys(validatedVars).filter(k => requirements.required.includes(k)).length} valid`);
console.log(`Optional Variables: ${requirements.optional.length} total, ${Object.keys(validatedVars).filter(k => requirements.optional.includes(k)).length} set`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log('=================================\n');

// Print errors
if (errors.length > 0) {
  console.error('❌ VALIDATION ERRORS:\n');
  errors.forEach(error => console.error(`  • ${error}`));
  console.error('');
}

// Print warnings
if (warnings.length > 0) {
  console.warn('⚠️  VALIDATION WARNINGS:\n');
  warnings.forEach(warning => console.warn(`  • ${warning}`));
  console.warn('');
}

// Exit with appropriate code
if (errors.length > 0) {
  console.error('❌ Environment validation FAILED');
  console.error('Please check your .env file and ensure all required variables are set.');
  console.error(`See .env.example for reference.\n`);
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('⚠️  Environment validation passed with warnings');
  console.log('Consider setting optional variables for full functionality.\n');
  process.exit(0);
} else {
  console.log('✅ Environment validation PASSED');
  console.log('All required and optional variables are set correctly.\n');
  process.exit(0);
}

