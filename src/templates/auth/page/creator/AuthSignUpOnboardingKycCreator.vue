<template>
  <AuthWrapper>
    <AuthSignUpOnboardingKyc />
  </AuthWrapper>
</template>
<script setup>
import { AuthWrapper } from '@/templates/auth/Auth.js'
import AuthSignUpOnboardingKyc from '@/components/auth/AuthSignUpOnboardingKyc.vue'
</script>
<script>
export const assets = {
  critical: ["/css/onboarding.css"],
  high: [],
  normal: ["/images/kyc-bg.jpg"],
}
</script>
