# Environment Variables Setup Guide

This guide explains how to configure environment variables for the Vue.js application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Environment Files](#environment-files)
3. [Required Variables](#required-variables)
4. [Environment-Specific Configuration](#environment-specific-configuration)
5. [Validation](#validation)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This application uses **Vite's environment variable system** to manage configuration across different environments (development, production, testing).

### Key Concepts

- **All client-side env vars MUST be prefixed with `VITE_`**
- Environment variables are **statically replaced** at build time
- Different `.env` files are loaded based on the mode (development, production, test)
- Variables are validated on application startup

---

## 📁 Environment Files

### Available Files

| File | Purpose | Committed to Git? |
|------|---------|-------------------|
| `.env.example` | Template with all variables | ✅ Yes (reference) |
| `.env.development` | Development configuration | ✅ Yes (safe defaults) |
| `.env.production` | Production configuration | ❌ No (contains secrets) |
| `.env.local` | Local overrides | ❌ No (gitignored) |
| `.env.*.local` | Environment-specific local overrides | ❌ No (gitignored) |

### File Priority (Vite Loading Order)

Vite loads env files in this order (later files override earlier ones):

1. `.env` (base, if exists)
2. `.env.local` (local overrides, always ignored by git)
3. `.env.[mode]` (e.g., `.env.development`)
4. `.env.[mode].local` (local overrides for specific mode)

### Setup Steps

#### 1. For Development

```bash
# The .env.development file is already configured with safe defaults
# Just run the app - no setup needed!
npm run dev
```

The development file uses:
- **Dev shim enabled** - No AWS Cognito required
- **Logging enabled** - Full debug output
- **Mock credentials** - Works offline

#### 2. For Production

```bash
# Copy the example file
cp .env.example .env.production

# Edit .env.production and add your real AWS Cognito credentials
nano .env.production  # or use your preferred editor
```

**Required changes for production:**
```bash
VITE_AUTH_DEV_SHIM=false                           # Use real AWS Cognito
VITE_COGNITO_USER_POOL_ID=us-east-1_ABC123XYZ     # Your pool ID
VITE_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m # Your client ID
VITE_COGNITO_REGION=us-east-1                      # Your AWS region
```

---

## 🔑 Required Variables

### All Environments

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_ENABLE_LOGGER` | boolean | `true` (dev), `false` (prod) | Enable/disable application logging |
| `VITE_ENABLE_PERFORMANCE_TRACKING` | boolean | `true` | Enable/disable performance tracking |
| `VITE_AUTH_DEV_SHIM` | boolean | `true` (dev), `false` (prod) | Use dev auth (true) or AWS Cognito (false) |
| `VITE_ENABLE_FOOTER_NAVIGATION` | boolean | `true` (dev), `false` (prod) | Enable/disable footer route navigation |

### Production Only

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `VITE_COGNITO_USER_POOL_ID` | string | ✅ Yes | AWS Cognito User Pool ID |
| `VITE_COGNITO_CLIENT_ID` | string | ✅ Yes | AWS Cognito App Client ID |
| `VITE_COGNITO_REGION` | string | ✅ Yes | AWS Region (e.g., `us-east-1`) |

### Optional Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_BASE_URL` | string | `/` | Application base URL for routing |

---

## 🛠️ Environment-Specific Configuration

### Development Environment

**File:** `.env.development`

```bash
# Logging and performance tracking enabled for debugging
VITE_ENABLE_LOGGER=true
VITE_ENABLE_PERFORMANCE_TRACKING=true

# Dev shim enabled - works without AWS
VITE_AUTH_DEV_SHIM=true

# Mock credentials (not used when dev shim is enabled)
VITE_COGNITO_USER_POOL_ID=dev-pool-id
VITE_COGNITO_CLIENT_ID=dev-client-id
VITE_COGNITO_REGION=us-east-1

# Base URL
VITE_BASE_URL=/
```

**Features:**
- ✅ No AWS Cognito setup required
- ✅ Mock authentication with local storage
- ✅ Full logging and debug output
- ✅ Works completely offline
- ✅ Fast iteration and testing

### Production Environment

**File:** `.env.production` (create from `.env.example`)

```bash
# Logging and performance tracking disabled for production performance
VITE_ENABLE_LOGGER=false
VITE_ENABLE_PERFORMANCE_TRACKING=false

# CRITICAL: Must use real AWS Cognito in production
VITE_AUTH_DEV_SHIM=false

# AWS Cognito Configuration - REPLACE THESE VALUES
VITE_COGNITO_USER_POOL_ID=YOUR_USER_POOL_ID_HERE
VITE_COGNITO_CLIENT_ID=YOUR_CLIENT_ID_HERE
VITE_COGNITO_REGION=us-east-1

# Base URL
VITE_BASE_URL=/
```

**Requirements:**
- ❌ Dev shim MUST be disabled (`false`)
- ✅ Real AWS Cognito credentials required
- ⚠️ Build will fail if credentials are missing/invalid
- 🔒 Never commit this file to git

---

## ✅ Validation

The application **automatically validates** environment variables on startup using `envValidator.js`.

### How Validation Works

1. **On Application Startup:**
   - `main.js` calls `validateOnStartup()`
   - Checks all required variables are present
   - Validates values match expected formats
   - Prints summary in development mode

2. **Validation Rules:**

   **Development:**
   - ✅ `VITE_ENABLE_LOGGER` must be 'true' or 'false'
   - ✅ `VITE_AUTH_DEV_SHIM` must be 'true' or 'false'
   - ⚠️ Cognito vars optional (dev shim bypasses AWS)

   **Production:**
   - ✅ All development rules
   - ✅ `VITE_AUTH_DEV_SHIM` MUST be 'false'
   - ✅ `VITE_COGNITO_USER_POOL_ID` required and not placeholder
   - ✅ `VITE_COGNITO_CLIENT_ID` required and not placeholder
   - ✅ `VITE_COGNITO_REGION` must match AWS region format

3. **Validation Output:**

   **Development Mode:**
   ```
   =================================
   Environment Variables Summary: DEVELOPMENT
   =================================

   Required Variables:
     ✅ VITE_ENABLE_LOGGER: true
     ✅ VITE_AUTH_DEV_SHIM: true

   Optional Variables:
     ✅ VITE_COGNITO_USER_POOL_ID: dev-pool-id
     ✅ VITE_COGNITO_CLIENT_ID: dev-client-id
     ✅ VITE_COGNITO_REGION: us-east-1

   =================================
   ```

   **Production Mode (Invalid):**
   ```
   ❌ Environment validation failed for "production":
   Missing required environment variable: VITE_COGNITO_USER_POOL_ID
   Invalid value for environment variable: VITE_COGNITO_CLIENT_ID = "YOUR_CLIENT_ID_HERE"
   ```

4. **Build-Time Validation:**
   - Production builds will **fail** if validation fails
   - Development mode shows **warnings** but continues
   - Use `npm run validate-env` to check without building

### Manual Validation

```bash
# Check environment variables without building
npm run validate-env

# Or use the validator directly
node -e "import('./src/utils/build/envValidator.js').then(m => m.validateOnStartup())"
```

---

## 🔒 Security Best Practices

### ✅ DO's

- ✅ **Always** use `.env.example` as a template
- ✅ **Copy** `.env.example` to `.env.production` for production
- ✅ **Set** real AWS Cognito credentials in CI/CD secrets
- ✅ **Rotate** Cognito credentials regularly
- ✅ **Use** different Cognito pools for staging and production
- ✅ **Validate** env vars on every build
- ✅ **Review** `.gitignore` to ensure secrets aren't committed

### ❌ DON'Ts

- ❌ **Never** commit `.env.production` with real credentials
- ❌ **Never** share `.env` files via Slack/email
- ❌ **Never** use development credentials in production
- ❌ **Never** disable validation in production
- ❌ **Never** hardcode secrets in source code
- ❌ **Don't** store `.env` files in cloud storage unencrypted

### Gitignore Configuration

The following files are already in `.gitignore`:

```gitignore
# Environment files (keep templates, ignore with actual values)
.env.local
.env.*.local
.env.production
.env.development.local
.env.production.local
# Keep .env.example and .env.development for reference
```

---

## 🐛 Troubleshooting

### Problem: "Missing required environment variable: VITE_COGNITO_USER_POOL_ID"

**Solution:**
1. Check if `.env.production` exists: `ls -la .env.production`
2. Verify the file contains `VITE_COGNITO_USER_POOL_ID=your-value`
3. Ensure the value is NOT `YOUR_USER_POOL_ID_HERE` (placeholder)
4. Rebuild: `npm run build`

### Problem: "Environment validation passed but app says auth not configured"

**Solution:**
1. Check `VITE_AUTH_DEV_SHIM` is set correctly
2. In production: Must be `false`
3. Verify Cognito credentials are valid
4. Check AWS Console > Cognito > User Pools for correct IDs

### Problem: "Env var not updating after changing .env file"

**Solution:**
1. **Restart the dev server** - Vite loads env vars once on startup
2. Clear browser cache
3. Check you're editing the correct `.env.*` file for your mode
4. Verify the variable is prefixed with `VITE_`

### Problem: "Can't see environment variables in browser console"

**Solution:**
1. Environment variables are accessible via `import.meta.env`
2. Try: `console.log(import.meta.env)`
3. Only `VITE_*` prefixed vars are exposed to client
4. Check if logging is enabled: `VITE_ENABLE_LOGGER=true`

### Problem: "Build fails in CI/CD with validation error"

**Solution:**
1. Set environment variables in your CI/CD platform:
   - GitHub Actions: Repository Secrets
   - GitLab CI: Variables
   - Netlify: Environment Variables
   - Vercel: Environment Variables
2. Ensure all required production vars are set
3. Check the validation error message for specific missing var
4. Consider using a `.env.production` file for staging/preview

---

## 📚 Additional Resources

- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-mode.html
- **AWS Cognito Setup:** See `DEV_GUIDE_COMPLETE.md` > Auth & Roles section
- **Environment Validator:** `src/utils/build/envValidator.js`
- **Requirements Config:** `config/envRequirements.json`

---

## 🆘 Need Help?

1. Check `.env.example` for the correct format
2. Run `npm run validate-env` to diagnose issues
3. Review `DEV_GUIDE_COMPLETE.md` for setup instructions
4. Check `TESTING_CHECKLISTS.md` for testing procedures

---

**Last Updated:** 2024
**Maintained By:** Development Team

