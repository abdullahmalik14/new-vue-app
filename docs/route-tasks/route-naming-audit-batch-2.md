# Route naming audit — Batch 2

**Scope:** Cross-system route logic (`i18n`, `sections`, `assets`, `build`)  
**Reference:** Expanded Vue App Naming Convention.txt  
**Batch 3:** app, route-aware components, build scripts

Only items needing a change are listed.

---

type: filename
filename: hreflangTags.js
Status: suggested
suggested: routeHreflangTags.js

type: filename
filename: getAssetPreloadEntriesForSection.js
Status: suggested
suggested: routeSectionAssetPreloadEntries.js

type: method
filename: sectionResolver.js
method: resolveRolePreLoadSections
Status: suggested
suggested: resolveRolePreloadSections

type: method
filename: sectionResolver.js
method: routeBelongsToSection
Status: suggested
suggested: doesRouteBelongToSection

type: method
filename: jsonConfigValidator.js
method: resolveRoleSectionVariantStatic
Status: suggested
suggested: resolveRoleSectionVariantForBuildValidation

type: method
filename: hreflangTags.js
method: clearHreflangTags
Status: suggested
suggested: clearRouteHreflangTags

type: method
filename: hreflangTags.js
method: syncHreflangTagsForPath
Status: suggested
suggested: syncRouteHreflangTagsForPath

type: name
filename: sectionPreloadOrchestrator.js
name: resolved
Status: suggested
suggested: resolvedSectionNames

type: name
filename: sectionPreloadOrchestrator.js
name: identifiers
Status: suggested
suggested: preloadSectionIdentifiers

type: name
filename: sectionPreloadOrchestrator.js
name: params
Status: suggested
suggested: authPreloadCheckParams

type: name
filename: sectionPreloadOrchestrator.js
name: err
Status: suggested
suggested: preloadError

type: name
filename: sectionPreloadOrchestrator.js
name: entry
Status: suggested
suggested: sectionStatusEntry

type: name
filename: sectionPreloadOrchestrator.js
name: promises
Status: suggested
suggested: preloadPromises

type: name
filename: sectionResolver.js
name: maybeSlugs
Status: suggested
suggested: candidateSlugPaths

type: name
filename: sectionResolver.js
name: route
Status: suggested
suggested: routeEntry

type: name
filename: getAssetPreloadEntriesForSection.js
name: byKey
Status: suggested
suggested: entriesByDedupeKey

type: name
filename: getAssetPreloadEntriesForSection.js
name: cached
Status: suggested
suggested: cachedSectionRollup

type: name
filename: getAssetPreloadEntriesForSection.js
name: entry
Status: suggested
suggested: sectionAssetRollup

type: name
filename: getAssetPreloadEntriesForSection.js
name: key
Status: suggested
suggested: dedupeKey

type: name
filename: validateRouteAssetPreloadFlags.js
name: ref
Status: suggested
suggested: assetPreloadReference

type: name
filename: validateRouteAssetPreloadFlags.js
name: refKeys
Status: suggested
suggested: assetPreloadReferenceKeys

type: name
filename: validateRouteAssetPreloadFlags.js
name: label
Status: suggested
suggested: validationMessagePrefix

type: name
filename: validateRouteAssetPreloadFlags.js
name: reported
Status: suggested
suggested: reportedFlagKeys

type: name
filename: validateRouteAssetPreloadFlags.js
name: flag
Status: suggested
suggested: assetPreloadFlag

type: name
filename: validateRouteAssetPreloadFlags.js
name: slug
Status: suggested
suggested: routeSlug

type: name
filename: jsonConfigValidator.js
method: buildRouteSlugIndex
name: index
Status: suggested
suggested: routeSlugIndexMap

type: name
filename: jsonConfigValidator.js
name: bareSlug
Status: suggested
suggested: slugWithoutLeadingSlash

type: name
filename: jsonConfigValidator.js
method: validateRouteConfig
name: index
Status: suggested
suggested: routeConfigIndex

type: name
filename: jsonConfigValidator.js
name: route
Status: suggested
suggested: routeEntry

type: name
filename: hreflangTags.js
name: node
Status: suggested
suggested: hreflangLinkNode

type: name
filename: hreflangTags.js
name: link
Status: suggested
suggested: alternateLinkElement

type: name
filename: hreflangTags.js
name: head
Status: suggested
suggested: documentHead

type: name
filename: localeManager.js
name: tempLocale
Status: suggested
suggested: temporaryPageLocale

type: name
filename: localeManager.js
name: localeRouter
Status: suggested
suggested: registeredLocaleRouter

type: name
filename: resolveSharedComponentAssets.js
name: byFlag
Status: suggested
suggested: catalogEntriesByFlag

type: name
filename: resolveSharedComponentAssets.js
name: flags
Status: suggested
suggested: assetFlags

type: name
filename: resolveSharedComponentAssets.js
name: assets
Status: suggested
suggested: resolvedAssetUrlsBySlot

type: name
filename: resolveSharedComponentAssets.js
name: flag
Status: suggested
suggested: assetFlag

type: name
filename: resolveSharedComponentAssets.js
name: groups
Status: suggested
suggested: preloadTierGroups

type: name
filename: resolveSharedComponentAssets.js
name: urlMap
Status: suggested
suggested: assetUrlByFlag
