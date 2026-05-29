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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `onChange` called `setActiveLocale` without `await`, so `ok` was always a truthy Promise and the falsy guard never ran. `loadTranslationsForSection` and `preloadTranslationsForSections` ran while `setActiveLocale` was still clearing caches, updating i18n, reloading the current section, and refreshing `preLoadSections` (via `refreshSectionPreloadsOnLocaleChange` inside `localeManager.js`).

**Why it happened:** `setActiveLocale` is `async` but the switch handler treated it like a synchronous boolean return.

**What changed:** `LanguageSwitcher.vue` line 188 — `const ok = await setActiveLocale(finalLocale, { updateUrl: true });` so steps 2–3 run only after locale persistence, URL rewrite, cache clear, and `setActiveLocale`'s internal translation/section preload refresh complete.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. It fixes ordering so the switcher respects work already added inside `setActiveLocale` (including section preload refresh on locale change). The switcher may still call `loadTranslationsForSection` / `preloadTranslationsForSections` afterward (duplicate but safe); removing that duplication is out of scope for L-01.

**How it was tested:** Code review — `onChange` is already `async`; `setActiveLocale` returns `Promise<boolean>` per JSDoc in `localeManager.js`.

**How to test in the browser:**

> **Why the old console snippet looked the same on old and new code**  
> That snippet only calls `setActiveLocale` from `localeManager.js`. It never runs `LanguageSwitcher.vue`. On **any** build you will always see `withoutAwaitIsPromise: true` (Promise is truthy) and `withAwaitIsBoolean: true` — that demonstrates async semantics, not whether the switcher awaits. Use the tests below instead.

1. Run `npm run dev`, open a page with the language `<select>` (e.g. `/log-in` or `/dashboard`).

2. **Confirm the fix is in your bundle** (DevTools → Console, one paste):
   ```js
   fetch('/src/components/ui/nav/language/LanguageSwitcher.vue').then(r=>r.text()).then(src=>console.log({hasAwaitSetActiveLocale:/await\s+setActiveLocale/.test(src),snippet:src.match(/setActiveLocale\([^)]+\)/)?.[0]}));
   ```
   **Expected on fixed code:** `hasAwaitSetActiveLocale: true`, snippet contains `await setActiveLocale`.

3. **Prove ordering: buggy pattern vs fixed pattern** (same modules `LanguageSwitcher` uses; one paste):
   ```js
   (async () => {
     const events = [];
     const lm = await import('/src/utils/translation/localeManager.js');
     const tl = await import('/src/utils/translation/translationLoader.js');
     const section = window.__CURRENT_SECTION__ || 'auth';
     const target = window.APP?.getLocale?.() === 'vi' ? 'en' : 'vi';
     const oc = tl.clearTranslationCaches;
     const ol = tl.loadTranslationsForSection;
     tl.clearTranslationCaches = function () {
       events.push({ op: 'clear', t: performance.now() });
       return oc();
     };
     tl.loadTranslationsForSection = async function (s, l) {
       events.push({ op: 'load', section: s, locale: l, t: performance.now() });
       return ol(s, l);
     };
     const run = async (label, fn) => {
       events.length = 0;
       await fn();
       const clear = events.find((e) => e.op === 'clear');
       const firstLoad = events.find((e) => e.op === 'load');
       return {
         label,
         eventOrder: events.map((e) => e.op),
         clearBeforeFirstLoad: !!(clear && firstLoad && clear.t < firstLoad.t),
       };
     };
     const buggy = await run('OLD LanguageSwitcher (no await)', async () => {
       const p = lm.setActiveLocale(target, { updateUrl: false });
       await tl.loadTranslationsForSection(section, target);
       await p;
     });
     const fixed = await run('NEW LanguageSwitcher (await)', async () => {
       await lm.setActiveLocale(target, { updateUrl: false });
       await tl.loadTranslationsForSection(section, target);
     });
     console.table([buggy, fixed]);
     console.log(
       buggy.clearBeforeFirstLoad === false && fixed.clearBeforeFirstLoad === true
         ? 'PASS: without await, first load can run before clear; with await, clear always precedes the switcher load.'
         : 'Inspect eventOrder — network timing can occasionally blur edge cases; re-run once.',
       { buggy, fixed }
     );
     tl.clearTranslationCaches = oc;
     tl.loadTranslationsForSection = ol;
   })();
   ```
   **Expected:** `OLD` row → `clearBeforeFirstLoad: false`, `eventOrder` often starts with `load` then `clear`. `NEW` row → `clearBeforeFirstLoad: true`, `eventOrder` starts with `clear` then `load`(s). Console ends with `PASS: without await…`.

4. **UI check (real `<select>`):** Change English → Vietnamese (or back). **Expected:** URL locale prefix updates, `document.documentElement.lang` matches, copy updates. This is a smoke test only — both old and new code may look fine on fast networks; the ordering test in step 3 is the reliable proof.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Non-English loads merged `englishTranslations` and `localeTranslations` with a shallow spread. Nested objects in the locale file replaced entire English subtrees in the value stored in `loadedTranslations` and `cacheHandler`, so callers reading the cached return missed English-only nested keys.

**Why it happened:** Spread merge only combines top-level keys; nested locale objects win wholesale at their key path.

**What changed:** `translationLoader.js` — import `deepMergePreferChild` from `objectSafety.js` and use `translations = deepMergePreferChild(englishTranslations, localeTranslations)` instead of `{ ...englishTranslations, ...localeTranslations }`. `applyTranslationsToI18n` still receives each file separately (vue-i18n fallback unchanged).

**Conflict check:** No override of **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md** — same fetch/load timing; only the shape of the cached return object changes.

**How it was tested:** `tests/unit/translationLoader.test.js` — `translationLoader locale merge (L-02)` asserts nested English `subtitle` / `button` survive when locale only overrides `title`.

**How to test in the browser:**
1. Run `npm run dev`, open a page with translated nested keys (e.g. `/vi/log-in` or switch to Vietnamese on auth).
2. DevTools → **Console** — one paste (uses the same merge path as the loader; pick a section that exists on your route, default `auth`):
   ```js
   (async () => {
     const { deepMergePreferChild } = await import('/src/utils/common/objectSafety.js');
     const english = { auth: { login: { title: 'Login', subtitle: 'Welcome', button: 'Go' } } };
     const locale = { auth: { login: { title: 'Đăng nhập' } } };
     const shallow = { ...english, ...locale };
     const deep = deepMergePreferChild(english, locale);
     console.log({
       shallowMissingSubtitle: shallow.auth?.login?.subtitle,
       deepHasSubtitle: deep.auth?.login?.subtitle,
       deepTitle: deep.auth?.login?.title,
       pass: deep.auth?.login?.subtitle === 'Welcome' && deep.auth?.login?.title === 'Đăng nhập'
     });
   })();
   ```
