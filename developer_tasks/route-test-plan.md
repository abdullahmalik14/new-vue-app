# Route test plan (Vitest)

**Date:** 2026-06-10  
**Status:** Planning only — implement after routing refactor stabilizes (see `route-work-master-plan.md`).  
**Runner:** Vitest (`npm run test:unit`) — one line below = one `it('…', () => {})` test case.  
**Coverage goal:** Every exported symbol in routing modules + router entry hooks + route-coupled cross-system utilities.

**Suggested test file layout** (mirror `tests/unit/`):

| File | Module under test |
|------|-------------------|
| `routeConfigLoader.test.js` | `routeConfigLoader.js` |
| `routeResolver.test.js` | `routeResolver.js` |
| `routeInheritance.test.js` | inheritance + effective config (resolver + orchestrator) |
| `routeGuards.test.js` | full guard chain |
| `routeGuards.loop.test.js` | loop prevention + redirect markers |
| `routeGuards.auth.test.js` | authentication guard |
| `routeGuards.role.test.js` | role guard |
| `routeGuards.dependencies.test.js` | dependency conditions |
| `routeGuards.env.test.js` | environment access |
| `routeGuards.admin.test.js` | admin-only |
| `routeAliases.test.js` | `routeAliasResolver.js` |
| `routeNavigation.test.js` | `routeNavigation.js` |
| `routeNavigationData.test.js` | `routeNavigationResourceLoader.js` |
| `routeComponentLoader.test.js` | `routeComponentLoader.js` |
| `routeComponentPathValidator.test.js` | validators |
| `routeComponentPrefetch.test.js` | `routeComponentPreloader.js` |
| `routeAssetPrefetch.test.js` | `routeAssetPreloader.js` |
| `resolveRouteAssetPreloads.test.js` | `routeAssetPreloadResolver.js` |
| `useRoutePrefetch.test.js` | `useRoutePrefetch.js` |
| `routeDefaults.test.js` | `routeDefaults.js` |
| `routeEnvAccess.test.js` | `routeEnvAccess.js` |
| `routeAdminAccess.test.js` | `routeAdminAccess.js` |
| `routeTransition.test.js` | `routeTransition.js` |
| `routeErrorBoundary.test.js` | `routeErrorBoundary.js` |
| `navigationProgress.test.js` | `navigationProgressTracker.js` |
| `navigationErrorHandler.test.js` | `navigationErrorHandler.js` |
| `scrollBehavior.test.js` | `scrollBehavior.js` |
| `notFoundComponentLoader.test.js` | `notFoundComponentLoader.js` |
| `jsonConfigValidator.route.test.js` | `validateRouteConfig` + helpers |
| `validateRouteAssetPreloadFlags.test.js` | asset preload validation |
| `sectionPreloadOrchestrator.route.test.js` | route-coupled preload |
| `sectionResolver.route.test.js` | route-coupled section resolve |
| `localeManager.route.test.js` | locale + path |
| `hreflangTags.route.test.js` | `routeHreflangTags.js` |
| `getAssetPreloadEntriesForSection.route.test.js` | `routeSectionAssetPreloadEntries.js` |
| `router.index.test.js` | `router/index.js` local functions + hooks |
| `router.integration.test.js` | end-to-end navigation scenarios |
| `routeConfig.integrity.test.js` | production `routeConfig.json` snapshot |
| `startupRouteResolution.test.js` | `app/main.js` boot path |
| `routerExports.test.js` | barrel + router re-exports |

**Conventions**

- Mock `getRouteConfiguration()` with minimal fixture routes unless testing loader itself.
- Use `vi.stubEnv('MODE', 'production'|'development')` for env guards.
- Prefer `@/systems/routing/...` imports after refactor (update stale `utils/route` paths).
- Integration tests: mount router with memory history + stub auth context.

---

## 0. Production route integrity (`routeConfig.json`)

- `routeConfig.json` parses as a JSON array without syntax errors
- `validateRouteConfig(productionRoutes)` returns `valid: true` with zero errors
- every production route has a non-empty string `slug`
- every non-redirect route has `componentPath` or `customComponentPath`
- every non-redirect non-catch-all route has `section`
- no duplicate slugs in production config
- `findDuplicateRoutePathClaims` returns empty for production config
- every `componentPath` resolves via `findComponentLoader` or disk validator
- `validateRouteComponentPathsOnDisk` passes for full production config
- every `preLoadSections` entry resolves via `resolvePreloadSectionIdentifier`
- every `assetPreloadRef` resolves in shared catalog + asset map
- every `envAccess` value passes `isValidRouteEnvAccess`
- every `supportedRoles` entry is a known role or `"all"`
- catch-all route exists and is last in generation order
- `/404` or configured not-found slug exists in `routeDefaults.json`
- login slug in defaults matches an enabled route in config
- dashboard slug in defaults matches an enabled route in config
- no route has both `redirect` and `componentPath` without explicit test exemption
- `enabled: false` routes are excluded from Vue Router record generation
- disabled routes still validate structurally when passed to `validateRouteConfig`
- role-based `section` objects have at least one non-empty string value
- role-based `customComponentPath` entries have `componentPath` per role
- `inheritConfigFromParent` children have resolvable parent slug in config
- no orphan `redirectFrom` path collides with another route's primary slug
- alias paths do not collide with another route's primary slug
- wildcard slugs are only used for 404/catch-all patterns
- `hideLayout` meta routes are a subset of valid routes
- `adminOnly` routes all set `requiresAuth: true`
- auth routes with `redirectIfLoggedIn` point to existing slugs
- protected routes with `redirectIfNotAuth` point to existing slugs
- dependency `fallbackSlug` values point to existing slugs
- no circular `redirect` chains longer than depth 1
- locale-prefixed navigation targets resolve same as locale-free slug
- production route count matches documented baseline snapshot
- schema warnings for missing recommended fields are documented/acceptable

---

## 1. `routeConfigLoader.js`

### `loadRouteConfigurationFromFile`

- returns array when route JSON and shared catalog import succeed
- merges `resolveRouteAssetPreloads` output onto each route
- calls `validateRouteConfig` and throws or logs when validation fails (per implementation)
- calls `validateRouteComponentPathsWithResolver` with glob resolver
- calls `validateRouteAssetPreloadFlags` for route array + catalog
- returns fresh array not mutating imported JSON module cache unexpectedly
- handles empty route array without throw
- attaches resolved asset preload fields expected by downstream consumers

### `getCachedRouteConfiguration`

- returns same reference on second call without reload
- returns loaded config after first `loadRouteConfigurationFromFile`
- reflects updates only after cache reset

### `resetRouteConfigurationCache`

- clears cached config so next `getRouteConfiguration` reloads
- safe to call multiple times in sequence
- does not throw when cache already empty

### `getRouteConfiguration`

- triggers load on first access
- returns cached config on subsequent access
- returns array of route objects with expected shape (`slug` present)

---

## 2. `routeResolver.js`

### `resolveRouteFromPath`

- returns exact match for `/dashboard` when slug is `/dashboard`
- returns null for unknown path `/does-not-exist`
- matches route when target path has no leading slash after normalization
- matches route when target path has trailing slash stripped
- prefers exact slug match over wildcard when both could apply
- matches catch-all wildcard route for unmatched deep paths
- does not match catch-all when exact sibling exists
- matches route via `aliases` when alias path used
- does not match disabled route slug if disabled routes removed from config loader output
- returns first matching route when duplicates exist in fixture (documents behavior)
- handles empty string path → null
- handles null/undefined path → null
- handles whitespace-only path → null
- matches parameterized slug patterns when implemented
- does not use locale prefix in matching (locale stripped before call)
- returns route object with original slug preserved
- logs/trackStep called without throw in SSR (no window)

### `resolveExactRouteFromPath`

- returns match for known exact slug
- returns null for path only matchable by catch-all wildcard
- returns null for unknown path
- matches alias paths same as `doesRouteConfigMatchPath`
- does not fall through to wildcard routes
- used by prefetch: `/random` does not return `/:pathMatch(.*)*` route

### `resolveComponentPathForRoute`

- returns `componentPath` for simple route and role `creator`
- returns `customComponentPath.creator.componentPath` when set
- falls back to default `componentPath` when role override missing
- returns null when route has `redirect` string
- returns null when no componentPath and no matching custom path
- handles `userRole` null → default path
- handles `userRole` `guest` with role-specific fan/creator paths
- handles nested `customComponentPath.agent.componentPath`
- does not throw when `customComponentPath` malformed (returns default or null)
- returns null for empty string componentPath

### `inheritConfigurationFromParentRoute`

- returns child unchanged when `inheritConfigFromParent` is false
- returns child unchanged when `inheritConfigFromParent` omitted
- merges `requiresAuth: true` from parent when child omits field
- child `requiresAuth: false` overrides parent `requiresAuth: true`
- merges `redirectIfNotAuth` from parent when child omits
- child `redirectIfNotAuth` overrides parent value
- merges `supportedRoles` with child winning per `deepMergePreferChild`
- merges `dependencies` object with child keys overriding
- merges `section` when child omits section
- child `section` overrides parent section
- finds parent `/dashboard` for child `/dashboard/settings`
- finds parent `/dashboard/settings` for child `/dashboard/settings/privacy`
- returns child only when no parent slug exists in config
- handles child `/dashboard` with no parent (single segment)
- recursively resolves parent that also has `inheritConfigFromParent`
- three-level chain: grandparent auth merges to grandchild
- concatenates `assetPreload` parent + child arrays (not replace)
- child-only `assetPreload` kept when parent has none
- parent-only `assetPreload` kept when child has none
- neither parent nor child `assetPreload` → undefined or empty per merge rules
- duplicate keys in merged object use child value
- does not mutate original child route object (if guaranteed — assert immutability or document mutation)
- handles parent with `inheritConfigFromParent` resolving before merge
- merges `preLoadSections` per deepMerge rules
- merges `envAccess` with child override
- merges `adminOnly` from parent when child omits

### `resolveEffectiveAssetPreloadForRoute`

- returns empty array for null route
- returns inline `assetPreload` when no inheritance flag
- returns merged parent+child assets when `inheritConfigFromParent: true`
- returns only parent assets when child has empty array and parent has entries
- returns empty when route has no asset preload after merge

### `getRouteChainForPath`

