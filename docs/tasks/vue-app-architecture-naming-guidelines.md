# Vue App Architecture, File Structure, and Naming Guidelines

## Purpose

This document defines the recommended architecture, folder responsibilities, file naming conventions, class naming conventions, method naming conventions, and AI/developer guidance for maintaining this Vue application.

The goal is to keep the app scalable, easy to audit, easy to onboard into, and resistant to the common problem where everything becomes a generic `utils/` folder.

This documentation should be used whenever adding new files, moving existing code, reviewing pull requests, asking AI to generate code, or auditing the Vue app.

---

# 1. Final Target Structure

```text
src/
  app/
    App.vue
    main.js
    appBootstrap.js
    appProviders.js

  router/
    index.js
    routeConfig.json
    routeDefaults.json
    routeConfig.schema.md

  systems/
    routing/
      index.js
      routeGuards.js
      routeResolver.js
      routeAliases.js
      routeNavigation.js
      routeErrorBoundary.js
      navigationErrorHandler.js
      scrollBehavior.js

    sections/
      index.js
      sectionResolver.js
      sectionPreloader.js
      sectionCssLoader.js
      sectionPreloadOrchestrator.js
      sectionManifestHelpers.js

    assets/
      index.js
      assetLibrary.js
      assetPreloader.js
      assetScanner.js
      assetPolicy.js
      assetMapSource.js
      routeAssetPrefetch.js

    i18n/
      index.js
      localeManager.js
      localeStorage.js
      translationLoader.js
      translationUtils.js
      i18nInstance.js

    interactions/
      index.js
      engine.js
      validationRules.js
      interactionConfigParser.js
      directives/
        index.js

    build/
      index.js
      manifestLoader.js
      appBuildHash.js
      envValidator.js
      jsonConfigValidator.js

  services/
    flow-system/
      FlowHandler.js
      flowRegistry.js
      flowDataPipeline.js
      middleware/
      pipeline/
        readPipeline.js
        writePipeline.js
        pipelineContext.js
      runtime/

    cart/
      cartApi.js
      flows/
      mappers/
      validators/
      mockCartBackend.js

    bookings/
      bookingsApi.js
      flows/
      mappers/
      validators/
      utils/

    chat/
      chatApi.js
      flows/
      mappers/
      validators/
      socket/

    orders/
      ordersApi.js
      flows/
      mappers/
      validators/

    rental/
      rentalApi.js
      flows/
      mappers/
      validators/

    events/
      eventsApi.js
      flows/
      mappers/
      validators/

    analytics/
      analyticsApi.js
      flows/
      mappers/
      validators/

  stores/
    useAuthStore.js
    useCartStore.js
    useChatStore.js
    useLocaleStore.js
    usePreloadStore.js

  components/
    ui/
      buttons/
      modals/
      popups/
      spinners/
      tabs/
      dropdowns/

    layout/
      header/
      sidebar/
      footer/
      navigation/

    forms/
      inputs/
      checkboxes/
      selects/
      validation/

    dashboard/
    media/
    icons/
    calendar/
    chat/

  templates/
    auth/
    dashboard/
      creator/
      fan/
      agent/
      vendor/
      shared/

    shop/
    settings/
    profile/
    misc/
    dev/

  infrastructure/
    http/
      httpClient.js
      apiClient.js
      wpApiBaseUrl.js

    backend/
      scyllaDbClient.js

    logging/
      logHandler.js
      performanceTracker.js
      performanceTrackerAccess.js

    errors/
      errorHandler.js
      applicationErrorReporter.js

    cache/
      cacheHandler.js

  composables/
    usePopupStack.js
    useRoutePrefetch.js
    useAssetPrefetch.js
    useBreakpoints.js
    useFormState.js
    useDeviceState.js

  config/
    assetMap.json
    countries.json

  assets/
    main.css
    route-transitions.css
    images/
    icons/
    fonts/
```

---

# 2. Architecture Responsibilities

## 2.1 `src/app/`

The `app/` folder contains the root app entry files and app bootstrapping logic.

Use this folder for:

```text
App.vue
main.js
appBootstrap.js
appProviders.js
```

Responsibilities:

```text
- Vue app creation
- Pinia setup
- Router setup
- Global providers
- Global app bootstrapping
- Initial app-level setup that does not belong to a specific domain
```

Do not use this folder for:

```text
- Business flows
- API calls
- Route guards
- Asset preload logic
- Translation loading logic
- Component-specific state
```

---

## 2.2 `src/router/`

The `router/` folder should stay small. It is for Vue Router entry and route configuration only.

Use this folder for:

```text
index.js
routeConfig.json
routeDefaults.json
routeConfig.schema.md
```

Responsibilities:

```text
- Creating the Vue Router instance
- Importing route configuration
- Connecting router hooks to systems/routing
- Holding route config JSON
- Holding route schema documentation
```

Most actual route logic should live in:

```text
src/systems/routing/
```

Do not allow `router/index.js` to become a large dumping ground for guards, preload logic, locale logic, asset logic, or route utilities.

---

## 2.3 `src/systems/`

The `systems/` folder contains app-level frontend systems. These are not tiny helpers. These are full systems that coordinate app behavior.

Use `systems/` for:

```text
routing
sections
assets
i18n
interactions
build
```

A system is anything that:

```text
- Coordinates behavior across multiple routes/components
- Has lifecycle behavior
- Has config or policy rules
- Is reused globally
- Is bigger than a tiny pure helper function
```

Examples:

```text
systems/routing/routeGuards.js
systems/sections/sectionPreloader.js
systems/assets/assetPreloader.js
systems/i18n/translationLoader.js
systems/interactions/engine.js
systems/build/manifestLoader.js
```

---

## 2.4 `src/services/`

The `services/` folder contains business/data/API orchestration.

Use this folder for:

```text
- Business flows
- API flows
- Request mappers
- Response mappers
- Payload validators
- Domain-specific flow files
- Flow registry
- Read/write pipeline
- Mock adapters for development only
```

