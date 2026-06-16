# Route naming audit — Batch 1

**Scope:** `src/systems/routing/`, `src/router/`  
**Reference:** Expanded Vue App Naming Convention.txt  
**Batch 2:** i18n, sections, assets, build, app, components, tests

Only items needing a change are listed.

---

type: filename
filename: routeAliases.js
Status: suggested
suggested: routeAliasResolver.js

type: filename
filename: routeComponentPathValidator.node.js
Status: suggested
suggested: routeComponentPathDiskValidator.node.js

type: filename
filename: routeComponentPrefetch.js
Status: suggested
suggested: routeComponentPreloader.js

type: filename
filename: routeAssetPrefetch.js
Status: suggested
suggested: routeAssetPreloader.js

type: filename
filename: resolveRouteAssetPreloads.js
Status: suggested
suggested: routeAssetPreloadResolver.js

type: filename
filename: navigationProgress.js
Status: suggested
suggested: navigationProgressTracker.js

type: filename
filename: routeNavigationData.js
Status: suggested
suggested: routeNavigationResourceLoader.js

type: method
filename: routeResolver.js
method: matchWildcardRoute
Status: suggested
suggested: isPathMatchingWildcardRoute

type: method
filename: routeGuards.js
method: guardCheckRouteEnabled
Status: suggested
suggested: remove — use guardCheckRouteEnvironmentAccess

type: method
filename: routeGuards.js
method: guardCheckUserRole
Status: suggested
suggested: guardCheckRouteUserRole

type: method
filename: routeNavigation.js
method: snapshotRouteConfig
Status: suggested
suggested: createRouteConfigSnapshot

type: method
filename: routeAliases.js
method: routeConfigMatchesPath
Status: suggested
suggested: doesRouteConfigMatchPath

type: method
filename: routeAliases.js
method: register
Status: suggested
suggested: registerPathClaim

type: method
filename: routeComponentPrefetch.js
method: createRoutePrefetchIntentHandler
Status: suggested
suggested: remove duplicate — keep export in useRoutePrefetch.js only

type: method
filename: useRoutePrefetch.js
method: prefetchRoute
Status: suggested
suggested: prefetchRouteComponent

type: method
filename: useRoutePrefetch.js
method: prefetchOnIntent
Status: suggested
suggested: prefetchRouteOnIntent

type: method
filename: routeNavigationData.js
method: startCurrentSectionResourceLoads
Status: suggested
suggested: loadCurrentSectionResources

type: method
filename: router/index.js
method: generateRoutesFromConfig
Status: suggested
suggested: buildVueRouterRecordsFromConfiguration

type: method
filename: router/index.js
method: loadViaGlob
Status: suggested
suggested: loadRouteComponentViaGlob

type: method
filename: router/index.js
method: beforeEach
Status: suggested
suggested: extract to registerRouteBeforeEachGuard in systems/routing/

type: method
filename: router/index.js
method: beforeResolve
Status: suggested
suggested: extract to registerRouteBeforeResolveHook in systems/routing/

type: method
filename: router/index.js
method: afterEach
Status: suggested
suggested: extract to registerRouteAfterEachHook in systems/routing/

type: method
filename: router/index.js
method: onError
Status: suggested
suggested: extract to registerRouteNavigationErrorHandler in systems/routing/

type: name
filename: routeResolver.js
name: mergedConfig
Status: suggested
suggested: mergedRouteConfiguration

type: name
filename: routeResolver.js
name: route
Status: suggested
suggested: routeEntry

type: name
filename: routeResolver.js
name: i
Status: suggested
suggested: segmentIndex / parentDepthIndex / chainDepthIndex

type: name
filename: routeResolver.js
name: r
Status: suggested
suggested: routeEntry

type: name
filename: routeGuards.js
name: context
Status: suggested
suggested: guardContext

type: name
filename: routeGuards.js
name: loopGuard
Status: suggested
suggested: loopGuardResult

type: name
filename: routeGuards.js
name: envGuard
Status: suggested
suggested: environmentGuardResult

type: name
filename: routeGuards.js
name: authGuard
Status: suggested
suggested: authenticationGuardResult

type: name
filename: routeGuards.js
name: allow
Status: suggested
suggested: isNavigationAllowed

type: name
filename: routeGuards.js
name: redirectTo
Status: suggested
suggested: redirectTargetPath

type: name
filename: routeGuards.js
name: reason
Status: suggested
suggested: blockReason

type: name
filename: routeGuards.js
name: keyA
Status: suggested
suggested: dependencyKeyA

type: name
filename: routeGuards.js
name: keyB
Status: suggested
suggested: dependencyKeyB

type: name
filename: routeGuards.js
name: rankA
Status: suggested
suggested: dependencyRankA

