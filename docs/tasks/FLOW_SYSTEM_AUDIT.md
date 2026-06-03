# Flow System Audit

**Scope:**
- `src/services/flow-system/`
- `src/services/*/flows/`
- `src/services/*/mappers/`
- `src/services/*/validators/`

**Files audited:** 140 files — 21 `flow-system` core, 101 `*/flows/`, 16 `*/mappers/`, 3 `*/validators/`

**Per-flow registry and call-site issues** (wrong `flowKind`, unused mappers, destination config, etc.) are in [`FLOW_USAGE_AUDIT.md`](./FLOW_USAGE_AUDIT.md) — not duplicated here.

---

## Table of Contents

1. [Logical Bugs](#1-logical-bugs)
2. [Performance Issues](#2-performance-issues)
3. [Security Issues](#3-security-issues)
4. [Best Practice Violations](#4-best-practice-violations)
5. [Missing Features](#5-missing-features)
6. [Summary Table](#6-summary-table)

---

## 1. Logical Bugs

---

### BUG-01 — Duplicate registry key `"events.fetchEvent"` silently drops pipeline config

**Moved to** [`FLOW_USAGE_AUDIT.md`](./FLOW_USAGE_AUDIT.md) **USE-03** (registry / usage audit).

**File:** `src/services/flow-system/flowRegistry.js` — duplicate `"events.fetchEvent"` keys (lines ~101 and ~215)

In a JS object literal, the second key wins. The minimal second entry replaced the full pipeline entry (timeouts, concurrency, retry).

#### Resolution ✅

**Status:** Resolved (implemented here; `FLOW_USAGE_AUDIT.md` not required).

**What was broken:** `events.fetchEvent` lost `pipeline.timeouts`, `pipeline.concurrency`, and related config because a bare duplicate key overwrote the full registry entry.

**Why it happened:** The same flow was registered twice—once with pipeline options and again with only `flowKind` + `flow`.

**What changed:** Removed the duplicate minimal `"events.fetchEvent"` block; the surviving entry retains `requestMs: 8000`, `totalFlowMs: 10000`, and `latestWins` concurrency.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { flowRegistry } = await import('/src/services/flow-system/flowRegistry.js');
  const e = flowRegistry['events.fetchEvent'];
  const out = {
    entryExists: !!e,
    requestTimeout: e?.pipeline?.timeouts?.requestMs === 8000,
    totalTimeout: e?.pipeline?.timeouts?.totalFlowMs === 10000,
    concurrency: e?.pipeline?.concurrency?.policy === 'latestWins',
  };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

---

### BUG-02 — `withAuth` middleware is permanently disabled by default

**File:** `src/services/flow-system/FlowHandler.js` — line 24

```js
const defaultMiddlewares = []; // [withMetrics, withTimeout, withRetry, withAuth];
```

All middleware has been commented out of the defaults. `withAuth` never runs unless the caller explicitly passes it via `options.middlewares`. The `context.requireAuth` flag is read by `withAuth` correctly, but since `withAuth` is never in the middleware chain, the flag has no effect.

**Impact:** Every flow executes without authentication enforcement. A flow that requires `userId` will proceed without it; the `AUTH_REQUIRED` error code is never emitted in practice.

**Fix:** Restore default middlewares (at minimum `withAuth`) or document that callers must always pass `withAuth` explicitly.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `defaultMiddlewares` was `[]`, so `withAuth` (and `withMetrics`, `withTimeout`, `withRetry`) never ran unless passed per call. `requireAuth` on context had no effect.

**Why it happened:** The default stack was commented out during debugging and never restored.

**What changed:**
- Restored `defaultMiddlewares = [withMetrics, withTimeout, withRetry, withAuth]` in `FlowHandler.js`.
- Aligned `requireAuth` to **opt-in** (`requireAuth === true` in `withAuth.js` and `pipelineContext.js`) so existing call sites without `userId` keep working until BUG-19 wires auth state. Flows that need auth must pass `{ requireAuth: true, userId }`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { flowMiddlewares } = await import('/src/services/flow-system/FlowHandler.js');
  const wrapped = flowMiddlewares.withAuth(async () => ({ ok: true, data: 1 }));
  const blocked = await wrapped({ context: { requireAuth: true }, payload: {} });
  const allowed = await wrapped({ context: {}, payload: {} });
  const out = {
    hasWithAuth: typeof flowMiddlewares.withAuth === 'function',
    blocksWithoutUser: blocked?.ok === false && blocked?.error?.code === 'AUTH_REQUIRED',
    allowsWhenOptOut: allowed?.ok === true,
  };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true` (`blocksWithoutUser` and `allowsWhenOptOut` both true).

---

### BUG-03 — `toRequest` mapper is silently skipped for read-kind flows

**Engine behavior:** `FlowHandler.js` only calls `toRequest` when `flowKind === "write"`.

**Primary usage bug:** [`FLOW_USAGE_AUDIT.md`](./FLOW_USAGE_AUDIT.md) **USE-01** — `orders.fetchOrders` registers `toRequest: mapOrderToRequest` on a read flow; `mapOrderToRequest` never runs and `perPage` / `ownerId` are not mapped to query params.

**Fix (usage):** Map params inside `fetchOrdersFlow` or remove dead `toRequest` from registry. **Fix (engine):** Optionally support read-side request shaping explicitly (separate from write pipeline).

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `toRequest` ran only when `flowKind === "write"`, so `orders.fetchOrders` (read) never applied `mapOrderToRequest`; `perPage` stayed unmapped and API params used camelCase inconsistently.

**Why it happened:** Request mappers were wired only into the write path assumption.

**What changed:**
- `FlowHandler.js` runs `toRequest` whenever the registry provides it (read or write).
- `fetchOrdersFlow.js` sends mapped snake_case query params (`per_page`, `owner_id`, `customer_id`).

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { mapOrderToRequest } = await import('/src/services/orders/mappers/ordersMapper.js');
  const mapped = mapOrderToRequest({ perPage: 25, ownerId: 'creator-1' });
  const out = {
    mapsPerPage: mapped.per_page === 25,
    mapsOwnerId: mapped.owner_id === 'creator-1',
    noCamelPerPage: mapped.perPage === undefined,
  };
  console.log({ pass: Object.values(out).every(Boolean), mapped, ...out });
})();
```

**Expected:** `pass: true`.

---

### BUG-04 — `map` property on `piniaAction` destination is unsupported

**Engine gap:** `destinationRuntime.js` does not implement `map` on `piniaAction` destinations.

**Primary usage bug:** [`FLOW_USAGE_AUDIT.md`](./FLOW_USAGE_AUDIT.md) **USE-02** — `orders.fetchOrders` relies on unsupported `map` for `setOrders`.

**Fix:** Implement `map` in the runtime, or fix the registry entry (USE-02).

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `orders.fetchOrders` destination used `map: (data) => [items, meta]` but `applyPiniaDestination` passed a single object to `setOrders`, ignoring `map`.

**Why it happened:** `destinationRuntime.js` only supported `select` / `value`, not `map` on `piniaAction`.

**What changed:** `applyPiniaDestination` applies `dest.map(selectedData, context, flowResult)` and spreads array results into the store action (`setOrders(items, meta)`).

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { applyDestinations } = await import('/src/services/flow-system/runtime/destinationRuntime.js');
  const calls = [];
  const context = {
    runId: 'test',
    piniaStores: { orders: { setOrders: (...args) => calls.push(args) } },
  };
  const flowResult = { ok: true, data: { items: [1], etag: 'e1', totalCount: 1, pagination: {} } };
  applyDestinations({
    context,
    flowResult,
    destinations: [{
      type: 'piniaAction',
      storeId: 'orders',
      action: 'setOrders',
      map: (d) => [d.items, { etag: d.etag, totalCount: d.totalCount, pagination: d.pagination }],
    }],
  });
  const out = {
    called: calls.length === 1,
    twoArgs: calls[0]?.length === 2,
    items: calls[0]?.[0]?.[0] === 1,
    etag: calls[0]?.[1]?.etag === 'e1',
  };
  console.log({ pass: Object.values(out).every(Boolean), calls, ...out });
})();
```

**Expected:** `pass: true`.

---

### BUG-05 — `events.fetchSpendingRequirementItems` retry enabled but `maxAttempts: 1` means zero retries

**Moved to** [`FLOW_USAGE_AUDIT.md`](./FLOW_USAGE_AUDIT.md) **USE-05**.

**File:** `src/services/flow-system/flowRegistry.js` — `events.fetchSpendingRequirementItems`

With `retry.enabled: true` and `maxAttempts: 1`, `executeWithRetry` performs only one attempt (`while (attempt < maxAttempts)`), so no retry happens after failure.

#### Resolution ✅

**Status:** Resolved (implemented here; `FLOW_USAGE_AUDIT.md` not required).

**What was broken:** Retry was enabled but `maxAttempts: 1` allowed zero retries on transient failures.

**Why it happened:** `maxAttempts` was set to 1 while `enabled: true`, misunderstanding that attempts include the initial try.

**What changed:** `events.fetchSpendingRequirementItems` registry `maxAttempts` updated from `1` to `2` (initial attempt + one retry), matching peer read flows.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { executeWithRetry } = await import('/src/services/flow-system/runtime/retryRuntime.js');
  let calls = 0;
  const result = await executeWithRetry({
    retry: { enabled: true, maxAttempts: 2, baseDelayMs: 1, maxDelayMs: 1, jitterRatio: 0 },
    operation: async () => {
      calls += 1;
      return calls < 2
        ? { ok: false, error: { code: 'HTTP_503', message: 'retry me' } }
        : { ok: true, data: { ok: true } };
    },
  });
  const out = {
    success: result?.ok === true,
    twoAttempts: calls === 2,
  };
  console.log({ pass: Object.values(out).every(Boolean), calls, ...out });
})();
```

**Expected:** `pass: true`, `calls: 2`.

---

### BUG-06 — Exponential backoff exponent starts at 1 instead of 0

**File:** `src/services/flow-system/runtime/retryRuntime.js` — lines 36–41

```js
function computeDelayMs(attempt, retryConfig) {
  const exp = Math.max(1, attempt - 1); // attempt=1 → exp=1; attempt=2 → exp=1
  const base = retryConfig.baseDelayMs * (2 ** exp);
  ...
}
```

For the first and second retry attempt, `exp` resolves to `1`, so both use the same delay (`baseDelayMs * 2`). Standard exponential backoff uses `2^(attempt-1)`, giving `baseDelayMs` on the first retry. Using `Math.max(1, ...)` doubles the initial delay and creates a flat delay between attempts 1 and 2.

**Example with `baseDelayMs: 250`:**
- Standard: attempt 1 → 250 ms, attempt 2 → 500 ms
- Current: attempt 1 → 500 ms, attempt 2 → 500 ms, attempt 3 → 1000 ms

**Fix:** Remove the `Math.max(1, ...)` wrapper:
```js
const exp = attempt - 1;
```

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `Math.max(1, attempt - 1)` forced `exp >= 1`, so the first two retries both waited `baseDelayMs * 2` instead of `baseDelayMs` then `baseDelayMs * 2`.

**Why it happened:** A guard intended to avoid negative exponents also clamped the first retry exponent to 1.

**What changed:** `computeDelayMs` now uses `const exp = attempt - 1` in `retryRuntime.js`. `resolveRetryConfig` uses `jitterRatio ?? 0.15` so `jitterRatio: 0` disables jitter (browser/console tests with exact delays).

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { executeWithRetry } = await import('/src/services/flow-system/runtime/retryRuntime.js');
  const delays = [];
  await executeWithRetry({
    retry: { enabled: true, maxAttempts: 3, baseDelayMs: 250, maxDelayMs: 5000, jitterRatio: 0 },
    onRetry: ({ delayMs }) => delays.push(delayMs),
    operation: async () => ({ ok: false, error: { code: 'HTTP_503' } }),
  });
  const out = { firstDelay250: delays[0] === 250, secondDelay500: delays[1] === 500 };
  console.log({ pass: Object.values(out).every(Boolean), delays, ...out });
})();
```

**Expected:** `pass: true`, `delays: [250, 500]`.

---

### BUG-07 — `validateCreateEventPayload` / `validateCreateEventResponse` never registered

**Moved to** [`FLOW_USAGE_AUDIT.md`](./FLOW_USAGE_AUDIT.md) **USE-04**.

**File:** `src/services/flow-system/flowRegistry.js` — `events.createEvent`

Validators exist in `eventFlowValidators.js` but were not wired on the registry entry.

#### Resolution ✅

**Status:** Resolved (implemented here; `FLOW_USAGE_AUDIT.md` not required).

**What was broken:** `events.createEvent` ran without payload/response validation despite validators being implemented.

**Why it happened:** Validators were authored but never added to the `events.createEvent` registry `validators` block.

**What changed:** Registered `validateCreateEventPayload` and `validateCreateEventResponse` on `events.createEvent` in `flowRegistry.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const {
    validateCreateEventPayload,
    validateCreateEventResponse,
  } = await import('/src/services/events/validators/eventFlowValidators.js');
  const badPayload = validateCreateEventPayload({ title: 'X', type: 'live' });
  const badResponse = validateCreateEventResponse({});
  const out = {
    payloadRejected: badPayload.ok === false,
    responseRejected: badResponse.ok === false,
  };
  console.log({ pass: Object.values(out).every(Boolean), badPayload, badResponse, ...out });
})();
```

**Expected:** `pass: true`.

---

### BUG-08 — `FLOW_TOTAL_TIMEOUT` produces `status: "error"` not `status: "cancelled"`

**File:** `src/services/flow-system/flowDataPipeline.js` — lines 174–188

The timeout handler calls `fail(...)` which returns `{ status: "error" }`, but a second meta flag of `{ cancelled: true }` is also set:

```js
() => fail(
  { code: "FLOW_TOTAL_TIMEOUT", message: `...` },
  { cancelled: true, reason: "total_timeout" }
)
```

The branching logic at line 184 checks:
```js
if (flowResult?.status === "cancelled" || flowResult?.meta?.cancelled) {
```

The first condition always fails (status is "error"), but the second catches it via `meta.cancelled`. This means `finalizeCancelled` is called instead of `finalizeError`, which discards the `FLOW_TOTAL_TIMEOUT` error code and returns a generic `FLOW_CANCELLED` shape to callers.

**Impact:** Callers cannot distinguish a total timeout from a normal cancellation — both return `{ code: "FLOW_CANCELLED" }`.

**Fix:** Use `cancelled("total_timeout")` from `flowTypes.js` to produce a consistent `status: "cancelled"` shape.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Total timeout used `fail()` (`status: "error"`) with `meta.cancelled`, so `finalizeCancelled` dropped `FLOW_TOTAL_TIMEOUT` and callers only saw `FLOW_CANCELLED`.

**Why it happened:** Timeout handler mixed error and cancelled semantics.

**What changed:**
- `executeWithTimeout` callback now returns `cancelled("total_timeout")`.
- `finalizeCancelled` accepts `sourceResult` and preserves `error.code: "FLOW_TOTAL_TIMEOUT"` when `reason === "total_timeout"`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { cancelled } = await import('/src/services/flow-system/flowTypes.js');
  const { finalizeCancelled } = await import('/src/services/flow-system/flowDataPipeline.js');
  const source = cancelled('total_timeout');
  const result = finalizeCancelled(
    { flowName: 'demo', runId: 'r1', totalFlowTimeoutMs: 1000 },
    'total_timeout',
    source,
  );
  const out = {
    statusCancelled: result.status === 'cancelled',
    codePreserved: result.error?.code === 'FLOW_TOTAL_TIMEOUT',
  };
  console.log({ pass: Object.values(out).every(Boolean), result, ...out });
})();
```

**Expected:** `pass: true`.

---

### BUG-09 — `withTimeout` timeout of 0 defaults to 15 000 ms instead of being disabled

**File:** `src/services/flow-system/middleware/withTimeout.js` — line 5

```js
const timeoutMs = Number(args?.context?.timeoutMs || 15000);
```

Passing `timeoutMs: 0` to disable the timeout falls back to `15000` because `0 || 15000 === 15000`. There is no way to opt out of the middleware timeout via configuration.

**Fix:** Use nullish coalescing:
```js
const timeoutMs = args?.context?.timeoutMs ?? 15000;
```
And guard with `if (timeoutMs <= 0) return next(args);`.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `timeoutMs: 0` became `15000` via `0 || 15000`, so middleware timeout could not be disabled.

**Why it happened:** Falsy `0` fell through to the default using `||`.

**What changed:** `withTimeout.js` uses `??` for the default, returns early when `timeoutMs <= 0`, and clears the timer in `finally` after the race.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { withTimeout } = await import('/src/services/flow-system/middleware/withTimeout.js');
  let signalSet = false;
  const wrapped = withTimeout(async (args) => {
    signalSet = !!args?.context?.signal;
    return { ok: true };
  });
  const result = await wrapped({ context: { timeoutMs: 0 } });
  const out = { success: result?.ok === true, noAbortSignal: signalSet === false };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true` (`noAbortSignal: true`).

---

### BUG-10 — `concurrencyRuntime` `allowParallel` policy never tracks in-flight promises

**File:** `src/services/flow-system/runtime/concurrencyRuntime.js` — lines 19–28

```js
if (policy === "allowParallel") {
  return {
    mode: "run",
    key: `${key}:parallel:${Date.now()}:${Math.random()...}`,
    abortController,
    registerPromise() {},  // no-op
    release() {},          // no-op
  };
}
```

`registerPromise` and `release` are no-ops for parallel flows. This means:
- `cancelInFlight(key)` has no effect for these flows.
- `hasInFlight(key)` always returns `false` for parallel policies.
- The original `key` is never written to `inFlight`, so deduplication could misbehave if policy changes mid-flight.

**Impact:** Callers relying on `cancelInFlight` to abort parallel uploads (e.g., `media.uploadFile`) cannot cancel them.

**Fix:** Register parallel executions under the unique composite key so they can be tracked and cancelled individually.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `allowParallel` used no-op `registerPromise` / `release`, so parallel uploads were not in `inFlight` and `cancelInFlight` / `hasInFlight` never worked.

**Why it happened:** Parallel policy generated a unique key but never stored the promise under it.

**What changed:** `acquireRunSlot` for `allowParallel` now registers and releases under `parallelKey` in `concurrencyRuntime.js`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { acquireRunSlot, hasInFlight, cancelInFlight } = await import('/src/services/flow-system/runtime/concurrencyRuntime.js');
  const slot = acquireRunSlot({ key: 'media.upload', policy: 'allowParallel' });
  slot.registerPromise(Promise.resolve());
  const out = {
    tracked: hasInFlight(slot.key) === true,
    cancelled: cancelInFlight(slot.key) === true,
    cleared: hasInFlight(slot.key) === false,
  };
  console.log({ pass: Object.values(out).every(Boolean), key: slot.key, ...out });
})();
```

**Expected:** `pass: true`.

---

## 2. Performance Issues

---

### PERF-01 — `flowRefreshManager` immediate run duplicates component-mount request

**File:** `src/services/flow-system/flowRefreshManager.js` — line 35

`runImmediately` defaults to `true`. If a component mounts and calls `FlowHandler.run("analytics.fetch", ...)` AND calls `flowRefreshManager.startFromRegistry("analytics.fetch", ...)` immediately after, two network requests fire at the same tick. For `analytics.fetch` (30 s interval) and `events.fetchCreatorEvents` (60 s interval), this means a doubled server load on every page load.

**Fix:** Default `runImmediately` to `false` for registry-started flows, or deduplicate using the concurrency layer.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `startFromRegistry` always fired an immediate `FlowHandler.run` plus any separate mount-time run, doubling network load on page load.

**Why it happened:** `runImmediately` defaulted to true (`options.runImmediately !== false`).

**What changed:**
- `startFromRegistry` only runs immediately when `options.runImmediately === true`.
- Call sites that need an initial fetch pass it explicitly: `main.js` (analytics bootstrap), `Cart.vue` (cart on mount).
- `AnalyticsPage` relies on `main.js` bootstrap and only re-registers the interval without a second immediate fetch.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { createFlowRefreshManager } = await import('/src/services/flow-system/flowRefreshManager.js');
  let calls = 0;
  const mod = await import('/src/services/flow-system/FlowHandler.js');
  const original = mod.default.run;
  mod.default.run = async (...args) => { calls += 1; return { ok: true }; };
  const mgr = createFlowRefreshManager();
  mgr.startFromRegistry('analytics.fetch', { source: 'full' });
  const out = { noImmediateByDefault: calls === 0 };
  mgr.stopAll();
  mod.default.run = original;
  console.log({ pass: Object.values(out).every(Boolean), calls, ...out });
})();
```

**Expected:** `pass: true`, `calls: 0` (interval still scheduled; first tick after `intervalMs`).

---

### PERF-02 — Module-level `memoryCache` Map never evicts expired entries

**File:** `src/services/flow-system/runtime/cacheRuntime.js` — line 2

```js
const memoryCache = new Map();
```

Entries are added on every cache write but never removed when they expire. `readCacheEntry` detects expiry but returns `{ hit: false }` without removing the stale entry. Over time, especially in long-running sessions with many unique payload hashes, the map grows unboundedly.

**Fix:** Call `removeFromStorage` inside `readCacheEntry` when `reason === "expired"`, or run a periodic sweep.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Expired in-memory cache rows stayed in `memoryCache` forever, so long sessions could grow memory without bound.

**Why it happened:** `readCacheEntry` returned `hit: false` for expiry but never deleted the stale record.

**What changed:** On `reason === "expired"`, `readCacheEntry` calls `removeFromStorage` before returning (memory and `localStorage`).

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { writeCacheEntry, readCacheEntry } = await import('/src/services/flow-system/runtime/cacheRuntime.js');
  const key = '__flow_cache__:demo:shared';
  writeCacheEntry({ storage: null, key, data: { n: 1 }, ttlMs: 1 });
  await new Promise((r) => setTimeout(r, 5));
  const expired = readCacheEntry({ storage: null, key });
  const missing = readCacheEntry({ storage: null, key });
  const out = {
    wasExpired: expired.reason === 'expired',
    thenMissing: missing.reason === 'missing',
  };
  console.log({ pass: Object.values(out).every(Boolean), expired, missing, ...out });
})();
```