Keep the data pipeline here:

```text
src/services/flow-system/
```

This is the correct location because the pipeline is business/data orchestration, not a generic utility.

Service domains should look like this:

```text
services/cart/
  cartApi.js
  flows/
  mappers/
  validators/

services/bookings/
  bookingsApi.js
  flows/
  mappers/
  validators/

services/chat/
  chatApi.js
  flows/
  mappers/
  validators/
  socket/
```

Do not put low-level HTTP helpers here. Low-level HTTP belongs in:

```text
src/infrastructure/http/
```

---

## 2.5 `src/stores/`

The `stores/` folder contains Pinia state only.

Use this folder for:

```text
useAuthStore.js
useCartStore.js
useChatStore.js
useLocaleStore.js
usePreloadStore.js
```

Responsibilities:

```text
- Reactive application state
- State getters
- State mutation actions
- State reset/clear methods
```

Avoid placing these in stores:

```text
- API request details
- Large business workflows
- Route logic
- Asset preload algorithms
- Translation loading algorithms
```

Stores may call services only when it is clearly part of state hydration, but complex business flows should live in services.

---

## 2.6 `src/components/`

The `components/` folder contains reusable UI components.

Use this folder for:

```text
- Buttons
- Inputs
- Modals
- Popups
- Spinners
- Dropdowns
- Shared layout components
- Reusable dashboard widgets
- Media components
- Icon components
```

Components should be reusable and visual. They can emit events and accept props, but should not own large business/data pipelines.

Correct examples:

```text
components/ui/buttons/PrimaryButton.vue
components/ui/modals/BaseModal.vue
components/forms/inputs/TextInput.vue
components/layout/sidebar/DashboardSidebar.vue
components/chat/ChatMessageBubble.vue
```

Avoid:

```text
components/CheckoutBusinessFlow.vue
components/FetchUserApi.vue
components/BookingApiHandler.vue
```

Business logic belongs in services, not components.

---

## 2.7 `src/templates/`

The `templates/` folder contains page-level route layouts and route-level pages.

Use this folder for:

```text
- Login pages
- Dashboard pages
- Shop pages
- Settings pages
- Profile pages
- Role-specific pages
- Shared page layouts
```

Templates compose components and may call services/flows.

Examples:

```text
templates/auth/LoginPage.vue
templates/dashboard/creator/CreatorDashboardPage.vue
templates/dashboard/shared/DashboardLayout.vue
templates/shop/ShopProductPage.vue
```

Rule:

```text
components/ = reusable visual pieces
templates/ = full page / route-level composition
```

---

## 2.8 `src/infrastructure/`

The `infrastructure/` folder contains low-level technical utilities.

Use this folder for:

```text
http
backend
logging
errors
cache
```

Examples:

```text
infrastructure/http/httpClient.js
infrastructure/http/apiClient.js
infrastructure/http/wpApiBaseUrl.js
infrastructure/backend/scyllaDbClient.js
infrastructure/logging/logHandler.js
infrastructure/logging/performanceTracker.js
infrastructure/logging/performanceTrackerAccess.js
infrastructure/errors/errorHandler.js
infrastructure/errors/applicationErrorReporter.js
infrastructure/cache/cacheHandler.js
```

Infrastructure should not understand business domains like cart, booking, chat, or dashboard rules. It should provide technical services used by higher layers.

---

## 2.9 `src/composables/`

The `composables/` folder contains Vue Composition API hooks.

Use this folder for files that start with `use`:

```text
usePopupStack.js
useRoutePrefetch.js
useAssetPrefetch.js
useBreakpoints.js
useFormState.js
useDeviceState.js
```

Composable rules:

```text
- Must use Vue Composition API concepts
- Should return state and methods
- Should be reusable across components/templates
- Should not be used for generic non-Vue helper functions
```

Do not put plain helper functions in `composables/`.

---

## 2.10 `src/config/`

The `config/` folder contains JSON/configuration files.

Examples:

```text
assetMap.json
countries.json
route feature config files
static option maps
```

Use this folder for static configuration, not logic.

---

## 2.11 `src/assets/`

The `assets/` folder contains static files.

Use this folder for:

```text
- CSS
- Images
- Icons
- Fonts
- Local media assets
```

Examples:

```text
assets/main.css
assets/route-transitions.css
assets/images/auth-background-dark.webp
assets/icons/dashboard-logo.svg
assets/fonts/app-font.woff2
```

---

# 3. What Should Happen to `utils/`

The long-term goal is that `utils/` should either disappear or only contain tiny pure helper functions.

Move large systems out of `utils/`:

```text
utils/route        → systems/routing
utils/section      → systems/sections
utils/assets       → systems/assets
utils/translation  → systems/i18n
utils/interactions → systems/interactions
utils/build        → systems/build
utils/common       → infrastructure/cache, infrastructure/logging, infrastructure/errors
utils/backend      → infrastructure/backend
```

Acceptable remaining `utils/` examples, if kept at all:

```text
formatDate.js
parseNumber.js
clampValue.js
stringCase.js
objectCompare.js
```

Even then, consider whether they are better placed in a domain-specific folder.

Bad `utils/` examples:

```text
utils/routeGuards.js
utils/assetPreloader.js
utils/translationLoader.js
utils/socketHandler.js
utils/cartApi.js
```

These are not small utilities. They are systems, services, or infrastructure.

---

# 4. Folder Naming Convention

Use `kebab-case` for folders.

Correct:

```text
flow-system/
form-validation/
route-config/
asset-preload/
user-profile/
dashboard-sidebar/
```

Incorrect:

```text
flowSystem/
FlowSystem/
flow_system/
routeConfig/
AssetPreload/
```

Folder names should describe a domain or layer, not a class name.

Correct:

```text
systems/assets/
systems/sections/
services/cart/
services/bookings/
infrastructure/cache/
components/forms/
templates/dashboard/
```

---

# 5. Vue Component Naming

Use `PascalCase.vue` for Vue components.

