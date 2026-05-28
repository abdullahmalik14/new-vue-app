# Translation System Audit

**Date:** 2026-05-27  
**Scope:** Full i18n / locale pipeline — `localeManager.js`, `translationLoader.js`, `i18nInstance.js`, `useLocaleStore.js`, `LanguageSwitcher.vue`, `main.js`, `router/index.js`, and all `public/i18n/` translation assets.  
**Library:** `vue-i18n` v11.1.11 (Composition API mode), `pinia-plugin-persistedstate` v4.5.0  

---

## Accepted Behaviour

The following are **intentional and not flagged as bugs**:

- **Initial English flash before translation loads** — the app bootstraps with `en: {}` and fetches translations lazily. A brief render in English before the locale's JSON arrives is expected and accepted.

---

## Table of Contents

1. [Logical Errors](#1-logical-errors)
2. [Performance Issues](#2-performance-issues)
3. [Security Issues](#3-security-issues)
4. [Best Practice Violations](#4-best-practice-violations)
5. [Missing Features](#5-missing-features)

---

## 1. Logical Errors

---

### L-01 — `setActiveLocale` not awaited in `LanguageSwitcher.vue`

**File:** `src/components/ui/nav/language/LanguageSwitcher.vue` line 188  
**Severity:** High  

`setActiveLocale` is `async` but is called without `await`. The `ok` check on line 189 evaluates the **Promise object** (always truthy), not the resolved boolean. `loadTranslationsForSection` is then called immediately after, before caches are cleared and the locale is set in the i18n instance.

```js
// BUG: missing await — ok is always truthy (it is a Promise)
const ok = setActiveLocale(finalLocale, { updateUrl: true });
if (!ok) { ... }  // never fires

// This runs before setActiveLocale resolves
await loadTranslationsForSection(currentSection.value, finalLocale);
```

**Fix:** Add `await`:

```js
const ok = await setActiveLocale(finalLocale, { updateUrl: true });
```

---

### L-02 — Shallow merge loses nested fallback keys

**File:** `src/utils/translation/translationLoader.js` line 241–244  
**Severity:** High  

When merging English and locale translations, a shallow spread is used:

```js
translations = {
  ...englishTranslations,
  ...localeTranslations
};
```

If the locale file has `{ "auth": { "login": { "title": "Đăng nhập" } } }` and the English file has `{ "auth": { "login": { "title": "…", "subtitle": "…", "button": "…" } } }`, the entire `auth.login` object is replaced by the locale version, losing `subtitle` and `button` in the cached object.

This object is stored in the in-memory `loadedTranslations` Map and the cacheHandler. The `vue-i18n` instance itself is fine because `mergeLocaleMessage` is called separately for both `en` and the target locale with `fallbackLocale: 'en'`, but the **cached return value is broken** and anything that reads from the cache directly will be missing keys.

**Fix:** Use a deep-merge utility instead of a shallow spread for the cached `translations` object.

---

### L-03 — `applyLocaleTemporarily` does not load locale translations

**File:** `src/utils/translation/localeManager.js` lines 800–870  
**Severity:** Medium  

`applyLocaleTemporarily` sets `currentActiveLocale` and updates the i18n instance locale, but does **not** fetch or merge translations for the new locale. It is called from `router/beforeEach` when a URL like `/vi/dashboard` is visited. The router does separately call `loadTranslationsForSection`, so this is not a complete failure, but if `applyLocaleTemporarily` is ever called standalone (e.g. from a future "preview locale" feature), the UI will switch locale labels without the actual strings being present.

**Fix:** Either document clearly that `applyLocaleTemporarily` must always be followed by a translation load, or load translations inside it.

---

### L-04 — `initializeFromBrowser` in `useLocaleStore` is dead code

**File:** `src/stores/useLocaleStore.js` lines 127–171  
**Severity:** Medium  

`initializeFromBrowser` is defined on the Pinia store but is **never called anywhere**. Browser locale detection is handled separately in `localeManager.getBrowserLocale()`. This creates two parallel implementations of the same logic that can drift — e.g. the store version strips to base code only (`split('-')[0]`), losing `zh-tw` or `pt-pt` variants.

**Fix:** Remove `initializeFromBrowser` from the store and consolidate browser-locale detection entirely in `localeManager.js`.

---

### L-05 — `getBrowserLocale` drops regional locale variants

**File:** `src/utils/translation/localeManager.js` line 316  
**Severity:** Medium  

```js
const baseLanguage = browserLanguage.split("-")[0].toLowerCase();
```

A user whose browser is set to `zh-TW` (Traditional Chinese) will be detected as `zh` (Simplified Chinese). The app supports `zh-tw` as a distinct locale but will never auto-select it from the browser. Same issue for `pt-PT` → `pt`, `fr-CA` → `fr`, `es-MX` → `es`, `fa-AF` → `fa`.

**Fix:** Before stripping to base code, check if the full browser locale (normalised to lowercase with `-` separator) is in `SUPPORTED_LOCALES`. Only fall back to base code if the full code is not found.

```js
const normalized = browserLanguage.toLowerCase().replace('_', '-');
if (SUPPORTED_LOCALES.includes(normalized)) return normalized;
const base = normalized.split('-')[0];
if (SUPPORTED_LOCALES.includes(base)) return base;
return null;
```

---

### L-06 — `DEFAULT_LOCALE` defined in two separate files with no shared constant

**File:** `src/stores/useLocaleStore.js` line 13, `src/utils/translation/localeManager.js` line 28  
**Severity:** Low  

Both files define `const DEFAULT_LOCALE = 'en'` independently. If the default locale ever changes, it must be updated in two places and can silently diverge.

**Fix:** Export `DEFAULT_LOCALE` from `localeManager.js` (or a shared constants file) and import it in `useLocaleStore.js`.

---

### L-07 — `waitForTranslationLoad` can silently return empty object

**File:** `src/utils/translation/translationLoader.js` lines 394–426  
**Severity:** Medium  

If a concurrent translation load **fails**, `translationsLoadingInProgress` is cleaned up but the key is never added to `loadedTranslations`. Any concurrent waiter then hits the `!translationsLoadingInProgress.has(loadingKey)` branch and returns `{}` silently with no error thrown or logged for the **waiting** caller.

```js
// If load finished but failed:
if (!translationsLoadingInProgress.has(loadingKey)) {
  return {}; // silent failure - caller has no way to know
}
```

**Fix:** Store a sentinel value in `loadedTranslations` on error (e.g. `null`) so waiters can detect failure and log/retry. Or replace the polling pattern with a Promise-based event (see P-04).

---

### L-08 — `localeOptions` in `LanguageSwitcher.vue` is a duplicate of `SUPPORTED_LOCALES`

**File:** `src/components/ui/nav/language/LanguageSwitcher.vue` lines 42–118  
**Severity:** Low  

`SUPPORTED_LOCALES` in `localeManager.js` is the authoritative list of supported locale codes. `LanguageSwitcher.vue` maintains a separate 75-entry `localeOptions` array with the same codes plus labels. Adding, removing, or renaming a locale requires updating both files. Currently they are in sync but this is a maintenance hazard.

**Fix:** Move locale metadata (label, traditionalName) into `localeManager.js` as a map alongside `SUPPORTED_LOCALES` and import from there.

---

## 2. Performance Issues

---

### P-01 — Two HTTP requests per translation file (HEAD + GET)

**File:** `src/utils/translation/translationLoader.js` lines 45–86 and 304–386  
**Severity:** High  

For every translation load, `validateTranslationFileExists` issues a `HEAD` request, then `loadTranslationFile` issues a separate `GET` request. For a non-English locale this is **4 requests** total (HEAD en, GET en, HEAD locale, GET locale) on every cold load. On slow connections this doubles the time-to-translated-content.

The HEAD validation was added to detect SPA 200-fallbacks, but the same detection can be done on the GET response by checking `Content-Type`.

**Fix:** Remove `validateTranslationFileExists`. Do a single `GET` per file, check `response.ok` and `content-type` on the response, and handle gracefully:

```js
const response = await fetch(url);
if (!response.ok) { /* missing file, fall back to en */ return {}; }
const ct = response.headers.get('content-type') || '';
if (!ct.includes('application/json')) { /* SPA fallback page */ return {}; }
return await response.json();
```

---

### P-02 — Translations loaded in both `beforeEach` and `afterEach`

**File:** `src/router/index.js` (per exploration report)  
**Severity:** Medium  

The router loads translations in `beforeEach` (awaited, blocking navigation) and **again** in `afterEach` (non-blocking). For cached sections this is a no-op, but on first load it triggers two parallel network requests for the same section/locale combination. The second load will hit `translationsLoadingInProgress` and poll, wasting 100–500 ms.

**Fix:** Remove the translation load from `afterEach` for sections that are already loaded for the current locale. Use `areTranslationsLoadedForSection` to guard the call.

---

### P-03 — `clearAllCache()` on locale switch may evict non-translation caches

**File:** `src/utils/translation/localeManager.js` line 507  
**Severity:** Medium  

`clearTranslationCaches()` calls `clearAllCache()` from `cacheHandler`. If `cacheHandler` is a shared in-memory store used by other parts of the application (auth tokens, API responses, etc.), a locale switch will wipe them too.

**Fix:** Use a translation-namespaced cache clear. Either pass a prefix to `clearAllCache('translation_')` or track cache keys locally and delete only those.

---

### P-04 — `waitForTranslationLoad` uses polling with `setTimeout`

**File:** `src/utils/translation/translationLoader.js` lines 394–426  
**Severity:** Medium  

Concurrent requests for the same section/locale wait with a 100 ms poll loop for up to 5 seconds. This wastes microtask queue capacity and adds 0–100 ms latency overhead for every concurrent waiter.

**Fix:** Store a shared Promise per in-flight load key and `await` it directly:

```js
const inFlightPromises = new Map();

// In loadTranslationsForSection:
if (inFlightPromises.has(loadingKey)) {
  return inFlightPromises.get(loadingKey);
}
const promise = doLoad().finally(() => inFlightPromises.delete(loadingKey));
inFlightPromises.set(loadingKey, promise);
return promise;
```

---

### P-05 — `getLocaleDisplayName` ignores 73 locales and doesn't use `Intl.DisplayNames`

**File:** `src/utils/translation/localeManager.js` lines 957–972  
**Severity:** Low  

The function has a hardcoded map for only `en` and `vi`; all 73 other locales fall back to returning the raw code (e.g. `"ar"` instead of `"Arabic"`). The native `Intl.DisplayNames` API supports all of these:

```js
export function getLocaleDisplayName(localeCode, displayLocale = 'en') {
  try {
    return new Intl.DisplayNames([displayLocale], { type: 'language' }).of(localeCode);
  } catch {
    return localeCode;
  }
}
```

---

### P-06 — In-memory `loadedTranslations` Map grows unbounded

**File:** `src/utils/translation/translationLoader.js` lines 23, 276  
**Severity:** Low  

The `loadedTranslations` Map accumulates all ever-loaded section/locale pairs for the lifetime of the page. After a user switches through several locales, many locale sets are in memory simultaneously with no eviction. `clearTranslationCaches()` does clear this map, but it is called on every locale switch which forces a full reload of all sections.

**Fix:** Set a reasonable max-entries limit, or scope the map to only the currently active locale, evicting old locale entries on switch.

---

## 3. Security Issues

---

### S-01 — `window.APP` locale API exposed in production builds

**File:** `src/utils/translation/localeManager.js` lines 1112–1231  
**Severity:** Medium  

`window.APP.setLocale`, `window.APP.switchLocale`, `window.APP.testLocalePersistence` etc. are attached to `window` unconditionally with no environment check. In production this allows any browser script or browser extension to freely call `window.APP.setLocale('vi')` and permanently overwrite the user's stored locale preference.

While locale switching is not a high-severity capability, overwriting `localStorage` values from untrusted scripts is an XSS attack surface that should be minimised.

**Fix:** Guard with a DEV check:

```js
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.APP = window.APP || {};
  window.APP.setLocale = setActiveLocale;
  // ...
}
```

---

### S-02 — `vif.json` typo file causes silent English fallback for Vietnamese shop users

**File:** `public/i18n/section-shop/vif.json`, `public/i18n/vif.json`  
**Severity:** Medium (data integrity)  

The file is named `vif.json` instead of `vi.json`. Vietnamese (`vi`) users navigating the shop section will silently receive English content with no error. The loader will:
1. Validate `section-shop/vi.json` — HEAD returns 404.
2. Log `warn: Requested locale translation file missing, will use English only`.
3. Render English shop content to Vietnamese-locale users without any notification.

**Fix:** Rename `vif.json` → `vi.json` in both `public/i18n/section-shop/` and `public/i18n/`.

---

### S-03 — Translation keys used with `v-html` risk XSS

**Severity:** Medium (potential)  

If any component renders a translated string using `v-html` (e.g. for rich-text translations with HTML links), malicious content injected into a translation file (via a compromised CDN, supply-chain attack on the translation service, or an insider) would execute as HTML in the user's browser. `vue-i18n`'s `$t()` HTML-escapes by default, but using `v-html` with translated content bypasses this.

**Action:** Audit all components for `v-html` usage that receives translated strings. Prefer `i18n-t` component with slots for rich-text translations.

---

### S-04 — No Subresource Integrity for translation JSON

**Severity:** Low  

Translation files are fetched from the same origin (`/i18n/...`) so a CDN or reverse-proxy compromise could serve modified translations. There is no hash-based integrity check on the fetched JSON.

**Note:** This is a general CDN security concern, not specific to i18n. Mention it to the infrastructure team if translation files are ever moved to a CDN.

---

## 4. Best Practice Violations

---

### B-01 — Pinia persistence has NO TTL — the "90 days" comment is false

**File:** `src/stores/useLocaleStore.js` lines 174–180  
**Severity:** High  

```js
persist: {
  key: 'locale_preference',
  storage: localStorage,
  paths: ['locale'],
  // 90 days TTL is handled by the storage mechanism automatically  ← FALSE
}
```

`pinia-plugin-persistedstate` v4 **does not implement TTL**. It reads and writes `localStorage` as plain JSON with no expiry timestamp. The locale preference will persist **indefinitely** (or until the user clears storage). This means:

- A user who used the app two years ago and set locale to `vi` will still see `vi` on their next visit.
- A user whose account is reassigned cannot have their locale reset automatically.

**Fix:** Implement a custom serializer that wraps the value with an expiry timestamp:

```js
persist: {
  key: 'locale_preference',
  storage: localStorage,
  serializer: {
    serialize(value) {
      return JSON.stringify({
        data: value,
        expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
      });
    },
    deserialize(raw) {
      try {
        const { data, expiresAt } = JSON.parse(raw);
        if (Date.now() > expiresAt) return { locale: null }; // expired
        return data;
      } catch {
        return { locale: null };
      }
    },
  },
}
```

---

### B-02 — Template literal bug in `LanguageSwitcher.vue` warning message

**File:** `src/components/ui/nav/language/LanguageSwitcher.vue` line 179  
**Severity:** Low  

```js
console.warn('[LanguageSwitcher] Unsupported locale "${next}", coercing to "en".');
//                                                  ^^^^^^ regular string, not template literal
```

`${next}` will not be interpolated. The warning will always print the literal string `"${next}"`.

**Fix:** Use a backtick template literal:

```js
console.warn(`[LanguageSwitcher] Unsupported locale "${next}", coercing to "en".`);
```

---

### B-03 — No RTL (Right-to-Left) layout support for 6 RTL locales

**Severity:** High  

The following locales in `SUPPORTED_LOCALES` use RTL scripts: `ar` (Arabic), `he` (Hebrew), `fa` (Persian), `fa-af` (Dari), `ur` (Urdu), `ps` (Pashto). When these locales are active, the `<html>` element has `lang="ar"` set correctly (via `document.documentElement.setAttribute('lang', localeCode)`) but **`dir` is never changed**. The layout remains LTR, producing mirrored/broken text rendering for RTL languages.

**Fix:** In `setActiveLocale` and `applyLocaleTemporarily`, also set `dir`:

```js
const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'fa-af', 'ur', 'ps']);
document.documentElement.setAttribute('dir', RTL_LOCALES.has(localeCode) ? 'rtl' : 'ltr');
```

CSS logical properties (`margin-inline-start`, `padding-inline-end`) should be preferred over physical (`margin-left`, `padding-right`) throughout the app.

---

### B-04 — `selectId` in `LanguageSwitcher` uses `Math.random()`

**File:** `src/components/ui/nav/language/LanguageSwitcher.vue` line 130  
**Severity:** Low  

```js
const selectId = 'language-switcher-' + Math.random().toString(36).slice(2, 9);
```

`Math.random()` is non-deterministic and non-SSR-safe. If the component is ever server-rendered, the hydration ID will mismatch. Vue 3.5+ provides `useId()` for stable, unique IDs.

**Fix:**
```js
import { useId } from 'vue';
const selectId = 'language-switcher-' + useId();
```

---

### B-05 — Accessibility label on language switcher is hardcoded in English

**File:** `src/components/ui/nav/language/LanguageSwitcher.vue` line 3  
**Severity:** Low  

```html
<form ... aria-label="Language selector">
  <label :for="selectId" class="sr-only">Language</label>
```

For a non-English user, the accessible name of the language selector is always `"Language selector"` (English). Screen reader users who rely on the OS/assistive tech language will not hear a translated label.

**Fix:** Use a `$t` key that is always available (loaded as part of a global base bundle):
```html
<form :aria-label="$t('ui.languageSelector')" ...>
```

---

### B-06 — `applyTranslationsToI18n` fallback uses shallow `setLocaleMessage`

**File:** `src/utils/translation/translationLoader.js` lines 111–115  
**Severity:** Low  

```js
const existing = global.getLocaleMessage(localeCode) || {};
global.setLocaleMessage(localeCode, {
  ...existing,
  ...messages
});
```

`setLocaleMessage` with a top-level spread is shallow. Deeply nested keys from `existing` that are at the same top-level namespace as `messages` will be overwritten entirely. This fallback is only triggered when `mergeLocaleMessage` is not available (unusual in vue-i18n v11), but it should still be safe.

**Fix:** Use a deep-merge when falling back to `setLocaleMessage`.

---

### B-07 — No number, date, or currency locale formatting

**Severity:** Medium  

`vue-i18n` provides `n()` (number), `d()` (datetime), and currency formatting tied to the active locale. No component in the codebase uses these. All numbers, dates, and prices are presumably rendered with JavaScript defaults or hardcoded `en-US` formatting, producing incorrect output for locale-specific conventions (e.g. European decimal comma, different date order, currency symbol placement).

**Fix:** Use `useI18n().n()` and `useI18n().d()` for any numeric, date, or currency display.

---

### B-08 — No `<link rel="alternate" hreflang>` tags for SEO

**Severity:** Medium  

The app supports 75 locales with locale-prefixed URLs (e.g. `/vi/dashboard`). Search engines expect `<link rel="alternate" hreflang="vi" href="...">` tags for each alternate language version. Without them, search engines may index only the English version or create duplicate-content penalties.

**Fix:** Use `vue-router`'s navigation hooks or a head-management library (e.g. `@vueuse/head`) to inject hreflang tags per route.

---

## 5. Missing Features

---

### F-01 — Persistence expiry (TTL) is not implemented

**Relates to:** B-01  

The `pinia-plugin-persistedstate` config claims 90-day TTL in a comment but this is unimplemented (see B-01 for full detail). This is a missing feature as well as a bug.

**Required implementation:**
- Custom `serializer` on the Pinia persist config that wraps stored values with `{ data, expiresAt }`.
- Deserializer that returns `{ locale: null }` if `Date.now() > expiresAt`, allowing `resolveActiveLocale()` to fall through to browser detection.
- The expiry period should be configurable (e.g. via an env var or a constant).

---

### F-02 — No locale setting from user profile / config API

**Severity:** High  

There is no mechanism to:
1. Read a `preferred_language` field from the authenticated user's profile (API response).
2. Apply it as the active locale on login.
3. Save the locale back to the user profile when the user changes it in the UI.

Currently locale is stored only in `localStorage`. If a user logs in on a different device, their language preference is lost.

**Required implementation:**
- In the auth flow (`useAuthStore` / login success), read `user.preferredLocale` from the API response and call `setActiveLocale(user.preferredLocale)`.
- In `setActiveLocale`, optionally POST/PATCH the new locale to the user profile API when the user is authenticated.
- The `LanguageSwitcher` component should call an API endpoint (e.g. `PATCH /users/me { preferredLocale: 'vi' }`) after a successful locale change.

---

### F-03 — No "Translate this page" (one-time translation without persistence)

**Severity:** Medium  

The user requirement specifies a one-time page translation: the user can translate the current page to a different language without changing their saved preference. `applyLocaleTemporarily` exists but it:
- Is only wired to URL-based locale detection in the router.
- Does not load translations (see L-03).
- Is not exposed as a user-accessible action.

**Required implementation:**
1. Add a "Translate this page" button or secondary control in the UI (separate from the persistent language switcher).
2. On click, call `applyLocaleTemporarily(selectedLocale)` followed by `loadTranslationsForSection(currentSection, selectedLocale)`.
3. Set a session-level flag (e.g. `sessionStorage.setItem('temp_locale', locale)`) so that navigating within the same tab preserves the temporary translation, but a new tab or reload reverts to the persisted preference.
4. Show a "You are viewing a translated version. Switch back to [original language]" banner.

---

### F-04 — Language setting from a user-facing form (Settings page)

**Severity:** Medium  

`Settings.vue` contains a `<!-- choose-language -->` placeholder with no implementation. The user requirement states locale should be settable from a settings form.

**Required implementation:**
- Add a `<LanguageSwitcher>` (or a dedicated settings-context variant) to `Settings.vue`.
- Wire the change event to both `setActiveLocale` (local) and the user profile API save (F-02).
- Show the currently active locale as the selected value.
- Provide a "Reset to browser default" option that calls `resetLocaleToDefault()`.

---



---

### F-06 — No loading/feedback state during locale switch

**Severity:** Low  

The `LanguageSwitcher` disables the `<select>` via `isBusy` during a locale switch but there is no:
- Loading spinner or progress indicator.
- Success toast/notification after a successful switch.
- Error notification if the translation load fails.

For slow connections a locale switch can take several seconds with no visual feedback.

**Required implementation:**
- Show a spinner icon beside the select while `isBusy` is `true`.
- Emit a `locale-changed` event that a parent toast/notification system can listen to.
- On catch, show an error state and restore the previous selection.

---

### F-07 — No RTL layout support (see also B-03)

**Severity:** High  

Beyond just setting `dir="rtl"` on the root element (B-03), full RTL support requires:
- CSS logical properties throughout the app (`margin-inline-*`, `padding-inline-*`, `border-inline-*`).
- Mirrored icons (e.g. back/forward arrows).
- RTL-aware flex and grid layouts.
- RTL-aware font stacks (Arabic, Hebrew, etc. benefit from specific web fonts).

This is a significant undertaking and should be planned as a dedicated sprint if Arabic/Hebrew/Persian/Urdu users are a target audience.


## 6. Additional Issues Found

These issues were found in the follow-up audit and are **not duplicates** of the items above.

---

### L-09 — `beforeEach` can load the wrong locale because `resolveActiveLocale()` reads the old browser URL

**File:** `src/router/index.js` lines 337-344 and 479-504, `src/utils/translation/localeManager.js` lines 44-94  
**Severity:** High  

During a pending navigation, Vue Router's `to.path` already contains the destination path, but `window.location.pathname` still contains the **previous** committed URL. `router.beforeEach` correctly detects `to.params.locale` and calls `applyLocaleTemporarily(localeInPath)`, but later in the same guard it calls `resolveActiveLocale()` again before loading translations.

`resolveActiveLocale()` checks `getLocaleFromUrl()`, which reads `window.location.pathname`, not the pending `to.path`. When navigating from an English URL to `/vi/...`, the translation preload can resolve the old English URL/store preference and load English translations even though the destination URL locale is Vietnamese.

```js
// router/index.js
await applyLocaleTemporarily(localeInPath);

// Later in the same pending navigation:
const activeLocale = resolveActiveLocale(); // reads window.location.pathname, not to.path
await loadTranslationsForSection(resolvedSection, activeLocale);
```

**Fix:** In `beforeEach`, carry a local `activeLocaleForNavigation` variable. If `to.params.locale` is valid, use that value directly for translation loading. Do not re-resolve from `window.location` until after navigation is committed.

---

### L-10 — Locale switch updates the URL with `history.pushState`, bypassing Vue Router

**File:** `src/utils/translation/localeManager.js` lines 706-790  
**Severity:** High  

`updateUrlWithLocale()` rewrites the address bar with `window.history.pushState({}, "", newUrl)`. This changes the visible URL but does not notify Vue Router, does not update `route.params.locale`, does not run navigation guards, and does not trigger route watchers.

After changing language from `/dashboard` to `/vi/dashboard`, the app can be in a split state:

- Browser URL shows `/vi/dashboard`.
- Vue Router's current route can still represent `/dashboard`.
- Components reading `useRoute()` may still see the old route params/meta.
- Back/forward behaviour can become inconsistent because Router did not create the navigation entry.

**Fix:** Inject the router into locale switching or expose a router-aware helper. Use `router.replace()` or `router.push()` for locale URL updates instead of raw `window.history.pushState()`.

---

### L-11 — Initial translation preload in `main.js` does not normalize locale-prefixed paths

**File:** `src/main.js` lines 410-480  
**Severity:** Medium  

On startup, `main.js` resolves the current route with:

```js
const currentPath = router.currentRoute.value.path;
const currentRoute = resolveRouteFromPath(currentPath);
```

Route config slugs are stored without locale prefixes (for example `/dashboard`), but `currentPath` can be locale-prefixed (for example `/vi/dashboard`). `resolveRouteFromPath('/vi/dashboard')` will not match the `/dashboard` route and may return the catch-all route or `null`. When that happens, the startup translation preload for the current section is skipped or uses the wrong section.

**Fix:** Strip a supported locale prefix before calling `resolveRouteFromPath`, or add a shared `normalizeLocalizedPath(path)` helper used by `main.js`, `router/index.js`, and `localeManager.js`.

---

### L-12 — Direct Pinia locale writes can desync `currentActiveLocale`

**File:** `src/stores/useLocaleStore.js` lines 74-104, `src/utils/translation/localeManager.js` lines 30-31 and 877-899  
**Severity:** Medium  

`localeManager.js` maintains its own module-level `currentActiveLocale`. `main.js` watches the Pinia store and updates `i18n.global.locale` and `document.lang`, but it does not update `localeManager`'s `currentActiveLocale`.

If future user config or settings-form code calls `useLocaleStore().setLocale('vi')` directly instead of `setActiveLocale('vi')`, the app can become inconsistent:

- Pinia store says `vi`.
- Vue I18n says `vi`.
- `getActiveLocale()` can still return the old `currentActiveLocale`.

This matters because the requirements include setting locale from user config or a form. Those paths must not write the store directly.

**Fix:** Make `setActiveLocale` the only write API, or subscribe to the Pinia locale store and update `currentActiveLocale` whenever the store changes.

---

### P-07 — Component-level translation loads duplicate router-level translation loads

**Files:** `src/router/index.js`, `src/components/auth/*.vue`, `src/templates/dashboard/HeaderResponsive.vue`, `src/templates/dashboard/DashboardSidebar.vue`, `src/assets/data/menuItems.js`  
**Severity:** Medium  

The router already loads the current section's translations in `beforeEach`. Several components then load the same section again on mount or locale change:

- `AuthLogIn.vue` loads `auth` on mount and watches locale changes.
- `AuthSignUp.vue`, `AuthLostPassword.vue`, `AuthResetPassword.vue`, and onboarding components also load `auth`.
- `HeaderResponsive.vue`, `DashboardSidebar.vue`, and `menuItems.js` load `dashboard-global`.

The cache reduces network impact after the first load, but this still creates extra cache lookups, duplicated logs/performance events, and more opportunities for race conditions during locale switching.

**Fix:** Centralize section translation loading in the route/section orchestration layer. Components should assume their route section is already loaded, and only request translations for truly optional sub-sections.

---

### S-05 — Translation file URLs are built from unencoded input

**File:** `src/utils/translation/translationLoader.js` lines 33-35 and 134-140  
**Severity:** Low  

`getTranslationUrl(sectionName, localeCode)` directly interpolates both values into a URL:

```js
return `/i18n/section-${sectionName}/${localeCode}.json`;
```

`loadTranslationsForSection` is exported and accepts arbitrary strings. Most current callers pass route-config constants, but the utility itself does not validate section names against an allowlist or encode URL segments. A bad caller can request unexpected static paths such as section names containing `/`, `..`, or query/hash characters.

**Fix:** Validate `sectionName` against known section identifiers and validate `localeCode` against `SUPPORTED_LOCALES` inside `loadTranslationsForSection`. Build URLs with `encodeURIComponent` for each path segment.

---

### B-09 — Circular dependency between locale store and locale manager

**Files:** `src/stores/useLocaleStore.js`, `src/utils/translation/localeManager.js`  
**Severity:** Medium  

`useLocaleStore.js` imports `SUPPORTED_LOCALES` from `localeManager.js`, while `localeManager.js` imports `useLocaleStore` from the store:

```js
// useLocaleStore.js
import { SUPPORTED_LOCALES } from '../utils/translation/localeManager.js';

// localeManager.js
import { useLocaleStore } from '../../stores/useLocaleStore.js';
```

This ESM cycle currently works only because of evaluation order and because `SUPPORTED_LOCALES` is defined near the top of `localeManager.js`. It is fragile: moving imports/exports or adding top-level store access can introduce temporal-dead-zone errors.

**Fix:** Move `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, and locale metadata into a dependency-free constants module, e.g. `src/utils/translation/localeConstants.js`. Both the store and manager should import from that file.

---

### F-10 — No CI validation for translation key coverage

**Severity:** High  

There is no automated check that:

- Every `$t('...')` / `t('...')` key exists in the relevant English section.
- Locale files have the same key shape as English.
- Placeholder variables match between English and translated files.
- File names match `SUPPORTED_LOCALES`.
- Section folders exist for every route section.

This allows missing keys, typo files like `vif.json`, and partial nested translations to ship unnoticed.

**Required implementation:** Add a `validate:i18n` script that scans Vue files and translation JSON files, compares key trees, validates placeholder tokens, and fails CI when required coverage is missing.

---

### F-11 — Root-level translation bundles exist but are not loaded by the current loader

**Files:** `public/i18n/en.json`, `public/i18n/vif.json`, `src/utils/translation/translationLoader.js` lines 33-35  
**Severity:** Medium  

The app has root-level translation files under `public/i18n/`, but `translationLoader.js` only loads section files using:

```js
`/i18n/section-${sectionName}/${localeCode}.json`
```

That means `public/i18n/en.json` is not part of the runtime loading flow. Any truly global keys must be duplicated into every section that needs them, or they will only work accidentally when some other section has already loaded a matching namespace.

**Required implementation:** Add a global/base bundle load during app startup (for example `/i18n/base/{locale}.json` or `/i18n/{locale}.json`) and define a clear rule: global UI keys live in the base bundle, route-specific keys live in section bundles.

---

## 7. Additional Issues Found (Second Pass)

These are newly identified issues and are not duplicates of previous sections.

---

### L-13 — Locale query parameter is documented but not implemented

**File:** `src/utils/translation/localeManager.js` lines 34-41 and 226-268  
**Severity:** Medium  

`resolveActiveLocale()` documentation states priority includes URL **path or query parameter**:

```js
// Priority order:
// 1. URL parameter (?locale=vi or /vi/path)
```

But `getLocaleFromUrl()` only checks `window.location.pathname` and never reads `window.location.search`. This creates mismatch between documented behavior and actual runtime behavior. Links like `/dashboard?locale=vi` will not set locale from URL even though comments say they should.

**Fix:** Either implement query parsing (`new URLSearchParams(window.location.search).get('locale')`) with validation against `SUPPORTED_LOCALES`, or remove query-param claims from docs/comments to avoid misleading integrators.

---

### L-14 — Locale path matching is case-sensitive

**File:** `src/utils/translation/localeManager.js` lines 237-243, `src/router/index.js` lines 335-354  
**Severity:** Low  

Locale matching checks exact inclusion in `SUPPORTED_LOCALES` without normalization:

```js
SUPPORTED_LOCALES.includes(firstPathPart)
```

If a user lands on `/VI/dashboard` or `/En/dashboard` (from manual entry, bookmarks, or third-party links), the locale is treated as invalid and may fall back to stored/browser locale. This causes inconsistent deep-link behavior.

**Fix:** Normalize URL locale candidates to lowercase before validation in both router guard and locale manager.

---

### L-15 — Locale URL rewriting ignores Vite `BASE_URL` / subpath deployments

**File:** `src/utils/translation/localeManager.js` lines 716-752, `src/router/index.js` line 308  
**Severity:** Medium  

Router is initialized with `createWebHistory(import.meta.env.BASE_URL)`, so app routing supports deployments under subpaths (for example `/app/`).  
However, `updateUrlWithLocale()` rewrites URLs using raw `window.location.pathname` and constructs new paths like `/${locale}${currentPath}`. This logic does not account for base path prefixes and can generate malformed URLs in subpath deployments.

Example:
- Base path deployment: `/app/dashboard`
- Switch to Vietnamese
- Current logic can produce `/vi/app/dashboard` or other incorrect variants depending on current path shape, instead of `/app/vi/dashboard` (or the router's canonical localized form).

**Fix:** Build locale paths through Vue Router (`router.resolve`/`router.push`/`router.replace`) rather than string concatenation, so `BASE_URL` and route parsing rules remain consistent.

---