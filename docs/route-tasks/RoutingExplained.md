# Routing explained

**Last updated:** 2026-06-10  
**Audience:** Developers and AI agents working on navigation in this app.  
**Project:** `new-vue-app-main/`

| Section | Read this if you are… |
|---------|------------------------|
| [Developer guide](#developer-guide) | A human adding routes, debugging guards, or onboarding |
| [AI agent guide](#ai-agent-guide) | An agent editing routing code — follow constraints exactly |

**Related docs**

- Route JSON schema: [`new-vue-app-main/src/router/routeConfig.schema.md`](../new-vue-app-main/src/router/routeConfig.schema.md)
- Work plan (moves, renames, order): [route-work-master-plan.md](./route-work-master-plan.md)
- Code index: [route-code-index.md](./route-code-index.md)
- Naming audit: [route-naming-audit.md](./route-naming-audit.md)

---

# Developer guide

## What routing does

Every page URL is declared in **`src/router/routeConfig.json`**. At runtime the app:

1. Loads and validates that JSON.
2. Builds Vue Router records (with optional `/:locale?` prefix).
3. Runs guards on each navigation.
4. Lazy-loads the correct `.vue` file for the user's role.
5. Preloads section bundles and translations for the destination route.

You should **not** hard-code paths in `router/index.js`. Edit `routeConfig.json` instead.

## Folder layout (current)

```text
src/router/                    # Entry + config only (target: thin index.js)
  index.js                     # createRouter + hooks (orchestration — being slimmed)
  routeConfig.json             # All routes — single source of truth
  routeDefaults.json           # Fallback slugs (/404, /log-in, /dashboard)
  routeConfig.schema.md        # Field reference for routeConfig.json
  sharedAssetPreloads.json     # Asset catalog (planned move to config/ or systems/assets/)

src/systems/routing/           # Route logic (was src/utils/route/ — removed)
  index.js                     # Barrel export
  routeConfigLoader.js         # Load + validate + cache routeConfig
  routeResolver.js             # Path → route, component, inheritance
  routeGuards.js               # Guard pipeline
  routeNavigation.js           # Active route + history
  routeComponentLoader.js      # import.meta.glob map + findComponentLoader
  routeAliases.js              # Aliases, redirectFrom, locale paths
  navigationErrorHandler.js    # Chunk load recovery
  scrollBehavior.js            # Scroll on navigate
  routeTransition.js           # Transition names for App.vue
  navigationProgress.js        # Top progress bar state
  routeErrorBoundary.js        # Render error helpers (UI in RouteErrorBoundary.vue)
  … (see route-code-index for full list)

src/app/main.js                # Installs router, startup section preload
src/composables/               # useRoutePrefetch.js planned location
```

**Also involved (not in `systems/routing/`):**

- `systems/i18n/localeManager.js` — locale in URL, `registerLocaleRouter`
- `systems/i18n/hreflangTags.js` — SEO alternate links after navigation
- `systems/sections/sectionPreloadOrchestrator.js` — preload plan after navigate
- `systems/build/jsonConfigValidator.js` — `validateRouteConfig()` for build + runtime

## Adding a new route (checklist)

1. Add an entry to **`routeConfig.json`** with at least:
   - `slug` — e.g. `/my-page`
   - `section` — bundle name for JS/CSS/i18n
   - `componentPath` — e.g. `@/templates/my-feature/MyPage.vue`
   - `supportedRoles` — e.g. `["all"]` or `["creator"]`
   - `requiresAuth` — `true` / `false`
2. Create the `.vue` file under `src/templates/` or `src/components/` (must match glob in `routeComponentLoader.js`).
3. Run validation:
   ```bash
   npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js
   ```
4. Dev smoke: open the slug, test as guest and logged-in user, check role restrictions.
5. If the link appears in nav, add intent prefetch (`createRoutePrefetchIntentHandler`) on hover/focus.

## routeConfig.json — important fields

| Field | Purpose |
|-------|---------|
| `slug` | URL path (`/dashboard`, wildcards for 404) |
| `section` | String or `{ "creator": "dashboard-creator", … }` |
| `componentPath` | Default Vue file (`@/templates/...`) |
| `customComponentPath` | Per-role `componentPath` overrides |
| `requiresAuth` | Must be logged in |
| `supportedRoles` | Allowed roles; use `["all"]` for unrestricted |
| `redirectIfLoggedIn` | Auth pages → send logged-in users away |
| `redirectIfNotAuth` | Protected pages → send guests to login |
| `inheritConfigFromParent` | Merge parent route config (deep dashboards) |
| `preLoadSections` | Extra sections to warm after navigate |
| `enabled` | `false` = route **not registered** (direct URL → catch-all / 404) |
| `envAccess` | `"development"` = dev-only routes |
| `dependencies` | Onboarding / KYC gates per role |

Full schema: [`new-vue-app-main/src/router/routeConfig.schema.md`](../new-vue-app-main/src/router/routeConfig.schema.md).

## Guard pipeline (order matters)

Executed in `runAllRouteGuards()` (`systems/routing/routeGuards.js`), called from `router.beforeEach`:

1. Loop prevention — same slug repeated too often
2. Environment access — `envAccess: development` outside dev
3. Authentication — `requiresAuth`
4. Admin-only — `adminOnly`
5. Role — `supportedRoles`
6. Dependencies — onboarding, KYC, etc.

**Note:** `enabled: false` routes are **skipped at route generation**, not in guards.

Guard result shape today: `{ allow, redirectTo, reason }` (naming cleanup planned).

## Navigation lifecycle

```text
beforeEach
  → locale inject / temp locale (localeManager)
  → runAllRouteGuards
  → resolve meta.section for role

beforeResolve
  → startCurrentSectionResourceLoads (CSS, i18n, assets)

afterEach
  → setCurrentActiveRoute
  → syncHreflangTagsForPath
  → background section preloads (getRoutePreloadPlan)

onError
  → chunk load recovery → navigation error slug
```

## Component loading

Not inline `import()` in the route table:

1. `loadRouteComponent(route)` in `router/index.js`
2. `resolveComponentPathForRoute(route, role)` — role-aware path
3. `findComponentLoader(path)` — lookup in `import.meta.glob(['@/templates/**/*.vue', '@/components/**/*.vue'])`
4. Missing file → `NotFoundPage.vue`

## Using the router in Vue (pages / components)

Normal consumer usage — **not** route system code:

```js
import { useRouter, useRoute, RouterLink } from 'vue-router';

const router = useRouter();
const route = useRoute();

router.push('/dashboard');
```

For prefetch on nav hover:

```js
import { createRoutePrefetchIntentHandler } from '@/systems/routing/useRoutePrefetch.js';

const prefetchDashboard = createRoutePrefetchIntentHandler('/dashboard');
```

## Popup auth flow

`ProfileLoginPopup.vue` provides `popupNavHandler` (inject) to intercept `router.push` inside the popup. Maps paths to wizard steps instead of full navigation.

## Debugging

| Console / code | Use |
|----------------|-----|
| `getRouteConfiguration()` | See loaded config |
| `resolveRouteFromPath('/path')` | Match test |
| `getCurrentActivePath()` | Where navigation tracker thinks you are |
| `getNavigationHistory()` | Recent navigations |
| `resetRouteConfigurationCache()` | After editing JSON in dev |

Enable dev logs via existing `logHandler` output in router hooks.

## Validation commands

```bash
# Route config schema (production JSON)
npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js

# Route-related unit tests (fix imports if they still say utils/route)
npm run test:unit -- --run tests/unit/routeGuards.test.js
```

## Planned cleanup (see master plan)

- Slim `router/index.js` → `systems/routing/createAppRouter.js`
- Move `useRoutePrefetch.js` → `composables/`
- Move asset prefetch modules → `systems/assets/`
- Move `sharedAssetPreloads.json` out of `router/`
- Fix test imports `utils/route` → `systems/routing`
- Naming passes per `route-naming-audit.md`

---

# AI agent guide

## Hard rules

1. **Do not recreate `src/utils/route/`** — use `src/systems/routing/`.
2. **Do not add route paths in `router/index.js`** — only `routeConfig.json`.
3. **Do not import `routeConfig.json` from components** — use `getRouteConfiguration()` from `routeConfigLoader.js`.
4. **Do not put new route logic in `app/main.js`** — use `systems/routing/` or `systems/sections/`.
5. **Page components** live under `@/templates/**` (or `@/components/**`); paths must be in the glob map in `routeComponentLoader.js`.
6. **Tests** must import from `@/systems/routing/...`, not `@/utils/route/...`.
7. **Routing docs live in `Developer Tasks/RoutingExplained.md`** — do not add `README.md` under `src/router/` or `src/systems/routing/`.

## Canonical import map

| Need | Import from |
|------|-------------|
| Route config array | `@/systems/routing/routeConfigLoader.js` → `getRouteConfiguration()` |
| Resolve path | `@/systems/routing/routeResolver.js` → `resolveRouteFromPath` |
| Guards | `@/systems/routing/routeGuards.js` → `runAllRouteGuards` |
| Navigation state | `@/systems/routing/routeNavigation.js` |
| Prefetch on intent | `@/systems/routing/useRoutePrefetch.js` (moving to composables) |
| Router instance | `@/router/index.js` default export |
| Validate JSON | `@/systems/build/jsonConfigValidator.js` → `validateRouteConfig` |
| Component loader | `@/systems/routing/routeComponentLoader.js` → `findComponentLoader` |

## File ownership

| Change type | Edit here |
|-------------|-----------|
| New URL / auth / section | `src/router/routeConfig.json` |
| Guard rule | `systems/routing/routeGuards.js` |
| Path matching / inheritance | `systems/routing/routeResolver.js` |
| Locale in URL | `systems/i18n/localeManager.js` + hooks in `router/index.js` |
| Post-nav preload | `systems/sections/sectionPreloadOrchestrator.js` + `router.afterEach` |
| Build-time route validation | `systems/build/jsonConfigValidator.js`, `build/vite/sectionBundler.js` |
| Vue page UI | `src/templates/...` only |

## Stale references to fix if you touch tests/docs

- `@/utils/route/*` → `@/systems/routing/*`
- `@/utils/section/*` → `@/systems/sections/*`
- `src/utils/route/routeComponentLoader.js` → `src/systems/routing/routeComponentLoader.js`
- `createRoutePrefetchIntentHandler` from `routeComponentPrefetch.js` — prefer `useRoutePrefetch.js` barrel

## When editing `router/index.js`

Today it still contains: `generateRoutesFromConfig`, `loadRouteComponent`, `beforeEach` / `beforeResolve` / `afterEach`, locale injection. Target state is a one-line re-export of `createAppRouter` from `systems/routing/`. If you add logic, prefer a new module under `systems/routing/` and import it.

## `enabled: false` vs guards

Disabled routes are filtered in `generateRoutesFromConfig()` — they never get a Vue Router record. Do not add a separate "enabled guard" unless product requirements change.

## Doc maintenance checklist (agents)

After any routing refactor, update **this file** if you change:

- [ ] Folder paths or module names
- [ ] Guard order or result shape
- [ ] Import paths / barrel exports
- [ ] `routeConfig.json` required fields
- [ ] Component loading mechanism
- [ ] Links to master plan / audits

Run a quick grep for `utils/route` and `router/README` in `docs/` and `tests/` and fix stragglers.

## Audit reports (this folder)

| Report | Use when |
|--------|----------|
| [route-work-master-plan.md](./route-work-master-plan.md) | Order of moves, renames, PR phases |
| [route-code-index.md](./route-code-index.md) | Find every file/method touching routes |
| [route-naming-audit.md](./route-naming-audit.md) | Rename suggestions (filename / method / symbol) |
| [loose-route-code-scan.md](./loose-route-code-scan.md) | Code in wrong layer |
| [folder-structure-audit-router.md](./folder-structure-audit-router.md) | `router/` folder violations |
| [systems-routing-audit.md](./systems-routing-audit.md) | `systems/routing/` vs `notes.md` |

---

*End of RoutingExplained.md*
