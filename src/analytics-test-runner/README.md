# Analytics DOM + Chart Test Runner

Browser-injected test suite for the analytics page. Validates visible DOM and amCharts runtime data against expectations from [Event Usage](EVENT_USAGE.md) (local copy of the [Google Doc](https://docs.google.com/document/d/11YKEooxjfhCnxhX2W0X7Aks5m4ClfHl-4iMcDCjjgcs/edit?usp=sharing)).

**API:** Dev proxy targets `http://15.235.59.191` (Node API — see `server-access-guide.pdf`). Do not use the Vercel handler for test runs.

## Test creator

Use **`99999`** — not `566` (shared manual QA data).

```text
https://admin.uy4sdjn4f7.com/?creator_id=99999
http://localhost:5173/iframe/analytics?creator=99999
```

## Config

| File | Purpose |
|------|---------|
| `config/testCreator.js` | Creator id, fan ids, API paths |
| `config/eventExpectations.js` | Per-master-event expected views/metrics/periods |
| `GAP_ANALYSIS.md` | Doc vs live gaps (2026-06-30) |

## Build spec

See `/Users/pro2019/Downloads/dom_chart_test_scanner_runner_build_instructions.md`

## Status

**Phase 0–7 v1 implemented** — injects panel in dev on analytics routes. First case: `newSubscription` on creator `99999`.

### Usage

1. `nvm use 20 && npm run dev`
2. Open `http://localhost:5173/iframe/analytics?creator=99999`
3. Click **Start Test Runner** in the bottom-right panel
4. Or run in console: `runAnalyticsTestCase('newSubscription')`
5. **Batch:** select **Batch: all cases (sequential)** — runs every event with a fresh DB clear + one ingest each (`runAnalyticsTestBatch()`). True mixed-event batches (multiple ingests before one refresh) are [Later Expansion #10](dom_chart_test_scanner_runner_build_instructions.md) (`mixedBatch`).

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
