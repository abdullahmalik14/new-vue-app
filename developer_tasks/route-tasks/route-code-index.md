# Route code index

**Date:** 2026-06-16  
**Project:** `new-vue-app-main/src/`  
**Purpose:** Every file and method/function where route-related code was found.

**Legend**

- **Core** — belongs in `systems/routing/` per `notes.md`
- **Entry** — `router/` (should stay thin)
- **Config** — JSON / schema only
- **Cross** — route logic in another system layer
- **Consumer** — UI or app code that calls the router (normal usage)
- **Build/Test** — tooling and tests

---

## Summary

| Layer | Files | Exported symbols (approx.) |
|-------|-------|----------------------------|
| `systems/routing/` | 23 code + 1 barrel | ~95 |
| `router/` | 1 code + 4 config | 6 local + 4 hook callbacks |
| Cross-system (`i18n`, `sections`, `assets`, `build`) | 10 | ~45 route-coupled |
| App bootstrap | 2 | 1 local |
| Components (route-system imports) | 4 | — |
| Components/templates (Vue Router consumers) | 27 | — |
| Build scripts | 6 | ~12 |
| Unit tests (route-related) | 30+ | — |
| Docs | 15+ | — |

---

## 1. `systems/routing/` — core route system

### `index.js` (barrel re-exports)

Re-exports from: `routeConfigLoader`, `routeResolver`, `routeGuards`, `routeNavigation`, `routeComponentPreloader`, `routeAssetPreloader` (assets), `useRoutePrefetch` (composables), `routeTransition`, `routeErrorBoundary`, `routeAliasResolver`, `routeNavigationResourceLoader`, `routeAdminAccess`, `routeComponentPathValidator`, `navigationProgressTracker`.

Orchestration: `createAppRouter.js` (not re-exported from barrel; imported by `router/index.js`).

---

### `routeConfigLoader.js`

| Symbol | Kind |
|--------|------|
| `loadRouteConfigurationFromFile` | export |
| `getCachedRouteConfiguration` | export |
| `resetRouteConfigurationCache` | export |
| `getRouteConfiguration` | export |

Imports: `router/routeConfig.json`, `config/sharedAssetPreloads.json`, `validateRouteConfig`, `resolveRouteAssetPreloads`, `validateRouteComponentPathsWithResolver`, `validateRouteAssetPreloadFlags`.

### `routeResolver.js`

| Symbol | Kind |
|--------|------|
| `resolveRouteFromPath` | export |
| `resolveExactRouteFromPath` | export |
| `resolveComponentPathForRoute` | export |
| `inheritConfigurationFromParentRoute` | export |
| `resolveEffectiveAssetPreloadForRoute` | export |
| `getRouteChainForPath` | export |

---

### `routeGuards.js`

| Symbol | Kind |
|--------|------|
| `runAllRouteGuards` | export |
| `guardPreventNavigationLoop` | export |
| `guardCheckRouteEnvironmentAccess` | export |
| `guardCheckRouteAdminAccess` | export |
| `guardCheckAuthentication` | export |
| `guardCheckRouteUserRole` | export |
| `guardCheckDependencies` | export |
| `markGuardRedirectNavigation` | export |
| `consumeGuardRedirectNavigation` | export |
| `shouldClearGuardLoopHistoryAfterNavigation` | export |
| `clearGuardNavigationHistory` | export |
| `getOrderedRoleDependencyEntries` | internal |
| `arePrerequisiteDependenciesMet` | internal |

---

### `routeNavigation.js`

| Symbol | Kind |
|--------|------|
| `setCurrentActiveRoute` | export |
| `getCurrentActivePath` | export |
| `getCurrentActiveRoute` | export |
| `getCurrentRouteChain` | export |
| `getPreviousActivePath` | export |
| `getPreviousActiveRoute` | export |
| `getNavigationHistory` | export |
| `canNavigateBack` | export |
| `clearNavigationHistory` | export |
| `getNavigationStatistics` | export |
| `isOnPath` | export |
| `wasPreviouslyOnPath` | export |

---

### `routeAliasResolver.js`

| Symbol | Kind |
|--------|------|
| `normalizeRoutePath` | export |
| `buildLocaleOptionalRoutePath` | export |
| `normalizeRedirectFromList` | export |
| `normalizeAliasList` | export |
| `buildVueRouterAliases` | export |
| `doesRouteConfigMatchPath` | export |
| `createRedirectFromRouteRecords` | export |
| `collectRoutePathClaims` | export |
| `findDuplicateRoutePathClaims` | export |

