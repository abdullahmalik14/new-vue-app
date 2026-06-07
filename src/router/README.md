# Router Configuration

## Overview
Single source of truth for routing, sections, bundling, and manifest generation. **Everything** is driven by routeConfig.json.

## Files

### routeConfig.json
**Purpose**: Define all routes, sections, permissions, and bundle configuration

**CRITICAL**: This is the **ONLY** place where sections are defined. Never define sections anywhere else in the codebase.

**Structure**:
```json
[
  {
    "slug": "/dashboard",
    "section": "dashboard-global",
    "componentPath": "@/templates/dashboard/role/DashboardDevPlaygroundPage.vue",
    "requiresAuth": true,
    "enabled": true,
    "supportedRoles": ["all"],
    "redirectIfNotAuth": "/log-in",
    "preLoadSections": ["shop"],
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
]
```

**Required Fields**:
- `slug` - URL path
- `section` - Section name (string or role object); required on navigable routes — omit only for redirect-only / catch-all entries
- `componentPath` - Path to Vue component (or use `customComponentPath`; omit for redirect-only routes)

**Optional Fields**:
- `requiresAuth` - Requires authentication (default: false)
- `enabled` - Route is active (default: true)
- `supportedRoles` - Array of allowed roles
- `redirectIfLoggedIn` - Redirect authenticated users
- `redirectIfNotAuth` - Redirect unauthenticated users
- `inheritConfigFromParent` - Inherit from parent route
- `customComponentPath` - Role-specific components
- `preLoadSections` - Sections to preload
- `dependencies` - Required user state (onboarding, KYC, etc.)
- `assetPreload` - Assets to preload (future use)
- `cssBundle` - Generate CSS bundle (default: true)
- `manifestMeta` - Manifest metadata (priority, version, etc.)

**Section Types**:

**Simple String**:
```json
"section": "auth"
```
All users see same components.

**Role-Based Object**:
```json
"section": {
  "creator": "dashboard-creator",
  "fan": "dashboard-fan",
  "agent": "dashboard-agent",
  "vendor": "dashboard-vendor"
}
```
Different components/bundles per role.

**Component Path Variants**:

**Simple**:
```json
"componentPath": "@/templates/auth/page/role/LoginPage.vue"
```

**Role-Specific**:
```json
"customComponentPath": {
  "creator": {
    "componentPath": "@/templates/dashboard/creator/CreatorDashboardCouponsPage.vue"
  },
  "fan": {
    "componentPath": "@/templates/dashboard/fan/FanDashboardCouponsPage.vue"
  }
}
```

*(Illustrative — use paths that exist under `src/templates/` or `src/components/`.)*

**Path convention:** Page-level route components live under `@/templates/**` (matches production `routeConfig.json`). Shared UI pieces may use `@/components/**`. Always use the `@/` alias; paths must resolve via the router's pre-loaded `import.meta.glob` map (`src/router/index.js`).

---

### routeConfig.schema.md
**Purpose**: Full documentation of routeConfig.json structure

See this file for complete field descriptions, examples, and validation rules.

---

### index.js
**Purpose**: Vue Router setup with dynamic route generation

**How it works**:
1. Loads routeConfig.json
2. Generates Vue Router routes dynamically
3. Applies guards in beforeEach hook
4. Tracks navigation with performance tracker
5. Updates navigation state in afterEach

**Route Generation**:
```javascript
// routeConfig.json entry (source of truth)
{
  "slug": "/dashboard",
  "section": "dashboard-global",
  "componentPath": "@/templates/dashboard/role/DashboardDevPlaygroundPage.vue",
  "requiresAuth": true
}

// Generated Vue Router route (see generateRoutesFromConfig in index.js)
{
  path: '/:locale?/dashboard',           // optional locale prefix
  name: '/dashboard',
  component: () => loadRouteComponent(route),  // NOT inline import('...')
  meta: {
    routeConfig: { /* full config object */ },
    section: 'dashboard-global',
    requiresAuth: true,
    enabled: true
  }
}
```

**Component loading (not inline `import()`):**
1. `loadRouteComponent(route)` resolves `componentPath` / `customComponentPath` via `resolveComponentPathForRoute()` (role-aware).
2. `findComponentLoader()` in `src/utils/route/routeComponentLoader.js` looks up a pre-registered lazy loader from:
   ```javascript
   import.meta.glob(['@/templates/**/*.vue', '@/components/**/*.vue'], { eager: false })
   ```
3. The glob loader is invoked; if the path is missing from the map, navigation falls back to the 404 component (no filename-only matching — see B-06).

To add a routable page: set `componentPath` in `routeConfig.json` and place the `.vue` file under `src/templates/` or `src/components/` so it is included in the glob above.

**Navigation Flow**:
```
1. User clicks link to /dashboard
   ↓
2. router.beforeEach() hook
   → Get route config from meta
   → Build guard context (user, role, profile)
   → Run all route guards
   → If allowed: next()
   → If blocked: next(redirectTo)
   ↓
3. Component loads via `loadRouteComponent` → `import.meta.glob` lookup (lazy)
   ↓
4. router.afterEach() hook
   → Update active route
   → Track navigation completion
```

**Development Rules**:
- Never manually define routes - always generate from config
- Track all navigation with performance tracker
- Log guard results (allow/block with reason)
- Update navigation state on completion
- Handle navigation errors gracefully

---

## Integration

### What Uses This
- **Router** (`src/router/index.js`) - Route generation
- **Build System** (`build/`) - Section discovery, bundling
- **Tailwind** (`tailwind.config.js`) - Component path scanning
- **Section System** (`src/utils/section/`) - Section resolution
- **Guards** (`src/utils/route/routeGuards.js`) - Permission checks
- **Manifest** (`build/vite/manifestGenerator.js`) - Metadata enrichment

