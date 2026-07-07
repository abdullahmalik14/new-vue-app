# Dashboard Demo Page — Component Audit Report

**Project:** VueApp (Section-Based Architecture)  
**Route audited:** `/dashboard/demo-page`  
**Report date:** June 25, 2026  
**Prepared for:** Client audit review  
**Reference documents:**
- `vue-app-architecture-naming-guidelines.md`
- `Expanded Vue App Naming Convention.txt`

---

## 1. Executive Summary

All **user-facing components** rendered on the Dashboard Demo Page have been reviewed and remediated against the architecture and naming guidelines. Each listed component now follows the agreed patterns for **i18n**, **assetMap**, **naming**, **event naming** (where applicable), and **demo wrapper structure**.

Production build verification: **`npm run build` — PASS**

**Component count finalized:** **59 components** (direct + nested on demo page)

---

## 2. Audit Scope

### In scope
- Every Vue component that renders live UI on `/dashboard/demo-page`
- Nested components inside demo wrapper sections (`*Demo.vue` files)
- Shared demo utilities used on the page (`ShowCodeToggle`, `DemoSectionHeader`)
- Locale files: `src/i18n/section-dashboard-global/` + `public/i18n/section-dashboard-global/` (en + vi)
- Asset registry: `src/config/assetMap.json` + `public/config/assetMap.json`


## 3. Audit Criteria Applied

| Criterion | Requirement | Status |
|-----------|-------------|--------|
| **i18n** | No hardcoded user-facing English in component templates | ✅ Applied |
| **assetMap** | No hardcoded external image URLs; use `useAssetUrl()` / `getAssetUrl()` | ✅ Applied |
| **Naming** | PascalCase components; kebab-case folders; corrected typos (`reusable`, `MediaUploaderSearchInput`) | ✅ Applied |
| **Constants** | Demo config uses `UPPER_SNAKE_CASE` where applicable | ✅ Applied |
| **Events** | Custom emits use kebab-case domain-prefixed names | ✅ Applied (see §5) |
| **Demo wrappers** | Section components wrapped in thin `*Demo.vue` with `DemoSectionHeader` + i18n title | ✅ Applied |
| **Composables** | Demo data/logic in composables; not `use*` for non-composable class files | ✅ Applied |
| **Production i18n** | `@` escaped as `{'@'}` in JSON locale files | ✅ Applied (en + vi) |

---

## 4. Finalized Component Inventory

### 4.1 Media & Cards (4)

| # | Component | File path (relative to `vuemain/src`) | Status |
|---|-----------|----------------------------------------|--------|
| 1 | MediaCardV1 | `components/ui/media/media-cards/MediaCardV1.vue` | ✅ Finalized |
| 2 | MediaCardV2 | `components/ui/media/media-cards/MediaCardV2.vue` | ✅ Finalized |
| 3 | TierCard | `components/ui/card/dashboard/TierCard.vue` | ✅ Finalized |
| 4 | EventCard | `components/ui/card/dashboard/EventCard.vue` | ✅ Finalized |

### 4.2 Forms & Typography (4)

| # | Component | File path | Status |
|---|-----------|-----------|--------|
| 5 | DashboardTextInput | `components/forms/inputs/DashboardTextInput.vue` | ✅ Finalized |
| 6 | BaseHeading | `components/ui/typography/BaseHeading.vue` | ✅ Finalized |
| 7 | BaseParagraph | `components/ui/typography/BaseParagraph.vue` | ✅ Finalized |
| 8 | RadioGroup | `components/forms/radio/dashboard/RadioGroup.vue` | ✅ Finalized |

### 4.3 Form / Interaction Demos (6)

| # | Component | File path | Demo wrapper | Status |
|---|-----------|-----------|--------------|--------|
| 9 | CheckboxGroup | `components/forms/checkboxes/CheckboxGroup.vue` | CheckboxGroupDemo | ✅ Finalized |
| 10 | CheckboxSwitch | `components/forms/checkboxes/CheckboxSwitch.vue` | CheckboxSwitchDemo | ✅ Finalized |
| 11 | ActionMenuDropdown | `dev/components/ui/dropdowns/ActionMenuDropdown.vue` | ActionMenuDropdownDemo | ✅ Finalized |
| 12 | BookingAdjustmentPopup | `dev/components/ui/popups/booking/BookingAdjustmentPopup.vue` | ActionMenuDropdownDemo | ✅ Finalized |
| 13 | DropdownTooltipIcon | `components/ui/dropdowns/DropdownTooltipIcon.vue` | CheckboxGroupDemo | ✅ Finalized |
| 14 | NotificationCard | `components/ui/card/dashboard/NotificationCard.vue` | NotificationCardDemo | ✅ Finalized |