---

### `routeComponentLoader.js`

| Symbol | Kind |
|--------|------|
| `findComponentLoader` | export |
| `loadComponentModule` | export |

---

### `routeComponentPreloader.js`

| Symbol | Kind |
|--------|------|
| `normalizeTargetPath` | export |
| `resolveRouteForPrefetch` | export |
| `prefetchRouteComponent` | export |
| `createRoutePrefetchIntentHandler` | export |
| `resetRoutePrefetchCache` | export |

---

### `systems/assets/routeAssetPreloader.js`

| Symbol | Kind |
|--------|------|
| `prefetchSectionAssetsForRoute` | export |
| `createSectionAssetPrefetchIntentHandler` | export |
| `resetRouteAssetPrefetchCache` | export |

---

### `systems/assets/routeAssetPreloadResolver.js`

| Symbol | Kind |
|--------|------|
| `resolveRouteAssetPreloads` | export |

---

### `composables/useRoutePrefetch.js`

| Symbol | Kind |
|--------|------|
| `createRoutePrefetchIntentHandler` | export (wraps component + asset prefetch) |
| `useRoutePrefetch` | export (Vue composable) |

---

### `routeTransition.js`

| Symbol | Kind |
|--------|------|
| `ROUTE_TRANSITION_PRESETS` | export const |
| `resolveRouteTransition` | export |

---

### `routeErrorBoundary.js`

| Symbol | Kind |
|--------|------|
| `createRouteRenderError` | export |
| `shouldClearRouteErrorOnNavigation` | export |

---

### `routeDefaults.js`

| Symbol | Kind |
|--------|------|
| `getDefaultNotFoundSlug` | export |
| `getDefaultGuardErrorSlug` | export |
| `getDefaultNavigationErrorSlug` | export |
| `getDefaultLoginSlug` | export |
| `getDefaultDashboardSlug` | export |
| `ROUTE_DEFAULTS` | export const |

Imports: `router/routeDefaults.json`.

---

### `routeEnvAccess.js`

| Symbol | Kind |
|--------|------|
| `ROUTE_ENV_ACCESS` | export const |
| `isDevelopmentEnvironment` | export |
| `isRouteAccessibleInCurrentEnvironment` | export |
| `isValidRouteEnvAccess` | export |

---

### `routeAdminAccess.js`

| Symbol | Kind |
|--------|------|
| `isAdminUser` | export |
| `isRouteAccessibleToAdmin` | export |

---

### `routeNavigationResourceLoader.js`

| Symbol | Kind |
|--------|------|
| `resolveCurrentSectionForNavigation` | export |
| `loadCurrentSectionResources` | export |

---

### `navigationProgressTracker.js`

| Symbol | Kind |
|--------|------|
| `startNavigationProgress` | export |
| `finishNavigationProgress` | export |
| `failNavigationProgress` | export |
| `useNavigationProgress` | export (Vue composable) |

---

### `navigationErrorHandler.js`

| Symbol | Kind |
|--------|------|
| `isChunkLoadNavigationError` | export |
| `isOnNavigationErrorRoute` | export |
| `recoverFromChunkLoadError` | export |

---

### `scrollBehavior.js`

| Symbol | Kind |
|--------|------|
| `resolveRouterScrollPosition` | export |

---

### `notFoundComponentLoader.js`

| Symbol | Kind |
|--------|------|
| `NOT_FOUND_COMPONENT_PATH` | export const |
| `loadNotFoundComponent` | export |

---

### `routeComponentPathValidator.js`

| Symbol | Kind |
|--------|------|
| `componentPathToRelativeFile` | export |
| `collectComponentPathsFromRoute` | export |
| `collectComponentPathsFromRoutes` | export |
| `getComponentPathValidationError` | export |
| `validateRouteComponentPathsWithResolver` | export |

---

### `routeComponentPathDiskValidator.node.js`

| Symbol | Kind |
|--------|------|
| `componentPathToAbsoluteFile` | export |
| `validateRouteComponentPathsOnDisk` | export |

---

### `createAppRouter.js`

| Symbol | Role |
|--------|------|
| `default` export | Factory — `createRouter` + hook registration |

**Vue Router hooks registered here:** `beforeEach` (locale inject, guards), `beforeResolve` (section resource loads), `afterEach` (navigation state, hreflang, preload), `onError` (chunk recovery).

**Local helpers (not exported):** `generateRoutesFromConfig`, `loadRouteComponent`, locale-aware redirect builders, etc.

---