type: name
filename: routeGuards.js
name: rankB
Status: suggested
suggested: dependencyRankB

type: name
filename: routeGuards.js
name: orderA
Status: suggested
suggested: sortOrderA

type: name
filename: routeGuards.js
name: orderB
Status: suggested
suggested: sortOrderB

type: name
filename: routeGuards.js
name: depKey
Status: suggested
suggested: dependencyKey

type: name
filename: routeGuards.js
name: depIndex
Status: suggested
suggested: dependencyIndex

type: name
filename: routeGuards.js
name: prereqKey
Status: suggested
suggested: prerequisiteKey

type: name
filename: routeGuards.js
name: nav
Status: suggested
suggested: navigationEntry

type: name
filename: routeGuards.js
name: i
Status: suggested
suggested: prerequisiteIndex

type: name
filename: routeNavigation.js
name: entry
Status: suggested
suggested: historyEntry

type: name
filename: routeAliases.js
name: first
Status: suggested
suggested: firstClaim

type: name
filename: routeAliases.js
name: second
Status: suggested
suggested: secondClaim

type: name
filename: routeAliases.js
name: existing
Status: suggested
suggested: existingPathOwner

type: name
filename: routeConfigLoader.js
name: result
Status: suggested
suggested: jsonLoadResult

type: name
filename: routeConfigLoader.js
name: details
Status: suggested
suggested: validationErrorDetails

type: name
filename: routeDefaults.js
name: defaults
Status: suggested
suggested: routeDefaultsFromFile

type: name
filename: routeEnvAccess.js
name: route
Status: suggested
suggested: routeConfiguration

type: name
filename: routeAdminAccess.js
name: context
Status: suggested
suggested: accessContext

type: name
filename: routeAdminAccess.js
name: profile
Status: suggested
suggested: userProfile

type: name
filename: routeAdminAccess.js
name: role
Status: suggested
suggested: userRole

type: name
filename: routeComponentPathValidator.js
name: paths
Status: suggested
suggested: componentPaths

type: name
filename: routeComponentPathValidator.js
name: collected
Status: suggested
suggested: collectedPaths

type: name
filename: routeComponentPrefetch.js
name: slugIndex
Status: suggested
suggested: routeBySlugIndex

type: name
filename: routeComponentPrefetch.js
name: resolved
Status: suggested
suggested: prefetchResolution

type: name
filename: routeAssetPrefetch.js
name: resolved
Status: suggested
suggested: prefetchRouteResolution

type: name
filename: routeAssetPrefetch.js
name: inFlight
Status: suggested
suggested: prefetchPromiseInFlight

type: name
filename: routeAssetPrefetch.js
name: promise
Status: suggested
suggested: assetPrefetchPromise

type: name
filename: resolveRouteAssetPreloads.js
name: ref
Status: suggested
suggested: assetPreloadReference

type: name
filename: resolveRouteAssetPreloads.js
name: refKeys
Status: suggested
suggested: assetPreloadReferenceKeys

type: name
filename: resolveRouteAssetPreloads.js
name: fromRefs
Status: suggested
suggested: preloadsFromReferences

type: name
filename: resolveRouteAssetPreloads.js
name: inline
Status: suggested
suggested: inlineAssetPreloads

type: name
filename: resolveRouteAssetPreloads.js
name: rest
Status: suggested
suggested: routeWithoutPreloadReference

type: name
filename: resolveRouteAssetPreloads.js
name: key
Status: suggested
suggested: referenceKey

type: name
filename: resolveRouteAssetPreloads.js
name: entries
Status: suggested
suggested: catalogEntries

type: name
filename: routeErrorBoundary.js
name: err
Status: suggested
suggested: renderError

type: name
filename: routeErrorBoundary.js
name: info
Status: suggested
suggested: errorContext

type: name
filename: navigationErrorHandler.js
name: target
Status: suggested
suggested: navigationErrorSlug

type: name
filename: navigationErrorHandler.js
name: current
Status: suggested
suggested: currentRoute

type: name
filename: navigationErrorHandler.js
name: slug
Status: suggested
suggested: currentRouteSlug

type: name
filename: scrollBehavior.js
name: _from
Status: suggested
suggested: unusedFromRoute

type: name
filename: routeNavigationData.js
name: resolved
Status: suggested
suggested: resolvedSectionName

type: name
filename: routeNavigationData.js
name: err
Status: suggested
suggested: loadError

type: name
filename: router/index.js
name: routeConfig
Status: suggested
suggested: routeConfigurationEntries

type: name
filename: router/index.js
name: routes
Status: suggested
suggested: vueRouterRecords

type: name
filename: router/index.js
name: guardResult
Status: suggested
suggested: routeGuardResult

type: name
filename: router/index.js
name: e
Status: suggested
suggested: sectionResolveError