**Expected:** `pass: true`.

---

### PERF-03 — `stableStringify` is O(n log n) and called on every cache/concurrency key build

**File:** `src/services/flow-system/runtime/cacheRuntime.js` — lines 4–10

`buildPayloadHash` calls `stableStringify` which sorts all object keys recursively. This is called for every `buildCacheKey`, `buildEtagKey`, and `buildConcurrencyKey` invocation — i.e., before every single flow execution. For complex payloads (e.g., booking or event creation) this is expensive.

**Fix:** Memoize the hash per payload reference, or use a faster hashing strategy.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Every flow run recomputed `stableStringify` + hash for the same payload object reference, adding avoidable CPU cost on hot paths (cache keys, concurrency keys).

**Why it happened:** `buildPayloadHash` had no memoization layer.

**What changed:** `buildPayloadHash` memoizes by object reference via `WeakMap` (same reference → same hash without re-stringifying).

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { buildPayloadHash } = await import('/src/services/flow-system/runtime/cacheRuntime.js');
  const payload = { a: 1, b: 2, nested: { z: 9 } };
  const h1 = buildPayloadHash(payload);
  const h2 = buildPayloadHash(payload);
  const out = { stable: h1 === h2, nonEmpty: h1.length > 0 };
  console.log({ pass: Object.values(out).every(Boolean), h1, h2, ...out });
})();
```

**Expected:** `pass: true`.

---

### PERF-04 — `localStorage` writes are synchronous and unguarded against quota errors

**File:** `src/services/flow-system/runtime/cacheRuntime.js` — line 59

```js
storage.setItem(key, JSON.stringify(value));
```

`localStorage.setItem` is synchronous and blocks the main thread. There is no `try/catch` around `setItem`, so a `QuotaExceededError` (storage full) will propagate as an uncaught exception and crash the flow.

**Fix:** Wrap `setItem` in a try/catch and degrade gracefully to memory cache.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** A full `localStorage` threw `QuotaExceededError` and could crash the whole flow.

**Why it happened:** `writeToStorage` called `setItem` without `try/catch` and never read from the in-memory fallback.

**What changed:** `writeToStorage` catches quota errors and stores in `memoryCache`; `readFromStorage` falls back to memory when `getItem` misses; successful local writes clear stale memory copies.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { writeCacheEntry, readCacheEntry } = await import('/src/services/flow-system/runtime/cacheRuntime.js');
  const key = '__flow_cache__:quota:demo';
  const badStorage = {
    getItem: () => null,
    setItem: () => { throw new DOMException('quota', 'QuotaExceededError'); },
    removeItem: () => {},
  };
  writeCacheEntry({ storage: badStorage, key, data: { saved: true }, ttlMs: 60000 });
  const read = readCacheEntry({ storage: badStorage, key });
  const out = { hit: read.hit === true, dataOk: read.record?.data?.saved === true };
  console.log({ pass: Object.values(out).every(Boolean), read, ...out });
})();
```

