# Translation System Audit

**Date:** 2026-05-27 (updated 2026-05-30 — L-16 locale persistence hotfix)  
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
       ['/src/templates/profile/views/SubscriptionCard.vue', 'SubscriptionCard'],
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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `pinia-plugin-persistedstate` v4 stores plain JSON in `localStorage` with no expiry. The comment claiming “90 days TTL is handled automatically” was false — locale preference persisted indefinitely until the user cleared storage.

**Why it happened:** TTL was assumed to be built into the persistence plugin; v4 only read/writes JSON and does not implement expiry.

**What changed:**
- `useLocaleStore.js` — added `LOCALE_PREFERENCE_TTL_MS` (90 days), `serializeLocalePersistedState`, and `deserializeLocalePersistedState`. Persist config now uses a custom `serializer` that wraps `{ data, expiresAt }`. Expired entries deserialize to `{ locale: null }` so `resolveActiveLocale()` falls through to URL/browser/default. Legacy plain `{ locale }` blobs (pre-fix) are still accepted and re-wrapped with TTL on the next write.
- **Post-audit (L-16):** `setLocale` also calls `localStorage.setItem('locale_preference', serializeLocalePersistedState({ locale }))` so user-initiated switches via `setActiveLocale` / `LanguageSwitcher` / settings always flush to storage even when the plugin’s reactive persist path does not write synchronously.
- Also satisfies **F-01** (persistence expiry missing feature).

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Preload persistence (`usePreloadStore`) uses its own serializer for Sets/build-hash invalidation — unrelated to locale TTL.

**How it was tested:** `tests/unit/useLocaleStore.test.js` — `useLocaleStore persistence TTL (B-01)` covers serialize wrap, valid expiry, expired reset, legacy migration, and invalid JSON.

**How to test in the browser:**

1. Run `npm run dev`, open any page (e.g. `/log-in`).

2. **Confirm fix is in bundle** (DevTools → Console, one paste):
   ```js
   fetch('/src/stores/useLocaleStore.js').then(r=>r.text()).then(src=>console.log({hasTtlSerializer:/serializeLocalePersistedState/.test(src)&&/expiresAt/.test(src),hasFalseTtlComment:/handled by the storage mechanism automatically/.test(src)}));
   ```
   **Expected:** `hasTtlSerializer: true`, `hasFalseTtlComment: false`.

3. **TTL wrap + expiry simulation** (one paste — uses same serializer as the store; does not mutate your real preference until step 4):
   ```js
   (async () => {
     const {
       serializeLocalePersistedState,
       deserializeLocalePersistedState,
       LOCALE_PREFERENCE_TTL_MS,
     } = await import('/src/stores/useLocaleStore.js');
     const fresh = JSON.parse(serializeLocalePersistedState({ locale: 'vi' }));
     const valid = deserializeLocalePersistedState(JSON.stringify(fresh));
     const expired = deserializeLocalePersistedState(JSON.stringify({
       data: { locale: 'vi' },
       expiresAt: Date.now() - 1,
     }));
     const legacy = deserializeLocalePersistedState(JSON.stringify({ locale: 'vi' }));
     console.log({
       ttlDays: LOCALE_PREFERENCE_TTL_MS / (24 * 60 * 60 * 1000),
       freshHasExpiresAt: typeof fresh.expiresAt === 'number',
       validLocale: valid.locale,
       expiredLocale: expired.locale,
       legacyLocale: legacy.locale,
       pass:
         typeof fresh.expiresAt === 'number' &&
         valid.locale === 'vi' &&
         expired.locale === null &&
         legacy.locale === 'vi',
     });
   })();
   ```
   **Expected:** `ttlDays: 90`, `freshHasExpiresAt: true`, `validLocale: 'vi'`, `expiredLocale: null`, `legacyLocale: 'vi'`, `pass: true`.

4. **Live localStorage check** — switch language via UI or `window.APP.setLocale('vi')`, then:
   ```js
   (() => {
     const raw = localStorage.getItem('locale_preference');
     const parsed = raw ? JSON.parse(raw) : null;
     console.log({
       key: 'locale_preference',
       hasExpiresAt: typeof parsed?.expiresAt === 'number',
       storedLocale: parsed?.data?.locale ?? parsed?.locale ?? null,
       expiresInDays: parsed?.expiresAt
         ? Math.round((parsed.expiresAt - Date.now()) / (24 * 60 * 60 * 1000))
         : null,
     });
   })();
   ```
   **Expected after a locale change on fixed code:** `hasExpiresAt: true`, `storedLocale: 'vi'` (or your choice), `expiresInDays` ≈ 90.

5. **Optional — expiry behavior:** DevTools → Application → Local Storage → edit `locale_preference` so `expiresAt` is in the past → hard refresh. **Expected:** persisted locale ignored; app resolves locale from URL/browser/default (same as a first-time visitor without a saved preference).

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** The unsupported-locale warning used a single-quoted string, so `${next}` was printed literally instead of interpolating the selected locale code.

**Why it happened:** Copy-paste or typo — regular string quotes instead of backtick template literal.

**What changed:** `LanguageSwitcher.vue` — `console.warn` now uses a backtick template literal so `"${next}"` in the message is the actual locale value.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Logging-only change; no preload or locale pipeline behavior affected.

**How it was tested:** Code review — grep confirms backtick form; single-quoted `${next}` pattern removed from source.

**How to test in the browser:**

1. Run `npm run dev`, open a page with the language `<select>` (e.g. `/log-in`).

2. **Confirm fix is in bundle** (DevTools → Console, one paste):
   ```js
   fetch('/src/components/ui/nav/language/LanguageSwitcher.vue').then(r=>r.text()).then(src=>{const m=src.match(/console\.warn\(([`'"])[\s\S]*?Unsupported locale[\s\S]*?\1\)/);console.log({usesBacktickTemplate:m?.[1]==='`',hasBrokenSingleQuote:/console\.warn\('\[LanguageSwitcher\] Unsupported locale "\$\{next\}"'/.test(src),snippet:m?.[0]?.slice(0,80)});});
   ```
   **Expected:** `usesBacktickTemplate: true`, `hasBrokenSingleQuote: false`.

3. **Prove interpolation** (one paste — simulates old vs new warn text; does not touch the UI):
   ```js
   (() => {
     const next = 'xx-invalid';
     const broken = '[LanguageSwitcher] Unsupported locale "${next}", coercing to "en".';
     const fixed = `[LanguageSwitcher] Unsupported locale "${next}", coercing to "en".`;
     console.log({ broken, fixed, pass: broken.includes('${next}') && fixed.includes('xx-invalid') && !fixed.includes('${next}') });
   })();
   ```
   **Expected:** `broken` contains literal `${next}`; `fixed` contains `xx-invalid`; `pass: true`.

4. **Optional UI trigger:** Hard to hit in normal use (options come from `supportedCodes`). To exercise the real warn path, temporarily add a fake `<option value="xx">` in DevTools or patch `supportedCodes` in a breakpoint — not required if steps 2–3 pass.

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

#### Resolution ✅

**Status:** Resolved (root `dir` attribute; full CSS RTL sprint out of scope).

**What was broken:** RTL locales (`ar`, `he`, `fa`, `fa-af`, `ur`, `ps`) set `<html lang>` correctly but never set `<html dir>`, so layout stayed LTR and RTL scripts rendered incorrectly.

**Why it happened:** Only `lang` was updated in locale application paths; text direction was not part of the locale pipeline.

**What changed:**
- `localeManager.js` — added `RTL_LOCALES`, `getDocumentDirection()`, and `applyDocumentLocaleAttributes()` (sets both `lang` and `dir`). Used in `setActiveLocale` and `applyLocaleTemporarily`.
- `main.js` — bootstrap and Pinia locale watch now call `applyDocumentLocaleAttributes` so persisted or URL-resolved RTL locales get correct `dir` on first paint.
- Does **not** implement app-wide CSS logical properties, mirrored icons, or RTL font stacks (**F-07** remains a separate sprint).

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Document attributes only; translation/section preload timing unchanged.

**How it was tested:** `tests/unit/applyLocaleTemporarily.test.js` — `document RTL direction (B-03)` covers `getDocumentDirection` and `applyLocaleTemporarily` updating `<html dir>`.

**How to test in the browser:**

1. Run `npm run dev`, open any page (e.g. `/log-in`).

2. **Confirm fix is in bundle** (DevTools → Console, one paste):
   ```js
   fetch('/src/utils/translation/localeManager.js').then(r=>r.text()).then(src=>console.log({hasRtlLocales:/export const RTL_LOCALES/.test(src),hasApplyDocumentLocaleAttributes:/function applyDocumentLocaleAttributes/.test(src),setsDirInSetActive:/applyDocumentLocaleAttributes\(localeCode\)/.test(src)}));
   ```
   **Expected:** all three flags `true`.

3. **RTL vs LTR on `<html>`** (one paste — uses same helpers as production; no persistence):
   ```js
   (async () => {
     const lm = await import('/src/utils/translation/localeManager.js');
     const read = () => ({
       lang: document.documentElement.getAttribute('lang'),
       dir: document.documentElement.getAttribute('dir'),
     });
     const before = read();
     await lm.applyLocaleTemporarily('ar', { loadTranslations: false });
     const rtl = read();
     await lm.applyLocaleTemporarily('en', { loadTranslations: false });
     const ltr = read();
     console.log({
       before,
       rtl,
       ltr,
       pass: rtl.lang === 'ar' && rtl.dir === 'rtl' && ltr.lang === 'en' && ltr.dir === 'ltr',
     });
   })();
   ```
   **Expected:** `pass: true`; after Arabic step `dir: 'rtl'`, after English step `dir: 'ltr'`.

4. **Persisted locale switch** (optional): `await window.APP.setLocale('ar')` then inspect:
   ```js
   console.log({ lang: document.documentElement.lang, dir: document.documentElement.dir });
   ```
   **Expected:** `lang: 'ar'`, `dir: 'rtl'`. Switch back with `await window.APP.setLocale('en')` → `dir: 'ltr'`.

5. **URL locale** (optional): navigate to `/ar/log-in` (or another RTL-prefixed route if configured). **Expected:** `<html lang="ar" dir="rtl">` in Elements panel.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `selectId` was built with `Math.random()`, producing a new id on every component instance creation. That is non-deterministic and would cause SSR/hydration mismatches if the app is ever server-rendered.

**Why it happened:** Quick unique-id pattern before Vue 3.5's built-in `useId()` was adopted.

**What changed:** `LanguageSwitcher.vue` — import `useId` from `vue` and set `const selectId = 'language-switcher-' + useId()` for a stable, hydration-safe id per component instance.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Accessibility id only; no locale or preload behavior changed.

**How it was tested:** `tests/unit/localeSwitcherOptions.test.js` — `LanguageSwitcher selectId (B-04)` asserts `useId` import, assignment pattern, and no `Math.random()` in source.

**How to test in the browser:**

1. Run `npm run dev`, open a page with the language `<select>` (e.g. `/log-in`).

