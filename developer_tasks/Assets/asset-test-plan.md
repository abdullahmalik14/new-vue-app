# Asset test plan (Vitest)

**Date:** 2026-06-10
**Status:** Planning only — implement after asset refactor stabilizes (see [docs/ASSET_PLAN.md](./docs/ASSET_PLAN.md)).
**Runner:** Vitest (`npm run test:unit`) — **one line below = one `it(...)` test case.**
**Coverage goal:** Every exported symbol in asset modules + section↔route asset integration + asset-coupled routing helpers.

**Import path after refactor:** `@/systems/assets/...` (replace stale `src/utils/assets/`).

**Conventions**

- Mock `fetch` / dynamic `import()` for section maps; use fixture `assetMap` objects in unit tests.
- Use `vi.stubEnv('MODE', ...)` and `import.meta.env` stubs for environment inheritance cases.
- Reset module state via `resetAssetLibrary()` / `clearAssetCaches()` / `clearPreloadCache()` in `beforeEach`.
- Route fixtures: minimal `{ path, slug, section, assetPreload, assetPreloadRef, disabled, supportedRoles }` objects.
- Section fixtures: string section id or `{ roleName: sectionId }` object for role-based routing.

---

## Suggested test file layout

| File | Module under test |
|------|-------------------|
| `assetMapSource.test.js` | `assetMapSource.js` |
| `sectionAssetMapSource.test.js` | `sectionAssetMapSource.js` |
| `assetLibrary.normalize.test.js` | `normalizeAssetMapUrl, normalizeGetAssetUrlArgs` |
| `assetLibrary.environment.test.js` | `setEnvironment, getEnvironment, getAssetMapFetchCandidates` |
| `assetLibrary.config.test.js` | `loadAssetMapConfig, loadSectionAssetMap, getAssetMapConfigSource` |
| `assetLibrary.getAssetUrl.test.js` | `getAssetUrl, getAssetUrlSync, inheritance` |
| `assetLibrary.getAssetUrl.variants.test.js` | `getAssetUrlForCss, getAssetUrlForAttr` |
| `assetLibrary.getAssetUrls.test.js` | `getAssetUrls, preloadAssetUrls` |
| `assetLibrary.flags.test.js` | `hasAssetFlag, hasAssetFlagInMap, getAvailableAssetFlags, getKnownGlobalFlags` |
| `assetLibrary.section.test.js` | `loadAssetsForSection, preloadAssetsForSections, section metadata` |
| `assetLibrary.cache.test.js` | `clearAssetCaches, clearAssetMapConfigCache, unloadUnusedSections` |
| `assetLibrary.init.test.js` | `initAssetLibrary, primeAssetIndex, validateAssetMap, isAssetLibraryInitialized` |
| `assetLibrary.category.test.js` | `getAssetsByCategory, isAssetCategoryCached, getAssetStatistics` |
| `assetPreloader.retry.test.js` | `withPreloadRetry, runInConcurrencyChunks, ASSET_PRELOAD_MAX_CONCURRENCY` |
| `assetPreloader.priority.test.js` | `resolveFetchPriority, shouldInjectExecutableScript` |
| `assetPreloader.image.test.js` | `preloadImage` |
| `assetPreloader.font.test.js` | `preloadFont` |
| `assetPreloader.media.test.js` | `preloadMedia` |
| `assetPreloader.script.test.js` | `preloadScript, injectExecutableScript` |
| `assetPreloader.json.test.js` | `preloadJSON` |
| `assetPreloader.asset.test.js` | `preloadAsset, preloadAssets` |
| `assetPreloader.section.test.js` | `preloadSectionAssets, preloadSectionCriticalImages, areSectionAssetUrlsFullyPreloaded` |
| `assetPreloader.resolve.test.js` | `resolveAssetPreloadUrl(s), enrichAssetsWithPreloadUrls` |
| `assetPreloader.cache.test.js` | `clearPreloadCache, getPreloadedAssetsCount` |
| `assetScanner.extract.test.js` | `extractAssetsFromComponent, extractLiteralBoundAttribute, extractBoundAttributeExpression` |
| `assetScanner.scan.test.js` | `scanScriptForAssetFlagReferences, scanComponentForAssetReferences, scanSectionComponents` |
| `assetScanner.util.test.js` | `resolveAssetSlotFlagsFromScript, shouldIgnoreComponent, normalizeAssetDefinition` |
| `assertAllowedPreloadUrl.test.js` | `assertAllowedPreloadUrl.js` |
| `getAssetPreloadEntriesForSection.helpers.test.js` | `dedupeAssetPreloadEntries, routeBelongsToSection, isRouteEnabledForAssetPreload` |
| `getAssetPreloadEntriesForSection.rollup.test.js` | `getAssetPreloadEntriesForSection, clearAssetPreloadSectionCache` |
| `validateRouteAssetPreloadFlags.test.js` | `all validators + ALLOWED_* constants` |
| `validateSharedComponentAssetMappings.test.js` | `validateSharedComponentAssetMappings` |
| `resolveSharedComponentAssets.test.js` | `shared chrome resolution` |
| `resolveRouteAssetPreloads.test.js` | `ref expansion + merge order` |
| `routeAssetPrefetch.test.js` | `prefetchSectionAssetsForRoute, intent handlers, cache reset` |
| `useRoutePrefetch.test.js` | `useRoutePrefetch composable` |
| `routeResolver.assetPreload.test.js` | `resolveEffectiveAssetPreloadForRoute + C-02 inheritance` |
| `resetAssetLibrary.test.js` | `resetAssetLibrary, resetAssetSystem alias` |
| `assetHandlerFactory.test.js` | `createAssetHandler` |
| `assetHandler.config.test.js` | `loadConfigFromJSON, validateConfig, setGlobalVersion` |
| `assetHandler.lifecycle.test.js` | `isReady, whenReady, dispose, getStatistics` |
| `assetHandler.dom.test.js` | `isAssetAlreadyInDOM, createElementForAsset, insertAssetElement, removeAssetFromDOM` |
| `assetHandler.load.test.js` | `loadAsset, loadAssetsInParallelWithThrottle, preloadAssetsByFlag` |
| `assetHandler.deps.test.js` | `ensureAssetDependencies, areAssetDependenciesReady, resolveDependencies` |
| `assetHandler.mount.test.js` | `loadAssetsBeforeMount, mount blockers, loadAssetsForEvent` |
| `assetHandler.lazy.test.js` | `observeLazyAssets, loadAssetsImmediatelyForSelector` |
| `scriptAvailabilityChecker.test.js` | `script + handler singleton` |
| `usePreloadStore.test.js` | `preload Pinia store` |
| `useAssetUrl.test.js` | `composable` |
| `menuItems.assets.test.js` | `resolveMenuItemsWithAssets` |
| `sectionPreloader.assets.test.js` | `section → asset preload integration` |
| `routeNavigationData.assets.test.js` | `navigation asset warmup` |
| `routeConfigLoader.assets.test.js` | `loader + asset validation` |
| `jsonConfigValidator.assets.test.js` | `build validation` |
| `appBuildHash.preload.test.js` | `syncPreloadStoreBuildHash` |
| `router.index.assets.test.js` | `router asset hooks` |
| `main.assets.bootstrap.test.js` | `initAssetLibrary bootstrap` |
| `assetsIndexExports.test.js` | `index.js barrel` |
| `syncAssetMapToPublic.test.js` | `build sync` |
| `assetMap.integrity.test.js` | `production assetMap.json` |
| `sharedAssetPreloads.integrity.test.js` | `shared catalog JSON` |
| `assets.integration.test.js` | `end-to-end section asset flows` |
| `assetMap.auth.integrity.test.js` | `config/assetMap.auth.json` section map |
| `usePreloadStore.persistence.test.js` | `normalizeStringSet`, persist hydrate/migrate |
| `usePreloadStore.actions.test.js` | all store getters and actions |
| `auth.templates.assets.test.js` | auth views AssetHandler lifecycle |
| `dashboard.shared.assets.test.js` | header/sidebar chrome asset loading |
| `assets.consumers.test.js` | Cart, CountryStateSelect, AppFooter prefetch |
| `routing.index.assetExports.test.js` | `systems/routing/index.js` asset re-exports |
| `assets.concurrency.test.js` | race conditions and parallel preload |
| `assets.networkFailure.test.js` | fetch failures and recovery |
| `assets.vitestMigration.test.js` | stale `utils/assets` import guard |

