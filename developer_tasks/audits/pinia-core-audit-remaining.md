# Pinia Core Audit — Remaining Fixes

**Verified:** 2026-06-11 against `new-vue-app-main/src/stores/` and `src/utils/common/persistUtils.js`  
**Source audit:** [PINIA_CORE_AUDIT.md](./PINIA_CORE_AUDIT.md)

---

## Summary

| Category | Count |
|----------|------:|
| Audit items verified fixed in code | **16** |
| Out-of-scope stores not migrated to shared persist pattern | **2** |
| Minor follow-ups in audited stores | **1** |

**Bottom line:** Every item in `PINIA_CORE_AUDIT.md` is implemented. Remaining work is **other stores** that were never in the audit scope (`useAuthStore`, `useChatStore`) plus one small locale-store edge case.

---

## 1. `useAuthStore` — not on shared persist stack (out of audit scope)

**Audit scope:** `cart`, `DashboardAnalytics`, `locale`, `preload` (BP-04).

**Code reality:** `useAuthStore.js` still uses bare `persist: true`:

```js
persist: true
```

This persists the **entire** store (including `_refreshInterval`) with no `pick`, TTL serializer, `buildPersistKey`, or `persistStorageAdapter`.

**Also:** Same **BP-02** pattern the audit fixed in `useLocaleStore` — getters `isAuthenticated`, `userRole`, and `userEmail` still call `log()` and `window.performanceTracker.step()` on every recompute.

**Fix (if desired):**
- Migrate to `persist: { pick: [...], storage: persistStorageAdapter, serializer: ... }` or stop persisting auth in Pinia (tokens already in `localStorage` via `refreshFromStorage`).
- Remove side effects from auth getters.

---

## 2. `useChatStore` — manual localStorage (out of audit scope)

**Code reality:** `useChatStore.js` uses ad-hoc `loadState` / `saveState` helpers with raw `localStorage` keys `chat_messages` and `chat_paging`.

**Missing vs shared stack:** No TTL, schema version, corruption guard, env namespacing, or quota monitoring from `persistUtils.js`.

**Fix (if desired):** Migrate to pinia-plugin-persistedstate + `createPersistedStateSerializer`, or document as intentionally separate.

---

## 3. `useLocaleStore.resetToDefault` — no explicit `$persist()`

**Audit:** FU-03 resolved double-write; `setLocale` correctly uses `$persist()` only.

**Gap:** `resetToDefault()` sets `this.locale = DEFAULT_LOCALE` but does **not** call `$persist()`. Depending on plugin subscribe timing, localStorage may lag until the next persisted mutation.

**Fix:** Mirror `setLocale`:

```js
this.locale = DEFAULT_LOCALE;
if (typeof this.$persist === 'function') {
  this.$persist();
}
```

---

## Verified fixed (all 16 audit items)

| ID | Verification |
|----|-------------|
| **CRIT-01** | `pick` (not `paths`) in `usePreloadStore`, `useLocaleStore`, `useCartStore`, `useIpStore` |
| **PERF-02 / BP-02** | `useLocaleStore` getters have no `log()` / performance tracker calls |
| **BP-03** | `storage: persistStorageAdapter` (SSR-safe StorageLike; supersedes `() => localStorage`) |
| **BP-04** | `beforeHydrate` / `afterHydrate` on cart, dashboard-analytics, locale, preload, ip |
| **FEAT-01** | TTL via `createPersistedStateSerializer` + `expiresAt` |
| **FEAT-03** | Version + `migrate` hooks on all persisted stores using shared serializer |
| **ADD-FEAT-01** | `buildPersistKey()` — env-only by default (`FU-06`) |
| **ADD-FEAT-02** | Deserialize try/catch + fallback in serializer |
| **ADD-FEAT-03** | `attachStorageQuotaMonitor()` on hydrate |
| **NEW-PERF-01** | `hasSection` / `hasAsset` in `getters` |
| **NEW-BP-01** | `isValidSectionKey` guards on add/remove |
| **FU-01** | `persistStorageAdapter.removeItem` |
| **FU-02** | `WeakSet` guard in `attachStorageQuotaMonitor` |
| **FU-03** | No manual `localStorage.setItem` in `setLocale`; uses `$persist()` |
| **FU-04** | `sectionsInProgress` uses Set reference replacement |
| **FU-05** | `isSectionInProgress` in `getters` |
| **FU-06** | `buildPersistKey` env-only; `migrateBuildHashPersistKey` for legacy hash keys |

**Note:** `useDashboardAnalyticsStore` has no `pick` — persists full analytics cache by design (intentional for bundle caching, not a CRIT-01 regression).

---

## Verification checklist

- [ ] `npm run test:unit -- tests/unit/piniaCoreAuditFollowUp.test.js tests/unit/persistUtils.test.js tests/unit/usePreloadStore.test.js tests/unit/useLocaleStore.test.js --run`
- [ ] Preload persist excludes `sectionsInProgress` (CRIT-01 browser test in audit)
- [ ] Cart/locale keys use `buildPersistKey` format (`cart:development`, not hash-suffixed)
- [ ] Optional: migrate `useAuthStore` / `useChatStore` to shared persist stack
- [ ] Optional: add `$persist()` to `resetToDefault`
