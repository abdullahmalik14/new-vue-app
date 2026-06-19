# Section test plan (Vitest)

**Date:** 2026-06-10  
**Status:** Planning only — implement after section refactor stabilizes (see [docs/SECTION_PLAN.md](./docs/SECTION_PLAN.md)).  
**Runner:** Vitest (`npm run test:unit`) — **one line below = one** `it('…', () => {})` test case.  
**Coverage goal:** Every exported symbol in `systems/sections/` + every routing/router/i18n/asset/build touchpoint that loads, resolves, preloads, or inherits section configuration.

**Companion:** Pure routing tests (non-section) live in [route-test-plan.md](../Route/route-test-plan.md). This plan owns section resolution, loading, preloading, inheritance of `section` / `preLoadSections`, and router hook behaviour.

**Suggested test file layout** (mirror `tests/unit/`):

| File | Module under test |
|------|-------------------|
| `sectionResolver.test.js` | `sectionResolver.js` |
| `sectionResolver.identifier.test.js` | `resolveSectionIdentifier` + slug routing |
| `sectionResolver.rolePreload.test.js` | `resolveRolePreLoadSections` (via `getPreloadSectionsForRoute`) |
| `sectionPreloader.test.js` | `sectionPreloader.js` |
| `sectionPreloader.concurrent.test.js` | shared promises, in-progress dedup |
| `sectionPreloader.timeout.test.js` | `raceLinkPreloadWithTimeout`, env timeout |
| `sectionCssLoader.test.js` | `sectionCssLoader.js` |
| `sectionCssLoader.preload.test.js` | `preloadSectionCss` hint links |
| `sectionPreloadOrchestrator.test.js` | `sectionPreloadOrchestrator.js` |
| `sectionPreloadOrchestrator.inheritance.test.js` | `resolveEffectiveRouteConfig` + parent `preLoadSections` |
| `sectionPreloadOrchestrator.locale.test.js` | `refreshSectionPreloadsOnLocaleChange` |
| `sectionBarrel.test.js` | `systems/sections/index.js` |
| `usePreloadStore.section.test.js` | section getters/actions only |
| `manifestLoader.section.test.js` | `loadSectionManifest`, `getSectionBundlePaths` |
| `bundlePathValidation.section.test.js` | trusted paths used by loaders |
| `routeNavigationData.section.test.js` | `routeNavigationData.js` section loads |
| `routeResolver.sectionInheritance.test.js` | `inheritConfigurationFromParentRoute` — `section` / `preLoadSections` |
| `routeTransition.section.test.js` | `resolveRouteTransition` + effective config |
| `routeComponentPrefetch.section.test.js` | prefetch + inherited section |
| `routeAssetPrefetch.section.test.js` | `prefetchSectionAssetsForRoute` |
| `translationLoader.section.test.js` | per-section translation loaders |
| `localeManager.section.test.js` | locale change + section refresh |
| `assetPreloader.section.test.js` | `preloadSectionAssets`, `preloadSectionCriticalImages` |
| `getAssetPreloadEntriesForSection.test.js` | section asset rollup |
| `router.index.section.test.js` | `router/index.js` — `loadRouteComponent`, hooks |
| `main.startup.section.test.js` | `app/main.js` startup preload block |
| `section.integration.test.js` | navigate auth → dashboard → shop flows |
| `routeConfig.section.integrity.test.js` | production `routeConfig.json` section fields |

**Conventions**

- Mock `getRouteConfiguration()` / `resolveRouteFromPath` when testing identifier resolution unless testing live resolver.
- Mock `getSectionBundlePaths` unless testing `manifestLoader` itself.
- Use `happy-dom` or `jsdom` for `<link>` injection tests; call `clearPreloadState()` + `clearAllSectionCss()` + `clearManifestCache()` in `afterEach`.
- Import from `@/systems/sections/...` after refactor (update stale `utils/section` paths).
- Pinia: `setActivePinia(createPinia())` before store tests.
- `vi.stubEnv('VITE_SECTION_PRELOAD_TIMEOUT_MS', '…')` for timeout cases.
- Integration: memory history router + stub auth role + fixture routes with known `section` / `preLoadSections`.

---

## 0. Production route integrity — section fields (`routeConfig.json`)

- `routeConfig.json` parses; every non-redirect route has `section` (string or role object)
- every `section` string is non-empty after trim
- every role-based `section` object has at least one non-empty string value
- every role-based `section` includes `default` or documents explicit fallback behaviour in resolver tests
- no `section` object contains non-string values
- `preLoadSections` when present is array or role-keyed object (never bare string)
- flat `preLoadSections` array entries are non-empty strings
- role-keyed `preLoadSections` arrays contain only non-empty strings per role
- role-keyed `preLoadSections` resolves for `creator`, `fan`, `guest`, and `default` roles in fixture subset
- `preLoadSections` entries that are route slugs resolve to valid section names via `resolveSectionIdentifier`
- `preLoadSections` entries that are direct section names exist in `section-manifest.json` (or dev stub)
- child route with `inheritConfigFromParent: true` inherits parent `section` when child omits `section`
- child route with `inheritConfigFromParent: true` inherits parent `preLoadSections` when child omits `preLoadSections`
- child `section` overrides inherited parent `section`
- child `preLoadSections` overrides inherited parent `preLoadSections` (not concat — document expected merge)
- nested inheritance chain (grandparent → parent → child) resolves `section` correctly for `resolveEffectiveRouteConfig`
- nested inheritance chain resolves `preLoadSections` correctly for `getRoutePreloadPlan`
- dashboard routes use role-based `section` with distinct `creator` / `fan` / `default` variants
- auth routes use simple string `section: "auth"`
- shop/profile routes referenced in `preLoadSections` resolve without null
- no route lists duplicate `preLoadSections` entries that fail dedup silently
- disabled routes still have valid `section` when structurally validated
- catch-all route `section` resolves or is intentionally absent with documented behaviour
- locale-prefixed navigation does not change resolved section name for same logical route
- `validateI18n` known sections includes every production `section` string variant
- `collectKnownSectionNames` from route config matches manifest section keys (minus intentional gaps)
- production route count baseline snapshot for section coverage

---

## 1. `sectionResolver.js` — `getPreloadSectionsForRoute`

- returns empty array when `route` is null
- returns empty array when `route` is undefined
- returns empty array when `preLoadSections` is missing
- returns empty array when `preLoadSections` is null
- returns empty array when `preLoadSections` is undefined
- returns copy of flat array when `preLoadSections` is `['shop', 'profile']`
- deduplicates duplicate entries in flat `preLoadSections` array
- preserves order of first occurrence after dedup
- returns role array when `preLoadSections.creator` is `['shop']` and `userRole` is `creator`
- falls back to `preLoadSections.default` when role key missing
- falls back to `preLoadSections.guest` when role and `default` missing
- returns empty array when role-keyed object has no matching role and no fallback keys
- logs warn when role-keyed `preLoadSections` cannot be resolved
- returns empty array when `preLoadSections` is number (invalid type)
- returns empty array when `preLoadSections` is boolean (invalid type)
- returns empty array when role sections value is non-array object
- returns empty array when role sections value is empty string
- handles `userRole` undefined (uses fallback chain)
- handles `userRole` empty string
- handles `userRole` unknown role name
- returns empty array on thrown error inside resolver (catch path)
- calls `performanceTracker.step` for resolve when tracker present
- does not throw when `route.slug` missing
- `preLoadSections: []` returns empty array
- role object with empty array for role returns empty array (no fallback to other roles unless implemented)

---

## 2. `sectionResolver.js` — `resolveSectionIdentifier`

- returns null when identifier is null
- returns null when identifier is undefined
- returns null when identifier is empty string
- returns null when identifier is whitespace only
- returns null when identifier is number
- trims leading/trailing whitespace from direct section name
- treats `auth` as direct section name when no route slug matches
- resolves `dashboard` slug to role section when route exists and has role-based `section`
- resolves `/dashboard` slug (leading slash) to section via `resolveRouteFromPath`
- resolves slug without leading slash by prepending `/`
- uses `resolveRoleSectionVariant` on matched route's `section` config
- returns null when matched route has unresolvable role-based `section` for `userRole`
- returns direct trimmed name when slug does not match any route
- defaults `userRole` to `guest` when omitted
- passes explicit `userRole` to `resolveRoleSectionVariant` for slug match
- does not call route resolver when identifier is invalid type
- handles slug match where route has simple string `section`
- handles slug match where route has no `section` field (returns trimmed identifier)
- identifier `shop` stays `shop` when no route named shop
- identifier `/log-in` resolves to `auth` when login route section is auth
- performance tracker steps fire when window.performanceTracker defined

---

## 3. `sectionResolver.js` — `getAllRouteSectionsForRoute`

- returns only route section when `preLoadSections` empty
- includes route `section` plus all preload sections
- deduplicates when preload list contains same section as route `section`
- returns empty array when route section unresolvable and preloads empty
- returns preload sections only when route has no `section` field
- role-based route `section` resolves per `userRole` before merge
- flat preloads merged after route section
- returns empty array on internal error (catch)
- order: route section first, then preloads (document or assert stable order)
- handles null route gracefully (empty array)
- performance tracker steps recorded
- `userRole` affects both route section and role-keyed preloads

---

## 4. `sectionResolver.js` — `normalizeSectionConfiguration`

- string `"auth"` → `{ type: 'simple', value: 'auth', roleBased: false }`
- role object → `{ type: 'role-based', value: object, roleBased: true, roles: keys }`
- null → `{ type: 'invalid', value: null, roleBased: false }`
- undefined → invalid type
- number → invalid type
- boolean → invalid type
- empty object `{}` → role-based with empty roles array
- array → invalid type
- performance tracker step on normalize

---

## 5. `sectionResolver.js` — `resolveRoleSectionVariant`

- simple string `section` returns same string for any role
- simple string `section` ignores `fallback` parameter
- role object returns value for matching `userRole` key
- role object uses `fallback` key (default `'default'`) when role missing
- custom `fallback` third argument used when role missing
- returns null when role missing and fallback key absent
- returns null when role object value is empty string
- returns null for null `sectionConfig`
- returns null for undefined `sectionConfig`
- returns null for number `sectionConfig`
- number role key in object still resolves if `safelyGetNestedProperty` finds it
- `userRole` undefined uses fallback path
- logs warn when using fallback section
- logs warn when resolution fails completely
- performance tracker steps for simple vs role-specific resolution
- nested object values not supported (returns null or key value as-is per implementation)