---

## 0. Production config integrity — `assetMap.json`

- parses as valid JSON without throw
- root has `production` environment key
- every flag value is a string URL path
- no duplicate flag keys after normalization
- no empty string URLs
- no null or undefined URL values
- staging keys follow sparse override contract (only overrides where present)
- development keys follow sparse override contract when present
- every flag name uses dot-notation (no spaces)
- critical image flags referenced in routes exist in map
- font flags in shared preloads exist in map
- script flags in shared preloads exist in map
- JSON flags in shared preloads exist in map
- media flags in shared preloads exist in map
- section asset maps only override flags that exist in global or add section-specific flags
- snapshot hash stable unless intentional asset change

## 0b. Production config integrity — `sharedAssetPreloads.json`

- parses as valid JSON
- every catalog array entry has string `flag`
- every catalog entry `priority` is critical|high|normal when present
- every catalog entry `type` is allowed preload type when present
- mapping values are asset flag strings not raw URLs
- no duplicate flags within same catalog array
- component mapping keys are slot name strings
- cross-reference: all mapping flags exist in assetMap.json
- cross-reference: all route assetPreloadRef keys resolve in file

## 1. `assetMapSource.js` — `shouldAllowRuntimeAssetMapFetch`

- returns true in development when runtime fetch enabled
- returns false in production when bundled map required
- respects VITE_ALLOW_RUNTIME_ASSET_MAP env override
- returns false when explicit disable flag set

## 1b. `assetMapSource.js` — `getBundledAssetMap` / `getBundledAssetMapSha256`

- getBundledAssetMap returns object with production key
- getBundledAssetMap returns same reference on repeated calls
- getBundledAssetMapSha256 returns hex string
- getBundledAssetMapSha256 matches hash of bundled JSON text
- getBundledAssetMapSha256 stable across calls

## 1c. `assetMapSource.js` — `sha256HexFromText` / `verifyFetchedAssetMapText` / `parseAssetMapJsonText`

- sha256HexFromText hashes empty string deterministically
- sha256HexFromText hashes sample JSON deterministically
- sha256HexFromText different input produces different hash
- parseAssetMapJsonText parses valid JSON object
- parseAssetMapJsonText throws on invalid JSON
- parseAssetMapJsonText throws when root is array
- parseAssetMapJsonText throws when production key missing
- verifyFetchedAssetMapText passes when hash matches bundled
- verifyFetchedAssetMapText fails when hash mismatch
- verifyFetchedAssetMapText fails on tampered content

## 2. `sectionAssetMapSource.js` — `parseSectionNameFromAssetMapPath`

- extracts `auth` from `/assets/maps/assetMap.auth.json`
- extracts section from nested public path
- returns null for global assetMap path without section suffix
- returns null for malformed path
- handles Windows-style backslashes normalized

## 2b. `sectionAssetMapSource.js` — `isValidSectionAssetMapName`

- returns true for `auth`
- returns true for `dashboard`
- returns false for empty string
- returns false for non-string input
- returns false for `../auth` path traversal
- returns false for `auth/extra` with slash
- returns false for `auth..`
- trims whitespace before validation

## 2c. `sectionAssetMapSource.js` — bundled + network