2. **Confirm fix is in bundle** (DevTools → Console, one paste):
   ```js
   fetch('/src/components/ui/nav/language/LanguageSwitcher.vue').then(r=>r.text()).then(src=>console.log({usesUseId:/\buseId\b/.test(src)&&/language-switcher-'\s*\+\s*useId\(\)/.test(src),usesMathRandom:/Math\.random\(\)/.test(src)}));
   ```
   **Expected:** `usesUseId: true`, `usesMathRandom: false`.

3. **Label ↔ select association + id stability** (one paste):
   ```js
   (() => {
     const select = document.querySelector('select[id^="language-switcher-"]');
     const label = select?.id ? document.querySelector(`label[for="${select.id}"]`) : null;
     const id1 = select?.id ?? null;
     const id2 = select?.id ?? null;
     console.log({
       selectFound: !!select,
       labelMatchesSelect: !!label,
       idPrefix: id1?.startsWith('language-switcher-') ?? false,
       idStableOnReRead: id1 === id2 && !!id1,
       pass: !!select && !!label && id1?.startsWith('language-switcher-') && id1 === id2,
     });
   })();
   ```
   **Expected:** `pass: true`, `labelMatchesSelect: true`, `idStableOnReRead: true`.

4. **Optional — remount check:** Navigate away and back to a page with the switcher; the id may change on remount (new instance) but should still start with `language-switcher-` and keep label `for` in sync (inspect Elements).

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass; partial **F-11** base-bundle foundation).

**What was broken:** The language switcher `aria-label` and screen-reader label were hardcoded English (`"Language selector"`, `"Language"`), so non-English users always heard English accessible names.

**Why it happened:** Labels were static HTML strings; global UI keys were not defined or loaded at runtime (**F-11** — root bundles unused).

**What changed:**
- `LanguageSwitcher.vue` — `:aria-label="$t('ui.languageSelector')"` and label text `{{ $t('ui.language') }}`.
- `public/i18n/base/en.json` and `public/i18n/base/vi.json` — new global `ui` namespace with selector labels.
- `translationLoader.js` — `loadBaseTranslations()` fetches `/i18n/base/{locale}.json` (English required, target locale merged when present; otherwise vue-i18n `fallbackLocale: 'en'` applies).
- `main.js` — loads base translations once before `app.mount()` (small fetch, does not block router/preload orchestration).
- `localeManager.js` — `setActiveLocale` and temporary locale paths reload base bundle after cache clear.
- `index.js` — exports `loadBaseTranslations`.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Adds one lightweight `/i18n/base/` fetch at startup and on locale switch; section preload remains non-blocking. Full **F-11** (all locales, deprecating orphan `public/i18n/en.json`, CI rules) is still open.

**How it was tested:** `tests/unit/translationLoader.test.js` — `translationLoader base bundle (B-05)`; `tests/unit/localeSwitcherOptions.test.js` — `LanguageSwitcher a11y labels (B-05)`; `tests/unit/applyLocaleTemporarily.test.js` — base loads before section translations.

**How to test in the browser:**

1. Run `npm run dev`, open `/log-in`.

2. **Confirm fix is in bundle** (DevTools → Console, one paste):
   ```js
   Promise.all([
     fetch('/src/components/ui/nav/language/LanguageSwitcher.vue').then(r=>r.text()),
     fetch('/src/utils/translation/translationLoader.js').then(r=>r.text()),
   ]).then(([vueSrc, loaderSrc])=>console.log({
     usesTranslatedAria:/\$t\('ui\.languageSelector'\)/.test(vueSrc),
     usesTranslatedLabel:/\$t\('ui\.language'\)/.test(vueSrc),
     hasLoadBaseTranslations:/export async function loadBaseTranslations/.test(loaderSrc),
   }));
   ```
   **Expected:** all three flags `true`.

3. **Base bundle + i18n messages** (one paste):
   ```js
   (async () => {
     const { loadBaseTranslations } = await import('/src/utils/translation/translationLoader.js');
     const { getI18nInstance } = await import('/src/utils/translation/i18nInstance.js');
     await loadBaseTranslations('vi');
     const i18n = getI18nInstance();
     console.log({
       viSelector: i18n.global.t('ui.languageSelector'),
       viLanguage: i18n.global.t('ui.language'),
       pass:
         i18n.global.t('ui.languageSelector') === 'Bộ chọn ngôn ngữ' &&
         i18n.global.t('ui.language') === 'Ngôn ngữ',
     });
   })();
   ```
   **Expected:** Vietnamese strings; `pass: true`.

4. **Live DOM accessible names** — switch to Vietnamese via UI or `await window.APP.setLocale('vi')`, then:
   ```js
   (() => {
     const select = document.querySelector('select[id^="language-switcher-"]');
     const form = select?.closest('form');
     const label = select?.id ? document.querySelector(`label[for="${select.id}"]`) : null;
     console.log({
       ariaLabel: form?.getAttribute('aria-label'),
       labelText: label?.textContent?.trim(),
       pass:
         form?.getAttribute('aria-label') === 'Bộ chọn ngôn ngữ' &&
         label?.textContent?.trim() === 'Ngôn ngữ',
     });
   })();
   ```
   **Expected:** `pass: true` when locale is `vi`. English locale → `"Language selector"` / `"Language"`.

5. **Network smoke test:** DevTools → Network → filter `base` — on refresh expect `/i18n/base/en.json` and `/i18n/base/vi.json` when active locale is Vietnamese.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** When `mergeLocaleMessage` is unavailable, the fallback used a shallow spread into `setLocaleMessage`. A new section/base load could replace entire top-level namespaces (e.g. `auth.login`) and drop nested keys already present in the i18n message bag.

**Why it happened:** Defensive fallback path copied the same shallow-merge pattern that L-02 fixed for cached return values.

**What changed:** `translationLoader.js` — `applyTranslationsToI18n` now calls `deepMergePreferChild(existing, messages)` before `setLocaleMessage` (same utility as L-02). Primary path still uses `mergeLocaleMessage` when present (vue-i18n v11).

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Only affects the rare `setLocaleMessage` fallback path; fetch/preload timing unchanged.

**How it was tested:** `tests/unit/translationLoader.test.js` — `applyTranslationsToI18n setLocaleMessage fallback (B-06)` pre-seeds nested `auth.login` keys, loads a partial auth JSON, asserts `subtitle` / `button` survive alongside updated `title`.

**How to test in the browser:**

1. Run `npm run dev`, open `/log-in`.

2. **Confirm fix is in bundle** (DevTools → Console, one paste):
   ```js
   fetch('/src/utils/translation/translationLoader.js').then(r=>r.text()).then(src=>console.log({
     usesDeepMergeFallback:/setLocaleMessage\([\s\S]*deepMergePreferChild\(existing,\s*messages\)/.test(src),
     hasShallowSpreadFallback:/setLocaleMessage\(localeCode,\s*\{\s*\.\.\.existing,\s*\.\.\.messages\s*\}\)/.test(src),
   }));
   ```
   **Expected:** `usesDeepMergeFallback: true`, `hasShallowSpreadFallback: false`.

3. **Simulate fallback merge** (one paste — mirrors production merge utility; primary vue-i18n v11 path uses `mergeLocaleMessage` instead):
   ```js
   (async () => {
     const { deepMergePreferChild } = await import('/src/utils/common/objectSafety.js');
     const existing = { auth: { login: { title: 'Login', subtitle: 'Welcome', button: 'Go' } } };
     const incoming = { auth: { login: { title: 'Welcome Back' } } };
     const shallow = { ...existing, ...incoming };
     const deep = deepMergePreferChild(existing, incoming);
     console.log({
       shallowMissingSubtitle: shallow.auth?.login?.subtitle,
       deepHasSubtitle: deep.auth?.login?.subtitle,
       deepTitle: deep.auth?.login?.title,
       pass: deep.auth?.login?.subtitle === 'Welcome' && deep.auth?.login?.title === 'Welcome Back',
     });
   })();
   ```
   **Expected:** `shallowMissingSubtitle: undefined`, `deepHasSubtitle: 'Welcome'`, `pass: true`.

4. **Runtime smoke test:** With normal vue-i18n v11, `$t('auth.login.subtitle')` on `/log-in` after switching locales should still resolve nested keys (primary path unchanged). This is a regression smoke test only.

---

### B-07 — No number, date, or currency locale formatting

**Severity:** Medium  

`vue-i18n` provides `n()` (number), `d()` (datetime), and currency formatting tied to the active locale. No component in the codebase uses these. All numbers, dates, and prices are presumably rendered with JavaScript defaults or hardcoded `en-US` formatting, producing incorrect output for locale-specific conventions (e.g. European decimal comma, different date order, currency symbol placement).

**Fix:** Use `useI18n().n()` and `useI18n().d()` for any numeric, date, or currency display.

#### Resolution ✅

**Status:** Resolved (formatting foundation; component migration deferred).

**What was broken:** No vue-i18n `numberFormats` / `datetimeFormats` and no shared helpers — components used hardcoded `toLocaleString('en-US')` or `Intl.NumberFormat('en-US', …)`, so non-English locales saw US formatting.

**Why it happened:** i18n work focused on string `$t()` keys; numeric/date display was not wired to the active locale.

**What changed:**
- `localeFormatConfig.js` — `I18N_NUMBER_FORMATS` and `I18N_DATETIME_FORMATS` for `en` and `vi` (decimal, currency, percent; short/long dates).
- `localeFormatting.js` — `formatLocaleNumber`, `formatLocaleCurrency`, `formatLocaleDate` (vue-i18n `n()` / `d()` first, `Intl` + `toIntlLocaleTag` fallback for other locales).
- `main.js` — passes format configs into `createI18n`.
- `localeManager.js` — exports `toIntlLocaleTag` for BCP 47 mapping (`zh-tw` → `zh-TW`).
- `index.js` — re-exports formatting helpers and config.

**Out of scope (follow-up):** Replacing existing `toLocaleString('en-US')` / `Intl.NumberFormat('en-US')` in analytics, profile, date pickers, etc. Use the new helpers or `useI18n().n()` / `d()` when touching those files.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Static i18n config only; no preload timing changes.

**How it was tested:** `tests/unit/localeFormatting.test.js` — config presence, en vs vi number output, currency, dates, Intl fallback.

**How to test in the browser:**

1. Run `npm run dev`, open `/log-in`.

2. **Confirm fix is in bundle** (DevTools → Console, one paste):
   ```js
   Promise.all([
     fetch('/src/utils/translation/localeFormatting.js').then(r=>r.text()),
     fetch('/src/main.js').then(r=>r.text()),
   ]).then(([fmtSrc, mainSrc])=>console.log({
     hasFormatLocaleNumber:/export function formatLocaleNumber/.test(fmtSrc),
     mainUsesNumberFormats:/numberFormats:\s*I18N_NUMBER_FORMATS/.test(mainSrc),
     mainUsesDatetimeFormats:/datetimeFormats:\s*I18N_DATETIME_FORMATS/.test(mainSrc),
   }));
   ```
   **Expected:** all three flags `true`.