Correct:

```text
DashboardSidebar.vue
LoginForm.vue
UserAvatar.vue
RouteErrorBoundary.vue
NavigationProgressBar.vue
```

Incorrect:

```text
dashboard-sidebar.vue
dashboardSidebar.vue
login_form.vue
route-error-boundary.vue
```

Recommended pattern:

```text
[Domain][Purpose].vue
```

Examples:

```text
CartSummary.vue
CartItemCard.vue
BookingCalendar.vue
BookingTimeSlotPicker.vue
ChatMessageBubble.vue
ChatConversationList.vue
DashboardSidebar.vue
DashboardHeader.vue
ProfileAvatarUploader.vue
```

---

# 6. Base UI Component Naming

Use `Base` only for generic reusable components.

Correct:

```text
BaseModal.vue
BaseButton.vue
BaseInput.vue
BaseDropdown.vue
BaseTooltip.vue
```

Incorrect:

```text
BaseDashboard.vue
BaseCart.vue
BaseBooking.vue
```

Use `App` for global layout components:

```text
AppHeader.vue
AppFooter.vue
AppShell.vue
AppNavigation.vue
```

Use descriptive UI names for specific reusable visual elements:

```text
IconButton.vue
LoadingSpinner.vue
EmptyState.vue
StatusBadge.vue
UserAvatar.vue
```

---

# 7. Page and Template Naming

Route-level templates should use `Page.vue`.

Correct:

```text
LoginPage.vue
RegisterPage.vue
DashboardOverviewPage.vue
EditProfilePage.vue
ShopProductPage.vue
BookingDetailsPage.vue
```

Avoid:

```text
Login.vue
Dashboard.vue
EditProfile.vue
```

Layouts should use `Layout.vue`:

```text
DashboardLayout.vue
AuthLayout.vue
ShopLayout.vue
SettingsLayout.vue
```

Role-specific pages should include the role:

```text
CreatorDashboardPage.vue
FanDashboardPage.vue
AgentDashboardPage.vue
VendorDashboardPage.vue
```

Shared dashboard files should clearly include `Shared`:

```text
DashboardSharedHeader.vue
DashboardSharedSidebar.vue
DashboardSharedLayout.vue
```

---

# 8. JavaScript Module Naming

Use `camelCase.js` for normal JavaScript modules.

Correct:

```text
routeResolver.js
routeGuards.js
assetPreloader.js
assetLibrary.js
sectionCssLoader.js
translationLoader.js
cacheHandler.js
logHandler.js
```

Incorrect:

```text
RouteResolver.js
route-resolver.js
route_resolver.js
AssetPreloader.js
```

The file name should describe the module's main job.

Good:

```text
bookingAvailabilityValidator.js
cartResponseMapper.js
routeAliasResolver.js
assetUrlPolicy.js
```

Bad:

```text
bookingUtils.js
cartHelpers.js
routeFunctions.js
assetStuff.js
```

---

# 9. Class File Naming

Use `PascalCase.js` only when the file exports a primary class.

Correct:

```text
FlowHandler.js
SocketHandler.js
MetricsManager.js
CamMicPermissions.js
ApiClient.js
CacheHandler.js
```

If the file exports this:

```js
export default class FlowHandler {}
```

Then the file should be:

```text
FlowHandler.js
```

If the file exports normal functions:

```js
export function runFlow() {}
export function validateFlow() {}
```

Then the file should be:

```text
flowRunner.js
```

---

# 10. Class Naming Recommendations

Use `PascalCase` for class names.

Examples:

```js
class FlowHandler {}
class SocketHandler {}
class MetricsManager {}
class CamMicPermissions {}
class ApiClient {}
class CacheHandler {}
```

## 10.1 Use `Handler`

Use `Handler` when the class coordinates actions or receives events/inputs and decides what to do.

Examples:

```text
FlowHandler
SocketHandler
InteractionHandler
UploadHandler
```

Use `Handler` for:

```text
- Event coordination
- User action coordination
- Dispatching behavior
- Processing incoming messages/actions
```

---

## 10.2 Use `Manager`

Use `Manager` when the class owns lifecycle/state over time.

Examples:

```text
ModalManager
PopupManager
DeviceManager
SessionManager
SubscriptionManager
```

Use `Manager` for:

```text
- Creating resources
- Updating resources
- Tracking resources
- Controlling lifecycle
- Managing active/inactive state
```

---

## 10.3 Use `Client`

Use `Client` for external communication.

Examples:

```text
HttpClient
ApiClient
ScyllaDbClient
WordPressApiClient
SocketClient
```

Use `Client` when the file talks to:

```text
- HTTP API
- Backend service
- Database
- Socket server
- External SDK
```

---

## 10.4 Use `Resolver`

Use `Resolver` when the class/function determines one final result from inputs.

Examples:

```text
RouteResolver
SectionResolver
LocaleResolver
AssetUrlResolver
PermissionResolver
```

---

## 10.5 Use `Loader`

Use `Loader` when it loads resources that are needed.

Examples:

```text
TranslationLoader
ManifestLoader
SectionCssLoader
AssetMapLoader
```

---

## 10.6 Use `Preloader`

Use `Preloader` when it warms cache in advance.

Examples:

```text
AssetPreloader
SectionPreloader
RouteComponentPreloader
```

Preloading must mean background cache warming, not blocking required loading.

---

## 10.7 Use `Validator`

Use `Validator` when it checks correctness.

Examples:

```text
RouteConfigValidator
AssetMapValidator
BookingPayloadValidator
EmailValidator
```

---

## 10.8 Use `Mapper`

Use `Mapper` when it changes data shape.

Examples:

```text
CartRequestMapper
CartResponseMapper
BookingRequestMapper
ChatMessageMapper
```

---

## 10.9 Use `Normalizer`

Use `Normalizer` when it cleans inconsistent data into one standard internal shape.

Examples:

```text
ChatMessageNormalizer
ApiResponseNormalizer
UserProfileNormalizer
```