- returns `[/dashboard]` for path `/dashboard`
- returns `[/dashboard, /dashboard/settings]` for `/dashboard/settings` when both exist
- returns empty array for unknown path
- does not include catch-all route in chain
- uses exact slug segments only (no wildcard)
- order is root-to-leaf
- handles path without leading slash
- single-segment public path returns one route when exists

### `findParentRouteBySlug` (via inheritance behavior)

- parent discovery stops at first matching shorter slug
- skips non-existent intermediate segments
- does not treat alias as parent slug

---

## 3. `routeGuards.js` — `runAllRouteGuards`

- allows navigation when all guards pass for public route
- blocks with loop guard result before env guard runs
- blocks with env guard before auth runs
- blocks with auth guard before admin runs
- blocks with admin guard before role runs
- blocks with role guard before dependency runs
- returns `{ isNavigationAllowed: true }` when chain completes
- returns first failing guard result unchanged
- passes `context` through to auth/role/dependency guards
- handles null `toRoute` without unhandled throw
- handles null `fromRoute` for initial navigation
- async function resolves to guard result object

---

## 4. `routeGuards.js` — `guardPreventNavigationLoop`

- allows first navigation to `/dashboard`
- allows alternating between two different routes
- blocks when same slug repeated ≥ threshold times in history
- blocks redirect ping-pong A→B→A→B rapid sequence
- allows navigation after history cleared
- records successful navigation in internal history
- respects MAX_NAVIGATION_HISTORY cap (drops oldest)
- does not block when `to` and `from` slugs differ
- handles null to/from slug gracefully
- loop block includes `redirectTargetPath` fallback slug
- loop block includes human-readable `reason`

---

## 5. `routeGuards.js` — `guardCheckRouteEnvironmentAccess`

- allows route with no `envAccess` in development
- allows route with no `envAccess` in production
- allows `envAccess: development` route when `isDevelopmentEnvironment` true
- blocks `envAccess: development` route in production mode
- blocks with redirect to not-found or guard error slug
- delegates to `isRouteAccessibleInCurrentEnvironment`
- `guardCheckRouteEnvironmentAccess` is the env guard (no deprecated alias)

---

## 6. `routeGuards.js` — `guardCheckAuthentication`

- allows public route when guest not authenticated
- blocks `requiresAuth: true` when guest
- redirects to `redirectIfNotAuth` when set and unauthenticated
- redirects to default login slug when `redirectIfNotAuth` missing
- allows authenticated user on protected route
- blocks authenticated user on route with `redirectIfLoggedIn`
- redirects to `redirectIfLoggedIn` target when authenticated on login page
- allows guest on login page without `redirectIfLoggedIn`
- `requiresAuth: false` explicit allows guest
- `requiresAuth` undefined treated as not required
- does not require auth when only `supportedRoles` restricted (role guard handles)

---

## 7. `routeGuards.js` — `guardCheckRouteAdminAccess`

- allows non-admin route for regular user
- allows admin route when `isAdminUser` true
- blocks admin route for non-admin authenticated user
- redirects to default not-found slug on block
- allows route without `adminOnly` flag for everyone
- `adminOnly: true` with admin context passes

---

## 8. `routeGuards.js` — `guardCheckRouteUserRole`

- allows any role when `supportedRoles` includes `"all"`
- allows any role when `supportedRoles` empty array
- allows any role when `supportedRoles` omitted
- allows `creator` when `supportedRoles: ['creator']`
- blocks `fan` when only `creator` supported
- uses `context.userProfile.role` over `context.userRole` when both set
- falls back to `context.userRole` when profile role missing
- defaults to `guest` when no role in context
- redirects authenticated guest-role user to `/sign-up/onboarding`
- allows through to dependency check when `dependencies.roles[userRole]` exists
- blocks unauthorized role to not-found when no dependency escape hatch
- allows `agent` when listed in supportedRoles

---

## 9. `routeGuards.js` — `guardCheckDependencies`

- allows when `dependencies` omitted
- allows guest on public route (`requiresAuth: false`) skipping deps
- blocks when `onboardingRequired` and `onboardingPassed` not true
- redirects onboarding block to `dependencies.onboardingRequired.fallbackSlug`
- uses default onboarding fallback when fallbackSlug missing
- `required: true` dep blocks when profile field not strictly `true`
- treats `undefined` dependency value as missing
- treats `false` dependency value as missing
- treats `null` dependency value as missing
- treats string `"true"` as missing (not boolean true)
- `redirectIfComplete` redirects when dep is `true`
- `redirectIfComplete` uses `fallbackSlug` when set
- `redirectIfComplete` uses default dashboard when fallbackSlug missing
- skips `redirectIfComplete` for kyc when onboarding prerequisite incomplete
- processes `onboardingPassed` before `kycPassed` in role deps order
- custom dep keys sort after onboarding/kyc ordered keys
- no role deps → falls through to general `onboardingRequired`
- blocks unsupported role after deps when role not in `supportedRoles` (L6)
- allows supported role when all deps met
- allows when dep config has neither `required` nor `redirectIfComplete`
- multiple role deps: first failing required wins
- fan role deps ignored when user is creator (uses creator role block)
- guest skips role-specific deps on protected route still blocked by auth first in full chain

---

## 10. `routeGuards.js` — redirect / loop helpers

### `markGuardRedirectNavigation` / `consumeGuardRedirectNavigation`

- `consumeGuardRedirectNavigation` returns true once after mark
- second consume returns false
- not set for locale-only redirects (manual test documenting L5)

### `shouldClearGuardLoopHistoryAfterNavigation`

- returns true when navigation lands on distinct successful route
- returns false during guard redirect chain
- handles null previous/next

### `clearGuardNavigationHistory`

- empties loop detection history
- allows previously blocked loop navigation after clear

---

## 11. `routeNavigation.js`

### `setCurrentActiveRoute`

- stores path from route object slug or path
- updates previous route to old current
- appends to navigation history
- resolves route chain via `getRouteChainForPath`
- handles first navigation with no previous

### `getCurrentActivePath`

- returns null before any navigation
- returns last set path after `setCurrentActiveRoute`

### `getCurrentActiveRoute`

- returns route object or config matched for active path

### `getCurrentRouteChain`

- returns array from `getRouteChainForPath` for active path
- empty before first navigation

### `getPreviousActivePath` / `getPreviousActiveRoute`

- returns prior navigation target
- null on first navigation

### `getNavigationHistory`

- returns ordered history oldest→newest or newest first per implementation
- respects `maxEntries` limit when provided
- returns copy not internal reference (if applicable)

### `canNavigateBack`

- false when history length < 2
- true after two distinct navigations

### `clearNavigationHistory`

- resets history and previous pointers

### `getNavigationStatistics`

- returns counts: total navigations, unique paths, etc. per implementation

### `isOnPath`

- true when current path matches target
- normalizes leading slash
- false for different path

### `wasPreviouslyOnPath`

- true when path appears in history
- false when never visited

---

## 12. `routeAliasResolver.js`

### `normalizeRoutePath`

- `dashboard` → `/dashboard`
- `/dashboard` unchanged
- empty string → null
- whitespace → null
- non-string → null
- trims surrounding spaces

### `buildLocaleOptionalRoutePath`

- `/shop` → `/:locale?/shop`
- returns null for invalid slug input

### `normalizeRedirectFromList`

- string → single-element array
- array of strings normalized
- invalid entries filtered out
- undefined → empty array
- non-array non-string → empty array

### `normalizeAliasList`

- same normalization rules as redirect list
- non-array → empty array

### `buildVueRouterAliases`

- maps aliases to locale-optional paths
- empty input → empty array

### `doesRouteConfigMatchPath`

- true when slug matches normalized target
- true when target matches entry in `aliases`
- false when routeConfig null
- false when target null
- case sensitivity per implementation (document)

### `createRedirectFromRouteRecords`

- creates redirect records for each `redirectFrom` path
- includes locale-prefixed redirect paths
- returns empty for route without redirectFrom

### `collectRoutePathClaims`

- collects primary slug + aliases + redirectFrom per route
- includes locale variants if applicable

### `findDuplicateRoutePathClaims`

- returns empty for non-colliding config
- detects same path claimed by two routes
- detects alias colliding with another slug

---

## 13. `routeComponentLoader.js`

### `findComponentLoader`

- returns loader function for valid `@/templates/...` path in glob
- returns loader for valid `@/components/...` path
- returns undefined/null for unknown path
- returns undefined for empty path
- path must match glob key format exactly

### `loadComponentModule`

- resolves module default export for valid path
- rejects/throws for missing path per implementation
- returns Vue component module shape

---

## 14. `routeComponentPathValidator.js`

### `componentPathToRelativeFile`

- `@/templates/foo/Bar.vue` → `src/templates/foo/Bar.vue`
- rejects non-@/ paths per rules

### `collectComponentPathsFromRoute`

- collects default `componentPath`
- collects all `customComponentPath.*.componentPath` values
- deduplicates paths

### `collectComponentPathsFromRoutes`

- unions paths across route array

### `getComponentPathValidationError`

- null for valid path format
- error message for missing `@/` prefix
- error for wrong extension

### `validateRouteComponentPathsWithResolver`

- valid when every path resolves via mock resolver
- lists failures for missing loaders
- empty routes array passes

---

## 15. `routeComponentPathDiskValidator.node.js`

### `componentPathToAbsoluteFile`

- resolves to absolute filesystem path given project root

### `validateRouteComponentPathsOnDisk`

- passes when all template files exist
- fails when component file missing on disk
- handles monorepo root path argument

---

## 16. `routeComponentPreloader.js`

### `normalizeTargetPath`

- strips locale prefix when present
- ensures leading slash
- empty → null or empty per spec

### `resolveRouteForPrefetch`

- uses exact resolve (no catch-all)
- returns null for unknown menu path

### `prefetchRouteComponent`

- calls loader for resolved route component
- no-op when route not found
- no-op when already prefetched (cache)
- respects options flag to force refresh

### `createRoutePrefetchIntentHandler`

- returns function callable on mouseenter
- invokes prefetch for configured path
- debounces duplicate intent events if implemented

### `resetRoutePrefetchCache`

- allows second prefetch to reload module

---

## 17. `routeAssetPreloader.js`

### `prefetchSectionAssetsForRoute`