3. **Expected:** `shallowMissingSubtitle: undefined`, `deepHasSubtitle: 'Welcome'`, `pass: true`.
4. **Loader smoke test** (optional, after clearing site data or hard refresh): same console, then:
   ```js
   (async () => {
     const { loadTranslationsForSection } = await import('/src/utils/translation/translationLoader.js');
     const merged = await loadTranslationsForSection('auth', 'vi');
     console.log({
       sample: merged?.auth?.login,
       hasNestedFallback: !!(merged?.auth?.login?.subtitle || merged?.auth?.login?.button)
     });
   })();
   ```
   **Expected:** `hasNestedFallback: true` when English auth JSON includes keys the Vietnamese file omits (real files must match your section name).

---

### L-03 — `applyLocaleTemporarily` does not load locale translations

**File:** `src/utils/translation/localeManager.js` lines 800–870  
**Severity:** Medium  

`applyLocaleTemporarily` sets `currentActiveLocale` and updates the i18n instance locale, but does **not** fetch or merge translations for the new locale. It is called from `router/beforeEach` when a URL like `/vi/dashboard` is visited. The router does separately call `loadTranslationsForSection`, so this is not a complete failure, but if `applyLocaleTemporarily` is ever called standalone (e.g. from a future "preview locale" feature), the UI will switch locale labels without the actual strings being present.

**Fix:** Either document clearly that `applyLocaleTemporarily` must always be followed by a translation load, or load translations inside it.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `applyLocaleTemporarily` updated in-memory locale and vue-i18n but never fetched section JSON. Standalone or preview callers would show the wrong language labels with missing strings until something else called `loadTranslationsForSection`.

**Why it happened:** Router was expected to load translations separately (`beforeResolve` / `afterEach`), so the temporary-locale helper only switched display state.

**What changed:**
- `localeManager.js` — `resolveSectionFromRoutePath`, `loadTranslationsForTemporaryLocale`, and extended `applyLocaleTemporarily(locale, options)` with `sectionName`, `routePath`, `loadTranslations` (default `true`), `awaitTranslations` (default `false`). Translation fetch is **fire-and-forget** by default so `beforeEach` stays non-blocking per preload architecture.
- `router/index.js` — `await applyLocaleTemporarily(urlLocale, { routePath: to.path })` so section resolution uses the **destination** path, not stale `window.location`.

**Conflict check:** No override of **Preloading.md** / **SECTION_PRELOAD_AUDIT.md** — does not await translation I/O on the navigation critical path unless `awaitTranslations: true`. May overlap `startCurrentSectionResourceLoads` in `beforeResolve` (cache dedupes). **L-09** (wrong locale from `resolveActiveLocale()` during pending nav) remains a separate fix.

**How it was tested:** `tests/unit/applyLocaleTemporarily.test.js` — translation load triggered with `routePath`, explicit `sectionName`, `awaitTranslations`, and `loadTranslations: false`.

**How to test in the browser:**

> **Why `authViLoaded: false` can still mean L-03 worked**  
> The old snippet used `import('/src/utils/translation/translationLoader.js')` from the console. That can read a **different module instance** than the running app, so `loadedTranslations` looks empty even when `vi.json` loaded in Network. Locale (`vi`) and Network `vi.json` are the real signals. Use `window.APP` below (same instances as the app).

1. Run `npm run dev`, hard-refresh, open `/log-in` (English).
2. Navigate to `/vi/log-in` (in-app link is best; typing the URL and pressing Enter also works after full reload).
3. DevTools → **Console** — one paste after the page shows Vietnamese (or stops loading):
   ```js
   (async () => {
     const stats = await window.APP?.getTranslationStatistics?.();
     console.log({
       activeLocale: window.APP?.getLocale?.(),
       langAttr: document.documentElement.lang,
       loadedSections: stats?.loadedSections ?? [],
       authViInMap: stats?.loadedSections?.includes('auth_vi'),
       pass:
         window.APP?.getLocale?.() === 'vi' &&
         (stats?.loadedSections?.includes('auth_vi') ||
           document.documentElement.lang === 'vi')
     });
   })();
   ```
4. **Expected:** `activeLocale: 'vi'`, `authViInMap: true` (or `loadedSections` contains `auth_vi`), `pass: true`; visible copy is Vietnamese.
5. **Network check:** `vi.json` under `/i18n/section-auth/` — if present, translations were fetched (L-03 + router loads). Duplicate requests are OK (cache dedupes).

---

### L-04 — `initializeFromBrowser` in `useLocaleStore` is dead code

**File:** `src/stores/useLocaleStore.js` lines 127–171  
**Severity:** Medium  

`initializeFromBrowser` is defined on the Pinia store but is **never called anywhere**. Browser locale detection is handled separately in `localeManager.getBrowserLocale()`. This creates two parallel implementations of the same logic that can drift — e.g. the store version strips to base code only (`split('-')[0]`), losing `zh-tw` or `pt-pt` variants.

**Fix:** Remove `initializeFromBrowser` from the store and consolidate browser-locale detection entirely in `localeManager.js`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `useLocaleStore.initializeFromBrowser()` duplicated browser detection with outdated logic (base code only via `split('-')[0]`) but was never called, so it could mislead future callers and drift from `localeManager.getBrowserLocale()` (fixed in L-05).

**Why it happened:** Store was written with its own browser-init path before `resolveActiveLocale()` / `getBrowserLocale()` became the single resolution chain.

**What changed:** Removed `initializeFromBrowser` action from `src/stores/useLocaleStore.js`. Browser locale is resolved only via `localeManager.js` (`getBrowserLocale` → `resolveActiveLocale` priority chain). Store keeps `setLocale`, `resetToDefault`, and getters only.

**Conflict check:** No preload impact. Complements **L-05** (one browser-detection implementation). Nothing in the repo called this action.

**How it was tested:** `tests/unit/useLocaleStore.test.js` — store has no `initializeFromBrowser`; `setLocale` / `resetToDefault` remain. `grep initializeFromBrowser` — only audit doc and removed store code.

