<template>
  <AuthLayout>
    <AuthSignUpOnboarding />
  </AuthLayout>
</template>
<script setup>
import { AuthLayout } from '@/templates/auth'
import AuthSignUpOnboarding from '@/templates/auth/views/AuthSignUpOnboarding.vue'
</script>
<script>
export const assets = {
  critical: ["/css/onboarding.css"],
  high: [],
  normal: ["/images/kyc-status-bg.jpg"],
}
</script>
