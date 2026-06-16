# Route code index

**Date:** 2026-06-10  
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

Re-exports from: `routeConfigLoader`, `routeResolver`, `routeGuards`, `routeNavigation`, `routeComponentPrefetch`, `routeAssetPrefetch`, `useRoutePrefetch`, `routeTransition`, `routeErrorBoundary`, `routeAliases`, `routeNavigationData`, `routeAdminAccess`, `routeComponentPathValidator`, `navigationProgress`.

---

### `routeConfigLoader.js`

| Symbol | Kind |
|--------|------|
| `loadRouteConfigurationFromFile` | export |
| `getCachedRouteConfiguration` | export |
| `resetRouteConfigurationCache` | export |
| `getRouteConfiguration` | export |

Imports: `router/routeConfig.json`, `router/sharedAssetPreloads.json`, `validateRouteConfig`, `resolveRouteAssetPreloads`, `validateRouteComponentPathsWithResolver`, `validateRouteAssetPreloadFlags`.

---

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
| `guardCheckRouteEnabled` | export |
| `guardCheckRouteAdminAccess` | export |
| `guardCheckAuthentication` | export |
| `guardCheckUserRole` | export |
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

### `routeAliases.js`

| Symbol | Kind |
|--------|------|
| `normalizeRoutePath` | export |
| `buildLocaleOptionalRoutePath` | export |
| `normalizeRedirectFromList` | export |
| `normalizeAliasList` | export |
| `buildVueRouterAliases` | export |
| `routeConfigMatchesPath` | export |
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

### `routeComponentPrefetch.js`

| Symbol | Kind |
|--------|------|
| `normalizeTargetPath` | export |
| `resolveRouteForPrefetch` | export |
| `prefetchRouteComponent` | export |
| `createRoutePrefetchIntentHandler` | export |
| `resetRoutePrefetchCache` | export |

---

### `routeAssetPrefetch.js` *(misplaced — notes say `systems/assets/`)*

| Symbol | Kind |
|--------|------|
| `prefetchSectionAssetsForRoute` | export |
| `createSectionAssetPrefetchIntentHandler` | export |
| `resetRouteAssetPrefetchCache` | export |

---

### `resolveRouteAssetPreloads.js` *(misplaced — notes say `systems/assets/`)*

| Symbol | Kind |
|--------|------|
| `resolveRouteAssetPreloads` | export |

---

### `useRoutePrefetch.js` *(misplaced — notes say `composables/`)*

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

### `routeNavigationData.js`

| Symbol | Kind |
|--------|------|
| `resolveCurrentSectionForNavigation` | export |
| `startCurrentSectionResourceLoads` | export |

---

### `navigationProgress.js`

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

### `routeComponentPathValidator.node.js`

| Symbol | Kind |
|--------|------|
| `componentPathToAbsoluteFile` | export |
| `validateRouteComponentPathsOnDisk` | export |

---

## 2. `router/` — entry + config

### `index.js` (749 lines) — **Entry, still holds orchestration**

**Local functions (not exported)**

| Symbol | Role |
|--------|------|
| `resolveLocaleFromRouteLocation` | Locale from route params/path |
| `buildLocaleAwareRedirectPath` | Locale-prefixed redirect targets |
| `generateRoutesFromConfig` | Builds Vue Router records from JSON |
| `resolveUserRoleForComponentLoad` | Role for dynamic import |
| `loadRouteComponent` | Async component loader per route |
| `loadViaGlob` | Glob-based component resolution |

**Vue Router instance**

| Symbol | Role |
|--------|------|
| `createRouter` / `createWebHistory` | Router construction |
| `scrollBehavior` callback | Delegates to `resolveRouterScrollPosition` |
| `router.beforeEach` | Locale inject, guards, section meta |
| `router.beforeResolve` | `startCurrentSectionResourceLoads` |
| `router.afterEach` | Navigation state, hreflang, section preload |
| `router.onError` | Chunk-load recovery |

**Re-exports (default export + named)**

| Symbol | Source |
|--------|--------|
| `default` | router instance |
| `prefetchRouteComponent` | `systems/routing/index.js` |
| `createRoutePrefetchIntentHandler` | `systems/routing/index.js` |
| `prefetchSectionAssetsForRoute` | `systems/routing/index.js` |

**Calls into (non-exhaustive):** `getRouteConfiguration`, `runAllRouteGuards`, `setCurrentActiveRoute`, `resolveComponentPathForRoute`, guard loop helpers, `isRouteAccessibleInCurrentEnvironment`, locale manager (`applyLocaleTemporarily`, `reapplyTemporaryPageLocaleForRoute`, `syncTemporaryPageLocaleFromUrl`, `resolveLocaleForUrlInjection`, `getLeadingLocaleFromPath`, `stripLeadingLocaleFromPath`, `resolveActiveLocale`, `resolveActiveLocaleForNavigation`), `resolveRoleSectionVariant`, `getRoutePreloadPlan`, `resolveEffectiveRouteConfig`, `startBackgroundSectionPreloads`, `loadNotFoundComponent`, `findComponentLoader`, navigation error/progress/scroll/alias/navigationData modules, `syncHreflangTagsForPath`, `clearHreflangTags`.