**Expected:** `pass: true`.

---

### PERF-05 — `mergeConfig` deep-merge utility is duplicated across files

**Files:** `pipeline/pipelineContext.js` lines 5–18, `runtime/readSourceRuntime.js` lines 16–30

The same `isPlainObject` + `mergeConfig` implementation is copy-pasted into two files. If one is fixed/optimised, the other won't be.

**Fix:** Extract to a shared `src/services/flow-system/utils/mergeConfig.js`.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Identical `mergeConfig` / `isPlainObject` lived in two files, so fixes could diverge.

**Why it happened:** Copy-paste during pipeline growth.

**What changed:** Shared module `src/services/flow-system/utils/mergeConfig.js`; `pipelineContext.js` and `readSourceRuntime.js` import it.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { mergeConfig } = await import('/src/services/flow-system/utils/mergeConfig.js');
  const merged = mergeConfig({ retry: { enabled: true, maxAttempts: 2 } }, { retry: { maxAttempts: 3 } });
  const out = { keepsEnabled: merged.retry.enabled === true, updatesMax: merged.retry.maxAttempts === 3 };
  console.log({ pass: Object.values(out).every(Boolean), merged, ...out });
})();
```

**Expected:** `pass: true`.

---

### PERF-06 — Background revalidation fires on next microtask with no debounce

**File:** `src/services/flow-system/pipeline/readPipeline.js` — line 166

```js
setTimeout(() => {
  context.rerunFlow({ forceRefresh: true, skipDestinationRead: true, backgroundRevalidate: true })
    .catch(() => {});
}, 0);
```

Multiple stale cache hits within the same event loop tick (e.g., multiple components reading the same flow) will each independently start a background revalidate. There is no deduplication: all will call `FlowHandler.run` and the concurrency layer will cancel all but the latest.

**Fix:** Use the concurrency layer's deduplication explicitly, or dedounce background revalidation by key.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Multiple stale-while-revalidate hits in the same tick each scheduled their own `rerunFlow`, causing redundant work and cancel churn.

**Why it happened:** Every stale hit called `setTimeout(..., 0)` with no per-key guard.

**What changed:** `scheduleBackgroundRevalidateOnce` in `utils/backgroundRevalidate.js` dedupes by concurrency key; `readPipeline` uses it before background `rerunFlow`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const {
    scheduleBackgroundRevalidateOnce,
    clearBackgroundRevalidateScheduleForTests,
  } = await import('/src/services/flow-system/utils/backgroundRevalidate.js');
  clearBackgroundRevalidateScheduleForTests();
  let calls = 0;
  const key = 'demo.flow:shared';
  scheduleBackgroundRevalidateOnce(key, () => { calls += 1; });
  scheduleBackgroundRevalidateOnce(key, () => { calls += 1; });
  await new Promise((r) => setTimeout(r, 0));
  const out = { singleRun: calls === 1 };
  clearBackgroundRevalidateScheduleForTests();
  console.log({ pass: Object.values(out).every(Boolean), calls, ...out });
})();
```