- resolves route and preloads section assets
- no-op for unknown path
- respects cache skip when assets loaded

### `createSectionAssetPrefetchIntentHandler`

- returns intent handler for asset preload

### `resetRouteAssetPrefetchCache`

- clears asset prefetch dedupe state

---

## 18. `routeAssetPreloadResolver.js`

### `resolveRouteAssetPreloads`

- merges shared catalog refs into route `assetPreload` arrays
- handles route without `assetPreloadRef`
- resolves string ref to catalog entry
- invalid ref flagged or omitted per implementation
- returns new routes array without mutating input
- empty shared catalog still returns routes

---

## 19. `useRoutePrefetch.js`

### `createRoutePrefetchIntentHandler`

- composes component + section asset prefetch handlers
- single intent triggers both when configured

### `useRoutePrefetch` (composable)

- returns reactive prefetch helpers in component setup
- cleans up on unmount if listeners registered

---

## 20. `routeDefaults.js`

### `getDefaultNotFoundSlug`

- returns value from `routeDefaults.json`
- matches `/404` or configured slug

### `getDefaultGuardErrorSlug`

- returns configured guard error path

### `getDefaultNavigationErrorSlug`

- returns chunk/navigation error path

### `getDefaultLoginSlug`

- returns login path used by auth guard

### `getDefaultDashboardSlug`

- returns dashboard path used by error boundary

### `ROUTE_DEFAULTS`

- frozen object mirrors JSON keys

---

## 21. `routeEnvAccess.js`

### `ROUTE_ENV_ACCESS`

- contains `development` constant value

### `isDevelopmentEnvironment`

- true when `import.meta.env.DEV` or MODE development
- false in production test env stub

### `isRouteAccessibleInCurrentEnvironment`

- true for route without envAccess
- false for dev-only route in production

### `isValidRouteEnvAccess`

- true for undefined/null (optional field)
- true for `development`
- false for unknown string

---

## 22. `routeAdminAccess.js`

### `isAdminUser`

- true when context indicates admin role/flag
- false for regular user
- false for empty context

### `isRouteAccessibleToAdmin`

- true when route not `adminOnly`
- true when admin user on admin route
- false when non-admin on admin route

---

## 23. `routeNavigationResourceLoader.js`

### `resolveCurrentSectionForNavigation`

- resolves string section for role
- resolves role-variant section object for creator
- returns null when route has no section
- uses inherited config when route has inherit flag (if caller passes merged)

### `loadCurrentSectionResources`

- triggers CSS load for resolved section
- triggers i18n load for section
- triggers asset preload for section
- accepts `{ to, userRole }` shape from router hook
- no throw when section null (graceful skip)

---

## 24. `routeTransition.js`

### `ROUTE_TRANSITION_PRESETS`

- contains named preset strings used by App.vue
- frozen/immutable

### `resolveRouteTransition`

- returns preset from `route.meta.routeConfig.transition`
- returns default preset when missing
- returns default for unknown preset name

---

## 25. `routeErrorBoundary.js`

### `createRouteRenderError`

- wraps Error with route context fields
- includes info string from Vue error hook

### `shouldClearRouteErrorOnNavigation`

- true when route key changes
- false when same route key remount
- handles null keys

---

## 26. `navigationProgressTracker.js`

### `startNavigationProgress`

- sets in-progress true
- idempotent start calls

### `finishNavigationProgress`

- clears in-progress after delay or immediately

### `failNavigationProgress`

- marks failed state for progress bar

### `useNavigationProgress`

- composable exposes reactive progress state
- finish called from router afterEach integration

---

## 27. `navigationErrorHandler.js`

### `isChunkLoadNavigationError`

- true for dynamic import failure message patterns
- false for generic Error

### `isOnNavigationErrorRoute`

- true when current route is navigation error slug

### `recoverFromChunkLoadError`

- redirects router to navigation error route
- does not loop when already on error route

---

## 28. `scrollBehavior.js`

### `resolveRouterScrollPosition`

- returns saved position when `savedPosition` provided
- scroll to top for new navigation
- respects hash anchor in `to.hash`
- returns falsy to skip scroll when configured

---

## 29. `notFoundComponentLoader.js`

### `NOT_FOUND_COMPONENT_PATH`

- points to `@/templates/misc/NotFoundPage.vue`

### `loadNotFoundComponent`

- returns async component loader result
- uses same glob map as route components

---

## 30. `systems/build/jsonConfigValidator.js` (route)

### `collectKnownSectionNames`

- collects string sections
- collects all values from role-based section object
- ignores empty strings
- empty routes → empty set

### `buildRouteSlugIndex`

- maps `/slug` and `slug` without leading slash
- skips routes without slug

### `resolvePreloadSectionIdentifier`

- resolves section name from slug reference
- resolves direct section name when in known set
- null for unknown identifier
- null for empty string

### `collectPreloadSectionIdentifiers`

- flattens array `preLoadSections`
- flattens role-keyed object values

### `validateRouteConfig`

- fails when routes not an array
- errors missing slug
- errors missing componentPath on non-redirect route
- allows redirect-only route without componentPath
- errors missing section on non-redirect non-catch-all
- warns or errors duplicate slugs
- validates `supportedRoles` array type
- validates `envAccess` via `isValidRouteEnvAccess`
- validates preload section identifiers
- validates asset preload refs and flags
- returns `{ valid, errors, warnings }` shape
- production snapshot test: zero errors

---

## 31. `systems/assets/validateRouteAssetPreloadFlags.js`

### `collectAssetMapFlags`

- reads flags from asset map JSON shape

### `validateAssetPreloadEntryShape`

- valid entry passes
- invalid entry returns error descriptor

### `validateRouteAssetPreloadRefs`

- each ref on route resolves in catalog

### `validateRouteAssetPreloadFlags`

- full route array validation passes production config

### `validateSharedCatalogAssetPreloadFlags`

- shared catalog entries valid against asset map

---

## 32. `systems/sections/sectionResolver.js` (route-coupled)

### `getPreloadSectionsForRoute`

- returns array from string `preLoadSections`
- returns role-specific array from object shape
- empty when field missing

### `getAllRouteSectionsForRoute`

- includes primary section + preload sections

### `resolveSectionIdentifier`

- resolves slug to section via `resolveRouteFromPath`
- returns direct section name

### `resolveRoleSectionVariant`

- string section returned as-is
- object section picks role key then default

### `normalizeSectionConfiguration` / `isSectionRoleBased` / `getAllSectionVariants`

- role object detected correctly
- all variant strings extracted

---

## 33. `systems/sections/sectionPreloadOrchestrator.js` (route-coupled)

### `resolveEffectiveRouteConfig`

- null in → null out
- calls `inheritConfigurationFromParentRoute`

### `getRoutePreloadPlan`

- returns identifiers + resolved section names
- deduplicates resolved list
- merges `additionalSections` option
- empty for null route config
- uses inherited preload sections from parent

### `resolveCurrentRouteSectionName`

- resolves effective section for role

### `shouldPreloadDefaultAuthSection`

- true on login when guest and auth section not loaded
- false when already in resolved sections

### `preloadDefaultAuthSection`

- triggers auth section preload when predicate true

### `startBackgroundSectionPreloads`

- preloads planned sections not current
- skips current section

### `refreshSectionPreloadsOnLocaleChange`

- recomputes plan for new locale/path

---

## 34. `systems/assets/routeSectionAssetPreloadEntries.js` (route-coupled)

### `routeBelongsToSection`

- true when route section matches section name
- role-variant section match

### `isRouteEnabledForAssetPreload`

- false for `enabled: false` route

### `getAssetPreloadEntriesForSection`

- returns entries for routes in section
- dedupes via `dedupeAssetPreloadEntries`

### `clearAssetPreloadSectionCache`

- resets cached section lookups

---

## 35. `systems/i18n/localeManager.js` (route-coupled)

### `getLeadingLocaleFromPath`

- extracts `en` from `/en/dashboard`
- returns null when no locale prefix

### `stripLeadingLocaleFromPath`

- `/en/dashboard` → `/dashboard`
- `/dashboard` unchanged

### `normalizeLocalizedPath`

- alias behaves same as strip

### `registerLocaleRouter`

- registers router instance without throw

### `resolveActiveLocale` / `resolveActiveLocaleForNavigation`

- returns locale for current navigation context

### `applyLocaleTemporarily`

- sets temp locale during beforeEach

### `reapplyTemporaryPageLocaleForRoute`

- restores temp locale after navigation

### `syncTemporaryPageLocaleFromUrl`

- reads locale segment from URL

### `resolveLocaleForUrlInjection`

- builds locale prefix for redirect target

### `getDisplayedLocale`

- UI locale from path for composable sync

### `setActiveLocale`

- changing locale triggers route resolve side effects

### `translateCurrentPageTemporarily` / `clearTemporaryPageLocaleAndRestore`

- temp translation lifecycle around navigation

---

## 36. `systems/i18n/routeHreflangTags.js` (route-coupled)

### `buildLocalePrefixedPath`

- builds `/en/slug` from base path

### `buildHreflangAlternateUrls`

- array of alternate URLs per supported locale

### `clearHreflangTags`

- removes link elements from document head

### `syncHreflangTagsForPath`

- updates hreflang after navigation

---

## 37. `router/index.js` — local functions

### `resolveLocaleFromRouteLocation`

- reads locale param from matched route record
- falls back when param absent

### `buildLocaleAwareRedirectPath`

- prefixes redirect target with active locale when supported

### `generateRoutesFromConfig`

- generates record per enabled route
- skips `enabled: false` routes
- adds locale optional path prefix
- wires `loadRouteComponent` as component
- adds meta.routeConfig payload
- creates redirect records from `redirectFrom`
- catch-all route registered last
- dev-only routes omitted in production build

### `resolveUserRoleForComponentLoad`

- reads role from auth store/context for dynamic import

### `loadRouteComponent`

- returns async component for route
- uses `resolveComponentPathForRoute`
- falls back to `loadNotFoundComponent` when loader missing

### `loadViaGlob`

- finds loader in glob map by path

---

## 38. `router/index.js` — Vue Router hooks (integration)

### `beforeEach`

- injects locale before guards
- calls `runAllRouteGuards` with auth context
- redirects on guard block via `next(redirectTargetPath)`
- sets meta.section for matched role
- marks guard redirect for loop history rules
- allows navigation when guards pass

