# Assets explained

**Canonical docs:** [docs/README.md](./docs/README.md)  
**Done work log:** [assets-cleanup-changelog.md](./assets-cleanup-changelog.md) (Phases 0–8)

| Audience | Start here |
|----------|------------|
| Developers | [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) |
| Quick snippets | [QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) |
| AI agents | [AI_GUIDE.md](./docs/AI_GUIDE.md) |
| Master plan | [ASSET_PLAN.md](./docs/ASSET_PLAN.md) |

**Hub:** [README.md](./README.md) · **Code:** `src/systems/assets/`

## Module map (post-cleanup)

| Concern | Entry point |
|---------|-------------|
| Flag → URL | `assetLibrary.js` · `config/assetMap.json` |
| Preload execution | `assetPreloader.js` |
| URL / entry policy | `assetPolicy.js` |
| Route prefetch | `routeAssetPrefetch.js` · `composables/useRoutePrefetch.js` |
| Auth DOM scripts | `assetHandler.js` · `authAssetConfig.js` |
| Preload state | `stores/usePreloadStore.js` |

Retired: `src/utils/assets/`, `src/utils/preload.js`, `assetsHandlerNew.js`, `assets/data/settingConfig.js`.
