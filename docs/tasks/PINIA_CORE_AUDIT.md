
## CRITICAL Issues

### CRIT-01 — `paths` option silently ignored in pinia-plugin-persistedstate v4

**File:** `usePreloadStore.js`, `useLocaleStore.js`  
**Severity:** Critical

In v4.x, `paths` was renamed to `pick`. Both stores still use `paths`, so field filtering is ignored and the entire store state is persisted.

**Fix:** Replace `paths` with `pick` in both stores.



### PERF-02 — Locale getters call `log()` on recompute

**File:** `useLocaleStore.js`  
**Severity:** Medium

**Fix:** Remove side effects from getters.



### BP-02 — Side effects in getters (logging)

**File:** `useLocaleStore.js`  
**Severity:** Medium

Getters call `log()` on every recompute — remove side effects from getters.

---

### BP-03 — `storage: localStorage` direct reference instead of factory

**Files:** `usePreloadStore.js`, `useLocaleStore.js`  
**Severity:** Low

**Fix:** `storage: () => localStorage`

---

### BP-04 — No `beforeRestore` / `afterRestore` hooks

**Files:** `cart`, `DashboardAnalytics`, `locale`, `preload` (plugin-persisted non-auth stores)  
**Severity:** Medium

---

## Missing Features (stores & plugin)

### FEAT-01 — No TTL on persisted data

**Severity:** High

Comment in `useLocaleStore` claiming "90 days TTL" is incorrect for localStorage.

---

### FEAT-03 — No schema versioning / migration

**Severity:** Medium

---



### ADD-FEAT-01 — Persist keys not namespaced by env/version

**Severity:** Medium

---

### ADD-FEAT-02 — No deserialize corruption guard for plugin persistence

**Severity:** Medium

---

### ADD-FEAT-03 — No storage quota monitoring in store persistence paths

**Severity:** Low

---

## Additional Issues (Fourth Pass)

> New findings only. All checked against previous passes.

---

### NEW-PERF-01 — `hasSection` and `hasAsset` defined as actions, not getters

**File:** `usePreloadStore.js` lines 27–29, 48–50  
**Severity:** High

```js
actions: {
  hasSection(sectionName) {
    return this.preloadedSections.includes(sectionName);  // read-only check in an action
  },
  hasAsset(assetUrl) {
    return this.preloadedAssets.includes(assetUrl);
  },
```

In Pinia, only `getters` establish reactive dependencies — `actions` do not. `hasSection` and `hasAsset` are pure read operations: they never mutate state, never have side effects, and return a derived boolean. Defining them as actions means they bypass the getter cache and do not participate in Vue's reactivity tracking. Any reactive context that reads these will not update when `preloadedSections` or `preloadedAssets` changes.

**Fix:** Move both to `getters`:
```js
getters: {
  isSectionLoaded: (state) => (name) => state.preloadedSections.includes(name),
  isAssetLoaded: (state) => (url) => state.preloadedAssets.includes(url),
}
```

---

### NEW-BP-01 — `addSection` / `addAsset` accept empty strings silently

**File:** `usePreloadStore.js` lines 15–19, 35–37  
**Severity:** Low

```js
addSection(sectionName) {
  if (!this.preloadedSections.includes(sectionName)) {
    this.preloadedSections.push(sectionName); // '' is pushed if called with no arg
  }
}
```

Calling `addSection('')` or `addAsset(undefined)` passes the `!includes` guard and appends invalid entries to the arrays, which are then persisted. Subsequent `hasSection('')` calls return `true`, causing cache hits for phantom sections.

**Fix:**
```js
if (!sectionName || typeof sectionName !== 'string') return;
```