---

## 10.10 Use `Factory`

Use `Factory` when it creates configured objects.

Examples:

```text
RouteFactory
HttpClientFactory
FlowContextFactory
```

---

## 10.11 Use `Registry`

Use `Registry` when it stores named definitions.

Examples:

```text
FlowRegistry
ComponentRegistry
RouteAliasRegistry
```

---

## 10.12 Use `Adapter`

Use `Adapter` when it connects one interface to another incompatible interface.

Examples:

```text
MockCartBackendAdapter
StripeResponseAdapter
LegacyUserAdapter
```

---

## 10.13 Use `Provider`

Use `Provider` when it supplies app-level dependencies or configuration.

Examples:

```text
AppProviders
AuthProvider
LocaleProvider
```

---

## 10.14 Use `Boundary`

Use `Boundary` when it catches errors around a UI area.

Examples:

```text
RouteErrorBoundary
ComponentErrorBoundary
```

---

# 11. Function and Method Naming

Use `camelCase` for functions and methods.

Method names should start with a verb.

Correct:

```text
getUserProfile()
loadTranslationsForSection()
resolveRouteFromPath()
validateBookingPayload()
mapCartResponse()
preloadSection()
clearPreloadCache()
createBooking()
cancelBooking()
```

Incorrect:

```text
userProfile()
translations()
routePath()
bookingPayload()
cartResponse()
section()
cache()
```

---

# 12. Recommended Method Verb Prefixes

## 12.1 Data retrieval

Use `get` when returning data.

```js
getCurrentUser()
getRouteConfiguration()
getAssetUrl()
getBookingById()
getCartItems()
```

Use `find` when the result may not exist.

```js
findRouteBySlug()
findUserById()
findActiveBooking()
findMatchingAsset()
```

---

## 12.2 Boolean checks

Use `has` for existence checks.

```js
hasSection(sectionName)
hasAsset(assetUrl)
hasPermission(permissionName)
hasActiveSubscription(userId)
```

Use `is` for state checks.

```js
isAuthenticated()
isRouteEnabled()
isValidEmail()
isBookingAvailable()
isPreloadComplete()
```

Use `can` for permission checks.

```js
canAccessRoute()
canCreateBooking()
canSendMessage()
canUseCamera()
```

Use `should` for decision logic.

```js
shouldPreloadSection()
shouldRedirectUser()
shouldShowErrorMessage()
shouldRetryRequest()
```

---

## 12.3 Loading and preloading

Use `load` when fetching/loading required data.

```js
loadRouteComponent()
loadTranslationsForSection()
loadAssetMapConfig()
loadManifest()
loadUserSession()
```

Use `preload` only when it is background cache warming.

```js
preloadSection()
preloadSectionCss()
preloadAsset()
preloadRouteComponent()
preloadTranslationsForSection()
```

Use `fetch` only for network requests.

```js
fetchCartItems()
fetchBookingAvailability()
fetchChatMessages()
fetchAssetMapManifest()
```

---

## 12.4 Mutations and actions

Use `create`, `update`, `delete`, `remove`, `clear`, and `reset` for mutation actions.

```js
createBooking()
updateCartQuantity()
deleteMessage()
removeCartItem()
clearPreloadCache()
resetRouteState()
```

Use `set` for direct assignment.

```js
setActiveLocale()
setCurrentRoute()
setBuildHash()
setUserSession()
```

Use `add` when appending.

```js
addAsset()
addSection()
addMessage()
addNotification()
```

Use `sync` when aligning state with another source.

```js
syncPreloadStoreBuildHash()
syncCartFromBackend()
syncUserSession()
```

---

## 12.5 Mapping, normalization, sanitization, validation

Use `map` for shape transformation.

```js
mapCartRequest()
mapCartResponse()
mapBookingPayload()
mapChatMessageResponse()
```

Use `normalize` for cleanup into a standard internal format.

```js
normalizeApiResponse()
normalizeRouteConfig()
normalizeAssetDefinition()
normalizeChatMessage()
```

Use `sanitize` for removing unsafe input.

```js
sanitizeTextInput()
sanitizeAssetUrl()
sanitizeFormPayload()
```

Use `validate` for checking rules.

```js
validateRouteConfig()
validateAssetMap()
validateBookingPayload()
validateEmailAddress()
```

Use `assert` when the method should throw on failure.

```js
assertAllowedAssetUrl()
assertValidRouteConfig()
assertAuthenticatedUser()
```

---

# 13. Weak Method Names to Avoid

Avoid vague method names unless strongly scoped:

```text
handle()
process()
run()
doThing()
execute()
init()
start()
setup()
check()
make()
```

Better:

```text
handleRouteNavigation()
processFlowResponse()
runRegisteredFlow()
executeCartCheckoutFlow()
initializeSocketConnection()
startNavigationProgress()
setupInteractionDirectives()
checkRoutePermission()
createBookingPayload()
```

`run()` is acceptable only for central systems where the meaning is obvious:

```js
FlowHandler.run("cart.updateQuantity", payload);
```

Inside normal services, prefer specific names.

---

# 14. Constants

Use `UPPER_SNAKE_CASE` for true constants.

```js
const DEFAULT_LOCALE = "en";
const PRELOAD_PRIORITY_HIGH = "high";
const MAX_RETRY_ATTEMPTS = 3;
const ROUTE_CONFIG_CACHE_KEY = "route_config";
```

Use `camelCase` for local values that are not constants.

```js
const activeLocale = resolveActiveLocale();
const currentRoute = resolveRouteFromPath(path);
const sectionName = resolveSectionIdentifier(id);
```

---

# 15. Boolean Naming

Boolean names must read naturally.

Correct:

```js
const isAuthenticated = true;
const hasLoadedAssets = true;
const canAccessDashboard = true;
const shouldPreloadSection = true;
const requiresAuth = true;
```

Incorrect:

```js
const auth = true;
const access = true;
const preload = true;
const status = true;
const valid = true;
```