---

## 6. `sectionResolver.js` — `isSectionRoleBased`

- returns false for string section
- returns true for role object section
- returns false for null (via normalize invalid)
- returns false for number
- delegates to `normalizeSectionConfiguration`

---

## 7. `sectionResolver.js` — `getAllSectionVariants`

- string section returns single-element array `[section]`
- role object returns unique values from `Object.values`
- deduplicates when creator and fan share same section string
- returns empty array for null
- returns empty array for undefined
- returns empty array for number
- empty role object returns empty array
- preserves no particular order or documents sorted order

---

## 8. `sectionPreloader.js` — `preloadSection`

- returns resolved `true` immediately when store `hasSection` is true (cache hit)
- does not fetch manifest on cache hit
- returns shared in-flight promise when second caller preloads same section concurrently
- only one `_doPreload` execution per section for concurrent callers
- marks `sectionsInProgress` in store when starting new preload
- unmarks in-progress in `finally` after completion
- removes from `inProgressPromises` map after completion
- returns `false` when manifest has no paths for section
- returns `true` when JS and CSS preload succeed
- returns `true` when only JS present (no CSS in manifest)
- returns `true` when only CSS present (no JS in manifest)
- calls `preloadSectionCss` when CSS path exists
- calls `preloadJavaScriptBundle` when JS path exists
- calls `addSection` only after both JS and CSS branches settle
- calls `preloadSectionAssets` non-blocking after addSection
- asset preload failure does not fail `preloadSection` return value
- returns `false` on manifest load throw
- returns `false` on untrusted JS path
- returns `false` on JS preload timeout
- returns `false` on JS `onerror`
- returns `false` on CSS preload rejection
- logs cache-hit at info level
- logs in-progress sharing at info level
- performance tracker steps on start, cache-hit, complete, error

---

## 9. `sectionPreloader.js` — `preloadJavaScriptBundle` (behaviour via `preloadSection`)

- creates `link[rel=modulepreload]` with correct `href`
- sets `as=script`
- sets `data-section-js-preload` attribute to section name
- sets `integrity` when manifest provides SRI hash
- skips integrity when null or empty string
- rejects untrusted bundle path before DOM mutation
- resolves immediately when link with same `href` already in DOM
- does not duplicate link when href exists with different rel
- appends link to `document.head`
- removes link from DOM on `onerror`
- removes link on timeout via cleanup selector
- timeout message includes section name and bundle path
- uses `VITE_SECTION_PRELOAD_TIMEOUT_MS` when valid positive number
- falls back to 10000ms default when env unset
- falls back to default when env is non-numeric
- `escapeSelectorAttributeValue` used in duplicate detection query

---

## 10. `sectionPreloader.js` — `preloadMultipleSections`

- empty array returns `{ successful: [], failed: [] }`
- single section success populates `successful`
- single section failure populates `failed`
- parallel preload of three sections awaits all
- partial failure: two succeed one fails — correct partition
- duplicate section names in input handled (second is cache hit)
- catch-all outer error returns all sections in `failed`
- does not throw on individual section failure
- performance tracker batch start and complete steps

---

## 11. `sectionPreloader.js` — `isSectionPreloaded`

- returns true when store has section
- returns false when store does not have section
- returns false for unknown section name
- delegates to `usePreloadStore.hasSection`

---

## 12. `sectionPreloader.js` — `resetSectionPreloadState`

- removes section from store preloaded set
- unmarks section in-progress
- deletes in-flight promise from internal map
- removes `link[data-section-js-preload]` for section from DOM
- calls `clearSectionCssPreloadHint` for section
- no-op safe when section never preloaded
- allows subsequent `preloadSection` to run fresh preload

---

## 13. `sectionPreloader.js` — `clearPreloadState`

- clears all section CSS via `clearAllSectionCss`
- removes all `link[data-section-js-preload]` elements
- calls store `clearState`
- clears internal `inProgressPromises` map
- safe to call when already empty
- logs cleared count from store size before clear

---

## 14. `sectionPreloader.js` — `getPreloadStatistics`

- returns `preloadedCount` matching store size
- returns `preloadedSections` array copy of store keys
- returns `inProgressCount` from `sectionsInProgress`
- returns `inProgressSections` array
- reflects state after `preloadSection` in progress
- reflects state after completion
- empty store returns zeros and empty arrays

---

## 15. `sectionCssLoader.js` — `loadSectionCss`

- returns true immediately when section already in `loadedSectionCss` set
- returns false when manifest has no CSS for section
- returns false when CSS path fails trust validation
- returns true after successful `injectCssLink`
- adds section to `loadedSectionCss` on success
- stores link in `activeSectionCss` map
- returns false on inject rejection (network error)
- does not double-inject when called twice sequentially (cache)
- performance tracker start and complete steps
- handles manifest fetch error → false

---

## 16. `sectionCssLoader.js` — `preloadSectionCss`

- returns true when section already loaded (stylesheet injected)
- returns shared promise for concurrent preload of same section
- returns false when no CSS bundle
- returns false when untrusted path
- creates `link[rel=preload][as=style]`
- sets `data-section-preload` attribute
- resolves true on `onload`
- rejects on `onerror` and removes link from DOM
- returns true when existing preload link with same href in DOM
- sets integrity on preload link when provided
- appends preload link to head

---

## 17. `sectionCssLoader.js` — `unloadSectionCss`

- removes active stylesheet link from DOM for section
- removes section from `loadedSectionCss` and `activeSectionCss`
- removes preload hint when only hint exists (no active stylesheet)
- returns true when stylesheet removed
- returns true when only preload hint removed
- returns false when section not loaded and no hint
- returns false on caught exception
- does not remove other sections' CSS

---

## 18. `sectionCssLoader.js` — `getLoadedSections`

- returns empty array initially
- returns section name after `loadSectionCss` success
- returns multiple sections when multiple loaded
- does not include section that only has preload hint (not injected stylesheet)

---

## 19. `sectionCssLoader.js` — `clearAllSectionCss`

- removes all `link[data-section-css]` from DOM
- removes all `link[data-section-preload]` from DOM
- clears `loadedSectionCss`, `activeSectionCss`, `preloadHintLinks`, `preloadHintPromises`
- safe when no links present
- does not remove unrelated stylesheets

---

## 20. `sectionCssLoader.js` — `clearSectionCssPreloadHint`

- delegates to `removeSectionCssPreloadHint`
- returns true when hint removed
- returns false when no hint existed

---

## 21. `sectionCssLoader.js` — internal path helpers (behaviour tests)

- `normalizeCssBundlePath` adds leading `/` for relative paths
- `normalizeCssBundlePath` preserves `https://` URLs
- `normalizeCssBundlePath` preserves paths already starting with `/`
- `normalizeCssBundlePath` strips duplicate leading slashes
- `getSectionCssBundle` returns null when manifest entry missing
- `getSectionCssBundle` normalizes path from manifest
- `injectCssLink` reuses existing `link[data-section]` for same section
- `applyBundleLinkIntegrity` sets integrity only for non-empty string

---

## 22. `sectionPreloadOrchestrator.js` — `resolveEffectiveRouteConfig`

- returns null when input null
- returns null when input undefined
- returns same object reference when `inheritConfigFromParent` false
- delegates to `inheritConfigurationFromParentRoute` when flag true
- inherited child gains parent `section` when child omits
- inherited child keeps child `section` when both define
- inherited child gains parent `preLoadSections` when child omits

---

## 23. `sectionPreloadOrchestrator.js` — `getRoutePreloadPlan`

- returns `{ identifiers: [], resolved: [] }` for null config
- returns empty for config without `preLoadSections`
- `identifiers` matches raw output from `getPreloadSectionsForRoute` on effective config
- `resolved` maps each identifier through `resolveSectionIdentifier`
- deduplicates resolved section names
- filters empty strings from resolved list
- appends `additionalSections` not already in resolved
- ignores non-string `additionalSections` entries
- ignores empty string `additionalSections` entries
- does not duplicate `additionalSections` already present
- applies inheritance before reading `preLoadSections`
- child with inherited parent preloads includes parent identifiers
- logs config with slug, role, identifiers, resolved

---

## 24. `sectionPreloadOrchestrator.js` — `resolveCurrentRouteSectionName`

- returns null when config null
- returns null when effective config has no `section`
- returns string for simple `section`
- returns role-specific string for role object
- returns null when role section unresolvable
- uses inherited `section` from parent when child inherits

---

## 25. `sectionPreloadOrchestrator.js` — `shouldPreloadDefaultAuthSection`

- returns true when not authenticated
- returns true when `currentPath` is `/log-in`
- returns true when `resolvedSections` includes `'auth'`
- returns false when authenticated, not login path, and auth not in resolved list
- handles empty `resolvedSections` array
- handles undefined `isAuthenticated` as falsy (document behaviour)

---

## 26. `sectionPreloadOrchestrator.js` — `preloadDefaultAuthSection`

- calls `preloadSection('auth')`
- logs preload status before call with isPreloaded/inProgress
- swallows rejection (non-blocking catch)
- logs error on failure without throwing
- uses provided `logContext.file` and `logContext.method` in logs

---

## 27. `sectionPreloadOrchestrator.js` — `startBackgroundSectionPreloads`

- skips section matching `skipSection` option
- skips null/undefined/non-string section entries
- calls `preloadSection` for each valid non-skipped section
- does not await throw from individual preload (catch per section)
- when `preloadTranslations` true and `locale` set, calls `loadTranslationsForSection`
- skips translation load when `areTranslationsLoadedForSection` true
- translation load failure non-blocking
- returns `Promise.all` of all pushed promises
- logs section status snapshot before starting
- logs alreadyPreloaded and needsPreload lists
- empty `sections` array resolves immediately
- `path` included in logs when provided

---

## 28. `sectionPreloadOrchestrator.js` — `refreshSectionPreloadsOnLocaleChange`

- no-op when filtered sections list empty
- calls `resetSectionPreloadState` for each section before re-preload
- excludes `skipSection` from refresh list
- filters non-string and empty section names
- delegates to `startBackgroundSectionPreloads` with `preloadTranslations: true`
- passes locale to background preloads
- logs locale and sections refreshed

---

## 29. `sectionPreloadOrchestrator.js` — `buildSectionPreloadStatusSnapshot` (via `startBackgroundSectionPreloads` logs)

