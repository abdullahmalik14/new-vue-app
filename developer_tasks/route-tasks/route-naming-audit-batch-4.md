# Route naming audit — Batch 4

**Scope:** Vue Router consumer templates and components (no tests)  
**Reference:** Expanded Vue App Naming Convention.txt  
**Complete:** Batches 1–4 cover all routed application code

Only items needing a change are listed. **Phase 4.5 triage** and **Phase 5 page naming** applied 2026-06-16.

Status values: `done` | `deferred` | `dropped`

---

type: filename
filename: AuthLogIn.vue
Status: done
doneIn: Phase 5 (route page layer: LoginPage.vue)
note: views/AuthLogIn.vue screen composition unchanged
suggested: LogInPage.vue

type: filename
filename: AuthSignUp.vue
Status: done
doneIn: Phase 5 (route page layer: SignUpPage.vue)
note: views/AuthSignUp.vue screen composition unchanged
suggested: SignUpPage.vue

type: filename
filename: AuthLostPassword.vue
Status: done
doneIn: Phase 5 (route page layer: LostPasswordPage.vue)
note: views/AuthLostPassword.vue screen composition unchanged
suggested: LostPasswordPage.vue

type: filename
filename: AuthResetPassword.vue
Status: done
doneIn: Phase 5 (route page layer: ResetPasswordPage.vue)
note: views/AuthResetPassword.vue screen composition unchanged
suggested: ResetPasswordPage.vue

type: filename
filename: AuthConfirmEmail.vue
Status: done
doneIn: Phase 5 (route page layer: ConfirmEmailPage.vue)
note: views/AuthConfirmEmail.vue screen composition unchanged
suggested: ConfirmEmailPage.vue

type: filename
filename: AuthSignUpOnboarding.vue
Status: done
doneIn: Phase 5 (route page layer: CreatorSignUpOnboardingPage.vue)
note: views/AuthSignUpOnboarding.vue screen composition unchanged
suggested: SignUpOnboardingPage.vue

type: filename
filename: AuthSignUpOnboardingKyc.vue
Status: done
doneIn: Phase 5 (route page layer: CreatorSignUpOnboardingKycPage.vue)
note: views/AuthSignUpOnboardingKyc.vue screen composition unchanged
suggested: SignUpOnboardingKycPage.vue

type: filename
filename: NavDropdown.vue
Status: done
doneIn: Phase 3d
suggested: NavigationDropdown.vue

type: method
filename: ShopPage.vue
method: preloadDashboard
Status: dropped
reason: method not present in codebase
suggested: navigateToDashboard

type: method
filename: ProfileLoginPopup.vue
method: popupNavigate
Status: deferred
reason: provider file not in workspace checkout
suggested: handlePopupRouteNavigation

type: method
filename: ProfileLoginPopup.vue
method: goBack
Status: deferred
reason: provider file not in workspace checkout
suggested: handlePopupBackNavigation

type: method
filename: DashboardSharedSidebar.vue
method: isActive
Status: done
doneIn: Phase 4.3 (already aligned as isSidebarMenuItemRouteActive / isMenuItemRouteActive)
suggested: isSidebarMenuItemRouteActive

type: method
filename: DashboardSharedSidebar.vue
method: goBackSubmenu
Status: done
doneIn: Phase 4.3 (already navigateBackInSubmenu)
suggested: navigateBackInSubmenu

type: method
filename: NavDropdown.vue
method: handleMenuClick
Status: done
doneIn: Phase 4.5 (NavigationDropdown.vue)
suggested: handleNavigationMenuClick

type: method
filename: NavDropdown.vue
method: handleSubmenuClick
Status: done
doneIn: Phase 4.5 (NavigationDropdown.vue)
suggested: handleNavigationSubmenuClick

type: name
filename: ProfileLoginPopup.vue
name: popupNavHandler
Status: deferred
reason: provider file not in workspace; consumers renamed in Phase 4.4
suggested: popupRouteNavigationHandler

type: name
filename: ProfileLoginPopup.vue
name: popupGoBack
Status: deferred
reason: provider file not in workspace checkout
suggested: popupBackNavigationHandler

type: name
filename: ProfileLoginPopup.vue
name: step
Status: deferred
reason: provider file not in workspace checkout
suggested: authPopupStep

