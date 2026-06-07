# UI Architecture Refactor Changelog

Date: 2026-06-07  
Scope: `src/stores/`, `src/components/` folder structure, `src/components/` → `src/templates/` layer moves, and related service extraction.

Import path updates in consumers are omitted — they follow mechanically from file moves and renames.

Referenced rules:
- `docs/tasks/vue-app-architecture-naming-guidelines.md`
- `docs/tasks/Expanded Vue App Naming Convention.txt`

---

## Phase 0 — `src/stores`

| Original | Change | Original line | Why |
|----------|--------|---------------|-----|
| `ipStore.js` | **Deleted** — replaced by `useIpStore.js` | file | Pinia store files must use `useNameStore.js` per naming guidelines §17 / §25. |
| `useIpStore.js` | **Created** (same store logic as former `ipStore.js`) | file | Canonical filename for the existing `useIpStore` export. |
| `export const useIpStore` | unchanged | `useIpStore.js` L48 | Export already matched composable-style store naming. |
| `defineStore('ip', …)` | unchanged | `useIpStore.js` L48 | Short lowercase store id matches `auth`, `cart`, `locale`. |
| `setIp` / `removeIp` | unchanged | `useIpStore.js` L60–70 | Action verbs already follow store action naming rules. |
| `DashboardAnalytics.js` | **Deleted** — replaced by `useDashboardAnalyticsStore.js` | file | Store file used PascalCase without `use`/`Store` suffix. |
| `useDashboardAnalyticsStore.js` | **Created** (slimmed store) | file | Pinia store file naming standardization. |
| `export const useDashboardAnalytics` | `export const useDashboardAnalyticsStore` | `DashboardAnalytics.js` L72 → `useDashboardAnalyticsStore.js` L104 | Store composable export must include `Store` suffix. |
| `defineStore('DashboardAnalytics', …)` | `defineStore('dashboardAnalytics', …)` | `DashboardAnalytics.js` L72 → `useDashboardAnalyticsStore.js` L104 | Align Pinia id casing with other stores (`auth`, `cart`). |
| `DASHBOARD_PERSIST_KEY = buildPersistKey('DashboardAnalytics')` | `DASHBOARD_ANALYTICS_PERSIST_KEY = buildPersistKey('dashboard-analytics')` | `DashboardAnalytics.js` L16–17 → `useDashboardAnalyticsStore.js` L17–18 | Persist keys should use lowercase kebab domain keys; legacy key kept for migration. |
| `dashboardPersistSerializer` | `dashboardAnalyticsPersistSerializer` | `DashboardAnalytics.js` L18 → `useDashboardAnalyticsStore.js` L19 | Renamed to match new store/file name. |
| `_findLatestNonZero` getter | **Removed from store** → `findLatestNonZeroEntry()` in mapper | `DashboardAnalytics.js` L154–164 | Private helper logic belongs in service mapper, not Pinia getters. |
| `subscribers` getter | `subscriberInsights` getter | `DashboardAnalytics.js` L167 → `useDashboardAnalyticsStore.js` L178 | Getter name should be domain-specific and readable per §19. |
| `earningsInsights` getter | unchanged name; logic moved to `buildEarningsInsights()` | `DashboardAnalytics.js` L221 → mapper + `useDashboardAnalyticsStore.js` L182 | Presentation derivation extracted; getter now delegates to mapper. |
| `setAnalyticsAction(bundle)` | `syncAnalyticsBundle(bundle)` | `DashboardAnalytics.js` L242 → `useDashboardAnalyticsStore.js` L193 | Pipeline hydration should use `sync` verb; `*Action` is vague per §18. |
| Inline `mapSub` / `mapFans` / `getPct` / `calcPct` in action | **Moved** to `analyticsResponseMapper.js` | `DashboardAnalytics.js` L262–407 | Mapping/transformation belongs in `services/analytics/mappers/`, not store. |
| Integrity `console.group` block in action | **Moved** to `validateAnalyticsBundleIntegrity()` | `DashboardAnalytics.js` L412–518 | Validation/logging belongs in `services/analytics/validators/`, not store. |
| `resetAnalytics()` | `resetAnalyticsState()` | `DashboardAnalytics.js` L525 → `useDashboardAnalyticsStore.js` L209 | Store reset actions should use explicit `resetXState` naming. |
| `legacyKeys: ['DashboardAnalytics']` | `legacyKeys: ['DashboardAnalytics', 'dashboard-analytics']` | `DashboardAnalytics.js` L547 → `useDashboardAnalyticsStore.js` L231 | Preserve old persisted data after persist key rename. |
| `baseKey: 'DashboardAnalytics'` | `baseKey: 'dashboard-analytics'` | `DashboardAnalytics.js` L548 → `useDashboardAnalyticsStore.js` L232 | Align migration base key with new persist key. |
| `label: 'dashboard'` | `label: 'dashboard-analytics'` | `DashboardAnalytics.js` L556 → `useDashboardAnalyticsStore.js` L241 | Quota monitor label matches new persist domain key. |

### `src/services/analytics/mappers`