- getBundledSectionAssetMap returns map for known bundled section
- getBundledSectionAssetMap returns null for unknown section
- getKnownBundledSectionNames returns string array
- getKnownBundledSectionNames has no duplicates
- getSectionAssetMapFetchCandidates returns ordered URL list
- getSectionAssetMapFetchCandidates empty for invalid section name
- fetchSectionAssetMapFromNetwork resolves map on 200
- fetchSectionAssetMapFromNetwork returns null on 404
- fetchSectionAssetMapFromNetwork rejects invalid JSON
- fetchSectionAssetMapFromNetwork rejects non-object root

## 3. `assetLibrary.js` — `normalizeGetAssetUrlArgs`

- flag + null → section null environment null
- flag + staging string → environment staging
- flag + { environment: dev } → environment dev
- flag + { section: auth } → section auth when valid
- flag + { section: invalid! } → section null
- flag + { section: " auth " } → trims section
- flag + { environment: prod, section: auth } → both set
- preserves flag string unchanged
- non-string environment in options → null environment
- empty options object → nulls for both

## 3b. `assetLibrary.js` — `normalizeAssetMapUrl`

- prepends base for relative path
- leaves https URL unchanged
- leaves http URL unchanged
- handles protocol-relative URL
- trims whitespace
- empty input → empty string
- already normalized path is idempotent
- preserves query string
- preserves hash fragment

## 4. `assetLibrary.js` — `setEnvironment` / `getEnvironment`

- getEnvironment defaults to production in unit test MODE
- setEnvironment(staging) updates getEnvironment
- setEnvironment rejects unknown environment
- setEnvironment idempotent when same value twice
- setEnvironment clears URL cache when env changes
- concurrent setEnvironment last-write-wins

## 4b. `assetLibrary.js` — `getAssetMapFetchCandidates` / `getAssetMapConfigSource` / `clearAssetMapConfigCache`

- getAssetMapFetchCandidates returns non-empty URL list
- getAssetMapFetchCandidates respects env base URL
- getAssetMapConfigSource returns bundled vs network source label
- clearAssetMapConfigCache forces reload on next loadAssetMapConfig
- clearAssetMapConfigCache does not clear URL resolution cache unless documented

## 5. `assetLibrary.js` — `loadAssetMapConfig` / `loadSectionAssetMap`

- loadAssetMapConfig loads global map
- loadAssetMapConfig second call uses cache
- loadSectionAssetMap null for invalid section
- loadSectionAssetMap null on 404
- loadSectionAssetMap caches in memory
- loadSectionAssetMap second call skips fetch
- loadSectionAssetMap trims section name
- global and section maps do not cross-contaminate

- getAssetUrl: production URL when only production defined
- getAssetUrlSync: production URL when only production defined (sync path)
- getAssetUrl: staging override when staging key present for flag
- getAssetUrlSync: staging override when staging key present for flag (sync path)
- getAssetUrl: falls back to production when staging sparse (flag missing in staging)
- getAssetUrlSync: falls back to production when staging sparse (flag missing in staging) (sync path)
- getAssetUrl: falls back to production when development sparse
- getAssetUrlSync: falls back to production when development sparse (sync path)
- getAssetUrl: null for unknown flag in all environments
- getAssetUrlSync: null for unknown flag in all environments (sync path)
- getAssetUrl: getAssetUrlSync matches getAssetUrl when map primed
- getAssetUrlSync: getAssetUrlSync matches getAssetUrl when map primed (sync path)
- getAssetUrl: getAssetUrlSync null when map not loaded
- getAssetUrlSync: getAssetUrlSync null when map not loaded (sync path)
- getAssetUrl: options.section uses section map override
- getAssetUrlSync: options.section uses section map override (sync path)
- getAssetUrl: section override wins over global for same flag
- getAssetUrlSync: section override wins over global for same flag (sync path)
- getAssetUrl: section sparse falls back to global production
- getAssetUrlSync: section sparse falls back to global production (sync path)
- getAssetUrl: section sparse falls back to global staging when env staging
- getAssetUrlSync: section sparse falls back to global staging when env staging (sync path)
- getAssetUrl: section + explicit environment both applied
- getAssetUrlSync: section + explicit environment both applied (sync path)
- getAssetUrl: invalid section option ignored → global scope
- getAssetUrlSync: invalid section option ignored → global scope (sync path)
- getAssetUrl: caches resolved URL per flag+env+section
- getAssetUrlSync: caches resolved URL per flag+env+section (sync path)
- getAssetUrl: cache hit avoids repeated map walk
- getAssetUrlSync: cache hit avoids repeated map walk (sync path)
- getAssetUrl: miss cache prevents hammering missing flags
- getAssetUrlSync: miss cache prevents hammering missing flags (sync path)
- getAssetUrl: miss cache cleared after map reload
- getAssetUrlSync: miss cache cleared after map reload (sync path)
- getAssetUrl: empty flag → null or throw per contract
- getAssetUrlSync: empty flag → null or throw per contract (sync path)
- getAssetUrl: whitespace-only flag handled safely
- getAssetUrlSync: whitespace-only flag handled safely (sync path)
- getAssetUrl: flag trimmed before lookup
- getAssetUrlSync: flag trimmed before lookup (sync path)
- getAssetUrl: concurrent same-flag requests share in-flight promise
- getAssetUrlSync: concurrent same-flag requests share in-flight promise (sync path)
- getAssetUrl: URL passed through normalizeAssetMapUrl
- getAssetUrlSync: URL passed through normalizeAssetMapUrl (sync path)
- getAssetUrl: after setEnvironment(staging) uses staging without second arg
- getAssetUrlSync: after setEnvironment(staging) uses staging without second arg (sync path)
- getAssetUrl: explicit environment arg overrides setEnvironment
- getAssetUrlSync: explicit environment arg overrides setEnvironment (sync path)
- getAssetUrl: production-only flag resolves in staging via fallback
- getAssetUrlSync: production-only flag resolves in staging via fallback (sync path)
- getAssetUrl: section-only flag (not in global) from section map
- getAssetUrlSync: section-only flag (not in global) from section map (sync path)
- getAssetUrl: section-only missing flag → null
- getAssetUrlSync: section-only missing flag → null (sync path)
- getAssetUrl: does not expose internal map reference
- getAssetUrlSync: does not expose internal map reference (sync path)
- getAssetUrl: map reload mid-flight resolves without stale URL
- getAssetUrlSync: map reload mid-flight resolves without stale URL (sync path)
## 6. `assetLibrary.js` — `getAssetUrl` / `getAssetUrlSync` (inheritance matrix)