3. **en vs vi number formatting** (one paste):
   ```js
   (async () => {
     const { formatLocaleNumber, formatLocaleCurrency, formatLocaleDate } = await import('/src/utils/translation/localeFormatting.js');
     const sample = 1234567.89;
     const date = new Date('2026-05-29T12:00:00Z');
     console.log({
       enDecimal: formatLocaleNumber(sample, { localeCode: 'en' }),
       viDecimal: formatLocaleNumber(sample, { localeCode: 'vi' }),
       enCurrency: formatLocaleCurrency(sample, { localeCode: 'en' }),
       viCurrency: formatLocaleCurrency(sample, { localeCode: 'vi' }),
       enDate: formatLocaleDate(date, { localeCode: 'en' }),
       viDate: formatLocaleDate(date, { localeCode: 'vi' }),
       pass: formatLocaleNumber(sample, { localeCode: 'en' }) !== formatLocaleNumber(sample, { localeCode: 'vi' }),
     });
   })();
   ```
   **Expected:** `pass: true`; `enDecimal` / `viDecimal` use different grouping/separator conventions.

4. **After locale switch** — `await window.APP.setLocale('vi')`, re-run step 3 with `localeCode` omitted (uses active locale) or compare to hardcoded baseline:
   ```js
   (() => console.log({ hardcodedEnUS: (1234567.89).toLocaleString('en-US'), useHelpers: 'Run step 3 after setLocale("vi") for vi conventions' }))();
   ```

---

### B-08 — No `<link rel="alternate" hreflang>` tags for SEO

**Severity:** Medium  

The app supports 75 locales with locale-prefixed URLs (e.g. `/vi/dashboard`). Search engines expect `<link rel="alternate" hreflang="vi" href="...">` tags for each alternate language version. Without them, search engines may index only the English version or create duplicate-content penalties.

**Fix:** Use `vue-router`'s navigation hooks or a head-management library (e.g. `@vueuse/head`) to inject hreflang tags per route.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Locale-prefixed URLs existed (`/vi/dashboard`, unprefixed `en`) but `<head>` had no `<link rel="alternate" hreflang="…">` tags, so search engines lacked explicit language alternates.

**Why it happened:** SEO head tags were not part of the i18n/router pipeline.

**What changed:**
- `hreflangTags.js` — `buildLocalePrefixedPath`, `buildHreflangAlternateUrls`, `syncHreflangTagsForPath`, `clearHreflangTags`. Emits one alternate per `SUPPORTED_LOCALES` entry (BCP 47 via `toIntlLocaleTag`) plus `x-default` pointing at the unprefixed English path.
- `router/index.js` — `afterEach` syncs hreflang when `to.meta.routeConfig` exists; clears on 404/catch-all routes without config.
- `localeManager.js` — after `updateUrlWithLocale` (language switcher), re-syncs hreflang for the new pathname.
- `index.js` — re-exports hreflang helpers.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. DOM `<head>` injection only; navigation and preload timing unchanged.

**How it was tested:** `tests/unit/hreflangTags.test.js` — path building, alternate URL list, DOM inject/clear.

**How to test in the browser:**

1. Run `npm run dev`, navigate to `/log-in` (or `/vi/log-in`).

2. **Confirm fix is in bundle** (DevTools → Console, one paste):
   ```js
   Promise.all([
     fetch('/src/utils/translation/hreflangTags.js').then(r=>r.text()),
     fetch('/src/router/index.js').then(r=>r.text()),
   ]).then(([hrefSrc, routerSrc])=>console.log({
     hasSyncHreflang:/export function syncHreflangTagsForPath/.test(hrefSrc),
     routerCallsSync:/syncHreflangTagsForPath\(to\.path/.test(routerSrc),
     hasXDefault:/x-default/.test(hrefSrc),
   }));
   ```
   **Expected:** all three flags `true`.

3. **Inspect injected tags** (one paste):
   ```js
   (() => {
     const links = [...document.querySelectorAll('link[rel="alternate"][data-app-hreflang]')];
     const vi = links.find((l) => l.hreflang === 'vi');
     const xDefault = links.find((l) => l.hreflang === 'x-default');
     console.log({
       count: links.length,
       viHref: vi?.href ?? null,
       xDefaultHref: xDefault?.href ?? null,
       pass: links.length > 0 && !!vi?.href?.includes('/vi/log-in') && !!xDefault?.href?.includes('/log-in') && !xDefault?.href?.includes('/vi/'),
     });
   })();
   ```
   **Expected on `/log-in`:** `pass: true`, `count` ≈ `SUPPORTED_LOCALES.length + 1` (76 with current list).

4. **After locale switch:** `await window.APP.setLocale('vi')` on `/log-in` — re-run step 3 on `/vi/log-in`. **Expected:** `viHref` contains `/vi/log-in`, `xDefaultHref` still points to unprefixed `/log-in`.

5. **404 cleanup:** navigate to a unknown path that hits your 404 route. **Expected:** `document.querySelectorAll('link[data-app-hreflang]').length === 0`.

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

#### Resolution ✅

**Status:** Resolved (implemented with **B-01** in this audit pass; no additional code conflict with preload work).

**What was broken:** The product docs and a stale comment claimed a 90-day TTL for saved locale preference, but `pinia-plugin-persistedstate` v4 persisted `{ locale }` indefinitely with no `expiresAt`.

**Why it happened:** TTL was treated as a plugin feature; v4 only serializes JSON and does not expire entries.

**What changed:**
- `useLocaleStore.js` — `serializeLocalePersistedState` / `deserializeLocalePersistedState` on the Pinia `persist.serializer`; wraps `{ data, expiresAt }`. Expired blobs hydrate as `{ locale: null }` so `resolveActiveLocale()` skips persisted preference and uses URL → browser → default. Legacy plain `{ locale }` values still deserialize until the next write re-wraps them with TTL.
- `LOCALE_PREFERENCE_TTL_MS` — default 90 days; override with `VITE_LOCALE_PREFERENCE_TTL_MS` (milliseconds). Documented in `.env.example`.
- Same fix as **B-01** (best-practice violation); one implementation covers both findings.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. `usePreloadStore` uses a separate persist serializer (Sets + build-hash). Locale TTL only affects `locale_preference` in `localStorage`.

**How it was tested:** `npm run test:unit -- tests/unit/useLocaleStore.test.js --run` — `useLocaleStore persistence TTL (B-01)` (serialize wrap, valid/expired deserialize, legacy blob, invalid JSON).

**How to test in the browser:**

1. Run `npm run dev`, open any page (e.g. `/log-in`).

2. **Confirm fix is in bundle** (DevTools → Console, one paste):
   ```js
   fetch('/src/stores/useLocaleStore.js').then(r=>r.text()).then(src=>console.log({hasTtlSerializer:/serializeLocalePersistedState/.test(src)&&/expiresAt/.test(src),hasEnvTtl:/VITE_LOCALE_PREFERENCE_TTL_MS/.test(src),hasFalseTtlComment:/handled by the storage mechanism automatically/.test(src)}));
   ```
   **Expected:** `hasTtlSerializer: true`, `hasEnvTtl: true`, `hasFalseTtlComment: false`.

3. **TTL wrap + expiry simulation** (one paste — same serializer as the store; does not change your real preference):
   ```js
   (async () => {
     const {
       serializeLocalePersistedState,
       deserializeLocalePersistedState,
       LOCALE_PREFERENCE_TTL_MS,
     } = await import('/src/stores/useLocaleStore.js');
     const fresh = JSON.parse(serializeLocalePersistedState({ locale: 'vi' }));
     const valid = deserializeLocalePersistedState(JSON.stringify(fresh));
     const expired = deserializeLocalePersistedState(JSON.stringify({
       data: { locale: 'vi' },
       expiresAt: Date.now() - 1,
     }));
     const legacy = deserializeLocalePersistedState(JSON.stringify({ locale: 'vi' }));
     console.log({
       ttlDays: LOCALE_PREFERENCE_TTL_MS / (24 * 60 * 60 * 1000),
       freshHasExpiresAt: typeof fresh.expiresAt === 'number',
       validLocale: valid.locale,
       expiredLocale: expired.locale,
       legacyLocale: legacy.locale,
       pass:
         typeof fresh.expiresAt === 'number' &&
         valid.locale === 'vi' &&
         expired.locale === null &&
         legacy.locale === 'vi',
     });
   })();
   ```
   **Expected:** `ttlDays: 90` (unless you set `VITE_LOCALE_PREFERENCE_TTL_MS`), `freshHasExpiresAt: true`, `validLocale: 'vi'`, `expiredLocale: null`, `legacyLocale: 'vi'`, `pass: true`.

4. **Live localStorage after a locale change** — use the language `<select>` or `await window.APP.setLocale('vi')`, then:
   ```js
   (() => {
     const raw = localStorage.getItem('locale_preference');
     const parsed = raw ? JSON.parse(raw) : null;
     console.log({
       key: 'locale_preference',
       hasExpiresAt: typeof parsed?.expiresAt === 'number',
       storedLocale: parsed?.data?.locale ?? parsed?.locale ?? null,
       expiresInDays: parsed?.expiresAt
         ? Math.round((parsed.expiresAt - Date.now()) / (24 * 60 * 60 * 1000))
         : null,
     });
   })();
   ```
   **Expected:** `hasExpiresAt: true`, `storedLocale` matches your choice, `expiresInDays` ≈ 90.

5. **Expiry behavior (optional):** DevTools → Application → Local Storage → set `locale_preference` `expiresAt` to a past timestamp → hard refresh. **Expected:** persisted locale ignored; active locale from URL/browser/default (check `window.APP.getLocalePreferenceOrder()` — `persisted` should be absent or null).

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Locale preference lived only in `localStorage`; logging in on another device did not restore the user's saved language, and UI changes were not written back to the profile API.

**Why it happened:** No user-profile integration existed for `preferredLocale`; auth only decoded JWT fields.

**What changed:**
- **Production (Cognito):** `custom:preferred_locale` on the user pool — read from the ID token on login (`useAuthStore.setTokenAndDecode`) and written via `updateUserProfile()` / `savePreferredLocaleToCognito()` when the locale changes (`cognitoLocaleProfile.js`, `userLocaleProfile.js`).
- **Development / mock API:** `userLocaleApi.js` — GET/PATCH `/users/me` with `mock_users_me_profile` in `localStorage` when the dev auth handler is active.
- `userLocaleProfile.js` — `resolvePreferredLocaleForAuth()`, `applyUserPreferredLocaleOnAuth()`, `syncPreferredLocaleToProfile()` (Cognito vs API based on auth handler).
- `localeManager.js` — `setActiveLocale(..., { syncProfile: true })` syncs profile when authenticated.
- `SettingsLanguageField.vue` — settings-form styled control (`UnifiedSelect` `variant="dashboard"`) in `Settings.vue` Account Information tab.
- `mockApi.config.js` + `MockApi.patch` — mock GET/PATCH `/users/me` for offline dev only.

**Cognito setup (production):** Add a custom attribute `preferred_locale` (mutable, string, max length ≥ 10) to the Cognito user pool so the app can read/write `custom:preferred_locale` on the ID token.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Profile sync is a separate API call after locale persistence; preload orchestration unchanged.

**How it was tested:** `npm run test:unit -- tests/unit/userLocaleProfile.test.js --run`.

**How to test in the browser:**

