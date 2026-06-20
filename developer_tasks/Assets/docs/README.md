# Asset system documentation

**Last updated:** 2026-06-10  
**Code location:** `new-vue-app-main/src/systems/assets/`  
**Config location:** `new-vue-app-main/src/config/assetMap*.json`

This folder is the single entry point for asset-system documentation. Older docs may reference `src/utils/assets/` — that path is **retired**; use `src/systems/assets/` instead.

---

## Documents

| Document | Audience | Purpose |
|----------|----------|---------|
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Humans | How the asset system works, imports, config, preloading, troubleshooting |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Humans | Copy-paste snippets (`getAssetUrl`, preload, validation) |
| [AI_GUIDE.md](./AI_GUIDE.md) | AI / agents | Rules, boundaries, audit status, safe edit patterns |
| [ASSET_PLAN.md](./ASSET_PLAN.md) | Both | Master plan: migration, audits, naming batches, priorities |

---

## Audits & indexes (parent folder)

| Item | Link |
|------|------|
| Hub | [../README.md](../README.md) |
| Code index | [../asset-code-index.md](../asset-code-index.md) |
| Structure audit | [../folder-structure-audit-assets.md](../folder-structure-audit-assets.md) |
| Naming batches | [../asset-naming-audit-batch-1.md](../asset-naming-audit-batch-1.md) · [batch 2](../asset-naming-audit-batch-2.md) |

---

## Related docs (elsewhere)

| Path | Role |
|------|------|
| [assetMap.README.md](../../../new-vue-app-main/src/config/assetMap.README.md) | Operator guide for `assetMap.json` |
| [systems/assets/README.md](../../../new-vue-app-main/src/systems/assets/README.md) | Per-module reference next to code |
| [legacy/](./legacy/) | Historical audits and old quick reference |
| [notes.md](../../../notes.md) | Target folder structure |
| [Sections/docs/](../../Sections/docs/README.md) | Section preload (runs before assets) |

---

## Quick orientation

```
src/systems/assets/     → flag resolution, preloading, scanning, policy, handler
src/config/             → assetMap.json, assetMap.<section>.json
src/stores/             → usePreloadStore.js
src/composables/        → useAssetUrl.js
src/assets/             → static CSS/images only (not JS asset logic)
```

**Bootstrap:** `app/main.js` calls `initAssetLibrary()` and `validateAssetMap()`.

**Do not** add new asset logic under `src/utils/` or `src/utils/assets/`.
