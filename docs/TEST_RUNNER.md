# Test Runner Guide

This repo has **two complementary test runners**:

- **Vitest (CLI)**: fast unit/integration-style tests under `tests/` (run in Node with a browser-like DOM).
- **Analytics Test Runner (in-app, dev-only)**: a browser-injected runner for the analytics page that validates **DOM + chart contract + API payloads** against internally computed expectations.

If you only want “does the code compile + unit tests pass?”, run **Vitest**.  
If you’re validating the analytics pipeline end-to-end against the real Node API target, use the **Analytics Test Runner**.

---

## Vitest (unit tests)

### What it is

- **Command**: `npm run test:unit`
- **Runner**: `vitest`
- **Config**: `vite.config.js` → `test` block

Current Vitest config (see `vite.config.js`):

- **environment**: `jsdom`
- **globals**: `true`
- **defines**: injects `__ASSET_MAP_SHA256__` and `import.meta.env.VITE_ASSET_MAP_SHA256` for tests

### Run tests

Run all unit tests:

```bash
npm run test:unit
```

Run in watch mode (useful locally):

```bash
npm run test:unit -- --watch
```

Run a specific file:

```bash
npm run test:unit -- tests/unit/routeEnvAccess.test.js
```

Run tests matching a name pattern:

```bash
npm run test:unit -- -t "route env"
```

Run a specific folder:

```bash
npm run test:unit -- tests/unit
```

### Common flags you’ll likely want

- **Fail fast**:

```bash
npm run test:unit -- --bail=1
```

- **Run serially** (helpful for stateful/global tests):

```bash
npm run test:unit -- --sequence.concurrent=false
```

- **Verbose reporter**:

```bash
npm run test:unit -- --reporter=verbose
```

### Test file conventions in this repo

Most tests live here:

- `tests/unit/*.test.js`
- Some “handler”-style tests appear under `tests/handler/`

Vitest will pick up standard patterns like `*.test.js`. If you add tests in new folders, prefer matching that convention.

### DOM + Vue component testing

This repo includes `@vue/test-utils`, and Vitest runs with `jsdom`, so tests can mount Vue components and interact with the DOM.

If you introduce a component test:

- Keep it deterministic (no real network).
- Prefer mocking time (`vi.useFakeTimers()`) and globals when needed.

### Debugging Vitest

Pragmatic options:

- **Debug a single test file** (reduce noise):

```bash
npm run test:unit -- tests/unit/<file>.test.js -- --runInBand
```

- **Use `debugger`** statements and run node with inspector:

```bash
node --inspect-brk ./node_modules/vitest/vitest.mjs run tests/unit/<file>.test.js
```

Then attach your debugger (Chrome DevTools / VS Code).

### Coverage (optional)

Coverage isn’t wired in as an npm script right now. Vitest supports coverage, but it typically requires installing a coverage provider (for example `@vitest/coverage-v8`).

If/when you add coverage tooling, the common invocation looks like:

```bash
npm run test:unit -- --coverage
```

---

## Analytics Test Runner (dev-only, browser-injected)

### What it is

The analytics runner is a **dev-only** test suite that injects a panel into analytics routes and can:

- Clear the test database for a dedicated creator
- Trigger one or more “master events”
- Refresh analytics
- Validate:
  - **DOM metric values** (via `data-analytics-*` attributes)
  - **chart contract** (required chart container attributes / bindings)
  - **`/api/charts` payload contract** and expected values (drift detection)

Primary documentation lives in:

- `src/analytics-test-runner/README.md`
- `src/analytics-test-runner/METRIC_CONTRACT.md`
- `src/analytics-test-runner/EVENT_USAGE.md`

### How it boots

In development mode, the app imports the runner after mount:

- `src/app/main.js` dynamically imports `@/analytics-test-runner/index.js` when `import.meta.env.DEV` is true.

The runner shows UI only on “analytics-ish” routes:

