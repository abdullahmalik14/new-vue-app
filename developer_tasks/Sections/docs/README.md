# Section system documentation

**Last updated:** 2026-06-10  
**Code location:** `new-vue-app-main/src/systems/sections/`  
**Route config:** `section` and `preLoadSections` in `src/router/routeConfig.json`

This folder is the single entry point for section-system documentation. Older docs may reference `src/utils/section/` — that path is **retired**; use `src/systems/sections/` instead.

---

## Documents

| Document | Audience | Purpose |
|----------|----------|---------|
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Humans | How sections work, flows, checklist, troubleshooting |
| [AI_GUIDE.md](./AI_GUIDE.md) | AI / agents | Rules, boundaries, imports, safe edit patterns |
| [SECTION_PLAN.md](./SECTION_PLAN.md) | Both | Master plan: migration, audits, naming, priorities |

---

## Audits & indexes (parent folder)

| Item | Link |
|------|------|
| Hub | [../README.md](../README.md) |
| Code index | [../section-code-index.md](../section-code-index.md) |
| Structure audit | [../folder-structure-audit-systems-sections.md](../folder-structure-audit-systems-sections.md) |
| Code audit | [../sections-code-audit.md](../sections-code-audit.md) |
| Loose code scan | [../loose-section-code-scan.md](../loose-section-code-scan.md) |
| Naming audit | [../sections-naming-audit.md](../sections-naming-audit.md) |

---

## Related docs (elsewhere)

| Path | Role |
|------|------|
| [SECTION_LOADING_AND_PRELOADING_GUIDE.md](../../../new-vue-app-main/docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md) | Legacy flow guide — ⚠️ some paths outdated |
| [Developer Tasks/Assets/docs/](../../Assets/docs/README.md) | Asset system docs |
| [RoutingExplained.md](../../Route/RoutingExplained.md) | Routes declare sections |

---

## Quick orientation

```
src/systems/sections/   → resolver, preloader, CSS loader, orchestrator
src/stores/             → usePreloadStore.js (section preload state)
src/systems/build/      → manifestLoader (→ sectionManifestHelpers planned)
src/app/main.js         → startup section preload
src/router/index.js     → afterEach preload, component load
```

**Do not** add new section logic under `src/utils/section/`.
