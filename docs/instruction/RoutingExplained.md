# Routing Explained

## Routing & Route Configuration System – Overview
The routing system is the single source of truth for **what pages exist**, **who can see them**, and **which section bundle they belong to**. Every route is defined in `routeConfig.json`, then turned into real Vue Router routes at runtime.
The router never hard-codes paths: it always reads the JSON, resolves the correct component for the current user (role, dependencies, auth state), and wires in the navigation guards and performance tracking automatically.

On each navigation, the system does three things in a predictable order: it resolves which route entry applies, runs a fixed sequence of guards (loop → enabled → auth → roles → dependencies/redirects), and then records navigation state/history while preloading the relevant section bundles. This keeps routing **declarative, testable, and safe** while still supporting per-role components, dependency-gated flows, and section-based bundling.
## Terminology
*   **RouteConfig.json** – The JSON file that defines all routes. Each entry describes a URL `slug`, its `section`, auth/role requirements, and optional per-role component overrides or preloading hints. It is the only source of route truth.
*   **Slug** – The URL pattern for a route (e.g. `/log-in`, `/dashboard/store/orders`, or a wildcard like `/:pathMatch(.*)*`). Used to match navigation targets to route definitions.
*   **Section** – A logical bundle name indicating which JS/CSS/translation group a route belongs to. Can be a string (one section for everyone) or an object mapping roles to different section names (e.g. creator vs fan dashboards). DEV\_GUIDE\_COMPLETE
*   **Supported roles** – The roles that are allowed to access a route. An empty array means “no role restriction for authenticated users”; `"all"` means any role including dev/testing routes, depending on configuration.
*   **requiresAuth** – Boolean flag specifying whether the user must be authenticated to visit this route. Guards use this together with `supportedRoles`.
*   **redirectIfLoggedIn** – A path that login-type routes (e.g. `/log-in`, `/sign-up`, `/confirm-email`) use to push already-logged-in users away from auth screens to their main dashboard.
*   **customComponentPath** – Optional map of role → componentPath for role-specific versions of a page (e.g. creator vs fan dashboard). If not present for a role, the base `componentPath` is used.
*   **inheritConfigFromParent** – Flag telling the resolver to inherit configuration (e.g. section, auth, roles, dependencies) from a parent route segment if not explicitly set on the child. This prevents duplication in deep dashboards.
*   **preLoadSections** – An array of section names that should be preloaded when this route is hit (for “next step” flows or multi-step dashboards).
*   **Enabled flag** – Optional boolean (`enabled`) determining whether a route is live. Disabled routes stay in the config but are blocked by guards, typically resolving to 404 or a redirect.
*   **Route guard** – A small function that decides whether navigation should continue, redirect, or abort. This system chains multiple guards in a fixed order via `runAllRouteGuards`.
*   **Guard context** – The input object passed to guards: authentication state, active role, dependency flags (onboarding/KYC), and sometimes the previous route. Built from the Auth store rather than directly from tokens.
*   **Active route** – The route configuration currently considered “active” by `routeNavigation`. Used for navigation history, “where am I” logic, and investigations (e.g. `isOnPath`, `getNavigationHistory`).
*   **Navigation history** – An in-memory record of all routes visited, used to detect loops and implement helpers like “was I on this path before?” without going back to the router internals.
*   **Dev auth shim** – Development mode that bypasses Cognito and fakes auth via a local mock user so routing/guards can be tested without AWS. Controlled by `VITE_AUTH_DEV_SHIM`. ENV\_SETUP\_GUIDE
## High-Level Behavior
When the app starts, it loads and validates `routeConfig.json`, creates a Vue Router instance with routes derived from that configuration, and wires global guards that run for every navigation. It restores the auth session from storage (or uses the dev shim), so guards have a consistent view of `isAuthenticated`, role, and dependency flags (e.g. onboarding and KYC) from the very first navigation.

