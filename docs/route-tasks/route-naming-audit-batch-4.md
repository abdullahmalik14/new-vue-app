# Route naming audit — Batch 4

**Scope:** Vue Router consumer templates and components (no tests)  
**Reference:** Expanded Vue App Naming Convention.txt  
**Complete:** Batches 1–4 cover all routed application code

Only items needing a change are listed.

---

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