type: name
filename: ProfileLoginPopup.vue
method: popupNavigate
name: url
Status: deferred
reason: provider file not in workspace checkout
suggested: navigationTargetPath

type: name
filename: ProfileLoginPopup.vue
method: popupNavigate
name: urlObj
Status: deferred
reason: provider file not in workspace checkout
suggested: navigationTargetUrl

type: name
filename: ProfileLoginPopup.vue
name: val
Status: deferred
reason: provider file not in workspace checkout
suggested: isPopupOpen

type: name
filename: AppFooter.vue
name: route
Status: done
doneIn: pre-existing (uses navigableRoutes / routeItem)
suggested: navigableRoute

type: name
filename: AuthLogIn.vue
name: popupNavHandler
Status: done
doneIn: Phase 4.4
suggested: popupRouteNavigationHandler

type: name
filename: AuthSignUp.vue
name: popupNavHandler
Status: done
doneIn: Phase 4.4
suggested: popupRouteNavigationHandler

type: name
filename: AuthConfirmEmail.vue
name: loginQuery
Status: done
doneIn: Phase 4.5
suggested: postConfirmLoginQuery

type: name
filename: AuthConfirmEmail.vue
name: popupNavHandler
Status: done
doneIn: Phase 4.4
suggested: popupRouteNavigationHandler

type: name
filename: TwitterAuthPage.vue
name: errorParam
Status: done
doneIn: Phase 4.5
suggested: oauthErrorQueryParam

type: name
filename: LanguageSwitcher.vue
name: metaPre
Status: done
doneIn: Phase 4.5
suggested: routeMetaPreloadSections

type: name
filename: LanguageSwitcher.vue
name: winPre
Status: done
doneIn: Phase 4.5
suggested: windowPreloadSections

type: name
filename: LanguageSwitcher.vue
method: onChange
name: ev
Status: done
doneIn: Phase 4.5
suggested: changeEvent

type: name
filename: SettingsLanguageField.vue
name: metaPre
Status: done
doneIn: Phase 4.5
suggested: routeMetaPreloadSections

type: name
filename: NavDropdown.vue
method: handleMenuClick
name: e
Status: done
doneIn: Phase 4.5 (NavigationDropdown.vue)
suggested: clickEvent

type: name
filename: NavDropdown.vue
method: handleSubmenuClick
name: e
Status: done
doneIn: Phase 4.5 (NavigationDropdown.vue)
suggested: clickEvent

type: name
filename: DashboardSharedSidebar.vue
method: calculateOverflow
name: headerH
Status: done
doneIn: Phase 4.3 (already headerHeight)
suggested: headerHeight

type: name
filename: DashboardSharedSidebar.vue
method: calculateOverflow
name: footerH
Status: done
doneIn: Phase 4.3 (already footerHeight)
suggested: footerHeight

type: name
filename: DashboardSharedSidebar.vue
method: calculateOverflow
name: logoH
Status: done
doneIn: Phase 4.3 (already logoHeight)
suggested: logoHeight

type: name
filename: DashboardSharedSidebar.vue
method: calculateOverflow
name: itemH
Status: deferred
reason: low-value shorthand; menuItemHeight already used in dev sidebar
suggested: menuItemHeight

type: name
filename: DashboardSharedSidebar.vue
method: calculateOverflow
name: moreBtnH
Status: deferred
reason: low-value local shorthand
suggested: moreButtonHeight

type: name
filename: DashboardSharedSidebar.vue
method: goBackSubmenu
name: prev
Status: deferred
reason: low-value catch-block param in Options API sidebar
suggested: previousSubmenuState

type: name
filename: DashboardSharedSidebar.vue
method: loadAssetWithRetry
name: e
Status: deferred
reason: low-value catch-block param
suggested: loadError

type: name
filename: DashboardSharedSidebar.vue
method: loadAssetWithRetry
name: r
Status: deferred
reason: low-value Promise resolve param
suggested: delayResolve

type: name
filename: DashboardSharedSidebar.vue
method: loadTranslations
name: e
Status: deferred
reason: low-value catch-block param
suggested: translationLoadError

type: name
filename: DashboardSharedSidebar.vue
method: resolveMenuItems
name: e
Status: deferred
reason: low-value catch-block param
suggested: menuResolveError