### `beforeResolve`

- calls `loadCurrentSectionResources`

### `afterEach`

- calls `setCurrentActiveRoute`
- calls `syncHreflangTagsForPath`
- starts background section preloads from plan
- finishes navigation progress

### `onError`

- chunk load errors call `recoverFromChunkLoadError`
- non-chunk errors propagate or log

### `scrollBehavior`

- delegates to `resolveRouterScrollPosition`

---

## 39. `app/main.js` (route boot)

### `startStartupPreloadForCurrentRoute` (local)

- waits for `router.isReady()`
- resolves current path route
- runs `getRoutePreloadPlan` for startup preload
- does not throw when route null

### router registration

- `registerLocaleRouter(router)` called before mount
- app mounts with router plugin

---

## 40. `app/App.vue` (route consumer)

- `resolveRouteTransition` applied to transition name
- `hideLayout` meta hides layout wrapper
- `RouteErrorBoundary` catches child render errors

---

## 41. `index.js` barrel exports

- every documented export from `systems/routing/index.js` is importable
- no duplicate export names
- re-exports match source module signatures

---

## 42. Cross-cutting edge cases & conditions

- navigate to disabled route URL → catch-all / 404 (not guard block)
- guest hits protected URL → login redirect not 404
- fan hits creator-only URL → 404 or dependency redirect per config
- creator incomplete onboarding hits dashboard → onboarding redirect
- creator complete onboarding on onboarding URL → dashboard redirect (`redirectIfComplete`)
- creator incomplete KYC on KYC URL → allowed
- creator complete KYC on KYC URL → redirect away
- kyc `redirectIfComplete` blocked when onboarding incomplete
- authenticated user role `guest` post-signup → onboarding not 404
- admin route as fan → 404
- dev-only route in prod build → not registered / 404
- locale switch preserves logical slug
- `/en/log-in` and `/log-in` resolve same route config
- alias path resolves same config as canonical slug
- `redirectFrom` legacy URL redirects to canonical slug
- deep link with query string preserves query through guard redirect
- deep link with hash preserves hash through navigation
- `inheritConfigFromParent` child inherits auth but overrides section
- grandchild inherits merged parent+child auth requirements
- preload plan uses inherited `preLoadSections`
- component load uses role at navigation time not prefetch time
- prefetch does not bypass auth guards
- popup `router.push` intercept still runs guards on full navigation escape
- chunk load recovery does not fire on non-import errors
- guard loop detection ignores locale-only normalization redirect (L5)
- dependency check skipped on public marketing pages for guests
- role guard passes non-listed role to dependency when deps configured (L6)
- dependency then blocks non-listed role if no dep fired
- `supportedRoles: ['all']` bypasses role restriction entirely
- empty `supportedRoles` treated as open (runtime)
- missing `requiresAuth` does not imply public if inherited true from parent
- circular redirect config caught at validate time
- wildcard slug does not match prefetch intent paths
- `resolveExactRouteFromPath` used in footer prefetch links
- navigation history tracks slug not full URL with query
- `resetRouteConfigurationCache` in dev enables hot JSON reload test
- SSR import of route modules does not touch window
- performance tracker trackStep no-op when tracker absent

---

## 43. Inheritance matrix (explicit permutations)

- child omits `requiresAuth`, parent `true` → effective `true`
- child `requiresAuth: false` overrides parent `true`
- child omits `adminOnly`, parent `adminOnly: true` → effective adminOnly
- child omits `dependencies`, parent role deps → child gains deps
- child adds dep overriding parent same key
- child omits `section`, parent string section → inherited
- child role section object overrides parent string
- child omits `preLoadSections`, parent array → inherited array
- child `preLoadSections` replaces per merge (document actual deepMerge behavior)
- child omits `envAccess`, parent `development` → inherited dev-only
- child `envAccess` unset vs explicit null
- child omits `supportedRoles`, parent restricted → inherited restriction
- child `supportedRoles: ['all']` overrides parent restricted list
- assetPreload parent `[a]` child `[b]` → `[a,b]` concatenation
- assetPreload parent only → child gets parent list
- assetPreload child only → no parent list
- nested inherit: `/a`, `/a/b` inherit, `/a/b/c` gets merged chain
- parent not found at `/a/b` when `/a` missing → no inheritance
- `resolveEffectiveRouteConfig` equals `inheritConfigurationFromParentRoute` output
- `resolveEffectiveAssetPreloadForRoute` matches merged assetPreload
- `getRoutePreloadPlan` uses effective config for inherited preload sections
- `guardCheckDependencies` uses raw or effective route (document which — test actual)
- `resolveComponentPathForRoute` does not inherit componentPath from parent (child must declare)
- inherited `redirectIfNotAuth` applies to child URL
- inherited `hideLayout` applies unless child overrides

---

## 44. `routeConfig.json` guard condition fixtures (minimal mock routes)

- mock: `requiresAuth true` only → guest blocked
- mock: `redirectIfLoggedIn` only → authed blocked
- mock: `supportedRoles ['creator']` only → fan blocked
- mock: `adminOnly true` only → non-admin blocked
- mock: `envAccess development` only → prod blocked
- mock: `dependencies.roles.creator.onboardingPassed required` → incomplete blocked
- mock: `redirectIfComplete onboardingPassed` → complete redirected
- mock: `onboardingRequired` legacy block
- mock: `enabled false` excluded from router generation
- mock: `redirect` string route has no component
- mock: `inheritConfigFromParent` with parent auth only
- mock: combined auth + role + dep chain in `runAllRouteGuards`
- mock: loop guard triggers before auth on repeated login redirect
- mock: role allows dep pass-through then dependency redirects fan from KYC route

---

## 45. Build tooling (route-related smoke)

- `build/buildConfig.js` `validateRouteConfiguration` passes CI
- `build/vite/sectionBundler.js` rejects invalid route config at build
- `build/tailwind/sectionScanner.js` `scanRouteConfigForSections` finds all sections
- `getSectionForComponent` maps component path back to section

---

## 46. Existing tests to migrate (import path only)

- migrate `routeGuards.test.js` imports to `@/systems/routing/`
- migrate `routeInheritance.test.js` imports + section orchestrator path
- migrate `startupRouteResolution.test.js` locale + resolver paths
- migrate `routeAssetPrefetch.test.js` mock paths
- migrate `useRoutePrefetch.test.js` mock paths
- migrate all 22 files listed in `route-code-index.md` §9

---

## 47. Concurrency & rapid navigation

- second `beforeEach` fires before first completes — last one wins without double-loading
- guard resolves after navigation already cancelled — stale result ignored
- two simultaneous `prefetchRouteComponent` calls for same path — loader called once (dedup)
- two simultaneous `prefetchSectionAssetsForRoute` calls for same section — single fetch
- `resetRoutePrefetchCache` mid-flight prefetch — subsequent call re-fetches cleanly
- rapid A→B→A navigations — final state is A not B
- navigation triggered inside `afterEach` does not trigger infinite loop
- `startBackgroundSectionPreloads` called twice for same route — second call skips already-in-progress sections
- `loadComponentModule` called while same module already loading — awaits shared promise (or starts fresh per implementation)
- router `push` called inside `beforeEach` guard — guard chain does not re-run on injected redirect infinitely
- `startNavigationProgress` called during in-progress navigation — does not double-start
- `finishNavigationProgress` called before `startNavigationProgress` — no throw
- locale inject redirect in `beforeEach` does not increment guard loop counter
- guard redirect from `/dashboard` → `/log-in` does not count as loop if user was already on `/log-in` previously
- `clearNavigationHistory` called mid-navigation — history state consistent after completion
- preload triggered for route B while guard for route B is still running — preload waits or cancels per implementation

---

## 48. Guard context shape & edge cases

- `runAllRouteGuards` with empty context `{}` — does not throw, treats as unauthenticated guest
- `runAllRouteGuards` with `context.isAuthenticated: undefined` — treats as falsy (guest)
- `runAllRouteGuards` with `context.userRole: null` — defaults to `guest`
- `runAllRouteGuards` with `context.userProfile: null` — falls back to `context.userRole`
- `runAllRouteGuards` with `context.userProfile.role` = empty string — treated as no role
- guard result always has `isNavigationAllowed`, `redirectTargetPath`, `blockReason` fields regardless of which guard fires
- `redirectTargetPath` is null (not undefined) when guard allows
- `reason` is a non-empty string on every block
- guard called with route that has no `slug` field — handles gracefully
- guard called with route that has `slug: null` — handles gracefully
- `toRoute` and `fromRoute` same slug — loop guard evaluates, other guards continue
- all guards return sync-compatible results (no unresolved promises in guard chain)
- `guardCheckAuthentication` with `context.isAuthenticated: true` and no `requiresAuth` — passes
- `guardCheckRouteUserRole` with `supportedRoles: ['creator', 'fan']` and role `vendor` — blocks
- `guardCheckRouteUserRole` with `supportedRoles: ['vendor']` and role `vendor` — allows
- `guardCheckDependencies` role lookup uses `context.userProfile.role` not `context.userRole` when both differ
- dependency config key not in `ORDERED_DEPENDENCY_KEYS` sorts after `kycPassed`
- dependency `required: false` and `redirectIfComplete: false` — entry fully skipped
- `guardCheckDependencies` with empty `dependencies` object `{}` — passes all

---

## 49. `routeNavigation.js` — deeper edge cases

- `setCurrentActiveRoute` called with Vue Router route object (not raw config) — extracts path correctly
- `setCurrentActiveRoute` with same path twice in a row — previous path remains the last distinct path
- `getNavigationHistory` with `maxEntries: 0` — returns empty array
- `getNavigationHistory` with `maxEntries` greater than actual length — returns all entries
- `getNavigationHistory` with `maxEntries: 1` — returns only most recent
- `isOnPath` with trailing slash on current vs no trailing slash in target — normalized match
- `isOnPath` with locale prefix in current path vs locale-free target — depends on whether locale is stripped before store
- `wasPreviouslyOnPath` checks entire history not just previous entry
- `getNavigationStatistics` total count increments on each `setCurrentActiveRoute`
- `getNavigationStatistics` unique count does not double-count same path
- `getCurrentRouteChain` for path with no parent returns single-element array
- navigation history max length capped — oldest entry dropped when cap exceeded
- `getPreviousActiveRoute` returns full route config object not just path string
- `clearNavigationHistory` followed by `canNavigateBack` returns false
- `wasPreviouslyOnPath` returns false after `clearNavigationHistory`

