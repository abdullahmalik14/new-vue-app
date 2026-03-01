# Build System

## Overview
Build-time utilities for section-based bundling, CSS generation, and manifest creation. These run during `npm run build` to create optimized section bundles.

## Structure

```
build/
├── validate-env.js         # Environment variable validation
├── buildConfig.js          # Global build configuration
├── vite/                   # Vite plugins and bundling logic
│   ├── sectionBundler.js   # Section code splitting
│   ├── manifestGenerator.js # Manifest file creation
│   └── index.js            # Exports
└── tailwind/               # Tailwind CSS generation system
    ├── index.js            # Tailwind exports
    ├── sectionScanner.js   # Section scanning for CSS
    ├── sectionCssBuilder.js # Section CSS building
    ├── ignoredComponentHandler.js # Individual component detection
    ├── individualCssGenerator.js # Individual component CSS generation
    └── generateIndividualCss.js # CLI script
```

## Files

### buildConfig.js
**Purpose**: Global build configuration and section discovery

**How it works**:
- Extracts all sections from routeConfig.json
- Defines which sections to preload
- Provides utilities for manifest generation
- Validates route configuration

**Key Functions**:
- `extractAllSectionsFromRouteConfig(routes)` - Find all sections
- `shouldSectionBePreloaded(section, routes)` - Determine preload status
- `generateManifestMetadataForSection(section, opts)` - Create manifest metadata
- `getComponentPathPatternsForSection(section)` - Get bundle patterns
- `validateRouteConfiguration(route)` - Validate route structure

**Always Preload Sections**:
```javascript
const ALWAYS_PRELOAD_SECTIONS = [
  'auth',              // Authentication flows
  'misc',              // 404 and error pages
  'dashboard-global'   // Base dashboard
];
```

**Testing**:
```javascript
import { extractAllSectionsFromRouteConfig } from './buildConfig.js';
import routeConfig from '../src/router/routeConfig.json';

const sections = extractAllSectionsFromRouteConfig(routeConfig);
console.assert(sections.has('auth'));
console.assert(sections.has('dashboard-global'));
console.log('Discovered sections:', Array.from(sections));
```

**Development Rules**:
- Never hardcode section names (except ALWAYS_PRELOAD)
- Extract sections dynamically from routeConfig
- Log all discovered sections
- Validate route structure before build
- Track discovery with performance tracker

---

## Vite Build System (`build/vite/`)

### sectionBundler.js
**Purpose**: Generate Rollup manualChunks configuration for section-based code splitting

**How it works**:
1. Scans routeConfig.json at build time
2. Discovers all unique sections
3. Generates Rollup manualChunks function
4. Routes modules to correct section chunks based on file path

**Bundling Strategy**:
```javascript
// Vendor bundles
- vendor-vue          // Vue core
- vendor-vue-router   // Vue Router
- vendor-pinia        // Pinia store
- vendor-i18n         // Vue I18n
- vendor              // Other dependencies

// Section bundles
- section-auth        // Auth components/templates
- section-dashboard-global
- section-dashboard-creator
- section-shop
- section-misc

// Translation bundles
- i18n-auth           // Auth translations
- i18n-dashboard-global
...

// Utility bundle
- utils               // Common utilities
```

**Path Matching**:
```javascript
// These paths go to section-auth bundle:
/components/auth/
/templates/auth/
/components/layout/auth/

// These paths go to section-dashboard-creator bundle:
/components/dashboard/
/templates/dashboard/
(when section is dashboard-creator)
```

**Key Functions**:
- `discoverAllSectionsFromConfig()` - Find sections
- `generateManualChunksConfiguration(sections)` - Create Rollup config
- `groupComponentsBySection(sections)` - Map components to sections
- `getPreloadConfiguration(sections)` - Eager vs lazy
- `createSectionBundlerPlugin()` - Vite plugin factory

**Testing**:
```bash
# Build and check output
npm run build

# Check dist/assets/ for section bundles
ls -lh dist/assets/section-*.js
ls -lh dist/assets/section-*.css

# Verify section bundling
cat dist/section-manifest.json
```

**Development Rules**:
- Log all discovered sections during build
- Track bundling time with performance tracker
- Output section count and bundle sizes
- Handle both simple and role-based sections
- Never crash build on missing components

---

### manifestGenerator.js
**Purpose**: Generate section-manifest.json after build completion

**How it works**:
1. Runs in Rollup `closeBundle` hook
2. Scans `dist/assets/` for section-* files
3. Groups JS and CSS by section name
4. Extracts metadata (size, timestamp)
5. Enriches with routeConfig data
6. Writes section-manifest.json

**Manifest Format**:
```json
{
  "auth": {
    "section": "auth",
    "js": "/assets/section-auth-a1b2c3.js",
    "css": "/assets/section-auth-a1b2c3.css",
    "size": 52340,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "preloadSections": ["dashboard"],
    "priority": "high"
  },
  "dashboard-global": {
    "section": "dashboard-global",
    "js": "/assets/section-dashboard-global-d4e5f6.js",
    "css": "/assets/section-dashboard-global-d4e5f6.css",
    "size": 128560,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "preloadSections": [],
    "priority": "normal"
  }
}
```

**Key Functions**:
- `scanDistAssetsForSections(distPath)` - Find section bundles
- `generateSectionManifestFile(bundles, distPath)` - Create manifest
- `enrichManifestWithMetadata(manifest, routeConfigPath)` - Add metadata
- `validateManifestIntegrity(manifest)` - Check completeness
- `createManifestGeneratorPlugin()` - Vite plugin factory