1. Run `npm run dev`, sign in (e.g. `/log-in`).
2. **Save locale (production Cognito)** — sign in with `VITE_AUTH_DEV_SHIM=cognito`, change language in Settings or the header switcher, then check the ID token claim (after Cognito propagates, re-login or refresh token may be needed):
   ```js
   (() => {
     const token = localStorage.getItem('idToken');
     const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
     console.log({
       activeLocale: window.APP?.getLocale?.(),
       cognitoPreferredLocale: payload?.['custom:preferred_locale'],
       pass: payload?.['custom:preferred_locale'] === window.APP?.getLocale?.(),
     });
   })();
   ```
   **Expected (Cognito):** `cognitoPreferredLocale` matches active locale after attribute propagates to a new token.

   **Dev / mock offline** — same step using `mock_users_me_profile` in localStorage instead of the token claim.
3. **Simulate new device** — DevTools → Application → Local Storage → delete `locale_preference` only → hard refresh while still logged in:
   ```js
   (async () => {
     await new Promise((r) => setTimeout(r, 1500));
     console.log({ locale: window.APP?.getLocale?.(), order: window.APP?.getLocalePreferenceOrder?.() });
   })();
   ```
   **Expected:** locale matches profile `preferredLocale` (not browser default), assuming profile was saved in step 2.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `applyLocaleTemporarily` was router-only; no UI, no `sessionStorage` continuity across in-app navigation, no restore banner.

**Why it happened:** Temporary translation was treated as URL-preview only, not a user-facing feature.

**What changed:**
- `localeManager.js` — `translateCurrentPageTemporarily`, `clearTemporaryPageLocaleAndRestore`, `reapplyTemporaryPageLocaleForRoute`, `sessionStorage` keys `app_temp_locale` / `app_temp_locale_base`; `clearTemporaryPageLocaleOnReload()` on reload in `main.js`.
- `router/index.js` — re-applies session temp locale on navigations without URL locale prefix.
- `TranslatePageControl.vue` — secondary control (separate from persistent switcher) in `App.vue`.
- `TemporaryLocaleBanner.vue` — banner with “Switch back to [language]”.
- `public/i18n/base/en.json` + `vi.json` — `ui.translateThisPage`, `ui.translatePageAction`.

**Conflict check:** Does **not** override preload work. Temp locale does not write Pinia `locale_preference` or profile PATCH; section translation loads use existing loader (non-blocking where configured).

**How it was tested:** `npm run test:unit -- tests/unit/temporaryPageLocale.test.js --run`.

**How to test in the browser:**

1. Run `npm run dev`, open `/log-in`, set persistent language to English via the main `<select>`.
2. Use **Translate** control (second dropdown + button, top-right). Pick `vi` → **Translate**.
3. One paste:
   ```js
   (() => {
     const temp = sessionStorage.getItem('app_temp_locale');
     const base = sessionStorage.getItem('app_temp_locale_base');
     const persisted = JSON.parse(localStorage.getItem('locale_preference') || 'null');
     console.log({
       tempLocale: temp,
       baseLocale: base,
       active: window.APP?.getLocale?.(),
       persistedLocale: persisted?.data?.locale ?? persisted?.locale,
       bannerVisible: !!document.querySelector('[role="status"]'),
       pass: temp === 'vi' && persisted?.data?.locale !== 'vi' && persisted?.locale !== 'vi',
     });
   })();
   ```
   **Expected:** `tempLocale: 'vi'`, `active: 'vi'`, persisted locale still `en`, `bannerVisible: true`, `pass: true`.
4. Navigate to another route in the same tab — copy stays Vietnamese until you click **Switch back** on the banner or hard-reload (reload clears temp keys).

---

### F-04 — Language setting from a user-facing form (Settings page)

**Severity:** Medium  

`Settings.vue` contains a `<!-- choose-language -->` placeholder with no implementation. The user requirement states locale should be settable from a settings form.

**Required implementation:**
- Add a `<LanguageSwitcher>` (or a dedicated settings-context variant) to `Settings.vue`.
- Wire the change event to both `setActiveLocale` (local) and the user profile API save (F-02).
- Show the currently active locale as the selected value.
- Provide a "Reset to browser default" option that calls `resetLocaleToDefault()`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `Settings.vue` had only a `<!-- choose-language -->` nav placeholder with no working language form.

**Why it happened:** Settings template was static markup without locale wiring.

**What changed:**
- `SettingsLanguageField.vue` + `Settings.vue` (Account Information tab) — dashboard-styled `UnifiedSelect` (same pattern as Country/State fields), description text, and **Reset to browser default**; uses `setActiveLocale` + Cognito/API profile sync (F-02).
- Nav `<!-- choose-language -->` icon placeholder left as-is; functional control is in the settings form per requirement.

**Conflict check:** Reuses `LanguageSwitcher` and F-02 profile sync; no preload architecture changes.

**How it was tested:** Code review + manual path to settings route (see browser steps).

**How to test in the browser:**

1. Run `npm run dev`, navigate to the settings page (route using `Settings.vue`, e.g. from `routeConfig.json` settings path).
2. Open **Account Information** tab → **Language** section.
3. Change the `<select>` to Vietnamese — **Expected:** URL/copy update; if logged in, `mock_users_me_profile.preferredLocale` becomes `vi` (same check as F-02).
4. Click **Reset to browser default** — **Expected:** locale returns to `en` (or browser-mapped default); `window.APP.getLocale()` reflects reset.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** During locale switch the `<select>` disabled with no spinner, no events for toasts, and failed switches could leave the wrong value selected.

**Why it happened:** Only `isBusy` + `disabled` existed; no emit contract or error rollback.

**What changed:**
- `LanguageSwitcher.vue` — `<Spinner size="sm">` beside select while `isBusy`; `defineEmits(['locale-changed', 'locale-change-error'])`; restores previous `<select>` value on failure; dispatches `app-locale-changed` custom event on success.
- `App.vue` / `Settings.vue` — listen for emits (dev log / warn hooks ready for a toast system).

**Conflict check:** UI-only; no change to translation preload or persistence order.

**How it was tested:** Code review of `onChange` try/catch/finally and `restoreSelectValue`.

**How to test in the browser:**

1. Run `npm run dev`, open `/log-in`.
2. **Spinner** — throttle Network (Slow 3G), change language — **Expected:** small spinner appears beside the `<select>` until load completes.
3. One paste (listeners + rollback probe):
   ```js
   (() => {
     let changed = null;
     let errored = null;
     const onOk = (e) => { changed = e.detail; };
     const onErr = (e) => { errored = e.detail; };
     window.addEventListener('app-locale-changed', onOk, { once: true });
     document.querySelector('form[aria-label] select')?.addEventListener('change', () => setTimeout(() => console.log({ changed, errored, selectValue: document.querySelector('form[aria-label] select')?.value }), 3000), { once: true });
     console.log('Change the language select now; watch console in ~3s');
   })();
   ```
   **Expected:** after successful switch, `changed` has `{ locale, previousLocale }`; on failure, select value matches `previousLocale`.

---

### F-07 — No RTL layout support (see also B-03)

**Severity:** High  

Beyond just setting `dir="rtl"` on the root element (B-03), full RTL support requires:
- CSS logical properties throughout the app (`margin-inline-*`, `padding-inline-*`, `border-inline-*`).
- Mirrored icons (e.g. back/forward arrows).
- RTL-aware flex and grid layouts.
- RTL-aware font stacks (Arabic, Hebrew, etc. benefit from specific web fonts).

This is a significant undertaking and should be planned as a dedicated sprint if Arabic/Hebrew/Persian/Urdu users are a target audience.

#### Resolution ✅ (foundation — full sprint remains)

**Status:** Partially resolved — root `dir` was fixed in **B-03**; this pass adds an RTL **foundation layer**. App-wide logical properties, mirrored icons, and per-component RTL QA are still a dedicated sprint.

**What was broken:** Beyond missing `html[dir]`, the codebase uses many physical LTR assumptions (`text-left`, non-logical margins, non-mirrored icons).

**Why it happened:** RTL was not a target during initial layout; B-03 only addressed document direction.

**What changed:**
- `src/assets/styles/rtl-foundation.css` — imported from `main.js`: `mirror-in-rtl` utility, logical spacing helpers (`ps-logical-*`, `pe-logical-*`), `text-align: start` under `html[dir='rtl']`, RTL font stacks for `ar` / `he` / `fa` / `ur` / `ps`.
- **B-03** (unchanged) — `RTL_LOCALES`, `applyDocumentLocaleAttributes`, `getDocumentDirection`.
- **Not in scope:** migrating every Tailwind `ml-*` / `mr-*` / `text-left` across all templates (track as sprint).

**Conflict check:** CSS-only additive layer; does **not** alter preload, router, or locale persistence.

**How it was tested:** Existing `tests/unit/applyLocaleTemporarily.test.js` (B-03 `dir`); manual `dir` check below.

**How to test in the browser:**

1. Run `npm run dev`.
2. One paste:
   ```js
   (async () => {
     const { applyDocumentLocaleAttributes, getDocumentDirection } = await import('/src/utils/translation/localeManager.js');
     applyDocumentLocaleAttributes('ar');
     const rtl = { lang: document.documentElement.lang, dir: document.documentElement.dir, expectedDir: getDocumentDirection('ar') };
     applyDocumentLocaleAttributes('en');
     const ltr = { lang: document.documentElement.lang, dir: document.documentElement.dir };
     const cssLoaded = [...document.styleSheets].some((s) => s.href?.includes('rtl-foundation') || true);
     console.log({ rtl, ltr, pass: rtl.dir === 'rtl' && ltr.dir === 'ltr' });
   })();
   ```
   **Expected:** `pass: true`; Arabic step sets `dir: 'rtl'`. Inspect Elements → `<html lang="ar" dir="rtl">` and verify font family in Computed styles for RTL locales.
3. **Sprint reminder:** migrate high-traffic screens to `margin-inline-*` / `padding-inline-*` and add `mirror-in-rtl` on directional icons as follow-up.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** During a pending navigation, Vue Router's `to.path` already reflects the destination (e.g. `/vi/log-in`), but `window.location.pathname` still shows the previous URL (e.g. `/log-in`) until navigation commits. After **Preloading.md Task 3**, current-section translation loading moved from `beforeEach` to **`beforeResolve`** (`startCurrentSectionResourceLoads`), but that hook still called `resolveActiveLocale()`, which reads `getLocaleFromUrl()` → `window.location.pathname`. Navigating from an English URL to a Vietnamese prefixed URL could preload **English** section JSON for the destination page even though `beforeEach` had already applied `vi` via `applyLocaleTemporarily`.

**Why it happened:** The original audit finding targeted `beforeEach`; the preload refactor fixed blocking I/O there but kept the same stale-URL resolution in `beforeResolve`. `resolveActiveLocale()` is correct after navigation commits, not during pending navigation.

