# assetMap.json — environment URL strategy

`assetMap.json` maps **flags** (e.g. `dashboard.hamburger`) to URLs per environment. Runtime resolution lives in `assetLibrary.js` (`getAssetUrl`, `loadAssetMapConfig`).

> **Operators:** Edit `src/config/assetMap.json` (and optional `assetMap.<section>.json`). See [Editing](#editing) and run `validateAssetMap()` after changes.

## Environments

| Key | When used | URL style | Required? |
|-----|-----------|-----------|-----------|
| `production` | `import.meta.env.PROD` (deploy builds) | Absolute `https://` CDN URLs, same-origin `/vendor/...`, allowlisted hosts | **Yes — baseline for every flag** |
| `development` | `import.meta.env.DEV` or localhost | Often `/assets/...` (Vite) or temporary external hosts (`i.ibb.co`) | Optional overrides; missing flags inherit **production** |
| `staging` | `MODE === 'staging'` or hostname contains `staging` / `stg` | Usually sparse overrides only | Optional; missing flags inherit **production** |

## Inheritance (intentional)

1. **Lookup order:** current environment → **`production` fallback** if the flag is missing in dev/staging.
2. **Staging** only overrides a few flags (e.g. `icon.cart`, `logo.main`); everything else comes from `production`.
3. **Development** may use **relative paths** (`/assets/icons/cart-dev.svg`) served by the Vite dev server; **production** must define the real CDN URL for the same logical asset (or rely on production-only flags).

Relative paths in dev do **not** imply the same path works in production — set production URLs explicitly.

## Relative vs absolute URLs (B-05)

| Pattern | Example | Use in | Notes |
|---------|---------|--------|-------|
| Same-origin path | `/assets/icons/cart-dev.svg` | `development` | Served from `public/` or Vite; fast local iteration |
| Same-origin vendor | `/vendor/amazon-cognito-identity-6.3.15.min.js` | all envs | Self-hosted scripts |
| CDN absolute | `https://cdn.example.com/icons/cart.svg` | `production` | Preferred for deploy |
| Legacy external image | `https://i.ibb.co/...` | dev/prod until self-hosted | Allowlisted in `assertAllowedPreloadUrl.js` |

**Do not** put non-localhost `http://` in `production` — `validateAssetMap()` fails CI-style checks.

## Operator checklist

1. Add new flags to **`production`** first (required baseline).
2. Override in `development` / `staging` only when that environment needs a different URL.
3. Use **flags** as stable IDs (`dashboard.logo`), not raw URLs, in components and `routeConfig.assetPreload`.
4. Run `npm run sync:asset-map` (or restart dev) so `public/config/` mirrors `src/config/`.
5. Run `validateAssetMap()` in the browser console or unit tests (`tests/unit/assetMap*.test.js`).

## Dev vs production serving

- **Development:** `/assets/...` and `/vendor/...` resolve via Vite; external `https://` URLs load from the network (allowlisted in `assertAllowedPreloadUrl.js`).
- **Production:** Bundled map is the default source (`assetMapSource.js`); optional runtime fetch only when `VITE_ASSET_MAP_RUNTIME_OVERRIDE=true` with hash verification.

## Global vs per-section maps (B-01)

| File | Role |
|------|------|
| `assetMap.json` | Global library (all sections) |
| `assetMap.<section>.json` | Optional overrides for one section (e.g. `assetMap.auth.json`) |

`getAssetUrl(flag, { section: 'auth' })` resolves: section env → section production → global env → global production.

## Editing

- **Source of truth:** `src/config/assetMap*.json` only — do not edit `public/config/` copies by hand.
- **Sync:** Vite copies every `src/config/assetMap*.json` → `public/config/` on `npm run dev` / `npm run build`. Manual: `npm run sync:asset-map`.
- After changes, restart `npm run dev` and run `validateAssetMap()` / unit tests under `tests/unit/assetMap*.test.js`.