- getAssetUrl matrix: global production + production partial override → correct URL for overlapping and non-overlapping flags
- getAssetUrl matrix: global production + staging partial override → correct URL for overlapping and non-overlapping flags
- getAssetUrl matrix: global production + development partial override → correct URL for overlapping and non-overlapping flags
- getAssetUrl section auth: overlapping flag uses section map
- getAssetUrl section auth: non-overlapping flag inherits global
- getAssetUrl section auth: section env sparse + global dense → production fallback
- getAssetUrl section dashboard: overlapping flag uses section map
- getAssetUrl section dashboard: non-overlapping flag inherits global
- getAssetUrl section dashboard: section env sparse + global dense → production fallback
- getAssetUrl section checkout: overlapping flag uses section map
- getAssetUrl section checkout: non-overlapping flag inherits global
- getAssetUrl section checkout: section env sparse + global dense → production fallback

## 7. `assetLibrary.js` — `getAssetUrlForCss` / `getAssetUrlForAttr`

- getAssetUrlForCss wraps URL in url(...) when needed
- getAssetUrlForCss leaves already-wrapped value unchanged
- getAssetUrlForCss null flag → null
- getAssetUrlForCss respects section options
- getAssetUrlForAttr returns bare URL for attribute binding
- getAssetUrlForAttr null for missing flag
- getAssetUrlForAttr respects environment option
- getAssetUrlForCss and getAssetUrlForAttr same underlying resolution

## 8. `assetLibrary.js` — `getAssetUrls` / `preloadAssetUrls`

- getAssetUrls [] → {}
- getAssetUrls single flag → one key
- getAssetUrls multiple flags → all keys
- getAssetUrls null for missing flags
- getAssetUrls dedupes input flags
- getAssetUrls accepts section options
- getAssetUrls single map load for batch
- getAssetUrls 100+ flags completes under threshold
- preloadAssetUrls preloads resolved URLs
- preloadAssetUrls skips already preloaded
- preloadAssetUrls empty array no-op

## 9. `assetLibrary.js` — flag helpers

- hasAssetFlag true when flag exists
- hasAssetFlag false when missing
- hasAssetFlag respects section option
- hasAssetFlagInMap checks map only not preload state
- getAvailableAssetFlags lists all flags for env
- getAvailableAssetFlags includes section flags when section loaded
- getKnownGlobalFlags returns sorted unique list
- getKnownGlobalFlags excludes section-only unless loaded

## 10. `assetLibrary.js` — section loading & metadata

- loadAssetsForSection loads global if needed
- loadAssetsForSection fetches section map when valid
- loadAssetsForSection no-op fetch for invalid section
- preloadAssetsForSections loads multiple sections in parallel
- preloadAssetsForSections dedupes duplicate section names
- getAssetsForSection returns merged view for section
- areAssetsLoadedForSection false before load
- areAssetsLoadedForSection true after successful load
- isSectionAssetMetadataInMemory reflects RAM cache
- isSectionAssetMetadataCached reflects persistent cache layer
- getAssetLoadingState pending during fetch
- getAssetLoadingState loaded after success
- getAssetLoadingState error after failed fetch
- parallel loadAssetsForSection same section single flight

## 11. `assetLibrary.js` — `unloadUnusedSections` / `getKnownBundledSectionNames`

- unloadUnusedSections evicts section not in keep list
- unloadUnusedSections retains all sections in keep list
- unloadUnusedSections clears section URL caches for evicted
- unloadUnusedSections no-op when all loaded are kept
- getKnownBundledSectionNames matches sectionAssetMapSource list

## 12. `assetLibrary.js` — caches & statistics

- clearAssetCaches clears URL hit cache
- clearAssetCaches clears URL miss cache
- clearAssetCaches clears asset index cache
- clearAssetCaches clears section memory maps
- clearAssetCaches preserves current environment
- getAssetStatistics returns counts after loads
- getAssetStatistics zeroed after reset
- isAssetCategoryCached true after category fetch
- isAssetCategoryCached false for unknown category

## 13. `assetLibrary.js` — `initAssetLibrary` / `primeAssetIndex` / `validateAssetMap`

- initAssetLibrary sets initialized flag
- initAssetLibrary idempotent
- initAssetLibrary rejects invalid map
- isAssetLibraryInitialized false before init
- isAssetLibraryInitialized true after init
- primeAssetIndex builds production index
- primeAssetIndex builds section-scoped index
- primeAssetIndex cached on second call
- validateAssetMap accepts valid production map
- validateAssetMap rejects non-object root
- validateAssetMap rejects missing production
- validateAssetMap rejects non-string URL leaf
- validateAssetMap aggregates all errors
- validateAssetMap allows sparse staging
- getAssetsByCategory filters by prefix
- getAssetsByCategory [] for unknown category

## 14. `assetPreloader.js` — `withPreloadRetry` / `runInConcurrencyChunks`

