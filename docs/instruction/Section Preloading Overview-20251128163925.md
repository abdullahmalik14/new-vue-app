# Section Preloading Overview

# Terminology
*   **section**: the bundle name you want to warm (e.g. `"dashboard"`, `"shop"`).
*   **preLoadSections**: per-route array of section names to preload in the background when that route is active.

Section preloading ensures that when users navigate between parts of the application, pages appear **instantly** because their assets were quietly fetched in advance. The system uses the **section manifest** produced by the build to know exactly which JS and CSS files belong to each section. On app startup, it lazy loads the current route and preloads the sections set in the routeConfig file, e.g., "preLoadSections": \["auth"\]. C**urrent section and auth are always downloaded.** Then when a user visits a section that was preloaded, it should load instantly.
When the application initializes, `main.js` starts the performance tracker, restores session data, and then asynchronously preloads a defined set of sections. This process leverages the `sectionPreloader.js` utility, which reads from the `section-manifest.json` built by Vite. The manifest associates each section (for example, `"dashboard"`) with its corresponding hashed JS and CSS bundles, such as `/assets/section-dashboard-abc123.js` and `/assets/section-dashboard-def456.css`
The preloader creates `<link rel="modulepreload">` and `<link rel="preload" as="style">` elements inside the document head to begin background fetching. Because these assets are cached once loaded, subsequent navigation to that section is instantaneous—no new network requests appear for JS or CSS. Only the section’s translation JSON file is fetched on demand. The performance tracker logs each preload step (start, JS complete, CSS complete) so developers can verify precise timing metrics.

The `dist/section-manifest.json` file — which maps each section to its bundled JS and CSS — is **only created during the production build**. Since Vite serves files from memory during **`npm run dev`**, there’s no static manifest for the preloader to read. Without that manifest, the preloader has nothing to preload and exits early .

## Checklists:
*   **Manifest Validation:** Ensure the manifest exists in `dist/` and correctly lists bundle paths.
*   **Network Verification:** Open DevTools → Network tab, reload, and confirm which sections are downloaded and cross-check them with routeConfig.
*   Confirm that `auth` and `current section` should **download alongside** `routeConfig`, as these are considered defaults.
*   Confirm that **on first visit, the current route is lazy-loading only its template initially,** while the current section bundle is still downloaded in the background.
*   **Instant Navigation Test:** Navigate to a preloaded section (e.g., `/log-in`) and verify no network activity and render under 10 ms.
### Build Checks
1. **Run Production Build**
    *   Command: `npm run build && npm run preview`
    *   Confirm the `dist/` folder contains:
        *   `section-manifest.json`
        *   Bundled JS/CSS for each section (e.g., `section-dashboard-*.js`, `section-dashboard-*.css`).
2. **Manifest Content Validation**
    *   Open `dist/section-manifest.json`.
    *   Ensure each defined section in `routeConfig.json` has:
        *   Valid `"js"` and `"css"` keys.
        *   Correct relative asset paths
### Preload Injection Checks
1. **Inspect HTML Head**
    *   Open app in browser (`npm run preview`).
    *   In DevTools → Elements tab, verify `<head>` contains:
    *   `<link rel="modulepreload" href="/assets/section-auth-xxxx.js">`
    *   `<link rel="preload" as="style" href="/assets/section-auth-xxxx.css">`
    *   Check that:
        *   Only predeclared preload sections are listed.
        *   No duplicate `<link>` entries.
2. **Console Logs**
    *   Verify your console prints preloading logs:
    *   `[PerfTracker] Preload started for section: auth[PerfTracker] JS complete[PerfTracker] CSS complete`
    *   Confirm timestamp and elapsed values appear in the performance table.
### Network & Timing Checks
1. **Initial Load Network Audit**
    *   Open DevTools → Network → Filter by `modulepreload` and `preload`.
    *   Reload the app.
    *   Expected behavior:
        *   Immediate background fetches for preloaded sections’ JS and CSS.
        *   No blocking on render.
2. **Instant Navigation Test**
    *   Navigate to any **preloaded section** (from config).
    *   Verify:
        *   No JS/CSS network activity.
        *   Only translation JSONs (if any) load.
        *   Page render feels instantaneous (<100 ms).
## Adding a New Route or Section
When introducing a new section, you must:
1. **Create the component file**
    *   Example: `/src/templates/dashboard/page/creator/Studio.vue`
2. **Add a new entry in** **`routeConfig.json`** **and ensure it has:**
    *   `slug`: Must match the intended route path.
    *   `section`: Must match your build’s section bundle name.
    *   `componentPath`: Path to your Vue component (relative to `src`).
    *   `preLoadSections`: List of section bundles that should preload alongside this route.
3. **Save & Rebuild**
    *   Run `npm run build` to regenerate the section manifest with the new section.
## Removing a Route or Section
1. **Locate the route entry** in `routeConfig.json`.
2. Update or empty the `preLoadSections`
3. **Rebuild the project**
    *   Run `npm run build` again to update the manifest.

To **add preloading "shop"**:

```json
"preLoadSections": ["dashboard", "shop"]
```

To **remove preloading "shop"**:

```json
"preLoadSections": ["dashboard"]
```