- marks `skipped: true` when section equals `skipSection`
- `needsPreload: true` when not skipped, not preloaded, not in progress
- `willPreload: false` when skipped
- filters empty string sections from snapshot
- `isPreloaded` reflects store at snapshot time
- `inProgress` reflects store at snapshot time

---

## 30. `systems/sections/index.js` (barrel)

- exports `getPreloadSectionsForRoute`
- exports `getAllRouteSectionsForRoute`
- exports `normalizeSectionConfiguration`
- exports `resolveRoleSectionVariant`
- exports `isSectionRoleBased`
- exports `getAllSectionVariants`
- exports `preloadSection`
- exports `preloadMultipleSections`
- exports `isSectionPreloaded`
- exports `clearPreloadState`
- exports `getPreloadStatistics`
- does not export `resolveSectionIdentifier` (document intentional gap)
- does not export orchestrator symbols (document intentional gap)
- re-exported functions are same reference as source module

---

## 31. `usePreloadStore.js` — section state

### getters

- `hasSection('auth')` false on fresh store
- `hasSection('auth')` true after `addSection('auth')`
- `hasSection` false for empty string key
- `hasSection` false for whitespace-only key
- `isSectionInProgress` false initially
- `isSectionInProgress` true after `markSectionInProgress`
- `isSectionInProgress` false after `unmarkSectionInProgress`
- `isSectionInProgress` false for invalid section key

### actions

- `addSection` ignores invalid keys
- `addSection` idempotent — second add does not duplicate Set
- `addSection` triggers persist commit when section added
- `removeSection` removes existing section
- `removeSection` no-op when section absent
- `markSectionInProgress` ignores invalid keys
- `unmarkSectionInProgress` ignores invalid keys
- `setManifestLoadFailed(true)` sets flag
- `setManifestLoadFailed(false)` clears flag
- `clearState` empties `preloadedSections` and `sectionsInProgress`
- `clearState` does not clear `sectionsInProgress` only — clears both section sets
- `clearState({ resetBuildHash: true })` nulls buildHash
- rehydrate from persist restores `preloadedSections`
- stale build hash on rehydrate clears preload state (`finalizePreloadRestore`)
- `sectionsInProgress` not persisted across reload

### helpers

- `normalizeStringSet` from array filters non-strings
- `normalizeStringSet` from Set returns copy
- `isValidSectionKey` rejects empty trim

---

## 32. `manifestLoader.js` — `loadSectionManifest`

- returns cached manifest on second call without refetch
- DEV mode fetches `/section-manifest.dev.json`
- DEV mode returns `{}` when fetch fails
- PROD mode reads sessionStorage cache when present
- PROD mode fetches production manifest when no cache
- PROD fetch failure sets `manifestLoadFailed` on store
- PROD fetch failure returns `{}` gracefully
- concurrent PROD callers share single `manifestPromise`
- `clearManifestCache` forces refetch on next call
- performance tracker steps on cache hit and fetch

---

## 33. `manifestLoader.js` — `getSectionBundlePaths`

- returns null when section not in manifest
- returns `{ js, css: null }` for string manifest entry (trusted path)
- returns null for string entry with untrusted path
- returns object with `js`, `css`, `integrity` for object manifest entry
- uses `sectionEntry.path` fallback when `js` missing
- returns null when JS path untrusted
- returns null when CSS path untrusted
- accepts preloaded manifest argument (skips load)
- returns null on manifest load throw
- returns null for invalid manifest entry type (boolean)
- integrity object passed through for js and css subfields

---

## 34. `bundlePathValidation.js` — section consumer paths

- `isTrustedBundlePath` accepts `/assets/section-auth.js`
- `isTrustedBundlePath` rejects `javascript:alert(1)`
- `isTrustedBundlePath` rejects path traversal `../evil.js`
- `escapeSelectorAttributeValue` escapes quotes in href for querySelector

---

## 35. `routeNavigationData.js` — `resolveCurrentSectionForNavigation`

- returns null when `to.meta.section` missing
- returns string when meta.section is simple string
- resolves role object via `resolveRoleSectionVariant`
- returns null when role object unresolvable
- returns null when resolved value empty string
- uses `userRole` argument for resolution

---

## 36. `routeNavigationData.js` — `startCurrentSectionResourceLoads`

- returns null when `to.meta.routeConfig` missing
- calls `unloadSectionCss(previousSection)` when section changed
- does not unload when previous and current section same string
- does not unload when `from.meta.section` missing
- calls `loadSectionCss` for resolved current section (non-blocking)
- CSS load error logged not thrown
- loads translations when not already loaded for locale
- skips translation load when `areTranslationsLoadedForSection` true
- translation load error logged not thrown
- calls `preloadSectionAssets` for resolved section (non-blocking)
- logs warn when `currentSection` present but resolution fails
- returns resolved section string on success
- uses custom `logContext.file` / `logContext.method` in logs
- previousSection compared as meta value (may be role object — document behaviour)

---

## 37. `routeResolver.js` — `inheritConfigurationFromParentRoute` (section / preLoadSections)

- child without `inheritConfigFromParent` returns unchanged child
- child inherits parent `section` when undefined on child
- child `section` overrides parent `section`
- child inherits parent `preLoadSections` when undefined on child
- child `preLoadSections` overrides parent list (not concat)
- grandparent → parent → child chain merges `section` correctly
- grandparent → parent → child chain merges `preLoadSections` correctly
- parent not found returns child unchanged
- nested parent with `inheritConfigFromParent` resolved before merge
- role-based `section` inherited as object intact
- role-based `preLoadSections` inherited as object intact
- merged config used by `getRoutePreloadPlan` in integration fixture
- merged config used by `resolveCurrentRouteSectionName` in integration fixture

---

## 38. `routeResolver.js` — `resolveRouteFromPath` (section identifier coupling)

- resolves `/dashboard` for `resolveSectionIdentifier('dashboard')`
- returns null for unknown path — identifier falls through to direct name
- locale-free slug resolution matches section tests

---

## 39. `routeResolver.js` — `getRouteChainForPath` (section inheritance context)

- chain includes parent routes whose `preLoadSections` may inherit
- used indirectly when documenting multi-hop navigation preload order

---

## 40. `router/index.js` — `loadRouteComponent` (section branch)

- no `route.section` → standard lazy import without `preloadSection`
- with `section` → resolves via `resolveRoleSectionVariant(route.section, userRole)`
- cache hit (`hasSection`) → logs fast load, no blocking `preloadSection` await
- cache miss → fires `preloadSection` in background (non-blocking)
- always calls `preloadSectionCriticalImages` when section resolved (non-blocking)
- section name null when role resolution fails → no preload calls
- component import proceeds regardless of preload success

---

## 41. `router/index.js` — `beforeEach` (meta.section)

- sets `to.meta.section` to resolved string for role
- uses `resolveEffectiveRouteConfig` before resolving section
- falls back to raw `effectiveRouteConfig.section` when resolution returns null
- catch block sets raw section on resolution error
- logs resolved section for debugging

---

## 42. `router/index.js` — `beforeResolve` (resource loads)

- calls `startCurrentSectionResourceLoads` with to/from/userRole/locale
- does not block navigation on CSS/translation/asset promises
- passes router log context

---

## 43. `router/index.js` — `afterEach` (background preload)

- calls `getRoutePreloadPlan(routeConfig, userRole)` with effective config
- calls `startBackgroundSectionPreloads` when resolved list non-empty
- skips preload block when no sections configured
- logs original identifiers vs resolved names
- does not preload all sections in manifest — only plan list

---

## 44. `app/main.js` — startup section preload

- resolves current route section name on boot
- calls `getRoutePreloadPlan` for initial route + role
- calls `shouldPreloadDefaultAuthSection` with auth state and path
- calls `preloadDefaultAuthSection` when should-preload true
- calls `startBackgroundSectionPreloads` for plan (non-blocking)
- loads base translations before section-specific (order documented)
- startup does not block app mount on section preload failure

---

## 45. `routeTransition.js` — `resolveRouteTransition` (section via effective config)

- uses `resolveEffectiveRouteConfig` so transition metadata sees inherited `section`
- fixture: child route inherits parent section — transition resolves correct section context

---

## 46. `routeComponentPrefetch.js` — `prefetchRouteComponent` (section via effective config)

- resolves route with `resolveEffectiveRouteConfig` before component prefetch
- inherited `section` on child affects prefetch plan when coupled to section preload hooks

---

## 47. `routeAssetPrefetch.js` — `prefetchSectionAssetsForRoute`

- skips when route has no resolvable section
- calls `preloadSectionAssets` with resolved section name
- dedupes — second prefetch for same section no-ops
- shares in-flight promise for concurrent prefetch same section
- adds section to `prefetchedSections` on success
- uses `resolveCurrentRouteSectionName` with userRole
- `createSectionAssetPrefetchIntentHandler` triggers prefetch on intent event

---

## 48. `translationLoader.js` — section methods

- `loadTranslationsForSection(section, locale)` fetches allowlisted section folder
- rejects or skips non-allowlisted section names (`isAllowlistedSectionName`)
- `areTranslationsLoadedForSection` true after successful load
- `areTranslationsLoadedForSection` false for unknown section
- `preloadTranslationsForSections` batch loads multiple sections
- cache keyed by section + locale
- load failure rejects; orchestrator catches non-blocking

---

## 49. `localeManager.js` — section coupling

- `setActiveLocale` calls `getRoutePreloadPlan` for current route
- `setActiveLocale` calls `refreshSectionPreloadsOnLocaleChange` when sections to refresh
- `resolveSectionFromRoutePath` uses `resolveRoleSectionVariant`
- locale change resets and re-warms preloaded sections
- `translateCurrentPageTemporarily` loads section translations for resolved section

---

## 50. `assetPreloader.js` — section methods

- `preloadSectionAssets(section)` loads section asset map
- `preloadSectionCriticalImages(section)` loads priority images only
- failures non-blocking when called from router/preloader
- integrates with `usePreloadStore` for asset URLs

---

## 51. `getAssetPreloadEntriesForSection.js`