**How to test in the browser:**
1. DevTools → **Console** (one paste):
   ```js
   (async () => {
     const { useLocaleStore } = await import('/src/stores/useLocaleStore.js');
     const store = useLocaleStore();
     console.log({
       hasInitializeFromBrowser: typeof store.initializeFromBrowser === 'function',
       hasSetLocale: typeof store.setLocale === 'function',
       browserViaManager: window.APP.getLocalePreferenceOrder().find((o) => o.source === 'browser')
     });
   })();
   ```
2. **Expected:** `hasInitializeFromBrowser: false`, `hasSetLocale: true`, `browserViaManager` object present (browser detection still works through `localeManager`).

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `getBrowserLocale()` always took only the first segment (`zh-TW` → `zh`), so supported regional locales (`zh-tw`, `pt-pt`, `fr-ca`, `es-mx`, `fa-af`) were never auto-selected from the browser.

**Why it happened:** Early logic assumed base ISO codes only; regional tags were stripped before checking `SUPPORTED_LOCALES`.

**What changed:** `localeManager.js` `getBrowserLocale()` — normalize full tag (`toLowerCase`, `_` → `-`), return it when listed; otherwise fall back to base code; otherwise `null`.

**Conflict check:** No override of preload or L-03 work — only affects browser-priority step in `resolveActiveLocale()` when URL and store have no locale.

**How it was tested:** `tests/unit/getBrowserLocale.test.js` — `zh-TW` → `zh-tw`, `pt-PT` → `pt-pt`, `fr_CA` → `fr-ca`, `en-US` → `en`.

**How to test in the browser:**

> **Why your console output looked “wrong” but L-05 is still correct**
> - You were on a URL with a locale prefix (`/zh-tw/...`). `resolveActiveLocale()` **always prefers URL first**, so every `resolveActiveLocale()` call returned `zh-tw` — not the browser.
> - `getLocalePreferenceOrder()` is the right tool: it lists each source separately. Your `browser: 'en'` row is `getBrowserLocale()` only; with `navigator.language` = `en-US` that correctly maps to `en` (base fallback). URL/persisted `zh-tw` are separate priorities.
> - Do **not** use a loop with `resolveActiveLocale()` while a locale is in the path — that only re-tests URL priority.

1. **Inspect browser detection only** (works on any page, one paste):
   ```js
   (() => {
     const order = window.APP.getLocalePreferenceOrder();
     const browser = order.find((o) => o.source === 'browser');
     console.log({
       navigatorLanguage: navigator.language,
       browserStep: browser,
       passEnUs: navigator.language === 'en-US' && browser?.value === 'en'
     });
   })();
   ```
   **On your machine (`en-US`):** `browserStep.value: 'en'`, `passEnUs: true` — **PASS for L-05** (regional tag not used because full `en-us` is not in `SUPPORTED_LOCALES`; base `en` is).

2. **Prove regional tag `zh-TW` → `zh-tw`** — use a page **without** a locale prefix (e.g. `/log-in`, not `/zh-tw/log-in`), then temporarily override `navigator.language` and read **only** the browser row (URL must not be `zh-tw`):
   ```js
   (() => {
     Object.defineProperty(navigator, 'language', { value: 'zh-TW', configurable: true });
     const browser = window.APP.getLocalePreferenceOrder().find((o) => o.source === 'browser');
     console.log({ navigatorLanguage: navigator.language, browserStep: browser, pass: browser?.value === 'zh-tw' });
   })();
   ```
   **Expected:** `browserStep.value: 'zh-tw'`, `pass: true`. (If URL still has `/zh-tw/`, the `url` row will also be `zh-tw` — that is fine; we are checking the `browser` row.)

3. **Authoritative check:** `npm run test:unit -- tests/unit/getBrowserLocale.test.js --run` — `zh-TW` → `zh-tw`, `pt-PT` → `pt-pt`, `fr_CA` → `fr-ca`, `en-US` → `en`.

---

### L-06 — `DEFAULT_LOCALE` defined in two separate files with no shared constant

**File:** `src/stores/useLocaleStore.js` line 13, `src/utils/translation/localeManager.js` line 28  
**Severity:** Low  

Both files define `const DEFAULT_LOCALE = 'en'` independently. If the default locale ever changes, it must be updated in two places and can silently diverge.

**Fix:** Export `DEFAULT_LOCALE` from `localeManager.js` (or a shared constants file) and import it in `useLocaleStore.js`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `DEFAULT_LOCALE = 'en'` was declared independently in `localeManager.js` and `useLocaleStore.js`, so a future change could update one file and miss the other.

**Why it happened:** Store and manager were added separately without a shared constant export.

**What changed:**
- `localeManager.js` — `export const DEFAULT_LOCALE = 'en'` (single source of truth).
- `useLocaleStore.js` — removed local `DEFAULT_LOCALE`; imports it from `localeManager.js`.
- `src/utils/translation/index.js` — re-exports `DEFAULT_LOCALE` for app-wide imports.

**Conflict check:** No preload impact. `src/router/index.js` still has its own `DEFAULT_LOCALE` (out of L-06 scope; can be consolidated in a later task).

**How it was tested:** Code review + `grep` — `useLocaleStore.js` has no local `DEFAULT_LOCALE`; imports from `localeManager.js`. Existing unit tests that import locale modules still pass.

**How to test in the browser:**
1. DevTools → **Console** (one paste):
   ```js
   (async () => {
     const lm = await import('/src/utils/translation/localeManager.js');
     const idx = await import('/src/utils/translation/index.js');
     console.log({
       managerDefault: lm.DEFAULT_LOCALE,
       indexDefault: idx.DEFAULT_LOCALE,
       getDefaultLocale: lm.getDefaultLocale?.(),
       sameReference: lm.DEFAULT_LOCALE === idx.DEFAULT_LOCALE
     });
   })();
   ```
2. **Expected:** all values `'en'`, `sameReference: true`, `getDefaultLocale()` returns `'en'`.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** If the lead `loadTranslationsForSection` failed, `translationsLoadingInProgress` was cleared but `loadedTranslations` had no entry. Concurrent waiters in `waitForTranslationLoad` saw “finished but not in map” and returned `{}` with only a generic warn — indistinguishable from a successful empty load.

**Why it happened:** Only successful loads wrote to `loadedTranslations`; failures left waiters polling until the in-progress flag cleared with no outcome recorded.

