# Section Utilities

## Overview
Section resolution and preloading system. Handles identifying which sections belong to routes and coordinating eager/lazy loading of section bundles for optimal performance.

## Files

### sectionResolver.js
**Purpose**: Extract and resolve sections from route configurations

**How it works**:
1. Analyzes route config to determine section membership
2. Handles both simple string sections and role-based object sections
3. Resolves which section variant to use based on user role
4. Identifies sections to preload for instant navigation

**Key Methods**:
- `getPreloadSectionsForRoute(route, role)` - Sections to preload
- `getAllRouteSectionsForRoute(route, role)` - All related sections
- `normalizeSectionConfiguration(section)` - Handle string vs object
- `resolveRoleSectionVariant(section, role, fallback)` - Pick correct variant
- `isSectionRoleBased(section)` - Check if role-dependent
- `getAllSectionVariants(section)` - Get all possible variants

**Section Types**:
```javascript
// Simple string section
"section": "auth"

// Role-based object section
"section": {
  "creator": "dashboard-creator",
  "fan": "dashboard-fan"
}
```

**Testing**:
```javascript
import { 
  resolveRoleSectionVariant, 
  getPreloadSectionsForRoute,
  normalizeSectionConfiguration
} from './sectionResolver.js';

// Test simple section
const simpleSection = "auth";
const resolved = resolveRoleSectionVariant(simpleSection, 'creator');
console.assert(resolved === "auth");

// Test role-based section
const roleSection = {
  creator: "dashboard-creator",
  fan: "dashboard-fan"
};
const creatorResolved = resolveRoleSectionVariant(roleSection, 'creator');
console.assert(creatorResolved === "dashboard-creator");

// Test normalization
const normalized = normalizeSectionConfiguration(simpleSection);
console.assert(normalized.type === 'simple');
console.assert(normalized.roleBased === false);

// Test preload extraction
const route = {
  slug: '/dashboard',
  section: 'dashboard-global',
  preLoadSections: ['shop', 'profile']
};
const preload = getPreloadSectionsForRoute(route, 'creator');
console.assert(preload.includes('shop'));
console.assert(preload.includes('profile'));
```

**Development Rules**:
- Track all resolution with performance tracker
- Log section determination before returning
- Handle null/undefined sections gracefully
- Always provide fallback for missing roles
- Add logging for every resolution decision

---

### sectionPreloader.js
**Purpose**: Coordinate section bundle preloading

**How it works**:
1. Loads section bundles before navigation completes
2. Uses `<link rel="modulepreload">` for JS bundles
3. Uses `<link rel="preload" as="style">` for CSS bundles
4. Prevents duplicate preloads
5. Caches preload status
6. Supports batch preloading

**Key Methods**:
- `preloadSectionBundle(sectionName, manifestData)` - Preload single section
- `preloadMultipleSections(sections, manifestData)` - Batch preload
- `isSectionPreloaded(sectionName)` - Check preload status
- `clearPreloadState()` - Reset for testing

**How Preloading Works**:
```javascript
// 1. User navigates to route with preLoadSections: ["shop", "profile"]
// 2. Router detects navigation
// 3. sectionPreloader starts downloading bundles
// 4. Downloads happen in parallel
// 5. Bundles cached by browser
// 6. When user actually navigates to those sections, instant load (0 network)
```

**Testing**:
```javascript
import { preloadSectionBundle, isSectionPreloaded } from './sectionPreloader.js';

// Mock manifest data
const manifest = {
  "shop": {
    js: "/assets/section-shop-abc123.js",
    css: "/assets/section-shop-abc123.css"
  }
};

// Test preload
const result = await preloadSectionBundle('shop', manifest);
console.assert(result === true);
console.assert(isSectionPreloaded('shop'));

// Check DOM for preload links
const jsLinks = document.querySelectorAll('link[rel="modulepreload"]');
const cssLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
console.assert(jsLinks.length > 0);
```

**Development Rules**:
- Track preload start and completion with performance tracker
- Log bundle paths being preloaded
- Handle missing manifest entries gracefully
- Never block navigation waiting for preloads
- Preload in parallel for multiple sections
- Cache preload status to avoid duplicate work
- Log bundle sizes and load times

**Preload Priority**:
1. **Always preload**: auth, misc, dashboard-global
2. **Explicit preload**: Listed in `preLoadSections` array
3. **Lazy load**: Everything else

---

## Integration

### Used By
- Router navigation hooks
- Section bundle loader
- Manifest consumer

### Depends On
- `routeConfig.json` - Section definitions
- `dist/section-manifest.json` - Bundle paths (production)
- `utils/common/` - Caching, logging, performance tracking

## Development Rules

1. **Section Isolation**: Each section is completely independent
2. **Performance Tracking**: Track all resolution and preload operations
3. **Logging**: Log section determination, preload start/complete
4. **Error Handling**: Missing sections should not crash app
5. **Caching**: Cache section metadata and preload status
6. **Parallel Loading**: Preload multiple sections simultaneously

## Testing Checklist

- [ ] Simple sections resolve correctly
- [ ] Role-based sections resolve for all roles
- [ ] Fallback works when role not found
- [ ] Preload prevents duplicate loads
- [ ] Batch preload works in parallel
- [ ] Missing manifest entries handled gracefully
- [ ] All operations tracked with performance tracker
- [ ] DOM contains correct preload links

## Performance Considerations

**Section Bundle Sizes**:
- Small sections (auth): ~50-100 KB
- Medium sections (dashboard): ~100-200 KB
- Large sections (shop): ~200-300 KB

**Preload Strategy**:
```javascript
// On /log-in page
preLoadSections: ["dashboard", "shop"]
// Downloads ~400-500 KB in background

// When user logs in and navigates to /dashboard
// Instant load - already downloaded and cached
```

**Optimization Tips**:
- Preload only frequently accessed sections
- Don't preload > 500 KB per route
- Monitor bundle sizes in manifest
- Use code splitting within large sections

## Section Naming Convention

```
Format: {base-section}-{role-variant}

Examples:
- "auth" (no role variant)
- "dashboard-global" (shared by all roles)
- "dashboard-creator" (creator-specific)
- "dashboard-fan" (fan-specific)
- "misc" (utility routes like 404)
```

## Manifest Format

```json
{
  "section-name": {
    "section": "section-name",
    "js": "/assets/section-name-hash.js",
    "css": "/assets/section-name-hash.css",
    "size": 123456,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "preloadSections": ["other-section"],
    "priority": "high"
  }
}
```

