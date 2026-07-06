# Analytics DOM + Chart Test Runner

Browser-injected test suite for the analytics page. Validates visible DOM and amCharts runtime data against **internally computed expectations** (domain-partitioned ledger), then cross-checks `/api/charts` for DB drift.

**API:** Dev proxy targets `http://15.235.59.191` (Node API — see `server-access-guide.pdf`). Do not use the Vercel handler for test runs.

> **Adding a new metric or chart?** See [METRIC_CONTRACT.md](./METRIC_CONTRACT.md) — the canonical guide.  
> Note: am5 `dataContext` scraping is **deprecated**. All new assertions must use `data-analytics-*` attributes.

## Test creator

Use **`99999`** — not `566` (shared manual QA data).

```text
https://admin.uy4sdjn4f7.com/?creator_id=99999
http://localhost:5173/iframe/analytics?creator=99999
```

## Config

| File | Purpose |
|------|---------|
| `config/analyticsMetricRegistry.js` | **NEW** — single source of truth for all metric keys + bindings |
| `config/chartContractSchema.js` | **NEW** — required attributes + metrics per chart container |
| `config/breakdownKeyToMetric.js` | **NEW** — chart field → metric key mapping |
| `config/testCreator.js` | Creator id, fan ids, API paths |
| `config/eventExpectations.js` | Per-master-event triggers and expected views |
| `config/masterEventChildMap.js` | Master→child metric routing (mirror Node server) |
| `config/expectationState.js` | Internal ledger — source of truth for expected values |
| `config/buildExpectationsFromState.js` | Row builder from internal state |
| `config/mixedBatchScenarios.js` | Multi-event scenarios before one refresh |
| `GAP_ANALYSIS.md` | Doc vs live gaps (2026-06-30) |

## Scanners

| File | Scan type | Status |
|------|-----------|--------|
| `scanners/domScanners.js` → `scanMetricSelector` | `metricSelector` | **Active** |
| `scanners/chartContractScanner.js` | `chartContract` | **Active** |
| `scanners/domScanners.js` → `scanCardValueByHeading` | `cardValueByHeading` | Deprecated |
| `scanners/domScanners.js` → `scanCardMetricByLabel` | `cardMetricByLabel` | Deprecated |
| `scanners/domScanners.js` → `scanPopupStatByHeading` | `popupStatByHeading` | Deprecated |

## Build spec

See `/Users/pro2019/Downloads/dom_chart_test_scanner_runner_build_instructions.md`

## Status

**Phase 0–7 v1 implemented** — injects panel in dev on analytics routes. First case: `newSubscription` on creator `99999`.

### Usage

1. `nvm use 20 && npm run dev`
2. Open `http://localhost:5173/iframe/analytics?creator=99999`
3. Click **Start Test Runner** in the bottom-right panel
4. Or run in console: `runAnalyticsTestCase('newSubscription')`
5. **Batch:** **Batch: all cases (sequential)** — one clear + one event per case (`runAnalyticsTestBatch()`).
6. **Mixed batch:** e.g. **Mixed: New Subscription + Merch** — one clear, multiple events, one refresh (`runAnalyticsTestMixedBatch()`).

### Modules

| Path | Role |
|------|------|
| `index.js` | Dev bootstrap |
| `runAnalyticsTestCase.js` | Orchestrator |
| `api/` | HTTP runner + in-memory log |
| `refresh/` | Refresh button + waits |
| `scanners/` | DOM scanners + execute |
| `charts/` | am5 registry collector |
| `compare/` | PASS/FAIL engine |
| `config/` | Creator id, event expectations, row expander |
| `validation/` | Lightweight JSON contract check |
| `ui/panel.js` | Injected test panel |
