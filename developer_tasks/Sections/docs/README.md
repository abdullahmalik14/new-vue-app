# Section system documentation

**Last updated:** 2026-06-19  
**Code location:** `src/systems/sections/`  
**Route config:** `section` and `preLoadSections` in `src/router/routeConfig.json`  
**Change log:** [sections-cleanup-changelog.md](../sections-cleanup-changelog.md)

This folder is the single entry point for section-system documentation. Older docs may reference `src/utils/section/` — that path is **retired**; use `src/systems/sections/` instead.

---

## Documents

| Document | Audience | Purpose |
|----------|----------|---------|
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Humans | How sections work, flows, checklist, troubleshooting |
| [AI_GUIDE.md](./AI_GUIDE.md) | AI / agents | Rules, boundaries, imports, safe edit patterns |
| [SECTION_PLAN.md](./SECTION_PLAN.md) | Both | Master plan: phases 0–4 complete; test plan next |
| [sections-cleanup-changelog.md](../sections-cleanup-changelog.md) | Both | Done work log (Phases 0–4) |

---

## Audits & indexes (parent folder)

| Item | Link |
|------|------|
| Hub | [../README.md](../README.md) |
| Code index | [../section-code-index.md](../section-code-index.md) — *audit snapshot; some paths pre-Phase 2* |
| Structure audit | [../folder-structure-audit-systems-sections.md](../folder-structure-audit-systems-sections.md) |
| Code audit | [../sections-code-audit.md](../sections-code-audit.md) |
| Loose code scan | [../loose-section-code-scan.md](../loose-section-code-scan.md) |
| Naming audit | [../sections-naming-audit.md](../sections-naming-audit.md) |
| Test plan | [../section-test-plan.md](../section-test-plan.md) |

---

## Related docs (elsewhere)

| Path | Role |
|------|------|
| [docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md](../../../docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md) | Legacy flow guide — **stale banner added; prefer DEVELOPER_GUIDE** |
| [Developer Tasks/Route/RoutingExplained.md](../../Route/RoutingExplained.md) | Routes declare sections |
| [Developer Tasks/Assets/docs/](../../Assets/docs/README.md) | Asset system docs |

---

## Quick orientation

```
src/systems/sections/              → resolver, preloader, CSS, orchestrator, manifest, nav hooks
src/stores/usePreloadStore.js      → section preload state
src/systems/routing/createAppRouter.js  → hook registration (delegates to sections)
src/app/main.js                    → startup section preload
```

**Do not** add new section logic under `src/utils/section/`.  
**Do not** expand `src/systems/sections/README.md` — it is a deprecation pointer only.