**What changed:** `translationLoader.js` — added `finishTranslationLoad(loadingKey, result)`; failures store `null` in `loadedTranslations`; success stores the object. `waitForTranslationLoad` detects `null`, logs `Concurrent load failed`, returns `{}`. Failed loads no longer write to TTL cache. `areTranslationsLoadedForSection` treats `null` as not loaded.

**Conflict check:** No preload timing change — same dedupe/wait pattern; waiters now get an explicit failed outcome instead of a silent race.

**How it was tested:** `tests/unit/translationLoader.test.js` — `translationLoader concurrent wait (L-07)` with parallel loads and failed GET validation.

**How to test in the browser:**
1. DevTools → **Network** → right-click `en.json` (e.g. `/i18n/section-auth/en.json`) → **Block request URL**, or use request blocking pattern `*/i18n/section-auth/en.json`.
2. Hard-refresh `/log-in` (or your auth route).
3. **Expected console (L-07 working):**
   - One lead path: `[loadTranslationsForSection] English translation file missing` or load error, then `finishTranslationLoad` with failure.
   - Several `[waitForTranslationLoad] [start] Waiting… { loadingKey: 'auth_en' }` from `main.js`, `AuthLogIn.vue`, router (normal — deduped to one network load).
   - Multiple `[waitForTranslationLoad] [warn] Concurrent load failed` + `Returning empty object after failed load` — **waiters correctly detected failure** (not the old silent “finished but not in map” only).
4. **Expected UI:** Raw i18n keys such as `auth.login.button` — **not a regression**. No JSON was merged into vue-i18n, so `t()` has no messages. L-07 fixes waiter **logging/outcome**, not “show English anyway when the file is blocked.”
5. Unblock `en.json` and refresh — keys should become normal copy again.

---

### L-08 — `localeOptions` in `LanguageSwitcher.vue` is a duplicate of `SUPPORTED_LOCALES`

**File:** `src/components/ui/nav/language/LanguageSwitcher.vue` lines 42–118  
**Severity:** Low  

`SUPPORTED_LOCALES` in `localeManager.js` is the authoritative list of supported locale codes. `LanguageSwitcher.vue` maintains a separate 75-entry `localeOptions` array with the same codes plus labels. Adding, removing, or renaming a locale requires updating both files. Currently they are in sync but this is a maintenance hazard.

**Fix:** Move locale metadata (label, traditionalName) into `localeManager.js` as a map alongside `SUPPORTED_LOCALES` and import from there.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `LanguageSwitcher.vue` duplicated 75 locale codes plus labels in a local `localeOptions` array, separate from `SUPPORTED_LOCALES` in `localeManager.js` — easy to drift when adding/removing locales.

**Why it happened:** UI labels were inlined in the component for convenience.

**What changed:**
- `src/utils/translation/localeDisplayMetadata.js` — `LOCALE_DISPLAY_METADATA` map (label + traditionalName per code).
- `localeManager.js` — `getLocaleSwitcherOptions()` builds options in `SUPPORTED_LOCALES` order; `getLocaleDisplayName()` uses the same map.
- `LanguageSwitcher.vue` — removed inline list; uses `getLocaleSwitcherOptions()` and `SUPPORTED_LOCALES` for validation.
- `src/utils/translation/index.js` — exports `getLocaleSwitcherOptions`.

**Conflict check:** No preload impact — display-only refactor; switcher behavior unchanged.

**How it was tested:** `tests/unit/localeSwitcherOptions.test.js` — option count/codes match `SUPPORTED_LOCALES`, sample labels present.

**How to test in the browser:**
1. Open any page with the language `<select>`.
2. DevTools → **Console** (one paste):
   ```js
   (async () => {
     const { getLocaleSwitcherOptions, SUPPORTED_LOCALES } = await import('/src/utils/translation/localeManager.js');
     const options = getLocaleSwitcherOptions();
     console.log({
       supportedCount: SUPPORTED_LOCALES.length,
       optionsCount: options.length,
       codesMatch: options.every((o, i) => o.code === SUPPORTED_LOCALES[i]),
       viLabel: options.find((o) => o.code === 'vi')?.label
     });
   })();
   ```
3. **Expected:** `codesMatch: true`, equal counts, `viLabel: 'Vietnamese'`. Dropdown still lists all languages with labels.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Every translation load issued a `HEAD` request via `validateTranslationFileExists`, then a separate `GET` in `loadTranslationFile`. A non-English cold load made **4** HTTP requests (HEAD en, GET en, HEAD locale, GET locale), doubling network round-trips on slow connections.

**Why it happened:** HEAD was added to detect SPA 200-fallbacks (missing JSON returning `index.html`) before fetching body, but the same check can run on the GET response `Content-Type`.

**What changed:**
- `translationLoader.js` — removed `validateTranslationFileExists`.
- `loadTranslationFile` — single GET per file; returns `{}` when `!response.ok` or `Content-Type` is not JSON (SPA fallback).
- `loadTranslationsForSection` — loads English first via GET; missing English → `{}`; missing locale → English-only fallback; no duplicate existence probes.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Aligns with preload refactor performance rules (fewer duplicate requests). Translation preload / section preload still call `loadTranslationsForSection`; they now warm cache with half the HTTP calls on cold load. **SECTION_PRELOAD_AUDIT P-06** (blocking on HEAD+JSON) is further reduced — only GETs remain; router already avoids awaiting translation I/O in `beforeEach` per **AUDIT.md**.

**How it was tested:** `tests/unit/translationLoader.test.js` — `translationLoader single GET per file (P-01)` (2 GETs for `vi`, no HEAD; non-JSON GET returns `{}`). Updated L-02/L-07/S-04 mocks to drop HEAD.

**How to test in the browser:**
1. Run `npm run dev`, open a page that loads section translations (e.g. `/log-in` or `/vi/log-in`).
2. DevTools → **Network** → filter `i18n` → hard refresh (Ctrl+Shift+R). **Before fix:** 4 requests per section/locale (HEAD+GET × en+vi). **After fix:** 2 GETs only (`en.json`, `vi.json`).
3. DevTools → **Console** (one paste — counts methods for a cold load):
   ```js
   (async () => {
     const tl = await import('/src/utils/translation/translationLoader.js');
     tl.clearTranslationCaches();
     const section = window.__CURRENT_SECTION__ || 'auth';
     const targetLocale = 'vi';
     const calls = [];
     const orig = window.fetch;
     window.fetch = async (...args) => {
       const [url, opts = {}] = args;
       if (typeof url === 'string' && url.includes('/i18n/section-')) {
         calls.push({ url, method: opts.method || 'GET' });
       }
       return orig(...args);
     };
     try {
       await tl.loadTranslationsForSection(section, targetLocale);
       console.table(calls);
       console.log({
         totalI18nRequests: calls.length,
         headCount: calls.filter((c) => c.method === 'HEAD').length,
         getCount: calls.filter((c) => c.method === 'GET').length,
         expectedAfterFix: calls.length === 2 && calls.every((c) => c.method === 'GET')
       });
     } finally {
       window.fetch = orig;
     }
   })();
   ```