- `getAssetPreloadEntriesForSection(section)` returns entries for routes in section
- `routeBelongsToSection(route, section, role)` true for matching simple section
- `routeBelongsToSection` true for role-based section match
- `routeBelongsToSection` false for wrong section
- `isRouteEnabledForAssetPreload` gates disabled routes
- `dedupeAssetPreloadEntries` removes duplicate URLs
- `clearAssetPreloadSectionCache` clears cached rollups
- inherited `assetPreload` from parent included in section rollup (C-02)

---

## 52. Integration — navigation flows

- cold load `/log-in` preloads `auth` section when unauthenticated
- navigate login → dashboard swaps CSS from auth to dashboard-creator for creator role
- navigate dashboard-creator → dashboard-fan when role changes resolves new section variant
- `afterEach` preloads `preLoadSections` only for destination route
- skip current section in background preload when option set (startup)
- second navigation to same section does not duplicate CSS links
- concurrent navigation does not corrupt `usePreloadStore`
- locale switch DE → EN refreshes section bundles and translations
- manifest missing entry — navigation still completes, component lazy loads
- manifest load failed flag set — preload returns false, app usable
- deep link to child route inherits parent preloads via effective config
- browser back restores previous section CSS via unload/load cycle
- `preLoadSections` slug `shop` resolves and preloads shop bundles
- role change without navigation updates meta.section on next navigation
- fast double-click navigation dedupes in-flight section preloads
- 404 route without section — no section preload errors

---

## 53. Integration — inheritance matrix (conditions)

| Child `inherit` | Child `section` | Parent `section` | Expected effective section |
|-----------------|-----------------|------------------|----------------------------|
| false | auth | dashboard | auth |
| true | undefined | dashboard | dashboard |
| true | shop | dashboard | shop |
| true | undefined | role object | parent role object |

- verify creator role resolves `dashboard-creator` for inherited role object
- verify fan role resolves `dashboard-fan` for inherited role object
- verify guest resolves `default` key on inherited role object

| Child `inherit` | Child preloads | Parent preloads | Expected plan |
|-----------------|----------------|-----------------|---------------|
| true | undefined | `['shop']` | includes shop |
| true | `['profile']` | `['shop']` | profile only (override) |
| false | undefined | `['shop']` | empty |

---

## 54. Edge cases — malformed config and runtime

- `section: ""` treated as invalid / null resolution
- `section: { creator: "" }` falls back to default or null
- `preLoadSections: [""]` filtered or resolved empty
- circular slug reference in `preLoadSections` does not infinite loop
- `preLoadSections` referencing disabled route slug still resolves section name
- extremely long section name handled without throw
- unicode section name in manifest works when allowlisted
- `window.performanceTracker` undefined — no throw in any resolver/preloader path
- `document.head` missing — graceful failure in jsdom setup
- store cleared mid-preload — second caller may restart preload safely
- `resetSectionPreloadState` during active preload — behaviour documented (race)
- hydration from localStorage with old section names ignored after build hash mismatch

---

## 55. Regression — stale API / import paths

- no test imports from `src/utils/section/`
- no test imports from `../sections/sectionCssLoader` wrong path in preloader
- `clearPreloadState` exported (not removed `preloadSectionBundle`)
- `resetSectionPreloadState` used on locale refresh (not deleted API)

---

## 56. Performance / observability (optional assertions)

- cache-hit preload completes under threshold (no network mock delay)
- batch preload 5 sections issues 5 parallel manifest lookups (mock call count)
- logging calls include `sectionName` field on errors

---

## 57. Routing files — full method checklist (section-relevant coverage)

Each routing module method below must have **at least one** dedicated test in this plan or cross-reference `route-test-plan.md`. Section-specific tests are listed here; pure routing behaviour stays in route plan.

| Module | Method | Section test section |
|--------|--------|----------------------|
| `routeResolver.js` | `inheritConfigurationFromParentRoute` | §37 |
| `routeResolver.js` | `resolveRouteFromPath` | §38 |
| `routeResolver.js` | `getRouteChainForPath` | §39 |
| `routeResolver.js` | `resolveEffectiveAssetPreloadForRoute` | §51 (asset rollup) |
| `routeNavigationData.js` | `resolveCurrentSectionForNavigation` | §35 |
| `routeNavigationData.js` | `startCurrentSectionResourceLoads` | §36 |
| `routeTransition.js` | `resolveRouteTransition` | §45 |
| `routeComponentPrefetch.js` | `prefetchRouteComponent` | §46 |
| `routeAssetPrefetch.js` | `prefetchSectionAssetsForRoute` | §47 |
| `routeAssetPrefetch.js` | `createSectionAssetPrefetchIntentHandler` | §47 |
| `router/index.js` | `loadRouteComponent` | §40 |
| `router/index.js` | `beforeEach` hook | §41 |
| `router/index.js` | `beforeResolve` hook | §42 |
| `router/index.js` | `afterEach` hook | §43 |
| `sectionPreloadOrchestrator.js` | all exports | §22–§28 |
| `sectionResolver.js` | all exports | §1–§7 |
| `sectionPreloader.js` | all exports | §8–§14 |
| `sectionCssLoader.js` | all exports | §15–§21 |

---

## 58. `sectionResolver.js` — role matrix (`resolveRoleSectionVariant`)

- creator role → `dashboard-creator` from standard dashboard fixture
- fan role → `dashboard-fan` from standard dashboard fixture
- admin role → fallback `default` when admin key absent
- guest role → `default` key on dashboard fixture
- `userRole: 'creator'` case-sensitive — `Creator` does not match
- role object with only `default` key resolves for any unknown role via fallback
- role object with `guest` key used when userRole guest and no exact match
- third-arg fallback `'global'` used when `default` key renamed in fixture
- empty role object returns null
- role object with numeric keys ignored by safelyGetNestedProperty behaviour
- role object with nested object value returns object (document invalid section name handling)

---

## 59. `sectionResolver.js` — role matrix (`getPreloadSectionsForRoute`)

- creator gets `preLoadSections.creator` list not fan list
- fan gets fan list when creator also defined
- guest gets `preLoadSections.guest` when present
- missing role uses `default` preload list
- missing role and missing default uses `guest` preload list
- `preLoadSections: { creator: ['shop'], fan: ['profile'] }` — no cross-role bleed
- flat list same for all roles
- role list with duplicate slugs deduped in output

---

## 60. `sectionResolver.js` — identifier slug matrix

- identifier `log-in` resolves via `/log-in` route to `auth`
- identifier `/shop` resolves to shop section when route exists
- identifier `profile` without slash same as `/profile`
- identifier matching redirect-only route behaviour documented
- identifier matching disabled route — still resolves if resolver returns route
- identifier case sensitivity matches route slug rules
- identifier with query string `shop?x=1` does not match (trim/sanitize)
- identifier with hash `shop#tab` does not match

---

## 61. `sectionPreloader.js` — env and timeout matrix

- `VITE_SECTION_PRELOAD_TIMEOUT_MS=100` fails fast on slow link mock
- `VITE_SECTION_PRELOAD_TIMEOUT_MS=0` uses default 10000
- `VITE_SECTION_PRELOAD_TIMEOUT_MS=-1` uses default 10000
- `VITE_SECTION_PRELOAD_TIMEOUT_MS=abc` uses default 10000
- timeout clears partial link from DOM
- timeout does not call `addSection`
- success before timeout clears timer (no false timeout)

---

## 62. `sectionPreloader.js` — manifest shape matrix

- manifest JS only — CSS branch skipped, still addSection after JS
- manifest CSS only — JS branch skipped
- manifest with integrity.js only — CSS integrity optional
- manifest empty object for section — returns false
- manifest null entry — returns false
- manifest with `path` key instead of `js` — handled in getSectionBundlePaths mock

---

## 63. `sectionCssLoader.js` — DOM state matrix

- load after preload hint promotes to stylesheet without duplicate fetch (behaviour doc)
- unload then reload same section works
- two sections loaded — unload one leaves other
- clearAll then loadSectionCss works fresh
- injectCssLink onerror leaves section out of loadedSectionCss
- preload onerror removes hint link from head

---

## 64. `sectionPreloadOrchestrator.js` — plan matrix (inheritance + identifiers)

- parent `preLoadSections: ['shop']` + child inherit + no child preloads → plan includes shop
- child `preLoadSections: ['/shop']` resolves identifier to shop section name
- mixed slug and section identifiers in one list dedupe to same section
- `additionalSections: ['auth']` on login route plan
- empty `additionalSections` default does not mutate resolved
- effective config null when routeConfig null — plan empty
- route with only `section` no preloads — plan resolved empty but current section name set

---

## 65. `routeNavigationData.js` — navigation edge matrix

- first navigation (no from) — no unload called
- from and to same meta.section string — no unload
- from auth to shop — unload auth CSS
- meta.section role object on to — resolved before load
- meta.section role object on from — unload uses raw meta compare (document mismatch risk)
- missing activeLocale — translation path still invoked or skipped per implementation
- missing userRole — resolution uses guest default

---

## 66. `router/index.js` — hook ordering

- beforeEach section resolve runs before beforeResolve resource loads
- meta.section available in beforeResolve after beforeEach
- afterEach preload runs after navigation committed
- loadRouteComponent runs after guards — store may already have section from afterEach preload
- multiple rapid afterEach — each uses destination routeConfig only

---

## 67. `usePreloadStore.js` — concurrency

- addSection during markSectionInProgress — both states until unmark
- removeSection while inProgress — inProgress independent until unmark
- clearState during preload — subsequent hasSection false
- persist round-trip preserves preloadedSections across pinia reset with rehydrate

---

## 68. `translationLoader.js` — extended

- loadTranslationsForSection invalid section rejected
- second load same section+locale is cache hit (no fetch)
- preloadTranslationsForSections skips already loaded
- load failure does not mark as loaded
- locale `en` vs `EN` normalization if applicable

---

## 69. `localeManager.js` — extended

- locale change with no current route — no refresh throw
- locale change skipSection excludes active section from refresh
- getRoutePreloadPlan called with current route after locale set
- refresh resets only planned sections not entire manifest

---

## 70. `routeAssetPrefetch.js` — extended

- prefetch with null route — skip
- prefetch with disabled route — skip per isRouteEnabledForAssetPreload
- resetRouteAssetPrefetchCache allows re-prefetch
- intent handler debounces rapid hover events if implemented

---

## 71. `validateI18n.js` / `collectKnownSectionNames` — section coverage

- collectKnownSectionNames includes all simple section strings
- collectKnownSectionNames includes all role variant values
- collectKnownSectionNames dedupes role variants
- buildComponentSectionMap maps component paths to sections
- validateI18n warns on missing `public/i18n/section-X` folder

