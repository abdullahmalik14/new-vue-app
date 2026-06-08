# Route Utilities

## Overview
Route management system responsible for loading route configuration, resolving routes, applying guards, and tracking navigation. This is the core security and navigation layer of the application.

## Files

### routeConfigLoader.js
**Purpose**: Load and cache route configuration from routeConfig.json

**How it works**:
1. Loads routeConfig.json on first access
2. Validates all routes for required fields
3. Caches configuration for performance
4. Provides reset functionality for development

**Key Methods**:
- `loadRouteConfigurationFromFile()` - Load and validate config
- `getCachedRouteConfiguration()` - Get cached or load config
- `resetRouteConfigurationCache()` - Clear cache
- `getRouteConfiguration()` - Main entry point (always use this)

**Testing**:
```javascript
import { getRouteConfiguration, resetRouteConfigurationCache } from './routeConfigLoader.js';

// Test loading
const routes = getRouteConfiguration();
console.assert(Array.isArray(routes));
console.assert(routes.length > 0);

// Test caching
const routes2 = getRouteConfiguration();
console.assert(routes === routes2); // Should be same reference (cached)

// Test reset
resetRouteConfigurationCache();
const routes3 = getRouteConfiguration();
console.assert(routes !== routes3); // Should be new load
```

**Development Rules**:
- Never modify returned route config array directly
- Always use getRouteConfiguration() as entry point
- Add performance tracking for load operations
- Log before every return with route count
- Cache for 1 hour by default

---

### routeResolver.js
**Purpose**: Resolve routes, component paths, and handle parent inheritance

**How it works**:
1. Matches URL paths to route configurations
2. Handles wildcard routes (/:pathMatch(.*))
3. Resolves role-based component paths
4. Inherits configuration from parent routes

**Key Methods**:
- `resolveRouteFromPath(path)` - Find route by path
- `resolveComponentPathForRoute(route, role)` - Get component path for role
- `inheritConfigurationFromParentRoute(route)` - Merge parent config (used by router guards/preload via `resolveEffectiveRouteConfig`)
- `getRouteChainForPath(path)` - Parent chain for breadcrumbs/path introspection; wired into `routeNavigation` on each navigation

**Testing**:
```javascript
import { resolveRouteFromPath, resolveComponentPathForRoute } from './routeResolver.js';

// Test exact match
const route = resolveRouteFromPath('/dashboard');
console.assert(route !== null);
console.assert(route.slug === '/dashboard');

// Test wildcard
const notFound = resolveRouteFromPath('/nonexistent/path');
console.assert(notFound !== null); // Should match catch-all

// Test role resolution
const component = resolveComponentPathForRoute(route, 'creator');
console.assert(component !== null);
```

**Development Rules**:
- Always try exact match before wildcard
- Track resolution with performance tracker
- Log resolution results (hit/miss)
- Handle both string and object section definitions
- Add logging before returning resolved values

---

### routeGuards.js
**Purpose**: Navigation guards for security and access control

**CRITICAL**: Every guard operation MUST be tracked with performance tracker

**How it works**:
Guards execute in sequence:
1. **Loop Prevention**: Detect circular redirects
2. **Environment Access**: Block dev-only routes if registered outside dev (S1 defense in depth)
3. **Authentication**: User must be authenticated if required
4. **Role Check**: User role must be in supportedRoles
5. **Dependencies**: Check onboarding, KYC, etc.

**Disabled routes (`enabled: false`)**: Not registered in Vue Router at build time. Direct URLs hit the catch-all → `/404`. Guards do not check `enabled` (see audit B3).

**Key Methods**:
- `runAllRouteGuards(toRoute, fromRoute, context)` - Execute full chain (**async** — returns `Promise<GuardResult>`)
- `guardPreventNavigationLoop(to, from)` - Loop detection
- `guardCheckRouteEnvironmentAccess(route)` - envAccess availability
- `guardCheckRouteEnabled(route)` - Deprecated alias for environment access only
- `guardCheckAuthentication(route, context)` - Auth requirement
- `guardCheckUserRole(route, context)` - Role permission
- `guardCheckDependencies(route, context)` - Prerequisites
- `clearGuardNavigationHistory()` - Clear redirect-loop detection buffer only (not `routeNavigation.clearNavigationHistory`)