Recommended boolean prefixes:

```text
is
has
can
should
requires
supports
allows
```

---

# 16. Event Naming

Use `kebab-case` for DOM/custom events.

```text
route-change-start
route-change-complete
section-preload-start
section-preload-complete
cart-item-added
chat-message-sent
booking-created
modal-opened
```

Event handlers should use `handle` plus the event meaning.

```js
handleRouteChangeStart()
handleSectionPreloadComplete()
handleCartItemAdded()
handleChatMessageSent()
```

---

# 17. Pinia Store Naming

Use `use` prefix and `Store` suffix.

Correct:

```text
useAuthStore.js
useCartStore.js
useChatStore.js
useLocaleStore.js
usePreloadStore.js
```

Incorrect:

```text
authStore.js
AuthStore.js
storeAuth.js
cart.js
```

Inside the file:

```js
export const useAuthStore = defineStore("auth", {
  state: () => ({})
});
```

---

# 18. Store Action Naming

Pinia store actions should describe state mutation.

Correct:

```js
setCurrentUser()
setActiveLocale()
addPreloadedSection()
addPreloadedAsset()
removeCartItem()
updateCartQuantity()
clearCart()
clearPreloadState()
syncBuildHash()
```

Avoid:

```js
update()
save()
change()
process()
handle()
```

---

# 19. Store Getter Naming

Use readable getter names.

```js
isAuthenticated
cartItemCount
hasPreloadedAssets
hasPreloadedSection
activeLocale
currentUserRole
```

For getter methods:

```js
hasSection(sectionName)
hasAsset(assetUrl)
getCartItem(productId)
getUserPermission(permissionName)
```

---

# 20. Composable Naming

Composable file and function names must start with `use`.

```js
usePopupStack()
useRoutePrefetch()
useAssetPrefetch()
useBreakpoints()
useFormState()
useDeviceState()
```

Composable methods inside can be action-based:

```js
const {
  openPopup,
  closePopup,
  closeAllPopups,
  isPopupOpen
} = usePopupStack();
```

Only Vue Composition API logic should use the `use` prefix.

---

# 21. Service File Naming

Use domain plus responsibility.

Correct:

```text
cartApi.js
cartMapper.js
cartValidator.js
bookingApi.js
bookingMapper.js
bookingValidator.js
chatApi.js
chatMapper.js
chatValidator.js
```

Better inside domain folders:

```text
services/cart/
  cartApi.js
  flows/
    updateCartQuantityFlow.js
    removeCartItemFlow.js
    applyCouponFlow.js
  mappers/
    cartRequestMapper.js
    cartResponseMapper.js
  validators/
    cartPayloadValidator.js
```

Avoid:

```text
api.js
mapper.js
validator.js
utils.js
helper.js
```

Generic names are only allowed when folder context is extremely clear and the export names are specific. Prefer explicit names anyway.

---

# 22. Service Method Naming

Services should expose business actions, not raw technical names.

Correct:

```js
cartApi.fetchCartItems()
cartApi.updateCartQuantity()
cartApi.removeCartItem()
cartApi.applyCoupon()

bookingsApi.fetchBookingAvailability()
bookingsApi.createBooking()
bookingsApi.cancelBooking()

chatApi.fetchMessages()
chatApi.sendMessage()
chatApi.markMessageAsRead()
```

Avoid:

```js
cartApi.get()
cartApi.post()
cartApi.call()
cartApi.send()
cartApi.request()
```

Low-level HTTP methods belong only in:

```text
infrastructure/http/httpClient.js
```

---

# 23. HTTP Client Naming

Low-level HTTP clients may use HTTP verbs.

```js
httpClient.get()
httpClient.post()
httpClient.put()
httpClient.patch()
httpClient.delete()
```

Domain services should not expose raw HTTP naming.

---

# 24. Flow Naming

Flow files should be action-based and end in `Flow.js`.

Correct:

```text
updateCartQuantityFlow.js
removeCartItemFlow.js
applyCouponFlow.js
fetchChatMessagesFlow.js
sendChatMessageFlow.js
createBookingFlow.js
cancelBookingFlow.js
```

Incorrect:

```text
updateCart.js
cartUpdate.js
flow1.js
cartActions.js
```

Recommended pattern:

```text
verb + domain/object + Flow.js
```

Examples:

```text
createBookingFlow.js
fetchBookingAvailabilityFlow.js
sendChatMessageFlow.js
markMessageAsReadFlow.js
```

---

# 25. Flow Key Naming

Flow keys should use dot notation.

Pattern:

```text
domain.actionObject
```

Examples:

```text
cart.updateQuantity
cart.removeItem
cart.applyCoupon
booking.create
booking.cancel
booking.fetchAvailability
chat.sendMessage
chat.markMessageRead
analytics.fetch
```

Avoid:

```text
updateCartQuantity
cart_update_quantity
cart-update-quantity
flowCartUpdate
```

---

# 26. Mapper Naming

Use request/response direction clearly.

Correct:

```text
cartRequestMapper.js
cartResponseMapper.js
bookingRequestMapper.js
bookingResponseMapper.js
chatMessageMapper.js
```

Mapper methods:

```js
mapCartUpdateRequest()
mapCartResponse()
mapBookingCreateRequest()
mapBookingResponse()
mapChatMessageResponse()
mapUserProfileResponse()
```

For collections:

```js
mapCartItemsResponse()
mapBookingListResponse()
mapChatMessagesResponse()
```

Use mapper files for:

```text
frontend payload → backend payload
backend response → frontend normalized object
```

---

# 27. Validator Naming

Use clear validator names.

Correct:

```text
cartPayloadValidator.js
bookingPayloadValidator.js
chatMessageValidator.js
emailValidator.js
routeConfigValidator.js
assetMapValidator.js
```

Avoid:

```text
validate.js
validation.js
rules.js
check.js
```

Validator methods:

```js
validateCartPayload()
validateBookingPayload()
validateChatMessagePayload()
validateRouteConfig()
validateAssetMap()
```

