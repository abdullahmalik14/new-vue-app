# Translation Management

The translation system works by deciding which language to use based on a simple priority: if the URL contains a locale, that always wins; if not, the system falls back to whatever language the user last chose in the language-switching form; if nothing was chosen before, it checks the browser’s language; and if all else fails, it uses English. This means the experience is predictable: developers can always explain that “the URL wins, your saved choice is second, and English is the final fallback.” Behind the scenes, the locale manager handles all of this automatically, including remembering the user’s chosen language for 90 days and updating the URL whenever the user selects a new language.

Each part of the system has a clear role. The locale manager is responsible for figuring out which language should be active and keeping the URL and saved preferences in sync. The translation loader is the engine that actually fetches the translation files for the current page or section. It first loads the English file as a fallback, and then — only if the selected locale is not English — it loads the specific language file and merges both together. This ensures nothing ever breaks if a translation key is missing or incomplete. The loader also caches results for one hour so repeated navigation feels instant.

Translations are organised by “sections” of the app. Each section has its own folder, and translations load only when that part of the interface is needed. This keeps the app fast because you never download translations you don’t immediately need. When navigating to a new section, the system automatically fetches the correct translation files based on the active language, and if preloading is enabled for certain sections, translations can be fetched quietly in the background so that navigating later feels instant.

The locale switcher form ties everything together in a way that makes sense for users. When a user picks a language from the dropdown, the system immediately updates the URL, saves the user’s selection as their new default, and reloads only the translation JSON for the current section — never the full page. If translations for other sections were preloaded earlier, the form selection will also trigger those files to warm up in the background. Developers don’t need to write any custom logic for this; the locale manager and translation loader already handle the entire sequence automatically.

Testing the system is intuitive. Simply visiting the site without a URL locale shows either the saved default from the form or English. Adding a locale to the URL forces the app into that language regardless of what the user previously chose. Removing the locale from the URL restores the saved preference. Using the form behaves exactly the same way: selecting a language updates the URL and stores the user’s choice, reloading translations instantly. Navigating across sections confirms that only translation JSON files are fetched — everything else stays cached.

Overall, the system provides a predictable, stable, and resilient translation flow. Developers get strict rules, clear fallbacks, and safe merging; users get an app that instantly switches between languages without page reloads; and the architecture remains efficient thanks to lazy loading, background preloading, and smart caching.
## Terminology
*   **Translation file:** `/src/i18n/section-<section>/<locale>.json`
*   **Section translation:** All translations belonging to one section
*   **Active locale:** Locale currently used for translation resolution
*   **Locale precedence chain:** URL locale → Cached locale (Pinia + localStorage) → Browser locale → Fallback English. localeManager
## The Translation System (3 Parts)
### 1) `localeManager.js` — determine active locale
*   URL locale detection (query `?locale=` and first path segment)
*   Cached locale (90-day TTL in localStorage)
*   Browser locale fallback
*   Updates URL on switch via `history.pushState`
*   Plays nicely with Pinia persistence
*   Implementation reference: localeManager. localeManager
### 2) `translationLoader.js` — load per-section translations
*   Dynamic import of JSON per section
*   File-existence validation before import
*   Merge English fallback + selected locale override
*   1-hour cache; dedupe concurrent loads; batch preload; perf tracking
*   Implementation reference: translationLoader. translationLoader
### 3) `index.js` — central export hub
*   Re-exports the public API your app imports.
*   Implementation reference: index. index
## Translation File Structure
The translation system stores language data in a section-based folder layout. Every section of the app has its own folder, and each folder contains one JSON file per supported language. English is always required, because the translation loader relies on it as the fallback base. When a developer adds a new locale, they simply drop in a second JSON file next to `en.json`, and the loader automatically merges both files at runtime. This structure ensures the app can safely load translations as needed without loading unnecessary files or breaking when a translation is incomplete.

```css
src/i18n/
  ├── section-auth/
  │      ├── en.json
  │      └── vi.json
  ├── section-dashboard/
  │      ├── en.json
  │      └── vi.json
  └── section-profile/
         ├── en.json
         └── vi.json
```

