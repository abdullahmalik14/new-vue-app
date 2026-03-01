# Section Loading and Preloading System Guide

This document describes how section loading, preloading, and asset preloading work in the application. Use this guide to ensure all features are properly implemented.

---

## Table of Contents

1. [Overview](#overview)
2. [Auth Section Always Preloaded](#auth-section-always-preloaded)
3. [Preloading Sections (preLoadSections)](#preloading-sections-preloadsections)
4. [Loading Current Section](#loading-current-section)
5. [Asset Preloading](#asset-preloading)
6. [File Responsibilities](#file-responsibilities)
7. [Complete Flow Diagrams](#complete-flow-diagrams)
8. [Troubleshooting Checklist](#troubleshooting-checklist)

---

## Overview

The application has three distinct loading mechanisms:

1. **Auth Section Preloading**: Always preloaded on app startup (hardcoded)
2. **Route-Based Preloading**: Sections listed in `preLoadSections` array are preloaded after navigation
3. **Current Section Loading**: The section for the current route is loaded during navigation
4. **Asset Preloading**: Images, fonts, and other assets are preloaded when sections are preloaded

---

## Auth Section Always Preloaded

### Purpose
The `auth` section is **always** preloaded on app startup, regardless of the current route. This ensures authentication pages load instantly.

### Implementation Location
**File**: `src/main.js`

### What Should Happen

```javascript
// Line 271-279 in src/main.js
router.isReady().then(() => {
  // Preload auth section by default (non-blocking)
  log('main.js', 'init', 'preload-default', 'Preloading default auth section', { section: 'auth' });
  preloadSection('auth').catch(err => {
    log('main.js', 'init', 'preload-error', 'Default auth section preload failed (non-blocking)', { 
      section: 'auth',
      error: err.message 
    });
  });
  
  // ... rest of initialization
});
```

### Key Requirements

1. **MUST be inside `router.isReady().then()`** - Wait for router to be ready
2. **MUST call `preloadSection('auth')`** - Always preload auth section
3. **MUST be non-blocking** - Use `.catch()` to handle errors without blocking app mount
4. **MUST happen on every app startup** - Not conditional on route

### Dependencies

- `preloadSection` imported from `'./utils/section/sectionPreloader.js'` (line 24)
- Router must be initialized before this code runs

---

## Preloading Sections (preLoadSections)

### Purpose
Sections listed in a route's `preLoadSections` array are preloaded **after** navigation to that route completes. This prepares sections for future navigation.

### Configuration Location
**File**: `src/router/routeConfig.json`

### Example Configuration

```json
{
  "slug": "/log-in",
  "section": "auth",
  "preLoadSections": [
    "dashboard",
    "shop"
  ]
}
```

### Implementation Locations

#### 1. App Startup Preloading
**File**: `src/main.js` (lines 281-339)

**What Should Happen**:

```javascript
router.isReady().then(() => {
  // ... auth preload code ...
  
  const currentPath = router.currentRoute.value.path;
  const currentRoute = resolveRouteFromPath(currentPath);
  
  if (currentRoute) {
    const sectionsToPreload = Array.isArray(currentRoute.preLoadSections) 
      ? [...currentRoute.preLoadSections] 
      : [];
    
    if (sectionsToPreload.length > 0) {
      Promise.all(
        sectionsToPreload.map(section => {
          if (section && typeof section === 'string') {
            return preloadSection(section).catch(err => {
              log('main.js', 'init', 'preload-error', 'Section preload failed (non-blocking)', { 
                section, 
                error: err.message 
              });
            });
          }
          return Promise.resolve();
        })
      );
    }
  }
});
```

**Key Requirements**:
- Get current route using `resolveRouteFromPath(currentPath)`
- Extract `preLoadSections` array from route config
- Preload each section in the array (non-blocking)
- Handle errors gracefully

#### 2. Navigation-Based Preloading
**File**: `src/router/index.js` (lines 367-489)

**What Should Happen**:

```javascript
router.afterEach(async (to, from) => {
  const routeConfig = to.meta?.routeConfig;
  
  // Check if route should be excluded
  if (routeConfig?.preloadExclude === true) {
    return; // Skip preloading
  }
  
  if (routeConfig) {
    // Get sections to preload ONLY from the route's preLoadSections array
    const sectionsToPreload = Array.isArray(routeConfig.preLoadSections) 
      ? [...routeConfig.preLoadSections] 
      : [];
    
    if (sectionsToPreload.length > 0) {
      // Preload each section (non-blocking)
      for (const sectionToPreload of sectionsToPreload) {
        if (sectionToPreload && typeof sectionToPreload === 'string') {
          preloadSection(sectionToPreload).catch(err => {
            log('router/index.js', 'afterEach', 'preload-error', 'Section preload failed (non-blocking)', {
              section: sectionToPreload,
              error: err.message
            });
          });
          
          // Also load translations for preloaded sections
          loadTranslationsForSection(sectionToPreload).catch(err => {
            log('router/index.js', 'afterEach', 'translation-error', 'Translation load failed (non-blocking)', { 
              section: sectionToPreload, 
              error: err.message 
            });
          });
        }
      }
    }
  }
});
```

**Key Requirements**:
- **MUST be in `router.afterEach` hook** - Runs after navigation completes
- **MUST read from `routeConfig.preLoadSections`** - Directly from route config, not from resolver
- **MUST be non-blocking** - Use `.catch()` for error handling
- **MUST preload translations** - Call `loadTranslationsForSection()` for each preloaded section
- **MUST check for `preloadExclude` flag** - Skip if route excludes preloading

### Dependencies

- `preloadSection` imported from `'../utils/section/sectionPreloader.js'` (line 19)
- `loadTranslationsForSection` imported from `'../utils/translation/translationLoader.js'` (line 20)
- Route config must be in `to.meta.routeConfig`

---

## Loading Current Section

### Purpose
The section for the **current route** is loaded when navigating to that route. This is required for the route to display.

### Implementation Location
**File**: `src/router/index.js` (lines 166-263)

### What Should Happen

```javascript
async function loadRouteComponent(route) {
  log('router/index.js', 'loadRouteComponent', 'start', 'Loading component for route', { slug: route.slug });

  try {
    // Get auth store for role-based resolution
    const authStore = useAuthStore();
    const userRole = authStore.currentUser?.role || 'guest';

    // Resolve component path (handles role-based customComponentPath)
    const componentPath = resolveComponentPathForRoute(route, userRole);
    
    if (!componentPath) {
      throw new Error(`No component path found for route: ${route.slug}`);
    }
    
    // Find the component loader in the pre-loaded modules
    const componentLoader = findComponentLoader(componentPath);
    
    if (!componentLoader) {
      throw new Error(`Component not found in pre-loaded modules: ${componentPath}`);
    }

    // Load the component - this will use the bundled chunk reference
    const componentModule = await componentLoader();

    return componentModule.default || componentModule;
  } catch (error) {
    // Fallback to NotFound component
    return import('@/templates/misc/NotFound.vue');
  }
}
```

### Key Requirements

1. **MUST be async function** - Component loading is asynchronous
2. **MUST resolve component path** - Use `resolveComponentPathForRoute()` for role-based paths
3. **MUST find component loader** - Use `findComponentLoader()` to get loader from `import.meta.glob`
4. **MUST await component load** - `await componentLoader()` to actually load the component
5. **MUST have fallback** - Return NotFound component on error

### When It's Called

- Automatically called by Vue Router when route is accessed
- Defined in route generation: `component: () => loadRouteComponent(route)` (line 74)

### Dependencies

- `resolveComponentPathForRoute` from `'../utils/route/index.js'` (line 14)
- `findComponentLoader` function (lines 124-157)
- `componentModules` from `import.meta.glob` (lines 112-115)

---

## Asset Preloading

### Purpose
When a section is preloaded, all assets (images, fonts, etc.) defined in that section's routes are also preloaded.

### Implementation Location
**File**: `src/utils/section/sectionPreloader.js` (line 107)

### What Should Happen

Inside `preloadSection()` function:

```javascript
export async function preloadSection(sectionName) {
  // ... bundle preloading code ...
  
  // After bundles are preloaded, preload section assets (non-blocking)
  preloadSectionAssets(sectionName).catch(err => {
    log('sectionPreloader.js', 'preloadSection', 'asset-preload-error', 'Asset preload failed (non-blocking)', {
      sectionName,
      error: err.message
    });
  });
  
  // ... rest of function ...
}
```

### Asset Preloader Implementation
**File**: `src/utils/assets/assetPreloader.js` (lines 477-549)

**What Should Happen**:

```javascript
export async function preloadSectionAssets(sectionName) {
  // Get route configuration
  const { getRouteConfiguration } = await import('../route/routeConfigLoader');
  const routes = getRouteConfiguration();
  
  // Find all routes for this section
  const sectionRoutes = routes.filter(route => {
    if (typeof route.section === 'string') {
      return route.section === sectionName;
    }
    if (typeof route.section === 'object') {
      return Object.values(route.section).includes(sectionName);
    }
    return false;
  });

  // Collect all assets from these routes
  const allAssets = [];
  for (const route of sectionRoutes) {
    if (route.assetPreload && Array.isArray(route.assetPreload)) {
      allAssets.push(...route.assetPreload);
    }
  }

  // Preload all collected assets
  await preloadAssets(allAssets);
}
```

### Asset Configuration in Route Config

```json
{
  "slug": "/discover",
  "section": "discover",
  "assetPreload": [
    {
      "src": "/media/sample.jpg",
      "type": "image",
      "priority": "high"
    }
  ]
}
```

### Key Requirements

1. **MUST be called from `preloadSection()`** - After bundles are preloaded
2. **MUST be non-blocking** - Use `.catch()` for error handling
3. **MUST find all routes in section** - Handle both string and object section configs
4. **MUST collect all `assetPreload` arrays** - From all routes in the section
5. **MUST call `preloadAssets()`** - To actually preload the assets

### Dependencies

- `preloadSectionAssets` imported from `'../assets/assetPreloader.js'` (line 12)
- Route config must have `assetPreload` arrays in routes

---

## File Responsibilities

### `src/main.js`

**Responsibilities**:
1. ✅ Always preload `auth` section on app startup (lines 271-279)
2. ✅ Preload sections from current route's `preLoadSections` on startup (lines 281-339)
3. ✅ Wait for router to be ready before preloading

**Required Imports**:
```javascript
import { preloadSection } from './utils/section/sectionPreloader.js';
import { resolveRouteFromPath } from './utils/route/routeResolver.js';
```

**Critical Code Sections**:
- Lines 271-279: Auth section preload
- Lines 281-339: Current route preload sections

---

### `src/router/index.js`

**Responsibilities**:
1. ✅ Load current section component during navigation (`loadRouteComponent`, lines 166-263)
2. ✅ Preload sections from `preLoadSections` after navigation (`afterEach`, lines 367-489)
3. ✅ Load translations for current section (line 424)
4. ✅ Load translations for preloaded sections (line 456)

**Required Imports**:
```javascript
import { preloadSection } from '../utils/section/sectionPreloader.js';
import { loadTranslationsForSection } from '../utils/translation/translationLoader.js';
import { resolveComponentPathForRoute } from '../utils/route/index.js';
```

**Critical Code Sections**:
- Lines 166-263: `loadRouteComponent()` - Loads current section
- Lines 367-489: `afterEach` hook - Preloads sections and translations

---

### `src/utils/section/sectionPreloader.js`

**Responsibilities**:
1. ✅ Preload section JS bundles (lines 89-92)
2. ✅ Preload section CSS bundles (lines 94-97)
3. ✅ Preload section assets (line 107)
4. ✅ Track preloaded sections to avoid duplicates (lines 22, 46, 100)
5. ✅ Track in-progress preloads to avoid duplicates (lines 19, 64, 71)

**Required Imports**:
```javascript
import { getSectionBundlePaths } from '../build/manifestLoader.js';
import { preloadSectionAssets } from '../assets/assetPreloader.js';
```

**Critical Code Sections**:
- Lines 31-151: `preloadSection()` - Main preload function
- Line 107: Asset preloading call

---

### `src/utils/assets/assetPreloader.js`

**Responsibilities**:
1. ✅ Preload individual assets (images, fonts, media, scripts)
2. ✅ Preload all assets for a section (`preloadSectionAssets`, lines 477-549)
3. ✅ Track preloaded assets to avoid duplicates

**Critical Code Sections**:
- Lines 477-549: `preloadSectionAssets()` - Preloads all assets for a section

---

### `src/router/routeConfig.json`

**Responsibilities**:
1. ✅ Define `preLoadSections` array for each route
2. ✅ Define `assetPreload` arrays for routes that need asset preloading
3. ✅ Define `section` for each route (current section)

**Example Structure**:
```json
{
  "slug": "/log-in",
  "section": "auth",
  "preLoadSections": ["dashboard", "shop"],
  "assetPreload": [
    {
      "src": "/media/logo.png",
      "type": "image",
      "priority": "high"
    }
  ]
}
```

---

## Complete Flow Diagrams

### App Startup Flow

```
1. main.js starts
   ↓
2. Initialize Pinia, I18n, Router
   ↓
3. router.isReady().then()
   ↓
4. ALWAYS preloadSection('auth') ← REQUIRED
   ↓
5. Get current route
   ↓
6. Extract preLoadSections from current route
   ↓
7. Preload each section in preLoadSections array
   ↓
8. Mount app
```

### Navigation Flow

```
1. User navigates to route
   ↓
2. router.beforeEach() - Run guards
   ↓
3. loadRouteComponent(route) - Load current section ← REQUIRED
   ↓
4. Navigation completes
   ↓
5. router.afterEach() - Post-navigation tasks
   ↓
6. Load translations for current section
   ↓
7. Extract preLoadSections from route config
   ↓
8. Preload each section in preLoadSections array
   ↓
9. Load translations for each preloaded section
```

### Section Preloading Flow

```
1. preloadSection(sectionName) called
   ↓
2. Check if already preloaded → return if yes
   ↓
3. Check if in progress → return if yes
   ↓
4. Mark as in progress
   ↓
5. Get bundle paths from manifest
   ↓
6. Preload JS bundle (modulepreload)
   ↓
7. Preload CSS bundle (preload)
   ↓
8. Mark as preloaded
   ↓
9. preloadSectionAssets(sectionName) ← Non-blocking
   ↓
10. Remove from in-progress
```

### Asset Preloading Flow

```
1. preloadSectionAssets(sectionName) called
   ↓
2. Get route configuration
   ↓
3. Find all routes in section
   ↓
4. Collect all assetPreload arrays
   ↓
5. Call preloadAssets(allAssets)
   ↓
6. Sort by priority
   ↓
7. Preload each asset in parallel
```

---

## Troubleshooting Checklist

### Auth Section Not Preloading

- [ ] Check `src/main.js` line 274: `preloadSection('auth')` is called
- [ ] Check `src/main.js` line 24: `preloadSection` is imported
- [ ] Check `router.isReady()` is awaited before calling preload
- [ ] Check console for errors in preload
- [ ] Verify `src/utils/section/sectionPreloader.js` exists and exports `preloadSection`

### PreLoadSections Not Working

- [ ] Check `src/router/routeConfig.json`: Route has `preLoadSections` array
- [ ] Check `src/router/index.js` line 409: Reading from `routeConfig.preLoadSections`
- [ ] Check `src/router/index.js` line 448: Calling `preloadSection()` for each section
- [ ] Check `router.afterEach` hook exists (line 367)
- [ ] Check route config is in `to.meta.routeConfig`
- [ ] Check `preloadExclude` is not `true` for the route
- [ ] Check console logs for preload errors

### Current Section Not Loading

- [ ] Check `src/router/index.js` line 74: Route uses `loadRouteComponent(route)`
- [ ] Check `src/router/index.js` line 166: `loadRouteComponent()` function exists
- [ ] Check `src/router/index.js` line 208: `findComponentLoader()` finds the component
- [ ] Check `src/router/index.js` line 112: `import.meta.glob` includes component paths
- [ ] Check component path in route config matches actual file location
- [ ] Check console for component loading errors

### Assets Not Preloading

- [ ] Check `src/utils/section/sectionPreloader.js` line 107: `preloadSectionAssets()` is called
- [ ] Check `src/utils/assets/assetPreloader.js` line 477: `preloadSectionAssets()` function exists
- [ ] Check route config has `assetPreload` arrays
- [ ] Check asset paths are correct
- [ ] Check console for asset preload errors

### Preloading Inconsistent

- [ ] Check `preloadedSections` Set is tracking correctly (line 22 in sectionPreloader.js)
- [ ] Check `preloadingInProgress` Set is tracking correctly (line 19 in sectionPreloader.js)
- [ ] Check sections are not being cleared unexpectedly
- [ ] Check for race conditions in parallel preloading
- [ ] Check console logs for preload status

---

## Common Issues and Fixes

### Issue: Auth section not preloading

**Symptoms**: Auth pages load slowly

**Fix**: Ensure `src/main.js` line 274 has:
```javascript
preloadSection('auth').catch(err => {
  log('main.js', 'init', 'preload-error', 'Default auth section preload failed (non-blocking)', { 
    section: 'auth',
    error: err.message 
  });
});
```

### Issue: PreLoadSections not working after navigation

**Symptoms**: Sections in `preLoadSections` not preloading

**Fix**: Ensure `src/router/index.js` `afterEach` hook:
1. Reads from `routeConfig.preLoadSections` (line 409)
2. Calls `preloadSection()` for each section (line 448)
3. Is not blocked by `preloadExclude` flag (line 391)

### Issue: Current section not loading

**Symptoms**: Route shows blank or error

**Fix**: Ensure:
1. `loadRouteComponent()` is async (line 166)
2. `findComponentLoader()` finds the component (line 208)
3. Component path in route config is correct
4. `import.meta.glob` includes the component path

### Issue: Assets not preloading

**Symptoms**: Images/fonts load slowly

**Fix**: Ensure:
1. `preloadSectionAssets()` is called in `preloadSection()` (line 107)
2. Routes have `assetPreload` arrays in config
3. Asset paths are correct and accessible

---

## Summary

### Critical Requirements

1. **Auth section MUST always be preloaded** in `src/main.js` line 274
2. **PreLoadSections MUST be read from route config** in `src/router/index.js` line 409
3. **PreLoadSections MUST be preloaded in afterEach** in `src/router/index.js` line 448
4. **Current section MUST be loaded** in `src/router/index.js` `loadRouteComponent()`
5. **Assets MUST be preloaded** when section is preloaded in `src/utils/section/sectionPreloader.js` line 107

### Key Files to Check

1. `src/main.js` - Auth preload and startup preloading
2. `src/router/index.js` - Current section loading and navigation preloading
3. `src/utils/section/sectionPreloader.js` - Section bundle preloading
4. `src/utils/assets/assetPreloader.js` - Asset preloading
5. `src/router/routeConfig.json` - Configuration

---

**Last Updated**: Based on current codebase analysis
**Version**: 1.0