| Original | Change | Original line | Why |
|----------|--------|---------------|-----|
| _(none — new file)_ | `analyticsResponseMapper.js` created | file | Mapper layer for analytics bundle shape transformation per architecture §2.4 / naming §16. |
| `calcPct` / `getPct` inline helpers | `calculatePeriodChangePercent()` | `DashboardAnalytics.js` L172–176, L300–303, L359–362 | Shared pure percentage helper with explicit verb naming. |
| `_findLatestNonZero` getter logic | `findLatestNonZeroEntry()` | `DashboardAnalytics.js` L154–164 | Reusable non-store helper for latest non-zero time-series entry. |
| `mapSub` inline closure | `mapSubscriptionsPeriod()` + `mapSubscriptionsBundle()` | `DashboardAnalytics.js` L262–286 | Subscription bundle mapping extracted to mapper module. |
| Earnings assignment block | `mapEarningsBundle()` | `DashboardAnalytics.js` L288–297 | Earnings response mapping extracted to mapper module. |
| `mapFans` inline closure | `mapFanInsightsPeriod()` + `mapFansFromFanInsights()` + `mapRawFanInsights()` | `DashboardAnalytics.js` L305–355 | Fan insights mapping extracted to mapper module. |
| Likes assignment block | `mapLikesSummary()` | `DashboardAnalytics.js` L358–385 | Likes summary mapping extracted to mapper module. |
| Trending countries assignment | `mapTrendingCountries()` | `DashboardAnalytics.js` L397–402 | Countries slice mapping extracted to mapper module. |
| `subscribers` getter body | `buildSubscriberInsights()` | `DashboardAnalytics.js` L167–217 | UI-facing subscriber insights derivation lives in mapper. |
| `earningsInsights` getter body | `buildEarningsInsights()` | `DashboardAnalytics.js` L221–237 | UI-facing earnings insights derivation lives in mapper. |
| Full action mapping orchestration | `mapAnalyticsBundleResponse()` | `DashboardAnalytics.js` L242–407 | Single mapper entry used by `syncAnalyticsBundle`. |

### `src/services/analytics/validators`

| Original | Change | Original line | Why |
|----------|--------|---------------|-----|
| _(none — new file)_ | `analyticsBundleValidator.js` created | file | Validator layer for analytics bundle integrity checks. |
| `console.group('🛡️ ANALYTICS DATA INTEGRITY CHECK')` block | `validateAnalyticsBundleIntegrity()` | `DashboardAnalytics.js` L412–518 | Debug validation does not belong in Pinia store actions. |

### `src/services/flow-system`

| Original | Change | Original line | Why |
|----------|--------|---------------|-----|
| `action: "setAnalyticsAction"` | `action: "syncAnalyticsBundle"` | `flowRegistry.js` L1845 | Flow registry must target renamed store action. |

### `src/templates/analytics`

| Original | Change | Original line | Why |
|----------|--------|---------------|-----|
| `store.subscribers` (13 usages) | `store.subscriberInsights` | `AnalyticsPage.vue` L86–906 | Getter renamed for clearer domain-specific naming. |

### Final `src/stores/` inventory

```text
useAuthStore.js
useCartStore.js
useChatStore.js
useLocaleStore.js
usePreloadStore.js
useIpStore.js
useDashboardAnalyticsStore.js
```

---

## Phase 1 — Cross-layer moves (`src/components/` → `src/templates/`)

**Goal:** Remove page-level and layout-composition files from `components/` so that folder holds only reusable UI pieces.

**Deleted empty folders:** `src/components/auth/`, `src/components/dashboard/`, `src/components/contact/`, `src/components/demoAuditComponents/`

### `src/templates/auth/components`

| Original | Change | Why |
|----------|--------|-----|
| `src/components/auth/AuthLogIn.vue` | `src/templates/auth/views/AuthLogIn.vue` | Full login screen composition mounted by `templates/auth/page/role/AuthLogIn.vue` route wrapper — route-level UI, not a reusable atom. |
| `src/components/auth/AuthSignUp.vue` | `src/templates/auth/views/AuthSignUp.vue` | Full registration screen; consumed only by auth route templates. |
| `src/components/auth/AuthLostPassword.vue` | `src/templates/auth/views/AuthLostPassword.vue` | Full password-recovery screen for auth routes. |
| `src/components/auth/AuthResetPassword.vue` | `src/templates/auth/views/AuthResetPassword.vue` | Full reset-password screen for auth routes. |
| `src/components/auth/AuthConfirmEmail.vue` | `src/templates/auth/views/AuthConfirmEmail.vue` | Full email-confirmation screen for auth routes. |
| `src/components/auth/AuthSignUpOnboarding.vue` | `src/templates/auth/views/AuthSignUpOnboarding.vue` | Multi-step onboarding flow screen, not a generic reusable widget. |
| `src/components/auth/AuthSignUpOnboardingKyc.vue` | `src/templates/auth/views/AuthSignUpOnboardingKyc.vue` | KYC onboarding route screen. |
| `src/components/auth/AuthSignUpOnboardingKycStatus.vue` | `src/templates/auth/views/AuthSignUpOnboardingKycStatus.vue` | KYC status route screen. |

### `src/templates/dashboard/shared`

| Original | Change | Why |
|----------|--------|-----|
| `src/components/dashboard/DashboardWrapperTwoColContainer.vue` | `src/templates/dashboard/shared/DashboardWrapperTwoColContainer.vue` | Two-column dashboard shell (sidebar + header + slot) used to compose route pages — shared **layout** composition per §2.7 / Expanded §4 `*Layout.vue` intent. |
| `src/components/dashboard/DashboardSectionContainer.vue` | `src/templates/dashboard/shared/DashboardSectionContainer.vue` | Page section wrapper used by settings/edit-profile **templates**, not a standalone reusable card/input. |
| `src/components/dashboard/DashboardWrapperMain.vue` | `src/templates/dashboard/shared/DashboardWrapperMain.vue` | Dashboard main-area wrapper — page layout concern. |
| `src/components/dashboard/DashboardTwoColInnerContainerWrapper.vue` | `src/templates/dashboard/shared/DashboardTwoColInnerContainerWrapper.vue` | Inner two-column page wrapper — layout composition. |
| `src/components/dashboard/Dashboard.vue` | `src/templates/dashboard/shared/Dashboard.vue` | Route placeholder page body, not a reusable dashboard widget. |
| `src/components/dashboard/dashboardOverviewCreator.vue` | `src/templates/dashboard/shared/dashboardOverviewCreator.vue` | Creator overview page fragment; belongs with dashboard **pages**, not generic components. |

### `src/templates/contact/shared`

| Original | Change | Why |
|----------|--------|-----|
| `src/components/contact/ContactWrapperMain.vue` | `src/templates/contact/shared/ContactWrapperMain.vue` | Main content area of the contact **section page**, composed inside `ContactWrapper.vue`. |
| `src/components/contact/ContactWrapperTwoColContainer.vue` | `src/templates/contact/shared/ContactWrapperTwoColContainer.vue` | Contact section two-column layout shell. |
| `src/components/contact/ContactTwoColInnerContainerWrapper.vue` | `src/templates/contact/shared/ContactTwoColInnerContainerWrapper.vue` | Inner contact page layout wrapper. |