- withPreloadRetry succeeds first attempt
- withPreloadRetry retries transient failure
- withPreloadRetry stops at max retries
- withPreloadRetry no retry on permanent error
- runInConcurrencyChunks processes all items
- runInConcurrencyChunks respects ASSET_PRELOAD_MAX_CONCURRENCY
- runInConcurrencyChunks empty array immediate resolve
- runInConcurrencyChunks propagates fatal error
- runInConcurrencyChunks concurrency 1 sequential

## 15. `assetPreloader.js` — `resolveFetchPriority` / `shouldInjectExecutableScript`

- resolveFetchPriority critical → high fetch priority
- resolveFetchPriority high → high
- resolveFetchPriority normal → auto or default
- resolveFetchPriority missing → default
- shouldInjectExecutableScript true for module scripts when configured
- shouldInjectExecutableScript false for plain preload-only
- shouldInjectExecutableScript respects options.inject

## 16. `assetPreloader.js` — `preloadImage`

- preloadImage: valid src resolves
- preloadImage: onload resolves promise
- preloadImage: onerror rejects
- preloadImage: duplicate skipped
- preloadImage: crossOrigin set
- preloadImage: records in preload store

## 17. `assetPreloader.js` — `preloadFont`

- preloadFont: loads font
- preloadFont: duplicate skipped
- preloadFont: invalid rejects

## 18. `assetPreloader.js` — `preloadMedia`

- preloadMedia: video type
- preloadMedia: audio type
- preloadMedia: invalid type rejects

## 19. `assetPreloader.js` — `preloadScript`

- preloadScript: appends tag
- preloadScript: async defer
- preloadScript: duplicate skipped
- preloadScript: onload/onerror

## 20. `assetPreloader.js` — `injectExecutableScript`

- injectExecutableScript: inline content
- injectExecutableScript: module type
- injectExecutableScript: empty rejects

## 21. `assetPreloader.js` — `preloadJSON`

- preloadJSON: fetch parse
- preloadJSON: invalid JSON rejects
- preloadJSON: cached

## 22. `assetPreloader.js` — `preloadAsset` / `preloadAssets`

- preloadAsset dispatches image type
- preloadAsset dispatches font type
- preloadAsset dispatches script type
- preloadAsset dispatches json type
- preloadAsset dispatches media type
- preloadAsset unknown type rejects
- preloadAssets batch obeys priority order
- preloadAssets empty no-op
- preloadAssets partial failure behavior per contract

## 23. `assetPreloader.js` — section + resolve helpers

- resolveAssetPreloadUrl resolves flag via library
- resolveAssetPreloadUrl null when flag missing
- resolveAssetPreloadUrl passes sectionName scope
- resolveAssetPreloadUrls batch
- enrichAssetsWithPreloadUrls adds url field
- enrichAssetsWithPreloadUrls preserves flag priority type
- areSectionAssetUrlsFullyPreloaded true when all cached
- areSectionAssetUrlsFullyPreloaded false when any missing
- preloadSectionAssets loads rollup entries
- preloadSectionAssets skips unresolved URLs
- preloadSectionCriticalImages only critical tier
- preloadSectionCriticalImages uses section rollup
- clearPreloadCache clears tracked assets
- getPreloadedAssetsCount accurate
- getPreloadedAssetsCount zero after clear

## 24. `assetScanner.js` — `extractAssetsFromComponent`

- extractAssetsFromComponent: extracts img src flags
- extractAssetsFromComponent: extracts background-image flags
- extractAssetsFromComponent: extracts script src flags
- extractAssetsFromComponent: ignores external hardcoded URLs
- extractAssetsFromComponent: empty component → []
- extractAssetsFromComponent: multiple assets deduped

## 25. `assetScanner.js` — `extractLiteralBoundAttribute`

- extractLiteralBoundAttribute: reads literal src
- extractLiteralBoundAttribute: reads literal :src binding
- extractLiteralBoundAttribute: missing attribute → null
- extractLiteralBoundAttribute: malformed tag → null
- extractLiteralBoundAttribute: whitespace trimmed

## 26. `assetScanner.js` — `extractBoundAttributeExpression`

- extractBoundAttributeExpression: extracts expression from :src
- extractBoundAttributeExpression: static string in binding
- extractBoundAttributeExpression: missing binding → null

## 27. `assetScanner.js` — `resolveAssetSlotFlagsFromScript`

- resolveAssetSlotFlagsFromScript: maps setup return keys to flags
- resolveAssetSlotFlagsFromScript: maps reactive refs
- resolveAssetSlotFlagsFromScript: empty script → {}

## 28. `assetScanner.js` — `scanScriptForAssetFlagReferences`

- scanScriptForAssetFlagReferences: finds getAssetUrl calls
- scanScriptForAssetFlagReferences: finds string flags in arrays
- scanScriptForAssetFlagReferences: ignores comments
- scanScriptForAssetFlagReferences: ignores non-flag strings
- scanScriptForAssetFlagReferences: duplicate flags deduped

## 29. `assetScanner.js` — `scanComponentForAssetReferences`

- scanComponentForAssetReferences: combines template + script scans
- scanComponentForAssetReferences: template-only component
- scanComponentForAssetReferences: script-only flags
- scanComponentForAssetReferences: returns normalized asset definitions

## 30. `assetScanner.js` — `scanSectionComponents`

- scanSectionComponents: scans all components in section folder
- scanSectionComponents: skips ignored components
- scanSectionComponents: returns aggregated report
- scanSectionComponents: empty section → []

## 31. `assetScanner.js` — `shouldIgnoreComponent`

- shouldIgnoreComponent: ignores test files when configured
- shouldIgnoreComponent: ignores node_modules paths
- shouldIgnoreComponent: allows normal vue files

## 32. `assetScanner.js` — `normalizeAssetDefinition`

- normalizeAssetDefinition: fills default type
- normalizeAssetDefinition: fills default priority
- normalizeAssetDefinition: rejects invalid shape
- normalizeAssetDefinition: trims flag name