4. **Expected after fix:** `totalI18nRequests: 2`, `headCount: 0`, `getCount: 2`, `expectedAfterFix: true`.

---

### P-02 — Translations loaded in both `beforeEach` and `afterEach`

**File:** `src/router/index.js` (per exploration report)  
**Severity:** Medium  

The router loads translations in `beforeEach` (awaited, blocking navigation) and **again** in `afterEach` (non-blocking). For cached sections this is a no-op, but on first load it triggers two parallel network requests for the same section/locale combination. The second load will hit `translationsLoadingInProgress` and poll, wasting 100–500 ms.

**Fix:** Remove the translation load from `afterEach` for sections that are already loaded for the current locale. Use `areTranslationsLoadedForSection` to guard the call.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** The audit originally described duplicate loads in `beforeEach` (awaited) and `afterEach`. After **Preloading.md Task 3**, the router no longer awaits translations in `beforeEach`, and current-section work moved to **`beforeResolve`** (`startCurrentSectionResourceLoads`). **L-03** then re-introduced a second load via `applyLocaleTemporarily(..., { loadTranslations: true })` in `beforeEach` for URL-locale paths. On first navigation that caused two parallel `loadTranslationsForSection` calls for the same section/locale; the second hit `translationsLoadingInProgress` and polled (100–500 ms waste). Background `afterEach` translation preloads could also re-schedule loads for sections already warm in cache.

**Why it happened:** L-03 added translation fetch inside `applyLocaleTemporarily` for standalone callers without opting the router out; `beforeResolve` already loads the current section. The TRANSLATION_AUDIT finding predates that split.

**What changed:**
- `router/index.js` — `applyLocaleTemporarily(urlLocale, { routePath: to.path, loadTranslations: false })` so URL-locale handling only switches locale state; **one** current-section translation load runs in `beforeResolve`.
- `routeNavigationData.js` — `startCurrentSectionResourceLoads` skips `loadTranslationsForSection` when `areTranslationsLoadedForSection(section, locale)` is true.
- `sectionPreloadOrchestrator.js` — `startBackgroundSectionPreloads` (router `afterEach` + locale refresh) skips background translation preload when already loaded.

**Conflict check:** Does **not** override **Preloading.md** / **SECTION_PRELOAD_AUDIT.md** P-08 — keeps translations off the blocking `beforeEach` path and preserves `beforeResolve` as the single current-section loader. Refines **L-03**: `applyLocaleTemporarily` still loads translations by default for standalone/preview callers; the router passes `loadTranslations: false` explicitly.

**How it was tested:** `tests/unit/routeNavigationData.test.js` — skips translation fetch when already loaded. `tests/unit/sectionPreloadOrchestrator.test.js` — background translation preload skipped when cached. Existing `applyLocaleTemporarily` test confirms `loadTranslations: false` skips fetch.

**How to test in the browser:**
1. Run `npm run dev`, open DevTools → **Network**, filter `i18n`.
2. Hard refresh on `/vi/log-in` — note request count for `section-auth` (`en.json` + `vi.json` = 2 GETs after P-01).
3. Navigate in-app to another auth route (e.g. sign-up) — **no new** duplicate burst for the same section/locale if cache is warm.
4. DevTools → **Console** (one paste after navigating to `/vi/log-in`):
   ```js
   (async () => {
     const calls = [];
     const orig = window.fetch;
     window.fetch = async (...args) => {
       const [url, opts = {}] = args;
       if (typeof url === 'string' && url.includes('/i18n/section-auth/')) {
         calls.push({ url, method: opts.method || 'GET', t: performance.now() });
       }
       return orig(...args);
     };
     const r = await import('/src/router/index.js');
     const router = r.default;
     const section = window.__CURRENT_SECTION__ || 'auth';
     try {
       calls.length = 0;
       await router.push('/vi/sign-up');
       await new Promise((r) => setTimeout(r, 800));
       console.table(calls);
       console.log({
         authI18nFetchesOnSecondAuthNav: calls.length,
         pass: calls.length === 0,
         note: 'calls.length === 0 means beforeResolve skipped duplicate load (P-02)',
       });
     } finally {
       window.fetch = orig;
     }
   })();
   ```
5. **Expected:** On second auth navigation with warm cache, `authI18nFetchesOnSecondAuthNav: 0`, `pass: true`. First cold load to `/vi/log-in` still fetches JSON normally.

---

### P-03 — `clearAllCache()` on locale switch may evict non-translation caches

**File:** `src/utils/translation/localeManager.js` line 507  
**Severity:** Medium  

`clearTranslationCaches()` calls `clearAllCache()` from `cacheHandler`. If `cacheHandler` is a shared in-memory store used by other parts of the application (auth tokens, API responses, etc.), a locale switch will wipe them too.

**Fix:** Use a translation-namespaced cache clear. Either pass a prefix to `clearAllCache('translation_')` or track cache keys locally and delete only those.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `clearTranslationCaches()` called `clearAllCache()`, wiping the shared `cacheHandler` store entirely on every locale switch. Other subsystems (asset URLs, JSON config, etc.) also use `cacheHandler` with their own key prefixes.

**Why it happened:** Translation caching was added before prefix-scoped invalidation existed; locale switch reused the blunt clear-all helper.

**What changed:** `translationLoader.js` — `clearTranslationCaches()` now calls `removeCacheKeysByPrefix(TRANSLATION_CACHE_KEY_PREFIX)` (`translation_`) instead of `clearAllCache()`. The in-memory `loadedTranslations` Map is still cleared. Uses the same prefix-clear API added for **ASSET_PRELOAD_AUDIT** (`removeCacheKeysByPrefix` in `cacheHandler.js`).

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md** — reuses the existing `removeCacheKeysByPrefix` pattern from asset env invalidation; only narrows translation cache clear scope.

**How it was tested:** `tests/unit/translationLoader.test.js` — `translationLoader cache clear (P-03)` asserts `removeCacheKeysByPrefix('translation_')` is called and `clearAllCache` is not used.