### `src/templates/dev/demo-audit`

| Original | Change | Why |
|----------|--------|-----|
| `src/components/demoAuditComponents/BaseInputDemo.vue` | `src/templates/dev/demo-audit/BaseInputDemo.vue` | Dev-only demo route (`routeConfig.json`); not production reusable UI. |
| `src/components/demoAuditComponents/InputComponentDashboardDemo.vue` | `src/templates/dev/demo-audit/InputComponentDashboardDemo.vue` | Dev demo route page. |
| `src/components/demoAuditComponents/AuthComponentDemo.vue` | `src/templates/dev/demo-audit/AuthComponentDemo.vue` | Dev demo route page. |
| `src/components/demoAuditComponents/InputDefaultComponentDemo.vue` | `src/templates/dev/demo-audit/InputDefaultComponentDemo.vue` | Dev demo route page. |
| `src/components/demoAuditComponents/CodeInputAuthComponentDemo.vue` | `src/templates/dev/demo-audit/CodeInputAuthComponentDemo.vue` | Dev demo route page. |
| `src/components/demoAuditComponents/CheckboxGroupDemo.vue` | `src/templates/dev/demo-audit/CheckboxGroupDemo.vue` | Dev demo route page. |
| `src/components/demoAuditComponents/CheckboxSwitchDemo.vue` | `src/templates/dev/demo-audit/CheckboxSwitchDemo.vue` | Dev demo route page. |
| `src/components/demoAuditComponents/ValidationRulesShowcase.vue` | `src/templates/dev/demo-audit/ValidationRulesShowcase.vue` | Dev showcase composed into demo routes. |

### `build/tailwind`

| Original | Change | Why |
|----------|--------|-----|
| `contentPaths: components/dashboard/**/*.vue` | `templates/dashboard/shared/**/*.vue` | Tailwind section scanner must scan moved dashboard shell paths. |

---

## Why these files belong in `templates/`, not `components/`

Per **`vue-app-architecture-naming-guidelines.md`**:

| Rule | Application |
|------|-------------|
| **§2.6 `components/`** — reusable visual pieces (buttons, inputs, modals, cards) | Auth screens, dashboard shells, and contact wrappers compose full views and wire flows — they are not small reusable atoms. |
| **§2.7 `templates/`** — page-level route layouts and route-level pages | Auth `.vue` files are the actual route UI mounted by `templates/auth/page/*`. Dashboard `*Wrapper*` files are shared page layout chrome for dashboard routes. |
| **§2.7 rule:** `components/ = reusable visual pieces` / `templates/ = full page / route-level composition` | Every moved file either is a route screen or wraps `<slot />` page content with section chrome. |
| **§35.1 vs §35.2** — reusable button/modal vs full route/page layout | Moved files match §35.2 (page layout), not §35.1 (atomic UI). |
| **§36.2 decision table** — Full route page → `templates/[domain]/`; Page layout → `templates/[domain]/` | Auth screens and demo audit routes are route pages; dashboard/contact wrappers are layouts. |

Per **`Expanded Vue App Naming Convention.txt`**:

| Rule | Application |
|------|-------------|
| **§4 Page/template names** — route-level templates use `Page.vue`; layouts use `Layout.vue` | Moved auth files are route screen bodies (future rename: `LoginPage.vue`, etc.). Moved `*Wrapper*` files are layout shells (future rename: `DashboardSharedLayout.vue`, etc.). |
| **§3 Vue component names** — `[Domain][Purpose].vue` for reusable components | `AuthLogIn.vue` as a full screen is a **page composition**, not a reusable `LoginForm.vue`-style widget. |
| **Shared dashboard files should include `Shared`** (Expanded §4) | `DashboardWrapperTwoColContainer` is shared dashboard chrome — belongs under `templates/dashboard/shared/`, not `components/`. |

**Phase 1 intentionally did not rename files yet** — only corrected layer placement.

---

## Phase 2 — Folder restructure (`src/components/`)

**Goal:** Kebab-case folders, consolidate legacy roots into `ui/`, replace generic subfolder names. Filenames unchanged.

**Removed empty legacy folders:** `input/`, `button/`, `checkbox/`, `datePicker/`, `default/`, `mediaCardsVariations/`, `dropdownHandler/`

**Top-level `src/components/` after Phase 2:** `calendar/`, `icons/`, `layout/`, `misc/`, `ui/` (+ loose root `.vue` files — Phase 4)

### Consolidated legacy roots → `ui/`

| Original | Change | Why |
|----------|--------|-----|
| `src/components/input/` | `src/components/forms/inputs/` | Guidelines target `components/forms/inputs/`; project uses `ui/form/` — inputs belong with form primitives, not a legacy root. |
| `src/components/button/` | `src/components/ui/buttons/` | Buttons belong in `ui/buttons/` per target structure §1. |
| `src/components/checkbox/` | `src/components/forms/checkboxes/` | Checkbox controls are form primitives. |
| `src/components/datePicker/` | `src/components/forms/date-picker/` | Date picker is a form control; folder kebab-cased. |
| `src/components/default/` | `src/components/ui/typography/` | `Heading.vue` / `Paragraph.vue` are typography primitives; `default/` is a vague name (Expanded §1 avoids `common`, `misc`). |
| `src/components/mediaCardsVariations/` | `src/components/ui/media/media-cards/` | Media card variants are reusable UI; camelCase → kebab-case. |
| `src/components/dropdownHandler/` | `src/components/ui/dropdowns/` | Dropdown UI belongs in `ui/dropdowns/` per target §1; `Handler` suffix reserved for coordinating classes. |

### camelCase folder renames (inside `ui/`)

