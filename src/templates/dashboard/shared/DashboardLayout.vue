<template>
  <div class="dashboard-wrapper">
    <DashboardHeader />
    <div style="display:grid; grid-template-columns: 280px 1fr; gap: 16px; min-height: 60vh;">
      <DashboardSharedSidebar />
    <h1>Dashboard Page</h1>
    </div>
    <DashboardSharedFooter />
  </div>
</template>

<script setup>
import { default as DashboardHeader } from './DashboardSharedHeader.vue'
import { default as DashboardSharedSidebar } from './DashboardSharedSidebar.vue'
import { default as DashboardSharedFooter } from './DashboardSharedFooter.vue'

</script>