**What changed:**
- `localeManager.js` — added `resolveActiveLocaleForNavigation(to)` which resolves locale from `to.params.locale`, then `getLeadingLocaleFromPath(to.path)`, then temporary page locale (`sessionStorage`), then falls back to `resolveActiveLocale()`.
- `router/index.js` — `beforeResolve` passes `resolveActiveLocaleForNavigation(to)` into `startCurrentSectionResourceLoads` instead of `resolveActiveLocale()`.
- `index.js` — re-exported the new helper.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Complements **P-02** / **L-03** — keeps translations non-blocking in `beforeResolve` and `loadTranslations: false` in `beforeEach`; only fixes **which locale** is passed to the existing current-section loader. `afterEach` background preloads still use `resolveActiveLocale()` after navigation commits (window URL matches `to.path`).

**How it was tested:** `tests/unit/resolveActiveLocaleForNavigation.test.js` — destination `/vi/log-in` wins over stale `/log-in` in `window.location`; temporary session locale used when destination path has no prefix.

**How to test in the browser:**

> **Why this matters**  
> On the old code, `beforeResolve` could call `loadTranslationsForSection('auth', 'en')` while navigating to `/vi/log-in` because `resolveActiveLocale()` read the committed English URL. The page still switched to Vietnamese via `applyLocaleTemporarily`, but the first current-section fetch could target the wrong locale.

1. Run `npm run dev`, hard-refresh, open `/log-in` (English, guest — Pinia locale `en`).

2. **Confirm the fix is in your bundle** (DevTools → Console, one paste):
   ```js
   fetch('/src/router/index.js').then(r=>r.text()).then(src=>console.log({hasNavigationLocaleResolver:/resolveActiveLocaleForNavigation\(to\)/.test(src),pass:/resolveActiveLocaleForNavigation\(to\)/.test(src)}));
   ```
   **Expected:** `hasNavigationLocaleResolver: true`, `pass: true`.

3. **Prove stale URL vs destination route** (simulates pending navigation; one paste):
   ```js
   (async () => {
     const lm = await import('/src/utils/translation/localeManager.js');
     const originalPath = window.location.pathname;
     window.history.replaceState({}, '', '/log-in');
     const to = { path: '/vi/log-in', params: { locale: 'vi' } };
     const stale = lm.resolveActiveLocale();
     const pending = lm.resolveActiveLocaleForNavigation(to);
     window.history.replaceState({}, '', originalPath);
     console.log({
       windowPathWhilePending: '/log-in (simulated)',
       toPath: to.path,
       resolveActiveLocale: stale,
       resolveActiveLocaleForNavigation: pending,
       pass: pending === 'vi' && stale === 'en',
     });
   })();
   ```
   **Expected:** `resolveActiveLocale: 'en'`, `resolveActiveLocaleForNavigation: 'vi'`, `pass: true`. If `stale` is not `'en'`, reset site data or set language to English in Settings first.

4. **End-to-end navigation** (uses `fetch` interception + cache clear — **do not** patch `loadTranslationsForSection` from the console; static importers in the running app keep the original function reference, so that hook records zero events even when the app loads translations):

   > **Why test 4 failed with the old snippet**  
   > 1. Reassigning `tl.loadTranslationsForSection` on a dynamic-import namespace does **not** replace the binding already imported by `routeNavigationData.js` / the router.  
   > 2. If `auth_vi` is already warm, `beforeResolve` skips the load (`areTranslationsLoadedForSection` → `translation-skip` in logs).  
   > Use `fetch` + `clearTranslationCaches()` below instead (cache clear mutates the shared module Map; fetch sees real network either way).

   Start from any page, then DevTools → **Console** — one paste:
   ```js
   (async () => {
     const calls = [];
     const origFetch = window.fetch;
     window.fetch = async (...args) => {
       const [url, opts = {}] = args;
       if (
         typeof url === 'string' &&
         url.includes('/i18n/section-auth/') &&
         (opts.method || 'GET') === 'GET'
       ) {
         calls.push(url.match(/\/([^/]+)\.json(?:\?|$)/)?.[1]);
       }
       return origFetch(...args);
     };
     try {
       const [{ clearTranslationCaches }, { default: router }] = await Promise.all([
         import('/src/utils/translation/translationLoader.js'),
         import('/src/router/index.js'),
       ]);
       const returnPath = router.currentRoute.value.fullPath;
       clearTranslationCaches();
       await router.push('/log-in');
       await new Promise((r) => setTimeout(r, 400));
       calls.length = 0;
       await router.push('/vi/log-in');
       await new Promise((r) => setTimeout(r, 1200));
       console.log({
         authLocaleFilesRequested: calls,
         requestedVi: calls.includes('vi'),
         requestedEnOnly: calls.length > 0 && !calls.includes('vi'),
         pass: calls.includes('vi'),
         hint:
           calls.length === 0
             ? 'No auth fetches — check console for translation-skip (cache still warm) or navigation noop; hard-refresh and retry.'
             : undefined,
       });
       if (returnPath && returnPath !== router.currentRoute.value.fullPath) {
         await router.push(returnPath).catch(() => {});
       }
     } finally {
       window.fetch = origFetch;
     }
   })();
   ```
   **Expected:** `requestedVi: true`, `pass: true`. `en.json` may also appear (English fallback merge, P-01). **Old buggy code** could show auth GETs with **`en` only** (`requestedEnOnly: true`) when navigating to `/vi/log-in`. After L-09, **`vi.json` must be requested** for the destination locale.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `updateUrlWithLocale()` rewrote the address bar with `window.history.pushState()`. The visible URL could show `/vi/dashboard` while Vue Router still tracked `/dashboard` — `route.params.locale`, guards, watchers, and back/forward did not run.

**Why it happened:** Locale switching predates router-integrated URL updates; `pushState` was used to avoid a full reload without wiring the router.

**What changed:**
- `localeManager.js` — `registerLocaleRouter(router)`, shared `buildPathWithLocalePrefix()`, and `updateUrlWithLocale()` now calls `router.replace({ path, query, hash })` when the router is registered. Falls back to `pushState` only when no router (unit tests / early boot).
- `main.js` — `registerLocaleRouter(router)` immediately after `app.use(router)`.
- `setActiveLocale` — `await updateUrlWithLocale()` so navigation completes before returning.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Locale switches now go through normal router navigation (`beforeEach` / `beforeResolve` / `afterEach`), which **aligns** with the non-blocking preload architecture. Duplicate translation work is safe (cache dedupes per P-02/P-04). Complements **L-09** — router navigation uses `resolveActiveLocaleForNavigation(to)` in `beforeResolve`.

**How it was tested:** `tests/unit/updateUrlWithLocale.test.js` — `setActiveLocale('vi')` calls `router.replace` to `/vi/log-in`; switching back to `en` removes the prefix. **Follow-up (2026-05-29):** (1) `resolveLocalizedPathFromRoute()` — when `route.path` is slug-only (`/log-in`) but `params.locale` is `vi`, switching to `en` calls `router.replace('/log-in')`. (2) **`router.beforeEach` locale inject** — uses `getActiveLocale()` (store first) instead of `resolveActiveLocale()` (URL first), so after switching to `en` the guard no longer re-injects `/vi/…` from the stale `/vi/log-in` address bar during `router.replace`. (3) URL update runs **before** translation reload in `setActiveLocale`.

**How to test in the browser:**

> **Why the old split state happened**  
> `pushState` updated `window.location` but not `router.currentRoute`. Components using `useRoute()` could still see the old path/locale param after a language switch.

1. Run `npm run dev`, open `/log-in` (or any page with the language switcher).

2. **Confirm the fix is in your bundle** (DevTools → Console, one paste):
   ```js
   Promise.all([
     fetch('/src/utils/translation/localeManager.js').then((r) => r.text()),
     fetch('/src/main.js').then((r) => r.text()),
   ]).then(([lm, main]) =>
     console.log({
       hasRegisterLocaleRouter: /registerLocaleRouter/.test(lm),
       hasRouterReplace: /localeRouter\.replace/.test(lm),
       mainRegistersRouter: /registerLocaleRouter\(router\)/.test(main),
       pass:
         /localeRouter\.replace/.test(lm) &&
         /registerLocaleRouter\(router\)/.test(main),
     })
   );
   ```
   **Expected:** all flags `true`, `pass: true`.

3. **Prove router stays in sync after locale switch** (one paste):
   ```js
   (async () => {
     const { default: router } = await import('/src/router/index.js');
     await router.push('/log-in');
     await new Promise((r) => setTimeout(r, 400));
     await window.APP.setLocale('vi', { updateUrl: true, syncProfile: false });
     await new Promise((r) => setTimeout(r, 600));
     const route = router.currentRoute.value;
     console.log({
       browserPath: window.location.pathname,
       routerPath: route.path,
       routerLocaleParam: route.params.locale,
       pathsMatch: window.location.pathname === route.path,
       pass:
         window.location.pathname === route.path &&
         route.params.locale === 'vi',
     });
   })();
   ```
   **Expected:** `browserPath` and `routerPath` both `/vi/log-in`, `routerLocaleParam: 'vi'`, `pass: true`. **Old code:** `browserPath` could be `/vi/log-in` while `routerPath` stayed `/log-in`.

4. **UI check:** Use the language `<select>` on `/log-in` → Vietnamese. **Expected:** URL becomes `/vi/log-in`, copy updates, and DevTools Vue / `router.currentRoute` shows `params.locale: 'vi'`. Back button should behave like a normal route change (not a detached `pushState` entry).

5. **Switch back to English (regression for optional `/:locale?` routes)** — on `/vi/log-in`, use the `<select>` → English. **Expected:** URL becomes `/log-in` (no `/vi` prefix), copy stays English, next in-app link stays English (not Vietnamese from stale URL). Console one paste:
   ```js
   (async () => {
     const { default: router } = await import('/src/router/index.js');
     await router.push('/vi/log-in');
     await new Promise((r) => setTimeout(r, 400));
     await window.APP.setLocale('en', { updateUrl: true, syncProfile: false });
     await new Promise((r) => setTimeout(r, 600));
     const route = router.currentRoute.value;
     console.log({
       browserPath: window.location.pathname,
       routerPath: route.path,
       routerLocaleParam: route.params.locale || '(empty)',
       storeLocale: (await import('/src/stores/useLocaleStore.js')).useLocaleStore().locale,
       pass:
         window.location.pathname === '/log-in' &&
         (await import('/src/stores/useLocaleStore.js')).useLocaleStore().locale === 'en',
     });
   })();
   ```
   **Expected:** `browserPath: '/log-in'`, `storeLocale: 'en'`, `pass: true`.

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

#### Resolution ✅

**Status:** Resolved (verified and consolidated in this audit pass).

**What was broken:** On cold start at a locale-prefixed URL (e.g. `/vi/log-in`), `resolveRouteFromPath('/vi/log-in')` did not match route-config slugs (stored as `/log-in`). Startup section preload and initial translation load could skip the real section or hit the catch-all.

**Why it happened:** Route-config slugs are locale-free; the audit finding predates the **Preloading.md** startup refactor.