For specific checks:

```js
isValidEmailAddress()
isValidBookingTimeRange()
isAllowedAssetUrl()
hasRequiredBookingFields()
```

For throwing validation:

```js
assertValidBookingPayload()
assertAllowedAssetUrl()
assertRouteConfigIsValid()
```

---

# 28. Config File Naming

Use `camelCase` for JSON config files unless the file is public/static.

Correct:

```text
routeConfig.json
routeDefaults.json
assetMap.json
countries.json
sectionManifest.json
```

Incorrect:

```text
route-config.json
route_config.json
RouteConfig.json
```

For public generated manifest files, use `kebab-case` because they are fetched by URL:

```text
section-manifest.dev.json
section-css-manifest.dev.json
asset-map-manifest.json
```

---

# 29. CSS Naming

Use `kebab-case.css` for CSS files.

Correct:

```text
main.css
route-transitions.css
dashboard-layout.css
auth-layout.css
form-validation.css
```

Incorrect:

```text
routeTransitions.css
DashboardLayout.css
form_validation.css
```

---

# 30. Asset Naming

Use `kebab-case` for images, icons, fonts, and media.

Correct:

```text
dashboard-logo.svg
user-avatar-placeholder.png
auth-background-dark.webp
empty-cart-icon.svg
profile-cover-default.jpg
```

Incorrect:

```text
dashboardLogo.svg
UserAvatarPlaceholder.png
auth_background_dark.webp
EmptyCartIcon.svg
```

---

# 31. Test File Naming

Use the same base name as the file being tested.

Correct:

```text
routeResolver.test.js
assetPreloader.test.js
FlowHandler.test.js
DashboardSidebar.test.js
```

Incorrect:

```text
routeResolverSpec.js
testRouteResolver.js
route_resolver_test.js
```

---

# 32. Barrel Export Rules

Use `index.js` only for stable public exports.

Recommended:

```text
systems/assets/index.js
systems/sections/index.js
systems/routing/index.js
infrastructure/cache/index.js
infrastructure/logging/index.js
infrastructure/errors/index.js
```

Do not export everything blindly.

Bad:

```js
export * from "./internalDebugHelper.js";
export * from "./privateManifestState.js";
```

Good:

```js
export { preloadSection } from "./sectionPreloader.js";
export { resolveSectionIdentifier } from "./sectionResolver.js";
```

Only export what is intentionally public.

---

# 33. Import Path Guidelines

Use aliases for stable app-level imports.

Correct:

```js
import { preloadSection } from "@/systems/sections/sectionPreloader.js";
import { getAssetUrl } from "@/systems/assets/assetLibrary.js";
import { log } from "@/infrastructure/logging/logHandler.js";
import { useAuthStore } from "@/stores/useAuthStore.js";
```

Avoid deep relative paths when crossing major layers:

```js
import { preloadSection } from "../../../systems/sections/sectionPreloader.js";
```

Relative paths are acceptable for nearby files in the same folder.

---

# 34. Layer Dependency Rules

Recommended dependency direction:

```text
app/            → router, stores, systems, services, infrastructure
router/         → systems/routing, systems/sections, stores
systems/        → infrastructure, stores, config, assets where needed
services/       → infrastructure, stores only when appropriate
stores/         → infrastructure or services only when justified
components/     → composables, stores, services, components
composables/    → stores, systems, services, infrastructure
infrastructure/ → no app-specific business dependencies
config/         → no imports, static config only
assets/         → static files only
```

Avoid dependency direction like this:

```text
infrastructure importing components
infrastructure importing templates
config importing services
components importing low-level backend clients directly
```

---

# 35. Where to Add New Code

Use this decision guide before creating any file.

## 35.1 Is it reusable visual UI?

Place it in:

```text
src/components/
```

Examples:

```text
Button
Modal
Input
Spinner
Dropdown
Avatar
Card
Badge
```

Naming examples:

```text
BaseButton.vue
IconButton.vue
UserAvatar.vue
LoadingSpinner.vue
StatusBadge.vue
```

---

## 35.2 Is it a full route/page layout?

Place it in:

```text
src/templates/
```

Naming examples:

```text
LoginPage.vue
DashboardOverviewPage.vue
CreatorDashboardPage.vue
SettingsLayout.vue
```

---

## 35.3 Is it Pinia state?

Place it in:

```text
src/stores/
```

Naming examples:

```text
useAuthStore.js
useCartStore.js
usePreloadStore.js
```

---

## 35.4 Is it a business flow or API/domain operation?

Place it in:

```text
src/services/[domain]/
```

Examples:

```text
services/cart/cartApi.js
services/cart/flows/updateCartQuantityFlow.js
services/cart/mappers/cartRequestMapper.js
services/cart/validators/cartPayloadValidator.js
```

---

## 35.5 Is it part of routing/assets/sections/i18n/interactions/build systems?

Place it in:

```text
src/systems/
```

Examples:

```text
systems/routing/routeResolver.js
systems/assets/assetPreloader.js
systems/sections/sectionPreloader.js
systems/i18n/translationLoader.js
systems/interactions/engine.js
systems/build/manifestLoader.js
```

---

## 35.6 Is it low-level technical infrastructure?

Place it in:

```text
src/infrastructure/
```

Examples:

```text
infrastructure/http/httpClient.js
infrastructure/cache/cacheHandler.js
infrastructure/logging/logHandler.js
infrastructure/errors/errorHandler.js
infrastructure/backend/scyllaDbClient.js
```

---

## 35.7 Is it a Vue Composition API hook?

Place it in:

```text
src/composables/
```

Naming examples:

```text
usePopupStack.js
useRoutePrefetch.js
useBreakpoints.js
```

---

## 35.8 Is it static JSON/config?

Place it in:

```text
src/config/
```

Examples:

```text
assetMap.json
countries.json
```

---

## 35.9 Is it CSS/image/icon/font media?

Place it in:

```text
src/assets/
```

Examples:

```text
assets/main.css
assets/route-transitions.css
assets/images/auth-background-dark.webp
assets/icons/dashboard-logo.svg
assets/fonts/app-font.woff2
```

---

# 36. AI Suggestions Section

This section is specifically for AI tools or developers using AI to modify the codebase.

## 36.1 Before adding code, classify the code

AI must first decide what kind of code it is.

Ask:

```text
Is this UI?
Is this a route/page?
Is this Pinia state?
Is this a business flow?
Is this a mapper?
Is this a validator?
Is this a frontend system?
Is this low-level infrastructure?
Is this a Vue composable?
Is this static config?
```

Then choose the folder based on the responsibility.

Do not default to `utils/`.

---

## 36.2 AI folder decision table

| Code type | Folder | Example name |
|---|---|---|
| Reusable button/modal/input | `components/ui/` or `components/forms/` | `BaseButton.vue` |
| Full route page | `templates/[domain]/` | `LoginPage.vue` |
| Page layout | `templates/[domain]/` | `DashboardLayout.vue` |
| Pinia state | `stores/` | `useCartStore.js` |
| Business API wrapper | `services/[domain]/` | `cartApi.js` |
| Flow action | `services/[domain]/flows/` | `updateCartQuantityFlow.js` |
| Request/response mapper | `services/[domain]/mappers/` | `cartResponseMapper.js` |
| Payload validator | `services/[domain]/validators/` | `cartPayloadValidator.js` |
| Route logic | `systems/routing/` | `routeResolver.js` |
| Section preload logic | `systems/sections/` | `sectionPreloader.js` |
| Asset preload logic | `systems/assets/` | `assetPreloader.js` |
| Translation/i18n logic | `systems/i18n/` | `translationLoader.js` |
| Interaction engine logic | `systems/interactions/` | `engine.js` |
| Manifest/build runtime logic | `systems/build/` | `manifestLoader.js` |
| HTTP client | `infrastructure/http/` | `httpClient.js` |
| Cache utility | `infrastructure/cache/` | `cacheHandler.js` |
| Logging utility | `infrastructure/logging/` | `logHandler.js` |
| Error reporting | `infrastructure/errors/` | `errorHandler.js` |
| Vue hook | `composables/` | `useBreakpoints.js` |
| Static JSON | `config/` | `assetMap.json` |
| CSS/image/icon/font | `assets/` | `dashboard-logo.svg` |

---

## 36.3 AI naming checklist

Before creating a file, AI should confirm:

```text
- Folder name uses kebab-case.
- Vue component file uses PascalCase.vue.
- Page files end with Page.vue.
- Layout files end with Layout.vue.
- JS utility/module files use camelCase.js.
- Class files use PascalCase.js only when exporting a primary class.
- Pinia stores use useNameStore.js.
- Composables start with use.
- Flow files end with Flow.js.
- Mapper files include RequestMapper or ResponseMapper.
- Validator files include PayloadValidator, ConfigValidator, or specific Validator naming.
- CSS/assets use kebab-case.
```

---

## 36.4 AI method naming checklist

Before creating methods, AI should confirm:

```text
- Method starts with a clear verb.
- Boolean method uses is/has/can/should/requires.
- Network method uses fetch.
- Required resource loader uses load.
- Background cache warming uses preload.
- Data transformation uses map.
- Shape cleanup uses normalize.
- Unsafe input cleanup uses sanitize.
- Rule checking uses validate.
- Throwing checks use assert.
- Direct assignment uses set.
- Appending uses add.
- State clearing uses clear or reset.
```

---

## 36.5 AI should avoid vague names

AI must not create names like:

```text
utils.js
helpers.js
common.js
misc.js
data.js
actions.js
functions.js
stuff.js
temp.js
test.js
new.js
old.js
manager.js without a specific domain
handler.js without a specific domain
```

Better examples:

```text
cartResponseMapper.js
bookingAvailabilityValidator.js
routeAliasResolver.js
assetUrlPolicy.js
popupStackManager.js
sectionCssLoader.js
```

---

## 36.6 AI should not silently change behavior during structural tasks

If the task is a folder refactor, AI must only:

```text
- Move files
- Update imports
- Preserve exports
- Preserve behavior
- Document uncertain files
```

AI must not silently alter:

```text
- route logic
- preload behavior
- asset loading behavior
- translation behavior
- store behavior
- flow behavior
- API behavior
- UI design
```

If AI discovers a bug during the move, it should document it separately unless the user explicitly asks to fix it.

---

## 36.7 AI should validate imports after moving code

After any structural change, AI should search for old imports:

```text
@/utils/route
@/utils/section
@/utils/assets
@/utils/translation
@/utils/interactions
@/utils/build
@/utils/common
@/utils/backend
```

AI should also search relative import paths that may now be broken.

Validation checklist:

```text
- App starts without missing module errors.
- Router still loads pages.
- Section preloading still works.
- Asset preloading still works.
- Translations still load.
- Pinia stores initialize.
- FlowHandler still works.
- No duplicate old folders remain unless intentionally documented.
```

---

## 36.8 AI should add code to the highest-responsibility layer

When multiple folders seem possible, choose the highest appropriate responsibility layer.

Examples:

```text
A function that resolves route metadata belongs in systems/routing, not utils.
A function that fetches cart items belongs in services/cart, not components.
A reusable dropdown belongs in components/ui/dropdowns, not templates.
A dashboard page belongs in templates/dashboard, not components.
A low-level HTTP wrapper belongs in infrastructure/http, not services/cart.
A Vue hook for breakpoints belongs in composables, not infrastructure.
```

---

## 36.9 AI should keep components thin

Components should mostly do:

```text
- Render UI
- Receive props
- Emit events
- Call composables
- Call services/flows when needed
- Show loading/error/success state
```

Components should not contain:

```text
- Large API request logic
- Complex data mapping
- Business validation rules
- Route guard logic
- Asset preload algorithms
- Translation loader internals
```

---