## 2. `router/` — entry + config

### `index.js` — thin re-export

| Symbol | Source |
|--------|--------|
| `default` | `createAppRouter.js` |
| `prefetchRouteComponent` | `systems/routing/index.js` |
| `createRoutePrefetchIntentHandler` | `systems/routing/index.js` |
| `prefetchSectionAssetsForRoute` | `systems/routing/index.js` |

---

### Config / docs (no executable route logic)

| File | Role |
|------|------|
| `routeConfig.json` | Route definitions (slugs, components, guards meta) |
| `routeDefaults.json` | Default slugs for errors/auth |
| `routeConfig.schema.md` | Schema documentation |

Shared asset catalog: `config/sharedAssetPreloads.json` (not in `router/`).

Routing documentation: [RoutingExplained.md](./RoutingExplained.md) only — no `README.md` in `router/` or `systems/routing/`.

## 3. Cross-system route logic

### `systems/i18n/localeManager.js`

Route-coupled exports used by `router/index.js` and navigation:

| Symbol | Route role |
|--------|------------|
| `getLeadingLocaleFromPath` | Strip/inject locale prefix |
| `stripLeadingLocaleFromPath` | Normalize path before resolve |
| `normalizeLocalizedPath` | Alias for strip |
| `registerLocaleRouter` | Wire router into locale system |
| `resolveActiveLocale` | Current locale for preload |
| `resolveActiveLocaleForNavigation` | Per-navigation locale |
| `applyLocaleTemporarily` | URL locale in `beforeEach` |
| `reapplyTemporaryPageLocaleForRoute` | Restore temp locale |
| `syncTemporaryPageLocaleFromUrl` | Sync from URL segment |
| `resolveLocaleForUrlInjection` | Inject locale into path |
| `getDisplayedLocale` | UI locale from path |
| `setActiveLocale` | Dynamic import of `resolveRouteFromPath` on locale change |
| `translateCurrentPageTemporarily` | Route-aware translation |
| `clearTemporaryPageLocaleAndRestore` | Restore after temp locale |
| `reapplyTemporaryPageLocaleForRoute` | Reapply on navigation |

---

### `systems/i18n/routeHreflangTags.js`

| Symbol | Route role |
|--------|------------|
| `buildLocalePrefixedPath` | Uses `stripLeadingLocaleFromPath` |
| `buildHreflangAlternateUrls` | Alternate URLs per locale |
| `clearHreflangTags` | Called when no route config |
| `syncHreflangTagsForPath` | Called in `router.afterEach` |

---

### `systems/sections/sectionResolver.js`

| Symbol | Route role |
|--------|------------|
| `getPreloadSectionsForRoute` | `route.preLoadSections` → section list |
| `getAllRouteSectionsForRoute` | All sections for a route |
| `resolveSectionIdentifier` | Uses `resolveRouteFromPath` for slug match |
| `resolveRoleSectionVariant` | Role-based `route.section` |
| `resolveRolePreLoadSections` | internal — role-keyed preload |
| `normalizeSectionConfiguration` | Section config from route |
| `isSectionRoleBased` | Section shape helper |
| `getAllSectionVariants` | Section shape helper |

---

### `systems/sections/sectionPreloadOrchestrator.js`

| Symbol | Route role |
|--------|------------|
| `resolveEffectiveRouteConfig` | Inherits parent route config |
| `getRoutePreloadPlan` | Plan sections to preload for route |
| `resolveCurrentRouteSectionName` | Current section name |
| `shouldPreloadDefaultAuthSection` | Auth route preload gate |
| `preloadDefaultAuthSection` | Default auth preload |
| `startBackgroundSectionPreloads` | Post-nav preload loop |
| `refreshSectionPreloadsOnLocaleChange` | Locale change preload |

Imports: `inheritConfigurationFromParentRoute`, `getPreloadSectionsForRoute`.

---

### `systems/assets/routeSectionAssetPreloadEntries.js`

| Symbol | Route role |
|--------|------------|
| `routeBelongsToSection` | Match route to section |
| `isRouteEnabledForAssetPreload` | Route enabled check |
| `getAssetPreloadEntriesForSection` | Reads route config for section assets |
| `dedupeAssetPreloadEntries` | Dedup helper |
| `clearAssetPreloadSectionCache` | Cache reset |

---

### `systems/assets/validateRouteAssetPreloadFlags.js`