## 33. `assertAllowedPreloadUrl.js`

- allows same-origin absolute URL
- allows relative /path
- allows configured CDN origin
- rejects javascript: URL
- rejects unknown external origin
- rejects empty string
- rejects null undefined
- throws message includes rejected URL
- trims whitespace
- subdomain of trusted CDN allowed
- IP literal external rejected
- userinfo in URL rejected

## 34. `getAssetPreloadEntriesForSection.js` — `dedupeAssetPreloadEntries`

- empty array → []
- single entry unchanged
- duplicate flag keeps critical over normal
- duplicate flag keeps critical over high
- duplicate flag keeps high over normal
- same priority keeps first declaration order
- entries without flag dropped
- preserves type field on winner

## 35. `getAssetPreloadEntriesForSection.js` — `routeBelongsToSection`

- string section exact match
- string section no match
- section object match supportedRoles
- section object no match role
- missing section on route → false
- null sectionName → false
- trim whitespace on section ids

## 36. `getAssetPreloadEntriesForSection.js` — `isRouteEnabledForAssetPreload`

- enabled route → true
- disabled: true → false
- disabled: false → true
- missing disabled treated as enabled

## 37. `getAssetPreloadEntriesForSection.js` — `getAssetPreloadEntriesForSection` (rollup)

- no routes → []
- inline assetPreload collected
- assetPreloadRef expanded from catalog
- inline + ref merged per route
- dedupe across routes by priority
- disabled routes excluded
- wrong section excluded
- child inherits parent via effective preload
- nested children accumulate chain
- parent critical + child normal same flag → critical
- stable sort priority then order
- unknown ref skipped or errors
- null assetPreload → empty
- performance 100 routes under threshold
- clearAssetPreloadSectionCache forces recompute
- cache hit on second call same section

## 38. `validateRouteAssetPreloadFlags.js` — constants

- ALLOWED_ASSET_PRELOAD_TYPES contains image font script json media
- ALLOWED_ASSET_PRELOAD_PRIORITIES contains critical high normal

## 39. `validateRouteAssetPreloadFlags.js` — `collectAssetMapFlags`

- collects all flags from production
- collects from staging overrides
- empty map → empty set
- nested env keys flattened

## 40. `validateRouteAssetPreloadFlags.js` — `validateAssetPreloadEntryShape`

- valid entry passes
- missing flag fails with index
- invalid type fails
- invalid priority fails
- non-object entry fails
- extra unknown keys allowed or rejected per contract

## 41. `validateRouteAssetPreloadFlags.js` — `validateRouteAssetPreloadRefs`

- valid ref passes
- unknown ref fails with route slug
- empty ref array passes
- multiple refs validated

## 42. `validateRouteAssetPreloadFlags.js` — `validateRouteAssetPreloadFlags`

- all valid routes passes
- missing flag fails with path
- uses provided assetMap argument
- loads default assetMap when null
- validates expanded ref flags
- skips disabled routes
- nested route tree validated

## 43. `validateRouteAssetPreloadFlags.js` — `validateSharedCatalogAssetPreloadFlags`

- valid catalog passes
- catalog flag missing from map fails
- empty catalog passes
- invalid entry shape fails

## 44. `validateSharedComponentAssetMappings.js`

- valid mappings pass
- unknown mapping ref fails
- unknown flag in mapping fails
- non-object mapping fails
- empty catalog passes

## 45. `resolveSharedComponentAssets.js`

- getSharedCatalogEntriesByFlag builds map
- getSharedCatalogEntriesByFlag missing catalog → empty map
- getSharedCatalogEntriesByFlag skips entries without flag
- getSharedComponentAssetMapping returns shallow copy
- getSharedComponentAssetMapping throws unknown ref
- getSharedComponentAssetMapping throws when ref is array
- groupComponentSlotsByPreloadTier critical group
- groupComponentSlotsByPreloadTier default normal
- resolveSharedComponentAssets all slots resolved
- resolveSharedComponentAssets null for missing flag
- PRELOAD_TIER_ORDER equals critical high normal

## 46. `resolveRouteAssetPreloads.js`

- empty route → []
- single assetPreloadRef expanded
- inline appended after ref expansion
- multiple refs in order
- dedupe within route by priority
- inherits parent assetPreload when child empty
- child concatenates after parent C-02
- disabled route → []
- unknown ref throws or warns
- preserves type and priority fields
- null assetPreloadRef ignored
- empty catalog ref → []

## 47. `routeAssetPrefetch.js`

- prefetchSectionAssetsForRoute no-op when no assets
- prefetchSectionAssetsForRoute calls preloadSectionAssets
- prefetchSectionAssetsForRoute uses route section
- createSectionAssetPrefetchIntentHandler returns handler
- intent handler on hover triggers prefetch
- intent handler skips disabled route
- resetRouteAssetPrefetchCache clears internal cache
- handler calls assertAllowedPreloadUrl per URL
- handler catches errors without throw

## 48. `useRoutePrefetch.js`

- createRoutePrefetchIntentHandler combines component + asset
- useRoutePrefetch returns prefetch helpers
- prefetchRoute triggers component prefetch
- prefetchSectionAssets delegates to routeAssetPrefetch
- mouseenter registers once per element
- cleanup on unmount removes listeners
- respects global prefetch disabled flag

## 49. `routeResolver.js` — asset-coupled (`resolveEffectiveAssetPreloadForRoute`, C-02)

- flat route inline assets returned
- child inherits parent when no child assets
- child assets concatenated after parent
- grandchild inherits full chain
- siblings do not cross-inherit
- inheritedAssetPreloadCount matches length
- empty parent array does not block child
- null treated as absent
- does not mutate parent input
- does not mutate child input
- disabled route behavior per contract
- works with resolveRouteAssetPreloads composition

## 50. `resetAssetLibrary.js`

