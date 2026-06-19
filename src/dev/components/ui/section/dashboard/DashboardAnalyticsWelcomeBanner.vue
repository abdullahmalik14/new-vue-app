<template>
  <div class="flex flex-col md:flex-row items-center justify-between px-2 md:px-0 gap-4">
    <h1 class="text-gray-900 text-4xl font-semibold">
      {{ $t('dashboard.analytics.overview.welcomeBack', `Welcome back, ${userName}!`, { name: userName }) }}
    </h1>
    <DashboardQuote />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DashboardQuote from '@/components/ui/card/dashboard/DashboardQuote.vue'

// In a real app, this would come from an auth store.
// Using a mock for now to match the original "Welcome back, Jenny!" functionality
const userName = computed(() => 'Jenny')
</script>
