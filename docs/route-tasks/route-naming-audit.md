# Route naming audit — merged

**Date:** 2026-06-10
**Reference:** Expanded Vue App Naming Convention.txt
**Sources:** batch-1 (routing core), batch-2 (cross-system), batch-3 (app/build), batch-4 (templates/components)
**Index:** [route-code-index.md](./route-code-index.md)

Only items needing a change are listed.

| type | Count |
|------|------:|
| filename | 18 |
| method | 31 |
| name | 145 |
| **Total** | **194** |

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
suggested: remove â€” use guardCheckRouteEnvironmentAccess

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
suggested: remove duplicate â€” keep export in useRoutePrefetch.js only

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

type: filename
filename: AuthLogIn.vue
Status: suggested
suggested: LogInPage.vue

type: filename
filename: AuthSignUp.vue
Status: suggested
suggested: SignUpPage.vue

type: filename
filename: AuthLostPassword.vue
Status: suggested
suggested: LostPasswordPage.vue

type: filename
filename: AuthResetPassword.vue
Status: suggested
suggested: ResetPasswordPage.vue

type: filename
filename: AuthConfirmEmail.vue
Status: suggested
suggested: ConfirmEmailPage.vue

type: filename
filename: AuthSignUpOnboarding.vue
Status: suggested
suggested: SignUpOnboardingPage.vue

type: filename
filename: AuthSignUpOnboardingKyc.vue
Status: suggested
suggested: SignUpOnboardingKycPage.vue

type: filename
filename: NavDropdown.vue
Status: suggested
suggested: NavigationDropdown.vue

type: method
filename: ShopPage.vue
method: preloadDashboard
Status: suggested
suggested: navigateToDashboard

type: method
filename: ProfileLoginPopup.vue
method: popupNavigate
Status: suggested
suggested: handlePopupRouteNavigation

type: method
filename: ProfileLoginPopup.vue
method: goBack
Status: suggested
suggested: handlePopupBackNavigation

type: method
filename: DashboardSharedSidebar.vue
method: isActive
Status: suggested
suggested: isSidebarMenuItemRouteActive

type: method
filename: DashboardSharedSidebar.vue
method: goBackSubmenu
Status: suggested
suggested: navigateBackInSubmenu

type: method
filename: NavDropdown.vue
method: handleMenuClick
Status: suggested
suggested: handleNavigationMenuClick

type: method
filename: NavDropdown.vue
method: handleSubmenuClick
Status: suggested
suggested: handleNavigationSubmenuClick

type: name
filename: ProfileLoginPopup.vue
name: popupNavHandler
Status: suggested
suggested: popupRouteNavigationHandler

type: name
filename: ProfileLoginPopup.vue
name: popupGoBack
Status: suggested
suggested: popupBackNavigationHandler

type: name
filename: ProfileLoginPopup.vue
name: step
Status: suggested
suggested: authPopupStep

type: name
filename: ProfileLoginPopup.vue
method: popupNavigate
name: url
Status: suggested
suggested: navigationTargetPath

type: name
filename: ProfileLoginPopup.vue
method: popupNavigate
name: urlObj
Status: suggested
suggested: navigationTargetUrl

type: name
filename: ProfileLoginPopup.vue
name: val
Status: suggested
suggested: isPopupOpen

type: name
filename: AppFooter.vue
name: route
Status: suggested
suggested: navigableRoute

type: name
filename: AuthLogIn.vue
name: popupNavHandler
Status: suggested
suggested: popupRouteNavigationHandler

type: name
filename: AuthSignUp.vue
name: popupNavHandler
Status: suggested
suggested: popupRouteNavigationHandler

type: name
filename: AuthConfirmEmail.vue
name: loginQuery
Status: suggested
suggested: postConfirmLoginQuery

type: name
filename: AuthConfirmEmail.vue
name: popupNavHandler
Status: suggested
suggested: popupRouteNavigationHandler

type: name
filename: TwitterAuthPage.vue
name: errorParam
Status: suggested
suggested: oauthErrorQueryParam

type: name
filename: LanguageSwitcher.vue
name: metaPre
Status: suggested
suggested: routeMetaPreloadSections

type: name
filename: LanguageSwitcher.vue
name: winPre
Status: suggested
suggested: windowPreloadSections

type: name
filename: LanguageSwitcher.vue
method: onChange
name: ev
Status: suggested
suggested: changeEvent

type: name
filename: SettingsLanguageField.vue
name: metaPre
Status: suggested
suggested: routeMetaPreloadSections

type: name
filename: NavDropdown.vue
method: handleMenuClick
name: e
Status: suggested
suggested: clickEvent

type: name
filename: NavDropdown.vue
method: handleSubmenuClick
name: e
Status: suggested
suggested: clickEvent

type: name
filename: DashboardSharedSidebar.vue
method: calculateOverflow
name: headerH
Status: suggested
suggested: headerHeight

type: name
filename: DashboardSharedSidebar.vue
method: calculateOverflow
name: footerH
Status: suggested
suggested: footerHeight

type: name
filename: DashboardSharedSidebar.vue
method: calculateOverflow
name: logoH
Status: suggested
suggested: logoHeight

type: name
filename: DashboardSharedSidebar.vue
method: calculateOverflow
name: itemH
Status: suggested
suggested: menuItemHeight

type: name
filename: DashboardSharedSidebar.vue
method: calculateOverflow
name: moreBtnH
Status: suggested
suggested: moreButtonHeight

type: name
filename: DashboardSharedSidebar.vue
method: goBackSubmenu
name: prev
Status: suggested
suggested: previousSubmenuState

type: name
filename: DashboardSharedSidebar.vue
method: loadAssetWithRetry
name: e
Status: suggested
suggested: loadError

type: name
filename: DashboardSharedSidebar.vue
method: loadAssetWithRetry
name: r
Status: suggested
suggested: delayResolve

type: name
filename: DashboardSharedSidebar.vue
method: loadTranslations
name: e
Status: suggested
suggested: translationLoadError

type: name
filename: DashboardSharedSidebar.vue
method: resolveMenuItems
name: e
Status: suggested
suggested: menuResolveError