---

### Config / docs (no executable route logic)

| File | Role |
|------|------|
| `routeConfig.json` | Route definitions (slugs, components, guards meta) |
| `routeDefaults.json` | Default slugs for errors/auth |
| `sharedAssetPreloads.json` | Shared asset preload catalog *(misplaced in router/)* |
| `routeConfig.schema.md` | Schema documentation |
| `README.md` | Router docs *(still references old `utils/route/`)* |

---

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

### `systems/i18n/hreflangTags.js`

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

### `systems/assets/getAssetPreloadEntriesForSection.js`

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

Imports `router/sharedAssetPreloads.json`. No route-specific function names; shared catalog resolution for route asset preload.

---

### `systems/build/jsonConfigValidator.js`

| Symbol | Route role |
|--------|------------|
| `collectKnownSectionNames` | From route array |
| `buildRouteSlugIndex` | Slug → route map |
| `resolvePreloadSectionIdentifier` | Resolve preload ID via routes |
| `collectPreloadSectionIdentifiers` | Parse `preLoadSections` |
| `validateRouteConfig` | Main route JSON validator |

Imports: `router/sharedAssetPreloads.json`, `isValidRouteEnvAccess`, `validateRouteAssetPreloadFlags`.

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

### Tests still importing dead `src/utils/route/` paths (broken)

| Test file | Imports from `utils/route/` |
|-----------|----------------------------|
| `routeAdminAccess.test.js` | `routeAdminAccess`, `routeGuards` |
| `routeAliases.test.js` | `routeAliases` |
| `routeChain.test.js` | `routeResolver` |
| `routeComponentPathValidator.test.js` | `routeComponentPathValidator`, `.node` |
| `routeEnvAccess.test.js` | `routeEnvAccess`, `routeGuards` |
| `routeErrorBoundary.test.js` | `routeErrorBoundary` |
| `routeGuards.test.js` | `routeGuards` |
| `routeGuardsS6.test.js` | `routeGuards` |
| `routeInheritance.test.js` | `routeResolver`, `routeGuards` (+ `utils/section/sectionPreloadOrchestrator`) |
| `routeNavigation.test.js` | `routeNavigation` |
| `routeNavigationData.test.js` | `routeNavigationData` |
| `routeTransition.test.js` | `routeTransition` |
| `scrollBehavior.test.js` | `scrollBehavior` |
| `navigationErrorHandler.test.js` | `navigationErrorHandler` |
| `navigationProgress.test.js` | `navigationProgress` |
| `guardLoopHistoryClear.test.js` | `routeGuards` |
| `resolveRouteAssetPreloads.test.js` | `resolveRouteAssetPreloads` |
| `assetMapBuildValidation.test.js` | `resolveRouteAssetPreloads` |
| `startupRouteResolution.test.js` | `@/utils/route/routeResolver`, `@/utils/translation/localeManager` |
| `routeAssetPrefetch.test.js` | mocks `utils/route/routeComponentPrefetch` |
| `useRoutePrefetch.test.js` | mocks `utils/route/routeComponentPrefetch`, `routeAssetPrefetch` |
| `validateRouteAssetPreloadFlags.test.js` | `utils/assets/validateRouteAssetPreloadFlags` (path may also be stale) |

### Tests reading `router/` config (paths OK)

`assetMapBuildValidation.test.js`, `cognitoScriptSelfHost.test.js`, `dashboardLayoutSectionRoutes.test.js`, `jsonConfigValidator.test.js`, `resolveRouteAssetPreloads.test.js`, `routerExports.test.js`, `sectionScanner.test.js`, `sharedComponentAssetMappings.test.js`, `validateI18n.test.js`, `shopAssetPreloadConfig.test.js`

### Other route tests

`routeComponentPrefetch.test.js`, `performanceTrackerGuards.test.js`, `clearNavigationHistoryNaming.test.js`, `applyLocaleTemporarily.test.js`, `updateUrlWithLocale.test.js`, `routerLocaleInject.test.js`

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

## Quick reference: where logic should live (`notes.md`)

| Should be in | Currently also in |
|--------------|-------------------|
| `router/` entry + JSON | `router/index.js` (749 lines orchestration), `sharedAssetPreloads.json` |
| `systems/routing/` | ✅ 23 modules |
| `systems/assets/` | `routeAssetPrefetch.js`, `resolveRouteAssetPreloads.js` still in routing |
| `composables/` | `useRoutePrefetch.js` still in routing |
| `components/` | `AppFooter.vue` imports `routeConfig.json` directly |