| Symbol | Route role |
|--------|------------|
| `collectAssetMapFlags` | Asset map flags |
| `validateAssetPreloadEntryShape` | Per-route entry shape |
| `validateRouteAssetPreloadRefs` | `assetPreloadRef` on route |
| `validateRouteAssetPreloadFlags` | Full route array validation |
| `validateSharedCatalogAssetPreloadFlags` | Shared catalog validation |

---

### `systems/assets/resolveSharedComponentAssets.js`

Imports `config/sharedAssetPreloads.json`. No route-specific function names; shared catalog resolution for route asset preload.

---

### `systems/build/jsonConfigValidator.js`

| Symbol | Route role |
|--------|------------|
| `collectKnownSectionNames` | From route array |
| `buildRouteSlugIndex` | Slug → route map |
| `resolvePreloadSectionIdentifier` | Resolve preload ID via routes |
| `collectPreloadSectionIdentifiers` | Parse `preLoadSections` |
| `validateRouteConfig` | Main route JSON validator |

Imports: `config/sharedAssetPreloads.json`, `isValidRouteEnvAccess`, `validateRouteAssetPreloadFlags`.

---

## 4. App bootstrap

### `app/main.js`

| Symbol / usage | Route role |
|----------------|------------|
| `import router from '@/router/index.js'` | Mount router |
| `registerLocaleRouter(router)` | Locale ↔ router wiring |
| `resolveRouteFromPath` | Startup route resolution |
| `getRoutePreloadPlan` | Startup section preload plan |
| `startStartupPreloadForCurrentRoute` | **local** — preload on boot |
| `router.currentRoute.value.path` | Current path reads |
| `router.isReady()` | Wait before startup preload |

---

### `app/App.vue`

| Symbol / usage | Route role |
|----------------|------------|
| `useRouter`, `useRoute` | Vue Router composables |
| `resolveRouteTransition(route)` | Transition preset from route meta |
| `RouterView` + `RouteErrorBoundary` | Render + error boundary |
| `route.meta?.routeConfig?.hideLayout` | Layout visibility |

---

### `composables/useDisplayedLocaleSync.js`

| Symbol | Route role |
|--------|------------|
| `useRoute` | Watches `route.path` / `route.fullPath` |
| `getDisplayedLocale(route.path)` | Display locale from path |

---

## 5. Components with route-system imports

*(Beyond normal `useRouter` / `RouterLink` usage)*

### `components/layout/AppFooter.vue`

- Imports `routeConfig.json` directly
- `createRoutePrefetchIntentHandler` from `useRoutePrefetch.js`
- Local: navigable route list built from `routeConfig`
- `useRouter`, `useRoute`

### `components/layout/RouteErrorBoundary.vue`

- `getDefaultDashboardSlug` from `routeDefaults.js`
- `createRouteRenderError`, `shouldClearRouteErrorOnNavigation` from `routeErrorBoundary.js`
- `useRouter` → `router.push(getDefaultDashboardSlug())`

### `components/layout/NavigationProgressBar.vue`

- `useNavigationProgress` from `navigationProgress.js`

### `components/layout/dev/DevNavBar.vue`

- `useRouter` → `router.push` to auth/dashboard/profile

---

## 6. Templates / components — Vue Router consumers

Normal navigation UI (no `systems/routing` imports unless noted).

| File | APIs used |
|------|-----------|
| `templates/auth/views/AuthLogIn.vue` | `RouterLink`, `useRouter`, `useRoute`, `router.push`, `createRoutePrefetchIntentHandler` |
| `templates/auth/views/AuthSignUp.vue` | `RouterLink`, `useRouter`, `useRoute`, `router.push` |
| `templates/auth/views/AuthConfirmEmail.vue` | `useRouter`, `useRoute`, `router.push` |
| `templates/auth/views/AuthResetPassword.vue` | `useRouter`, `useRoute`, `router.push` |
| `templates/auth/views/AuthLostPassword.vue` | `useRouter`, `useRoute`, `router.push` |
| `templates/auth/views/AuthSignUpOnboarding.vue` | `useRouter`, `router.push` |
| `templates/auth/views/AuthSignUpOnboardingKyc.vue` | `useRouter`, `router.push` |
| `templates/auth/page/role/TwitterAuthPage.vue` | `useRoute` |
| `templates/auth/page/role/TelegramAuthPage.vue` | `useRoute` |
| `templates/dashboard/shared/DashboardSharedSidebar.vue` | `$router.push`, `createRoutePrefetchIntentHandler` |
| `templates/dashboard/shared/DashboardSharedHeader.vue` | `$router.push` |
| `templates/shop/ShopPage.vue` | `useRouter`, `router.push` |
| `templates/shop/ShopSidebar.vue` | `RouterLink` |
| `templates/home/HomeSidebar.vue` | `RouterLink` |
| `templates/discover/DiscoverSidebar.vue` | `RouterLink` |
| `templates/about/AboutSidebar.vue` | `RouterLink` |
| `templates/contact/ContactSidebar.vue` | `RouterLink` |
| `templates/profile/popups/ProfileLoginPopup.vue` | Intercepts `router.push` in popup context |
| `components/forms/booking-form/UnifiedBookingForm.vue` | `useRoute` |
| `components/ui/nav/language/LanguageSwitcher.vue` | `useRoute` |
| `components/ui/nav/language/SettingsLanguageField.vue` | `useRoute` |
| `components/ui/nav/language/TranslatePageControl.vue` | `useRoute` |
| `components/ui/nav/dashboard/NavDropdown.vue` | `useRouter`, `router.push` |
| `components/ui/dropdowns/demo/DemoDropdowns.vue` | `RouterLink` |