---

## 72. Build tooling — section manifest (unit, node)

- `discoverAllSectionsFromConfig` finds all section strings from route JSON
- `groupComponentsBySection` assigns components to section buckets
- `getPreloadConfiguration` reads preLoadSections from routes
- `getSectionDependencies` returns dependency graph per section
- `scanRouteConfigForSections` matches tailwind scanner
- `getSectionForComponent` reverse lookup from component path
- `generateSectionCssManifest` lists CSS outputs per section
- manifest integrity node validates `section-manifest.json` schema

---

## 73. Parametrized inheritance — `preLoadSections` + `section` (each = one test)

- inherit + parent section string + child undefined → child effective section parent value
- inherit + parent role section + child undefined → role resolution on inherited object
- no inherit + parent preloads + child undefined → child preloads empty
- inherit + parent preloads array + child empty array → child override empty
- inherit + parent preloads + child null → document null override behaviour
- inherit + parent no section + child section → child only
- three-level inherit middle defines section → grandchild sees middle
- three-level inherit only grandchild inherit → merges full chain
- parent disabled in config but inherit flag true — document whether parent found
- sibling routes do not leak preloads

---

## 74. Parametrized roles — navigation (each = one test)

- creator navigates to dashboard → `dashboard-creator` CSS loaded
- fan navigates to dashboard → `dashboard-fan` CSS loaded
- guest navigates to dashboard → `dashboard-global` or default key
- creator login → auth section
- fan login → auth section (same bundle)
- role switch creator→fan on same slug swaps section variant on next navigation
- unauthenticated shop browse → shop section without dashboard variant

---

## 75. Parametrized manifest — loader (each = one test)

- section `auth` manifest entry present → preload true
- section `missing-section` → preload false
- dev stub manifest used when `import.meta.env.DEV`
- prod manifest fetch 404 → empty manifest all preloads false
- sessionStorage manifest used before network on second boot
- clearManifestCache forces network on next getSectionBundlePaths

---

## 76. Parametrized store — preload lifecycle (each = one test)

- preload auth → hasSection auth true
- preload auth fail → hasSection auth false
- reset auth → hasSection false, can preload again
- preload shop + profile batch → both in successful array
- one fail one success batch → correct failed array
- inProgress true during await → isSectionInProgress true
- after complete → inProgress false

---

## 77. Router `loadRouteComponent` — role × cache matrix

- creator + cache miss → background preloadSection called
- creator + cache hit → preloadSection not awaited
- fan + cache miss → resolves fan section name before preload
- no section route → preloadSection never called
- section resolve null → preloadSectionCriticalImages not called

---

## 78. `startBackgroundSectionPreloads` — skip and locale matrix

- skipSection auth → auth not in preload calls but others are
- skipSection null → nothing skipped
- preloadTranslations false → loadTranslationsForSection never called
- preloadTranslations true locale null → translations not loaded
- locale de + section shop → loadTranslationsForSection('shop','de')
- translations already loaded → skip log path

---

## 79. `refreshSectionPreloadsOnLocaleChange` — matrix

- two sections refresh both reset state
- skipSection excludes one from reset list
- empty sections array early return
- calls reset then startBackground with translations on
- locale fr refresh loads fr translation files

---

## 80. CSS loader — integrity and trust matrix

- trusted JS path from CDN allowlist if configured
- untrusted CSS path → loadSectionCss false
- integrity mismatch simulation — onerror path
- section name with hyphen `dashboard-creator` DOM attributes escaped

---

## 81. Regression scenarios from audits

- sectionPreloader imports `./sectionCssLoader` not `../sections/sectionCssLoader`
- orchestrator `resolveEffectiveRouteConfig` does not duplicate full route guard logic
- routeNavigationData unload uses resolved vs raw section consistently (track audit fix)
- manifest helpers extraction — tests target `sectionManifestHelpers` when created

---

## 82. Future `sectionManifestHelpers.js` (placeholder tests)

- `getSectionBundlePaths` re-exported from helpers matches manifestLoader behaviour
- runtime code imports helpers not build/manifestLoader directly
- manifest cache scoped to helpers module

---

---

## 83. `sectionResolver.js` — `resolveRolePreLoadSections` deep behaviour (internal, tested via `getPreloadSectionsForRoute`)

- role-keyed object with `default: ['shop']` and unknown role → returns shop list
- role-keyed object with `guest: ['profile']` only → non-guest role falls through to guest
- role-keyed object with both `default` and `guest` — role missing → `default` takes priority over `guest`
- role-keyed object with matching role key that is `null` → treated as no match, falls to fallback
- role-keyed object with matching role key that is empty array `[]` → returns empty (valid)
- flat array containing whitespace-only string entry — behaviour documented (included or filtered)
- flat array with one entry returns single-element array, not nested
- role value is a nested object (not array) — warn logged, returns empty
- `preLoadSections` is a function — handled as invalid type, returns empty

---

## 84. `sectionResolver.js` — `getAllRouteSectionsForRoute` — dedup edge cases

- route section is `'auth'`; preloads include `'auth'` — output is `['auth']` not `['auth', 'auth']`
- role-based section resolves to same string as a preload entry — still deduped
- route section resolves null; preloads non-empty — output is preloads only
- preloads contain three items all identical — deduplicated to one
- preloads array is role-keyed object with user having empty list — route section only in output
- preloads slug identifier resolves to same section as route section — deduped

---

## 85. `sectionResolver.js` — `normalizeSectionConfiguration` — additional shapes

- string `""` empty → `{ type: 'simple', value: '', roleBased: false }` (empty string preserved, resolver handles null check)
- string with spaces `"  auth  "` → type simple, value not trimmed (normalize does not trim — caller does)
- object with numeric value `{ creator: 123 }` → role-based (object type), roles includes creator
- `Object.create(null)` (null prototype object) → role-based type if object check passes
- array `['auth', 'shop']` → invalid type (arrays are objects but check order matters)
- `new String('auth')` boxed string — document whether handled as string or object

---

## 86. `sectionPreloader.js` — `preloadSection` DOM and promise edge cases

- section preloaded successfully; `clearPreloadState` called; `preloadSection` again starts fresh `_doPreload`
- `preloadSection` called while `_doPreload` is mid-execution; store gets `addSection` only once
- `preloadSection` returns `false`; store does NOT call `addSection`
- JS preload link appended to head; `document.head.appendChild` throws — error caught, returns false
- `_doPreload` awaits JS and CSS in parallel; both reject — `addSection` never called
- CSS preload starts before JS resolves; `addSection` waits for `Promise.all` of both
- `preloadSectionAssets` called after `addSection` — order assertion
- `inProgressPromises` entry deleted even when `_doPreload` throws synchronously

---

## 87. `sectionPreloader.js` — `preloadJavaScriptBundle` link lifecycle

- link `rel` attribute is exactly `modulepreload` not `preload`
- `data-section-js-preload` value equals sectionName exactly
- `as` attribute set to `script`
- successful load does NOT remove link from DOM (stays as preload cache)
- `onerror` removes link immediately before reject
- integrity attribute only present when non-empty string hash provided
- existing link check uses `escapeSelectorAttributeValue` for special chars in path
- timeout fires; link with matching selector removed from DOM
- timeout and `onerror` both fire — double-remove handled safely (parentNode null check)
- link created but document has no head — error logged, rejected gracefully

---

## 88. `sectionPreloader.js` — `preloadMultipleSections` result shape

- result `successful` contains section names not objects
- result `failed` contains section names not error objects
- result `successful` preserves input order on success
- result `failed` preserves input order on failure
- empty input returns object shape `{ successful: [], failed: [] }` not null or undefined
- sections with names `''` or `null` in input — document whether filtered before map or cause individual failure

---

## 89. `sectionPreloader.js` — `getPreloadStatistics` snapshot

- statistics after `preloadMultipleSections` partial success lists correct counts
- statistics `inProgressSections` is empty array when nothing in-flight (not Set)
- statistics `preloadedSections` is plain array not Set
- statistics are snapshot — mutating store after call does not retroactively change returned object

---

## 90. `sectionCssLoader.js` — `loadSectionCss` injection detail

- returned `true` even when `preloadSectionCss` was called first (CSS already downloaded)
- `link.rel` set to `stylesheet` not `preload` in injected active element
- `link.href` set to normalized path (with leading slash)
- `data-section` attribute equals sectionName
- `data-section-css` attribute set to `"true"`
- second call while first `injectCssLink` promise in-flight — does first call guard prevent race?
- section removed then reloaded — new link element created, old removed

---

## 91. `sectionCssLoader.js` — `preloadSectionCss` — concurrent and lifecycle

- two sections preloading simultaneously — each gets its own link element
- section already in `loadedSectionCss` (stylesheet injected) — `preloadSectionCss` returns true immediately
- `onload` fires after `onerror` on same link (spec edge case) — resolved state not double-fired
- `preloadHintPromises` cleared after `onerror`
- `preloadHintLinks` cleared after `onerror`
- calling `preloadSectionCss` again after onerror creates fresh attempt

---

## 92. `sectionCssLoader.js` — `unloadSectionCss` detail

- removes link by `activeSectionCss` reference, not by DOM query
- `loadedSectionCss.delete` called; `getLoadedSections` no longer includes section
- preload hint removed when both stylesheet and hint present
- no-op called twice — second call returns false without error
- link element `parentNode` null (already detached) — handled without throw

---

## 93. `sectionCssLoader.js` — `clearAllSectionCss` detail

- selector `link[data-section-css="true"]` removes all active stylesheets
- selector `link[data-section-preload]` removes all hints (any value)
- unrelated `link[rel=stylesheet]` without section attributes untouched
- unrelated `link[rel=preload]` without `data-section-preload` untouched
- `activeSectionCss` map is empty after clear
- `preloadHintPromises` map is empty after clear — pending promises become orphaned (document)

---

## 94. `sectionCssLoader.js` — `normalizeCssBundlePath` full matrix

- `"section-auth.css"` → `"/section-auth.css"`
- `"/section-auth.css"` → `"/section-auth.css"` (unchanged)
- `"//section-auth.css"` → `"/section-auth.css"` (double slash collapsed)
- `"https://cdn.example.com/auth.css"` → `"https://cdn.example.com/auth.css"` (unchanged)
- `"http://cdn.example.com/auth.css"` → unchanged
- `" /section-auth.css"` → leading whitespace trimmed first, then preserved path
- empty string → `"/"` (trim + prepend — document whether this is guarded upstream)