---

## 50. `routeConfigLoader.js` — caching & concurrent load

- concurrent calls to `getRouteConfiguration` before first load resolves — both resolve with same array (no double-load)
- `loadRouteConfigurationFromFile` called explicitly while cache is warm — returns fresh vs cached per implementation
- cache survives multiple `getRouteConfiguration` calls with no reset
- `resetRouteConfigurationCache` then `getRouteConfiguration` — triggers new load with fresh validation
- `getCachedRouteConfiguration` returns null/undefined before first load (documents behavior)
- validation failure in `loadRouteConfigurationFromFile` still populates or skips cache (document behavior)
- `getRouteConfiguration` in test environment uses vi.mock to return fixture — does not call real JSON import

---

## 51. Route config JSON — field validation deep cuts

- route with `slug: ""` (empty string) — errors as missing
- route with `slug: 123` (non-string) — type error
- route with `componentPath: 123` — type error
- route with `section: []` — invalid type error
- route with `section: {}` (empty object) — error or warning per implementation
- route with `supportedRoles: "all"` (string not array) — type error
- route with `supportedRoles: [123]` — element type error
- route with `envAccess: "staging"` — invalid enum error
- route with `envAccess: ""` — invalid
- route with `redirect: 123` — type error
- route with `enabled: "false"` (string not bool) — warn or error
- route with `preLoadSections: "auth"` (string not array/object) — invalid
- route with `preLoadSections: ["/nonexistent-slug"]` — UNKNOWN_PRELOAD_SECTION error
- route with `dependencies.roles` containing unknown role key — warn or error per implementation
- route with `dependencies.onboardingRequired.fallbackSlug: 123` — type error
- route with `assetPreloadRef` referencing non-existent catalog key — error
- route with `aliases: "some-path"` (string not array) — warn or error
- route with `redirectFrom: ["/duplicate", "/duplicate"]` — duplicate in own list
- two routes with same `slug` at different indices — duplicate slug error
- route slug `/dashboard` and another route `redirectFrom: ["/dashboard"]` — path collision error
- route with `customComponentPath` containing role key with missing `componentPath` subkey — error
- route array with 0 routes — passes validation (empty is valid schema-wise)
- route array with 1000 routes — validates all without timeout in test
- route with unknown extra field `foo: "bar"` — no error (extra fields ignored)

---

## 52. `routeAssetPreloadResolver.js` — detailed scenarios

- route with two `assetPreloadRef` entries in array — both resolved from catalog
- route with `assetPreloadRef` pointing to catalog key with multiple asset entries — all merged
- route `assetPreload` inline array merged with ref-resolved entries — combined not replaced
- shared catalog with empty entries object — routes pass through unchanged
- two routes reference same catalog key — both get same entries (catalog entry duplicated correctly per route)
- catalog key resolves to object with unexpected shape — flagged or skipped
- route `assetPreloadRef` is null — treated as absent
- route `assetPreloadRef` is empty string — treated as absent or flagged
- returned array is new reference not mutation of input array
- routes without `assetPreload` or `assetPreloadRef` have no asset preload field added (or empty array per implementation)

---

## 53. `routeComponentPreloader.js` — cache & error paths

- `prefetchRouteComponent` with valid path — loader function called exactly once
- second call with same path before module resolves — does not call loader twice
- second call after first resolves — serves from cache, no second load
- `resetRoutePrefetchCache` between calls — second call triggers fresh load
- `prefetchRouteComponent` with unresolvable path — does not throw, returns null or undefined
- `resolveRouteForPrefetch` with `/en/dashboard` locale-prefixed path — normalizes to `/dashboard` before lookup
- `normalizeTargetPath` with `//dashboard` double-slash — normalizes to single slash
- `normalizeTargetPath` with `/dashboard/` trailing slash — strips or preserves per spec
- `createRoutePrefetchIntentHandler` called before component mounts — no throw
- `createRoutePrefetchIntentHandler` returned handler called multiple times quickly — prefetch runs once (debounce or cache)

---

## 54. `routeAssetPreloader.js` — detail

- `prefetchSectionAssetsForRoute` resolves route then resolves section name for role
- `prefetchSectionAssetsForRoute` with role-based section picks correct variant
- section assets already in preload store — skips fetch (cache hit)
- `createSectionAssetPrefetchIntentHandler` returned handler passes options through to inner call
- `resetRouteAssetPrefetchCache` clears per-path and per-section cache entries
- `prefetchSectionAssetsForRoute` for unknown route — no asset fetch attempted
- `prefetchSectionAssetsForRoute` for route with no section — no-op

---

## 55. `routeTransition.js` — detailed preset resolution

- `ROUTE_TRANSITION_PRESETS` contains at least one entry
- `resolveRouteTransition` with `route.meta.routeConfig.transition` matching preset — returns that preset
- `resolveRouteTransition` with transition value not in presets — returns default
- `resolveRouteTransition` with `route.meta` undefined — returns default without throw
- `resolveRouteTransition` with `route.meta.routeConfig` undefined — returns default
- `resolveRouteTransition` with `route.meta.routeConfig.transition: null` — returns default
- `resolveRouteTransition` with empty string transition — returns default
- `ROUTE_TRANSITION_PRESETS` is frozen (Object.isFrozen check)

---

## 56. `scrollBehavior.js` — more cases

- `to.hash` set — returned position is `{ el: hash }` or `{ selector: hash }` per implementation
- both `savedPosition` and `to.hash` — savedPosition wins or hash wins per spec (document)
- `savedPosition` is `{ left: 0, top: 0 }` — returns that position
- same-route navigation (only query change) — scroll position behavior
- `_from` parameter ignored — same result regardless of from value
- returns `false` or `{ top: 0 }` for standard navigation (document which)

---

## 57. `navigationErrorHandler.js` — error pattern matching

- error with message `"Failed to fetch dynamically imported module"` — chunk load detected
- error with message `"Loading chunk"` — chunk load detected
- error with message `"Loading CSS chunk"` — chunk load detected
- error with generic `"undefined is not a function"` — not chunk load
- error with null message — not chunk load, no throw
- `isOnNavigationErrorRoute` checks router current route slug against default navigation error slug
- `recoverFromChunkLoadError` when already on error route — does not push again
- `recoverFromChunkLoadError` navigates to `getDefaultNavigationErrorSlug()` path

---

## 58. `navigationProgressTracker.js` — reactive state detail

- `useNavigationProgress` composable `isNavigating` ref starts false
- `startNavigationProgress` sets `isNavigating` to true
- `finishNavigationProgress` sets `isNavigating` to false
- `failNavigationProgress` sets `isNavigating` to false and `hasFailed` to true (or equivalent)
- reactive state updates propagate to watchers in same tick
- multiple calls to `startNavigationProgress` — still single in-progress state (not stacked)
- `finishNavigationProgress` followed immediately by `startNavigationProgress` — correct sequence
- `failNavigationProgress` followed by `startNavigationProgress` on next navigation — resets failed state

---

## 59. `routeEnvAccess.js` — env stub combinations

- `isDevelopmentEnvironment` with `import.meta.env.MODE === 'development'` → true
- `isDevelopmentEnvironment` with `import.meta.env.MODE === 'production'` → false
- `isDevelopmentEnvironment` with `import.meta.env.MODE === 'test'` → false (or per implementation)
- `isDevelopmentEnvironment` with `import.meta.env.DEV === true` → true
- `isDevelopmentEnvironment` with options override `{ forceDev: true }` if supported
- `isValidRouteEnvAccess` for every value in `ROUTE_ENV_ACCESS` returns true
- `isValidRouteEnvAccess` for `null` — true (field is optional)
- `isValidRouteEnvAccess` for `undefined` — true
- `isValidRouteEnvAccess` for object `{}` — false
- `isValidRouteEnvAccess` for array `["development"]` — false

---

## 60. `routeAdminAccess.js` — context shapes

- `isAdminUser` with `context.isAdmin: true` — true
- `isAdminUser` with `context.userRole: 'admin'` — true (or false — document which flag is checked)
- `isAdminUser` with both `isAdmin: false` and `userRole: 'admin'` — document which wins
- `isAdminUser` with `context: undefined` — false, no throw
- `isRouteAccessibleToAdmin` with `route.adminOnly: undefined` — accessible to all
- `isRouteAccessibleToAdmin` with `route.adminOnly: false` — accessible to all
- `isRouteAccessibleToAdmin` with `route.adminOnly: true` and admin — true
- `isRouteAccessibleToAdmin` with `route.adminOnly: true` and non-admin — false
- `isRouteAccessibleToAdmin` with null route — no throw (graceful)

---

## 61. `routeErrorBoundary.js` — error shapes

- `createRouteRenderError` with standard Error — wraps with `routeKey` field
- `createRouteRenderError` with non-Error object — wraps without throw
- `createRouteRenderError` with null error — wraps null safely
- `createRouteRenderError` info string preserved on output
- `shouldClearRouteErrorOnNavigation` with both keys identical strings — false
- `shouldClearRouteErrorOnNavigation` with both null — false
- `shouldClearRouteErrorOnNavigation` with one null one string — true
- `shouldClearRouteErrorOnNavigation` with two different non-null strings — true

---

## 62. `routeDefaults.js` — resilience

- each getter returns a string starting with `/`
- `ROUTE_DEFAULTS` keys match getter function names semantically
- `getDefaultNotFoundSlug` return value matches a route in production `routeConfig.json`
- `getDefaultLoginSlug` return value matches a route in production config
- `getDefaultDashboardSlug` return value matches a route in production config
- `getDefaultGuardErrorSlug` return value matches a route or is same as not-found
- `getDefaultNavigationErrorSlug` return value matches a route or is same as not-found
- all defaults are different slugs from each other (no accidental collision)

---

## 63. `routeComponentPathValidator.js` — edge cases

