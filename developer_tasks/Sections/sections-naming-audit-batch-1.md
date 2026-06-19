# Sections naming audit — Batch 1

**Date:** 2026-06-10  
**Scope:** `src/systems/sections/` only  
**Reference:** [Expanded Vue App Naming Convention.txt](../../Expanded%20Vue%20App%20Naming%20Convention.txt)  
**Batch 2:** deeply interconnected section code outside this folder  
**Rule:** Only items needing a rename are listed.

---

type: filename
name: sectionManifestHelpers.js
Status: suggested
suggested: create file — runtime manifest helpers currently missing (Expanded §24 lists under sections)

type: method
name: sectionResolver.js :: resolveRolePreLoadSections
Status: suggested
suggested: resolveRolePreloadSections

type: method
name: sectionPreloader.js :: clearPreloadState
Status: suggested
suggested: clearSectionPreloadState

type: method
name: sectionPreloader.js :: _doPreload
Status: suggested
suggested: performSectionPreload

type: method
name: sectionPreloadOrchestrator.js :: resolveEffectiveRouteConfig
Status: suggested
suggested: move to systems/routing/ (name approved per Expanded §24; wrong module)

type: method
name: sectionPreloadOrchestrator.js :: getRoutePreloadPlan
Status: suggested
suggested: getSectionPreloadPlan

type: method
name: sectionPreloadOrchestrator.js :: resolveCurrentRouteSectionName
Status: suggested
suggested: resolveCurrentSectionNameFromRouteConfig

type: method
name: sectionCssLoader.js :: getSectionCssBundle
Status: suggested
suggested: resolveSectionCssBundlePaths

type: method
name: sectionCssLoader.js :: injectCssLink
Status: suggested
suggested: injectSectionCssLinkElement

type: variable
name: sectionResolver.js :: maybeSlugs
Status: suggested
suggested: candidateSlugPaths

type: variable
name: sectionResolver.js :: route
Status: suggested
suggested: routeEntry

type: variable
name: sectionResolver.js :: trimmed
Status: suggested
suggested: trimmedIdentifier

type: variable
name: sectionPreloader.js :: r
Status: suggested
suggested: preloadResult

type: variable
name: sectionPreloader.js :: err
Status: suggested
suggested: preloadError

type: variable
name: sectionPreloadOrchestrator.js :: resolved
Status: suggested
suggested: resolvedSectionNames

type: variable
name: sectionPreloadOrchestrator.js :: identifiers
Status: suggested
suggested: preloadSectionIdentifiers

type: variable
name: sectionPreloadOrchestrator.js :: params
Status: suggested
suggested: authPreloadCheckParams

type: variable
name: sectionPreloadOrchestrator.js :: err
Status: suggested
suggested: preloadError

type: variable
name: sectionPreloadOrchestrator.js :: entry
Status: suggested
suggested: sectionStatusEntry

type: variable
name: sectionPreloadOrchestrator.js :: promises
Status: suggested
suggested: preloadPromises

type: variable
name: sectionPreloadOrchestrator.js :: file
Status: suggested
suggested: logSourceFile

type: variable
name: sectionPreloadOrchestrator.js :: method
Status: suggested
suggested: logSourceMethod

type: variable
name: sectionCssLoader.js :: rawPath
Status: suggested
suggested: rawCssBundlePath

type: variable
name: sectionCssLoader.js :: hintLink
Status: suggested
suggested: cssPreloadHintLink