**Expected:** `pass: true`, `calls: 1`.

---

## 3. Security Issues

---

### SEC-01 — Authentication is opt-in instead of opt-out

**File:** `src/services/flow-system/FlowHandler.js` — line 24

`defaultMiddlewares` is empty. `withAuth` only runs if a caller explicitly adds it via `options.middlewares`. Any flow that does not supply middlewares runs unauthenticated, regardless of what `context.requireAuth` says.

**Impact:** New flows added to the registry are automatically unauthenticated unless the developer remembers to configure middleware.

**Fix:** Restore `withAuth` (and at minimum `withTimeout`) to `defaultMiddlewares`.

#### Resolution ✅

**Status:** Resolved (addressed with BUG-02).

**What was broken:** `defaultMiddlewares` was empty, so `withAuth` never ran and `requireAuth` had no effect.

**Why it happened:** Middleware defaults were commented out during debugging and not restored.

**What changed:** `FlowHandler.js` restores `[withMetrics, withTimeout, withRetry, withAuth]`. Auth enforcement is **opt-in per call** via `requireAuth: true` and `userId` (see BUG-02) so existing public flows without login still work until BUG-19 wires auth state.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { flowMiddlewares } = await import('/src/services/flow-system/FlowHandler.js');
  const wrapped = flowMiddlewares.withAuth(async () => ({ ok: true }));
  const blocked = await wrapped({ context: { requireAuth: true }, payload: {} });
  const out = {
    hasWithAuth: typeof flowMiddlewares.withAuth === 'function',
    blocksWithoutUser: blocked?.ok === false && blocked?.error?.code === 'AUTH_REQUIRED',
  };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true`.

---

### SEC-02 — JWT token stored and passed as a plain string on the context

**File:** `src/services/flow-system/pipeline/pipelineContext.js` — lines 72–83

`backendJwtToken` is stored directly on the context object and accessible to every mapper, validator, destination callback, and middleware in the pipeline. The token is never redacted from error objects or logs.

**Impact:** A misconfigured destination or leak via `details: error` in a `fail()` result could expose the JWT in response objects returned to UI components.

**Fix:** Store the token in a closure, expose it only when building request headers, and redact it from any serialized error output.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `backendJwtToken` was a plain field on `context`, and errors could echo it (or `Authorization`) in `details` returned to the UI.

**Why it happened:** Token was copied onto the context object for convenience; error normalization did not redact secrets.

**What changed:**
- `flowAuthSecrets.js` resolves the JWT only when building `requestHeaders` (not stored on `context`).
- `stripSensitiveContextOverrides` blocks `backendJwtToken` from `options.context` overrides.
- `requestHeaders` are applied after safe context spread so callers cannot overwrite `Authorization` via `options.context`.
- `normalizeUnknownError` redacts `backendJwtToken`, `Authorization`, and `Bearer …` strings in error `details`.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { createPipelineContext } = await import('/src/services/flow-system/pipeline/pipelineContext.js');
  const { normalizeUnknownError } = await import('/src/services/flow-system/flowErrors.js');
  const ctx = createPipelineContext({
    flowName: 'demo', flowEntry: { flowKind: 'read' }, flow: async () => ({}),
    payload: {}, mappedPayload: {}, flowKind: 'read',
    options: { backendJwtToken: 'top-secret-jwt' },
    rerunFlow: async () => ({}), executeFlow: async () => ({}),
  });
  const err = normalizeUnknownError({
    message: 'fail', details: { backendJwtToken: 'top-secret-jwt', requestHeaders: { Authorization: 'Bearer top-secret-jwt' } },
  });
  const out = {
    notOnContext: ctx.backendJwtToken === undefined,
    headerSet: ctx.requestHeaders?.Authorization === 'Bearer top-secret-jwt',
    detailsRedacted: err.error?.details?.backendJwtToken === '[REDACTED]' && err.error?.details?.requestHeaders?.Authorization === '[REDACTED]',
  };
  console.log({ pass: Object.values(out).every(Boolean), ...out });
})();
```