- resetAssetLibrary clears initialized
- resetAssetLibrary clears caches
- re-init works after reset
- safe when never initialized
- resetAssetSystem is alias for resetAssetLibrary
- options partial reset if supported

## 51. `assetHandlerFactory.js` — `createAssetHandler`

- returns AssetHandler instance
- passes assetsConfig to constructor
- passes options to constructor
- async resolve before ready

## 52. `AssetHandler` — `constructor`

- AssetHandler.constructor: empty config
- AssetHandler.constructor: default options
- AssetHandler.constructor: custom options
- AssetHandler.constructor: initializes empty registry

## 53. `AssetHandler` — `loadConfigFromJSON`

- AssetHandler.loadConfigFromJSON: valid JSON array
- AssetHandler.loadConfigFromJSON: invalid JSON throws
- AssetHandler.loadConfigFromJSON: empty array
- AssetHandler.loadConfigFromJSON: merges with existing

## 54. `AssetHandler` — `validateConfig`

- AssetHandler.validateConfig: valid config passes
- AssetHandler.validateConfig: invalid semver fails
- AssetHandler.validateConfig: invalid asset name fails
- AssetHandler.validateConfig: duplicate names fail

## 55. `AssetHandler` — `setGlobalVersion`

- AssetHandler.setGlobalVersion: valid semver accepted
- AssetHandler.setGlobalVersion: invalid semver rejected
- AssetHandler.setGlobalVersion: applies to subsequent URLs

## 56. `AssetHandler` — `isReady`

- AssetHandler.isReady: false before mark
- AssetHandler.isReady: true after markReady
- AssetHandler.isReady: false after dispose

## 57. `AssetHandler` — `whenReady`

- AssetHandler.whenReady: resolves after ready
- AssetHandler.whenReady: rejects if init fails
- AssetHandler.whenReady: multiple callers single resolve

## 58. `AssetHandler` — `isAssetAlreadyInDOM`

- AssetHandler.isAssetAlreadyInDOM: false when absent
- AssetHandler.isAssetAlreadyInDOM: true when script present
- AssetHandler.isAssetAlreadyInDOM: type filter works

## 59. `AssetHandler` — `loadAssetsForEvent`

- AssetHandler.loadAssetsForEvent: registers listener
- AssetHandler.loadAssetsForEvent: fires callback on event
- AssetHandler.loadAssetsForEvent: multiple assets

## 60. `AssetHandler` — `preloadAssetsByFlag`

- AssetHandler.preloadAssetsByFlag: resolves flags via map
- AssetHandler.preloadAssetsByFlag: unknown flag warns
- AssetHandler.preloadAssetsByFlag: parallel preload

## 61. `AssetHandler` — `loadAssetsBeforeMount`

- AssetHandler.loadAssetsBeforeMount: loads route definition assets
- AssetHandler.loadAssetsBeforeMount: blocks until critical done
- AssetHandler.loadAssetsBeforeMount: respects timeout

## 62. `AssetHandler` — `hasPendingMountBlockers`

- AssetHandler.hasPendingMountBlockers: true when pending
- AssetHandler.hasPendingMountBlockers: false when complete

## 63. `AssetHandler` — `getPendingMountBlockers`

- AssetHandler.getPendingMountBlockers: lists blocking asset names
- AssetHandler.getPendingMountBlockers: empty when none

## 64. `AssetHandler` — `loadAssetsImmediatelyForSelector`

- AssetHandler.loadAssetsImmediatelyForSelector: loads matching elements
- AssetHandler.loadAssetsImmediatelyForSelector: invokes callback
- AssetHandler.loadAssetsImmediatelyForSelector: no match no-op

## 65. `AssetHandler` — `observeLazyAssets`

- AssetHandler.observeLazyAssets: IntersectionObserver registers
- AssetHandler.observeLazyAssets: loads when visible
- AssetHandler.observeLazyAssets: disconnect on dispose

## 66. `AssetHandler` — `dispatchAssetLoadEvent`

- AssetHandler.dispatchAssetLoadEvent: dispatches custom event
- AssetHandler.dispatchAssetLoadEvent: includes detail payload

## 67. `AssetHandler` — `getAssetByName`

- AssetHandler.getAssetByName: returns config entry
- AssetHandler.getAssetByName: null when missing

## 68. `AssetHandler` — `areAssetDependenciesReady`

- AssetHandler.areAssetDependenciesReady: true when deps loaded
- AssetHandler.areAssetDependenciesReady: false when pending
- AssetHandler.areAssetDependenciesReady: empty deps true

## 69. `AssetHandler` — `ensureAssetDependencies`

- AssetHandler.ensureAssetDependencies: loads missing deps
- AssetHandler.ensureAssetDependencies: ordered by dependency graph
- AssetHandler.ensureAssetDependencies: detects circular deps

## 70. `AssetHandler` — `ensureAssetsForDefinition`

- AssetHandler.ensureAssetsForDefinition: loads all definition assets
- AssetHandler.ensureAssetsForDefinition: skips ready

## 71. `AssetHandler` — `areAssetsReadyForDefinition`

- AssetHandler.areAssetsReadyForDefinition: mirrors ensure without load

## 72. `AssetHandler` — `getAssetsByFlags`

- AssetHandler.getAssetsByFlags: match any default
- AssetHandler.getAssetsByFlags: matchAll true requires all
- AssetHandler.getAssetsByFlags: empty flags []

## 73. `AssetHandler` — `loadAsset`

- AssetHandler.loadAsset: success path
- AssetHandler.loadAsset: retry on failure
- AssetHandler.loadAsset: timeout rejects
- AssetHandler.loadAsset: removes from DOM on retry

## 74. `AssetHandler` — `loadAssetsInParallelWithThrottle`

- AssetHandler.loadAssetsInParallelWithThrottle: respects maxConcurrent
- AssetHandler.loadAssetsInParallelWithThrottle: all complete
- AssetHandler.loadAssetsInParallelWithThrottle: error propagates