Whenever a user navigates (link click, programmatic `router.push`, or entering a URL directly), the router resolves a matching route from `routeConfig.json`, then runs through a strict guard sequence: it first prevents redirect loops, then checks if the route is enabled, then enforces authentication requirements, then role restrictions, and finally any dependency rules (onboarding/KYC) and redirect-if-logged-in rules for auth screens. If all guards pass, the navigation proceeds, the active route and history are updated, and the section preloader is kicked off for both the target section and any `preLoadSections` associated with that route. Translations for the relevant section and active locale are loaded separately by the translation system, but timing aligns with this routing flow.
## System Parts (Modules)
1. **`src/router/routeConfig.json`** — Declarative route configuration: slugs, sections, auth, roles, dependencies, preloading, redirects, and component paths.
2. **`src/utils/route/routeConfigLoader.js`** — Loads, validates, caches, and exposes `routeConfig.json` to the rest of the app.
3. **`src/utils/route/routeResolver.js`** — Finds the correct route for a path, applies inheritance, and resolves the appropriate component path and section for the current user role.
4. **`src/utils/route/routeGuards.js`** — Implements the guard pipeline (loop, enabled, auth, role, dependency/redirect) and orchestrates `runAllRouteGuards`.
5. **`src/utils/route/routeNavigation.js`** — Tracks the current and previous active routes plus full navigation history, and provides helper introspection functions.
6. **`src/utils/route/index.js`** — Central export that re-exports loader, resolver, guards, and navigation helpers for use by the router and other code.
7. **`src/router/index.js`** — Creates the Vue Router instance from the route configuration, wires up guards and navigation hooks, and plugs into performance tracking.
8. **`src/main.js`** — Bootstraps the app, installs the router, initializes auth state, and ensures route guards see a correct auth context from the start. DEV\_GUIDE\_COMPLETE
### `routeConfig.json` – Responsibilities
*   Define every route’s:
    *   URL slug (`slug`)
    *   Section (`section` as string or role map)
    *   Base component path (`componentPath`)
    *   Optional per-role components (`customComponentPath`)
    *   Auth requirements (`requiresAuth`)
    *   Role requirements (`supportedRoles`)
    *   Dependency requirements (e.g. `requireDependencies` with `onboardingPassed` / `kycPassed` if present)
    *   Redirect behavior (`redirectIfLoggedIn`, `redirect`)
    *   Optional flags (`enabled`, `inheritConfigFromParent`, `preLoadSections`)
*   Provide a single place to see which routes exist and how they are bundled into sections.
*   Drive both router construction and build-time section bundling via the `section` field.
### `routeConfigLoader.js` – Responsibilities
*   Import `routeConfig.json` at build-time and expose it through a loader function.
*   Validate every route entry against the schema (required fields, types, and allowed values).
*   Cache the parsed configuration in an in-memory cache (and optionally with expiration) for performance.
*   Expose helper methods:
    *   Load raw config (`loadRouteConfigurationFromFile`).
    *   Get cached config (`getCachedRouteConfiguration` / `getRouteConfiguration`).
    *   Reset the cache (`resetRouteConfigurationCache`) for dev tools and tests.
*   Wrap all operations with logging and `performanceTracker` steps for diagnostics.
### `routeResolver.js` – Responsibilities
*   Resolve the correct route object for a given path:
    *   Try exact slug matches first.
    *   Then match parameterised slugs (e.g. `/:pathMatch(.*)*`).
    *   Fall back to wildcard routes if defined.
*   Build a “route chain” for a deep path so children can inherit config from parents where `inheritConfigFromParent` is set.
*   Resolve per-role component and section:
    *   Use `customComponentPath[role].componentPath` where present.
    *   Otherwise use the base `componentPath`.
    *   For `section`, if `section` is an object, use the key matching the current role; otherwise, use the string value.