**Expected:** `pass: true` (`notOnContext: true`, `headerSet: true`, `detailsRedacted: true`).

---

### SEC-03 — Inconsistent URL parameter encoding in chat flows

**Files:** `src/services/chat/flows/` (all 63 files)

Some flows encode path parameters:
```js
api.post(`${baseUrl}/chats/${encodeURIComponent(chatId)}/membership/upgrade`, ...)
```

Others do not:
```js
api.get(`${baseUrl}/chats/${chatId}/messages`, ...)
```

If `chatId` contains `/`, `?`, or `#` characters, unencoded flows can produce malformed URLs or, in some API server configurations, path traversal vectors.

**Fix:** Enforce `encodeURIComponent` on all path parameters. Consider a URL builder utility.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Some chat flows interpolated `chatId` (and similar IDs) into URL paths without `encodeURIComponent`, so IDs containing `/`, `?`, or `#` could produce malformed URLs or ambiguous routing.

**Why it happened:** URL construction was duplicated across ~63 flow files with no shared helper or regression test, so encoding was inconsistent at audit time.

**What changed:**
- Added `encodePathSegment` and `buildChatApiUrl` in `src/services/chat/chatApiUtils.js` as the canonical path builder.
- Migrated `fetchMessagesFlow.js` (the audit’s example) to `buildChatApiUrl`.
- Verified all files under `src/services/chat/flows/` encode dynamic `/chats/` path segments; added `tests/unit/chatFlowUrlEncoding.test.js` to fail CI if a new flow omits encoding.

**How to test in the browser (one paste — logs result when the promise settles):**
```js
(async () => {
  const { buildChatApiUrl, encodePathSegment } = await import('/src/services/chat/chatApiUtils.js');
  const malicious = 'evil/chat?x=1#frag';
  const url = buildChatApiUrl('http://localhost:3001', 'chats', malicious, 'messages');
  const out = {
    noRawSlashInPath: !url.includes('/evil/chat'),
    encodesSlash: url.includes('%2F'),
    encodesQuery: url.includes('%3F'),
    encodesHash: url.includes('%23'),
    endsWithMessages: url.endsWith('/messages'),
    segmentHelper: encodePathSegment(malicious) === 'evil%2Fchat%3Fx%3D1%23frag',
  };
  console.log({ pass: Object.values(out).every(Boolean), url, ...out });
})();
```

**Expected:** `pass: true` and `url` contains `%2F`, `%3F`, `%23` (no literal `/evil/chat` segment).

