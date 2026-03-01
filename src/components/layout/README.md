# Layout Components

This directory contains global layout components used throughout the application.

## 📁 Components Overview

### `AppHeader.vue`
**Purpose:** Global application header with meta/schema management

**Key Features:**
- Placeholder methods for SEO meta tag management
- Placeholder methods for Schema.org structured data
- Ready for dynamic title updates
- Ready for header navigation management
- Performance tracking integration
- Logging integration

**Methods Available (via ref):**
```javascript
const headerRef = ref();

// Add meta tags
headerRef.value.addHeaderMeta({
  title: 'Page Title',
  description: 'Page description',
  keywords: 'keyword1, keyword2',
  ogImage: 'https://example.com/image.jpg',
  canonicalUrl: 'https://example.com/page'
});

// Add schema markup
headerRef.value.addHeaderSchema({
  type: 'WebSite',
  data: {
    name: 'Site Name',
    url: 'https://example.com'
  }
});

// Update page title
headerRef.value.updatePageTitle('New Page Title');

// Update navigation
headerRef.value.updateHeaderNavigation([
  { label: 'Home', url: '/' },
  { label: 'About', url: '/about' }
]);
```

**Usage in App.vue:**
```vue
<template>
  <AppHeader ref="appHeader" />
</template>

<script setup>
import AppHeader from './components/layout/AppHeader.vue';

const appHeader = ref();

// Use header methods
appHeader.value.addHeaderMeta({ title: 'Dashboard' });
</script>
```

---

### `AppFooter.vue`
**Purpose:** Global application footer with conditional navigation

**Key Features:**
- Environment-controlled navigation display (`VITE_ENABLE_FOOTER_NAVIGATION`)
- Route-based navigation from `routeConfig.json`
- Role-based route filtering
- Authentication-aware route display
- Performance tracking integration
- Responsive design with Tailwind CSS

**Navigation Logic:**
1. **Environment Check:** Only shows if `VITE_ENABLE_FOOTER_NAVIGATION=true`
2. **Route Filtering:**
   - Must be enabled (`enabled: true`)
   - Must have component path (not redirect-only)
   - Must not be auth-specific routes (confirm-email, lost-password, etc.)
3. **Access Control:**
   - Checks authentication requirements
   - Validates role permissions
   - Shows access status for each route

**Route Display Format:**
```
Route Name
Role/Auth Status
```

**Example Output (Development):**
```
Dashboard
Accessible to all roles

Not Found
Accessible to all roles

Login
Not shown when logged in

Sign Up
Requires guest access
```

**Usage in App.vue:**
```vue
<template>
  <AppFooter />
</template>

<script setup>
import AppFooter from './components/layout/AppFooter.vue';
// No additional setup needed - footer manages itself
</script>
```

---

## 🔧 Environment Configuration

### Footer Navigation Control

**Environment Variable:** `VITE_ENABLE_FOOTER_NAVIGATION`

| Environment | Default | Behavior |
|-------------|---------|----------|
| Development | `true` | Navigation shown for testing |
| Production | `false` | Navigation hidden for production |

**Setting the Variable:**
```bash
# Enable footer navigation
VITE_ENABLE_FOOTER_NAVIGATION=true

# Disable footer navigation
VITE_ENABLE_FOOTER_NAVIGATION=false
```

---

## 🎯 Route Filtering Rules

### Included Routes
- ✅ `enabled: true` (or not specified)
- ✅ Has `componentPath` property
- ✅ Not in excluded list (`confirm-email`, `lost-password`, `reset-password`)

### Access Status Display
- **"Accessible to all roles"** - No role restrictions
- **"Accessible to [role] role"** - Specific role required
- **"Requires authentication"** - User must be logged in
- **"Not shown when logged in"** - Only for guest users
- **"Requires [role] role"** - User doesn't have required role

---

## 📱 Responsive Design

### Header
- Fixed height with shadow and border
- Centered logo/brand area
- Placeholder for future navigation elements
- Responsive padding and spacing

### Footer
- Full-width with top border
- Navigation grid: 2 columns on mobile, 4 on desktop
- Copyright and status information
- Conditional navigation display

---

## 🔍 Debugging

### Header Debugging
```javascript
// Check if header methods are available
console.log(appHeader.value);

// Manually call methods for testing
appHeader.value.addHeaderMeta({ title: 'Test Title' });
```

### Footer Debugging
```javascript
// Check navigation state
console.log('Footer nav enabled:', import.meta.env.VITE_ENABLE_FOOTER_NAVIGATION);

// Check processed routes
// Routes are logged during component mount
```

### Performance Tracking
Both components track performance:
- Header: `headerComponentMounted`, `addHeaderMeta`, `addHeaderSchema`
- Footer: `footerComponentMounted`, `processRoutesForNavigation`

---

## 🚀 Future Enhancements

### Header Enhancements
- [ ] Implement dynamic meta tag management
- [ ] Add Schema.org JSON-LD generation
- [ ] Add breadcrumb navigation
- [ ] Add user menu/profile section
- [ ] Add search functionality

### Footer Enhancements
- [ ] Add social media links
- [ ] Add newsletter signup
- [ ] Add contact information
- [ ] Add legal links (privacy, terms)
- [ ] Add sitemap link

---

## 📚 Related Documentation

- **Environment Setup:** `../../../ENV_SETUP_GUIDE.md`
- **Route Configuration:** `../../router/routeConfig.json`
- **Auth System:** `../../stores/useAuthStore.js`
- **Performance Tracking:** `../common/globalPerformanceTracker.js`

---

**Maintained By:** Development Team
**Last Updated:** 2024