*   Expose helpers like:
    *   `resolveRouteFromPath(path)` – find the effective route object.
    *   `resolveComponentPathForRoute(route, role)` – find which component to actually load.
    *   `getRouteChainForPath(path)` – get parent/child route chain for inheritance.
*   Track each resolution step in `performanceTracker` and via `log`.
### `routeGuards.js` – Responsibilities
*   Hold the global navigation guard pipeline and orchestrate it through `runAllRouteGuards(toRoute, fromRoute, context)`.
*   Implement these guard stages, in order:
    1. Loop prevention – avoids redirect loops by inspecting navigation history.
    2. Enabled check – blocks routes with `enabled: false` (or uses sensible default if absent).
    3. Authentication check – enforces `requiresAuth` vs `isAuthenticated`.
    4. Role check – ensures `supportedRoles` covers the user role (or `"all"`).
    5. Dependency check – validates flags like onboarding/KYC if used (e.g. routes that require `onboardingPassed`).
    6. Redirect-if-logged-in for auth pages with `redirectIfLoggedIn`.
*   Return a simple result object (`{ allow: boolean, redirectTo?: string }`) consumed by the router’s `beforeEach` hook.
*   Maintain internal navigation history for loop prevention and debugging.
*   Provide utility methods to clear or inspect this history for tests.
### `routeNavigation.js` – Responsibilities
*   Store references to:
    *   `currentActiveRoute`
    *   `previousActiveRoute`
    *   `fullNavigationHistory` (ordered list of all visited routes/paths)
*   Provide helpers for other systems:
    *   `setCurrentActiveRoute(route)` to update active route references.
    *   `getCurrentActivePath()` / `getCurrentActiveRoute()`.
    *   `getPreviousActivePath()` / `getPreviousActiveRoute()`.
    *   `getNavigationHistory()` and `getNavigationStatistics()`.
    *   Simple boolean checks like `isOnPath(targetPath)` and `wasPreviouslyOnPath(targetPath)`.
*   Integrate with performance tracking so navigation patterns are visible for profiling and diagnostics.
### `utils/route/index.js` – Responsibilities
*   Re-export:
    *   Config loader functions.
    *   Resolver functions.
    *   Guard orchestrators.
    *   Navigation helpers.
*   Provide a single import surface so other modules (especially `router/index.js`) do not need to know file-level details.
### `router/index.js` – Responsibilities
*   Create the Vue Router instance via `createRouter` / `createWebHistory`, honouring `VITE_BASE_URL` when present. ENV\_SETUP\_GUIDE
*   Dynamically generate Vue Router route definitions from `routeConfig.json`:
    *   Attach the resolved route configuration object to `meta.routeConfig`.
    *   Wire the `section` onto either the `meta` or via helper functions for downstream consumers (preloader, translation loader, etc.).
*   Install `beforeEach` and `afterEach` hooks:
    *   `beforeEach` builds a guard context from the auth store and calls `runAllRouteGuards`.
    *   `afterEach` updates the active route in `routeNavigation`, triggers section preloading and translation loading for the target section and `preLoadSections`.
*   Handle router errors (`onError`) and push them through `performanceTracker` and `log`.
### `main.js` – Responsibilities (routing-related subset)
*   Initialize Pinia and the Auth store.
*   Restore session state (using dev shim or Cognito depending on env) before the router takes over.
*   Install the router into the Vue app (`app.use(router)`).
*   Mount the app only after environment validation passes so invalid envs don’t produce undefined routing behaviour. ENV\_SETUP\_GUIDE
* * *
## Data & File Structure

```bash
src/
  router/
    index.js                 # Vue Router instance and global hooks
    routeConfig.json         # Declarative route + section config
    routeConfig.schema.md    # Human-readable schema doc for routeConfig
    README.md                # High-level router/routeConfig guide
  utils/
    route/
      index.js               # Central export for all route utils
      routeConfigLoader.js   # Loads + caches routeConfig
      routeResolver.js       # Path → route + component/section resolution
      routeGuards.js         # Guard pipeline implementation
      routeNavigation.js     # Active route + history tracking
  stores/
    useAuthStore.js          # Auth state used by guard context
  main.js                    # App bootstrap; installs router
  i18n/
    ...                      # Translation files loaded per section
```

