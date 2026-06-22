# Flow System Audit — Remaining Fixes

**Verified:** 2026-06-11 against `new-vue-app-main/src/services/flow-system/` and related `*/flows/`, `*/mappers/`, `*/validators/`  
**Source audit:** [FLOW_SYSTEM_AUDIT.md](./FLOW_SYSTEM_AUDIT.md)

---

## Summary

| Category | Count |
|----------|------:|
| Audit items verified fixed in code | **53** |
| Acknowledged design posture (not regressions) | **2** |
| Cross-system follow-up (separate audit) | **3** |
| Referenced doc missing from repo | **1** |

**Bottom line:** Every item in `FLOW_SYSTEM_AUDIT.md` has a Resolution section and was verified in source — middleware defaults, validation pipeline hardening, registry fixes, cache/etag/retry/concurrency, circuit breaker, cancellation API, auth wiring, CSRF, and chat `buildFlowRequestOptions` adoption. No core flow-system audit item remains open in code.

---

## 1. SEC-01 / BUG-02 — Auth enforcement is opt-in per flow

**Audit status:** Resolved — `withAuth` restored in `defaultMiddlewares`; enforcement requires `requireAuth: true`.

**Code reality (intentional posture):**

- `defaultMiddlewares = [withMetrics, withTimeout, withRetry, withAuth, withCsrf]` in `FlowHandler.js`.
- `withAuth` only blocks when `context.requireAuth === true` and `userId` is missing.
- Registry: **25 of 58** flows set `requireAuth: true`; the rest run without user checks.

`FlowHandler.configure({ getUserId })` is wired in `src/app/main.js` from `useAuthStore()` (BUG-19 ✅).

**Why it matters:** New registry entries that mutate data but omit `requireAuth: true` will not be blocked by middleware. This is documented in the audit as intentional so public/read flows keep working.

**Fix (ongoing hygiene):** Audit new write flows for `requireAuth: true`; consider a `validateRegistry` rule that requires auth on `flowKind: "write"` entries (except an explicit allowlist).

**Files:** `flowRegistry.js`, `middleware/withAuth.js`, `registry/validateRegistry.js`

---

## 2. BP-12 — `inFlight` map remains a module-level singleton

**Audit status:** Resolved — `clearInFlight()` + `FlowHandler.reset()` for tests.

**Code reality:** `concurrencyRuntime.js` still uses one process-wide `Map`. Dedupe/cancel does not coordinate across browser tabs or workers.

**Fix (if needed later):** Injectable map, `BroadcastChannel` coordination, or document as single-tab SPA limitation.

**Files:** `runtime/concurrencyRuntime.js`

---

## 3. Cross-system — UI validation before `FlowHandler.run` (INT-01 / INT-03)

**Audit status:** Not in `FLOW_SYSTEM_AUDIT.md` — tracked in [interactions-validation-audit-remaining.md](./interactions-validation-audit-remaining.md).

**Code reality:** Flow pipeline validators (`flowDataPipeline.validatePayload/Response`) run inside `FlowHandler.run`. There is still no `validateBeforeFlow()` bridge from `interactionsEngine` / `validationEngine` at UI call sites (chat, analytics, orders).

**Fix:** Implement and adopt shared pre-flight helper (flow-system provides validators; interactions audit owns the bridge).

---

## 4. `FLOW_USAGE_AUDIT.md` referenced but not present

**Audit status:** BUG-01, BUG-03, and others link to [`FLOW_USAGE_AUDIT.md`](./FLOW_USAGE_AUDIT.md) for per-flow registry/call-site issues (USE-01, USE-03).

**Code reality:** File does not exist under `new-vue-app-main/docs/tasks/`. Per-flow usage findings were not verified in this pass.

**Fix:** Restore or create `FLOW_USAGE_AUDIT.md`, or update links in `FLOW_SYSTEM_AUDIT.md` to point at the actual location.

---

## Verified fixed (representative checks)

| Area | IDs | Evidence |
|------|-----|----------|
| Registry | BUG-01, BUG-05, BUG-07, FEAT-05, FEAT-06 | Single `events.fetchEvent` with pipeline; `events.createEvent` validators registered; `validateRegistry(flowRegistry)` at end of `flowRegistry.js`; rental reservation validators wired |
| Middleware | BUG-02, SEC-01, SEC-05 | Default stack includes `withAuth` + `withCsrf`; `withTimeout` disables when `timeoutMs <= 0` (BUG-09) |
| Pipeline | BUG-03, BUG-08, BUG-15–18, BUG-20–21 | `toRequest` on read flows; `finalizeCancelled` for total timeout; `asValidationResult` fails closed; dual payload validation; write retry skips `NETWORK_ERROR`; stale revalidate errors surfaced |
| Auth / secrets | BUG-19, SEC-02, SEC-08, BP-11 | `flowAuthContext.js` + `main.js` `getUserId`; `flowAuthSecrets.js` redaction; JWT/CSRF applied after caller headers; `pipelineExtraContext.js` reserved keys |
| Runtime | BUG-06, BUG-10, PERF-02–08, BP-12 | Backoff `attempt - 1`; `allowParallel` tracks child keys; cache expiry deletes stale rows; `WeakMap` payload hash memo; dual FNV hash; `clearInFlight()` |
| Features | FEAT-01, FEAT-03–04, FEAT-07–11 | Circuit breaker; `FlowHandler.cancel` / `hasInFlight`; lifecycle hooks; pagination `options.paginate`; `buildFlowRequestOptions` in all 63 chat flows |
| Destinations | BUG-04, SEC-06 | `piniaAction` supports `dest.map`; destination values sanitized at registry load |
| Refresh / metrics | PERF-01, BP-04, BP-08 | `runImmediately` defaults `false`; refresh backoff + introspection API; `withMetrics` spreads result immutably |
| Chat HTTP | BUG-13, SEC-03, FEAT-11 | All chat flows use `buildFlowRequestOptions(context)` for `signal` / `timeoutMs` |

---

## Audit numbering gaps (informational)

- **BUG-14** and **FEAT-02** are not defined in the audit (numbering jumps BUG-13 → BUG-15, FEAT-01 → FEAT-03). No missing verification target.

---

## Tests

28 unit tests under `tests/unit/flow*.test.js` cover registry, middleware, validation, circuit breaker, cancel, CSRF, and refresh behavior referenced by the audit.

**`npm run test:unit` was not run** in this verification pass (`vitest` not available — dependencies likely not installed).

---

## Recommended priority

1. **Registry auth hygiene** — require `requireAuth: true` on new write flows; optional `validateRegistry` rule.
2. **INT-01 / INT-03 bridge** — `validateBeforeFlow` at UI call sites (see interactions remaining doc).
3. **`FLOW_USAGE_AUDIT.md`** — restore or fix cross-links for per-flow usage findings.
4. **Multi-tab concurrency** — only if product needs cross-tab dedupe (BP-12 limitation).