## Locale Precedence Explained
When the app starts or the user navigates, the locale manager reads the URL first. If there is a locale in the first path segment, that value immediately becomes the active language. This is why `/vi/hello/` forces Vietnamese even if the user selected something different earlier. If the URL contains no locale, the system checks localStorage to see if the user previously selected a language through the form. If nothing is saved, the browser’s default language is used. And if the browser language does not match a supported locale, the system finishes on English because English always exists. This flow ensures consistency and predictability across reloads, deep links, and direct URL access.
If the user has a saved locale (from the form), and they visit a URL _without_ a locale segment, the system should automatically rewrite the URL to include the saved locale.
Meaning:
User ENTERS:
[https://website.com/hello](https://website.com/hello)
But if their saved locale is **vi**, the system should REWRITE to:
[https://website.com/vi/hello](https://website.com/vi/hello)
This rewrite happens immediately via `history.replaceState` (no reload), and it makes the user’s URL match their saved language.
### Precedence Order
**1\. URL locale (strongest)**
The system always checks the URL first. If the first path segment is a valid locale such as `/vi/...` or `/en/...`, that locale becomes active immediately and overrides everything else. When the URL already contains a locale, the system does not rewrite anything because the URL has explicitly declared the language. Saved preferences, browser language, and fallback rules are all ignored in this case.
**2\. Saved user preference (localStorage)**
If the URL does not contain a locale, the system checks the stored user preference saved by the language-switcher form. This value is kept for 90 days under `user_locale_preference`. If it exists and is valid, it becomes the active locale and the system rewrites the URL to include it. For example, entering `/dashboard` while the saved locale is `vi` will immediately rewrite the URL to `/vi/dashboard`. This ensures the URL consistently reflects the user’s chosen language and behaves predictably across navigation, bookmarks, and shared links.
**3\. Browser language**
If there is no locale in the URL and no saved preference in storage, the system falls back to the browser’s language. The browser locale is reduced to its base code, such as `en-US` becoming `en` or `vi-VN` becoming `vi`. If that base language is supported by the application, it becomes the active locale. The system then rewrites the URL to include this locale so that the URL and UI language match.
**4\. Fallback English (weakest)**
If none of the above sources supply a valid locale — no URL locale, no saved locale, and an unsupported browser locale — the system uses English as the final fallback. English becomes the active locale, and the URL is rewritten to include `/en/...` to maintain consistency.
## Locale Manager Responsibilities
The locale manager determines which language the application should use at any given moment. It follows a strict, predictable order, always taking the first valid source it finds. It also keeps the URL consistent by updating the path to include the locale (e.g., `/vi/hello/`), and it saves the user’s choice in localStorage so the language persists across visits. This gives developers a clear explanation for why the app is showing a certain language and how the user’s selection is remembered for later sessions.
### Checklist – LocaleManager Responsibilities
*   Detects first path segment locale (`/vi/...`).
*   Updates URL path when switching (`/dashboard/` → `/vi/dashboard/`).
*   Reads/writes localStorage locale with 90-day TTL.
*   Converts browser language to base format.
*   Follows the strict 1–4 precedence order.
*   Provides APIs: `getActiveLocale()`, `setActiveLocale()`, `switchToLocale()`, `resetLocaleToDefault()`, `getLocalePreferenceOrder()`.
## Translation Loader Responsibilities
The translation loader fetches and merges translation files for each section. It always loads English first, because English is guaranteed to exist. It then loads the requested locale file if it exists and merges the two files so that missing keys never break the UI. The loader also caches the merged result for one hour and prevents duplicate fetches by tracking active loads. Understanding this is important for developers so they know what the loader does during navigation and why the network panel behaves the way it does.
### Checklist – TranslationLoader Responsibilities
*   Loads `en.json` for every section as the fallback base.
*   Loads the selected locale file second (if it exists).
*   Merges keys into a single final translation object.
*   Validates file existence before importing.
*   Caches merged translations for one hour.
*   Prevents duplicate loads using an internal lock.
*   Supports preloading translations for multiple sections.
*   Provides APIs for loading, preloading, checking load state, clearing caches, and reading stats.
## Translation Loading Sequence
Whenever the active section changes, or whenever the active locale changes, the loader begins by loading that section’s English translation file. This ensures the base set of keys is always valid. If the selected locale is not English, the loader loads the locale-specific file next and merges its keys with the English set. Missing keys fall back to English gracefully. The merged object is cached for one hour, so navigating back to a section does not require re-fetching the JSON files. Developers can inspect this behavior through provided console functions, making debugging easier.
## Language Switcher Form
The language-switching form is a simple `<select>` that triggers a full translation reload when the user chooses a new language. When the user selects a language, the system immediately updates the active locale, pushes the locale into the path (e.g., from `/dashboard/` to `/vi/dashboard/`), and saves that locale to localStorage with a 90-day TTL. After that, the loader reloads the translation JSON for the current section and preloads translations for other sections configured for preloading. This lets the UI update instantly without page reloads, and keeps the URL and user preference aligned.
## Locale Persistence
When a user chooses a language using the locale switcher form, the system writes that locale into localStorage under a key like `user_locale_preference`, with a **90-day expiration**. This value acts as the user’s “default language” whenever the URL does not explicitly specify a locale. The moment the user closes the browser or the tab, this saved value remains intact because localStorage survives browser restarts. This is what allows the app to remember the user’s language choice for months.
When the user returns to the site and opens it again, the locale manager follows its strict precedence chain. It first checks the URL to see if the path includes a locale segment such as `/vi/dashboard/`; if it does, that locale overrides everything else. If the URL does **not** contain a locale, the locale manager reads the saved `user_locale_preference` value from localStorage. Since this was stored during the user’s previous visit, the app immediately applies that locale and loads translation files for that language. This means the UI instantly appears in the user’s previously chosen language without requiring them to select it again.

If both the URL and the saved value are missing or invalid (for example, if the user has never chosen a language before), the system falls back to the browser’s default language. And finally, if that browser language is unsupported, the system ends on English as the guaranteed fallback. But as long as the user has picked a language once, opening the site again will always respect their stored preference unless the URL deliberately overrides it.

In summary: **persistence behaves exactly like a user expectation system**. Whatever the user selected last is remembered for 90 days and automatically applied whenever they visit the site without a forced locale in the URL. The saved preference is only ignored when the URL itself contains a locale path, because URL rules always take priority.
## Full Testing Guide
### Below is a full, structured testing guide with context explaining what each test proves and why it matters.Checklist – URL Locale Tests (Query + Path Segment)
**Purpose:** Prove that the URL always wins and test both formats.
*   Visit `/vi/dashboard/` → app must display Vietnamese (even if form default is English).
*   Visit `/en/profile/` → only English JSON loads.
*   Remove the locale path and visit `/dashboard/` → app must fall back to cached or browser locale.
*   In console:
    *   `getActiveLocale();`
    *   `getLocalePreferenceOrder();`
    *   Confirm the URL appears first in the chain.
### Checklist – Locale Switcher Form Tests
**Purpose:** Verify that selecting a language updates the URL path, reloads translations, and persists preferences.
*   Load `/dashboard/` with no locale in path.
*   Select Vietnamese in the form.
    *   URL becomes `/vi/dashboard/`.
    *   Translations reload immediately.
    *   The selected locale is saved for future visits.
*   Navigate to another section: `/vi/profile/`
    *   No additional JSON loads if cached.
*   Remove `/vi/` from the URL and reload.
    *   The saved Vietnamese preference is reapplied automatically.
*   Switch back to English with the form.
    *   URL becomes `/en/...`
    *   Only English JSON loads.
### Checklist – Preloading Tests
**Purpose:** Confirm the preloading system warms translation files in the background.
*   Identify a route that defines `preLoadSections: ["auth","dashboard"]`.
*   Visit that route.
    *   Network panel must show background loading of:
        *   `section-auth/en.json`
        *   `section-auth/<locale>.json`
        *   `section-dashboard/en.json`
        *   `section-dashboard/<locale>.json`
*   Navigate to `/vi/auth/` or `/vi/dashboard/`.
    *   No new JSON loads (must be cache hits).
*   Check stats: `getTranslationStatistics();`
### Checklist – Caching Behavior Tests
**Purpose:** Verify the 1-hour cache is working.
*   Load `/vi/dashboard/` → JSON files load in order.
*   Navigate away and return within one hour → no additional JSON loads.
*   Run: `areTranslationsLoadedForSection('dashboard', getActiveLocale());`
*   Clear caches:
    *   `clearTranslationCaches();`
    *   Navigate again → JSON must reload.
### Checklist – Missing File Tests
**Purpose:** Prove the fallback-to-English mechanism works.
*   Temporarily rename `vi.json`.
*   Visit `/vi/dashboard/`.
    *   Only `en.json` loads; UI must stay functional.
*   Restore file and clear cache.
### Checklist — Persistence Storage Behavior
*   After selecting a language in the form, confirm a `user_locale_preference` entry exists in localStorage.
*   Confirm the saved value includes the correct locale code (e.g., `"vi"`).
*   Confirm the stored object includes an expiration timestamp (90-day TTL).
*   Refresh the page _without_ a locale in the URL — the UI should load in the saved language.
*   Close the tab, reopen a new tab, visit the site — the UI should still use the saved language.
*   Fully close the browser (Chrome/Edge/Safari), reopen, visit the site — saved language must still apply.
*   Clear only cache (not storage) and reload — locale must still persist (stored in localStorage, not cookies).
*   Delete the storage key manually in devtools → reload → app must fall back to browser locale or English
### Checklist – Diagnostic Tools
**Purpose:** Ensure developers can inspect locale state and translation cache.
*   Run:
*   `getActiveLocale();`
*   `getLocalePreferenceOrder();`
*   `getTranslationStatistics();`
*   Confirm values match your current test scenario.
##