- `componentPathToRelativeFile` with `@/components/ui/Button.vue` → `src/components/ui/Button.vue`
- `componentPathToRelativeFile` with path already starting `src/` — returns as-is or errors
- `collectComponentPathsFromRoute` with no `componentPath` and no `customComponentPath` — empty array
- `collectComponentPathsFromRoute` with `customComponentPath` having 3 role keys — all 3 paths returned
- `collectComponentPathsFromRoute` with same path in default and one role override — deduped to one
- `collectComponentPathsFromRoutes` for 5 routes — union without duplicates
- `getComponentPathValidationError` for `.ts` extension instead of `.vue` — error
- `getComponentPathValidationError` for `.vue` uppercase extension — error or pass per case sensitivity
- `validateRouteComponentPathsWithResolver` with one failing loader — error includes failing path
- `validateRouteComponentPathsWithResolver` with all paths resolving — returns valid result

---

## 64. `routeComponentPathDiskValidator.node.js` — filesystem

- `componentPathToAbsoluteFile` produces OS-correct path separators
- `componentPathToAbsoluteFile` with Windows-style projectRoot — path joined correctly
- `validateRouteComponentPathsOnDisk` with mixed valid/invalid files — reports only missing ones
- `validateRouteComponentPathsOnDisk` for empty routes array — passes with zero failures
- `validateRouteComponentPathsOnDisk` does not throw when a file exists as directory

---

## 65. `notFoundComponentLoader.js`

- `NOT_FOUND_COMPONENT_PATH` starts with `@/`
- `NOT_FOUND_COMPONENT_PATH` ends with `.vue`
- `loadNotFoundComponent` calls `findComponentLoader` with the constant path
- `loadNotFoundComponent` returns a function (lazy loader)
- result of `loadNotFoundComponent` invocation resolves to a Vue component module

---

## 66. Section preload orchestrator — additional scenarios

- `getRoutePreloadPlan` for route with `preLoadSections: []` empty array — resolved is empty
- `getRoutePreloadPlan` for route with role-keyed `preLoadSections` object — correct role's array used
- `getRoutePreloadPlan` deduplicates when same section appears in inherited and own preload list
- `getRoutePreloadPlan` with `additionalSections` containing already-resolved section — not added twice
- `getRoutePreloadPlan` with `additionalSections: []` — same as without option
- `startBackgroundSectionPreloads` with all sections already in preload store — no preload calls made
- `startBackgroundSectionPreloads` with some sections in progress — skips those, preloads rest
- `startBackgroundSectionPreloads` with `skipSection` matching one entry — that section skipped
- `refreshSectionPreloadsOnLocaleChange` calls `getRoutePreloadPlan` with new locale context
- `resolveCurrentRouteSectionName` for role-based section with unknown role — falls back to default
- `shouldPreloadDefaultAuthSection` when `isAuthenticated: true` — false (logged-in users skip auth section preload)
- `shouldPreloadDefaultAuthSection` when auth section already resolved — false
- `shouldPreloadDefaultAuthSection` when `currentPath` is already login slug — document behavior
- `preloadDefaultAuthSection` calls `preloadSection` with auth section name

---

## 67. Section resolver — additional

- `getPreloadSectionsForRoute` for role-keyed `preLoadSections` with role `creator` — returns creator array
- `getPreloadSectionsForRoute` for role-keyed `preLoadSections` with role not in object — falls back to default key or empty
- `getAllRouteSectionsForRoute` for route with preload sections — deduplicates primary section if already in list
- `resolveSectionIdentifier` for slug `/dashboard` when that route has string section — returns section name
- `resolveSectionIdentifier` for slug `/dashboard` when that route has role-based section — resolves for given role
- `resolveSectionIdentifier` for unknown slug — returns null
- `resolveRoleSectionVariant` for string section — same string returned regardless of role
- `resolveRoleSectionVariant` for object without matching role — uses `default` key
- `resolveRoleSectionVariant` for object with no `default` and no matching role — null
- `isSectionRoleBased` for string — false
- `isSectionRoleBased` for object — true
- `isSectionRoleBased` for null — false
- `getAllSectionVariants` for string section — single-item array
- `getAllSectionVariants` for role object — all unique values in array

---

## 68. Locale manager — additional route path tests

- `getLeadingLocaleFromPath` with `/fr/dashboard` — returns `fr`
- `getLeadingLocaleFromPath` with `/dashboard` no locale — null
- `getLeadingLocaleFromPath` with `/en` only (no slug) — returns `en`
- `getLeadingLocaleFromPath` with `//dashboard` double-slash — null or handles gracefully
- `stripLeadingLocaleFromPath` with `/fr/about/team` — `/about/team`
- `stripLeadingLocaleFromPath` with `/about/team` — unchanged
- `stripLeadingLocaleFromPath` with `fr` that is not a supported locale — unchanged (not stripped)
- `resolveLocaleForUrlInjection` with no active locale — returns path unchanged or adds default
- `applyLocaleTemporarily` with supported locale in URL — sets temp locale without page reload
- `reapplyTemporaryPageLocaleForRoute` called without prior `applyLocaleTemporarily` — no throw
- `syncTemporaryPageLocaleFromUrl` with URL having unsupported locale segment — no locale set
- locale change does not re-run all route guards (locale inject is beforeEach, not re-trigger)

---

## 69. Hreflang tags — detail

- `buildLocalePrefixedPath` with locale `de` and path `/shop` — `/de/shop`
- `buildLocalePrefixedPath` with locale `en` and path `/` (root) — `/en/` or `/en`
- `buildHreflangAlternateUrls` for N supported locales returns N entries
- `buildHreflangAlternateUrls` includes `x-default` entry if implemented
- `clearHreflangTags` removes all `<link rel="alternate" hreflang>` elements
- `clearHreflangTags` is no-op in SSR (no document) — no throw
- `syncHreflangTagsForPath` with null route config — calls `clearHreflangTags`
- `syncHreflangTagsForPath` with valid route — builds and injects link elements
- `syncHreflangTagsForPath` replaces existing tags rather than accumulating duplicates

---

## 70. `routeSectionAssetPreloadEntries.js` — additional

- `routeBelongsToSection` for route with role-based section object matching section name — true
- `routeBelongsToSection` for route with role-based section where no variant matches — false
- `isRouteEnabledForAssetPreload` for route with `enabled: true` — true
- `isRouteEnabledForAssetPreload` for route with `enabled` omitted — true (default)
- `getAssetPreloadEntriesForSection` for section with no matching routes — empty array
- `getAssetPreloadEntriesForSection` for section with 5 routes all with assets — all entries returned
- `dedupeAssetPreloadEntries` removes entries with identical key+path
- `dedupeAssetPreloadEntries` keeps entries with same key but different path
- `clearAssetPreloadSectionCache` allows re-computation after route config changes

---

## 71. `validateRouteAssetPreloadFlags.js` — additional

- `validateAssetPreloadEntryShape` with missing `path` field — error
- `validateAssetPreloadEntryShape` with missing `type` field — error
- `validateAssetPreloadEntryShape` with extra unknown fields — passes (no strict)
- `validateRouteAssetPreloadRefs` for route with valid refs — passes
- `validateRouteAssetPreloadRefs` for route with ref not in catalog — error
- `validateRouteAssetPreloadFlags` for route with no `assetPreload` — passes (optional)
- `validateSharedCatalogAssetPreloadFlags` for empty catalog — passes
- `collectAssetMapFlags` returns expected set of flag keys from asset map shape

---

## 72. `router/index.js` — `generateRoutesFromConfig` detail

- each enabled route produces exactly one Vue Router record (not duplicates)
- `meta.routeConfig` on each record equals the source route config object
- catch-all route `/:pathMatch(.*)*` is the last record in the array
- route with `redirectFrom: ['/old-path']` produces an additional redirect record
- route with `aliases: ['/alt']` produces a record with `alias` field set
- route with `enabled: false` — zero records produced for that route
- route with `envAccess: 'development'` in production — zero records produced
- route record `path` matches `/:locale?/slug` pattern
- router instance default export is a Vue Router instance (has `.push`, `.beforeEach`)
- `prefetchRouteComponent` named export from `router/index.js` is callable

---

## 73. `router/index.js` — `loadRouteComponent` fallback chain

- path in glob map — returns that loader
- path not in glob map — falls back to `loadNotFoundComponent`
- `resolveComponentPathForRoute` returns null (redirect route) — fallback to not-found component
- `resolveUserRoleForComponentLoad` called at time of actual navigation not at route generation time
- custom path for role resolves even when default path is missing from glob

---

## 74. `router/index.js` — `beforeEach` interaction scenarios

- unauthenticated user navigating to `/dashboard` — redirected to login slug
- authenticated user navigating to `/log-in` with `redirectIfLoggedIn` — redirected to target
- authenticated user navigating to `/dashboard` — allowed, section meta set
- locale missing in URL for localized app — locale injected via redirect before guards run
- locale injection redirect does not increment guard loop history (L5)
- guard redirect from auth failure — `markGuardRedirectNavigation` called
- guard redirect increments loop history count for that slug
- `meta.routeConfig` available on `to` route inside `beforeResolve` and `afterEach` hooks
- `to.meta.section` set to resolved section name for user's role after `beforeEach`

---

## 75. `router/index.js` — `afterEach` interaction scenarios

- `setCurrentActiveRoute` called with final resolved route after each navigation
- `syncHreflangTagsForPath` called with current path after navigation
- `startBackgroundSectionPreloads` called with route's preload plan
- `finishNavigationProgress` called even if guard redirected
- navigation from `/log-in` to `/dashboard` — previous path set to `/log-in`
- navigation stats increment after each `afterEach`
- hreflang updated with new path after locale switch navigation

---

## 76. `app/App.vue` — route consumer behavior

- `route.meta.routeConfig.hideLayout: true` — layout wrapper not rendered
- `route.meta.routeConfig.hideLayout: false` — layout wrapper rendered
- `route.meta.routeConfig.hideLayout` absent — layout rendered (default)
- `resolveRouteTransition(route)` result used as `<transition name="...">`
- `RouteErrorBoundary` receives error from child component render failure
- `RouterView` wrapped inside `RouteErrorBoundary` boundary

---

## 77. `RouteErrorBoundary.vue` component

- catches synchronous render error from child — renders error fallback UI
- `getDefaultDashboardSlug()` used for recovery navigation button path
- `shouldClearRouteErrorOnNavigation` checked in `onBeforeRouteUpdate` or watch
- error cleared when navigating to different route (key changes)
- error not cleared when same route remounts (same key)
- `createRouteRenderError` called with caught error and component info
- recovery button calls `router.push(dashboardSlug)`