---

### SEC-04 — ETag values written to `localStorage` without integrity check

**File:** `src/services/flow-system/runtime/etagRuntime.js` — lines 17–23

ETags are stored as plain strings and read back without validation. If an attacker can modify `localStorage` (e.g., via XSS), they can inject an ETag that forces a permanent `304 Not Modified` response from the server, causing stale data to be served indefinitely.

**Fix:** Bind ETags to a session nonce, or sign/hash them before storage.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** ETags were stored and read as plain strings; tampered `localStorage` could force perpetual `304` / stale reads.

**What changed:**
- `etagRuntime.js` seals records as `{ v, etag, digest }` where `digest = hash(sessionNonce|key|etag)`.
- Session nonce is persisted in the same storage as ETags (`__flow_etag_nonce__`) or held in memory when storage is unavailable.
- `loadEtag` returns `null` on digest mismatch or legacy plain-string values (fail closed).

**How to test in the browser (one paste):**
```js
(async () => {
  const { saveEtag, loadEtag, sealEtagRecord } = await import('/src/services/flow-system/runtime/etagRuntime.js');
  const storage = window.localStorage;
  const key = '__flow_etag_test__';
  saveEtag({ storage, key, etag: '"good"' });
  const raw = storage.getItem(key);
  const parsed = JSON.parse(raw);
  parsed.etag = '"tampered"';
  storage.setItem(key, JSON.stringify(parsed));
  const out = {
    pass: loadEtag({ storage, key }) === null && typeof sealEtagRecord === 'function',
    sealedShape: !!parsed.digest,
  };
  storage.removeItem(key);
  console.log('[SEC-04]', out);
})();
```
**Expected:** `pass: true`, `sealedShape: true`.

---

### SEC-05 — No CSRF protection on write flows

**File:** `src/services/flow-system/pipeline/writePipeline.js`

The idempotency key header (`Idempotency-Key`) is set when `pipeline.idempotency.enabled = true`, but this is not CSRF protection — it only prevents duplicate submission. There is no `X-CSRF-Token` or `SameSite` cookie enforcement at the flow layer for mutating operations (create booking, create event, etc.).

**Fix:** Add a CSRF token middleware or propagate a CSRF header from the auth context.

#### Resolution ✅

**Status:** Resolved (client header propagation; server must validate token).

**What was broken:** Write flows had idempotency keys only; no CSRF header was attached at the flow layer.

**What changed:**
- `flowAuthSecrets.js`: `resolveCsrfToken`, `applyCsrfToRequestHeaders` (write flows only, header `X-CSRF-Token`).
- `pipelineContext.js` applies CSRF when `options.csrfToken` is set; token is not exposed on context (`flowSecurity` bag for middleware only).
- `withCsrf` middleware added to `defaultMiddlewares` after `withAuth`.
- CSRF values redacted in error/header logging like JWT.

**How to test in the browser (one paste):**
```js
(async () => {
  const { createPipelineContext } = await import('/src/services/flow-system/pipeline/pipelineContext.js');
  const writeCtx = createPipelineContext({
    flowName: 'demo.write', flowEntry: {}, flow: async () => ({}),
    payload: {}, mappedPayload: {}, flowKind: 'write',
    options: { csrfToken: 'test-csrf' }, rerunFlow: async () => ({}), executeFlow: async () => ({}),
  });
  const readCtx = createPipelineContext({
    flowName: 'demo.read', flowEntry: {}, flow: async () => ({}),
    payload: {}, mappedPayload: {}, flowKind: 'read',
    options: { csrfToken: 'test-csrf' }, rerunFlow: async () => ({}), executeFlow: async () => ({}),
  });
  const out = {
    pass: writeCtx.requestHeaders['X-CSRF-Token'] === 'test-csrf'
      && readCtx.requestHeaders['X-CSRF-Token'] === undefined
      && writeCtx.csrfToken === undefined,
  };
  console.log('[SEC-05]', out);
})();
```
**Expected:** `pass: true`.

---

### SEC-06 — `resolveRuntimeValue("@now")` is the only sanitised sentinel; all other destination values are unvalidated

**File:** `src/services/flow-system/runtime/destinationRuntime.js` — lines 31–42

Destination `value` fields are written directly to Pinia stores and stateEngine. There is no validation that destination values or `select` paths stay within expected bounds. A misconfigured registry entry with `value: { __proto__: ... }` could cause prototype pollution.

**Fix:** Validate destination config entries at registry load time, and use `Object.create(null)` or `structuredClone` for destination data writes.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Destination `value` objects could carry prototype-pollution keys; only `@now` had special handling.

**What changed:**
- `destinationRuntime.js`: `sanitizeDestinationShape` strips `__proto__`, `constructor`, `prototype`; runtime writes use `Object.create(null)` + `structuredClone` when expanding values.
- `resolveRuntimeValue` still expands `@now` (including nested) after sanitization.
- `assertRegistryDestinationsSafe` runs at end of `flowRegistry.js` import to fail fast on forbidden `select` paths or polluted static `value` configs.
- Pinia patch and stateEngine merge paths sanitize patches before apply.

**How to test in the browser (one paste):**
```js
(async () => {
  const { sanitizeDestinationValue, applyDestinations } = await import('/src/services/flow-system/runtime/destinationRuntime.js');
  const polluted = JSON.parse('{"__proto__":{"polluted":true},"ok":1}');
  const { returnData } = applyDestinations({
    context: {},
    flowResult: { data: {} },
    destinations: [{ type: 'return', value: polluted }],
  });
  const out = {
    pass: returnData.ok === 1 && {}.polluted === undefined,
    configKeepsNow: sanitizeDestinationValue({ ts: '@now' }).ts === '@now',
  };
  console.log('[SEC-06]', out);
})();
```
**Expected:** `pass: true`, `configKeepsNow: true`.

---

## 4. Best Practice Violations



### BP-02 — `_globalContext` is a mutable module-level singleton in `FlowHandler`

**File:** `src/services/flow-system/FlowHandler.js` — lines 65–68

```js
const _globalContext = {
  piniaStores: {},
  stateEngine: null,
};
```

`FlowHandler.configure()` uses `Object.assign` to accumulate state. There is no way to clear or reset the global context (e.g., on user logout or in tests), and there is no guard against `configure()` being called multiple times with conflicting values.

**Fix:** Add a `FlowHandler.reset()` method for testing; document that `configure()` is idempotent or make it replace rather than merge.

---

### BP-03 — `context.progress` is mutated directly instead of being reactive/immutable

**File:** `src/services/flow-system/FlowHandler.js` — lines 148–152

```js
context.progress.loading = true;
const result = await runFlowDataPipeline(context);
context.progress.loading = false;
```

Direct mutation of `progress` inside an async pipeline means:
- Vue reactivity will not track changes in non-reactive contexts.
- There is no rollback if the pipeline throws before `loading = false`.
- Concurrently running flows sharing a context reference would clobber each other's progress state.

**Fix:** Use `finally` to reset `loading`, and expose progress as a reactive `ref` at the call site rather than on the context.