### What It Depends On
- Nothing - this is the root configuration

## Development Rules

1. **Single Source of Truth**: ONLY place to define sections
2. **Never Hardcode Sections**: Extract dynamically from this file
3. **Validate Before Build**: Run `validateRouteConfig()` on the full `routeConfig.json` array (same validator as runtime loader)
4. **Section Naming**: Use descriptive names (auth, dashboard-global, etc.)
5. **Role Consistency**: Use same role names everywhere (creator, fan, agent, vendor)
6. **Component Paths**: Use `@/` alias; page routes typically under `@/templates/**` (some routes use `@/components/**`). File must exist and be discoverable by the router glob loader.
7. **PreLoad Wisely**: Only preload frequently accessed sections
8. **Dependencies**: Document required user state clearly

## Testing

### Validate Route Config

Runtime loader (`routeConfigLoader.js`) and build plugins validate the **full route array** via `validateRouteConfig()` in `src/utils/build/jsonConfigValidator.js` — not the legacy per-route helper in `build/buildConfig.js`.

```javascript
import { validateRouteConfig } from '../utils/build/jsonConfigValidator.js';
import routeConfig from './routeConfig.json';

const result = validateRouteConfig(routeConfig);

if (!result.valid) {
  console.error('Route config validation failed:', result.errors);
}

if (result.warnings?.length) {
  console.warn('Route config warnings:', result.warnings);
}
```

Or run the unit suite (includes production `routeConfig.json`):

```bash
npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js
```

### Test Route Generation
```bash
npm run dev
# Navigate to different routes
# Check console for route resolution logs
```

### Test Section Discovery
```javascript
import { extractAllSectionsFromRouteConfig } from '../../build/buildConfig.js';
import routeConfig from './routeConfig.json';

const sections = extractAllSectionsFromRouteConfig(routeConfig);
console.log('Sections:', Array.from(sections));
// Should include: auth, dashboard-global, dashboard-creator, misc, shop, etc.
```

## Checklist for New Routes

- [ ] Unique slug (no duplicates)
- [ ] Section defined (existing or new)
- [ ] Component exists at componentPath
- [ ] Auth requirements correct (requiresAuth, redirects)
- [ ] Roles specified if needed
- [ ] Dependencies documented
- [ ] High-traffic nav links use `@mouseenter` / `@focus` intent prefetch where snappy navigation matters
- [ ] PreLoad sections chosen wisely
- [ ] Translations created if new section
- [ ] Test route access for all roles

## Section Best Practices

**Keep Sections Focused**:
- One section per major feature area
- Split large sections by role if needed
- Aim for < 300 KB per section bundle

**Section Naming**:
```
{feature}              // Simple section
{feature}-global       // Shared by all roles
{feature}-{role}       // Role-specific
```

**Examples**:
```
auth                    // Authentication (all users)
dashboard-global        // Base dashboard (all users)
dashboard-creator       // Creator dashboard
dashboard-fan           // Fan dashboard
shop                    // Shopping (all users)
misc                    // Utility routes (404, etc.)
```

## Common Patterns

### Public Route
```json
{
  "slug": "/about",
  "section": "about",
  "componentPath": "@/templates/about/AboutPage.vue",
  "requiresAuth": false,
  "supportedRoles": []
}
```

### Protected Route
```json
{
  "slug": "/dashboard",
  "section": "dashboard-global",
  "componentPath": "@/templates/dashboard/role/DashboardDevPlaygroundPage.vue",
  "requiresAuth": true,
  "redirectIfNotAuth": "/log-in",
  "supportedRoles": ["all"]
}
```

### Role-Specific Route
```json
{
  "slug": "/dashboard/overview",
  "section": {
    "creator": "dashboard-creator"
  },
  "inheritConfigFromParent": true,
  "supportedRoles": ["creator"],
  "componentPath": "@/templates/dashboard/creator/CreatorDashboardOverviewPage.vue"
}
```

### With Dependencies
```json
{
  "slug": "/dashboard",
  "section": "dashboard-global",
  "componentPath": "@/templates/dashboard/role/DashboardDevPlaygroundPage.vue",
  "requiresAuth": true,
  "dependencies": {
    "roles": {
      "creator": {
        "onboardingPassed": {
          "required": true,
          "fallbackSlug": "/sign-up/onboarding"
        },
        "kycPassed": {
          "required": true,
          "fallbackSlug": "/sign-up/onboarding/kyc"
        }
      }
    }
  }
}
```

### With Preloading
```json
{
  "slug": "/log-in",
  "section": "auth",
  "componentPath": "@/templates/auth/page/role/LoginPage.vue",
  "requiresAuth": false,
  "redirectIfLoggedIn": "/dashboard",
  "preLoadSections": ["dashboard", "shop"]
}
```

### Intent-based component prefetch (P10)
Section preload warms JS/CSS bundles; component `.vue` modules can be warmed on hover/focus before navigation:

```vue
<script setup>
import { createRoutePrefetchIntentHandler } from '@/utils/route/routeComponentPrefetch.js';

const prefetchShop = createRoutePrefetchIntentHandler('/shop');
</script>

<RouterLink to="/shop" @mouseenter="prefetchShop" @focus="prefetchShop">Shop</RouterLink>
```

Or `useRoutePrefetch()` from `@/utils/route/useRoutePrefetch.js`. Prefetch is non-blocking and does not run route guards.

## Troubleshooting

**Route not working**: Check slug is unique, component exists

**404 errors**: Verify componentPath points to existing file

**Guard blocking**: Check requiresAuth, supportedRoles, dependencies

**Wrong component loading**: Check customComponentPath for role

**Section not bundling**: Verify section name matches exactly in all routes

**PreLoad not working**: Check section name in preLoadSections array

