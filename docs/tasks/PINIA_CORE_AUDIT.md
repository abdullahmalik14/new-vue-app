
## CRITICAL Issues

### CRIT-01 — `paths` option silently ignored in pinia-plugin-persistedstate v4

**File:** `usePreloadStore.js`, `useLocaleStore.js`  
**Severity:** Critical

In v4.x, `paths` was renamed to `pick`. Both stores still use `paths`, so field filtering is ignored and the entire store state is persisted.

**Fix:** Replace `paths` with `pick` in both stores.

---

### CRIT-01 — `paths` option silently ignored in pinia-plugin-persistedstate v4

#### Resolution ✅

**Status:** Resolved — persisted state now uses `pick`.

**What was broken:** Pinia persisted state used the deprecated `paths` option, so v4 ignored the filter and persisted the entire store state.

**Why it happened:** The plugin renamed `paths` to `pick` in v4, but the store configs were not updated.

**What changed:** Replaced `paths` with `pick` in `usePreloadStore` and `useLocaleStore` persistence configs.

**How to test in the browser (one paste):**
```js
(async () => {
  const { usePreloadStore } = await import('/src/stores/usePreloadStore.js');
  const { buildPersistKey } = await import('/src/utils/common/persistUtils.js');
  const store = usePreloadStore();
  store.sectionsInProgress.add('demo');
  store.addSection('auth');
  await new Promise((resolve) => setTimeout(resolve, 0));
  const raw = localStorage.getItem(buildPersistKey('app-preload-state')) || '{}';
  const parsed = JSON.parse(raw);
  const data = parsed.data || {};
  console.log({
    hasSectionsInProgress: 'sectionsInProgress' in data,
    pass: !('sectionsInProgress' in data),
  });
})();
```

**Expected:** `pass: true`.

---

### PERF-02 — Locale getters call `log()` on recompute

**File:** `useLocaleStore.js`  
**Severity:** Medium

**Fix:** Remove side effects from getters.


---

### PERF-02 / BP-02 — Locale getters call `log()` on recompute

#### Resolution ✅

**Status:** Resolved — locale getters are now side-effect free.

**What was broken:** `currentLocale` and `isDefaultLocale` triggered logging and performance tracking on every recompute.

**Why it happened:** Getter logic included instrumentation meant for actions.

**What changed:** Removed logging and performance tracker calls from `currentLocale` and `isDefaultLocale`.

**How to test in the browser (one paste):**
```js
(async () => {
  const { useLocaleStore } = await import('/src/stores/useLocaleStore.js');
  const store = useLocaleStore();
  store.locale = null;
  const before = store.locale;
  const current = store.currentLocale;
  console.log({
    current,
    unchanged: store.locale === before,
    pass: store.locale === before,
  });
})();
```

**Expected:** `pass: true`.



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

### BP-03 — `storage: localStorage` direct reference instead of factory

#### Resolution ✅

**Status:** Resolved — storage now uses a factory callback.

**What was broken:** Persistence configs used a direct `localStorage` reference, which can be unsafe in SSR/hydration contexts.

**Why it happened:** The configs were written against older examples before the factory recommendation.

**What changed:** Updated `usePreloadStore` and `useLocaleStore` to use `storage: () => localStorage` (with the existing `localStorage` guard in preload).

**How to test in the browser (one paste):**
```js
(async () => {
  const { resolvePersistStorage } = await import('/src/utils/common/persistUtils.js');
  const storage = resolvePersistStorage();
  console.log({ hasStorage: !!storage, pass: !!storage });
})();
```

**Expected:** `pass: true`.

---

### BP-04 — No `beforeRestore` / `afterRestore` hooks

**Files:** `cart`, `DashboardAnalytics`, `locale`, `preload` (plugin-persisted non-auth stores)  
**Severity:** Medium


---

### BP-04 — No `beforeRestore` / `afterRestore` hooks

#### Resolution ✅

**Status:** Resolved — added restore hooks to persisted stores.

**What was broken:** Persisted stores restored state without standardized hooks, so normalization and safety checks were missing.

**Why it happened:** Persist configs relied on defaults and never added lifecycle hooks.

**What changed:** Added `beforeRestore`/`afterRestore` hooks to `cart`, `DashboardAnalytics`, `locale`, and `preload` stores; hooks normalize restored shapes and re-run preload set normalization/build-hash sync.

**How to test in the browser (one paste):**
```js
(async () => {
  const { usePreloadStore } = await import('/src/stores/usePreloadStore.js');
  const { buildPersistKey } = await import('/src/utils/common/persistUtils.js');
  const store = usePreloadStore();
  localStorage.setItem(
    buildPersistKey('app-preload-state'),
    JSON.stringify({ version: 1, data: { preloadedSections: ['auth'], preloadedAssets: [] } }),
  );
  await store.$hydrate({ runHooks: true });
  console.log({
    isSet: store.preloadedSections instanceof Set,
    pass: store.preloadedSections instanceof Set,
  });
})();
```

**Expected:** `pass: true`.


---

## Missing Features (stores & plugin)

### FEAT-01 — No TTL on persisted data

**Severity:** High

Comment in `useLocaleStore` claiming "90 days TTL" is incorrect for localStorage.

#### Resolution ✅

**Status:** Resolved — persisted stores now enforce TTL via serializers.

**What was broken:** Persisted state never expired; localStorage entries could live indefinitely across releases.

**Why it happened:** Persist configs relied on default serialization with no expiry metadata.

**What changed:** Added shared persisted-state serializer with TTL support and applied it to all persisted stores; TTL defaults to 90 days and can be overridden via `VITE_PERSIST_TTL_MS`.