**How to test in the browser:**
1. Run `npm run dev`, DevTools → **Console** (one paste):
   ```js
   (async () => {
     const { setValueWithExpiration, getValueFromCache } = await import('/src/utils/common/cacheHandler.js');
     const { clearTranslationCaches } = await import('/src/utils/translation/translationLoader.js');
     setValueWithExpiration('asset_url_test_keep', 'survive-locale-switch');
     setValueWithExpiration('translation_auth_vi', { demo: true });
     clearTranslationCaches();
     console.log({
       assetSurvived: getValueFromCache('asset_url_test_keep') === 'survive-locale-switch',
       translationCleared: getValueFromCache('translation_auth_vi') === null,
       pass:
         getValueFromCache('asset_url_test_keep') === 'survive-locale-switch' &&
         getValueFromCache('translation_auth_vi') === null
     });
   })();
   ```
2. **Expected:** `assetSurvived: true`, `translationCleared: true`, `pass: true`.
3. **Locale switch smoke test:** Use the language `<select>` on `/log-in` — translations reload for the new locale; asset/config caches are not globally wiped (no unexpected re-fetch storm beyond translation JSON).

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Concurrent `loadTranslationsForSection` calls for the same section/locale used `waitForTranslationLoad`, which polled every 100 ms for up to 5 s. That added latency and wasted timer/microtask work even when the lead fetch had already finished.

**Why it happened:** Early dedupe used a `Set` plus polling waiter before Promise-based sharing was implemented.

**What changed:** `translationLoader.js` — replaced `translationsLoadingInProgress` + `waitForTranslationLoad` with `inFlightPromises` (`Map` of shared promises). The map entry is registered synchronously before fetch work starts (safe under `Promise.all`). Concurrent callers `await` the same promise; `clearTranslationCaches()` clears the map. **L-07** failure sentinel (`null` in `loadedTranslations`, `{}` returned) unchanged.

**Conflict check:** No override of **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md** — same dedupe semantics, faster concurrent waiters; complements **P-02** (fewer duplicate schedulers).

**How it was tested:** `tests/unit/translationLoader.test.js` — `translationLoader in-flight promise (P-04)` (parallel callers, one fetch, no 100 ms `setTimeout` polls). Existing `translationLoader concurrent wait (L-07)` still passes.

**How to test in the browser:**
1. Run `npm run dev`, open `/log-in`, DevTools → **Console** (one paste):
   ```js
   (async () => {
     const setTimeoutCalls = [];
     const origSetTimeout = window.setTimeout;
     window.setTimeout = function (...args) {
       if (args[1] === 100) setTimeoutCalls.push({ delay: args[1] });
       return origSetTimeout.apply(this, args);
     };
     const tl = await import('/src/utils/translation/translationLoader.js');
     tl.clearTranslationCaches();
     let release;
     const gate = new Promise((r) => { release = r; });
     const origFetch = window.fetch;
     window.fetch = async (...args) => {
       const [url] = args;
       if (typeof url === 'string' && url.includes('/i18n/section-auth/en.json')) {
         await gate;
       }
       return origFetch(...args);
     };
     try {
       const p1 = tl.loadTranslationsForSection('auth', 'en');
       const p2 = tl.loadTranslationsForSection('auth', 'en');
       const pollsWhileInFlight = setTimeoutCalls.length;
       release();
       const [a, b] = await Promise.all([p1, p2]);
       console.log({
         pollsWhileInFlight,
         sameResult: JSON.stringify(a) === JSON.stringify(b),
         pass: pollsWhileInFlight === 0 && a && b
       });
     } finally {
       window.fetch = origFetch;
       window.setTimeout = origSetTimeout;
     }
   })();
   ```
2. **Expected:** `pollsWhileInFlight: 0`, `sameResult: true`, `pass: true`.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass; partially addressed earlier by **L-08**).

**What was broken:** Original `getLocaleDisplayName` only mapped `en` and `vi`; other locales returned raw codes (e.g. `"ar"`). **L-08** added `LOCALE_DISPLAY_METADATA` for all 75 `SUPPORTED_LOCALES` and wired the language switcher — but there was still no `Intl.DisplayNames` fallback for future/unknown codes.

**Why it happened:** Display names were hardcoded incrementally before the shared metadata map existed.

**What changed:**
- **L-08 (prior):** `localeDisplayMetadata.js` + `getLocaleSwitcherOptions()` — curated `label` / `traditionalName` for every supported locale.
- **P-05 (this pass):** `localeManager.js` — `resolveIntlLocaleDisplayName()` via `Intl.DisplayNames` (with BCP 47 normalization for regional codes like `zh-tw`). `getLocaleDisplayName(localeCode, displayLocale?)` uses curated metadata first, then Intl, then raw code. `getLocaleSwitcherOptions()` uses the same Intl fallback when metadata is missing.

**Conflict check:** No override of preload work. Complements **L-08** — switcher keeps curated native-script names; Intl covers gaps if a locale is added before metadata is updated.

**How it was tested:** `tests/unit/localeSwitcherOptions.test.js` — `getLocaleDisplayName (P-05)` (all supported codes have labels; `haw` resolves via Intl; `displayLocale` param works on Intl path).

**How to test in the browser:**
1. Run `npm run dev`, open any page with the language `<select>`.
2. DevTools → **Console** (one paste):
   ```js
   (async () => {
     const { getLocaleDisplayName, getLocaleSwitcherOptions, SUPPORTED_LOCALES } =
       await import('/src/utils/translation/localeManager.js');
     const options = getLocaleSwitcherOptions();
     console.log({
       supportedCount: SUPPORTED_LOCALES.length,
       optionsCount: options.length,
       arLabel: getLocaleDisplayName('ar'),
       viLabel: getLocaleDisplayName('vi'),
       intlFallback: getLocaleDisplayName('haw'),
       allHaveLabels: options.every((o) => o.label !== o.code),
       pass:
         getLocaleDisplayName('ar') === 'Arabic' &&
         getLocaleDisplayName('vi') === 'Vietnamese' &&
         getLocaleDisplayName('haw') === 'Hawaiian' &&
         options.every((o) => o.label !== o.code)
     });
   })();
   ```
3. **Expected:** `arLabel: 'Arabic'`, `viLabel: 'Vietnamese'`, `intlFallback: 'Hawaiian'`, `allHaveLabels: true`, `pass: true`. Dropdown shows human-readable names, not raw codes.

---