| Original | Change | Why |
|----------|--------|-----|
| `ui/form/BookingForm/` | `ui/form/booking-form/` | Folders must be kebab-case per §4 / architecture §4. |
| `ui/popup/cartCheckout/` | `ui/popup/cart-checkout/` | Same. |
| `ui/popup/buyNow/` | `ui/popup/buy-now/` | Same. |
| `ui/table/dashboard/analyticsDashboardTables/` | `ui/table/dashboard/analytics-tables/` | Same. |
| `ui/popup/dropdown/dashboard/customThemeSelect/` | `ui/popup/dropdown/dashboard/custom-theme-select/` | Same. |

### Generic subfolder renames

| Original | Change | Why |
|----------|--------|-----|
| `ui/global/plan/HelperComponents/` | `ui/global/plan/parts/` | `HelperComponents` is vague (Expanded §1: avoid `helper`, `utils`). |
| `ui/global/media/uploader/HelperComponents/` | `ui/global/media/uploader/parts/` | Same. |
| `ui/form/booking-form/HelperComponents/` | `ui/form/booking-form/parts/` | Same. |
| `ui/popup/ReuseableComponents/` | `ui/popup/checkout/` | Checkout-related shared popup pieces; domain-specific folder name. |

### Merged duplicate chart folders

| Original | Change | Why |
|----------|--------|-----|
| `ui/chart/ChartContainer.vue` | `ui/charts/ChartContainer.vue` | Single `ui/charts/` folder; removed duplicate `ui/chart/` vs `ui/charts/` split. |

### `routeConfig.json` path updates (structural)

| Route component | New path | Why |
|-----------------|----------|-----|
| `DatePickerShowcase.vue` | `@/components/forms/date-picker/DatePickerShowcase.vue` | Follows date-picker folder move. |
| `UnifiedBookingForm.vue` | `@/components/forms/booking-form/UnifiedBookingForm.vue` | Follows booking-form folder rename. |
| `DemoDropdowns.vue` | `@/components/ui/dropdowns/demo/DemoDropdowns.vue` | Follows dropdowns folder move (file restored from git after move conflict). |

### Why these folders belong under `ui/` (not legacy roots)

Per **`vue-app-architecture-naming-guidelines.md`** §2.6 and target structure §1:

| Rule | Application |
|------|-------------|
| `components/ui/buttons/`, `components/forms/inputs/` | Atomic reusable controls live under `ui/`, not parallel legacy roots. |
| Folder kebab-case | `datePicker`, `BookingForm`, `cartCheckout` violated §4 folder naming. |
| Avoid vague folder names | `default/`, `HelperComponents/`, `ReuseableComponents/` replaced with `typography/`, `parts/`, `checkout/`. |

Per **`Expanded Vue App Naming Convention.txt`** §2:

| Rule | Application |
|------|-------------|
| Folders use kebab-case | All renamed camelCase folders now comply. |
| Folders describe domain/layer | `checkout/`, `booking-form/`, `analytics-tables/` name the domain, not the mechanism. |

**Phase 2 intentionally did not rename `.vue` files** — that is Phase 3.

---

## Phase 3 — File renames inside `src/components/`

Per naming guidelines §6 (`Base*` primitives, descriptive UI names like `LoadingSpinner`) and Expanded §3 (avoid `*Component`, `*Handler` on Vue files).

### Buttons

| Original | Change | Why |
|----------|--------|-----|
| `ui/buttons/ButtonComponent.vue` | `ui/buttons/PrimaryButton.vue` | Redundant `*Component` suffix; name describes the primary action button variant. |

### Form inputs

| Original | Change | Why |
|----------|--------|-----|
| `ui/form/inputs/InputDefaultComponent.vue` | `ui/form/inputs/BaseTextInput.vue` | Generic text input is a `Base*` form primitive per §6. |
| `ui/form/inputs/InputComponentDashboard.vue` | `ui/form/inputs/DashboardTextInput.vue` | Context-specific dashboard input; drops `*Component`. |
| `ui/form/inputs/InputAuthComponent.vue` | `ui/form/inputs/AuthTextInput.vue` | Auth-scoped text input naming. |
| `ui/form/inputs/CodeInputAuthComponent.vue` | `ui/form/inputs/AuthCodeInput.vue` | OTP/code input; domain noun before control type. |
| `InputComponentDashbaord` (import alias + templates) | `DashboardTextInput` | Typo fix carried through imports and template tags. |

### Spinners

| Original | Change | Why |
|----------|--------|-----|
| `ui/spinner/Spinner.vue` | `ui/spinners/LoadingSpinner.vue` | Descriptive UI element name per §6; plural `spinners/` folder. |
| `ui/spinner/` folder | **Removed** — contents moved to `ui/spinners/` | Single canonical spinner location. |

### Popup / dropdown shells

| Original | Change | Why |
|----------|--------|-----|
| `ui/popup/PopupHandler.vue` | `ui/popup/BasePopupShell.vue` | Coordinating shell primitive; `Handler` suffix reserved for non-Vue classes per Expanded §3. |
| `ui/dropdowns/DropdownHandler.vue` | `ui/dropdowns/DropdownMenu.vue` | Names the UI element, not the mechanism. |

### Typography

| Original | Change | Why |
|----------|--------|-----|
| `ui/typography/Heading.vue` | `ui/typography/BaseHeading.vue` | Base typography primitive per §6. |
| `ui/typography/Paragraph.vue` | `ui/typography/BaseParagraph.vue` | Same. |

### Radio

| Original | Change | Why |
|----------|--------|-----|
| `ui/form/radio/dashboard/Radio.vue` | `ui/form/radio/dashboard/BaseRadio.vue` | Base form control primitive. |

### Booking flow (typo fixes)

| Original | Change | Why |
|----------|--------|-----|
| `ui/form/booking-form/OneOnOneBookinStep1.vue` | `OneOnOneBookingStep1.vue` | `Bookin` → `Booking`. |
| `ui/form/booking-form/OneOnOneBookinStep2.vue` | `OneOnOneBookingStep2.vue` | Same. |

### Dashboard dropdown / theme (typo fixes)

