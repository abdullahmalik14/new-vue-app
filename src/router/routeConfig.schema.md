# RouteConfig.json Schema Documentation

## Overview

This document describes the structure of `routeConfig.json` - the single source of truth for routing, sections, and manifest generation in the application.

## Required Fields

### `slug` (string)
The URL path for this route. Examples: "/log-in", "/dashboard", "/profile"

### `section` (string | object)
Section identifier for bundling. Can be:
- **String**: Simple section name (e.g., "auth", "dashboard-global")
- **Object**: Role-based sections (e.g., `{ "creator": "dashboard-creator", "fan": "dashboard-fan" }`)

### `componentPath` (string)
Path to the Vue component using @ alias. Example: "@/components/auth/AuthLogIn.vue"

## Common Optional Fields

### `requiresAuth` (boolean)
Whether route requires authentication. Default: false

### `enabled` (boolean)
Whether route is active. Disabled routes return 404. Default: true

### `supportedRoles` (string[])
User roles that can access this route. Examples: ["creator"], ["all"], ["creator", "fan"]

### `redirectIfLoggedIn` (string)
Redirect authenticated users to this path. Used for login/signup pages.

### `redirectIfNotAuth` (string)
Redirect unauthenticated users to this path. Used for protected pages.

### `inheritConfigFromParent` (boolean)
Inherit configuration from parent route (based on slug hierarchy). Default: false

### `dependencies` (object)
User state requirements for accessing route. Example:
```json
{
  "roles": {
    "creator": {
      "kycPassed": {
        "required": true,
        "fallbackSlug": "/sign-up/onboarding/kyc"
      }
    }
  }
}
```

### `customComponentPath` (object)
Role-specific component overrides. Example:
```json
{
  "creator": {
    "componentPath": "@/components/dashboard/DashboardCreator.vue"
  },
  "fan": {
    "componentPath": "@/components/dashboard/DashboardFan.vue"
  }
}
```

## Manifest & Build Fields (New)

### `preLoadSections` (string[])
Sections to preload when navigating to this route. These sections will be downloaded eagerly.
```json
"preLoadSections": ["dashboard", "shop"]
```

### `assetPreload` (object[])
Assets to preload for this route. Example:
```json
"assetPreload": [
  { "url": "/images/hero.webp", "type": "image", "priority": "high" },
  { "url": "/fonts/custom.woff2", "type": "font" },
  { "url": "/scripts/analytics.js", "type": "script" }
]
```

### `cssBundle` (boolean)
Whether to generate a dedicated CSS bundle for this route's section. Default: true

### `preloadExclude` (boolean)
Whether to exclude this route from section preloading entirely. Default: false
Routes with preloadExclude: true will not be preloaded during navigation, even if they belong to a section that is normally preloaded.

### `manifestMeta` (object)
Additional metadata for manifest generation. Example:
```json
"manifestMeta": {
  "version": "1.2.0",
  "priority": "high",
  "dependencies": ["auth", "i18n-core"],
  "cacheDuration": 7200000
}
```

## Full Example Route

```json
{
  "slug": "/dashboard/overview",
  "section": {
    "creator": "dashboard-creator",
    "fan": "dashboard-fan"
  },
  "requiresAuth": true,
  "enabled": true,
  "supportedRoles": ["creator", "fan"],
  "redirectIfNotAuth": "/log-in",
  "inheritConfigFromParent": true,
  "customComponentPath": {
    "creator": {
      "componentPath": "@/components/dashboard/DashboardOverviewCreator.vue"
    },
    "fan": {
      "componentPath": "@/components/dashboard/DashboardOverviewFan.vue"
    }
  },
  "preLoadSections": ["shop", "profile"],
  "assetPreload": [
    { "url": "/images/dashboard-bg.webp", "type": "image", "priority": "high" }
  ],
  "cssBundle": true,
  "manifestMeta": {
    "version": "1.0.0",
    "priority": "high",
    "cacheDuration": 3600000
  },
  "dependencies": {
    "roles": {
      "creator": {
        "onboardingPassed": {
          "required": true,
          "fallbackSlug": "/sign-up/onboarding"
        }
      }
    }
  }
}
```

## Notes

- All manifest fields (`assetPreload`, `cssBundle`, `manifestMeta`) are optional
- If not specified, defaults from `build/buildConfig.js` are used
- The `section` field drives bundle generation - all routes with same section are bundled together
- Routes can be disabled via `enabled: false` without removing them from config