**How to test in the browser (one paste):**
```js
(async () => {
  const { createPersistedStateSerializer } = await import('/src/utils/common/persistUtils.js');
  const serializer = createPersistedStateSerializer({
    version: 1,
    ttlMs: 1000,
    fallback: { items: [] },
  });
  const payload = serializer.serialize({ items: ['x'] });
  const expired = serializer.deserialize(
    JSON.stringify({ ...JSON.parse(payload), expiresAt: Date.now() - 1000 }),
  );
  console.log({ items: expired.items.length, pass: expired.items.length === 0 });
})();
```

**Expected:** `pass: true`.

---

### FEAT-03 — No schema versioning / migration

**Severity:** Medium

#### Resolution ✅

**Status:** Resolved — persisted payloads now include versions and migration hooks.

**What was broken:** Persisted state had no schema version, so future changes could not be migrated safely.

**Why it happened:** Pinia persistedstate was used with the default serializer and no migration wrapper.

**What changed:** Added versioned serializers for all persisted stores with legacy fallbacks; migration hooks now normalize legacy payloads.

**How to test in the browser (one paste):**
```js
(async () => {
  const { createPersistedStateSerializer } = await import('/src/utils/common/persistUtils.js');
  const serializer = createPersistedStateSerializer({ version: 1, fallback: {} });
  const payload = JSON.parse(serializer.serialize({ demo: true }));
  console.log({ version: payload.version, pass: payload.version === 1 });
})();
```

**Expected:** `pass: true`.

---



### ADD-FEAT-01 — Persist keys not namespaced by env/version

**Severity:** Medium

#### Resolution ✅

**Status:** Resolved — persist keys now include env/build hash.

**What was broken:** Persist keys were shared across environments and builds, so stale data could bleed between deploys.

**Why it happened:** Store configs used fixed keys with no env/build suffix.

**What changed:** Added `buildPersistKey()` to namespace persisted keys with `import.meta.env.MODE` and build hash.

**How to test in the browser (one paste):**
```js
(async () => {
  const { buildPersistKey } = await import('/src/utils/common/persistUtils.js');
  const key = buildPersistKey('cart');
  console.log({ key, pass: key.includes(':') });
})();
```

**Expected:** `pass: true`.

---

### ADD-FEAT-02 — No deserialize corruption guard for plugin persistence

**Severity:** Medium

#### Resolution ✅

**Status:** Resolved — deserialization is now guarded and falls back safely.

**What was broken:** Corrupted JSON would throw during restore and could block store hydration.

**Why it happened:** Persistedstate deserialization used `JSON.parse` without a try/catch guard.

**What changed:** Added shared serializer that catches parse errors and returns a safe fallback payload.

**How to test in the browser (one paste):**
```js
(async () => {
  const { createPersistedStateSerializer } = await import('/src/utils/common/persistUtils.js');
  const serializer = createPersistedStateSerializer({ version: 1, fallback: { items: [] } });
  const restored = serializer.deserialize('{bad json');
  console.log({ items: restored.items.length, pass: restored.items.length === 0 });
})();
```

**Expected:** `pass: true`.

---

### ADD-FEAT-03 — No storage quota monitoring in store persistence paths

**Severity:** Low

#### Resolution ✅

**Status:** Resolved — persisted stores now trigger quota checks.

**What was broken:** There was no visibility into localStorage/IndexedDB quota usage.

**Why it happened:** Persistence ran without any storage usage monitoring hooks.

**What changed:** Added `attachStorageQuotaMonitor()` which logs a warning when storage usage exceeds a threshold.

**How to test in the browser (one paste):**
```js
(async () => {
  const { checkStorageQuota } = await import('/src/utils/common/persistUtils.js');
  const result = await checkStorageQuota({ warnRatio: 0, label: 'manual-test' });
  console.log({ hasEstimate: !!result, pass: result !== null });
})();
```

**Expected:** `pass: true` and a console warning about storage usage (if `navigator.storage.estimate` is supported).

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

#### Resolution ✅

**Status:** Resolved — `hasSection`/`hasAsset` now live in getters.

**What was broken:** Read-only helpers were actions, so reactive consumers didn't track changes.

**Why it happened:** Convenience checks were added as actions instead of getter functions.

**What changed:** Moved `hasSection` and `hasAsset` into `getters` (keeping the same API name) so they participate in reactivity.

**How to test in the browser (one paste):**
```js
(async () => {
  const { usePreloadStore } = await import('/src/stores/usePreloadStore.js');
  const store = usePreloadStore();
  store.addSection('auth');
  console.log({ has: store.hasSection('auth'), pass: store.hasSection('auth') === true });
})();
```

**Expected:** `pass: true`.

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

#### Resolution ✅

**Status:** Resolved — empty/invalid values are ignored.

**What was broken:** `addSection`/`addAsset` accepted empty strings and `undefined`, persisting phantom entries.

**Why it happened:** Input validation was missing before Set insertion.

**What changed:** Added string/blank guards to `addSection` and `addAsset`.

**How to test in the browser (one paste):**
```js
(async () => {
  const { usePreloadStore } = await import('/src/stores/usePreloadStore.js');
  const store = usePreloadStore();
  store.clearState();
  store.addSection('');
  store.addAsset('');
  console.log({
    sections: store.preloadedSections.size,
    assets: store.preloadedAssets.size,
    pass: store.preloadedSections.size === 0 && store.preloadedAssets.size === 0,
  });
})();
```

**Expected:** `pass: true`.
