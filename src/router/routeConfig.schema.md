# RouteConfig.json Schema Documentation

## Overview

This document describes the structure of `routeConfig.json` - the single source of truth for routing, sections, and manifest generation in the application.

## Required Fields

### `slug` (string)
The URL path for this route. Examples: "/log-in", "/dashboard", "/profile"

### `section` (string | object)
Section identifier for bundling. **Required** on navigable routes (those with `componentPath` or `customComponentPath`). Omit only for `redirect`-only routes and catch-all patterns (e.g. `/:pathMatch(.*)*`).

Can be:
- **String**: Simple section name (e.g., "auth", "dashboard-global")
- **Object**: Role-based sections (e.g., `{ "creator": "dashboard-creator", "fan": "dashboard-fan" }`)

### `componentPath` (string)
Path to the Vue component using @ alias. Example: "@/components/auth/AuthLogIn.vue"

## Common Optional Fields

### `requiresAuth` (boolean)
Whether route requires authentication. Default: false

### `enabled` (boolean)
Whether route is active. Default: true

When `enabled: false`:
- The route is **not registered** in Vue Router (`generateRoutesFromConfig` skips it).
- Direct navigation (e.g. `/about`) matches the catch-all route and redirects to `/404`.
- Guards do **not** evaluate `enabled` — route omission is the only enforcement (see audit B3).
- Keep disabled entries in config to preserve slug/component metadata for future re-enable.

### `envAccess` (string)
Restricts route availability by build environment. Default: `"all"` (omitted = all environments).

- `"all"` — available in development, staging, and production
- `"development"` — registered and navigable only when `import.meta.env.DEV` is true (local dev). Production/staging builds skip route registration and return 404.

Use `"development"` for dev/demo/showcase routes that must not ship to production.

### `adminOnly` (boolean)
When `true`, only admin users may access the route (enforced in `guardCheckRouteAdminAccess` after auth).

Admin is detected from navigation context:
- `userProfile.isAdmin === true`, or
- `userProfile.role === "admin"` / `userRole === "admin"`

Non-admins are redirected to `/404`. Combine with `requiresAuth: true` for protected admin tools.

Example:
```json
"slug": "/internal/tools",
"requiresAuth": true,
"adminOnly": true,
"supportedRoles": ["all"]
```

### `supportedRoles` (string[], required on navigable routes)
Roles allowed to access this route.

**Convention (B4):**
- Use `["all"]` when any role (including guests) may access the route.
- Use a role list for restricted routes, e.g. `["creator"]`, `["creator", "fan"]`.
- Do **not** use `[]`, omit the field, or use `"any"` — build validation rejects these on routes with a component.

Redirect-only entries (e.g. catch-all `redirect` without `componentPath`) may omit `supportedRoles`.

Examples: `["all"]`, `["creator"]`, `["creator", "fan"]`

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

### `transition` (string | object | false)
Page transition when navigating to this route. Default: `"route-fade"` (subtle opacity fade).

**String presets:**
- `"route-fade"` or `"fade"` — opacity fade (default when omitted)
- `"route-slide-fade"` or `"slide-fade"` — fade with slight vertical slide
- `"none"` or `false` — disable route transition (e.g. OAuth callbacks)

**Object** (advanced):
```json
"transition": {
  "name": "route-slide-fade",
  "mode": "out-in"
}
```

Inherited from parent when `inheritConfigFromParent: true` unless overridden on the child route.

### `aliases` (string[])
Alternative URL paths that render the **same route** without changing the address bar. Locale-aware: each alias works with and without a locale prefix (same as `slug`).

Example — `/home` serves the same page as `/dashboard`:
```json
"slug": "/dashboard",
"aliases": ["/home"]
```

### `redirectFrom` (string | string[])
Legacy URL paths that **redirect** to this route's canonical `slug` (browser URL updates). Use for old paths such as `/login` → `/log-in`.

Example:
```json
"slug": "/log-in",
"redirectFrom": ["/login"]
```

Do not reuse the same path in both `aliases` and `redirectFrom` on one route, or across different routes.

### `componentPath` validation (M10)
At **dev startup** and **Vite build**, all `componentPath` and `customComponentPath.*.componentPath` values are validated:
- Must use `@/` alias and end with `.vue`
- Must live under `src/templates/` or `src/components/`
- Must resolve via router `import.meta.glob` (dev) or exist on disk (build)

Misspelled paths fail fast during `npm run dev` / `npm run build` instead of only when navigating to the route.

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
- Routes can be disabled via `enabled: false` without removing them from config (excluded at route generation, not via guards)

