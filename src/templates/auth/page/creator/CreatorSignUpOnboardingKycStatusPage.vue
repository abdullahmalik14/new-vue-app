<template>
  <AuthLayout>
    <AuthSignUpOnboardingKycStatus />
  </AuthLayout>
</template>

<script setup>
import { AuthLayout } from '@/templates/auth'
import AuthSignUpOnboardingKycStatus from '@/templates/auth/views/AuthSignUpOnboardingKycStatus.vue'
</script>
<script>
export const assets = {
  critical: ["/css/onboarding.css"],
  high: [],
  normal: ["/images/onboarding-bg.jpg"],
}
</script>
