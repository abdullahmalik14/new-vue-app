<script setup>
import DashProfileSettings from '@/dev/components/ui/nav/dashboard/DashProfileSettings.vue';

defineProps({
  userRole: {
    type: String,
    default: 'creator',
  },
  displayNameKey: String,
  handleKey: String,
  emailKey: String,
  avatarKey: String,
  gradientBgKey: String,
  editIconKey: String,
});
</script>

<template>
  <DashProfileSettings v-bind="$props" />
</template>
