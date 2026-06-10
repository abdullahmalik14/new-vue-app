<template>
  <AuthLayout>
    <AuthSignUpOnboarding />
  </AuthLayout>
</template>
<script setup>
import { AuthLayout } from '@/dev/templates/auth/Auth.js'
import AuthSignUpOnboarding from '@/dev/templates/auth/views/AuthSignUpOnboarding.vue'
</script>
<script>
export const assets = {
  critical: ["/css/onboarding.css"],
  high: [],
  normal: ["/images/kyc-status-bg.jpg"],
}
</script>
