<template>
  <AuthWrapper>
    <AuthSignUpOnboarding />
  </AuthWrapper>
</template>
<script setup>
import { AuthWrapper } from '@/templates/auth/Auth.js'
import AuthSignUpOnboarding from '@/components/auth/AuthSignUpOnboarding.vue'
</script>
<script>
export const assets = {
  critical: ["/css/onboarding.css"],
  high: [],
  normal: ["/images/kyc-status-bg.jpg"],
}
</script>