**Testing**:
```javascript
import { runAllRouteGuards } from './routeGuards.js';

// runAllRouteGuards is async — always await (or use .then)
async function testRouteGuards() {
  const publicRoute = { slug: '/log-in', requiresAuth: false, enabled: true, supportedRoles: ['all'] };
  const protectedRoute = { slug: '/dashboard', requiresAuth: true, enabled: true, supportedRoles: ['creator'] };

  const guestContext = { isAuthenticated: false, userRole: 'guest' };
  const userContext = { isAuthenticated: true, userRole: 'creator' };

  // Guest can access login
  let result = await runAllRouteGuards(publicRoute, {}, guestContext);
  console.assert(result.allow === true);

  // Guest cannot access dashboard
  result = await runAllRouteGuards(protectedRoute, {}, guestContext);
  console.assert(result.allow === false);
  console.assert(result.redirectTo === '/log-in');

  // User can access dashboard
  result = await runAllRouteGuards(protectedRoute, {}, userContext);
  console.assert(result.allow === true);
}

testRouteGuards();
```

**Development Rules**:
- **Track EVERY guard with performance tracker**
- Log guard entry, result, and reason
- Never throw errors - return guard result object
- Keep guard logic simple and focused
- Add context data to all logs
- Guards must be stateless (no side effects)

**Guard Result Format**:
```javascript
{
  allow: boolean,        // true = proceed, false = block
  redirectTo: string,    // Where to redirect if blocked
  reason: string         // Human-readable reason
}
```

---

### routeNavigation.js
**Purpose**: Track navigation state and history

**How it works**:
- Maintains current and previous route
- Keeps history of navigation events
- Provides navigation statistics

**Key Methods**:
- `setCurrentActiveRoute(route)` - Update active route
- `getCurrentActivePath()` - Get current path
- `getPreviousActivePath()` - Get previous path
- `getNavigationHistory(maxEntries)` - Get history array
- `canNavigateBack()` - Check if back is possible
- `clearNavigationHistory()` - Reset full navigation state (current/previous/history). Do **not** confuse with `clearGuardNavigationHistory()` in `routeGuards.js`.

**Testing**:
```javascript
import { setCurrentActiveRoute, getCurrentActivePath, getPreviousActivePath } from './routeNavigation.js';

// Test navigation tracking
const route1 = { slug: '/log-in' };
const route2 = { slug: '/dashboard' };

setCurrentActiveRoute(route1);
console.assert(getCurrentActivePath() === '/log-in');

setCurrentActiveRoute(route2);
console.assert(getCurrentActivePath() === '/dashboard');
console.assert(getPreviousActivePath() === '/log-in');
```

**Development Rules**:
- Update on every successful navigation (afterEach hook)
- Track with performance tracker
- Log state changes
- Keep max 100 history entries
- Include timestamps in history

---

## Integration

### Used By
- `src/router/index.js` - Vue Router setup
- Navigation guards in beforeEach
- Route resolution for components

### Depends On
- `utils/common/` - Caching, logging, performance tracking
- `routeConfig.json` - Route definitions

## Development Rules

1. **Performance Tracking**: Every major operation tracked
2. **Logging**: Log all route resolutions, guard results, navigation events
3. **Guard Execution**: Guards run in fixed order, track each one
4. **Error Handling**: Never crash - return safe defaults
5. **Caching**: Cache route config, clear on updates
6. **Context**: Always pass full context to guards

## Testing Checklist

- [ ] Route resolution handles exact and wildcard matches
- [ ] All guards execute in correct order
- [ ] Loop detection prevents infinite redirects
- [ ] Role checks work for all role types
- [ ] Dependency checks handle complex requirements
- [ ] Navigation history tracks correctly
- [ ] All operations logged with performance tracker

## Security Notes

- Guards are the primary security layer
- Never trust client-side guards alone
- Always validate on backend
- Log all blocked navigation attempts
- Track suspicious patterns (rapid redirects)

## Performance Considerations

- Route config cached for 1 hour
- `runAllRouteGuards()` is async — `router/index.js` `beforeEach` must `await` it before calling `next()`
- Individual guard helpers (`guardCheckAuthentication`, etc.) are synchronous; keep each fast (< 10ms)
- Log performance of slow guards

