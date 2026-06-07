<template>
  <!--Mobile Header -->
  <DashboardSharedHeader class="block md:hidden" />

  <div class="dashboard-two-col-container min-h-screen flex">
    <!--Desktop Sidebar -->
    <DashboardSharedSidebar class="hidden md:block" />

    <!-- Body / Main Content -->
    <div class="flex-1 bg-[#F9FAFBE5] min-h-screen md:bg-transparent md:h-auto dark:bg-background-dark-app before:content-[''] 
        before:fixed before:bg-[url('https://i.ibb.co.com/dw910Z5b/gradient-main-bg.webp')]
         before:bg-cover before:w-full before:bg-no-repeat before:h-full 
         before:left-0 before:top-0 before:pointer-events-none ">
      <slot />
    </div>
  </div>
</template>

<script setup>
import DashboardSharedHeader  from "@/templates/dashboard/shared/DashboardSharedHeader.vue";
import DashboardSharedSidebar from "./DashboardSharedSidebar.vue";
</script>

<style scoped>
.dashboard-two-col-container {
  display: flex;
}
</style>
