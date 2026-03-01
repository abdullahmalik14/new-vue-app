<template>
  <AuthWrapper>
    <AuthSignUpOnboardingKycStatus />
  </AuthWrapper>
</template>

<script setup>
import { AuthWrapper } from '@/templates/auth/Auth.js'
import AuthSignUpOnboardingKycStatus from '@/components/auth/AuthSignUpOnboardingKycStatus.vue'
</script>
<script>
export const assets = {
  critical: ["/css/onboarding.css"],
  high: [],
  normal: ["/images/onboarding-bg.jpg"],
}
</script>