---

## 95. `sectionCssLoader.js` — `applyBundleLinkIntegrity` full matrix

- string `"sha384-abc"` → sets `link.integrity = "sha384-abc"`
- empty string `""` → does not set integrity attribute
- `null` → does not set
- `undefined` → does not set
- number `123` → does not set (not a string)

---

## 96. `sectionPreloadOrchestrator.js` — `resolveEffectiveRouteConfig` deeper

- child with `inheritConfigFromParent: false` explicitly — returns child as-is (does not call `inheritConfigurationFromParentRoute`)
- child with `inheritConfigFromParent: true`; parent slug not found in config — returns child (no parent merge)
- merging strips `inheritConfigFromParent` flag from result or retains it — document
- returned object is new merged object not original child reference when inherited
- `section` in result is parent's when child omits — tested by value not reference

---

## 97. `sectionPreloadOrchestrator.js` — `getRoutePreloadPlan` — identifier resolution pipeline

- slug identifier in `preLoadSections` that resolves to a section different from the slug → resolved list has section name not slug
- same slug and same section name string in input — deduped in `resolved` not `identifiers`
- `identifiers` array preserves raw strings from `getPreloadSectionsForRoute` (before resolution)
- `additionalSections: ['shop', 'shop']` — duplicates in additional list deduplicated
- resolved section names from identifiers + additional never exceed unique count
- route with no `preLoadSections` but `additionalSections` provided — resolved contains only additional
- `userRole` `undefined` passed to `resolveSectionIdentifier` — `guest` used as default

---

## 98. `sectionPreloadOrchestrator.js` — `shouldPreloadDefaultAuthSection` — all flag combinations

- `{ isAuthenticated: false, currentPath: '/dashboard', resolvedSections: [] }` → true
- `{ isAuthenticated: true, currentPath: '/dashboard', resolvedSections: [] }` → false
- `{ isAuthenticated: true, currentPath: '/log-in', resolvedSections: [] }` → true
- `{ isAuthenticated: true, currentPath: '/shop', resolvedSections: ['auth'] }` → true
- `{ isAuthenticated: false, currentPath: '/log-in', resolvedSections: ['auth'] }` → true
- `{ isAuthenticated: true, currentPath: '/shop', resolvedSections: ['shop'] }` → false
- `resolvedSections: undefined` — does not throw (uses array method safely)

---

## 99. `sectionPreloadOrchestrator.js` — `preloadDefaultAuthSection` — store state checks

- when auth already preloaded — `preloadSection` still called (orchestrator delegates, preloader handles cache)
- when auth preload is in progress — `preloadSection` returns shared promise (no redundant load)
- `logContext.file` used verbatim in log calls — no hard-coded file name
- catch on rejection logs `err.message` not `err` object (document format)

---

## 100. `sectionPreloadOrchestrator.js` — `startBackgroundSectionPreloads` — translation path

- `preloadTranslations: true`, `locale: null` — translation block skipped, no throw
- `preloadTranslations: true`, `locale: 'en'`, section already loaded — translation skipped via `areTranslationsLoadedForSection`
- `preloadTranslations: false` — `areTranslationsLoadedForSection` never called
- translation error caught; other section preloads not affected
- two sections in list — translation called for each independently
- `skipSection` excluded from translation loads too (not just bundle preload)

---

## 101. `sectionPreloadOrchestrator.js` — `buildSectionPreloadStatusSnapshot` — all states

- section both `isPreloaded` and `inProgress` simultaneously — snapshot captures both true
- `needsPreload` false when `isPreloaded` is true even if not skipped
- `needsPreload` false when `inProgress` is true
- `willPreload` true when not skipped — regardless of cached state
- `skipped: true` sections still appear in snapshot (not filtered out of array)
- snapshot is ordered consistently with input `sections` array order

---

## 102. `usePreloadStore.js` — `normalizeStringSet` full matrix

- `normalizeStringSet(new Set(['a', 'b']))` → returns new Set with same values
- `normalizeStringSet(['a', 'b', ''])` → filters empty string
- `normalizeStringSet(['a', 'b', '  '])` → filters whitespace-only
- `normalizeStringSet(['a', 1, null, 'b'])` → filters non-strings
- `normalizeStringSet(null)` → returns empty Set
- `normalizeStringSet(undefined)` → returns empty Set
- `normalizeStringSet({})` → returns empty Set (not array, not Set)
- `normalizeStringSet(new Set())` → empty Set

---

## 103. `usePreloadStore.js` — persistence and migration

- `mapPreloadPersistedState` converts array `preloadedSections` to Set on rehydrate
- `migratePreloadPersistedState` from version 0 returns expected shape
- `migratePreloadPersistedState` from unrecognised version returns state unchanged
- `mapBeforeSerialize` converts Set to array for JSON serialization
- `mapAfterDeserialize` converts array back to Set
- `buildPersistKey` produces stable non-empty string
- version 1 state passes through migration unchanged
- persisted sections lost after build hash change — `finalizePreloadRestore` clears
- same build hash — persisted sections kept after rehydrate
- `sectionsInProgress` set to empty Set in `beforeHydrate` regardless of storage

---

## 104. `usePreloadStore.js` — `addToStringSet` / `removeFromStringSet` helpers

- `addToStringSet` returns new Set reference when value added (not same ref)
- `addToStringSet` returns same Set reference when value already present
- `removeFromStringSet` returns new Set reference when value removed
- `removeFromStringSet` returns same Set reference when value not present
- both helpers do not mutate input Set
- `addSection` only calls `commitPersistedPreloadState` when Set reference changes

---

## 105. `manifestLoader.js` — session storage and retry

- sessionStorage key is consistent across calls (not random)
- manifest persisted to sessionStorage after successful production fetch
- `readManifestFromSession` returns null when sessionStorage empty
- `readManifestFromSession` returns null when stored JSON malformed
- production manifest fetch with network error — retry attempted (if `fetchProductionManifestWithRetry` has retry logic)
- `markManifestLoadRecovered` called after successful fetch following prior failure
- `resetManifestLoadState` clears `manifestPromise` so next call can retry
- `clearManifestCache` clears both in-memory cache and `manifestPromise`
- development mode with 404 on dev stub — `cachedManifest` set to `{}`
- development mode with malformed JSON in dev stub — handled without throw

---

## 106. `manifestLoader.js` — `getSectionBundlePaths` manifest entry shape variants

- object entry with only `path` key (no `js`) — uses `path` value as JS path
- object entry with only `css` key, no JS — `{ js: null, css: cssPath }`
- object entry with `integrity: { js: 'sha384-...', css: 'sha384-...' }` — both passed through
- object entry with `integrity: null` — `integrity` field in result is null
- string entry with leading slash — trusted check applied to normalized path
- object entry where `js` path is untrusted but `css` is trusted — whole entry rejected (null)
- object entry where only `css` path untrusted — whole entry rejected
- manifest with 50 sections — correct section isolated, no cross-section bleed

---

## 107. `bundlePathValidation.js` — `isTrustedBundlePath` full cases

- `/assets/section-auth-Abc123.js` → trusted
- `/assets/section-dashboard-creator-xyz.css` → trusted
- empty string → untrusted
- `null` → untrusted without throw
- `undefined` → untrusted without throw
- `data:text/javascript,alert(1)` → untrusted
- `//evil.com/script.js` → untrusted (protocol-relative)
- `javascript:void(0)` → untrusted
- `../relative/path.js` → untrusted
- `blob:http://localhost/fake` → untrusted
- very long path (5000 chars) → does not hang/throw
- path with encoded chars `%2F` — document trusted or not

---

## 108. `bundlePathValidation.js` — `escapeSelectorAttributeValue` full cases