| Original | Change | Why |
|----------|--------|-----|
| `ui/popup/dropdown/dashboard/DefaultDahboardDrowpdown.vue` | `DefaultDashboardDropdown.vue` | `Dahboard` / `Drowpdown` spelling. |
| `ui/popup/dropdown/dashboard/custom-theme-select/CustomeThemeSelect.vue` | `CustomThemeSelect.vue` | `Custome` → `Custom`. |

### Dev demo audit pages

| Original | Change | Why |
|----------|--------|-----|
| `templates/dev/demo-audit/InputComponentDashboardDemo.vue` | `DashboardTextInputDemo.vue` | Mirrors renamed production input. |
| `templates/dev/demo-audit/InputDefaultComponentDemo.vue` | `BaseTextInputDemo.vue` | Mirrors `BaseTextInput`. |
| `templates/dev/demo-audit/CodeInputAuthComponentDemo.vue` | `AuthCodeInputDemo.vue` | Mirrors `AuthCodeInput`. |

### `routeConfig.json` demo route paths

| Route component | New path | Why |
|-----------------|----------|-----|
| Dashboard text input demo | `@/templates/dev/demo-audit/DashboardTextInputDemo.vue` | Follows demo file rename. |
| Base text input demo | `@/templates/dev/demo-audit/BaseTextInputDemo.vue` | Same. |
| Auth code input demo | `@/templates/dev/demo-audit/AuthCodeInputDemo.vue` | Same. |

### Bulk-replace caveat (fixed)

Substring replacement of `InputAuthComponent` inside `CodeInputAuthComponent` briefly produced `CodeAuthTextInput` in three auth/demo files; corrected to `AuthCodeInput` before build.

### Verification

- `npm run build` — passed
- `tests/unit/oneOnOneBookingStepValidation.test.js` — passed (path updated to `OneOnOneBookingStep1.vue`)
- `tests/unit/sectionScanner.test.js` — passed

---

## Phase 4 — Root loose components → `ui/` homes

**Goal:** Eliminate orphan `.vue` files at `src/components/` root; place each in a domain-specific `ui/` folder per architecture §2.6.

### Moves

| Original | Change | Why |
|----------|--------|-----|
| `src/components/Cart.vue` | `src/components/ui/cart/Cart.vue` | Cart sidebar is cart-domain UI, not a top-level component root. |
| `src/components/NavBar.vue` | `src/components/misc/NavBar.vue` | Dev-only route navigation scaffold; belongs with other non-domain misc widgets (`NotFound.vue`). |
| `src/components/AvatarSelector.vue` | `src/components/ui/profile/AvatarSelector.vue` | Profile avatar picker used by `AvatarUploadPopup`. |
| `src/components/BackgroundSelector.vue` | `src/components/ui/profile/BackgroundSelector.vue` | Profile background picker; same domain as avatar selector. |
| `src/components/EditProfileMenu.vue` | `src/components/ui/profile/EditProfileMenu.vue` | Edit-profile action menu; profile-domain UI. |
| `src/components/UploadingProgressBar.vue` | `src/components/ui/progress/UploadingProgressBar.vue` | Reusable upload progress indicator; descriptive `progress/` folder. |
| `src/components/BookingMoreOptionsDropdown.vue` | `src/components/ui/dropdowns/booking/BookingMoreOptionsDropdown.vue` | Booking call options menu; lives with other dropdown primitives. |
| `src/components/BookingAdjustmentPopup.vue` | `src/components/ui/popup/booking/BookingAdjustmentPopup.vue` | Booking cancel/reschedule popup; popup domain folder. |
| `src/components/YesNoGroup.vue` | `src/components/forms/inputs/YesNoGroup.vue` | Boolean toggle input group; form primitive (currently unused). |
| `src/components/DashProfileSettings.vue` | `src/components/ui/nav/dashboard/DashProfileSettings.vue` | Dashboard settings nav panel; belongs under `ui/nav/dashboard/`. |

### Internal fix during move

| Original | Change | Why |
|----------|--------|-----|
| `import { settingConfig } from '../assets/data/settingConfig.js'` | `import { settingConfig } from '@/assets/data/settingConfig.js'` | Relative path broke after leaving `src/components/` root; alias is stable. |

### Top-level `src/components/` after Phase 4

```text
calendar/  icons/  layout/  misc/  ui/
```

No loose `.vue` files remain at the `src/components/` root.

### Stale duplicate cleanup (carried from Phases 1–3, confirmed deleted)

Orphan copies left on disk after earlier moves were removed from git:

- `components/auth/`, `components/contact/`, `components/checkbox/`, `components/dashboard/`, `components/demoAuditComponents/`
- Legacy roots: `input/`, `button/`, `datePicker/`, `default/`, `dropdownHandler/`, `mediaCardsVariations/`
- Stale `ui/` duplicates: `form/BookingForm/`, `popup/ReuseableComponents/`, `popup/PopupHandler.vue`, `spinner/Spinner.vue`, `table/dashboard/analyticsDashboardTables/`, `global/*/HelperComponents/`
- Stale camelCase popup folders: `buyNow/`, `cartCheckout/`, `customThemeSelect/`

Canonical paths from Phases 2–3 (`booking-form/`, `checkout/`, `parts/`, `spinners/`, `analytics-tables/`, etc.) are the only copies referenced by imports.

### Verification

- `npm run build` — passed
- `tests/unit/oneOnOneBookingStepValidation.test.js` — passed
- `tests/unit/sectionScanner.test.js` — passed

---

## Phase 5 — `src/templates/` naming

Per naming guidelines §7 (`*Page.vue`, `*Layout.vue`, role-first dashboard pages, `Shared` on shared chrome).

### Folder rename

| Original | Change | Why |
|----------|--------|-----|
| `templates/editProfile/` | `templates/edit-profile/` | Folders must be kebab-case per §4. |

### Removed junk

| Original | Change | Why |
|----------|--------|-----|
| `edit-profile/fake.vue` | **Deleted** | Placeholder file with no route or import references. |
| `dashboard/shared/dashboardOverviewCreator.vue` | **Deleted** | camelCase stub duplicating `page/creator/DashboardOverviewCreator.vue`. |

