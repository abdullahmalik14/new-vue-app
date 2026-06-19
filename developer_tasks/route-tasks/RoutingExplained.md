# Routing explained

**Last updated:** 2026-06-16  
**Audience:** Developers and AI agents working on navigation in this app.

| Section | Read this if you are… |
|---------|------------------------|
| [Developer guide](#developer-guide) | A human adding routes, debugging guards, or onboarding |
| [AI agent guide](#ai-agent-guide) | An agent editing routing code — follow constraints exactly |

**Related docs**

- Route JSON schema: [`src/router/routeConfig.schema.md`](../../src/router/routeConfig.schema.md)
- Refactor changelog: [route-cleanup-changelog.md](./route-cleanup-changelog.md)
- Work plan (Phases 1–7): [route-work-master-plan.md](./route-work-master-plan.md)
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
src/router/                         # Entry + config only
  index.js                          # Thin re-export of createAppRouter + prefetch exports
  routeConfig.json                  # All routes — single source of truth
  routeDefaults.json                # Fallback slugs (/404, /log-in, /dashboard)
  routeConfig.schema.md             # Field reference for routeConfig.json

src/config/
  sharedAssetPreloads.json          # Shared asset preload catalog (referenced by route config)

src/systems/routing/                # Route logic (was src/utils/route/ — removed)
  createAppRouter.js                # Router factory, hooks, route generation
  routeConfigLoader.js              # Load + validate + cache routeConfig
  routeResolver.js                  # Path → route, component, inheritance
  routeGuards.js                    # Guard pipeline
  routeNavigation.js                # Active route + history
  routeComponentLoader.js           # import.meta.glob map + findComponentLoader
  routeAliasResolver.js             # Aliases, redirectFrom, locale paths
  routeComponentPreloader.js        # Component module prefetch
  routeNavigationResourceLoader.js  # Current-section CSS/i18n/asset loads
  navigationErrorHandler.js         # Chunk load recovery
  scrollBehavior.js                 # Scroll on navigate
  routeTransition.js                # Transition names for App.vue
  navigationProgressTracker.js        # Top progress bar state
  routeErrorBoundary.js             # Render error helpers
  index.js                          # Barrel export
  … (see route-code-index.md for full list)

src/systems/assets/                 # Route asset preload (moved from systems/routing/)
  routeAssetPreloader.js
  routeAssetPreloadResolver.js
  routeSectionAssetPreloadEntries.js

src/composables/
  useRoutePrefetch.js               # Combined component + section prefetch intent API

src/dev/templates/                  # Route page templates (componentPath prefix @/dev/templates/…)
  auth/page/*Page.vue               # Thin route wrappers
  auth/views/Auth*.vue              # Auth screen compositions (popup-embeddable)
  dev/                              # Dev/demo/showcase pages
  dashboard/shared/                 # Shared dashboard pages (analytics, edit-profile, …)

src/app/main.js                     # Installs router, startup section preload
```

**Also involved (not in `systems/routing/`):**

- `systems/i18n/localeManager.js` — locale in URL, `registerLocaleRouter`
- `systems/i18n/routeHreflangTags.js` — SEO alternate links after navigation
- `systems/sections/sectionPreloadOrchestrator.js` — preload plan after navigate
- `systems/build/jsonConfigValidator.js` — `validateRouteConfig()` for build + runtime

## Adding a new route (checklist)

1. Add an entry to **`routeConfig.json`** with at least:
   - `slug` — e.g. `/my-page`
   - `section` — bundle name for JS/CSS/i18n
   - `componentPath` — e.g. `@/dev/templates/my-feature/MyPage.vue`
   - `supportedRoles` — e.g. `["all"]` or `["creator"]`
   - `requiresAuth` — `true` / `false`
2. Create the `.vue` file under `src/dev/templates/` (must match glob in `routeComponentLoader.js`: `@/dev/**/*.vue`).
3. Run validation:
   ```bash
   npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js
   npm run test:unit -- --run tests/unit/routeComponentPathValidator.test.js
   ```
4. Dev smoke: open the slug, test as guest and logged-in user, check role restrictions.
5. If the link appears in nav, add intent prefetch on hover/focus:
   ```js
   import { createRoutePrefetchIntentHandler } from '@/composables/useRoutePrefetch.js';
   ```

## routeConfig.json — important fields

| Field | Purpose |
|-------|---------|
| `slug` | URL path (`/dashboard`, wildcards for 404) |
| `section` | String or `{ "creator": "dashboard-creator", … }` |
| `componentPath` | Default Vue file (`@/dev/templates/...`) |
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

Full schema: [`src/router/routeConfig.schema.md`](../../src/router/routeConfig.schema.md).

## Guard pipeline (order matters)

Executed in `runAllRouteGuards()` (`systems/routing/routeGuards.js`), called from `createAppRouter.js` `beforeEach`:

1. Loop prevention — same slug repeated too often
2. Environment access — `envAccess: development` outside dev
3. Authentication — `requiresAuth`
4. Admin-only — `adminOnly`
5. Role — `supportedRoles` (`guardCheckRouteUserRole`)
6. Dependencies — onboarding, KYC, etc.

**Note:** `enabled: false` routes are **skipped at route generation** (`buildVueRouterRecordsFromConfiguration`), not in guards.

Guard result shape:

```js
{ isNavigationAllowed, redirectTargetPath, blockReason }
```

## Navigation lifecycle

```text
beforeEach
  → locale inject / temp locale (localeManager)
  → runAllRouteGuards
  → resolve meta.section for role

beforeResolve
  → loadCurrentSectionResources (CSS, i18n, assets)

afterEach
  → setCurrentActiveRoute
  → syncHreflangTagsForPath (routeHreflangTags.js)
  → background section preloads (getRoutePreloadPlan)

onError
  → chunk load recovery → navigation error slug
```

## Component loading

Not inline `import()` in the route table:

1. `loadRouteComponentViaGlob(route, role)` in `createAppRouter.js`
2. `resolveComponentPathForRoute(route, role)` — role-aware path
3. `findComponentLoader(path)` — lookup in `import.meta.glob(['@/components/**/*.vue', '@/dev/**/*.vue'])`
4. Missing file → `NotFoundPage.vue`

Route pages live under **`@/dev/templates/`**. Reusable widgets stay under `@/components/` but should not be registered as `componentPath` targets.

## Using the router in Vue (pages / components)

```js
import { useRouter, useRoute, RouterLink } from 'vue-router';

const router = useRouter();
const route = useRoute();

router.push('/dashboard');
```

For prefetch on nav hover:

```js
import { createRoutePrefetchIntentHandler } from '@/composables/useRoutePrefetch.js';

const prefetchDashboard = createRoutePrefetchIntentHandler('/dashboard');
```

## Popup auth flow

When `ProfileLoginPopup.vue` is present, it provides `popupRouteNavigationHandler` (inject) to intercept navigation inside the popup. Auth **screen** views live in `dev/templates/auth/views/Auth*.vue` (not the `*Page.vue` wrappers with `AuthLayout`).

## Debugging

| Console / code | Use |
|----------------|-----|
| `getRouteConfiguration()` | See loaded config |
| `resolveRouteFromPath('/path')` | Match test |
| `getCurrentActivePath()` | Where navigation tracker thinks you are |
| `getNavigationHistory()` | Recent navigations |
| `resetRouteConfigurationCache()` | After editing JSON in dev |

Enable dev logs via `logHandler` output in router hooks.

## Validation commands

```bash
# Route config schema (production JSON)
npm run test:unit -- --run tests/unit/jsonConfigValidator.test.js

# Component paths resolve on disk
npm run test:unit -- --run tests/unit/routeComponentPathValidator.test.js

# Guards, resolver, prefetch
npm run test:unit -- --run tests/unit/routeGuards.test.js
npm run test:unit -- --run tests/unit/routeComponentPrefetch.test.js
```

## Completed refactor (Phases 1–6)

See [route-cleanup-changelog.md](./route-cleanup-changelog.md) for detail. Summary:

- **Phase 1:** Test imports `utils/route` → `systems/routing`
- **Phase 2:** Slim `router/index.js`; `createAppRouter.js`; asset catalog → `config/`; prefetch → `composables/` and `systems/assets/`
- **Phase 3–4:** Module/symbol renames per naming audit
- **Phase 5:** Auth route pages use `*Page.vue`; tests aligned to `@/dev/templates/`
- **Phase 6:** Template files moved to canonical folders (`dev/`, `dashboard/shared/`, `misc/`); `/home` config completed

---

# AI agent guide

## Hard rules

1. **Do not recreate `src/utils/route/`** — use `src/systems/routing/`.
2. **Do not add route paths in `router/index.js`** — only `routeConfig.json`.
3. **Do not import `routeConfig.json` from components** — use `getRouteConfiguration()` from `routeConfigLoader.js`.
4. **Do not put new route logic in `app/main.js`** — use `systems/routing/` or `systems/sections/`.
5. **Route `componentPath` targets** must live under `@/dev/templates/…` and match the glob in `routeComponentLoader.js`.
6. **Tests** must import from `@/systems/routing/...`, not `@/utils/route/...`.
7. **Routing docs live only in this file** — do not add `README.md` under `src/router/` or `src/systems/routing/`.
8. **Preload must not block navigation** — background cache-warming only; lazy load remains the fallback.

## Canonical import map

| Need | Import from |
|------|-------------|
| Route config array | `@/systems/routing/routeConfigLoader.js` → `getRouteConfiguration()` |
| Resolve path | `@/systems/routing/routeResolver.js` → `resolveRouteFromPath` |
| Guards | `@/systems/routing/routeGuards.js` → `runAllRouteGuards` |
| Navigation state | `@/systems/routing/routeNavigation.js` |
| Prefetch on intent | `@/composables/useRoutePrefetch.js` → `createRoutePrefetchIntentHandler` |
| Router instance | `@/router/index.js` default export |
| Validate JSON | `@/systems/build/jsonConfigValidator.js` → `validateRouteConfig` |
| Component loader | `@/systems/routing/routeComponentLoader.js` → `findComponentLoader` |
| Section preload plan | `@/systems/sections/sectionPreloadOrchestrator.js` → `getRoutePreloadPlan` |
| Asset preload | `@/systems/assets/routeAssetPreloader.js` |

## File ownership

| Change type | Edit here |
|-------------|-----------|
| New URL / auth / section | `src/router/routeConfig.json` |
| Guard rule | `systems/routing/routeGuards.js` |
| Path matching / inheritance | `systems/routing/routeResolver.js` |
| Locale in URL | `systems/i18n/localeManager.js` + hooks in `createAppRouter.js` |
| Post-nav preload | `systems/sections/sectionPreloadOrchestrator.js` + `afterEach` |
| Build-time route validation | `systems/build/jsonConfigValidator.js`, `build/vite/sectionBundler.js` |
| Vue route page UI | `src/dev/templates/...` |
| Auth screen (popup-capable) | `src/dev/templates/auth/views/Auth*.vue` |

## Stale references to fix if you touch tests/docs

- `@/utils/route/*` → `@/systems/routing/*`
- `@/utils/section/*` → `@/systems/sections/*`
- `@/templates/...` in `componentPath` → `@/dev/templates/...`
- `hreflangTags.js` → `routeHreflangTags.js`
- `routeAliases.js` → `routeAliasResolver.js`
- Guard result `{ allow, redirectTo }` → `{ isNavigationAllowed, redirectTargetPath }`
- `popupNavHandler` → `popupRouteNavigationHandler`

## When editing routing code

Orchestration lives in **`systems/routing/createAppRouter.js`**. `router/index.js` is a thin re-export. Add new logic in a dedicated module under `systems/routing/` (or `systems/sections/` / `systems/assets/`) and import it.

## `enabled: false` vs guards

Disabled routes are filtered in `buildVueRouterRecordsFromConfiguration()` — they never get a Vue Router record. Do not add a separate "enabled guard".

## Doc maintenance checklist (agents)

After any routing refactor, update **this file** if you change:

- [ ] Folder paths or module names
- [ ] Guard order or result shape
- [ ] Import paths / barrel exports
- [ ] `routeConfig.json` required fields
- [ ] Component loading glob paths
- [ ] Links to master plan / audits

Run:

```bash
rg "utils/route" docs/route-tasks/ tests/ src/router/ src/systems/routing/
rg "router/README|routing/README" src/
```

Fix stragglers in active docs; add a historical banner in archived docs if needed.

## Audit reports (this folder)

| Report | Use when |
|--------|----------|
| [route-work-master-plan.md](./route-work-master-plan.md) | Order of moves, renames, PR phases |
| [route-code-index.md](./route-code-index.md) | Find every file/method touching routes |
| [route-naming-audit.md](./route-naming-audit.md) | Rename suggestions (filename / method / symbol) |
| [loose-route-code-scan.md](./loose-route-code-scan.md) | Code in wrong layer |
| [folder-structure-audit-router.md](./folder-structure-audit-router.md) | `router/` folder violations |
| [systems-routing-audit.md](./systems-routing-audit.md) | `systems/routing/` structure |

---

*End of RoutingExplained.md*
