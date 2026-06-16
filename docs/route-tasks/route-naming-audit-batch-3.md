# Route naming audit — Batch 3

**Scope:** `app/`, route-aware components, `composables/`, build scripts  
**Reference:** Expanded Vue App Naming Convention.txt  
**Batch 4:** Vue Router consumer templates (optional), unit tests (optional)

Only items needing a change are listed.

---

type: filename
filename: DevNavBar.vue
Status: suggested
suggested: DevNavigationBar.vue

type: method
filename: main.js
method: startStartupPreloadForCurrentRoute
Status: suggested
suggested: startStartupSectionPreloadForCurrentRoute

type: method
filename: RouteErrorBoundary.vue
method: goHome
Status: suggested
suggested: goToDashboard

type: method
filename: buildConfig.js
method: validateRouteConfiguration
Status: suggested
suggested: validateSingleRouteConfiguration

type: name
filename: main.js
method: startStartupPreloadForCurrentRoute
name: rawPath
Status: suggested
suggested: routerPathname

type: name
filename: main.js
method: startStartupPreloadForCurrentRoute
name: resolved
Status: suggested
suggested: resolvedSectionNames

type: name
filename: main.js
method: startStartupPreloadForCurrentRoute
name: err
Status: suggested
suggested: preloadError

type: name
filename: AppFooter.vue
name: routeItem
Status: suggested
suggested: routeConfigurationEntry

type: name
filename: AppFooter.vue
name: result
Status: suggested
suggested: jsonLoadResult

type: name
filename: AppFooter.vue
method: getRouteDisplayName
name: c
Status: suggested
suggested: firstCharacter

type: name
filename: AppFooter.vue
name: routeConfig
Status: suggested
suggested: footerRouteConfiguration

type: name
filename: RouteErrorBoundary.vue
method: onErrorCaptured
name: err
Status: suggested
suggested: capturedRenderError

type: name
filename: RouteErrorBoundary.vue
method: onErrorCaptured
name: info
Status: suggested
suggested: vueErrorInfo

type: name
filename: RouteErrorBoundary.vue
name: routeError
Status: suggested
suggested: capturedRouteError

type: name
filename: App.vue
method: onLocaleChanged
name: payload
Status: suggested
suggested: localeChangeEvent

type: name
filename: App.vue
method: onLocaleChangeError
name: payload
Status: suggested
suggested: localeErrorEvent

type: name
filename: useDisplayedLocaleSync.js
method: onLocaleChanged
name: raw
Status: suggested
suggested: rawLocaleFromEvent

type: name
filename: useDisplayedLocaleSync.js
method: onLocaleChanged
name: locale
Status: suggested
suggested: normalizedLocaleCode

type: name
filename: buildConfig.js
method: extractAllSectionsFromRouteConfig
name: route
Status: suggested
suggested: routeEntry

type: name
filename: buildConfig.js
method: shouldSectionBePreloaded
name: route
Status: suggested
suggested: routeEntry

type: name
filename: buildConfig.js
method: validateRouteConfiguration
name: route
Status: suggested
suggested: routeConfiguration

type: name
filename: sectionBundler.js
name: routeConfigData
Status: suggested
suggested: loadedRouteConfiguration

type: name
filename: sectionBundler.js
method: discoverAllSectionsFromConfig
name: route
Status: suggested
suggested: routeEntry

type: name
filename: sectionBundler.js
method: getSectionDependencies
name: route
Status: suggested
suggested: routeEntry

type: name
filename: manifestGenerator.js
method: enrichManifestWithMetadata
name: routeConfigData
Status: suggested
suggested: loadedRouteConfiguration

type: name
filename: manifestGenerator.js
method: enrichManifestWithMetadata
name: route
Status: suggested
suggested: routeEntry

type: name
filename: sectionCssPlugin.js
method: buildStart
name: result
Status: suggested
suggested: sectionCssBuildResult

type: name
filename: sectionCssPlugin.js
method: buildStart
name: file
Status: suggested
suggested: generatedCssFile

type: name
filename: sectionScanner.js
method: scanRouteConfigForSections
name: routeConfigPath
Status: suggested
suggested: routeConfigurationFilePath