### Auth layout

| Original | Change | Why |
|----------|--------|-----|
| `auth/AuthWrapper.vue` | `auth/AuthLayout.vue` | Layouts use `*Layout.vue` per §7. |
| `Auth.js` export `AuthWrapper` | export `AuthLayout` | Barrel matches layout rename. |

### Dashboard shared chrome

| Original | Change | Why |
|----------|--------|-----|
| `dashboard/HeaderResponsive.vue` | `dashboard/DashboardSharedHeader.vue` | Shared dashboard chrome should include `Shared` per §7. |
| `dashboard/DashboardSidebar.vue` | `dashboard/DashboardSharedSidebar.vue` | Same. |
| `dashboard/DashboardFooter.vue` | `dashboard/DashboardSharedFooter.vue` | Same. |
| `dashboard/DashboardWrapper.vue` | `dashboard/DashboardLayout.vue` | Layout shell naming. |
| `shared/DashboardWrapperTwoColContainer.vue` | `shared/DashboardSharedTwoColLayout.vue` | Two-col layout primitive. |
| `shared/DashboardSectionContainer.vue` | `shared/DashboardSharedSectionLayout.vue` | Section layout wrapper. |
| `shared/DashboardTwoColInnerContainerWrapper.vue` | `shared/DashboardSharedTwoColInnerLayout.vue` | Inner layout wrapper. |
| `shared/DashboardWrapperMain.vue` | `shared/DashboardSharedMainLayout.vue` | Main area layout. |
| `shared/Dashboard.vue` | `shared/DashboardPlaceholderPage.vue` | Route placeholder, not a layout. |

### Contact shared layouts

| Original | Change | Why |
|----------|--------|-----|
| `contact/shared/ContactWrapperMain.vue` | `ContactSharedMainLayout.vue` | Shared contact layout parts. |
| `contact/shared/ContactWrapperTwoColContainer.vue` | `ContactSharedTwoColLayout.vue` | Same. |
| `contact/shared/ContactTwoColInnerContainerWrapper.vue` | `ContactSharedTwoColInnerLayout.vue` | Same. |

### Section route pages (`*Wrapper` → `*Page`)

| Original | Change | Why |
|----------|--------|-----|
| `about/AboutWrapper.vue` | `about/AboutPage.vue` | Route-level templates use `*Page.vue`. |
| `contact/ContactWrapper.vue` | `contact/ContactPage.vue` | Same. |
| `discover/DiscoverWrapper.vue` | `discover/DiscoverPage.vue` | Same. |
| `shop/ShopWrapper.vue` | `shop/ShopPage.vue` | Same. |
| `home/HomeWrapper.vue` | `home/HomePage.vue` | Same. |
| `settings/Settings.vue` | `settings/SettingsPage.vue` | Same. |

### Auth route pages (thin wrappers in `auth/page/`)

| Original | Change | Why |
|----------|--------|-----|
| `AuthLogIn.vue` | `LoginPage.vue` | Route page naming; screen stays `auth/components/AuthLogIn.vue`. |
| `AuthSignUp.vue` | `SignUpPage.vue` | Same pattern. |
| `AuthLostPassword.vue` | `LostPasswordPage.vue` | Same. |
| `AuthResetPassword.vue` | `ResetPasswordPage.vue` | Same. |
| `AuthConfirmEmail.vue` | `ConfirmEmailPage.vue` | Same. |
| `AuthGoogle.vue` | `GoogleAuthPage.vue` | OAuth callback route pages. |
| `AuthFacebook.vue` | `FacebookAuthPage.vue` | Same. |
| `AuthTwitter.vue` | `TwitterAuthPage.vue` | Same. |
| `AuthTelegram.vue` | `TelegramAuthPage.vue` | Same. |
| `AuthSignUpOnboardingKycCallback.vue` | `SignUpOnboardingKycCallbackPage.vue` | Same. |
| `AuthSignUpOnboardingCreator.vue` | `CreatorSignUpOnboardingPage.vue` | Role-first page naming. |
| `AuthSignUpOnboardingKycCreator.vue` | `CreatorSignUpOnboardingKycPage.vue` | Same. |
| `AuthSignUpOnboardingKycStatusCreator.vue` | `CreatorSignUpOnboardingKycStatusPage.vue` | Same. |

### Dashboard route pages (role-first `*Page.vue`)

Pattern: `Dashboard{Feature}{Role}.vue` → `{Role}Dashboard{Feature}Page.vue`; cross-role `Dashboard{Feature}.vue` → `Dashboard{Feature}Page.vue`.

Examples:

| Original | Change |
|----------|--------|
| `DashboardSettingsCreator.vue` | `CreatorDashboardSettingsPage.vue` |
| `DashboardSettingsFan.vue` | `FanDashboardSettingsPage.vue` |
| `DashboardOverviewCreator.vue` | `CreatorDashboardOverviewPage.vue` |
| `Dashboard.vue` (dev playground) | `DashboardDevPlaygroundPage.vue` |
| `DashboardPageRole.vue` | `DashboardRolePlaceholderPage.vue` |
| `DemoChats.vue` | `DemoChatsPage.vue` |
| `SocialLinkingDemo.vue` | `SocialLinkingDemoPage.vue` |

All **52** dashboard `page/**/*.vue` route files renamed; `routeConfig.json` paths updated.

### Intentionally unchanged

| Item | Why |
|------|-----|
| `auth/components/AuthLogIn.vue` etc. | Screen compositions; route wrappers renamed instead. |

### Verification

- `npm run build` — passed
- `tests/unit/sectionScanner.test.js` — passed (updated `DashboardSharedSidebar` assertion)
- `tests/unit/componentTranslationLoads.test.js` — pre-existing failure (`DashboardSharedSidebar.vue` calls `loadTranslationsForSection`)

---

## Phase 5.1 — Layer violations, profile migration, and store/misc cleanup

Follow-up pass after Phase 5 review: fix components importing templates, migrate deferred `profileAbdullah/`, and align misc/store naming.