### 4.4 Calendar Chat (4)

| # | Component | File path | Demo wrapper | Status |
|---|-----------|-----------|--------------|--------|
| 15 | NewMessage | `dev/components/calendar/NewMessage.vue` | CalendarChatDemo | ✅ Finalized |
| 16 | ChatSection | `dev/components/calendar/ChatSection.vue` | CalendarChatDemo | ✅ Finalized |
| 17 | AdjustCostBooking | `dev/components/calendar/AdjustCostBooking.vue` | CalendarChatDemo | ✅ Finalized |
| 18 | CallSoonChat | `dev/components/calendar/CallSoonChat.vue` | CalendarChatDemo | ✅ Finalized |

### 4.5 Checkout Reusable (12)

| # | Component | File path | Demo wrapper | Status |
|---|-----------|-----------|--------------|--------|
| 19 | CheckoutMediaPreview | `dev/components/checkout/reusable/CheckoutMediaPreview.vue` | CheckoutReusableComponentsDemo | ✅ Finalized |
| 20 | SectionHeader | `dev/components/checkout/reusable/SectionHeader.vue` | CheckoutReusableComponentsDemo | ✅ Finalized |
| 21 | SectionToggleHeader | `dev/components/checkout/reusable/SectionToggleHeader.vue` | CheckoutReusableComponentsDemo | ✅ Finalized |
| 22 | OrderSummary | `dev/components/checkout/reusable/OrderSummary.vue` | CheckoutReusableComponentsDemo | ✅ Finalized |
| 23 | PaymentMethodLoggedIn | `dev/components/checkout/reusable/PaymentMethodLoggedIn.vue` | CheckoutReusableComponentsDemo | ✅ Finalized |
| 24 | PaymentMethodNotLoggedIn | `dev/components/checkout/reusable/PaymentMethodNotLoggedIn.vue` | CheckoutReusableComponentsDemo | ✅ Finalized |
| 25 | AddressCard | `dev/components/checkout/reusable/AddressCard.vue` | CheckoutReusableComponentsDemo | ✅ Finalized |
| 26 | SubscriptionPlanCard | `dev/components/checkout/reusable/SubscriptionPlanCard.vue` | CheckoutReusableComponentsDemo | ✅ Finalized |
| 27 | CheckoutNotes | `dev/components/checkout/reusable/CheckoutNotes.vue` | CheckoutReusableComponentsDemo | ✅ Finalized |
| 28 | TotalAmountRow | `dev/components/checkout/reusable/TotalAmountRow.vue` | CheckoutReusableComponentsDemo | ✅ Finalized |
| 29 | BasePlanDropdown | `dev/components/plan/parts/BasePlanDropdown.vue` | CheckoutReusableComponentsDemo | ✅ Finalized |

**Supporting composable:** `dev/composables/useCheckoutDemoAssets.js`  
**Demo config i18n namespace:** `demo.checkoutReusable.*`

### 4.6 Media Uploader Parts (14)