### P-06 — In-memory `loadedTranslations` Map grows unbounded

**File:** `src/utils/translation/translationLoader.js` lines 23, 276  
**Severity:** Low  

The `loadedTranslations` Map accumulates all ever-loaded section/locale pairs for the lifetime of the page. After a user switches through several locales, many locale sets are in memory simultaneously with no eviction. `clearTranslationCaches()` does clear this map, but it is called on every locale switch which forces a full reload of all sections.

**Fix:** Set a reasonable max-entries limit, or scope the map to only the currently active locale, evicting old locale entries on switch.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `loadedTranslations` kept every `{section}_{locale}` entry for the page lifetime until `clearTranslationCaches()` ran. Navigating or preloading many sections was bounded but switching locales during a long session could retain multiple locale snapshots in memory between explicit clears; there was no per-locale scope or overflow cap on the hot in-memory map.

**Why it happened:** The map tracked concurrent-load outcomes (L-07) and cache-hit shortcuts without eviction policy.

**What changed:** `translationLoader.js` — added `rememberLoadedTranslation()`:
- On each in-memory write, **evicts entries for other locales** (keeps only the active locale’s section keys, e.g. `auth_vi` + `shop_vi`).
- **Max 32 entries** safety cap (FIFO trim if exceeded).
- `finishTranslationLoad` and cache-hit path use `rememberLoadedTranslation`. `clearTranslationCaches()` still full-clears on locale switch (with **P-03** prefix TTL clear).

**Conflict check:** No override of preload or **P-03**/**P-04** work. TTL `cacheHandler` entries unchanged; `areTranslationsLoadedForSection` still reads TTL cache across locales. In-memory map is the bounded hot layer only.

**How it was tested:** `tests/unit/translationLoader.test.js` — `translationLoader in-memory scope (P-06)` (other locales evicted on new locale load; multiple sections kept for same locale).

**How to test in the browser:**
1. Run `npm run dev`, open `/vi/log-in`.
2. DevTools → **Console** (one paste):
   ```js
   (async () => {
     const tl = await import('/src/utils/translation/translationLoader.js');
     tl.clearTranslationCaches();
     await tl.loadTranslationsForSection('auth', 'vi');
     const afterVi = tl.getTranslationStatistics().loadedSections;
     await tl.loadTranslationsForSection('auth', 'fr');
     const afterFr = tl.getTranslationStatistics().loadedSections;
     console.log({
       afterVi,
       afterFr,
       viEvicted: !afterFr.includes('auth_vi'),
       frPresent: afterFr.includes('auth_fr'),
       pass: !afterFr.includes('auth_vi') && afterFr.includes('auth_fr')
     });
   })();
   ```
3. **Expected:** `viEvicted: true`, `frPresent: true`, `pass: true`.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `localeManager.js` attached `window.APP.setLocale`, `switchLocale`, `testLocalePersistence`, etc. on every build. In production, any injected script or extension could call those helpers and overwrite the persisted locale in `localStorage` — an XSS-adjacent attack surface.

**Why it happened:** Console helpers were added for QA/dev browser testing without an environment guard.

**What changed:** Wrapped the entire developer console block in `if (typeof window !== 'undefined' && import.meta.env.DEV)`. Production bundles no longer register locale mutation/statistics helpers on `window.APP`. Dev workflow unchanged (`npm run dev`).

**Conflict check:** No override of preload or performance audit work. **TRANSLATION_AUDIT** browser snippets that use `window.APP` are dev-only by design. Auth-related `window.APP` helpers in `authHandler.js` / `authHandlerDev.js` are unchanged (out of S-01 scope).

**How it was tested:** `tests/unit/localeManagerWindowApi.test.js` — APIs present when `DEV=true`, absent when `DEV=false`.

**How to test in the browser:**
1. **`npm run dev`** — Console (one paste):
   ```js
   console.log({
     devMode: import.meta.env.DEV,
     hasSetLocale: typeof window.APP?.setLocale === 'function',
     pass: import.meta.env.DEV && typeof window.APP?.setLocale === 'function'
   });
   ```
   **Expected:** `hasSetLocale: true`, `pass: true`.

2. **`npm run build` && `npm run preview`** — open preview URL, Console (one paste):
   ```js
   console.log({
     devMode: import.meta.env.DEV,
     hasSetLocale: typeof window.APP?.setLocale === 'function',
     pass: !window.APP?.setLocale
   });
   ```
   **Expected:** `hasSetLocale: false`, `pass: true` (locale switcher UI still works; only console mutation API is gone).

---

### S-02 — `vif.json` typo file causes silent English fallback for Vietnamese shop users

**File:** `public/i18n/section-shop/vif.json`, `public/i18n/vif.json`  
**Severity:** Medium (data integrity)  

The file is named `vif.json` instead of `vi.json`. Vietnamese (`vi`) users navigating the shop section will silently receive English content with no error. The loader will:
1. Validate `section-shop/vi.json` — HEAD returns 404.
2. Log `warn: Requested locale translation file missing, will use English only`.
3. Render English shop content to Vietnamese-locale users without any notification.

**Fix:** Rename `vif.json` → `vi.json` in both `public/i18n/section-shop/` and `public/i18n/`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Translation files were named `vif.json` instead of `vi.json` in `public/i18n/section-shop/` and `public/i18n/`. The loader requests `/i18n/section-shop/vi.json` for Vietnamese shop users; the typo file was never fetched, so shop copy silently fell back to English.

**Why it happened:** Filename typo (`vif` vs `vi`) in static assets.

**What changed:** Renamed `public/i18n/section-shop/vif.json` → `vi.json` and `public/i18n/vif.json` → `vi.json`. No loader code change — **P-01** already uses GET + `Content-Type` check; missing `vi.json` previously returned `{}` and English fallback.

**Conflict check:** No override of preload or **P-01**/**S-01** work — data fix only.

**How it was tested:** File rename verified on disk; `grep vif.json` — no remaining asset paths (audit doc references only).

**How to test in the browser:**
1. Run `npm run dev`, open `/vi/shop` (or shop route with Vietnamese locale).
2. DevTools → **Network** — filter `i18n/section-shop` — confirm **`vi.json`** loads (200, `Content-Type: application/json`), not a missing `vi.json` + English-only fallback.
3. DevTools → **Console** (one paste):
   ```js
   (async () => {
     const res = await fetch('/i18n/section-shop/vi.json');
     const ct = res.headers.get('content-type') || '';
     const body = res.ok && ct.includes('application/json') ? await res.json() : null;
     console.log({
       status: res.status,
       isJson: ct.includes('application/json'),
       keyCount: body ? Object.keys(body).length : 0,
       pass: res.ok && ct.includes('application/json') && body && Object.keys(body).length > 0
     });
   })();
   ```
