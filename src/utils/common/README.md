# Common Utilities

## Overview
Core utilities used throughout the entire application. These are the foundational building blocks that every other module depends on.

## Files

### cacheHandler.js
**Purpose**: In-memory caching with TTL (Time To Live) support

**How it works**:
- Stores key-value pairs in a Map
- Optional expiration time for each entry
- Automatically removes expired entries on access
- Manual cleanup available for proactive memory management

**Key Methods**:
- `setValueWithExpiration(key, value, ttlMs)` - Store value with optional TTL
- `getValueFromCache(key)` - Retrieve value (returns null if expired/missing)
- `deleteValueFromCache(key)` - Remove specific key
- `clearAllCachedValues()` - Clear all cache
- `cleanupExpiredCacheEntries()` - Manual cleanup of expired entries

**Testing**:
```javascript
import { setValueWithExpiration, getValueFromCache } from './cacheHandler.js';

// Test basic storage
setValueWithExpiration('test-key', { data: 'value' });
const result = getValueFromCache('test-key');
console.assert(result.data === 'value');

// Test TTL expiration
setValueWithExpiration('expire-key', 'data', 100); // 100ms TTL
setTimeout(() => {
  const expired = getValueFromCache('expire-key');
  console.assert(expired === null); // Should be expired
}, 150);
```

**Development Rules**:
- Never store sensitive data (passwords, tokens) in cache
- Always use descriptive cache keys (prefix with module name)
- Set appropriate TTL based on data volatility
- Clean up caches when user logs out

---

### logHandler.js
**Purpose**: Environment-aware logging system

**CRITICAL CORRECTION NEEDED**: Currently has multiple methods (logDebugMessage, logInfoMessage, etc.) but should have ONE method with type parameter.

**Should be**:
```javascript
log('fileName.js', 'methodName', 'flag', 'Description', { data })
// Format: [fileName.js] [methodName] [flag] Description {"data":"value"}
```

**Testing**:
```javascript
import { log } from './logHandler.js';

// Test logging
log('test.js', 'testMethod', 'info', 'Testing log output', { test: true });
// Should output: [test.js] [testMethod] [info] Testing log output {"test":true}
```

**Development Rules**:
- Log at the START of every function
- Log BEFORE every return statement with valid data
- Log all errors (even in production)
- Use descriptive flags: 'init', 'start', 'success', 'error', 'cache-hit', etc.
- Always include relevant data as last parameter

---

### performanceTracker.js
**Purpose**: Single global performance tracker for entire application

**How it works**:
- ONE instance created at app startup (if VITE_ENABLE_LOGGER=true)
- All operations across entire app add steps to same session
- Creates unified timeline of all operations
- Outputs formatted table to console

**Key Methods**:
- `new PerfTracker(label, opts)` - Create instance
- `.start()` - Start tracking session
- `.step({ step, file, method, flag, purpose })` - Add tracking step
- `.table()` - Get formatted table of all steps

**Testing**:
```javascript
import PerfTracker from './performanceTracker.js';

const tracker = new PerfTracker('test-session', { enabled: true });
tracker.start();

tracker.step({
  step: 'operation1',
  file: 'test.js',
  method: 'testMethod',
  flag: 'start',
  purpose: 'Begin test operation'
});

// ... do work ...

tracker.step({
  step: 'operation1Complete',
  file: 'test.js',
  method: 'testMethod',
  flag: 'complete',
  purpose: 'Test operation finished'
});

console.table(tracker.table());
```

**Development Rules**:
- **ONLY ONE instance** for entire application
- Initialize in main.js ONLY
- Export and import same instance everywhere
- Track ALL major operations
- Use descriptive step names
- Include file, method, flag, and purpose in every step

---

### objectSafety.js
**Purpose**: Safe object manipulation utilities

**How it works**:
- Defensive programming for object operations
- Prevents crashes from null/undefined access
- Deep merging with child preference
- Safe nested property access

**Key Methods**:
- `deepMergePreferChild(parent, child)` - Deep merge, child wins
- `safelyGetNestedProperty(obj, 'a.b.c', fallback)` - Safe nested access
- `assertValuePresent(value, label)` - Throw if missing
- `isValuePresent(value)` - Boolean check
- `deepCloneObject(obj)` - Deep clone via JSON

**Testing**:
```javascript
import { safelyGetNestedProperty, deepMergePreferChild } from './objectSafety.js';

// Test safe access
const obj = { a: { b: { c: 'value' } } };
const result = safelyGetNestedProperty(obj, 'a.b.c', 'default');
console.assert(result === 'value');

const missing = safelyGetNestedProperty(obj, 'x.y.z', 'default');
console.assert(missing === 'default');

// Test merge
const parent = { a: 1, b: 2 };
const child = { b: 3, c: 4 };
const merged = deepMergePreferChild(parent, child);
console.assert(merged.b === 3); // Child wins
```

**Development Rules**:
- Always use safe access for external/user data
- Use assertValuePresent for required parameters
- Prefer safelyGetNestedProperty over optional chaining for consistency
- Add logging before every return

---

### errorHandler.js
**Purpose**: Centralized error handling

**CRITICAL CORRECTION NEEDED**: Currently too complex with multiple wrapper functions.

**Should be simplified to**:
- Silent by default (don't throw)
- Always log to console (even in production)
- Provide debug data
- Just catch and log, don't wrap functions

**Development Rules**:
- Don't throw errors for non-critical operations
- Always log errors with full context
- Provide fallback values when operations fail
- Include stack traces in logs

---

## Global Development Rules

1. **Logging Everywhere**: Every function MUST log entry, exits, and before returns
2. **Error Handling**: Catch errors, log them, continue execution
3. **Performance Tracking**: Add .step() calls for major operations
4. **Descriptive Naming**: No abbreviations, full clear names
5. **Comments**: Every method needs JSDoc, every block needs inline comment
6. **Caching**: Use cacheHandler to avoid redundant operations

## Testing Checklist

- [ ] All methods have unit tests
- [ ] Logging outputs correct format
- [ ] Cache expiration works correctly
- [ ] Safe access handles null/undefined
- [ ] Error handler doesn't crash app
- [ ] Performance tracker records all steps

## Dependencies

These utilities have NO dependencies on other modules. They are the foundation that everything else builds on.

