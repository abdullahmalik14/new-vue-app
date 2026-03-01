<!--
  AppFooter.vue - Global Application Footer Component

  Provides footer functionality with:
  - Conditional navigation display based on VITE_ENABLE_FOOTER_NAVIGATION
  - Route-based navigation from routeConfig.json
  - Shows routes that are enabled and accessible for current user role
-->

<template>
  <footer class="app-footer bg-gray-100 border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Footer Navigation (when enabled) -->
      <nav v-if="showFooterNav && visibleRoutes.length > 0" class="mb-8">
        <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Site Navigation
        </h3>
        <ul class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <li v-for="route in visibleRoutes" :key="route.slug" class="text-sm">
            <router-link :to="route.slug"
              class="text-gray-600 hover:text-gray-900 hover:underline transition-colors duration-200"
              :class="{ 'font-medium text-blue-600': isCurrentRoute(route.slug) }">
              {{ getRouteDisplayName(route) }}
            </router-link>
            <span class="text-xs text-gray-400 block">
              {{ getRouteStatus(route) }}
            </span>
          </li>
        </ul>
      </nav>

      <!-- Footer Content -->
      <div class="border-t border-gray-200 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="text-sm text-gray-500 mb-4 md:mb-0">
            &copy; {{ currentYear }} Vue App. All rights reserved.
          </div>

          <div class="text-sm text-gray-500">
            Footer Component - Route Navigation {{ showFooterNav ? 'Enabled' : 'Disabled' }}
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { log } from '../../utils/common/logHandler.js';
import { logError } from '../../utils/common/errorHandler.js';
import routeConfigImport from '../../router/routeConfig.json';
import { loadJsonConfigFromImport } from '../../utils/common/jsonConfigLoader.js';
import { validateRouteConfig } from '../../utils/build/jsonConfigValidator.js';

// Component name for logging
const componentName = 'AppFooter';

// Vue Router
const router = useRouter();
const route = useRoute();

// Auth store
const authStore = useAuthStore();

// Environment variable for footer navigation
const showFooterNav = import.meta.env.VITE_ENABLE_FOOTER_NAVIGATION === 'true';

// Current year for copyright
const currentYear = ref(new Date().getFullYear());

// Processed routes for navigation
const processedRoutes = ref([]);

// Load and validate route config using global JSON config loader
let routeConfig = [];
try {
  const result = loadJsonConfigFromImport(routeConfigImport, {
    configName: 'route_config_footer',
    skipValidation: false,
    validator: validateRouteConfig
  });

  if (result.success) {
    routeConfig = result.data;
    log('AppFooter.vue', 'loadRouteConfig', 'success', 'Route config loaded successfully', {
      routeCount: routeConfig.length
    });
  } else {
    logError('AppFooter.vue', 'loadRouteConfig', 'Failed to load route config', result.error);
    routeConfig = [];
  }
} catch (error) {
  logError('AppFooter.vue', 'loadRouteConfig', 'Exception loading route config', error);
  routeConfig = [];
}

/**
 * Process routeConfig to get navigable routes
 * Filters routes based on:
 * - enabled status
 * - authentication requirements
 * - role permissions
 * - excludes redirect-only routes
 */
function processRoutesForNavigation() {
  log('AppFooter.vue', 'processRoutesForNavigation', 'start', 'Processing routes for footer navigation', {});

  const navigableRoutes = routeConfig
    .filter(routeItem => {
      // Skip routes that are redirect-only or not enabled
      if (routeItem.enabled === false) return false;

      // Skip routes without component paths (redirects)
      if (!routeItem.componentPath) return false;

      // Skip auth-related routes that users shouldn't navigate to directly
      const skipRoutes = ['/confirm-email', '/lost-password', '/reset-password'];
      if (skipRoutes.includes(routeItem.slug)) return false;

      return true;
    })
    .map(routeItem => {
      // Determine if route is accessible based on auth and role
      const isAuthenticated = authStore.isAuthenticated;
      const userRole = authStore.currentUser?.role || 'guest';

      let isAccessible = true;
      let accessReason = '';

      // Check authentication requirements
      if (routeItem.requiresAuth && !isAuthenticated) {
        isAccessible = false;
        accessReason = 'Requires authentication';
      } else if (routeItem.redirectIfLoggedIn && isAuthenticated) {
        isAccessible = false;
        accessReason = 'Not shown when logged in';
      }

      // Check role permissions
      if (isAccessible && routeItem.supportedRoles) {
        if (routeItem.supportedRoles.includes('all')) {
          accessReason = 'Accessible to all roles';
        } else if (routeItem.supportedRoles.includes(userRole)) {
          accessReason = `Accessible to ${userRole} role`;
        } else {
          isAccessible = false;
          accessReason = `Requires ${routeItem.supportedRoles.join(' or ')} role`;
        }
      }

      return {
        ...routeItem,
        isAccessible,
        accessReason
      };
    });

  processedRoutes.value = navigableRoutes;

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'processRoutesForNavigation',
      file: 'AppFooter.vue',
      method: 'processRoutesForNavigation',
      flag: 'routes-processed',
      purpose: `Processed ${navigableRoutes.length} routes for navigation`
    });
  }

  log('AppFooter.vue', 'processRoutesForNavigation', 'return', 'Routes processed for navigation', {
    totalRoutes: routeConfig.length,
    navigableRoutes: navigableRoutes.length,
    showFooterNav
  });
}

/**
 * Get visible routes for footer navigation
 * Returns routes that should be displayed based on accessibility and environment settings
 */
const visibleRoutes = computed(() => {
  if (!showFooterNav) return [];

  return processedRoutes.value.filter(routeItem => routeItem.isAccessible);
});

/**
 * Check if a route is the current active route
 */
function isCurrentRoute(routeSlug) {
  return route.path === routeSlug;
}

/**
 * Get display name for a route
 * Uses slug as fallback, can be extended with custom names
 */
function getRouteDisplayName(routeItem) {
  // TODO: Implement custom display names from routeConfig or i18n
  // For now, convert slug to readable format
  const slug = routeItem.slug;

  // Remove leading slash and capitalize
  const displayName = slug.substring(1).replace(/^\w/, c => c.toUpperCase());

  // Handle special cases
  const specialNames = {
    '/404': 'Not Found',
    '/dashboard': 'Dashboard',
    '/log-in': 'Login',
    '/sign-up': 'Sign Up'
  };

  return specialNames[slug] || displayName || slug;
}

/**
 * Get status text for a route
 * Shows role/auth requirements
 */
function getRouteStatus(routeItem) {
  return routeItem.accessReason || 'Accessible';
}

/**
 * Refresh navigation when auth state changes
 */
function refreshNavigation() {
  log('AppFooter.vue', 'refreshNavigation', 'refresh', 'Refreshing footer navigation due to auth change', {});
  processRoutesForNavigation();
}

// Component lifecycle
onMounted(() => {
  log('AppFooter.vue', 'onMounted', 'mount', 'AppFooter component mounted', {
    showFooterNav,
    totalRoutes: routeConfig.length
  });

  // Process routes for navigation
  processRoutesForNavigation();

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'footerComponentMounted',
      file: 'AppFooter.vue',
      method: 'onMounted',
      flag: 'mount',
      purpose: 'Footer component mounted with navigation processing'
    });
  }
});

// Watch for auth state changes to refresh navigation
// Note: In a real implementation, you'd use a watcher on authStore
// For now, this is a placeholder for when auth state management is implemented
</script>

<style scoped></style>