| # | Component | File path | Demo wrapper | Status |
|---|-----------|-----------|--------------|--------|
| 30 | MediaUploaderSearchInput | `dev/components/media/uploader/parts/MediaUploaderSearchInput.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 31 | PublishDatePicker | `dev/components/media/uploader/parts/PublishDatePicker.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 32 | PostPreview | `dev/components/media/uploader/parts/PostPreview.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 33 | SocialCustomPreview | `dev/components/media/uploader/parts/SocialCustomPreview.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 34 | ThumbnailUploader | `dev/components/media/uploader/parts/ThumbnailUploader.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 35 | ThumbnailUploaderNay | `dev/components/media/uploader/parts/ThumbnailUploaderNay.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 36 | VideoThumbnailSelector | `dev/components/media/uploader/parts/VideoThumbnailSelector.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 37 | ThumbnailSelector | `dev/components/media/uploader/parts/ThumbnailSelector.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 38 | BlurEffect | `dev/components/media/uploader/parts/BlurEffect.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 39 | UploadThumbnailPreview | `dev/components/media/uploader/parts/UploadThumbnailPreview.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 40 | SystemGeneratedImage | `dev/components/media/uploader/parts/SystemGeneratedImage.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 41 | UploadYourOwnTrailer | `dev/components/media/uploader/parts/UploadYourOwnTrailer.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 42 | FileUploadPlaceholder | `dev/components/media/uploader/parts/FileUploadPlaceholder.vue` | MediaUploaderComponentsDemo | ✅ Finalized |
| 43 | TrailerSetting | `dev/components/media/uploader/parts/TrailerSetting.vue` | MediaUploaderComponentsDemo | ✅ Finalized |

**Rename note:** `ReusableSearchInput` → `MediaUploaderSearchInput`  
**Supporting composables:** `useMediaUploaderDemo.js`, `useMediaUploaderAssets.js`  
**Demo config i18n namespace:** `demo.mediaUploaderComponents.*`

### 4.7 Profile, Orders & Subscription (6)

| # | Component | File path | Demo wrapper | Status |
|---|-----------|-----------|--------------|--------|
| 44 | DashProfileSettings | `dev/components/ui/nav/dashboard/DashProfileSettings.vue` | DashProfileSettingsDemo | ✅ Finalized |
| 45 | OrdersPremiumTable | `dev/components/ui/table/dashboard/OrdersPremiumTable.vue` | OrdersPremiumTableDemo | ✅ Finalized |
| 46 | FlexTable | `dev/components/ui/table/FlexTable.vue` | OrdersPremiumTableDemo | ✅ Finalized |
| 47 | DashboardTabs | `components/ui/nav/dashboard/DashboardTabs.vue` | OrdersPremiumTableDemo | ✅ Finalized |
| 48 | OrdersTableSearchInput | `dev/components/ui/table/dashboard/OrdersTableSearchInput.vue` | OrdersPremiumTableDemo | ✅ Finalized |
| 49 | SubscriptionCard | `dev/components/profile/SubscriptionCard.vue` | SubscriptionCardsDemo | ✅ Finalized |

**Supporting config:** `dev/assets/data/subscriptionCardsDemoConfig.js` (`UPPER_SNAKE_CASE` constants)

### 4.8 UI Misc (7)

| # | Component | File path | Status |
|---|-----------|-----------|--------|
| 50 | UploadingProgressBar | `components/ui/progress/UploadingProgressBar.vue` | ✅ Finalized |
| 51 | CloudflareSuccess | `dev/components/ui/badge/dashboard/CloudflareSuccess.vue` | ✅ Finalized |
| 52 | Cookies | `components/ui/badge/dashboard/Cookies.vue` | ✅ Finalized |
| 53 | Cart | `components/ui/cart/Cart.vue` | ✅ Finalized |
| 54 | LoadingSpinner | `components/ui/spinners/LoadingSpinner.vue` | ✅ Finalized |
| 55 | DashboardPrimaryButton | `components/ui/buttons/DashboardPrimaryButton.vue` | ✅ Finalized |
| 56 | TwoPieceButton | `components/ui/buttons/TwoPieceButton.vue` | ✅ Finalized |

**i18n namespaces added:** `cart.*`, `cookies.*`, `cloudflareSuccess.*`  
**assetMap keys added:** `cart.demo.*`, checkout demo keys, media uploader keys

### 4.9 Demo Infrastructure (2)

| # | Component | File path | Status |
|---|-----------|-----------|--------|
| 57 | ShowCodeToggle | `dev/templates/demo/ShowCodeToggle.vue` | ✅ Finalized |
| 58 | DemoSectionHeader | `dev/templates/demo/DemoSectionHeader.vue` | ✅ Finalized |

### 4.10 Demo Page Shell (1)

| # | Component | File path | Status |
|---|-----------|-----------|--------|
| 59 | DemoPage | `dev/templates/demo/DemoPage.vue` | ✅ Finalized (inline sections use i18n; section wrappers extracted where applicable) |

