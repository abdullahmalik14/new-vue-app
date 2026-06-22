# Asset Library Audit — Remaining Fixes

**Verified:** 2026-06-11 against `new-vue-app-main/src/`  
**Source audit:** [ASSET_LIBRARY_AUDIT.md](./ASSET_LIBRARY_AUDIT.md)  
**Status:** 58/60 core library items fixed in code; gaps below are adoption / call-site work.

---

## Summary

| Category | Count |
|----------|------:|
| Core library fixes verified | 58 |
| Explicitly not implemented (acknowledged in audit) | 1 |
| Library done, call sites / UI not updated | 4 areas |

---

## 1. M-02 step 4 — Warm section asset map at startup

**Audit:** Steps 1–3 and 5 done; step 4 optional follow-up **not implemented**.

**Current behavior:** `initAssetLibrary()` in `src/systems/assets/assetLibrary.js` loads the global map and warms global flags only. It does not call `loadSectionAssetMap()` for the initial route's section.

**Fix:**
- In `initAssetLibrary()` (or `main.js` after router is ready), resolve the current route's section and call `loadSectionAssetMap(section)`.
- Optionally warm section flags via `preloadAssetUrls(flags, { section, environment })`.

**Files:** `src/systems/assets/assetLibrary.js`, `src/app/main.js`

---

## 2. B-01 / M-01 — Pass `{ section }` in auth and dashboard templates

**Library:** Section merge works when `{ section }` is passed.  
**Gap:** Auth and dashboard Vue templates call `getAssetUrl(flag)` without section context, so `assetMap.auth.json` overrides (e.g. dev `auth.background`) never apply on `/log-in`.

**Fix:** Pass section on every resolve in section-scoped UI:

```js
await getAssetUrl('auth.background', { section: 'auth' })
await getAssetUrlForCss('auth.background', { section: 'auth' })
```

**Files to update:**

| File | Change |
|------|--------|
| `src/templates/auth/AuthLayout.vue` | Add `{ section: 'auth' }` to `getAssetUrlForCss` |
| `src/templates/auth/AuthHeader.vue` | Add `{ section: 'auth' }` to `getAssetUrl` calls |
| `src/templates/auth/views/AuthLogIn.vue` | Add `{ section: 'auth' }` |
| `src/templates/auth/views/AuthSignUp.vue` | Add `{ section: 'auth' }` |
| `src/templates/dashboard/shared/DashboardSharedSidebar.vue` | Pass dashboard section name |
| `src/templates/dashboard/shared/DashboardSharedHeader.vue` | Pass dashboard section name |

**Reference:** `src/config/assetMap.auth.json`, `src/config/assetMap.README.md`

---

## 3. A-S02 — Use safe URL helpers for `:src` bindings

**Library:** `getAssetUrlForCss()` and `getAssetUrlForAttr()` exist.  
**Gap:** `getAssetUrlForAttr` has **zero consumers**. Most templates bind raw `getAssetUrl()` results to `:src`.

**Fix:**
- Replace `getAssetUrl(flag)` + `:src` with `getAssetUrlForAttr(flag, options)` for img/link attributes.
- Keep `getAssetUrlForCss` for CSS `backgroundImage` (already used in `AuthLayout.vue`).

**Files:** Same auth/dashboard templates as §2, plus any other `:src` bindings using `getAssetUrl`.

---

## 4. M-08 / A-M03 / A-M01 — Adopt reactive and sync APIs in UI

**Library:** APIs exist but are unused in templates.

| API | File | Adoption |
|-----|------|----------|
| `useAssetUrl` | `src/composables/useAssetUrl.js` | No template imports |
| `getAssetUrlSync` | `src/systems/assets/assetLibrary.js` | No template imports |
| `primeAssetIndex` | `src/systems/assets/assetLibrary.js` | No callers |

**Fix:**
- Prefer `useAssetUrl(flag, sectionName)` in Vue components instead of `onMounted` + `getAssetUrl`.
- After `initAssetLibrary()`, use `getAssetUrlSync` for flags already warmed to avoid mount flicker.
- Call `primeAssetIndex({ section, environment })` during startup or section enter for menu/sidebar bulk lookup.

---

## 5. Hardcoded URLs outside asset library (out of audit scope)

These bypass flag resolution and allowlist validation entirely.

| File | Issue |
|------|--------|
| `src/templates/auth/AuthHeader.vue` | Hardcoded `i.ibb.co` fallbacks |
| `src/components/ui/cart/Cart.vue` | Hardcoded `i.ibb.co.com` URLs |
| `src/dev/templates/payout/PayoutPage.vue` | Hardcoded `i.ibb.co.com` URLs |
| `src/assets/data/settingConfig.js` | Hardcoded `i.ibb.co.com` icon URLs |

**Fix:** Add flags to `assetMap.json` (or section maps) and resolve via `getAssetUrl` / `getAssetUrlForAttr`.

---

## Suggested order of work

1. §2 — Section context in auth/dashboard (unblocks section overrides)
2. §3 — Safe attr helpers for `:src`
3. §4 — `useAssetUrl` / `getAssetUrlSync` in high-traffic UI
4. §1 — Startup warm for initial-route section map
5. §5 — Migrate hardcoded URLs

---

## Verification checklist

After fixes:

- [ ] `/log-in` in dev: `auth.background` resolves to section override when `{ section: 'auth' }` is passed
- [ ] `getAssetUrlForAttr` used for all img `src` from asset flags
- [ ] `useAssetUrl` or `getAssetUrlSync` used in dashboard sidebar/header
- [ ] `initAssetLibrary` warms section map for initial route (if implementing §1)
- [ ] No hardcoded `i.ibb.co` in auth/cart/settings templates
- [ ] `npm run test:unit -- tests/unit/assetMap*.test.js tests/unit/sectionAssetMapMerge.test.js --run`