4. **Expected:** `status: 200`, `isJson: true`, `keyCount > 0`, `pass: true`. Shop UI shows Vietnamese strings where keys exist.

---

### S-03 — Translation keys used with `v-html` risk XSS

**Severity:** Medium (potential)  

If any component renders a translated string using `v-html` (e.g. for rich-text translations with HTML links), malicious content injected into a translation file (via a compromised CDN, supply-chain attack on the translation service, or an insider) would execute as HTML in the user's browser. `vue-i18n`'s `$t()` HTML-escapes by default, but using `v-html` with translated content bypasses this.

**Action:** Audit all components for `v-html` usage that receives translated strings. Prefer `i18n-t` component with slots for rich-text translations.

#### Resolution ✅

**Status:** Resolved (audit complete; no code change required for i18n path).

**What was broken:** Potential XSS if translated strings were rendered with `v-html`, bypassing vue-i18n’s default HTML escaping.

**Why it happened:** Rich-text patterns sometimes tempt `v-html` + `$t()` — none were found in this codebase.

**What changed:**
- Full audit of `src/**/*.vue` — **no** `v-html` bound to `$t()` / `t()` / i18n output.
- **Two** unrelated `v-html` usages remain (API/demo HTML, not translation JSON):
  - `TierCard.vue` — `tier.footer.buttonText` (tier/API data)
  - `SubscriptionCard.vue` — `cardData.fullDescription` / features (props/demo data)
- Added `tests/unit/translationSecurityAudit.test.js` — fails CI if any Vue file combines `v-html` with i18n translation calls.

**Conflict check:** No preload impact. Does not change TierCard/SubscriptionCard markup (out of scope — not i18n-sourced).

**How it was tested:** `npm run test:unit -- run tests/unit/translationSecurityAudit.test.js`

**How to test in the browser:**

> **Why `fetch('/src/...TierCard.vue')` shows `tierCardHasVHtml: false`**  
> That URL is not a static file in dev/prod — the server often returns `index.html` (SPA fallback) or HTML without the `.vue` source. Use Vite **`?raw`** imports below (dev only), or rely on `npm run test:unit -- run tests/unit/translationSecurityAudit.test.js`.

1. Run `npm run dev`, DevTools → **Console** (one paste — scans TierCard + SubscriptionCard sources):
   ```js
   (async () => {
     const i18nVHtml = /v-html\s*=\s*["'][^"']*(\$t\s*\(|[^a-zA-Z_]t\s*\(\s*['"`])/;
     const files = [
       ['/src/components/ui/card/dashboard/TierCard.vue', 'TierCard'],
       ['/src/templates/profileAbdullah/components/SubscriptionCard.vue', 'SubscriptionCard'],
     ];
     const results = [];
     for (const [path, label] of files) {
       try {
         const src = (await import(`${path}?raw`)).default;
         results.push({
           label,
           hasVHtml: /v-html/.test(src),
           vHtmlWithI18n: i18nVHtml.test(src),
         });
       } catch (e) {
         results.push({ label, error: e.message });
       }
     }
     console.table(results);
     console.log({
       pass:
         results.every((r) => r.hasVHtml && !r.vHtmlWithI18n) &&
         results.length === 2,
     });
   })();
   ```
2. **Expected:** both rows `hasVHtml: true`, `vHtmlWithI18n: false`, `pass: true`. No project-wide `v-html` + `$t()` (CI test covers all `src/**/*.vue`).

3. **Optional — live auth page:** open `/log-in`, pick a translated label in Elements — text nodes from `$t()` should **not** be under an element rendered via `v-html` (auth components use `{{ $t(...) }}` / `:text`, not `v-html`).

---

### S-04 — No Subresource Integrity for translation JSON

**Severity:** Low  

Translation files are fetched from the same origin (`/i18n/...`) so a CDN or reverse-proxy compromise could serve modified translations. There is no hash-based integrity check on the fetched JSON.

**Note:** This is a general CDN security concern, not specific to i18n. Mention it to the infrastructure team if translation files are ever moved to a CDN.

#### Resolution ✅

**Status:** Resolved (accepted for current architecture; documented).

**What was broken:** `fetch('/i18n/...')` has no Subresource Integrity hash — a compromised CDN or reverse proxy could serve altered JSON if assets leave same-origin hosting.

**Why it happened:** Translation JSON is served as same-origin static files from `public/i18n/`; `fetch()` has no built-in SRI (unlike `<script integrity="...">`). Section **JS/CSS bundles** already use manifest SRI per **SECTION_PRELOAD_AUDIT S-01/S-02** — translation JSON is a separate asset class.

**What changed:**
- `translationLoader.js` — documented trust boundary in code comment (S-04): same-origin static JSON today; add build-time hash verification **if** `/i18n/` moves to external CDN.
- No runtime SRI added — out of scope for same-origin Vite `public/` assets; mitigations are HTTPS, deploy integrity, and `Content-Type` validation (**P-01**).
- Infrastructure note: if i18n files move to CDN, follow section-bundle manifest pattern (`integrity` map + verify before merge).

**Conflict check:** Does not override **SECTION_PRELOAD_AUDIT** bundle SRI work — applies only to translation JSON fetch path.

**How it was tested:** `tests/unit/translationSecurityAudit.test.js` — S-04 policy comment present; URLs remain under `/i18n/section-*`.

**How to test in the browser:**
1. Run `npm run dev`, open `/log-in`, DevTools → **Network** → click `en.json` under `/i18n/section-auth/`.
2. Confirm **Request URL** is same-origin (`localhost` or your dev host), **not** a third-party CDN.
3. Console (one paste):
   ```js
   (async () => {
     const url = '/i18n/section-auth/en.json';
     const res = await fetch(url);
     const origin = new URL(url, location.origin).origin;
     console.log({
       pageOrigin: location.origin,
       jsonOrigin: origin,
       sameOrigin: origin === location.origin,
       contentType: res.headers.get('content-type'),
       pass: origin === location.origin && (res.headers.get('content-type') || '').includes('json')
     });
   })();
   ```
4. **Expected:** `sameOrigin: true`, `pass: true`. If i18n is ever CDN-hosted, require infra to add hash manifest before migration.

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