- path with single quote `'` → escaped
- path with double quote `"` → escaped
- path with backslash `\` → escaped
- path with square bracket `[` → escaped
- path with no special chars → returned unchanged
- empty string → empty string
- complex hash path `/assets/auth-Kx9pQ.js` → unchanged (normal chars)

---

## 109. `routeNavigationData.js` — `resolveCurrentSectionForNavigation` — `to.meta` edge cases

- `to.meta` completely absent → returns null without throw
- `to.meta.section` is `null` explicitly → returns null
- `to.meta.section` is `0` → returns null (falsy)
- `to.meta.section` is `{}` empty object → `resolveRoleSectionVariant` returns null
- `to.meta.section` is string with spaces `' auth '` → returns trimmed or raw string (document)
- `userRole` param missing entirely → uses guest fallback in `resolveRoleSectionVariant`

---

## 110. `routeNavigationData.js` — `startCurrentSectionResourceLoads` — CSS swap timing

- `unloadSectionCss` called synchronously before `loadSectionCss` starts
- `loadSectionCss` is fire-and-forget — function returns before CSS loads
- `preloadSectionAssets` is fire-and-forget — function returns before assets loaded
- returns `null` not `undefined` when section not resolved (type safety)
- returns string immediately — does not return a Promise
- `from` route with no `meta` property — no throw when accessing `from.meta?.section`

---

## 111. `routeNavigationData.js` — `startCurrentSectionResourceLoads` — translation guards

- section resolved; locale `'en'`; translations not loaded → `loadTranslationsForSection('auth', 'en')` called
- section resolved; locale `'de'`; translations already loaded for `'de'` → skipped
- section resolved; locale `'en'`; translations loaded for `'de'` only → loads `'en'` translations
- `areTranslationsLoadedForSection` called with resolved section name not raw meta value
- translation load throws inside catch — no rethrow
- locale empty string `''` — translation load skipped or attempted (document)

---

## 112. `routeResolver.js` — `inheritConfigurationFromParentRoute` — merge detail

- child `requiresAuth: true` not overridden by parent `requiresAuth: false` (child wins)
- parent `assetPreload: ['a']` + child `assetPreload: ['b']` → merged `['a', 'b']` (C-02 concat)
- parent no `assetPreload` + child `assetPreload: ['b']` → `['b']` only
- parent `assetPreload: ['a']` + child no `assetPreload` → `['a']` from parent only
- merged config does not include `inheritConfigFromParent` flag from parent (parent's flag ignored)
- `deepMergePreferChild` for `section` — child undefined does NOT override parent (merge semantics)
- `deepMergePreferChild` for `preLoadSections` — child empty array overrides parent array

---

## 113. `routeResolver.js` — `findParentRouteBySlug` (indirect tests via inheritance)

- `/dashboard/settings/privacy` → parent is `/dashboard/settings`
- `/dashboard/settings` → parent is `/dashboard`
- `/dashboard` → no parent found, returns null
- `/a/b/c/d` → parent search tries `/a/b/c`, `/a/b`, `/a` in order
- path with no slashes after root → no parent
- parent slug found but parent is disabled route — still returned (guard is caller's concern)
- two routes have same parent prefix — correct one matched by exact slug equality

---

## 114. `router/index.js` — `loadRouteComponent` — section branch isolation

- `route.section` is role object; role resolves null → `preloadSection` not called, component loads
- `route.section` is role object; role resolves `'auth'` → `preloadSection('auth')` called in background
- `preloadSectionCriticalImages` rejection does not affect component load
- `preloadSection` rejection does not affect component load
- `preloadSection` called even when `usePreloadStore.hasSection` false (cache miss path)
- `preloadSection` NOT awaited — component import starts immediately on cache miss
- `usePreloadStore` instance accessed via `usePreloadStore()` call inside function (not stale closure)

---

## 115. `router/index.js` — `beforeEach` — `to.meta.section` assignment

- `effectiveRouteConfig.section` is string → `to.meta.section` set to same string (no role check needed)
- `effectiveRouteConfig.section` is role object + creator role → `to.meta.section = 'dashboard-creator'`
- resolution throws → catch sets `to.meta.section = effectiveRouteConfig.section` (raw value)
- `effectiveRouteConfig.section` undefined → no `to.meta.section` assignment
- `resolveRoleSectionVariant` returns null → fallback to raw section (not null on meta)
- meta assignment does not persist after navigation (scoped to guard run)

---

## 116. `router/index.js` — `afterEach` — plan gating

- `routeConfig` missing on route → `getRoutePreloadPlan` returns empty → no preload calls
- `resolvedSectionsToPreload` empty array → `startBackgroundSectionPreloads` not called
- `sectionsToPreload` (identifiers) non-empty but resolved empty → skip documented in logs
- `startBackgroundSectionPreloads` passed `logContext` with file and method set
- multiple concurrent `afterEach` calls for fast navigation — each resolves its own plan independently

---

## 117. `app/main.js` — startup sequencing

- `resolveCurrentRouteSectionName` called with initial route and user role
- `getRoutePreloadPlan` called with initial route config
- `shouldPreloadDefaultAuthSection` result determines whether auth preloaded at startup
- `startBackgroundSectionPreloads` called even if `preloadDefaultAuthSection` was called (both can run)
- startup preload failures are caught — app mount not blocked
- if user lands on `/log-in` unauthenticated — auth section preloaded and login plan preloaded

---

## 118. `translationLoader.js` — `loadTranslationsForSection` detail

- fetch URL built from section name and locale — no path traversal possible
- unknown section name not in allowlist → rejected early without fetch
- successful fetch stores result keyed by `${section}::${locale}`
- cache miss on locale `'en'` but hit on `'de'` — `'en'` fetched separately
- response not OK (e.g. 404) → treated as failure, not cached
- JSON parse error from fetch → rejection propagated
- concurrent calls for same section+locale share same in-flight fetch promise

---

## 119. `translationLoader.js` — `preloadTranslationsForSections` batch

- `preloadTranslationsForSections(['auth', 'shop'], 'en')` fetches both
- one section fails; other succeeds — result reflects partial success
- empty section list resolves immediately
- duplicate sections in list — only one fetch per section+locale
- already-loaded sections skipped (no redundant fetch)

---

## 120. `localeManager.js` — `setActiveLocale` — section refresh flow

- locale `'en'` → `'de'` change triggers `refreshSectionPreloadsOnLocaleChange` with current sections
- `getRoutePreloadPlan` called with current route config after locale change
- `skipSection` in refresh = current section being served (avoids reload while viewing)
- no planned sections → `refreshSectionPreloadsOnLocaleChange` not called
- locale unchanged (same value) → document whether refresh triggered anyway
- refresh error caught — locale change still completes

---

## 121. `localeManager.js` — `resolveSectionFromRoutePath` (internal behaviour)

- path `/dashboard` resolves section for current user role
- path not found in routes → null section
- result used for translation pre-warming step
- empty path → null without throw

---

## 122. `assetPreloader.js` — `preloadSectionAssets` integration

- calls `loadAssetsForSection` or equivalent section asset loader
- failure does not corrupt store state
- second call for same section returns cached result
- section name `null` → no-op
- assets loaded added to `usePreloadStore.preloadedAssets`

---

## 123. `assetPreloader.js` — `preloadSectionCriticalImages` integration

- loads only images marked as critical in section asset map
- non-critical images not fetched
- section with no critical images → resolves without error
- image fetch failure logged but not thrown

---

## 124. `getAssetPreloadEntriesForSection.js` — full coverage

- `routeBelongsToSection` with `section: 'auth'` string and `section` param `'auth'` → true
- `routeBelongsToSection` with role object `{ creator: 'dashboard-creator' }` and role `creator` → true for `'dashboard-creator'`
- `routeBelongsToSection` role object but role resolves to different section → false
- `routeBelongsToSection` for disabled route → false
- `isRouteEnabledForAssetPreload` false for route with `assetPreloadEnabled: false`
- `dedupeAssetPreloadEntries` by URL removes second occurrence
- `dedupeAssetPreloadEntries` preserves first occurrence metadata
- `clearAssetPreloadSectionCache` allows re-computation on next call
- inherited `assetPreload` from parent included in entries (resolveEffectiveAssetPreloadForRoute)
- route with empty `assetPreload` returns no entries
- section with multiple routes aggregates all entries

---

## 125. `sectionAssetMapSource.js` — section asset map loading

- `parseSectionNameFromAssetMapPath` extracts section from `assetMap.auth.json`
- `parseSectionNameFromAssetMapPath` returns null for non-section path `assetMap.json`
- `isValidSectionAssetMapName` true for known section names
- `isValidSectionAssetMapName` false for empty string or unknown name
- `getBundledSectionAssetMap` returns bundled config without network
- `getKnownBundledSectionNames` lists all sections with bundled maps
- `getSectionAssetMapFetchCandidates` returns ordered fetch URLs
- `fetchSectionAssetMapFromNetwork` succeeds with mock response
- `fetchSectionAssetMapFromNetwork` handles non-OK response gracefully

---

## 126. Integration — full startup to navigation sequence (step-by-step)

- cold boot unauthenticated `/log-in`: auth section preloaded; plan has no other sections
- cold boot authenticated `/dashboard` as creator: dashboard-creator section preloaded; auth queued
- navigate `/dashboard` → `/shop`: shop section CSS loaded; dashboard CSS unloaded; shop translations loaded
- navigate `/shop` → `/dashboard`: dashboard CSS reloaded; shop CSS unloaded
- rapid back-forward navigation: in-progress lock prevents duplicate bundle downloads
- navigate to route with `inheritConfigFromParent` child: parent preLoads included in plan
- navigate to 404: no section CSS changes; no preload errors
- navigate to route with no section field: CSS unchanged; preload plan empty
- locale change mid-navigation (theoretical): refresh queued after navigation resolves
- user role changes between navigations: new navigation uses updated role for section resolution

---

## 127. Integration — CSS state machine

- initial state: no section links in DOM
- after auth preload: `link[rel=modulepreload]` for auth JS; `link[rel=preload]` for auth CSS hint
- after nav to auth: `link[rel=stylesheet][data-section=auth]` injected; preload hint still present
- after nav to shop: auth stylesheet removed; shop stylesheet injected
- after clearAll: zero section-related links in DOM
- two sections preloaded simultaneously: both modulepreload links coexist
- preload CSS hint + stylesheet for same section: both can coexist (hint removed on unload, stylesheet kept)

---

## 128. Integration — store lifecycle across navigations

- after preload + navigation: `preloadedSections` has section; `sectionsInProgress` empty
- after `resetSectionPreloadState`: section absent from both sets
- after locale change reset: section removed, then re-added after refresh
- after `clearState`: all sets empty; manifest flag false
- `manifestLoadFailed: true` then recovered: flag set then cleared
- five concurrent navigations: store shows correct counts at each stage

---

## 129. Integration — translation × section × locale matrix (`test.each`)

- section `auth`, locale `en` → translations loaded from `public/i18n/section-auth/en.json`
- section `auth`, locale `de` → loaded from `public/i18n/section-auth/de.json`
- section `shop`, locale `fr` → loaded from `public/i18n/section-shop/fr.json`
- unknown section, any locale → not fetched (allowlist check)
- locale `EN` (uppercase) → normalized to `en` before lookup if applicable
- section already loaded for `en`; locale changed to `de` → `de` fetched, `en` retained
- section loaded for `en`; same locale again → not re-fetched

---

## 130. Integration — build hash invalidation

- new build deployed; old hash in localStorage → `preloadedSections` cleared on next boot
- same build hash → sections survive reload
- hash invalidation clears only section/asset state, not other store state
- after invalidation, fresh boot preloads sections correctly from new manifest

---

## 131. Edge cases — section names with special characters

- section name with hyphen `dashboard-creator` → works in DOM selectors (escaped)
- section name with underscore `my_section` → works in all consumers
- section name with dot `section.v2` → escaped in querySelector calls
- section name with square bracket `section[a]` → escaped
- section name starting with number `2fa` → valid per identifier rules or documented as invalid
- section name with forward slash → treated as identifier slug or rejected

---

## 132. Edge cases — `document` and `window` availability

- `window.performanceTracker` defined but `.step` throws → caught without propagation
- `window.performanceTracker.step` called with correct `step`/`flag`/`purpose` shape
- `document.querySelector` returns null (link removed mid-operation) → no throw
- `document.querySelectorAll` returns empty NodeList → `forEach` no-ops
- DOM mutation outside test between link create and onerror — handled by null parentNode check

---

## 133. Edge cases — environment flags

- `import.meta.env.PROD` true → production manifest path used
- `import.meta.env.DEV` true → dev manifest stub used
- neither PROD nor DEV (test env) → document behaviour (returns `{}` or throws)
- `VITE_SECTION_PRELOAD_TIMEOUT_MS` set to `Infinity` → treated as invalid, falls to default
- `VITE_SECTION_PRELOAD_TIMEOUT_MS` set to `"10000"` → valid, 10 second timeout

---

## 134. Edge cases — Pinia not initialised

- `usePreloadStore()` called before `setActivePinia` in test → throws clearly
- `usePreloadStore()` called inside `sectionPreloader` before Pinia init → test setup requirement documented

---

## 135. Edge cases — concurrent manifest fetches (production)

- three simultaneous `loadSectionManifest` calls → only one `fetch` issued
- `manifestPromise` cleared in `finally` block → fourth call after resolution triggers new fetch if cache cleared
- session storage written after first production fetch → second cold boot reads from storage

---

## 136. Edge cases — route config with no sections at all

- `getRoutePreloadPlan` on route with `preLoadSections: undefined` → `{ identifiers: [], resolved: [] }`
- `resolveCurrentRouteSectionName` on route with `section: undefined` → null
- `startBackgroundSectionPreloads` with empty sections → no preload store calls
- `startCurrentSectionResourceLoads` when both `to.meta.section` and `from.meta.section` undefined → no CSS changes

---

## 137. Error boundary — what never throws

- `getPreloadSectionsForRoute(null, null)` does not throw
- `resolveRoleSectionVariant(undefined, undefined)` does not throw
- `isSectionPreloaded(undefined)` does not throw
- `clearPreloadState()` on already-empty state does not throw
- `clearAllSectionCss()` on empty DOM does not throw
- `unloadSectionCss('unknown-section')` does not throw
- `getPreloadStatistics()` on empty store does not throw
- `getRoutePreloadPlan(null, 'creator')` does not throw
- `startBackgroundSectionPreloads({ sections: null, logContext: {} })` does not throw (or is guarded)
- `refreshSectionPreloadsOnLocaleChange({ sections: [], locale: 'en', logContext: {} })` does not throw

---

## 138. Logging — field shape assertions

- every `log(...)` call for section error includes `sectionName` in payload
- `logError(...)` calls include `sectionName` in extra context argument
- preloader logs use `'sectionPreloader.js'` as file argument (not dynamic path)
- CSS loader logs use `'sectionCssLoader.js'` as file argument
- orchestrator logs use correct file name per method

---

## 139. Router guard interplay — section + auth + dependency guards

- route blocked by auth guard does not trigger `startCurrentSectionResourceLoads`
- route blocked by auth guard does not trigger `startBackgroundSectionPreloads`
- dependency guard redirect route still resolves target section on final successful navigation
- role guard deny path does not preload denied route sections
- guard redirect loop prevention does not leave stale `to.meta.section` from aborted route
- guard redirect to login triggers auth section preload only once
- navigation cancelled in `beforeEach` leaves previous section CSS untouched
- guard throws error path triggers error route without section preload crash

---

## 140. Locale path/alias interplay — section resolution stability

- locale-prefixed alias path resolves same section as canonical slug
- alias path without locale resolves identical section plan as canonical slug
- `resolveSectionIdentifier` with locale-prefixed slug strips locale before route resolution (if implemented)
- `routeConfigMatchesPath` alias match still maps to expected section in route meta
- `redirectFrom` alias route preserves target section after redirect
- multiple aliases to same route produce identical `resolvedSections` from `getRoutePreloadPlan`
- locale switch + alias route keeps section stable (no accidental fallback to `guest`)
- catch-all localized 404 route does not inherit unrelated section from previous route

---

## 141. SSR / non-browser runtime safety

- importing `sectionResolver.js` in node test env without `window` does not throw
- importing `sectionPreloadOrchestrator.js` in node test env without `document` does not throw
- calling `preloadSection` in pure node env fails gracefully with documented return value
- calling `loadSectionCss` in pure node env returns false or throws predictable error type
- `manifestLoader` DEV stub path in node env without `fetch` is handled in tests via polyfill or guard
- `window.performanceTracker` access is always optional chaining-safe in all section modules
- no module executes DOM mutation at import-time (only at function runtime)

---

## 142. Race-condition and flaky-test hardening ideas

- JS preload timeout fires just before `onload` — final state deterministic and documented
- CSS preload `onerror` then retry success updates maps correctly (no stale promise)
- two concurrent `resetSectionPreloadState` calls for same section remain idempotent
- `clearPreloadState` during in-flight `preloadMultipleSections` leaves final store consistent
- route changes A→B→A within 50ms do not leak duplicate preload links
- `startBackgroundSectionPreloads` called twice with overlapping sections shares in-progress work
- locale refresh and route afterEach preload running concurrently settle to same final preload set
- simultaneous section asset prefetch and section bundle preload do not deadlock on store updates

---

## 143. Mutation-testing targets (kill-switch assertions)

- mutate dedup in `getPreloadSectionsForRoute` (remove `Set`) — tests should fail on duplicates
- mutate fallback order `default` vs `guest` — tests should detect changed precedence
- mutate `preloadSection` cache-hit return from `true` to `false` — tests should fail
- mutate `addSection` call before `Promise.all` completion — tests should catch premature mark
- mutate `isTrustedBundlePath` bypass — security tests should fail
- mutate `unloadSectionCss` to not delete `loadedSectionCss` — tests should fail
- mutate `resolveEffectiveRouteConfig` to skip inheritance — inherited plan tests should fail
- mutate `shouldPreloadDefaultAuthSection` logic (`&&`/`||` swap) — truth-table tests should fail
- mutate `getRoutePreloadPlan` to skip `resolveSectionIdentifier` — slug identifier tests should fail
- mutate `clearManifestCache` to only clear manifest not promise — concurrency tests should fail

---

## 144. Contract tests — public API expectations over refactors

- `sectionResolver` export list stays stable unless intentional breaking change documented
- `sectionPreloader` return types remain `Promise<boolean>` / objects as documented
- `sectionCssLoader` public methods maintain return types (`boolean`/`Promise<boolean>`)
- `sectionPreloadOrchestrator` option object keys remain backward compatible
- barrel exports remain intentionally partial (no accidental new exports from internals)
- deprecating any method requires redirect note in `docs/SECTION_PLAN.md`
- renaming a method requires alias period or codemod note in test plan metadata
- all cross-module imports continue using `@/systems/sections/*` post-refactor

---

## 145. Observability and telemetry assertions (advanced)

- each successful `preloadSection` emits start + complete tracker steps with matching section
- each failed `preloadSection` emits error tracker step once (not duplicated)
- `loadSectionCss` cache-hit path does not emit duplicate complete telemetry
- batch preload telemetry includes accurate success ratio in purpose string
- manifest loader telemetry differentiates cache-hit vs network fetch paths
- locale refresh telemetry includes section list and locale code in payload
- `routeNavigationData` telemetry logs resolved section not raw role object
- telemetry payloads avoid leaking large manifest objects (size guard)

---

## 146. Data-driven fixture matrix expansion (`test.each`) 

- `section` fixture matrix: simple string, role-object full, role-object missing default, invalid types
- `preLoadSections` fixture matrix: flat array, role object, empty, malformed object
- user role matrix: `creator`, `fan`, `guest`, `admin`, unknown role, empty role
- route inheritance matrix: no inherit, parent inherit, chain inherit depth 3+
- manifest entry matrix: string, object js+css, css-only, path alias, invalid types
- locale matrix: `en`, `de`, `fr`, unsupported locale, uppercase locale
- navigation matrix: initial load, guarded redirect, back/forward, rapid double navigation
- environment matrix: DEV, PROD, test-like neither DEV/PROD

---

## 147. Build-tool pipeline integration ideas

- section bundler output contains all sections discovered from config
- manual chunks naming remains deterministic across builds for same config
- section CSS plugin writes manifest entries matching runtime loader expectations
- section scanner ignores disabled routes when configured to do so
- scanner includes inherited parent section components when child inherits config
- tailwind section content paths include both route components and shared dependencies
- CSS compile report includes section counts matching discovered sections
- manifest integrity node test fails when JS/CSS path missing for required section

---

## 148. Negative-path integration smoke ideas

- corrupted `section-manifest.json` at runtime → app still navigable with lazy component loads
- section CSS file 404 during navigation → page renders with fallback/base styles only
- translation file 404 for section locale → route still loads, translation warning logged
- asset map fetch timeout for section assets → route still navigates without blocking
- parent route removed from config while child still inherits → child route remains functional with fallback behavior
- invalid role returned from auth store mid-session → section resolver falls back predictably
- stale persisted preload state references removed section → invalid entries ignored/cleaned
- malformed `preLoadSections` entry in one route does not break preload for unrelated routes

---

## Test count summary

| Area | Planned cases (approx.) |
|------|-------------------------|
| Production integrity (§0) | 28 |
| sectionResolver (§1–7, §83–85) | 130 |
| sectionPreloader (§8–14, §61–62, §86–89) | 105 |
| sectionCssLoader (§15–21, §63, §80, §90–95) | 90 |
| sectionPreloadOrchestrator (§22–29, §64, §78–79, §96–101) | 105 |
| Barrel + store (§30–31, §67, §102–104) | 60 |
| manifestLoader (§32–33, §75, §105–106) | 50 |
| bundlePathValidation (§34, §107–108) | 28 |
| routeNavigationData (§35–36, §65, §109–111) | 48 |
| routeResolver inheritance (§37–39, §73, §112–113) | 42 |
| router hooks + main (§40–44, §66, §77, §114–117) | 55 |
| cross routing — transition, prefetch, asset (§45–47, §70) | 18 |
| i18n + locale (§48–49, §68–69, §71, §118–121) | 48 |
| assets + rollup (§50–51, §122–125) | 32 |
| integration flows (§52–54, §74, §76, §126–130) | 75 |
| edge cases — special chars, env, DOM, Pinia (§131–137) | 50 |
| logging + telemetry (§55–56, §81–82, §138, §145) | 28 |
| build tooling (§72) | 8 |
| guard/alias/SSR/race/contracts (§139–148) | 88 |
| **Total** | **~1 188** |

*Use `test.each` on §98, §107, §108, §129, §146 to add parametrized rows efficiently. Target 1 400+ at implementation time.*

---

## Links

- Master plan: [docs/SECTION_PLAN.md](./docs/SECTION_PLAN.md)
- Code index: [section-code-index.md](./section-code-index.md)
- Route tests (non-section): [route-test-plan.md](../Route/route-test-plan.md)

---

*End of section test plan.*