### Layer violation fix (components must not import templates)

| Original | Change | Why |
|----------|--------|-----|
| `MediaUploader.vue` wrapped in `DashboardSharedTwoColLayout` | Layout removed from component; new `misc/MediaUploaderPage.vue` template wrapper | Components layer must not depend on `src/templates/` per architecture §2. |
| `UnifiedBookingForm.vue` wrapped in `DashboardSharedTwoColLayout` | Layout removed from component; new `dev/UnifiedBookingFormPage.vue` template wrapper | Same. |
| `/MediaUploader` route `componentPath` | `@/templates/misc/MediaUploaderPage.vue` | Route points at template page, not bare component. |
| `/dev/bookingform` route `componentPath` | `@/templates/dev/UnifiedBookingFormPage.vue` | Same. |

### Profile folder migration (`profileAbdullah/` → `profile/`)

| Original | Change | Why |
|----------|--------|-----|
| `templates/profileAbdullah/` (entire folder) | `templates/profile/` | Remove personal-name folder; align with section key `profile`. |
| `profileAbdullah/ProfileWrapper.vue` | `profile/ProfilePage.vue` | Route-level templates use `*Page.vue` per §7. |
| `ProfileHeaderOptionbuttons.vue` | `ProfileHeaderOptionButtons.vue` | Fix `buttons` → `Buttons` typo. |
| All `profileAbdullah` import/path references | `profile` | Mechanical path updates across `src/`, `tests/`, `build/`, `docs/`. |
| Profile route `componentPath` | `@/templates/profile/ProfilePage.vue` | Route config matches new page name. |

### Misc and store naming

| Original | Change | Why |
|----------|--------|-----|
| `misc/NotFound.vue` | `misc/NotFoundPage.vue` | Route-level 404 template uses `*Page.vue`. |
| `notFoundComponentLoader.js` import path | `NotFoundPage.vue` | Loader matches renamed page. |
| `useCartStore.setCartAction` | `syncCartBundle` | Pipeline hydration uses `sync` verb; `*Action` is vague per §18. |
| `flowRegistry.js` cart pinia actions (11 refs) | `syncCartBundle` | Flow registry matches store action rename. |

### Verification

- `npm run build` — passed (after removing stray `</DashboardSharedTwoColLayout>` in `UnifiedBookingForm.vue`)
- `tests/unit/sectionScanner.test.js` — passed
- `tests/unit/jsonConfigValidator.test.js` — passed (`ProfilePage.vue` path in fixture)

---

## Phase 5.2 — Review follow-up: folder and function naming

Follow-up pass after senior review: close remaining naming concerns in the reviewed `src/stores`, `src/templates`, and `src/components` scope.

### Remaining kebab-case folder fixes

| Original | Change | Why |
|----------|--------|-----|
| `components/ui/popup/PayoutSettingsSteps/` | `components/ui/popup/payout-settings-steps/` | Folders must be kebab-case per architecture §4 / Expanded §2. |
| `components/ui/popup/WithdrawEarningsSteps/` | `components/ui/popup/withdraw-earnings-steps/` | Same. |
| `templates/profile/views/TopUpSteps/` | `templates/profile/views/top-up-steps/` | Same. |
| `templates/profile/views/TipComponents/` | `templates/profile/views/tip-components/` | Same. |
| `templates/profile/views/TipTokenSteps/` | `templates/profile/views/tip-token-steps/` | Same. |

### Store reset correctness

| Original | Change | Why |
|----------|--------|-----|
| `resetAnalyticsState()` manually reset only part of analytics state | Added `createInitialDashboardAnalyticsState()` and reused it for both `state` and `resetAnalyticsState()` | Reset now restores the full analytics state shape, including earnings, fans, likes, contributors, trending data, countries, fan insights, recent orders, `alltime`, metadata, and flags. |

### Function and action naming verification

Per Expanded §7–§8, function and method names should be camelCase and start with a verb.

| Area | Name(s) verified or changed | Result |
|------|-----------------------------|--------|
| Analytics mapper | `calculatePeriodChangePercent`, `findLatestNonZeroEntry`, `mapSubscriptionsPeriod`, `mapSubscriptionsBundle`, `mapEarningsBundle`, `mapFanInsightsPeriod`, `mapFansFromFanInsights`, `mapRawFanInsights`, `mapLikesSummary`, `mapTrendingCountries`, `buildSubscriberInsights`, `buildEarningsInsights`, `mapAnalyticsBundleResponse` | Verb-led camelCase; mapper functions use `map*`, lookup uses `find*`, derivations use `calculate*` / `build*`. |
| Analytics store | `normalizeDashboardAnalyticsAfterRestore`, `applyMappedAnalyticsState`, `createInitialDashboardAnalyticsState`, `syncAnalyticsBundle`, `resetAnalyticsState` | Verb-led camelCase; state alignment uses `sync*`, reset uses `reset*`. |
| Analytics validator | `validateAnalyticsBundleIntegrity`; local callbacks `warn` / `ok` renamed to `logBundleWarning` / `logBundleSectionPresent` | Validator entry uses `validate*`; local log helpers now have explicit verb phrases. |
| Chat store | `addMessageAction` → `syncChatMessage`; `prependMessagesAction` → `syncChatHistoryPage` | Removed vague `*Action` suffix; pipeline-facing state alignment now uses `sync*`. |
| Flow registry and chat templates | Updated chat pinia destinations and direct store calls to `syncChatMessage` / `syncChatHistoryPage` | Consumers match renamed store actions. |

### Verification

- Focused search found no remaining references to `PayoutSettingsSteps`, `WithdrawEarningsSteps`, `TopUpSteps`, `TipComponents`, or `TipTokenSteps` under `src/`.
- Focused search found no remaining `*Action` store methods under `src/stores/`.

---

## Phase 6 — Template structure alignment (dashboard tree + `views/`)

Per architecture §1 target tree (`dashboard/{creator,fan,agent,vendor,shared}/`) and to avoid `templates/.../components/` clashing with `src/components/`.

### Dashboard flatten (`page/` removed)

