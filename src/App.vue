<template>
  <div id="app" class="min-h-screen bg-gray-50 flex flex-col">
    <NavigationProgressBar />

    <!-- Global Header -->
    <!-- <AppHeader ref="appHeader" v-if="shouldShowLayout" /> -->
    <!-- <AppShell /> -->

    <!-- Main Content Area -->
    <main class="flex-1">
      <!-- Router view for page content -->
      <RouterView v-slot="{ Component, route: activeRoute }">
        <RouteErrorBoundary :route-key="activeRoute.fullPath">
          <Suspense>
            <!-- Main content -->
            <template #default>
              <component
                v-if="skipRouteTransition"
                :is="Component"
                :key="activeRoute.fullPath"
              />
              <Transition
                v-else
                :name="routeTransition.name"
                :mode="routeTransition.mode"
              >
                <div :key="activeRoute.fullPath" class="route-view-root">
                  <component :is="Component" />
                </div>
              </Transition>
            </template>

            <!-- Loading fallback -->
            <template #fallback>
              <div class="flex items-center justify-center min-h-screen">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p class="text-gray-600">Loading...</p>
                </div>
              </div>
            </template>
          </Suspense>
        </RouteErrorBoundary>
      </RouterView>
    </main>

    <!-- Global Footer -->
    <!-- <AppFooter v-if="shouldShowLayout" /> -->
  </div>
</template>

<script setup>
// import { onMounted } from 'vue';
import { onMounted, computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { log } from './utils/common/logHandler.js';
import { resolveRouteTransition } from './utils/route/routeTransition.js';
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import AppShell from './components/layout/AppShell.vue';
import NavigationProgressBar from './components/layout/NavigationProgressBar.vue';
import RouteErrorBoundary from './components/layout/RouteErrorBoundary.vue';

// Get router instance
const router = useRouter();
const route = useRoute();
const isInitialRouteRender = ref(true);

const routeTransition = computed(() => resolveRouteTransition(route));

const skipRouteTransition = computed(
  () => isInitialRouteRender.value || routeTransition.value.disabled,
);

const shouldShowLayout = computed(() => {
  // Check meta config first
  if (route.meta?.routeConfig?.hideLayout) return false;

  // Fallback: Check specific routes by name/path if meta isn't ready
  if (route.name === '/callback' || route.path?.includes('/callback')) return false;

  // Extra Robust Fallback: Check window.location directly for initial load/hydration
  if (typeof window !== 'undefined' && window.location.pathname.includes('/callback')) return false;

  return true;
});

// Track app component mount
onMounted(() => {
  log('App.vue', 'onMounted', 'lifecycle', 'App component mounted', {});

  requestAnimationFrame(() => {
    isInitialRouteRender.value = false;
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'appComponentMounted',
      file: 'App.vue',
      method: 'onMounted',
      flag: 'mount',
      purpose: 'App component mounted'
    });
  }
});

</script>

<style>
/* Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  font-family: 'Poppins', 'Inter', sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