---

## 7. Build tooling

| File | Route-related symbols / usage |
|------|------------------------------|
| `build/buildConfig.js` | `extractAllSectionsFromRouteConfig`, `shouldSectionBePreloaded`, `validateRouteConfiguration` |
| `build/vite/sectionBundler.js` | Reads `routeConfig.json`, calls `validateRouteConfig`, `validateRouteComponentPathsOnDisk` |
| `build/vite/sectionCssPlugin.js` | `routeConfigPath` → `src/router/routeConfig.json` |
| `build/vite/manifestGenerator.js` | `enrichManifestWithMetadata(manifest, routeConfigPath)` |
| `build/tailwind/buildSectionCss.js` | `routeConfigPath` |
| `build/tailwind/sectionCssBuilder.js` | `buildAllSectionConfigs(routeConfigPath)` |
| `build/tailwind/sectionScanner.js` | `scanRouteConfigForSections`, `generateAllSectionContentPaths`, `getSectionForComponent` |

---

## 8. Assets

| File | Role |
|------|------|
| `src/assets/route-transitions.css` | CSS for route transition animations (imported in `main.js`) |

---

## 9. Unit tests (route-related)

Route unit tests import from `@/systems/routing/`, `@/systems/assets/`, and `@/composables/` (Phase 1 fixed legacy `utils/route/` paths).

**Shared helpers:** `tests/helpers/routeFixtures.js` — `makeRoute()`, `makeGuardContext()`, `loadProductionRouteConfig()`, `MINIMAL_ROUTE_FIXTURES`.

**Phase A integrity:** `tests/unit/routeConfig.integrity.test.js` — production `routeConfig.json` validation.

Key suites: `routeGuards.test.js`, `routeConfig.integrity.test.js`, `jsonConfigValidator.route.test.js`, `routeComponentPathValidator.test.js`, `routeComponentPrefetch.test.js`, `useRoutePrefetch.test.js`, `resolveRouteAssetPreloads.test.js`.

**Run:** `npm run test:unit -- --run tests/unit/route`

**Plan:** [route-test-plan.md](../route-test-plan.md)

---

## 10. Documentation referencing route code

**Canonical:** [RoutingExplained.md](./RoutingExplained.md) (developer + AI sections).  
**Also check:** `docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md`, `docs/TESTING_CHECKLISTS.md`, `docs/tasks/*.md`, `docs/archived/*.md` — many still mention `utils/route/`.  
**Removed:** `src/router/README.md`, `src/systems/routing/README.md`, `docs/instruction/RoutingExplained.md`.

---

## 11. Not route-system code (name collision only)

| File | Note |
|------|------|
| `lib/mock-api-demo/MockApi.js` | HTTP mock `routes` config — not Vue Router |
| `services/flow-system/utils/pipelineExtraContext.js` | `"routeName"` string key only |

---

## Quick reference: where logic should live

| Should be in | Status (post Phase 7) |
|--------------|------------------------|
| `router/` entry + JSON | ✅ `index.js` thin re-export; config JSON + schema only |
| `systems/routing/` | ✅ Core modules + `createAppRouter.js` |
| `systems/assets/` | ✅ `routeAssetPreloader.js`, `routeAssetPreloadResolver.js`, etc. |
| `composables/` | ✅ `useRoutePrefetch.js` |
| `config/` | ✅ `sharedAssetPreloads.json` |
| `components/` | ✅ `AppFooter.vue` uses `getRouteConfiguration()` |