| Original | Change | Why |
|----------|--------|-----|
| `dashboard/page/creator/` | `dashboard/creator/` | Role folders sit directly under `dashboard/` per §1. |
| `dashboard/page/fan/` | `dashboard/fan/` | Same. |
| `dashboard/page/agent/` | `dashboard/agent/` | Same. |
| `dashboard/page/vendor/` | `dashboard/vendor/` | Same. |
| `dashboard/page/role/` | `dashboard/role/` | Cross-role route pages. |
| `dashboard/page/demo/` | `dashboard/demo/` | Dev dashboard routes. |
| `dashboard/page/` | **Removed** | Redundant layer vs guideline tree. |

### Dashboard shared chrome (root → `shared/`)

| Original | Change | Why |
|----------|--------|-----|
| `dashboard/DashboardLayout.vue` | `dashboard/shared/DashboardLayout.vue` | Layout shells belong in `shared/`. |
| `dashboard/DashboardSharedHeader.vue` | `dashboard/shared/DashboardSharedHeader.vue` | Shared chrome per §7 `*Shared*`. |
| `dashboard/DashboardSharedSidebar.vue` | `dashboard/shared/DashboardSharedSidebar.vue` | Same. |
| `dashboard/DashboardSharedFooter.vue` | `dashboard/shared/DashboardSharedFooter.vue` | Same. |

### `components/` → `views/` under templates

| Original | Change | Why |
|----------|--------|-----|
| `auth/components/` | `auth/views/` | Page screen bodies; name avoids collision with `src/components/`. |
| `profile/components/` | `profile/views/` | Same. |

### Import fixes after moves

| File | Fix |
|------|-----|
| `shared/DashboardSharedTwoColLayout.vue` | Relative sidebar import `../` → `./` (same folder). |
| `shared/DashboardSharedSidebar.vue` | `menuItems` import → `@/assets/data/menuItems.js` (depth changed under `shared/`). |
| `profile/popups/ProfileSubscriptionPopup.vue` | `../components/` → `../views/`. |

### Consumers updated

- `src/router/routeConfig.json` — all `dashboard/page/*` paths → `dashboard/{role}/*`
- Tests, section scanner, and template imports — mechanical path updates

### Verification

- `npm run build` — passed
- `tests/unit/sectionScanner.test.js` — passed
- `tests/unit/routeComponentPathValidator.test.js` — passed
- `tests/unit/oneOnOneBookingStepValidation.test.js` — passed

---

## Phase 6 — `src/components/` folder cleanup

Naming audit follow-up: relocate vague folders, normalize card/dropdown structure, fix JS module casing. **`components/misc/` kept** as migration anchor (README only).

### `components/misc/` → domain homes

| Original | Change | Why |
|----------|--------|-----|
| `misc/NavBar.vue` | `layout/dev/DevNavBar.vue` | Dev route scaffold belongs under layout, not vague `misc/`. |
| `misc/NotFound.vue` | `layout/NotFoundPlaceholder.vue` | Reusable 404 placeholder; route page stays `templates/misc/NotFoundPage.vue`. |
| `misc/` (folder) | **Kept** with `README.md` | User decision — anchor folder documents relocations. |

### `ui/global/` → domain folders

| Original | Change | Why |
|----------|--------|-----|
| `ui/global/media/` | `components/media/` | `global` is vague; media is a first-class domain per guidelines §2. |
| `ui/global/plan/` | `components/plan/` | Same. |
| `ui/global/` | **Removed** (empty after moves) | Eliminate vague parent folder. |

### `ui/popup/dropdown/` split by responsibility

| Original | Change | Why |
|----------|--------|-----|
| `popup/dropdown/dashboard/NavDropDown.vue` | `ui/nav/dashboard/NavDropdown.vue` | Slide-in nav menu is nav chrome, not a dropdown; fix `DropDown` casing. |
| `popup/dropdown/dashboard/custom-theme-select/UnifiedSelect.vue` | `ui/dropdowns/select/UnifiedSelect.vue` | Reusable select belongs in `ui/dropdowns/` per §36.8. |
| `popup/dropdown/dashboard/custom-theme-select/CustomThemeSelect.vue` | `ui/dropdowns/select/CustomThemeSelect.vue` | Same. |
| `popup/dropdown/dashboard/DefaultDashboardDropdown.vue` | `ui/dropdowns/dashboard/DefaultDashboardDropdown.vue` | Dashboard dropdown demo with other dropdown primitives. |
| Ghost duplicates (`customThemeSelect/`, `DefaultDahboardDrowpdown.vue`, etc.) | **Deleted** | Unused typo/legacy copies after move. |

### `ui/card/` normalization

| Original | Change | Why |
|----------|--------|-----|
| `ui/card/AnalyticsMainCardWrapper.vue` | `ui/card/dashboard/AnalyticsMainCardWrapper.vue` | All dashboard cards in one subfolder. |
| `ui/card/DashboardOrderCard.vue` | `ui/card/dashboard/DashboardOrderCard.vue` | Same. |
| `ui/card/DashboardTrendCard.vue` | `ui/card/dashboard/DashboardTrendCard.vue` | Same. |
| `ui/content/DashboardTrendContent.vue` | `ui/card/dashboard/DashboardTrendContent.vue` | Trend empty-state is card content; `content/` folder removed. |

### JS module rename

| Original | Change | Why |
|----------|--------|-----|
| `dropdowns/dropdown-helpers.js` | `dropdowns/dropdownLayoutUtils.js` | JS modules use `camelCase.js`; `helpers` is vague per §36.5. |

### Verification

- `npm run build` — passed
- `tests/unit/sectionScanner.test.js` — passed
- `tests/unit/jsonConfigValidator.test.js` — passed

---

## Remaining template work (deferred)

- Auth screen renames (`AuthLogIn.vue` → `LoginScreen.vue`, etc.)
- Flatten `auth/page/role/` → `auth/` (optional, same pattern as dashboard)
- Fix pre-existing `componentTranslationLoads` violation in `DashboardSharedSidebar.vue`