**Testing**:
```bash
# Build
npm run build

# Check manifest exists
test -f dist/section-manifest.json && echo "Manifest created"

# Validate manifest
node -e "const m = require('./dist/section-manifest.json'); console.log(Object.keys(m).length + ' sections');"

# Check all sections have JS bundles
cat dist/section-manifest.json | jq 'to_entries | map(select(.value.js == null))'
```

**Development Rules**:
- Log all found section bundles
- Track manifest generation time
- Validate all sections have JS bundles (CSS optional)
- Include file sizes in manifest
- Enrich with metadata from routeConfig
- Log validation errors clearly

---

## Integration

### Build Flow
```
1. npm run build
   ↓
2. Vite starts build
   ↓
3. sectionBundlerPlugin.config() hook
   → Discovers sections
   → Injects manualChunks configuration
   ↓
4. Rollup bundles with section-based splitting
   ↓
5. Tailwind compiles CSS per section (via @tailwindcss/vite)
   ↓
6. manifestGeneratorPlugin.closeBundle() hook
   → Scans dist/assets/
   → Creates section-manifest.json
   ↓
7. Build complete
```

### Used By
- `vite.config.js` - Imports plugins
- Production app - Loads manifest for preloading

### Depends On
- `src/router/routeConfig.json` - Section definitions
- Rollup - Code splitting
- Vite - Build orchestration

## Development Rules

1. **Section Discovery**: Always extract from routeConfig, never hardcode
2. **Performance Tracking**: Track build steps with performance tracker
3. **Logging**: Log section discovery, bundle sizes, manifest creation
4. **Error Handling**: Never crash build, log errors and continue
5. **Validation**: Validate manifest completeness
6. **Metadata**: Enrich manifest with routeConfig data

## Testing Checklist

- [ ] All sections discovered from routeConfig
- [ ] Section bundles created in dist/assets/
- [ ] Manifest file created at dist/section-manifest.json
- [ ] All sections in manifest have JS bundles
- [ ] Manifest includes file sizes
- [ ] Vendor bundles separated correctly
- [ ] Translation files bundled per section
- [ ] Build logs section count and sizes

## Build Output Structure

```
dist/
├── index.html
├── section-manifest.json           # Section bundle map
└── assets/
    ├── section-auth-[hash].js      # Auth section bundle
    ├── section-auth-[hash].css
    ├── section-dashboard-global-[hash].js
    ├── section-dashboard-global-[hash].css
    ├── section-shop-[hash].js
    ├── section-shop-[hash].css
    ├── vendor-vue-[hash].js        # Vue core
    ├── vendor-pinia-[hash].js      # Pinia
    ├── vendor-[hash].js            # Other vendors
    ├── utils-[hash].js             # Common utilities
    ├── i18n-auth-[hash].js         # Auth translations
    └── ...
```

## Performance Optimization

**Bundle Size Targets**:
- Small sections (auth, misc): < 100 KB
- Medium sections (dashboard): 100-200 KB
- Large sections (shop, profile): 200-300 KB
- Vendor bundles: Keep core < 200 KB

**Optimization Tips**:
- Split large sections into role variants
- Tree-shake unused code
- Lazy load translations
- Preload only critical sections
- Monitor bundle sizes in manifest

## Tailwind CSS System

### Overview
Automated CSS generation with two modes:
- **Section CSS**: Combined CSS bundles per section
- **Individual Component CSS**: Isolated CSS for heavy components

### Section CSS Building
**File**: `tailwind/sectionCssBuilder.js`

**Purpose**: Creates section-scoped CSS bundles from routeConfig

**How it works**:
- Scans routeConfig for sections
- Finds all components in each section
- Generates Tailwind config for section components
- Excludes components marked with `tailwind-ignore`
- Creates CSS bundle for each section

**Key Functions**:
- `buildSectionTailwindConfig(section, components)` - Generate section config
- `buildAllSectionConfigs()` - Build configs for all sections
- `generateSectionCssBuildReport()` - Report build stats

### Individual Component CSS
**File**: `tailwind/individualCssGenerator.js`

**Purpose**: Generates isolated CSS for components marked with `tailwind-ignore`

**How it works**:
- Scans for components with `tailwind-ignore` markers
- Extracts Tailwind classes from component templates
- Generates minimal CSS files co-located with components
- Auto-imports CSS when components are used

**Key Functions**:
- `generateIndividualComponentCss(componentPath)` - Generate CSS for one component
- `generateAllIndividualComponentCss(baseDirectory)` - Generate CSS for all ignored components
- `getComponentCssPath(componentPath)` - Get co-located CSS path

**Usage**:
```bash
# Generate individual CSS for all ignored components
node build/tailwind/generateIndividualCss.js

# Clean up generated CSS files
node build/tailwind/generateIndividualCss.js --clean
```

### Markers for Individual CSS

**Option 1: HTML Comment**
```vue
<!-- tailwind-ignore -->
<template>
  <div class="p-4 bg-white">Heavy component</div>
</template>
```

**Option 2: Export Constant**
```vue
<script setup>
export const IGNORE_TAILWIND = true;
</script>
```

### CSS File Location
Individual component CSS is co-located with the component:
```
src/components/MyComponent.vue  ← Component
src/components/MyComponent.css  ← Generated CSS
```

## Troubleshooting

**Problem**: Section not bundling separately
- Check component path patterns in sectionBundler.js
- Verify section name in routeConfig matches exactly
- Check build logs for discovered sections

**Problem**: Manifest missing sections
- Verify section bundles exist in dist/assets/
- Check file naming: must be `section-{name}-{hash}.js`
- Look for build errors in console

**Problem**: Bundle too large
- Check what's included using bundle analyzer
- Split into multiple sections
- Move shared code to utils
- Review dependencies (check vendor bundles)