## 36.10 AI should keep services business-focused

Services should expose business actions.

Good:

```js
cartApi.updateCartQuantity(productId, quantity)
bookingsApi.fetchBookingAvailability(creatorId, date)
chatApi.sendMessage(conversationId, message)
```

Bad:

```js
cartApi.post(url, payload)
bookingsApi.request(config)
chatApi.call(endpoint)
```

Raw HTTP belongs in `infrastructure/http/httpClient.js`.

---

## 36.11 AI should preserve the data pipeline

The existing pipeline should stay in:

```text
src/services/flow-system/
```

New business workflows should integrate with the pipeline when appropriate.

Recommended flow structure:

```text
services/[domain]/flows/[actionObject]Flow.js
services/[domain]/mappers/[domain]RequestMapper.js
services/[domain]/mappers/[domain]ResponseMapper.js
services/[domain]/validators/[domain]PayloadValidator.js
```

Flow key example:

```text
cart.updateQuantity
booking.fetchAvailability
chat.sendMessage
```

---

# 37. Examples of Adding New Code Correctly

## 37.1 Add a new cart quantity update feature

Files:

```text
services/cart/flows/updateCartQuantityFlow.js
services/cart/mappers/cartRequestMapper.js
services/cart/mappers/cartResponseMapper.js
services/cart/validators/cartPayloadValidator.js
services/cart/cartApi.js
```

Function names:

```js
updateCartQuantityFlow()
mapCartUpdateRequest()
mapCartResponse()
validateCartPayload()
cartApi.updateCartQuantity()
```

Flow key:

```text
cart.updateQuantity
```

Component usage:

```js
FlowHandler.run("cart.updateQuantity", payload);
```

---

## 37.2 Add a new booking calendar UI

Files:

```text
components/calendar/BookingCalendar.vue
components/calendar/BookingTimeSlotPicker.vue
templates/bookings/BookingCreatePage.vue
services/bookings/flows/fetchBookingAvailabilityFlow.js
services/bookings/validators/bookingPayloadValidator.js
```

Names:

```text
BookingCalendar.vue
BookingTimeSlotPicker.vue
BookingCreatePage.vue
fetchBookingAvailabilityFlow.js
validateBookingPayload()
```

---

## 37.3 Add new asset preload policy

Files:

```text
systems/assets/assetPolicy.js
systems/assets/assetPreloader.js
config/assetMap.json
```

Methods:

```js
assertAllowedAssetUrl()
validateAssetPreloadEntry()
preloadAsset()
```

Do not place this in:

```text
utils/assets.js
components/AssetPreloader.vue
services/assets/
```

---

## 37.4 Add a new route guard

Files:

```text
systems/routing/routeGuards.js
systems/routing/routeResolver.js
router/routeConfig.json
```

Methods:

```js
guardCheckAdminAccess()
canAccessRoute()
resolveEffectiveRouteConfig()
```

Do not place route guards inside page components.

---

## 37.5 Add a reusable popup stack

Files:

```text
composables/usePopupStack.js
components/ui/popups/BasePopup.vue
components/ui/popups/PopupStack.vue
```

Methods:

```js
usePopupStack()
openPopup()
closePopup()
closeAllPopups()
isPopupOpen()
```

---

# 38. Refactor Acceptance Criteria

A folder/naming refactor is complete only when:

```text
- New folder structure exists.
- Large systems have moved from utils/ into systems/.
- Low-level utilities have moved into infrastructure/.
- Vue hooks live in composables/.
- Data pipeline remains in services/flow-system/.
- Reusable UI remains in components/.
- Page-level UI remains in templates/.
- Static config remains in config/.
- Static assets remain in assets/.
- All imports are updated.
- App compiles without missing module errors.
- Existing behavior is unchanged.
- Any skipped or uncertain files are documented.
```

---

# 39. Audit Checklist After Refactor

Run these checks after any architecture migration.

## 39.1 Structure checks

```text
- No large systems remain in utils/.
- No business API logic exists inside components/.
- No route guard logic exists inside templates/.
- No low-level HTTP clients exist inside services/domain folders.
- No Vue composables exist outside composables/ unless intentionally local.
- No generic helpers.js/utils.js files were created.
```

## 39.2 Runtime checks

```text
- App boots.
- Login page loads.
- Dashboard route loads.
- Role-based pages load.
- Section CSS loads.
- Asset preloading works.
- Translations load.
- Store state initializes.
- FlowHandler runs at least one read flow and one write flow.
- Error boundary still catches component errors.
```

## 39.3 Search checks

Search for old imports:

```text
@/utils/route
@/utils/section
@/utils/assets
@/utils/translation
@/utils/interactions
@/utils/build
@/utils/common
@/utils/backend
```

Search for vague file names:

```text
utils.js
helpers.js
common.js
misc.js
data.js
actions.js
functions.js
stuff.js
temp.js
old.js
new.js
```

---

# 40. Final Naming Summary

```text
Folders:              kebab-case
Vue components:        PascalCase.vue
Pages/templates:       PascalCase + Page.vue / Layout.vue
JS modules:            camelCase.js
Class files:           PascalCase.js
Class names:           PascalCase
Functions/methods:     camelCase, verb first
Constants:             UPPER_SNAKE_CASE
Booleans:              is/has/can/should/requires
Events:                kebab-case
Pinia stores:          useNameStore.js
Composables:           useName.js
Flows:                 actionObjectFlow.js
Flow keys:             domain.actionObject
Mappers:               domainRequestMapper.js / domainResponseMapper.js
Validators:            domainPayloadValidator.js
Config JSON:           camelCase.json
Public manifests:      kebab-case.json
CSS/assets:            kebab-case
Tests:                 sameFileName.test.js
```

---

# 41. Final Rule

A good name should make the file, class, or method understandable before opening it.

A good folder should tell the developer what type of responsibility belongs there.

A good architecture should make it hard to put code in the wrong place.

Do not create generic dumping grounds. Name things by responsibility, domain, and behavior.