---

## 78. `AppFooter.vue` — direct routeConfig import (structural debt)

- footer renders nav links using route config data
- `createRoutePrefetchIntentHandler` called per nav link
- hover on footer link triggers prefetch via intent handler
- footer currently imports `routeConfig.json` directly — document test for expected refactor: should use `getRouteConfiguration()`
- after refactor: footer links update reactively if config cache resets (integration test)

---

## 79. `ProfileLoginPopup.vue` — router.push intercept

- `popupNavHandler` is provided via `provide` to descendants
- inside popup, `router.push('/dashboard')` intercepted and mapped to wizard step
- inside popup, `router.push` to unmapped path — falls through to real navigation
- popup navigation intercept does not prevent guards from running on full navigation escape
- provide key for `popupNavHandler` matches inject key in consuming components

---

## 80. `composables/useDisplayedLocaleSync.js`

- watches `route.path` and calls `getDisplayedLocale` on change
- returns current displayed locale as reactive ref
- initial value set from current route.path on mount
- locale changes when path changes to `/fr/dashboard` from `/en/dashboard`
- no throw when route.path is empty string or undefined

---

## 81. Build tooling — `jsonConfigValidator.js` `validateRouteConfig` additional

- `validateRouteConfig` called at Vite build time does not throw on valid config
- build fails (exits non-zero) when validation errors present — CI guard
- `validateRouteConfig` with 0 routes returns `{ valid: true, errors: [], warnings: [] }`
- missing `slug` on first route — error index is 0
- error object always has `type`, `routeIndex`, `field`, `message` fields
- warning object has same shape as error object
- warnings do not set `valid: false`
- `validateRouteConfig` result `errors` is always an Array (not null)
- `validateRouteConfig` result `warnings` is always an Array
- all duplicate slug errors include both route indices in message

---

## 82. `buildRouteSlugIndex` — additional

- route with slug `/dashboard` indexed at both `"/dashboard"` and `"dashboard"` keys
- two routes with same slug — second overwrites first in map (documents behavior)
- route with slug `/` (root) — indexed correctly
- `buildRouteSlugIndex` with empty array — returns empty Map
- Map lookup is O(1) — same result as linear find (correctness not perf, but document structure)

---

## 83. `collectPreloadSectionIdentifiers` — additional

- `preLoadSections: ["auth", "dashboard"]` — returns `["auth", "dashboard"]`
- `preLoadSections: { creator: ["dashboard-creator"], default: ["dashboard"] }` — returns `["dashboard-creator", "dashboard"]`
- `preLoadSections: { creator: "dashboard-creator" }` where value is string not array — handled or error
- `preLoadSections: null` — empty array
- `preLoadSections: 42` — empty array, no throw

---

## 84. `routeAliasResolver.js` — `createRedirectFromRouteRecords` detail

- route with `redirectFrom: ["/old", "/legacy"]` — two redirect records created
- redirect records have correct `redirect` target pointing to route's canonical slug
- locale-prefixed variants included: `/en/old` redirects to `/en/dashboard` (or canonical)
- route with empty `redirectFrom: []` — zero records
- route with `redirectFrom: undefined` — zero records, no throw
- redirect record `path` matches the `redirectFrom` entry with locale prefix applied

---

## 85. `routeAliasResolver.js` — `collectRoutePathClaims` and `findDuplicateRoutePathClaims`

- route with no aliases and no redirectFrom — claims only its slug
- route with one alias — claims slug + alias
- route with redirectFrom — claims slug + redirectFrom entries
- `findDuplicateRoutePathClaims` with two routes sharing an alias — returns that path in duplicates
- `findDuplicateRoutePathClaims` with route alias matching another route's redirectFrom — duplicate
- `findDuplicateRoutePathClaims` returns array of objects with offending path and both route slugs
- `findDuplicateRoutePathClaims` for route whose alias matches its own slug — duplicate or filtered (document)

---

## 86. SSR safety (no window/document)

- `routeConfigLoader.js` `getRouteConfiguration` does not access `window` — safe in Node
- `routeGuards.js` guard chain runs without `window` — pure function tests
- `routeNavigation.js` module-level state initializes without `window`
- `routeEnvAccess.js` `isDevelopmentEnvironment` does not access `window`
- `routeDefaults.js` getters do not access `window`
- `navigationErrorHandler.js` `isChunkLoadNavigationError` pure string check — no DOM
- `routeHreflangTags.js` `clearHreflangTags` guarded when `document` absent — no throw
- `routeHreflangTags.js` `syncHreflangTagsForPath` guarded when `document` absent
- `navigationProgressTracker.js` `useNavigationProgress` called outside component setup — no throw (SSR)
- `routeAssetPreloadResolver.js` `resolveRouteAssetPreloads` pure transform — no DOM

---

## 87. Integration — complete user journeys (router + memory history)

- guest navigates to `/` → resolves to home or redirect to login per config
- guest navigates to `/dashboard` → redirected to `/log-in`
- user logs in → navigates to `/dashboard` → allowed
- creator navigates to `/dashboard/creator` → allowed (role matches)
- fan navigates to `/dashboard/creator` → redirected to 404
- creator with incomplete onboarding navigates to `/dashboard` → redirect to `/sign-up/onboarding`
- creator completes onboarding, navigates to `/sign-up/onboarding` → redirect to dashboard
- creator with complete onboarding + incomplete KYC navigates to KYC page → allowed
- creator with complete onboarding + complete KYC navigates to KYC page → redirect away
- admin navigates to `/admin` route → allowed
- non-admin navigates to `/admin` route → 404
- user navigates with locale `/fr/dashboard` → locale set, guards run on `/dashboard` slug
- user navigates to legacy URL covered by `redirectFrom` → redirected to canonical slug
- user navigates to disabled route URL → catch-all renders 404 page
- user navigates through 5 pages → navigation history shows correct 5 entries
- `canNavigateBack` is true after sequence, false after `clearNavigationHistory`
- chunk load error during navigation → recovery route loaded, no infinite loop
- dev-only route accessed in production → 404 (not registered)

---

## 88. Integration — scroll and transition

- navigate to route with hash `#section` → scroll to element
- navigate back via browser — saved position restored
- navigate between two routes — transition name matches `resolveRouteTransition` output
- navigate to route with `hideLayout: true` — layout hidden in rendered output

---

## 89. Integration — preload lifecycle during navigation

- `beforeResolve` fires `loadCurrentSectionResources` before component is rendered
- `afterEach` fires `startBackgroundSectionPreloads` after component renders
- section CSS load triggered before component mount
- section i18n load triggered before component mount
- preload does not fire for redirect navigations (guard blocks before beforeResolve)
- startup preload runs for initial route on `router.isReady()`
- locale change triggers `refreshSectionPreloadsOnLocaleChange`

---

## 90. `routerExports.test.js` — barrel completeness

- `import { getRouteConfiguration } from '@/systems/routing'` works
- `import { resolveRouteFromPath } from '@/systems/routing'` works
- `import { runAllRouteGuards } from '@/systems/routing'` works
- `import { setCurrentActiveRoute } from '@/systems/routing'` works
- `import { normalizeRoutePath } from '@/systems/routing'` works
- `import { findComponentLoader } from '@/systems/routing'` works
- `import { prefetchRouteComponent } from '@/systems/routing'` works
- `import { createRoutePrefetchIntentHandler } from '@/systems/routing'` works
- `import { useRoutePrefetch } from '@/systems/routing'` works
- `import { resolveRouteTransition } from '@/systems/routing'` works
- `import { createRouteRenderError } from '@/systems/routing'` works
- `import { startNavigationProgress } from '@/systems/routing'` works
- `import { isChunkLoadNavigationError } from '@/systems/routing'` works
- `import { resolveRouterScrollPosition } from '@/systems/routing'` works
- `import { getDefaultNotFoundSlug } from '@/systems/routing'` works
- `import { isRouteAccessibleInCurrentEnvironment } from '@/systems/routing'` works
- `import { isAdminUser } from '@/systems/routing'` works
- `import { validateRouteComponentPathsWithResolver } from '@/systems/routing'` works
- barrel does not export symbols from unrelated modules

---

## 91. Miscellaneous one-offs and regression guards

- `deepMergePreferChild` used in inheritance does not deep-clone Date or RegExp (documents plain-object assumption)
- `safelyGetNestedProperty` used by guards returns undefined for missing deep keys without throw
- `safelyGetNestedProperty` for `null` root object — undefined, no throw
- guard context `userProfile` with extra unknown fields — ignored, no throw
- `runAllRouteGuards` for route with every field set to its most restrictive value — correct guard fires first
- two routes with same `slug` — `resolveRouteFromPath` returns first (documents order dependency)
- `resolveRouteFromPath` for `/` root slug — matches correctly, not treated as empty
- `resolveExactRouteFromPath` for `/` root slug — matches correctly
- `inheritConfigurationFromParentRoute` for root-level route with slug `/` (no parent) — returns child unchanged
- `getRouteChainForPath` for `/` — returns `[rootRoute]` if root route exists
- `buildLocaleOptionalRoutePath` for `/` root → `/:locale?/` — valid for router
- `normalizeRoutePath` for `/` — returns `/`
- `doesRouteConfigMatchPath` for `/` slug vs target `/` — true
- all routing module imports in test files use `@/systems/routing/...` not relative paths
- no test file imports from `@/utils/route/...` after migration
- vitest mock of `getRouteConfiguration` uses `vi.mock` at module level, not inside test
- fixture route objects reused across tests use `Object.freeze` or copies to avoid mutation bleed

---

## 92. Property-based / fuzz ideas (high value)

