<template>
  <!--Mobile Header -->
  <DashboardSharedHeader v-if="!hideLayout" class="block md:hidden" />

  <div class="dashboard-two-col-container min-h-screen flex">
    <!--Desktop Sidebar -->
    <DashboardSharedSidebar v-if="!hideLayout" class="hidden md:block" />

    <!-- Body / Main Content -->
    <div class="flex-1 bg-[#F9FAFBE5] min-h-screen md:bg-transparent md:h-auto dark:bg-background-dark-app relative isolate">
      <div v-if="bgUrl" class="fixed inset-0 pointer-events-none -z-10 bg-cover bg-no-repeat w-full h-full" :style="{ backgroundImage: `url(${bgUrl})` }"></div>
      <slot />
    </div>
  </div>
</template>

<script setup>
import DashboardSharedHeader  from "@/dev/templates/dashboard/shared/DashboardSharedHeader.vue";
import DashboardSharedSidebar from "./DashboardSharedSidebar.vue";
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getAssetUrl } from '@/systems/assets/assetLibrary.js';

const route = useRoute();
const hideLayout = computed(() => route.meta?.routeConfig?.hideLayout || route.meta?.hideLayout || false);

const bgUrl = ref('');

onMounted(async () => {
  try {
    bgUrl.value = await getAssetUrl('dashboard.bg.gradient');
  } catch (error) {
    console.warn('[DashboardSharedTwoColLayout] Failed to load background gradient', error);
  }
});
</script>

<style scoped>
.dashboard-two-col-container {
  display: flex;
}
</style>
