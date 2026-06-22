# Translation Audit — Remaining Fixes

**Verified:** 2026-06-11 against `new-vue-app-main/src/`  
**Source audit:** [TRANSLATION_AUDIT.md](./TRANSLATION_AUDIT.md)  
**Code location:** i18n lives in `src/systems/i18n/` (audit paths still say `src/utils/translation/`)

---

## Summary

| Category | Count |
|----------|------:|
| Core pipeline fixes verified in code | 45 |
| Acknowledged partial / deferred (audit says foundation only) | 2 |
| Marked resolved but **not** fixed in code | 1 |
| Stale source / doc cleanup | 2 |

---

## 1. P-07 — `DashboardSharedSidebar.vue` still loads translations

**Audit status:** Resolved — removed duplicate `loadTranslationsForSection` from dashboard/auth components.

**Code reality:** `src/templates/dashboard/shared/DashboardSharedSidebar.vue` still calls:

```js
await loadTranslationsForSection('dashboard-global', locale);
```

in `loadTranslations()`. Auth views and `menuItems.js` were cleaned up; this shared sidebar was not.

**Why it matters:** Router `beforeResolve` already loads the current section via `startCurrentSectionResourceLoads`. The sidebar duplicates work on mount/locale change. `tests/unit/componentTranslationLoads.test.js` lists this file and **will fail** if tests are run.

**Fix:** Remove `loadTranslations()` / `loadTranslationsForSection` from `DashboardSharedSidebar.vue`. Keep `resolveMenuItems()` on locale change (menu labels only). Rely on `routeNavigationData.js` + `setActiveLocale` for section JSON.

**Files:** `src/templates/dashboard/shared/DashboardSharedSidebar.vue`

---

## 2. B-07 / F-07 — Locale number/date/currency formatting (component migration)

**Audit status:** Resolved (formatting foundation); component migration **deferred**.

**Code reality:** Foundation exists and is wired:

- `src/systems/i18n/localeFormatConfig.js`
- `src/systems/i18n/localeFormatting.js`
- `main.js` passes `numberFormats` / `datetimeFormats` into `createI18n`

Profile payment flows still use local `formatCurrency` with hardcoded US-style logic:

- `TopUpStep1.vue`, `TopUpStep2.vue`
- `TipStep2.vue`, `TipStep3.vue`

**Fix:** Replace local helpers with `formatLocaleCurrency` / `useI18n().n()` / `d()` when touching those templates.

---

## 3. B-03 / F-07 — Full RTL layout sprint

**Audit status:** Partially resolved — `<html dir>` + `rtl-foundation.css` done; app-wide CSS RTL is a **dedicated sprint**.

**Code reality (foundation ✅):**

- `applyDocumentLocaleAttributes()` sets `lang` + `dir`
- `src/assets/styles/rtl-foundation.css` imported in `main.js`

**Still out of scope per audit:**

- Logical properties (`margin-inline-*`) across all components
- Mirrored icons / RTL QA per screen

**Fix:** Track as a separate UI sprint; no further i18n pipeline work required for “foundation complete.”

---

## 4. Stale `vif.json` in `src/i18n/`

**Audit status:** S-02 resolved — `public/i18n/section-shop/vi.json` exists.

**Code reality:** Orphan typo file remains:

- `src/i18n/section-shop/vif.json` (not used at runtime; loader reads `public/i18n/`)

**Fix:** Delete `src/i18n/section-shop/vif.json` or rename to `vi.json` if `src/i18n/` is still a source tree. `validate:i18n` only scans `public/i18n/`, so this typo is invisible to CI.

---

## 5. Audit doc gaps (code fixed, doc not updated)

These second-pass items are **implemented in code** but `TRANSLATION_AUDIT.md` has no `#### Resolution ✅` block:

| ID | Verification |
|----|-------------|
| **L-13** | `getLocaleFromUrl()` reads `?locale=` via `URLSearchParams`; router redirects query → path |
| **L-14** | `getLeadingLocaleFromPath()` normalizes with `.toLowerCase()` |
| **L-15** | `updateUrlWithLocale()` uses `localeRouter.replace()` + `stripBaseUrlFromPath()` for `BASE_URL` |

**Fix:** Add resolution sections to the audit doc (optional housekeeping).

---

## 6. Stale developer docs

`docs/rules/translation-system-rules.md` still references `waitForTranslationLoad` (removed in P-04; replaced by `inFlightPromises` Map).

**Fix:** Update rules doc to match `translationLoader.js`.

---

## Verified fixed (high level)

All other audit items checked in live code:

| Area | Items | Notes |
|------|-------|-------|
| Logical | L-01–L-12, L-16, L-17 | `await setActiveLocale`, deep merge, TTL persist via `$persist`, JWT stale guard |
| Performance | P-01–P-06 | GET-only fetch, shared promises, prefix cache clear, LRU map cap |
| Security | S-01–S-05 | `window.APP` dev-only, `vi.json` in public, URL encode + allowlist |
| Best practice | B-01–B-06, B-08–B-09 | TTL, `useId()`, hreflang, circular dep broken |
| Features | F-01–F-04, F-06, F-10–F-11 | Settings field, translate-page control, `validate:i18n` CI, base bundles |

**L-16 note:** Audit describes a manual `localStorage.setItem` fallback; current code uses `this.$persist()` after `setLocale`. `tests/unit/piniaCoreAuditFollowUp.test.js` confirms rapid `setLocale` writes one consistent `locale_preference` key — behavior matches intent.

**S-03 note:** No `v-html` + `$t()` combo. `TierCard.vue` / `SubscriptionCard.vue` still use `v-html` for **API/demo props** (accepted in audit).

**Accepted behaviour:** Initial English flash before JSON loads (documented at top of audit).

---

## Suggested order of work

1. **P-07** — Remove duplicate load from `DashboardSharedSidebar.vue` (unblocks passing `componentTranslationLoads.test.js`)
2. Delete or fix `src/i18n/section-shop/vif.json`
3. Update `translation-system-rules.md`
4. B-07 component migration (as you touch profile/payment UI)
5. RTL CSS sprint (B-03 / F-07 follow-up)

---

## Verification checklist

- [ ] `npm run test:unit -- tests/unit/componentTranslationLoads.test.js --run` passes
- [ ] Dashboard sidebar labels still update after language switch (without component-level `loadTranslationsForSection`)
- [ ] `npm run validate:i18n` passes
- [ ] No `vif.json` under translation source trees
- [ ] Optional: profile payment pages use `formatLocaleCurrency` for active locale