- `src/analytics-test-runner/index.js` → `isAnalyticsTestRunnerRoute()`

### Network/API requirements (important)

The runner relies on `/api/...` endpoints via the Vite dev proxy:

- `vite.config.js` proxies:
  - `/api/charts` → `http://15.235.59.191`
  - `/api/events` → `http://15.235.59.191`

If those proxies are missing/broken, the runner will fail at “reset DB”, “trigger event”, or “fetch charts”.

### Test creator (fixed)

Use **creator `99999`** (dedicated for test runs).

Common URLs:

- Admin: `https://admin.uy4sdjn4f7.com/?creator_id=99999`
- Local analytics iframe: `http://localhost:5173/iframe/analytics?creator=99999`

### Run it (UI)

1. Start dev server:

```bash
nvm use 20
npm run dev
```

2. Open the analytics page:
   - `http://localhost:5173/iframe/analytics?creator=99999`
3. Click the **Test Runner** button (bottom-right) to open the panel
4. Pick a test case from the dropdown
5. Click **Start Test Runner**

### Run it (console)

The runner exposes helpers on `window` in dev builds:

- Single case:

```js
runAnalyticsTestCase('newSubscription')
```

- Batch (sequential): clears DB + triggers exactly one event per case:

```js
runAnalyticsTestBatch()
```

- Mixed batch scenario: clears DB once, triggers multiple events, then one refresh:

```js
runAnalyticsTestMixedBatch('mixedBatch_subscriptionAndMerch')
```

Notes:

- Batch behavior is implemented in `src/analytics-test-runner/runAnalyticsTestBatch.js`.
- Mixed batch behavior is implemented in `src/analytics-test-runner/runAnalyticsTestMixedBatch.js`.

### What “PASS/FAIL” means

The UI aggregates multiple checks:

- **Refresh verification**: checks the page meaningfully updated after refresh.
- **Contract validation**: chart containers satisfy required attributes/metric bindings.
- **Comparison rows**: expected value vs found DOM (with “known gaps” supported).
- **API contract checks**: validates shape of `/api/charts` payload and cross-checks “found” values.

In the batch view, each case records:

- `comparisonFailed` (non-gap FAIL rows)
- `refreshFailed` (failed refresh checks)
- `knownGaps`
- `errors`

### Add / update analytics runner tests

High-level workflow:

- Add or adjust metric definitions in:
  - `src/analytics-test-runner/config/analyticsMetricRegistry.js`
  - `src/analytics-test-runner/config/chartContractSchema.js`
  - `src/analytics-test-runner/config/breakdownKeyToMetric.js`
- Update event triggers + expectation wiring in:
  - `src/analytics-test-runner/config/eventExpectations.js`
  - `src/analytics-test-runner/config/masterEventChildMap.js`
  - `src/analytics-test-runner/config/expectationState.js`
- Prefer **`data-analytics-*` selectors** (amCharts scraping is deprecated).

### Troubleshooting

- **Panel doesn’t appear**
  - Confirm `npm run dev` (runner is dev-only).
  - Confirm you are on an analytics route (path contains `analytics` or URL query has `creator=`).
  - Confirm `src/app/main.js` still imports `@/analytics-test-runner/index.js` in dev.

- **Reset DB / trigger event fails**
  - Check Vite proxy in `vite.config.js` for `/api/events` and `/api/charts`.
  - Confirm the Node API target (`15.235.59.191`) is reachable from your network.

- **Comparisons fail but look “correct”**
  - Check for “known gap” classification in expected rows.
  - Validate metric keys and period mapping.
  - Confirm DOM has correct `data-analytics-*` attributes (contract validation output helps).

---

## Recommended routine

- **Before a PR**:
  - `npm run test:unit`
- **When touching analytics (metrics/charts/refresh logic)**:
  - Run the Analytics Test Runner:
    - at least one “single event” case
    - and one “mixed batch” scenario if you changed refresh/aggregation logic

