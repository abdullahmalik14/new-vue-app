# Sections naming audit

**Date:** 2026-06-10  
**Reference:** [Expanded Vue App Naming Convention.txt](../../Expanded%20Vue%20App%20Naming%20Convention.txt)  
**Code index:** [section-code-index.md](./section-code-index.md)  
**Scope:** Section system only. Pure routing (`systems/routing/`, `router/`) is **excluded** unless deeply interconnected with sections.

**Rule:** Only items needing a rename are listed. Approved names are omitted.

| Batch | Scope | Items | Report |
|-------|-------|------:|--------|
| 1 | `systems/sections/` | 24 | [batch-1](./sections-naming-audit-batch-1.md) |
| 2 | Deeply interconnected (nav resources, manifest, assets, i18n refresh, store) | 21 | [batch-2](./sections-naming-audit-batch-2.md) |
| **Total** | | **45** | |

## Format

```
type: filename | method | variable
name: <symbol> or <file> :: <symbol>
Status: suggested
suggested: <rename>
```

## Excluded (route-only — see `reports/route-naming-audit.md`)

`routeAliases.js`, `routeGuards.js`, `routeResolver.js`, `hreflangTags.js`, router hooks, prefetch route files, etc.

---

*Section audits live here. Route naming is a separate track.*