## 75. `AssetHandler` — `removeAssetFromDOM`

- AssetHandler.removeAssetFromDOM: removes script tag
- AssetHandler.removeAssetFromDOM: no-op when absent

## 76. `AssetHandler` — `createElementForAsset`

- AssetHandler.createElementForAsset: creates script element
- AssetHandler.createElementForAsset: creates link for css
- AssetHandler.createElementForAsset: module type

## 77. `AssetHandler` — `insertAssetElement`

- AssetHandler.insertAssetElement: appends to head
- AssetHandler.insertAssetElement: inserts before marker
- AssetHandler.insertAssetElement: dedupe id

## 78. `AssetHandler` — `registerPreloadHint`

- AssetHandler.registerPreloadHint: adds link rel=preload
- AssetHandler.registerPreloadHint: no duplicate hints

## 79. `AssetHandler` — `warmCacheForAssets`

- AssetHandler.warmCacheForAssets: preloads flags
- AssetHandler.warmCacheForAssets: no-op unknown flags

## 80. `AssetHandler` — `dispose`

- AssetHandler.dispose: cleans listeners
- AssetHandler.dispose: disconnects observers
- AssetHandler.dispose: not ready after dispose

## 81. `AssetHandler` — `getStatistics`

- AssetHandler.getStatistics: counts loaded failed pending
- AssetHandler.getStatistics: zero after dispose

## 82. `scriptAvailabilityChecker.js`

- isScriptInDOM false before load
- isScriptInDOM true after injection
- isScriptReady checks handler ready state
- loadScript delegates to AssetHandler
- waitForScriptAvailability resolves when ready
- waitForScriptAvailability timeout rejects
- waitForCognitoScript uses cognito flag
- getScriptLoadingState returns enum
- addAssetToHandler registers config
- updateAssetUrlFromAssetMap refreshes URL from getAssetUrl
- singleton AssetHandler shared across calls
- default export contains all named functions

## 83. `usePreloadStore.js`

- initial empty state
- addAsset / markPreloaded tracks flag
- hasAsset true after add
- clear resets state
- syncBuildHash updates hash
- syncBuildHash clears assets when hash changes
- syncBuildHash no-op same hash

## 84. `useAssetUrl.js`

- ref null before resolve
- resolves valid flag
- updates on flag change
- section option forwarded
- missing flag → null
- no update after unmount

## 85. `menuItems.js` — `resolveMenuItemsWithAssets`

- resolves dot-notation flags
- skips absolute URLs
- skips data: URLs
- skips plain strings without dot
- warns missing flag
- batch unique flags once
- translates translationKey
- fallback title on translation error
- role filter excludes item
- recursive children
- role filter on children
- default menuItems param
- empty array → []

## 86. `sectionPreloader.js` asset integration

- preloadSection calls preloadSectionAssets
- critical images before components
- invalid section skipped
- uses section rollup
- asset failure does not block components
- resetSectionPreloadState clears flags
- isSectionPreloaded checks store

## 87. `routeNavigationData.js` asset warmup

- calls preloadSectionAssets on navigate when configured
- no call when route has no section assets
- uses target route section not source

## 88. `routeConfigLoader.js` asset validation

- loadRouteConfigurationFromFile expands assetPreloadRef
- validates flags after load
- fails on missing flag
- uses sharedAssetPreloads.json
- resetRouteConfigurationCache clears asset-related caches

## 89. `jsonConfigValidator.js` asset paths

- validateRouteConfig calls asset validators
- rejects bad assetPreload shape
- rejects bad assetPreloadRef
- validates shared catalog flags
- validates shared component mappings

## 90. `appBuildHash.js` — `syncPreloadStoreBuildHash`

- reads hash from meta tag
- updates preload store
- clears stale preloads on change

## 91. `router/index.js` asset hooks

- preloadSectionCriticalImages on navigation
- preloadSection includes asset phase
- createRoutePrefetchIntentHandler wired
- usePreloadStore imported for guard coordination

## 92. `app/main.js` bootstrap

- initAssetLibrary awaited before mount
- validateAssetMap on boot
- boot continues when validate warns vs throws per contract
- syncPreloadStoreBuildHash after init

## 93. `systems/assets/index.js` barrel

- re-exports getAssetUrl from assetLibrary
- re-exports preloadAsset from assetPreloader
- re-exports getAssetPreloadEntriesForSection
- re-exports validateRouteAssetPreloadFlags
- re-exports resolveSharedComponentAssets
- re-exports resetAssetLibrary
- no duplicate export names
- assetMapSource not in barrel (intentional)

## 94. Integration — section + route + asset E2E

- navigate auth loads section map + rollup
- critical fonts preloaded before paint
- child route inherits parent assets in rollup
- hover prefetch warms assets
- role-based section object filters rollup
- disabled route excluded from rollup
- build hash change clears preload store
- menu logos resolved after init
- shared chrome slots via resolveSharedComponentAssets
- untrusted URL blocked at preload
- sparse staging fallback to production
- unloadUnusedSections after leaving section
- home → auth → dashboard smoke no errors

## 95. `utils/preload.js` (legacy — remove after P1 migration)

- preloadIcons loads Image for each URL
- preloadIcons empty array no-op
- preloadIcons duplicate URLs deduped
- behavior documented as deprecated vs assetPreloader.preloadImage
- Cart.vue migration removes import of utils/preload

## 96. Future `assetPolicy.js` (post-refactor)

- getAssetPolicy default origins
- env override merge
- isPreloadAllowed wraps assertAllowedPreloadUrl
- concurrency cap enforced
- SSR disables preload

---

**Total test cases listed:** 673

See also: [asset-code-index.md](./asset-code-index.md), [route-test-plan.md](../Route/route-test-plan.md).