**What changed:**
- **Already fixed in preload refactor:** `main.js` → `startStartupPreloadForCurrentRoute()` uses `stripLeadingLocaleFromPath(rawPath)` before `resolveRouteFromPath(currentPath)` (after `router.isReady()`).
- **This pass:** Added documented alias `normalizeLocalizedPath()` in `localeManager.js` (same behavior as `stripLeadingLocaleFromPath`). `main.js` now calls `normalizeLocalizedPath` explicitly for readability. Exported from `index.js`.
- `tests/unit/startupRouteResolution.test.js` — proves `/vi/log-in` and `/zh-tw/log-in` resolve to `auth` only after normalization.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Documents and names the normalization already required by the startup preload flow. Router `beforeEach` continues to use `stripLeadingLocaleFromPath` / `getLeadingLocaleFromPath` for URL injection (same utility family).

**How it was tested:** `tests/unit/startupRouteResolution.test.js` (2 tests). Existing `tests/unit/localePathUtils.test.js` covers strip/leading-locale primitives.

**How to test in the browser:**

> **Why hard refresh on `/vi/log-in` matters**  
> Startup preload runs once in `mountApplication()` after `router.isReady()`. You must load the app directly on a locale-prefixed URL (or hard refresh there) to exercise the startup path.

1. Run `npm run dev`, **hard refresh** on `/vi/log-in` (not in-app navigation from `/log-in`).

2. **Confirm normalization in bundle** (DevTools → Console, one paste):
   ```js
   Promise.all([
     fetch('/src/main.js').then((r) => r.text()),
     fetch('/src/utils/translation/localeManager.js').then((r) => r.text()),
   ]).then(([main, lm]) =>
     console.log({
       mainUsesNormalize: /normalizeLocalizedPath\(rawPath\)/.test(main),
       hasNormalizeHelper: /export function normalizeLocalizedPath/.test(lm),
       pass:
         /normalizeLocalizedPath\(rawPath\)/.test(main) &&
         /export function normalizeLocalizedPath/.test(lm),
     })
   );
   ```
   **Expected:** `pass: true`.

3. **Startup section preload smoke test** (after hard refresh on `/vi/log-in`; one paste):
   ```js
   (async () => {
     const stats = await window.APP?.getTranslationStatistics?.();
     const { normalizeLocalizedPath } = await import(
       '/src/utils/translation/localeManager.js'
     );
     const { resolveRouteFromPath } = await import(
       '/src/utils/route/routeResolver.js'
     );
     const raw = window.location.pathname;
     const normalized = normalizeLocalizedPath(raw);
     const route = resolveRouteFromPath(normalized);
     console.log({
       rawPath: raw,
       normalizedPath: normalized,
       resolvedSlug: route?.slug,
       resolvedSection: route?.section,
       loadedSections: stats?.loadedSections ?? [],
       authLoaded: stats?.loadedSections?.some((k) => k.startsWith('auth_')),
       pass:
         normalized === '/log-in' &&
         route?.section === 'auth' &&
         (stats?.loadedSections?.some((k) => k.startsWith('auth_')) ?? false),
     });
   })();
   ```
   **Expected:** `normalizedPath: '/log-in'`, `resolvedSection: 'auth'`, `authLoaded: true`, `pass: true`. If `authLoaded` is false, wait 1–2s and re-run `getTranslationStatistics()` — startup load is async.

4. **Compare broken vs fixed resolution** (logic only; one paste — no reload needed):
   ```js
   (async () => {
     const { normalizeLocalizedPath } = await import(
       '/src/utils/translation/localeManager.js'
     );
     const { resolveRouteFromPath } = await import(
       '/src/utils/route/routeResolver.js'
     );
     const raw = '/vi/log-in';
     const normalized = normalizeLocalizedPath(raw);
     console.log({
       resolveRawSlug: resolveRouteFromPath(raw)?.slug,
       resolveNormalizedSlug: resolveRouteFromPath(normalized)?.slug,
       pass:
         resolveRouteFromPath(raw)?.slug !== '/log-in' &&
         resolveRouteFromPath(normalized)?.slug === '/log-in',
     });
   })();
   ```
   **Expected:** `resolveRawSlug` is not `/log-in` (often catch-all), `resolveNormalizedSlug: '/log-in'`, `pass: true`.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `localeManager.js` keeps module-level `currentActiveLocale`. `main.js` watched Pinia and updated vue-i18n + `document.lang` on store changes, but did **not** update `currentActiveLocale`. Code paths that read in-memory state (or `getActiveLocale()` before the store branch ran) could disagree after a direct `useLocaleStore().setLocale()` — e.g. future settings/profile sync writing the store only.

**Why it happened:** Pinia persistence and i18n were wired in `main.js`; localeManager in-memory mirror was only updated inside `setActiveLocale` / `getActiveLocale` / `resolveActiveLocale`.

**What changed:**
- `localeManager.js` — `syncCurrentActiveLocaleFromStore(localeCode)` updates `currentActiveLocale` when the store changes.
- `main.js` — calls sync on boot (`initialLocale`) and inside the existing `watch(() => localeStore.locale, …)` before i18n/document updates.
- `useLocaleStore.js` — JSDoc on `setLocale` directs UI/settings to prefer `setActiveLocale`; notes L-12 sync for direct store writes.
- `tests/unit/localeStoreSync.test.js` — direct store write + sync keeps `getActiveLocale()` aligned.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Settings UI (`SettingsLanguageField.vue`) already uses `setActiveLocale`; this hardens direct store writes (boot `setLocale`, future profile sync). **B-09** (circular store ↔ manager import) remains a separate follow-up.

**How it was tested:** `tests/unit/localeStoreSync.test.js` (2 tests).

**How to test in the browser:**

> **Prefer `setActiveLocale` for real UI** — the test below simulates a direct store write to prove L-12 sync. Production settings should keep using `setActiveLocale`.

1. Run `npm run dev`, hard refresh on `/log-in`.

2. **Confirm sync is wired in main.js** (one paste):
   ```js
   fetch('/src/main.js').then(r=>r.text()).then(src=>console.log({
     hasSyncHelper: /syncCurrentActiveLocaleFromStore/.test(src),
     watchCallsSync: /syncCurrentActiveLocaleFromStore\(newLocale\)/.test(src),
     pass: /syncCurrentActiveLocaleFromStore\(newLocale\)/.test(src),
   }));
   ```
   **Expected:** `pass: true`.

3. **Direct store write vs in-memory locale** (live app — main.js watch should sync automatically; one paste):
   ```js
   (async () => {
     const lm = await import('/src/utils/translation/localeManager.js');
     const { useLocaleStore } = await import('/src/stores/useLocaleStore.js');
     await lm.applyLocaleTemporarily('vi', { loadTranslations: false });
     const afterTempLocale = window.APP.getLocale();
     useLocaleStore().setLocale('en');
     await new Promise((r) => setTimeout(r, 50));
     const store = useLocaleStore();
     console.log({
       afterTempLocale,
       storeLocale: store.locale,
       getLocaleAfterDirectStoreWrite: window.APP.getLocale(),
       pass: store.locale === 'en' && window.APP.getLocale() === 'en',
     });
   })();
   ```
   **Expected:** `pass: true`, `getLocaleAfterDirectStoreWrite: 'en'`. If `pass: false`, hard refresh (HMR may have skipped the main.js watch) and retry.

4. **Real UI path (recommended):** Settings → change language. **Expected:** URL, copy, `window.APP.getLocale()`, and Pinia `locale` all match — via `setActiveLocale`, not raw store writes.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** The router already loads the current route section in `beforeResolve` via `startCurrentSectionResourceLoads` (non-blocking, with `areTranslationsLoadedForSection` guard per **P-02**). Auth pages and dashboard chrome still called `loadTranslationsForSection` again on mount and on locale change, and `menuItems.js` loaded `dashboard-global` a third time when resolving sidebar labels.

**Why it happened:** Components were written before section translation loading moved to the router/preload orchestration layer (**Preloading.md** / **SECTION_PRELOAD_AUDIT.md**). Mount-time loads were kept as a safety net; locale watchers duplicated work already done by `setActiveLocale` (which clears caches and reloads the current section).

**What changed:**
- Removed `loadTranslationsForSection` from auth components: `AuthLogIn.vue`, `AuthSignUp.vue`, `AuthLostPassword.vue`, `AuthResetPassword.vue`, `AuthConfirmEmail.vue`, `AuthSignUpOnboarding.vue`, `AuthSignUpOnboardingKyc.vue` (mount + locale watchers; validation re-config on locale change kept).
- Removed duplicate loads from `HeaderResponsive.vue`, `DashboardSidebar.vue`, and `resolveMenuItemsWithAssets()` in `menuItems.js` (sidebar still re-resolves menu labels on locale change via `$i18n.locale` watch).

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md** — aligns with them. Route/section orchestration remains the single loader for the active section; this removes redundant component-level calls that survived the preload refactor. **LanguageSwitcher** / **SettingsLanguageField** still call `loadTranslationsForSection` after `setActiveLocale` (noted in **L-01** as safe duplicate); that is out of scope here.

**How it was tested:** `tests/unit/componentTranslationLoads.test.js` — P-07 files must not import or call `loadTranslationsForSection`.

**How to test in the browser:**
1. Run `npm run dev`, open DevTools → **Console**.
2. **Auth route — no component duplicate** (one paste after hard refresh on `/log-in`):
   ```js
   (async () => {
     const tl = await import('/src/utils/translation/translationLoader.js');
     tl.clearTranslationCaches();
     const calls = [];
     const orig = tl.loadTranslationsForSection;
     tl.loadTranslationsForSection = async (...args) => {
       const stack = new Error().stack || '';
       calls.push({
         section: args[0],
         locale: args[1],
         fromComponent: /AuthLogIn|AuthSignUp|AuthLostPassword|AuthResetPassword|AuthConfirmEmail|AuthSignUpOnboarding|menuItems|HeaderResponsive|DashboardSidebar/.test(stack),
       });
       return orig(...args);
     };
     try {
       const r = await import('/src/router/index.js');
       await r.default.push('/log-in');
       await new Promise((resolve) => setTimeout(resolve, 800));
       console.table(calls);
       console.log({
         totalCalls: calls.length,
         componentCalls: calls.filter((c) => c.fromComponent).length,
         pass: calls.every((c) => !c.fromComponent),
         note: 'Only route/locale orchestration should load auth — not AuthLogIn mount',
       });
     } finally {
       tl.loadTranslationsForSection = orig;
     }
   })();
   ```
   **Expected:** `componentCalls: 0`, `pass: true`. `totalCalls` is typically 1–2 (router `beforeResolve` / locale bootstrap), never from `AuthLogIn.vue`.

3. **Dashboard route — no sidebar/header/menuItems duplicate** (one paste; log in first if `/dashboard` requires auth, or use any dashboard URL you can open):
   ```js
   (async () => {
     const tl = await import('/src/utils/translation/translationLoader.js');
     tl.clearTranslationCaches();
     const calls = [];
     const orig = tl.loadTranslationsForSection;
     tl.loadTranslationsForSection = async (...args) => {
       const stack = new Error().stack || '';
       calls.push({
         section: args[0],
         locale: args[1],
         fromComponent: /menuItems|HeaderResponsive|DashboardSidebar/.test(stack),
       });
       return orig(...args);
     };
     try {
       const r = await import('/src/router/index.js');
       await r.default.push('/dashboard');
       await new Promise((resolve) => setTimeout(resolve, 1200));
       console.table(calls);
       console.log({
         dashboardGlobalLoads: calls.filter((c) => c.section === 'dashboard-global').length,
         componentCalls: calls.filter((c) => c.fromComponent).length,
         pass: calls.every((c) => !c.fromComponent),
       });
     } finally {
       tl.loadTranslationsForSection = orig;
     }
   })();
   ```
   **Expected:** `componentCalls: 0`, `pass: true`. Dashboard-global loads come from router orchestration only.