- fuzz `normalizeRoutePath` with random strings preserves leading slash invariant or returns null
- fuzz `normalizeRoutePath` trims whitespace-only inputs to null
- fuzz `buildLocaleOptionalRoutePath` never throws for arbitrary JS values
- fuzz `doesRouteConfigMatchPath` with random aliases never throws and always returns boolean
- fuzz `resolveRouteFromPath` with random target paths never throws
- fuzz `resolveExactRouteFromPath` with random target paths never returns catch-all route
- fuzz `collectPreloadSectionIdentifiers` with random object shapes never throws
- fuzz `resolvePreloadSectionIdentifier` with random identifiers returns string or null only
- fuzz `validateRouteConfig` with randomly generated route arrays returns `{ valid, errors, warnings }`
- fuzz dependency configs with random role keys in `guardCheckDependencies` never throws
- fuzz `componentPathToRelativeFile` with random strings returns normalized path or validation error
- fuzz `findDuplicateRoutePathClaims` with random route fixtures returns deterministic result (same input -> same output)
- fuzz `getRouteChainForPath` with long random nested paths does not exceed expected runtime
- fuzz `resolveEffectiveAssetPreloadForRoute` with random route shapes always returns array
- fuzz `buildRouteSlugIndex` with duplicate/empty slugs never throws
- fuzz `isChunkLoadNavigationError` with random Error-like objects always returns boolean
- fuzz `resolveRouterScrollPosition` with random to/from/saved payloads never throws
- fuzz `isValidRouteEnvAccess` with arbitrary values only accepts allowed enum/null/undefined
- fuzz `isAdminUser` with arbitrary context objects always returns boolean
- fuzz `resolveRoleSectionVariant` with arbitrary section config and role always returns string or null

---

## 93. Contract snapshot tests (stability guards)

- snapshot shape of guard block result from `guardCheckAuthentication`
- snapshot shape of guard block result from `guardCheckRouteUserRole`
- snapshot shape of guard block result from `guardCheckDependencies`
- snapshot shape of `validateRouteConfig` output for known invalid fixture
- snapshot resolved route object from `resolveRouteFromPath('/dashboard')`
- snapshot inherited route output for three-level inheritance fixture
- snapshot `getRoutePreloadPlan` output for role-based preload fixture
- snapshot `findDuplicateRoutePathClaims` output for duplicate alias fixture
- snapshot `collectComponentPathsFromRoutes` output for mixed custom/default components
- snapshot generated Vue Router records from `generateRoutesFromConfig` fixture
- snapshot `ROUTE_DEFAULTS` object to detect accidental key rename
- snapshot `ROUTE_TRANSITION_PRESETS` array to detect accidental preset removal
- snapshot `buildHreflangAlternateUrls` output ordering for supported locales
- snapshot `getNavigationStatistics` after deterministic navigation sequence
- snapshot `useNavigationProgress` reactive state transitions for start/fail/finish flow

---

## 94. Mutation-style assertions (logic hardening)

- if auth guard condition is inverted, test suite should fail on guest protected route
- if role guard treats missing `supportedRoles` as blocked, open-route tests fail
- if dependency `userValue === true` check loosened to truthy, string `'true'` test fails
- if dependency order ignores onboarding-before-kyc, prerequisite test fails
- if `resolveExactRouteFromPath` falls back to wildcard, prefetch exact-match test fails
- if inheritance stops recursion at one level, grandparent merge tests fail
- if assetPreload merge replaces parent instead of concatenating, inherited asset tests fail
- if `enabled: false` routes are accidentally registered, disabled-route integration tests fail
- if locale inject redirect marks guard redirect flag, loop history behavior test fails
- if `doesRouteConfigMatchPath` ignores aliases, alias route tests fail
- if `normalizeRoutePath` stops trimming, whitespace-path tests fail
- if `validateRouteConfig` stops validating `envAccess`, invalid env tests fail
- if `findDuplicateRoutePathClaims` misses alias-vs-slug collision, duplicate tests fail
- if `prefetchRouteComponent` removes dedupe cache, double-call loader count tests fail
- if `syncHreflangTagsForPath` accumulates duplicates, head-link count test fails

---

## 95. Very deep inheritance chains

- 4-level chain inherits auth + section + preload correctly end-to-end
- 5-level chain with alternating `inheritConfigFromParent` true/false resolves correctly
- chain where level 3 overrides `redirectIfNotAuth` and level 5 inherits it
- chain where parent has role-based section object and child overrides one role key only
- chain where child clears optional field via explicit null (document behavior)
- chain where middle parent missing from config skips inheritance for deeper child
- chain with mixed `assetPreload` arrays keeps order parent-first then child
- chain with duplicate asset entries across levels deduped later by downstream resolver (if applicable)
- chain where grandparent has `envAccess: development`, child overrides to undefined/null
- chain where ancestor has `adminOnly: true`, leaf overrides false (confirm child precedence)
- chain inheritance does not mutate any ancestor objects in fixture
- cycle-like slug patterns (`/a`, `/a/b`, `/a/b/a`) still resolve parent by slug prefix only
- route with trailing slash slug in parent (`/a/`) vs child (`/a/b`) behavior documented
- chain with `supportedRoles` inherited from parent and narrowed by child list
- chain with `dependencies.roles` merged where child overrides one dep key and keeps others
- chain with `preLoadSections` role object inherited and augmented by child additional keys

---

## 96. Route alias and redirectFrom matrix expansion

- route with alias lacking leading slash still normalized and matched
- alias with trailing slash matches normalized target route
- alias containing uppercase path segment behavior is consistent
- redirectFrom containing whitespace entries trims and normalizes correctly
- redirectFrom containing duplicates returns deterministic redirect records count
- alias that equals redirect target path does not create redirect loop
- alias that matches catch-all pattern does not hijack catch-all behavior
- redirectFrom from disabled route should not register records (if generation skips route)
- redirectFrom for dev-only route not generated in production
- locale-prefixed alias `/fr/old` resolves to canonical localized route
- `collectRoutePathClaims` includes normalized redirectFrom without duplicates
- duplicate claims report includes source type (`slug`/`alias`/`redirectFrom`) if implemented
- alias collision between two disabled routes still detectable in validator
- alias collision only in locale-prefixed variant is detected
- redirectFrom path equal to `/` root is handled safely

---

## 97. Load failure and recovery matrix

- component loader throws network error -> falls back to not-found or navigation error path per implementation
- component loader throws syntax error in module -> error boundary path engaged
- `recoverFromChunkLoadError` handles router.push rejection gracefully
- chunk recovery when router.currentRoute unavailable does not throw
- chunk recovery preserves attempted destination in query/hash if implemented
- navigation error route itself fails to load chunk -> no recursive recovery loop
- scrollBehavior still runs after recovery redirect
- navigation progress marked failed on chunk-load recovery path
- guard chain still executes after recovering and retrying manual navigation
- non-chunk runtime error does not invoke chunk recovery
- unknown Error-like object without message does not crash error classifier
- recovery from chunk load on SSR path no-ops safely

---

## 98. Data-volume and performance-oriented tests

- `validateRouteConfig` handles 500-route fixture under acceptable test-time threshold
- `buildRouteSlugIndex` on 500 routes maps all keys correctly
- `findDuplicateRoutePathClaims` on large fixture finds expected duplicate count
- `generateRoutesFromConfig` on large route array produces expected record count quickly
- `getRouteChainForPath` for 8-segment path resolves within expected threshold
- repeated `resolveRouteFromPath` lookups over full route set remain deterministic
- repeated `prefetchRouteComponent` across 100 links dedupes per unique path
- repeated `startBackgroundSectionPreloads` with many sections skips preloaded ones
- large shared asset catalog resolution does not mutate source catalog
- `validateRouteAssetPreloadFlags` on large config returns stable sorted error order (if applicable)
- navigation history cap prevents unbounded memory growth under 1000 navigations
- loop history cap prevents unbounded memory growth under redirect storms

---

## 99. Determinism and idempotency checks

- running `resetRouteConfigurationCache` twice results in same empty-cache state
- running `clearNavigationHistory` twice results in same history state
- running `clearGuardNavigationHistory` twice results in same loop state
- calling `prefetchRouteComponent` then `resetRoutePrefetchCache` then prefetch repeats expected behavior
- calling `resetRouteAssetPrefetchCache` twice does not throw
- `validateRouteConfig` called twice on same input yields deep-equal result
- `resolveRouteAssetPreloads` called twice on same input yields deep-equal output
- `getRoutePreloadPlan` called twice with same args yields same identifiers/resolved arrays
- `syncHreflangTagsForPath` called twice with same path does not duplicate tags
- `startNavigationProgress` idempotent under repeated calls in same tick

---

## 100. Test fixture design and coverage safety

- canonical fixture set includes public route, protected route, admin route, catch-all route
- canonical fixture set includes role-based section object and string section
- canonical fixture set includes alias and redirectFrom cases
- canonical fixture set includes dev-only route and disabled route
- canonical fixture set includes dependency chain onboarding/kyc
- canonical fixture set includes inheritance across 3+ levels
- each fixture route has explicit slug unique by default
- invalid-fixture builder can intentionally create duplicate slugs
- fixture factory supports toggling `isAuthenticated`, `userRole`, and profile flags per test
- helper `makeRoute` defaults align with production assumptions (`enabled: true`, `supportedRoles: ['all']`)
- helper `makeContext` defaults guest unauthenticated state
- fixture utilities deep-clone input to avoid cross-test mutation
- each guard test file has at least one allow and one block assertion per guard
- each exported function has at least one happy-path and one edge-path case
- integration fixture uses memory history and isolated router per test

---

## Summary counts (planning targets)

| Area | Test ideas (approx.) |
|------|---------------------|
| routeConfig integrity | 30 |
| routeConfigLoader | 35 |
| routeResolver + inheritance | 75 |
| routeGuards (all) | 155 |
| routeNavigation | 40 |
| routeAliasResolver | 65 |
| component load / validate / prefetch | 85 |
| asset preload | 60 |
| defaults / env / admin / error boundary | 65 |
| navigation UX (progress / scroll / error) | 45 |
| jsonConfigValidator + asset flags | 80 |
| section / i18n / locale / hreflang cross-system | 90 |
| router index + hooks | 65 |
| integration + user journeys | 60 |
| edge cases + inheritance matrix | 55 |
| concurrency | 30 |
| SSR safety | 15 |
| barrel exports | 20 |
| component consumers (Footer, ErrorBoundary, Popup) | 20 |
| build smoke + migration | 15 |
| property-based / fuzz + contracts + mutation-style checks | 50 |
| determinism / idempotency + fixture design | 35 |
| miscellaneous / regression | 30 |
| **Total** | **~1265** |

---

*Implement tests only after Phase 1 import fixes in `route-work-master-plan.md`. Update this file when modules move or rename.*