*   **`routeConfig.json`** – Master configuration listing every route, its slug, section, auth/role flags, dependencies, and preloading hints. Editing this file is how you add or update routes.
*   [**`routeConfig.schema.md`**](http://routeConfig.schema.md) – Describes the allowed fields and shapes in `routeConfig.json`, including examples for role-based sections and per-role components.
*   **`routeConfigLoader.js`** – Wraps `routeConfig.json` with caching, validation, and logging.
*   **`routeResolver.js`** – Encodes the logic for “which component and section does this path and user role map to?”.
*   **`routeGuards.js`** – Encapsulates all navigation guard logic separate from the router instance.
*   **`routeNavigation.js`** – Central place for understanding where the user is and where they have been.
*   **`router/index.js`** – Bridges declarative config into Vue Router runtime and wires guards and tracking.
## Priority / Precedence Rules
1. **Route matching priority**
    1. Exact slug matches (e.g. `/dashboard`) are preferred.
    2. More specific parameterised patterns come next.
    3. Wildcard routes (e.g. `/:pathMatch(.*)*`) are last-resort fallbacks.
    4. Final redirect (e.g. wildcard → `/404`) handles “no match” cases.
2. **Section resolution priority**
    1. If `section` is an object and contains a key for the current role, use that section (e.g. `"creator": "dashboard-creator"`).
    2. Otherwise, if `section` is a simple string, use that value for all roles.
    3. If a child route has `inheritConfigFromParent: true` and no `section`, inherit from its parent route chain.
3. **Component resolution priority**
    1. If `customComponentPath[role].componentPath` exists, use that component for the current role.
    2. Otherwise, use the route’s base `componentPath`.
    3. If the route has `inheritConfigFromParent: true` and no explicit `componentPath`, fall back to inherited component configuration.
4. **Guard pipeline priority**
    1. Loop prevention guard – prevents endless redirect chains.
    2. Enabled guard – blocks routes explicitly disabled (`enabled: false`).
    3. Auth guard – enforces `requiresAuth`; guests are redirected to auth routes.
    4. Role guard – ensures `supportedRoles` includes the user’s role (or uses `"all"`).
    5. Dependency guard – enforces additional flags (onboarding/KYC) when required by the route.
    6. Redirect-if-logged-in guard – for routes like `/log-in` and `/sign-up` that should bounce authenticated users to `redirectIfLoggedIn`.
5. **Auth mode precedence**
    1. In development, if `VITE_AUTH_DEV_SHIM=true`, the dev auth shim takes precedence and fakes auth locally without Cognito.
    2. In production (or when `VITE_AUTH_DEV_SHIM=false`), AWS Cognito is the source of truth for tokens and user attributes. ENV\_SETUP\_GUIDE
These rules guarantee that a developer can reason about navigation as: “the config decides which route matches; the guards decide if you’re allowed; then the resolver picks the correct component and section for your role; then navigation history and preloading kick in.”
## Runtime Flow / Execution Sequence
1. App starts.
2. Environment variables are validated and logged (dev) or enforced (prod).
3. Pinia is created and installed.
4. Auth store restores session using dev shim or Cognito tokens, depending on env.
5. Route configuration is loaded and cached.
6. Vue Router is created from `routeConfig.json` and wired with guards.
7. The app mounts and the first navigation is handled.
### On App Startup
*   Validate env vars and print a summary in development. ENV\_SETUP\_GUIDE
*   Create and configure the performance tracker (`window.performanceTracker`) so routing steps can register timings.
*   Initialize Pinia and install persisted-state plugin so auth persists across reloads.
*   Initialize the Auth store:
    *   In dev shim mode, generate/load a mock user and mark them as authenticated.
    *   In Cognito mode, parse stored tokens and reconstruct `currentUser` and flags (role, onboarding, KYC).
*   Load the route configuration via `getRouteConfiguration()`, which:
    *   Uses the cached value if available.
    *   On first load, validates the JSON and logs the result.
*   Build a Vue Router instance using `createRouter/createWebHistory`, mapping each config entry to a Vue route with:
    *   `path` from `slug`.
    *   `meta.routeConfig` containing the full config object.
*   Register global navigation guards and error handlers.
*   Mount the app.
### On Navigation / State Change
When a navigation is triggered:
*   The router’s `beforeEach` hook runs:
    *   Resolves `to.meta.routeConfig` and `from.meta.routeConfig`.
    *   Builds a guard context from `useAuthStore()`:
        *   `isAuthenticated`.
        *   `currentUser.role`.
        *   Dependency flags (e.g. onboarding/KYC) where applicable.
    *   Calls `runAllRouteGuards(toRouteConfig, fromRouteConfig, context)`.
    *   If any guard returns a redirect, navigation is redirected to that slug.
    *   If any guard blocks without redirect, navigation is aborted.
    *   If all guards pass, navigation continues.
*   The router’s `afterEach` hook runs:
    *   Calls `setCurrentActiveRoute(toRouteConfig)` to update navigation state and history.
    *   Triggers section preloading for:
        *   The primary `section` of the target route.
        *   Any sections listed in `preLoadSections` for the route.
    *   Invokes translation loading for the target section using the translation system.
*   Throughout, `performanceTracker` logs key steps (“guardStart”, “guardFinish”, “sectionPreloadStart”, “sectionPreloadComplete”) for later analysis.
### On User Interaction
*   Programmatic navigation (e.g. clicking menu items, dashboard links):
    *   Uses `router.push`/`router.replace`, which triggers the same guard + navigation flow.
*   Breadcrumbs, sidebars, or “Back” buttons:
    *   May use helpers like `canNavigateBack()` or `getNavigationHistory()` (from `routeNavigation`) to implement smarter behaviour.
*   Role change or logout:
    *   After logout, navigation history can be cleared and user is sent to a public route.
    *   After a role change or dependency change (e.g. onboarding completed), subsequent navigations will pass or fail based on the updated Auth store values.
## Configuration & Integration Points
*   `src/router/routeConfig.json`
    *   Configures all routes, sections, and guard-relevant properties.
    *   This is where developers add new routes or change visibility, roles, or dependencies.
*   `section` (string | object)
    *   Core knob for bundling: determines which section bundle a route uses.
    *   Supports per-role sections via `{ "creator": "...", "fan": "..." }`. DEV\_GUIDE\_COMPLETE
*   `requiresAuth` (boolean)
    *   Indicates whether the user must be logged in to access this route.
    *   Guards use this in combination with the Auth store’s `isAuthenticated`.
*   `supportedRoles` (string array)
    *   Limits access to certain roles (e.g. `[ "creator" ]`, `[ "creator", "fan" ]` or `[ "all" ]`).
    *   Omit or empty array ⇒ any authenticated role is allowed (subject to other guards).
*   `redirectIfLoggedIn` (string path)
    *   Used on auth routes (`/log-in`, `/sign-up`, `/confirm-email`).
    *   If the user is already authenticated and lands on such a route, they are redirected to the target path (e.g. `/dashboard`).
*   `inheritConfigFromParent` (boolean)
    *   When `true`, tells the resolver to inherit configuration from parent routes if the current entry omits that field.
    *   Useful for deep dashboards where children share section, auth and dependency semantics with their parent.
*   `customComponentPath` (object)
    *   Optional per-role override for `componentPath`.
    *   Example: `creator` and `fan` each get a different dashboard home component while sharing the same slug and section semantics.
*   `preLoadSections` (string array)
    *   Lists sections that should be preloaded when this route is hit to accelerate likely next navigations.
*   `enabled` (boolean)
    *   When `false`, route remains in config but guards will block access.
    *   Useful for feature flags and staged rollouts.
*   `VITE_BASE_URL`
    *   Integration point with Vue Router’s `createWebHistory(base)` to ensure correct path handling in non-root deployments. ENV\_SETUP\_GUIDE
*   `VITE_AUTH_DEV_SHIM`
    *   Controls whether the router sees dev-shim auth (simple local mock) or real Cognito auth.
    *   Changing this affects guard behaviour without touching routeConfig.
*   Wiring in `main.js`
    *   The router is installed via `app.use(router)` after Pinia and Auth initialization, ensuring guard contexts contain accurate auth state from the first navigation.
## Checklists
### Checklist – RouteConfig.json Quality
*   Every route has a unique `slug`.
*   Every route that renders a page has a valid `componentPath` that points to an existing `.vue` file.
*   `section` is defined and:
    *   Is a string, or
    *   Is an object mapping roles that actually exist in the system.
*   Auth-protected routes have `requiresAuth: true`.
*   Role-specific routes have a sensible `supportedRoles` list (no typos).
*   Auth screens that should bounce logged-in users have `redirectIfLoggedIn` set (e.g. `/dashboard`).
*   Deep dashboard routes with shared semantics use `inheritConfigFromParent` instead of duplicating configuration.
*   `preLoadSections` lists valid section names that exist in the bundling configuration.
*   Experimental/disabled routes have `enabled: false` and are covered in tests to avoid accidental exposure.
### Checklist – Guard and Router Wiring
*   `router/index.js` imports:
    *   `getRouteConfiguration`
    *   `runAllRouteGuards`
    *   `setCurrentActiveRoute`
    *   `resolveComponentPathForRoute`
*   The router builds its route table from `getRouteConfiguration()` rather than hard-coding path definitions.
*   `meta.routeConfig` is set on each route so guards and navigation helpers can access full configuration.
*   `beforeEach`:
    *   Builds guard context from `useAuthStore()` (auth state and role).
    *   Calls `runAllRouteGuards` and respects its `allow`/`redirectTo` result.
*   `afterEach`:
    *   Calls `setCurrentActiveRoute`.
    *   Triggers section preloading for `section` and `preLoadSections`.
    *   Lets translation loader run for the target section/locale.
*   `onError` hook logs navigation errors into `performanceTracker` and console.
### Checklist – Navigation State & History
*   `fullNavigationHistory` is updated on every successful navigation.
*   `currentActiveRoute` and `previousActiveRoute` are always in sync with router state.
*   Helpers such as `isOnPath`, `wasPreviouslyOnPath`, and `getNavigationHistory` can be called from dev tools to inspect navigation behaviour.
*   `clearNavigationHistory()` is called on logout or when resetting state in tests.
## Testing Guide
### Test Group – Route Resolution & Matching
*   Step: Navigate to a simple route (e.g. `/dashboard`) directly via URL.
    *   Expected: `resolveRouteFromPath('/dashboard')` returns the corresponding route config with the correct `section` and `componentPath`.
*   Step: Navigate to a nested dashboard path (e.g. `/dashboard/store/orders`).
    *   Expected: The route chain shows inheritance from `/dashboard` where `inheritConfigFromParent` is used; resolved section and auth/role semantics match the parent.
*   Step: Navigate to a non-existent path (e.g. `/this-path-does-not-exist`).
    *   Expected: The wildcard route matches and redirects to `/404`.
### Test Group – Auth & Role Gating
*   Step: Ensure `VITE_AUTH_DEV_SHIM=true` in development, then log out and visit `/dashboard`.
    *   Expected: Not authenticated; guard redirects to `/log-in`.
*   Step: Log in as a `creator` (via dev shim or Cognito) and navigate to a creator-only path like `/dashboard/store/custom-product-requests`.
    *   Expected: Navigation is allowed; correct creator component is loaded and `section` resolves to the creator dashboard section.
*   Step: Log in as a `fan` and attempt to visit a creator-only route.
    *   Expected: Role guard blocks; navigation is redirected to a safe route (e.g. fan dashboard or 403 page).
*   Step: While authenticated, try visiting `/log-in` and `/sign-up`.
    *   Expected: Guards detect `redirectIfLoggedIn` and push the user to the configured path (commonly `/dashboard`).
### Test Group – Dependency Gating (Onboarding/KYC where used)
*   Step: Using a user with `onboardingPassed=false`, try to access a route that declares onboarding as a dependency in routeConfig.
    *   Expected: Dependency guard blocks and redirects to the onboarding route.
*   Step: After toggling or updating the dependency flag (e.g. finishing onboarding), repeat navigation.
    *   Expected: Route is now accessible.
### Test Group – Section & PreLoadSections Behaviour
*   Step: Open DevTools Network tab, clear logs, then navigate to an auth route that preloads additional sections (e.g. `/confirm-email` with `preLoadSections: ["dashboard"]`).
    *   Expected: You see preloading requests for the `auth` section and the `dashboard` section assets as `modulepreload`/`preload` link requests.
*   Step: After the dashboard section has been preloaded, navigate to a dashboard route.
    *   Expected: No new JS/CSS network requests for that section; only translation JSON is fetched.
### Test Group – Navigation History & Loop Prevention
*   Step: Programmatically navigate between two routes in a tight loop via a misconfigured redirect.
    *   Expected: Loop guard detects repeated oscillation and stops additional redirects, logging the event.
*   Step: Inspect navigation history using helpers (e.g. in dev console):
    *   Call `getNavigationHistory()` and confirm that each step is recorded with path and timestamp.
    *   Call `wasPreviouslyOnPath('/dashboard')` after visiting and leaving `/dashboard` to confirm it returns `true`.
## Diagnostics & Developer Tools
*   `getRouteConfiguration()` – Returns the current cached route configuration array. Useful in the console to see exactly what the system thinks routes look like.
*   `resetRouteConfigurationCache()` – Clears caches so reloading in dev picks up changes in `routeConfig.json` without a full rebuild.
*   `resolveRouteFromPath(path)` – Given a path string, returns the resolved route object as the resolver sees it.
*   `resolveComponentPathForRoute(route, role)` – Shows which component is being chosen for a particular route and role.
*   `setCurrentActiveRoute(routeConfig)` – Manually update active route (mainly for tests).
*   `getCurrentActiveRoute()` / `getCurrentActivePath()` – Quick way to inspect where the system thinks you are.
*   `getPreviousActiveRoute()` / `getPreviousActivePath()` – Inspect where you came from.
*   `getNavigationHistory()` – Full list of navigation events for investigations.
*   `isOnPath(path)` / `wasPreviouslyOnPath(path)` – Simple boolean checks to confirm routing decisions.
*   `clearNavigationHistory()` – Reset navigation state between test runs.
*   `window.performanceTracker` – Global performance tracker that logs each routing step (guard stages, resolution, preloading). Check its logged tables for slow guards or problematic routes. DEV\_GUIDE\_COMPLETE
## Summary
The Routing & Route Configuration System ensures that **every navigation decision is driven by a single, auditable JSON file** and a small set of well-defined utilities. Routes declare their own slugs, sections, auth/role requirements, dependencies, and preloading hints, and the router simply interprets that configuration through a deterministic guard pipeline and resolver. For developers, this means adding or changing routes is as simple as editing `routeConfig.json`; for users, it means routing is predictable, fast (thanks to section preloading), and safe (thanks to consistent guards and history tracking).