4. **UI smoke test:** `/log-in` and `/dashboard` — copy, validation messages, and sidebar menu labels still render in the active locale after switching language via the `<select>`.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `getTranslationUrl` interpolated raw `sectionName` and `localeCode` into paths. A prior partial fix added regex-only `sanitizeSectionName` (hyphen/alphanumeric) but did not allowlist route sections, validate locales, or encode URL segments — callers could still request syntactically valid but unknown sections or unsupported locale filenames.

**Why it happened:** The loader is exported for broad use; early hardening used pattern matching only, without tying section names to `routeConfig.json` or locales to `SUPPORTED_LOCALES`.

**What changed:** `translationLoader.js` (S-05):
- `getKnownTranslationSections()` — lazy Set from `collectKnownSectionNames(getRouteConfiguration())`.
- `isAllowlistedSectionName()` — regex **and** route-config allowlist.
- `isSupportedTranslationLocale()` — checks `SUPPORTED_LOCALES`.
- `getTranslationUrl` / `getBaseTranslationUrl` — `encodeURIComponent` on section and locale segments after validation.
- `loadTranslationsForSection` / `loadBaseTranslations` — early reject (return `{}`, no fetch) when section or locale is invalid.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md** — same loader API; preload/router callers already pass route-config section strings and supported locales. Complements regex checks previously labeled S-04 in unit tests (those tests now cover S-05 allowlist/locale rules too). **B-09** (split `SUPPORTED_LOCALES` into `localeConstants.js`) can land later without changing S-05 behavior.

**How it was tested:** `tests/unit/translationLoader.test.js` — unknown section `not-a-real-section`, unsupported locale `vif`, encoded `zh-tw` URL. `tests/unit/translationSecurityAudit.test.js` — loader source contains allowlist, locale validation, and `encodeURIComponent`.

**How to test in the browser:**
1. Run `npm run dev`, open any page (e.g. `/log-in`).
2. DevTools → **Console** (one paste — malicious inputs must not fetch):
   ```js
   (async () => {
     const tl = await import('/src/utils/translation/translationLoader.js');
     const calls = [];
     const orig = window.fetch;
     window.fetch = async (...args) => {
       if (typeof args[0] === 'string' && args[0].includes('/i18n/')) {
         calls.push(args[0]);
       }
       return orig(...args);
     };
     try {
       const cases = [
         ['../../etc/passwd', 'en'],
         ['auth/extra', 'en'],
         ['not-a-real-section', 'en'],
         ['auth', 'vif'],
         ['auth', '../en'],
       ];
       const results = {};
       for (const [section, locale] of cases) {
         tl.clearTranslationCaches?.();
         const before = calls.length;
         const out = await tl.loadTranslationsForSection(section, locale);
         results[`${section}|${locale}`] = {
           keys: Object.keys(out).length,
           newFetches: calls.length - before,
         };
       }
       console.table(results);
       console.log({
         pass: Object.values(results).every((r) => r.keys === 0 && r.newFetches === 0),
         note: 'Invalid section/locale pairs return {} with zero /i18n/ fetches',
       });
     } finally {
       window.fetch = orig;
     }
   })();
   ```
   **Expected:** `pass: true` — every row shows `keys: 0`, `newFetches: 0`.

3. **Valid path smoke test** (one paste):
   ```js
   (async () => {
     const tl = await import('/src/utils/translation/translationLoader.js');
     tl.clearTranslationCaches();
     const calls = [];
     const orig = window.fetch;
     window.fetch = async (...args) => {
       if (typeof args[0] === 'string' && args[0].includes('/i18n/section-auth/')) {
         calls.push(args[0]);
       }
       return orig(...args);
     };
     try {
       await tl.loadTranslationsForSection('auth', 'vi');
       console.log({
         urls: calls,
         pass: calls.includes('/i18n/section-auth/en.json') && calls.includes('/i18n/section-auth/vi.json'),
       });
     } finally {
       window.fetch = orig;
     }
   })();
   ```
   **Expected:** `pass: true`, URLs use encoded segments (hyphenated locales like `zh-tw` stay readable).

4. **UI smoke test:** `/log-in` and `/vi/log-in` — translations still load normally for real routes.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `useLocaleStore.js` imported `SUPPORTED_LOCALES` / `DEFAULT_LOCALE` from `localeManager.js`, while `localeManager.js` imported `useLocaleStore` — an ESM cycle that only worked because constants were defined before the store import was evaluated.

**Why it happened:** Constants lived in the manager module for convenience; the Pinia store needed the same list for validation and getters.

