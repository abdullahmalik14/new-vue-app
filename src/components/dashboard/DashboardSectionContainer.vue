<template>
  <div class="flex flex-col p-2 bg-white/40 md:px-4 md:py-6 lg:px-6 dark:bg-[#181a1b]/40 dashboard-section-container">
    <slot />
  </div>
</template>

<script setup>
/**
 * DashboardSectionContainer
 * Standardized container for dashboard/settings sections.
 * Standardizes padding, background, and internal gap using global CSS variables.
 */
</script>

<style scoped>
.dashboard-section-container {
  gap: var(--dashboard-container-gap, 1rem);
}

@media (min-width: 1024px) {
  .dashboard-section-container {
    gap: var(--dashboard-container-gap-lg, 1.5rem);
  }
}
</style>