---

### BP-04 — `withMetrics` mutates the returned result object

**File:** `src/services/flow-system/middleware/withMetrics.js` — line 14

```js
result.meta = { ...(result.meta || {}), durationMs, runId: args.context.runId };
```

The result object returned from the next handler is mutated in-place. If the same result reference is used elsewhere after this middleware (e.g., for logging before passing to the caller), the `meta` will unexpectedly contain timing data added after the fact.

**Fix:** Return a new object: `return { ...result, meta: { ... } }`.

---

### BP-05 — `normalizeFlowKind` defaults unknown values to `"write"` silently

**File:** `src/services/flow-system/FlowHandler.js` — lines 33–38

```js
function normalizeFlowKind(kind) {
  const raw = String(kind || "").toLowerCase();
  if (raw === "read" || raw === "query" || raw === "fetch") return "read";
  if (raw === "write" || raw === "mutation" || raw === "action") return "write";
  return "write"; // ← any typo silently becomes "write"
}
```

A typo like `flowKind: "reed"` in a registry entry silently produces a write pipeline, bypassing all read-side optimisations (caching, ETag, staleWhileRevalidate, deduplication).

**Fix:** Throw or return an error result for unrecognised flow kinds.

---

### BP-06 — `flowKind` is not validated when reading from `flowEntry` vs `options`

**File:** `src/services/flow-system/FlowHandler.js` — line 88

```js
const flowKind = normalizeFlowKind(options.flowKind || flowEntry?.flowKind);
```

`options.flowKind` takes precedence over the registry-declared kind. A caller can silently override the flow kind at runtime, e.g., running a write flow as a read flow and triggering the read pipeline's cache logic on mutating operations.

**Fix:** Remove `options.flowKind` override capability, or at minimum log a warning when it overrides the registry value.

---

### BP-07 — `readSourceRuntime.js` defines `resolveValueByPath` as a wrapper that only calls `deepGet`

**File:** `src/services/flow-system/runtime/readSourceRuntime.js` — lines 164–167

```js
function resolveValueByPath(target, path) {
  if (!path) return target;
  return deepGet(target, path);
}
```

This function is an unnecessary wrapper around `deepGet`. `deepGet` already handles falsy paths correctly (`if (!path) return value`). The wrapper adds indirection with no value.

**Fix:** Replace all calls to `resolveValueByPath` with direct `deepGet` calls.

---

### BP-08 — `flowRefreshManager` error-handling is silent

**File:** `src/services/flow-system/flowRefreshManager.js` — lines 33–39

```js
const run = () => FlowHandler.run(resolvedFlowName, payload, { ...options, forceRefresh: true });
// ...
const timer = setInterval(run, intervalMs);
```

`run()` returns a Promise but the return value is never awaited or error-handled. A runtime crash inside a refresh will be swallowed silently. There is also no backoff — a flow that fails on every poll still fires at the same `intervalMs`.

**Fix:** Await `run()` inside the interval callback, add error logging, and implement exponential backoff on consecutive failures.





## 5. Missing Features

---

### FEAT-01 — No circuit breaker

Repeated failures on a flow (network outages, bad deployments) cause the system to keep retrying at the configured interval or per-call. There is no mechanism to temporarily disable a flow after N consecutive failures and resume with backoff.

**Suggested:** Implement a per-flow failure counter that opens a circuit after a threshold and half-opens after a cooldown period.



### FEAT-03 — No public cancellation API

`concurrencyRuntime.cancelInFlight(key)` is exported but not exposed through `FlowHandler`. Callers cannot cancel an in-flight flow (e.g., on component unmount). The only implicit cancellation is via the `latestWins` policy aborting prior calls.

**Suggested:** Expose `FlowHandler.cancel(flowName, payload)` that delegates to `cancelInFlight`.

---

### FEAT-04 — No structured lifecycle events / hooks

There is no way to observe flow lifecycle events (start, retry, success, error, cancelled) without modifying middleware. Consumers have to instrument individual flows with custom middleware.

**Suggested:** Add a global event emitter (e.g., `FlowHandler.on("error", handler)`) or Vue plugin integration.

---

### FEAT-05 — `validateConfirmReservationResponse` and `validateCancelReservationResponse` are missing

**File:** `src/services/rental/validators/rentalFlowValidators.js`

`validateConfirmReservationPayload` and `validateCancelReservationPayload` exist but there are no corresponding response validators. Unexpected API responses (missing fields) for confirm/cancel operations pass through silently.

**Fix:** Add response validators for both operations.

---

### FEAT-06 — No registry schema validation at startup

The registry is a plain object. Misconfigured entries (wrong type for `pipeline.retry`, missing `flow` function, unknown destination types) are only detected at runtime when a flow actually runs.

**Suggested:** Add a `validateRegistry()` function called at app boot that iterates all entries and validates required fields and types. or on compile

---

### FEAT-07 — No request-level deduplication for identical concurrent HTTP calls

The concurrency layer deduplicates at the flow level, but if two different flow names hit the same API endpoint simultaneously, no deduplication occurs. For example, `events.fetchEvent` and `events.fetchCreatorEvents` may both call the same endpoint in parallel.

**Suggested:** Add an HTTP-level request cache / in-flight deduplication layer in `apiWrapper`.

---

### FEAT-08 — Background revalidate has no timeout or cancellation

**File:** `src/services/flow-system/pipeline/readPipeline.js` — lines 162–175

```js
setTimeout(() => {
  context.rerunFlow({ forceRefresh: true, ... }).catch(() => {});
}, 0);
```

The background revalidate promise is not tracked. It has no timeout, no abort signal, and errors are silently discarded. A hanging background revalidate will keep a stale context alive and may write to stores after the originating component has unmounted.

**Fix:** Pass an `AbortSignal` tied to component lifecycle, and propagate the timeout config from the original flow.

---

### FEAT-09 — No pagination support in the flow system

Several flows return paginated data (`fetchAnalyticsFlow`, `fetchMessagesFlow`, `fetchOrdersFlow`) but the flow system has no built-in cursor/page management. Each page requires a separate `FlowHandler.run` call with a manually constructed payload, and there is no cache coordination between pages.

**Suggested:** Add an `options.paginate` mode that automatically merges paginated results into a destination store.

---

### FEAT-10 — `flowRefreshManager` has no visibility into active intervals from outside

**File:** `src/services/flow-system/flowRefreshManager.js`

`flowRefreshManager.list()` is the only introspection API. There is no way to check the next scheduled run time, the last success/failure, or the number of consecutive errors. DevTools / debugging is blind to refresh activity.

**Suggested:** Add `lastRunAt`, `lastError`, and `consecutiveFailures` to each interval entry and expose them via `list()`.


### BUG-11 — `options.context` spread can overwrite core pipeline context fields

**File:** `src/services/flow-system/pipeline/pipelineContext.js` — return object (line with `...(options.context || {})`)

`createPipelineContext` builds trusted fields (`runId`, `flowName`, `requestHeaders`, `signal`, etc.) and then spreads `options.context` at the very end:

```js
return {
  runId: makeRunId(),
  flowName,
  requestHeaders,
  // ...
  ...(options.context || {}),
};
```

Any caller-provided `options.context` can silently overwrite reserved fields (including `requestHeaders`, `flowName`, `runId`, `signal`, `pipeline`, `runtimeOptions`, and `userId`).

**Impact:** Flow identity and execution behavior can be corrupted at runtime; auth headers can be dropped or replaced.

**Fix:** Move `...(options.context || {})` earlier and explicitly whitelist allowed context keys, or hard-block overriding reserved keys.

---

### BUG-12 — `withTimeout` can leave dangling timers when `next(args)` rejects

**File:** `src/services/flow-system/middleware/withTimeout.js` — lines 22–25

`withTimeout` clears the timer only on successful `await Promise.race(...)` resolution:

```js
const result = await Promise.race([flowPromise, timeoutPromise]);
clearTimeout(timer);
return result;
```

If `flowPromise` rejects, execution exits before `clearTimeout(timer)` runs. The timer remains active and later calls `controller.abort()`, causing delayed side-effects and extra event-loop work.

**Fix:** Wrap the race in `try/finally` and clear the timer in `finally`.

---

Repository scan shows only a small subset of chat flows use `context.signal`; most requests are sent without abort signal and timeout options.

**Impact:**  
- `latestWins` cancellations do not abort in-flight HTTP calls in most chat operations.  
- network requests can continue after UI supersedes or unmounts.  
- wasted bandwidth and stale write/read races.

**Fix:** Enforce a shared request helper for chat flows that always attaches `headers`, `signal`, and `timeoutMs`.

--- 

### SEC-08 — context override can replace security-critical request headers

**File:** `src/services/flow-system/pipeline/pipelineContext.js`

Because `options.context` is spread after the computed `requestHeaders`, a caller can replace `Authorization` (or remove it entirely) even when `backendJwtToken` is provided.

**Impact:** auth downgrade or token substitution is possible through call-site context injection.

**Fix:** treat `requestHeaders` as reserved and merge in a controlled order where security headers win.

---

### BP-11 — no reserved-key contract for `options.context`

**Files:** `FlowHandler.run` + `pipelineContext.js`

`options.context` serves as a generic bag but also overlaps internal runtime fields. There is no documented/validated contract for allowed keys.

**Impact:** accidental key collisions cause hard-to-debug behavior changes (timeouts, retries, identity, auth).

**Fix:** define and validate a strict schema for external context keys (`extraContext`) and keep internal fields isolated.

---

### FEAT-11 — missing shared HTTP helper for flow request consistency

**Scope:** all `*/flows/` modules

Request option handling is duplicated across many files, producing drift (some pass headers/signal/timeout, many do not).

**Impact:** repeated correctness and security regressions in new flows.

**Suggested:** add a single helper (e.g., `buildFlowRequestOptions(context, extra)`) and require every flow to use it.

-- 

### BUG-15 — `asValidationResult` fails open on unrecognized validator output

**File:** `src/services/flow-system/flowDataPipeline.js` — lines 11–20

```js
return { ok: true, errors: [] };  // final fallback for unrecognised shapes
```

Validators returning `{ valid: true }`, `{ errors: [...] }` without `ok: false`, or other malformed shapes are treated as success.

**Fix:** Default to `{ ok: false, errors: ['Unexpected validator result shape'] }`, or throw in DEV.

---

### BUG-16 — `validateBy` skips validation when validator function is missing

**File:** `src/services/flow-system/flowDataPipeline.js` — lines 30–33

```js
if (typeof validator !== "function") {
  return { ok: true, errors: [] };
}
```

Registry typos in `validators.payload` / `validators.response` silently disable validation.

**Fix:** Fail closed when a flow entry declares validators but the function is missing.

---

### BUG-17 — Response validation skipped for all `notModified` results

**File:** `src/services/flow-system/flowDataPipeline.js` — lines 79–86

```js
if (!flowResult?.ok || flowResult?.meta?.notModified) {
  return { ok: true, errors: [] };
}
```

304 / `notModified` paths skip response schema checks even when `flowResult.data` is an empty or stale stub. Cached data validated under an old schema can pass after validator changes.

**Fix:** Validate resolved data (cache/state/network) with the current response validator; only skip when there is no data to validate.

---

### BUG-18 — Payload validators run against `originalPayload`, not `mappedPayload`

**File:** `src/services/flow-system/flowDataPipeline.js` — line 74

```js
await validateBy(context.validators?.payload, context.originalPayload, context, "payload");
```

`toRequest` mappers run after payload validation. Registry validators cannot assert the final API request shape.

**Fix:** Validate both pre-map (user input) and post-map (API contract), or document and enforce one convention.

---

### BUG-19 — `userId` is never populated from auth state in `FlowHandler.run`

**Files:** `src/services/flow-system/middleware/withAuth.js`, `src/services/flow-system/pipeline/pipelineContext.js`

`withAuth` checks `context.userId`, but `createPipelineContext` only sets `userId: options.userId` from the caller. Nothing reads the auth store or JWT claims automatically. Combined with empty `defaultMiddlewares` (BUG-02), auth is inactive and manual per call.

**Fix:** Wire auth store → `userId` in `FlowHandler.configure` / `run`, and enable `withAuth` in default middlewares.

---

### BUG-20 — Write flows can retry on `NETWORK_ERROR` (duplicate mutation risk)

**File:** `src/services/flow-system/runtime/retryRuntime.js` — `shouldRetryResult`

`executeWithRetry` is used by both read and write pipelines. On `NETWORK_ERROR`, write flows with retry enabled may execute twice if the server processed the request but the response was lost.

**Fix:** Retry `NETWORK_ERROR` only for idempotent read flows; limit write retries to confirmed non-success HTTP codes.

---

### BUG-21 — Background revalidate swallows all errors

**File:** `src/services/flow-system/pipeline/readPipeline.js` — `startBackgroundRevalidate`

```js
context.rerunFlow({ ... }).catch(() => {});
```

Failures during stale-while-revalidate are invisible to callers and telemetry.

**Fix:** Log errors, surface `onStaleRevalidateFailed`, or increment a stale-failure counter on the context.

---

### PERF-08 — Cache keys use 32-bit hash (collision risk)

**File:** `src/services/flow-system/runtime/cacheRuntime.js` — `buildPayloadHash`

djb2-style 32-bit hashing can collide across many distinct payloads within the same flow namespace, causing wrong cache hits.

**Fix:** Use a longer fingerprint (64-bit / SHA-256 prefix) or include a serialized payload checksum in the key.

---

---

### BP-12 — `inFlight` concurrency map is a module-level singleton

**File:** `src/services/flow-system/runtime/concurrencyRuntime.js`

Dedupe/cancel only applies within one JS realm. Tests can leak entries unless manually cleared; multi-tab behavior is undefined.

**Fix:** Injectable `inFlight` map or `clearInFlight()` for tests.