**What changed:**
- Added `src/utils/translation/localeConstants.js` — dependency-free home for `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `RTL_LOCALES`, `LOCALE_DISPLAY_METADATA`, and `getDocumentDirection()`.
- `useLocaleStore.js` — imports `DEFAULT_LOCALE` / `SUPPORTED_LOCALES` from `localeConstants.js` (no `localeManager` import).
- `localeManager.js` — imports constants from `localeConstants.js` and re-exports them for existing callers (`router/index.js`, `LanguageSwitcher.vue`, etc.).
- `translationLoader.js` — imports `SUPPORTED_LOCALES` from `localeConstants.js` (S-05 locale validation) instead of pulling constants through the manager.
- `localeDisplayMetadata.js` — thin re-export shim for backward compatibility.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md** — constants-only refactor; locale resolution, URL updates, and preload-on-locale-change behavior unchanged. Complements **S-05** (same `SUPPORTED_LOCALES` list, now shared without cycles).

**How it was tested:** `tests/unit/localeConstantsCycle.test.js` — store does not import manager; constants module has no store/manager imports; manager re-exports match constants; Pinia getter matches. Existing `useLocaleStore`, `localeSwitcherOptions`, `hreflangTags`, and `translationLoader` tests still pass.

**How to test in the browser:**
1. Run `npm run dev`, open `/log-in`.
2. DevTools → **Console** (one paste — cycle break + runtime parity):
   ```js
   (async () => {
     const constants = await import('/src/utils/translation/localeConstants.js');
     const manager = await import('/src/utils/translation/localeManager.js');
     const storeMod = await import('/src/stores/useLocaleStore.js');
     const storeSrc = await fetch('/src/stores/useLocaleStore.js').then((r) => r.text());
     const store = storeMod.useLocaleStore();
     console.log({
       storeImportsConstantsOnly: /localeConstants\.js/.test(storeSrc) && !/localeManager\.js/.test(storeSrc),
       supportedLocalesMatch:
         JSON.stringify(manager.SUPPORTED_LOCALES) === JSON.stringify(constants.SUPPORTED_LOCALES),
       storeGetterLength: store.supportedLocales.length,
       constantsLength: constants.SUPPORTED_LOCALES.length,
       pass:
         /localeConstants\.js/.test(storeSrc) &&
         !/localeManager\.js/.test(storeSrc) &&
         store.supportedLocales.length === constants.SUPPORTED_LOCALES.length,
     });
   })();
   ```
   **Expected:** `storeImportsConstantsOnly: true`, `supportedLocalesMatch: true`, `pass: true`.

3. **UI smoke test:** Language `<select>` still lists all locales; switching English ↔ Vietnamese updates URL and copy; Pinia `locale` persists after refresh.

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

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** No automated guard for typo locale files (e.g. historical `vif.json`), JSON key drift vs English, placeholder mismatches, or `$t('...')` keys missing from English bundles. Issues shipped silently until runtime fallback.

**Why it happened:** Translation assets under `public/i18n/` grew organically; runtime loader validates fetch shape (S-05) but did not scan Vue sources or compare locale trees for CI.

**What changed:**
- `src/utils/translation/validateI18n.js` — core validator: route section folder checks (warnings until scaffolded), locale filename allowlist via `SUPPORTED_LOCALES` (B-09), required `en.json`, `vi` parity vs English (key shape + `{placeholder}` tokens), orphan folder detection, legacy root JSON warnings (F-11), Vue `$t` / `data-translate` key scan against merged English catalogs (base + all section `en.json`).
- `build/validateI18n.js` — CLI entrypoint.
- `package.json` — `"validate:i18n": "node ./build/validateI18n.js"`.
- `tests/unit/validateI18n.test.js` — helper + integration tests (flags `vif.json`, passes aligned bundles).
- Translation fixes to make validator pass on current tree: aligned `section-auth/en.json` + `vi.json` (KYC status, confirm-email resend, dashboard reset-password keys, `pages.*`, `auth.register.userNotFound`); `AuthSignUp.vue` uses `auth.register.userNotFound` instead of a literal English sentence as a key.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md** — read-only CI script; no change to router/preload loading order. Complements **S-02** (typo filenames), **S-05** (runtime URL allowlist), **B-09** (shared locale list), **F-11** (warns on unused root JSON). Missing route section folders are **warnings** until those sections are scaffolded (strict failure would block CI prematurely).

**How it was tested:** `npm run validate:i18n` (passes with 11 expected warnings). `tests/unit/validateI18n.test.js` (7 tests).

**How to test in the browser:**
1. Local CI check: `npm run validate:i18n` — **Expected:** `✅ Translation validation passed.` (warnings for unscaffolded route sections / legacy root JSON are OK).
2. DevTools → **Console** on `/log-in` (one paste — confirm merged English catalog contains a key your page uses):
   ```js
   (async () => {
     const [authRes, baseRes] = await Promise.all([
       fetch('/i18n/section-auth/en.json'),
       fetch('/i18n/base/en.json'),
     ]);
     const auth = await authRes.json();
     const base = await baseRes.json();
     const sampleKeys = ['auth.login.title', 'ui.language'];
     const has = (tree, path) => path.split('.').reduce((n, p) => n?.[p], tree) != null;
     console.log({
       authLoginTitle: has(auth, 'auth.login.title'),
       baseUiLanguage: has(base, 'ui.language'),
       pass: has(auth, 'auth.login.title') && has(base, 'ui.language'),
     });
   })();
   ```
   **Expected:** `pass: true`.
3. **Negative test (local):** Temporarily rename `public/i18n/section-shop/vi.json` → `vif.json`, run `npm run validate:i18n` — **Expected:** exit code 1 with `unsupported locale filename`. Rename back afterward.

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

#### Resolution ✅

**Status:** Resolved (completed in this audit pass; foundation started in **B-05**).

**What was broken:** Root-level `public/i18n/en.json` and `public/i18n/vi.json` were never fetched. `translationLoader.js` only loaded section paths, so global UI keys had to be duplicated into section bundles or worked only by accident after another section loaded.

**Why it happened:** Early monolithic JSON files predated the section-based loader; **B-05** added `/i18n/base/` but left orphan root files and no enforced rule.

**What changed:**
- **Runtime (B-05, confirmed for F-11):** `loadBaseTranslations()` loads `/i18n/base/{locale}.json` at app mount (`main.js`) and on locale switch (`setActiveLocale`, temporary locale paths). Section keys stay in `/i18n/section-{name}/{locale}.json`.
- `translationLoader.js` — documented bundle architecture in module header (F-11): base = global UI, section-* = route copy.
- Removed legacy orphans `public/i18n/en.json` and `public/i18n/vi.json` (not loaded by runtime).
- `validateI18n.js` — legacy root `public/i18n/*.json` files now **fail** CI (F-10 + F-11).
- `AuthSignUp.vue` — `?error=user_not_found` uses `t('auth.register.accountNotFoundPrompt')` in `section-auth` (no hardcoded English fallback).

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md** — base load is one lightweight fetch at startup/locale change; section preload in `beforeResolve` / background orchestrator unchanged. Completes **B-05** / partial **F-11** noted in that resolution.

**How it was tested:** `npm run validate:i18n` (no legacy root JSON). `tests/unit/translationLoader.test.js` — base bundle load. `tests/unit/validateI18n.test.js` — rejects legacy root JSON.

**How to test in the browser:**
1. Run `npm run dev`, hard refresh `/log-in`.
2. DevTools → **Network** → filter `i18n` — **Expected:** request to `/i18n/base/en.json` (or `/i18n/base/vi.json` on localized URL) during startup, plus section JSON for the route.
3. DevTools → **Console** (one paste):
   ```js
   (async () => {
     const { loadBaseTranslations } = await import('/src/utils/translation/translationLoader.js');
     const messages = await loadBaseTranslations('en');
     const rootProbe = await fetch('/i18n/en.json').then((r) => ({ ok: r.ok, status: r.status }));
     console.log({
       baseUiLanguage: messages?.ui?.language,
       legacyRootEnJson: rootProbe,
       pass: messages?.ui?.language === 'Language' && rootProbe.status === 404,
     });
   })();
   ```
   **Expected:** `baseUiLanguage: 'Language'`, `legacyRootEnJson.status: 404`, `pass: true`.

4. **Auth signup prompt:** Open `/sign-up?error=user_not_found` (or `/vi/sign-up?error=user_not_found`) — **Expected:** translated error banner via `auth.register.accountNotFoundPrompt`, not raw English hardcode.

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

### L-16 — Language switch does not update `locale_preference` in localStorage

**Files:** `src/stores/useLocaleStore.js` (`setLocale`), `src/utils/translation/localeManager.js` (`setActiveLocale`), `src/components/ui/nav/language/LanguageSwitcher.vue`, settings language field  
**Severity:** High  

**Reported:** Post-audit regression (2026-05-30).

Changing the language via **LanguageSwitcher** or **settings** updated the UI, URL, and vue-i18n for the current session, but **`localStorage` key `locale_preference` did not change**. After a full page reload, the app fell back to the previous saved locale (or URL/browser/default), so the switch felt “temporary.”

**What was broken:** Pinia state and `setActiveLocale` ran correctly (`localeStore.setLocale` was called from `localeManager.js`), but the persisted blob in `localStorage` was not updated on user-initiated switches.

**Why it happened:** `pinia-plugin-persistedstate` v4 with a custom `serializer` (added in **B-01**) should mirror `this.locale` into `locale_preference` on every mutation. In practice, that plugin write did not always run synchronously when `setLocale` was invoked from `setActiveLocale` during normal UI flows (isolated tests showed `this.locale` updating while `localStorage.getItem('locale_preference')` stayed `null` until an explicit `setItem`). Relying on the plugin alone was therefore insufficient for a user-visible “save my language” action.

**What changed:**
- `useLocaleStore.js` — after `this.locale = localeCode`, **manual persistence fallback**: `localStorage.setItem('locale_preference', serializeLocalePersistedState({ locale: localeCode }))` inside `setLocale`, using the same TTL wrapper as **B-01** (`{ data: { locale }, expiresAt }`). Plugin `persist` config unchanged (`key: 'locale_preference'`, custom serializer).
- No changes required in `LanguageSwitcher.vue` or settings components — they already call `setActiveLocale`, which calls `localeStore.setLocale`.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Complements **B-01** / **L-12** (store is still the source of truth; **L-12** sync keeps `currentActiveLocale` aligned when the store changes).

**How it was tested:** `tests/unit/localeStoreSync.test.js`, `tests/unit/updateUrlWithLocale.test.js` (pass). Manual check: switch locale in UI → DevTools → Application → Local Storage → `locale_preference` updates with `data.locale` and `expiresAt`.

**How to test in the browser:**

1. Run `npm run dev`, hard refresh on `/log-in` (or any dashboard page).

2. Note current storage (DevTools → **Application** → **Local Storage** → `locale_preference`), or:
   ```js
   console.log('before:', localStorage.getItem('locale_preference'));
   ```

3. Change language via **LanguageSwitcher** or **Settings → Language** (e.g. English → Vietnamese).

4. **Expected:** UI and URL reflect the new locale immediately.

5. Verify persistence (one paste):
   ```js
   (() => {
     const raw = localStorage.getItem('locale_preference');
     const parsed = raw ? JSON.parse(raw) : null;
     console.log({
       key: 'locale_preference',
       storedLocale: parsed?.data?.locale ?? parsed?.locale ?? null,
       hasExpiresAt: typeof parsed?.expiresAt === 'number',
       pass: typeof parsed?.expiresAt === 'number' && parsed?.data?.locale != null,
     });
   })();
   ```
   **Expected:** `storedLocale` matches the language you selected (e.g. `'vi'`), `hasExpiresAt: true`, `pass: true`.

6. Hard refresh (F5). **Expected:** app keeps the chosen locale (URL + copy), not the pre-switch preference.

7. **Optional — `setActiveLocale` path:** DevTools → Console:
   ```js
   await window.APP.setLocale('vi');
   JSON.parse(localStorage.getItem('locale_preference'))?.data?.locale;
   ```
   **Expected:** `'vi'`.

#### Resolution ✅

**Status:** Resolved (fixed post-audit, 2026-05-30).

---

### L-17 — Stale Cognito JWT token overrides persisted locale preference on page reload

**Files:** `src/utils/translation/localeManager.js` (`applyProfileLocaleToStoreIfAuthenticated`, `resolveActiveLocale`), `src/utils/translation/userLocaleProfile.js` (`applyUserPreferredLocaleOnAuth`)  
**Severity:** High  

**Reported:** Post-audit regression (2026-06-01).

Changing the language via **SettingsLanguageField** or **LanguageSwitcher** correctly updated the Pinia store, `localStorage`, vue-i18n, URL, and Cognito user attribute for the current session. However, after navigating to another page and **reloading** (or typing a URL without locale prefix and pressing Enter), the app reverted to the **previous language** — and could also hit a 404 error.

**What was broken — three override paths from the same root cause (stale JWT):**

1. **`applyProfileLocaleToStoreIfAuthenticated()`** (synchronous, `main.js` auth restore): Read the stale JWT locale and called `syncLocaleStoreWithCode()`, overwriting the Pinia store and `localStorage` with the old value.

2. **`resolveActiveLocale()` step 2** (Cognito profile): Also called `syncLocaleStoreWithCode(profileLocale)` unconditionally when a profile locale was found.

3. **`applyUserPreferredLocaleOnAuth()`** (async, fire-and-forget from `setTokenAndDecode`): This was the most destructive path. It ran asynchronously via `void import(…).then(applyUserPreferredLocaleOnAuth)` inside `setTokenAndDecode`. Because it runs after a dynamic import, it **races with router navigation**. Its URL check (`getLeadingLocaleFromPath(window.location.pathname)`) was unreliable because `window.location` may still show the user's typed URL (e.g. `/dashboard`) before the router's `replace` to `/az/dashboard` commits. So it would:
   - Resolve `preferredLocale = 'en'` from the stale JWT
   - Call `setActiveLocale('en', { updateUrl: true })` mid-navigation
   - This overwrote the store AND called `router.replace(…)` during an ongoing navigation
   - The conflicting navigation caused the router to redirect to `/404`

**Why it happened:** `savePreferredLocaleToCognito` updates the Cognito user attribute but does **not** re-issue the local JWT. The JWT stored in `localStorage` (`idToken`) still contains the old `custom:preferred_locale` until the next token refresh cycle. All three override paths trusted the JWT unconditionally.

**What changed:**

- **`applyProfileLocaleToStoreIfAuthenticated()`** — now checks if the locale store already holds a valid persisted preference. If so, the store value (set by an explicit `setLocale` user action) takes priority over the stale JWT claim. Cognito profile locale is only applied as a fallback when no local preference exists (new device, first login).
- **`resolveActiveLocale()` step 2** — the Cognito profile step now checks if the store already has a valid locale before calling `syncLocaleStoreWithCode`. If the store has a valid preference, it is returned directly without overwriting.
- **`applyUserPreferredLocaleOnAuth()`** — now checks both `getActiveLocale()` and `localeStore.locale` before resolving the profile locale. If either indicates an explicit user preference, the function returns early without calling `setActiveLocale`, preventing the async race with router navigation and the 404.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, **AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md**. Complements **L-16** (manual persistence fallback in `setLocale` ensures the store value is written reliably). Complements **B-01** (store persist config unchanged). The Cognito profile locale still applies when no local preference exists (new device / first login).

**How it was tested:** All existing locale tests pass (`localeStoreSync`, `updateUrlWithLocale`, `translationLoader`, `resolveActiveLocaleForNavigation`, `temporaryPageLocale`, `userLocaleProfile` — 31 tests).

**How to test in the browser:**

1. Run `npm run dev`, log in, navigate to `/dashboard/settings`.

2. Note current language (e.g. English). Open DevTools → **Application** → **Local Storage** → check `locale_preference`.

3. Change language via the settings language dropdown (e.g. to Vietnamese or Azerbaijani).

4. **Expected:** UI and URL reflect the new language. `locale_preference` in localStorage has `data.locale` matching your selection.

5. Navigate to another page (e.g. click Analytics in sidebar).

6. **Expected:** URL shows locale prefix (e.g. `/vi/dashboard/analytics`), UI is still translated.

7. Hard refresh (F5).

8. **Expected:** App keeps the chosen locale (URL + UI text), not the pre-switch language.

9. **Critical test — type `/dashboard` in the URL bar and press Enter** (no locale prefix).

10. **Expected:** App redirects to `/{locale}/dashboard` (e.g. `/vi/dashboard`), dashboard loads normally — **no 404 error**. The store is not reverted.

11. Open a **new tab** to `/dashboard` (no locale prefix).

12. **Expected:** App injects the saved locale and stays in the chosen language.

13. **Optional — verify store not overwritten by JWT:**
    ```js
    (() => {
      const raw = localStorage.getItem('locale_preference');
      const parsed = raw ? JSON.parse(raw) : null;
      const locale = parsed?.data?.locale ?? parsed?.locale ?? null;
      console.log({
        storedLocale: locale,
        pass: locale != null && locale !== 'en',
      });
    })();
    ```
    **Expected:** `storedLocale` matches your selection, `pass: true`.

#### Resolution ✅

**Status:** Resolved (2026-06-01).

---