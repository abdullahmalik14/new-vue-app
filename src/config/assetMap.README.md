# assetMap.json — environment URL strategy

`assetMap.json` maps **flags** (e.g. `dashboard.hamburger`) to URLs per environment. Runtime resolution lives in `assetLibrary.js` (`getAssetUrl`, `loadAssetMapConfig`).

## Environments

| Key | When used | Typical URLs |
|-----|-----------|--------------|
| `development` | `import.meta.env.DEV` or localhost | Mix of `/assets/...` (Vite dev server) and external hosts (e.g. `i.ibb.co`) for icons not yet self-hosted |
| `staging` | `import.meta.env.MODE === 'staging'` or hostname contains `staging` / `stg` | Sparse overrides only; most flags inherit from `production` |
| `production` | `import.meta.env.PROD` (default deploy) | CDN absolute URLs (`https://cdn.example.com/...`) plus shared externals |

## Inheritance (intentional)

1. **Lookup order:** current environment → **`production` fallback** if the flag is missing in dev/staging.
2. **Staging** only overrides a few flags (e.g. `icon.cart`, `logo.main`); everything else comes from `production`.
3. **Development** can use **relative paths** (`/assets/icons/cart-dev.svg`) served by the Vite dev server from `public/` or project roots; production uses **absolute CDN URLs** for the same logical assets where configured.

Relative paths in dev do **not** imply the same path exists in production — production entries must be set explicitly (or inherited from production block).

## Dev vs production serving

- **Development:** `/assets/...` and `/vendor/...` resolve via Vite; external `https://` URLs load from the network (allowlisted in `assertAllowedPreloadUrl.js`).
- **Production:** Bundled map is the default source (`assetMapSource.js`); optional runtime fetch only when `VITE_ASSET_MAP_RUNTIME_OVERRIDE=true` with hash verification.

## Editing

- Source of truth: `src/config/assetMap.json` (mirrored to `public/config/assetMap.json` for runtime override fetches).
- After changes, restart `npm run dev` and run `validateAssetMap()` / unit tests under `tests/unit/assetMap*.test.js`.
