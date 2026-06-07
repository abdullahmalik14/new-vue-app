<template>
  <AuthLayout>
    <AuthSignUpOnboardingKyc />
  </AuthLayout>
</template>
<script setup>
import { AuthLayout } from '@/templates/auth/Auth.js'
import AuthSignUpOnboardingKyc from '@/templates/auth/views/AuthSignUpOnboardingKyc.vue'
</script>
<script>
export const assets = {
  critical: ["/css/onboarding.css"],
  high: [],
  normal: ["/images/kyc-bg.jpg"],
}
</script>