---

## 5. Key Remediations Summary

### Naming & structure
- Folder rename: `checkout/reuseable/` → `checkout/reusable/`
- Component rename: `ReusableSearchInput` → `MediaUploaderSearchInput`
- Demo wrappers added: `DashProfileSettingsDemo`, `OrdersPremiumTableDemo`, `CheckoutReusableComponentsDemo`, `MediaUploaderComponentsDemo`, etc.
- i18n key renames: `demo.checkoutReuseable` → `demo.checkoutReusable`, `demo.mediaUploaderHelper` → `demo.mediaUploaderComponents`

### i18n
- All demo page live UI text moved to `section-dashboard-global` locale files (en + vi)
- Synced to both `src/i18n/` and `public/i18n/`
- `@` symbols in JSON escaped as `{'@'}` for vue-i18n linked format compatibility

### assetMap
- Removed invalid `i.ibb.co.com` hostnames; corrected to `i.ibb.co`
- Checkout, cart, media uploader, and notification assets centralized in `assetMap.json`
- Components use `useAssetUrl()` / `useCheckoutDemoAssets()` / `useMediaUploaderAssets()`

### Event naming (kebab-case)
| Component | Old emit | New emit |
|-----------|----------|----------|
| PaymentMethodLoggedIn | `remove`, `chosen` | `card-remove`, `card-chosen` |
| AddressCard | `edit` | `address-edit` |
| SectionHeader | `close` | `section-close` |
| FileUploadPlaceholder | `click` | `placeholder-click` |
| SocialCustomPreview | `delete` | `preview-delete` |

### Production fixes (pre-audit)
- i18n `@` linked format errors (production SyntaxError code 10)
- assetMap hostname corrections for Vercel deployment

---

## 6. Demo Wrapper Files (for client cross-reference)

| Demo wrapper | Section on demo page |
|--------------|---------------------|
| `CheckboxGroupDemo.vue` | CheckboxGroup |
| `CheckboxSwitchDemo.vue` | CheckboxSwitch |
| `RadioGroupDemo.vue` | RadioGroup |
| `ActionMenuDropdownDemo.vue` | ActionMenuDropdown |
| `NotificationCardDemo.vue` | NotificationCard |
| `CalendarChatDemo.vue` | Calendar chat (4 components) |
| `CheckoutReusableComponentsDemo.vue` | Checkout reusable (12 components) |
| `MediaUploaderComponentsDemo.vue` | Media uploader parts (14 components) |
| `DashProfileSettingsDemo.vue` | DashProfileSettings |
| `OrdersPremiumTableDemo.vue` | OrdersPremiumTable |
| `SubscriptionCardsDemo.vue` | SubscriptionCard |

**Location:** `vuemain/src/dev/templates/demo/demo-audit/`

---

## 7. Client Verification Checklist

To independently verify this audit:

1. **Run the app:** `npm run dev` → open `http://localhost:5173/dashboard/demo-page`
2. **Build:** `npm run build` (must pass with zero errors)
3. **i18n:** Switch locale en ↔ vi; confirm all section labels and component text translate
4. **assetMap:** DevTools Network tab — no requests to `i.ibb.co.com` or hardcoded `fansocial.app` icon URLs on demo page
5. **Grep checks (optional):**
   - No `checkoutReuseable` or `mediaUploaderHelper` keys in source
   - No hardcoded `https://` in finalized component templates under demo scope
6. **Reference docs:** Cross-check naming against `vue-app-architecture-naming-guidelines.md` and `Expanded Vue App Naming Convention.txt`

---

## 8. Known Non-Blocking Notes

| Item | Note |
|------|------|
| Show Code snippets | Some `demoSnippets` strings in `DemoPage.vue` still show hardcoded English in copy-paste code blocks only — not live UI |
| ThumbnailUploaderNay | External uploader scripts gated behind `enableExternalScripts` prop (default `false` on demo) |
| Standalone audit routes | Not on demo page; not included in this report |
| DemoPage.vue size | ~1,600 lines; optional future extraction of remaining inline sections |

---

## 9. Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Client reviewer | | | |

---

*End of report*
